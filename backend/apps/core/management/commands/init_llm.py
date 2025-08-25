from django.core.management.base import BaseCommand
from apps.core.models import LLMProvider, LLMModel, PromptTemplate, LLMConfiguration


class Command(BaseCommand):
    help = 'Initialize default LLM configuration and prompt templates'
    
    def handle(self, *args, **options):
        self.stdout.write('Initializing LLM configuration...')
        
        # Create default Ollama provider
        ollama_provider, created = LLMProvider.objects.get_or_create(
            name='Local Ollama',
            defaults={
                'provider_type': 'ollama',
                'base_url': 'http://localhost:11434',
                'is_active': True,
                'is_default': True,
                'timeout': 60,
                'max_retries': 3,
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created Ollama provider'))
        
        # Create default models
        models_data = [
            {
                'name': 'llama3.2',
                'display_name': 'Llama 3.2',
                'description': 'Meta Llama 3.2 model',
                'context_length': 8192,
                'max_tokens': 4096,
                'is_default': True,
            },
            {
                'name': 'qwen2.5',
                'display_name': 'Qwen 2.5',
                'description': 'Alibaba Qwen 2.5 model with Chinese support',
                'context_length': 8192,
                'max_tokens': 4096,
                'is_default': False,
            },
        ]
        
        for model_data in models_data:
            model, created = LLMModel.objects.get_or_create(
                provider=ollama_provider,
                name=model_data['name'],
                defaults=model_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created model: {model_data["display_name"]}'))
        
        # Create default configuration
        config, created = LLMConfiguration.objects.get_or_create(
            pk=1,
            defaults={
                'default_provider': ollama_provider,
                'default_model': LLMModel.objects.filter(provider=ollama_provider, is_default=True).first(),
                'default_temperature': 0.7,
                'default_max_tokens': 2048,
                'enable_streaming': True,
                'enable_caching': True,
                'cache_ttl': 3600,
                'rate_limit_per_minute': 60,
                'enable_logging': True,
                'log_level': 'INFO',
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created LLM configuration'))
        
        # Create English prompt templates
        english_prompts = [
            {
                'name': 'academic_paper_formatter',
                'language': 'en',
                'prompt_type': 'system',
                'template': '''You are a professional academic writing formatting assistant, specializing in structuring content using HTML5.

Your goal is to format the user's raw academic paper content into a complete HTML5 academic document that meets the following standards:

1. Output complete HTML5 document structure, including <!DOCTYPE html>, <html>, <head>, <body>
2. Use inline <style> tags for all styling to ensure the HTML file is self-contained
3. Font requirements: Use serif fonts for body text, sans-serif for headings, font sizes in pt units, line spacing 1.5-1.6x
4. Use <p> tags for paragraphs with 2em first-line indent, maintain logical clarity
5. Use <h1> through <h6> for headings with clear semantic structure and hierarchy
6. Output only HTML source code, no additional explanations or comments

Format the following academic content according to these specifications:''',
                'description': 'System prompt for formatting academic papers in English',
                'variables': {},
                'is_default': True,
            },
            {
                'name': 'general_assistant',
                'language': 'en',
                'prompt_type': 'system',
                'template': '''You are a helpful AI assistant. Provide accurate, helpful, and well-structured responses to user queries. 

Guidelines:
- Be concise but thorough
- Use clear and professional language
- Provide examples when helpful
- If you're unsure about something, say so
- Format your responses clearly with proper structure

Please assist the user with their request:''',
                'description': 'General purpose assistant prompt in English',
                'variables': {},
                'is_default': False,
            }
        ]
        
        # Create Chinese prompt templates
        chinese_prompts = [
            {
                'name': 'academic_paper_formatter',
                'language': 'zh-hans',
                'prompt_type': 'system',
                'template': '''你是一个专业的中文学术写作排版助手，擅长使用 HTML5 对内容进行结构化格式化。

你的目标是将用户提供的原始论文内容排版为完整的 HTML5 学术文档，满足以下标准：

1. 输出完整的 HTML5 文档结构，包含 <!DOCTYPE html>、<html>、<head>、<body>
2. 所有样式使用内联 <style> 标签，确保 HTML 文件独立可用
3. 字体要求：正文使用宋体，标题使用微软雅黑，字号单位为 pt，行距为1.5~1.6倍
4. 段落使用 <p> 标签，段首缩进2em，保持逻辑清晰
5. 标题使用 <h1> ~ <h6>，语义明确，结构层次分明
6. 输出仅包含 HTML 源码，不包括额外解释或注释

请按照以上规范格式化以下学术内容：''',
                'description': '中文学术论文格式化系统提示词',
                'variables': {},
                'is_default': True,
            },
            {
                'name': 'general_assistant',
                'language': 'zh-hans',
                'prompt_type': 'system',
                'template': '''你是一个有用的AI助手。请为用户查询提供准确、有用且结构良好的回答。

指导原则：
- 简洁但全面
- 使用清晰专业的语言
- 在有帮助时提供示例
- 如果对某事不确定，请说明
- 用适当的结构清晰地格式化回答

请协助用户处理他们的请求：''',
                'description': '中文通用助手提示词',
                'variables': {},
                'is_default': False,
            }
        ]
        
        # Create all prompt templates
        all_prompts = english_prompts + chinese_prompts
        
        for prompt_data in all_prompts:
            prompt, created = PromptTemplate.objects.get_or_create(
                name=prompt_data['name'],
                language=prompt_data['language'],
                prompt_type=prompt_data['prompt_type'],
                defaults=prompt_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(
                    f'Created prompt template: {prompt_data["name"]} ({prompt_data["language"]})'
                ))
        
        self.stdout.write(self.style.SUCCESS('LLM initialization completed successfully!'))

