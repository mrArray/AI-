import requests
import json
import logging
import time
import re
from typing import Dict, List, Optional, Generator, Any
from django.conf import settings
from django.core.cache import cache
from .models import LLMProvider, LLMModel, LLMConfiguration, PromptTemplate

logger = logging.getLogger(__name__)


class LLMServiceError(Exception):
    """Custom exception for LLM service failures"""
    def __init__(self, message, code="LLM_ERROR", details=None):
        super().__init__(message)
        self.code = code
        self.details = details or {}


class LLMService:
    """Enhanced LLM service with robust error handling for Deepseek-coder"""
    
    def __init__(self, provider: Optional[LLMProvider] = None, model: Optional[LLMModel] = None):
        self.config = LLMConfiguration.get_config()
        self.provider = provider or self.config.default_provider
        self.model = model or self.config.default_model
        
        if not self.provider:
            raise ValueError("No LLM provider configured")
        if not self.model:
            raise ValueError("No LLM model configured")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        if self.provider.api_key:
            if self.provider.provider_type == 'openai':
                headers['Authorization'] = f'Bearer {self.provider.api_key}'
            elif self.provider.provider_type == 'anthropic':
                headers['x-api-key'] = self.provider.api_key
            elif self.provider.provider_type == 'google':
                headers['Authorization'] = f'Bearer {self.provider.api_key}'
            elif self.provider.provider_type == 'ollama':
                # Ollama typically doesn't require authentication
                pass
        
        return headers
    
    def _build_request_data(self, messages: List[Dict], **kwargs) -> Dict[str, Any]:
        """Build request data optimized for Deepseek-coder"""
        temperature = kwargs.get('temperature', self.config.default_temperature)
        max_tokens = kwargs.get('max_tokens', self.config.default_max_tokens)
        stream = kwargs.get('stream', self.config.enable_streaming)
        
        # Special handling for Ollama/Deepseek providers
        if self.provider.provider_type == 'ollama':
            return {
                'model': self.model.name,
                'messages': messages,
                'stream': stream,
                'options': {
                    'temperature': temperature,
                    'num_predict': max_tokens,
                }
            }
            
        # Standard format for other providers
        return {
            'model': self.model.name,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
            'stream': stream,
        }
    
    def _get_endpoint_url(self) -> str:
        """Get the endpoint URL with better Ollama support"""
        base_url = self.provider.base_url.rstrip('/')
        
        if self.provider.provider_type == 'ollama':
            # Both endpoints work, but /api/chat is more reliable
            return f"{base_url}/api/chat"
        elif self.provider.provider_type == 'openai':
            return f"{base_url}/v1/chat/completions"
        elif self.provider.provider_type == 'anthropic':
            return f"{base_url}/v1/messages"
        elif self.provider.provider_type == 'google':
            return f"{base_url}/v1/models/{self.model.name}:generateContent"
        
        return f"{base_url}/chat/completions"
    
    def _log_request(self, url: str, headers: Dict, data: Dict):
        """Log the complete request details including prompt"""
        try:
            # Create a sanitized copy for logging
            log_data = data.copy()
            
            # Format messages for readability
            formatted_messages = []
            for msg in log_data.get('messages', []):
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')
                
                # Truncate long content while keeping important parts
                if len(content) > 300:
                    truncated = content[:150] + " ... " + content[-150:]
                    formatted_messages.append(f"{role.upper()} ({len(content)} chars):\n{truncated}")
                else:
                    formatted_messages.append(f"{role.upper()}:\n{content}")
            
            # Replace messages in log data
            if formatted_messages:
                log_data['messages'] = "\n\n----------\n".join(formatted_messages)
            
            # Mask potential API keys
            if 'api_key' in headers.values():
                log_headers = {k: '*****' if 'key' in k.lower() else v for k, v in headers.items()}
            else:
                log_headers = headers
                
            request_details = (
                f"URL: {url}\n"
                f"Headers: {json.dumps(log_headers, indent=2)}\n"
                f"Request Data:\n{json.dumps(log_data, indent=2)}"
            )
            
            logger.debug(
                "Sending LLM Request\n"
                f"Provider: {self.provider.name} ({self.provider.provider_type})\n"
                f"Model: {self.model.name}\n"
                "---------------------------\n"
                f"{request_details}\n"
                "---------------------------"
            )
            
        except Exception as e:
            logger.error(f"Failed to log request details: {str(e)}")

    def _request_with_retry(self, url: str, headers: Dict, data: Dict) -> Any:
        """Make a request with logging and retry logic"""
        # Log the complete request before sending
        self._log_request(url, headers, data)
        
        start_time = time.time()
        
        for attempt in range(3):
            try:
                response = requests.post(
                    url,
                    headers=headers,
                    json=data,
                    timeout=self.provider.timeout
                )
                response.raise_for_status()
                
                # Check for valid response content
                if response.text.strip() == "":
                    raise ValueError("Empty response from LLM service")
                    
                return response.json()
                
            except (requests.exceptions.RequestException, 
                    json.JSONDecodeError, 
                    ValueError) as e:
                
                duration = time.time() - start_time
                if attempt == 2:  # Final attempt
                    error_details = {
                        "provider": self.provider.provider_type,
                        "url": url,
                        "status": getattr(response, 'status_code', None),
                        "response": getattr(response, 'text', '')[:500],
                        "error": str(e),
                        "attempts": attempt + 1,
                        "duration": f"{duration:.2f}s"
                    }
                    logger.error(
                        "LLM request failed:\n" +
                        "\n".join([f"{k}: {v}" for k, v in error_details.items()])
                    )
                    raise LLMServiceError(
                        "LLM service request failed",
                        code="NETWORK_ERROR",
                        details=error_details
                    ) from e
                    
                # Exponential backoff
                delay = (2 ** attempt) + 0.1
                logger.warning(
                    f"Retry {attempt+1} after {delay}s: {str(e)}\n"
                    f"Duration: {duration:.2f}s"
                )
                time.sleep(delay)
    
    def _extract_content(self, response: Any) -> str:
        """Extract and sanitize content from response"""
        # Handle Deepseek-coder's special format
        if self.provider.provider_type == 'ollama' and self.model.name.startswith('deepseek'):
            if isinstance(response, dict):
                # Single-response format
                content = response.get('message', {}).get('content', '')
            else:
                # Stream response format
                content = "".join([
                    chunk.get('message', {}).get('content', '')
                    for chunk in response
                    if not chunk.get('done') and 'message' in chunk
                ])
                
            return self._sanitize_output(content)
        
        # Default handling for other providers
        try:
            if self.provider.provider_type in ['openai', 'anthropic', 'google']:
                return response.get('choices', [{}])[0].get('message', {}).get('content', '')
            else:
                return response.get('message', {}).get('content', '')
        except (KeyError, IndexError) as e:
            logger.error(f"Content extraction failed: {str(e)}")
            raise LLMServiceError(
                "Failed to extract content",
                code="RESPONSE_PARSE_ERROR",
                details={"response": str(response)[:500]}
            ) from e
    
    def _sanitize_output(self, content: str) -> str:
        """Clean up Deepseek-coder's special formatting"""
        # Remove thinking tags
        sanitized = re.sub(r'<\s*/?\s*think\s*>', '', content, flags=re.IGNORECASE)
        
        # Remove empty lines and trim whitespace
        return '\n'.join(
            line.strip() 
            for line in sanitized.splitlines() 
            if line.strip()
        )
    
    def generate_response(self, messages: List[Dict], **kwargs) -> str:
        """Generate a response optimized for Deepseek-coder"""
        cache_key = None
        if self.config.enable_caching:
            cache_key = f"llm_response_{self.provider.id}_{self.model.id}_{hash(str(messages))}"
            if cached := cache.get(cache_key):
                return cached
        
        try:
            url = self._get_endpoint_url()
            headers = self._get_headers()
            data = self._build_request_data(messages, **kwargs)
            
            # Special streaming handling for Deepseek-coder
            if self.provider.provider_type == 'ollama' and self.model.name.startswith('deepseek'):
                # Use sequential token collection for reliability
                content = self._generate_deepseek_response(url, headers, data)
            else:
                response = self._request_with_retry(url, headers, data)
                content = self._extract_content(response)
            
            # Cache and return
            if content and cache_key:
                cache.set(cache_key, content, self.config.cache_ttl)
            return content
            
        except Exception as e:
            logger.error(f"Generation failed: {str(e)}")
            if isinstance(e, LLMServiceError):
                raise e
            raise LLMServiceError(
                "Generation failed",
                code="GENERATION_FAILURE",
                details={"error": str(e)}
            ) from e
    
    def _generate_deepseek_response(self, url: str, headers: Dict, data: Dict) -> str:
        """Special handling for Deepseek-coder's sequential token format"""
        try:
            response = requests.post(
                url,
                headers=headers,
                json=data,
                timeout=self.provider.timeout,
                stream=True
            )
            response.raise_for_status()
            
            content_parts = []
            for line in response.iter_lines():
                if line:
                    decoded = line.decode('utf-8')
                    if decoded.startswith('data: '):
                        decoded = decoded[6:]
                    
                    if decoded.strip() and decoded.strip() != '[DONE]':
                        try:
                            chunk = json.loads(decoded)
                            if not chunk.get('done'):
                                content = chunk.get('message', {}).get('content', '')
                                if content:
                                    content_parts.append(content)
                        except json.JSONDecodeError:
                            continue
            
            return self._sanitize_output("".join(content_parts))
            
        except requests.exceptions.RequestException as e:
            raise LLMServiceError(
                "Deepseek streaming failed",
                code="DEEPSEEK_STREAM_ERROR",
                details={"error": str(e)}
            ) from e
    
    def stream_response(self, messages: List[Dict], **kwargs) -> Generator[str, None, None]:
        """Streaming not fully supported for Deepseek-coder in this implementation"""
        if self.provider.provider_type == 'ollama' and self.model.name.startswith('deepseek'):
            raise NotImplementedError("Direct streaming not supported for Deepseek models")
        
        try:
            url = self._get_endpoint_url()
            headers = self._get_headers()
            data = self._build_request_data(messages, stream=True, **kwargs)
            
            # Make the streaming request
            response = self._request_with_retry(url, headers, data)
            
            # Yield each content chunk
            yield from self._extract_stream_content(response)
                        
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            if isinstance(e, LLMServiceError):
                raise e
            raise LLMServiceError(
                "Streaming failed",
                code="STREAM_FAILURE",
                details={"error": str(e)}
            ) from e


class PromptService:
    """Enhanced prompt service with caching and more robust language detection"""
    
    _CACHE_TIMEOUT = 3600  # 1 hour
    
    @staticmethod
    def _cache_key(name: str, language: str, prompt_type: str) -> str:
        """Generate consistent cache key for prompts"""
        return f"prompt_template:{name}:{language}:{prompt_type}"
    
    @classmethod
    def get_prompt_template(cls, name: str, language: str = 'en', prompt_type: str = 'system') -> Optional[PromptTemplate]:
        """Get a prompt template with caching"""
        cache_key = cls._cache_key(name, language, prompt_type)
        template = cache.get(cache_key)
        
        if template:
            return template
        
        try:
            template = PromptTemplate.objects.get(
                name=name,
                language=language,
                prompt_type=prompt_type,
                is_active=True
            )
            cache.set(cache_key, template, cls._CACHE_TIMEOUT)
            return template
        except PromptTemplate.DoesNotExist:
            # Cache negative results to reduce DB hits
            cache.set(cache_key, None, 300)  # 5 minutes
            return None
    
    @classmethod
    def get_default_prompt(cls, language: str = 'en', prompt_type: str = 'system') -> Optional[PromptTemplate]:
        """Get default prompt template with caching"""
        cache_key = f"default_prompt:{language}:{prompt_type}"
        template = cache.get(cache_key)
        
        if template:
            return template
        
        try:
            template = PromptTemplate.objects.get(
                language=language,
                prompt_type=prompt_type,
                is_default=True,
                is_active=True
            )
            cache.set(cache_key, template, cls._CACHE_TIMEOUT)
            return template
        except PromptTemplate.DoesNotExist:
            # Fallback to English default
            if language != 'en':
                return cls.get_default_prompt('en', prompt_type)
            cache.set(cache_key, None, 300)  # 5 minutes
            return None
    
    @staticmethod
    def render_prompt(template: PromptTemplate, **variables) -> str:
        """Render a prompt template with safe variable substitution"""
        try:
            return template.render(**variables)
        except KeyError as e:
            logger.error(f"Missing variable {e} for prompt template {template.name}")
            # Provide better error for missing variables
            raise ValueError(f"Missing required variable: {e} for prompt template '{template.name}'")
    
    @staticmethod
    def detect_language(text: str) -> str:
        """Improved language detection with more languages"""
        # Skip detection for very short text
        if len(text) < 10:
            return 'en'
        
        # Count language-specific characters
        char_ranges = {
            'zh': ('\u4e00', '\u9fff'),       # Chinese
            'ja': ('\u3040', '\u30ff'),       # Japanese (Hiragana + Katakana)
            'ko': ('\uac00', '\ud7a3'),       # Korean Hangyll
            'ru': ('\u0400', '\u04ff'),       # Cyrillic (Russian, etc.)
            'ar': ('\u0600', '\u06ff'),       # Arabic
        }
        
        lang_counts = {lang: 0 for lang in char_ranges}
        total_alpha = sum(1 for char in text if char.isalpha())
        
        if total_alpha == 0:
            return 'en'
        
        # Count characters in each language range
        for char in text:
            for lang, (start, end) in char_ranges.items():
                if start <= char <= end:
                    lang_counts[lang] += 1
        
        # Calculate ratios
        lang_ratios = {lang: count / total_alpha for lang, count in lang_counts.items()}
        
        # Detect if any language has significant presence
        for lang, ratio in lang_ratios.items():
            if ratio > 0.3:
                return lang
        
        # Default to English
        return 'en'


class LLMManager:
    """Enhanced LLM manager with better error handling and prompt validation"""
    
    def __init__(self):
        self.llm_service = LLMService()
        self.prompt_service = PromptService()
    
    def _get_system_prompt(self, prompt_name: str, language: str, variables: Dict) -> str:
        """Get and render the system prompt with proper validation"""
        system_template = (
            self.prompt_service.get_prompt_template(prompt_name, language, 'system') or
            self.prompt_service.get_default_prompt(language, 'system')
        )
        
        if not system_template:
            logger.error(f"No system prompt found for '{prompt_name}' in {language}")
            raise ValueError(
                f"No suitable system prompt template available for {prompt_name} in {language}. "
                "Please configure a default prompt template."
            )
        
        return self.prompt_service.render_prompt(system_template, **variables)
    
    def generate_with_prompt(self, prompt_name: str, user_input: str, language: Optional[str] = None, **variables) -> str:
        """Generate response using a named prompt template"""
        # Detect language if not provided
        if language is None:
            language = self.prompt_service.detect_language(user_input)
        
        # Get and render system prompt
        system_prompt = self._get_system_prompt(prompt_name, language, variables)
        
        # Build messages
        messages = [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_input}
        ]
        
        try:
            return self.llm_service.generate_response(messages)
        except LLMServiceError as e:
            logger.error(f"Generation with prompt failed: {prompt_name} - {str(e)}")
            # Wrap LLM service error with additional context
            raise LLMServiceError(
                f"Text generation using prompt '{prompt_name}' failed",
                code="PROMPT_GENERATION_FAILURE",
                details={
                    "prompt_name": prompt_name,
                    "language": language,
                    "original_code": e.code,
                    **e.details
                }
            )
    
    def stream_with_prompt(self, prompt_name: str, user_input: str, language: Optional[str] = None, **variables) -> Generator[str, None, None]:
        """Stream response using a named prompt template"""
        # Detect language if not provided
        if language is None:
            language = self.prompt_service.detect_language(user_input)
        
        # Get and render system prompt
        system_prompt = self._get_system_prompt(prompt_name, language, variables)
        
        # Build messages
        messages = [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_input}
        ]
        
        try:
            yield from self.llm_service.stream_response(messages)
        except LLMServiceError as e:
            logger.error(f"Streaming with prompt failed: {prompt_name} - {str(e)}")
            # Wrap LLM service error with additional context
            raise LLMServiceError(
                f"Stream generation using prompt '{prompt_name}' failed",
                code="PROMPT_STREAM_FAILURE",
                details={
                    "prompt_name": prompt_name,
                    "language": language,
                    "original_code": e.code,
                    **e.details
                }
            )


def extract_html_from_response(text: str) -> str:
    """
    Remove any LLM explanation/thinking and return only the HTML content.
    """
    # Try to find the start of the HTML document
    html_start = text.find('<!DOCTYPE html>')
    if html_start == -1:
        html_start = text.find('<html')
    if html_start == -1:
        # fallback: return the whole text if no HTML found
        return text
    return text[html_start:].strip()