"""
Paper Generation Service

This module handles the generation of academic papers using AI templates.
"""

import json
import time
from typing import Dict, Any, Optional, Generator
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from apps.papers.models import PaperTemplate, GeneratedPaper, PaperSection
from apps.billing.models import CreditTransaction
from apps.core.llm_service import LLMManager, PromptService


class PaperGenerationError(Exception):
    """Custom exception for paper generation errors"""
    pass


class PaperGenerator:
    """Main paper generation class"""
    
    def __init__(self, template: PaperTemplate, user):
        self.template = template
        self.user = user
        self.llm_manager = LLMManager()
    
    def validate_inputs(self, user_inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user inputs against template requirements"""
        validated_inputs = {}
        errors = {}
        
        # Check required fields
        for field in self.template.required_fields:
            field_name = field.get('name')
            field_type = field.get('type', 'text')
            
            if field_name not in user_inputs:
                errors[field_name] = f"Field '{field_name}' is required"
                continue
            
            value = user_inputs[field_name]
            
            # Validate based on field type
            if field_type == 'text' and not isinstance(value, str):
                errors[field_name] = f"Field '{field_name}' must be text"
            elif field_type == 'number' and not isinstance(value, (int, float)):
                errors[field_name] = f"Field '{field_name}' must be a number"
            elif field_type == 'email' and not self._is_valid_email(value):
                errors[field_name] = f"Field '{field_name}' must be a valid email"
            else:
                validated_inputs[field_name] = value
        
        # Process optional fields
        for field in self.template.optional_fields:
            field_name = field.get('name')
            if field_name in user_inputs:
                validated_inputs[field_name] = user_inputs[field_name]
        
        if errors:
            raise PaperGenerationError(f"Validation errors: {errors}")
        
        return validated_inputs
    
    def _is_valid_email(self, email: str) -> bool:
        """Simple email validation"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def build_prompts(self, validated_inputs: Dict[str, Any]) -> tuple[str, str]:
        """Build system and user prompts from template and inputs"""
        
        # Detect language from user inputs
        combined_input = ' '.join(str(v) for v in validated_inputs.values())
        detected_language = PromptService.detect_language(combined_input)
        
        # Use academic paper formatter prompt based on detected language
        prompt_name = 'academic_paper_formatter'
        
        # System prompt from template or default
        system_template = PromptService.get_prompt_template(prompt_name, detected_language, 'system')
        if not system_template:
            system_template = PromptService.get_default_prompt(detected_language, 'system')
        
        if system_template:
            system_prompt = system_template.template
        else:
            # Fallback to template's system prompt
            system_prompt = self.template.system_prompt
        
        # User prompt with placeholder replacement
        user_prompt = self.template.user_prompt_template
        
        # Replace placeholders in user prompt
        for key, value in validated_inputs.items():
            placeholder = f"{{{key}}}"
            user_prompt = user_prompt.replace(placeholder, str(value))
        
        # Add format-specific guidelines
        if self.template.format:
            format_guidelines = f"\n\nFormat Guidelines:\n{self.template.format.style_guidelines}"
            system_prompt += format_guidelines
        
        return system_prompt, user_prompt
    
    def check_user_credits(self) -> bool:
        """Check if user has enough credits"""
        return self.user.credits >= self.template.estimated_credits
    
    def deduct_credits(self, paper: GeneratedPaper) -> CreditTransaction:
        """Deduct credits from user account"""
        if not self.check_user_credits():
            raise PaperGenerationError("Insufficient credits")
        
        # Create credit transaction
        transaction = CreditTransaction.objects.create(
            user=self.user,
            transaction_type='usage',
            status='completed',
            credits=-self.template.estimated_credits,
            paper=paper,
            description=f"Paper generation: {paper.title}",
            balance_before=self.user.credits,
            balance_after=self.user.credits - self.template.estimated_credits
        )
        
        # Update user credits
        self.user.credits -= self.template.estimated_credits
        self.user.total_credits_used += self.template.estimated_credits
        self.user.save()
        
        return transaction
    
    def generate(self, user_inputs: Dict[str, Any], title: str = None) -> GeneratedPaper:
        """Generate paper synchronously"""
        
        start_time = timezone.now()
        
        try:
            # Validate inputs
            validated_inputs = self.validate_inputs(user_inputs)
            
            # Check credits
            if not self.check_user_credits():
                raise PaperGenerationError("Insufficient credits")
            
            # Create paper record
            paper = GeneratedPaper.objects.create(
                user=self.user,
                template=self.template,
                title=title or f"Generated Paper - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                status='generating',
                user_inputs=validated_inputs,
                generation_parameters={
                    'model': 'gpt-4',
                    'temperature': 0.7,
                    'max_tokens': 4000
                }
            )
            
            # Deduct credits
            self.deduct_credits(paper)
            
            # Build prompts
            system_prompt, user_prompt = self.build_prompts(validated_inputs)
            
            # Detect language for prompt selection
            combined_input = ' '.join(str(v) for v in validated_inputs.values())
            detected_language = PromptService.detect_language(combined_input)
            
            # Generate content using LLM service with prompt guiding
            content = self.llm_manager.generate_with_prompt(
                prompt_name='academic_paper_formatter',
                user_input=user_prompt,
                language=detected_language
            )
            
            # Update paper with generated content
            paper.content = content
            paper.status = 'completed'
            paper.generation_time = timezone.now() - start_time
            paper.credits_used = self.template.estimated_credits
            paper.calculate_word_count()
            paper.save()
            
            # Update user statistics
            self.user.total_papers_generated += 1
            self.user.save()
            
            # Parse and create sections if template defines structure
            self._create_paper_sections(paper)
            
            return paper
            
        except Exception as e:
            # Update paper status to failed
            if 'paper' in locals():
                paper.status = 'failed'
                paper.error_message = str(e)
                paper.generation_time = timezone.now() - start_time
                paper.save()
            
            raise PaperGenerationError(f"Generation failed: {str(e)}")
    
    def stream_generate(self, user_inputs: Dict[str, Any], title: str = None) -> Generator[Dict[str, Any], None, GeneratedPaper]:
        """Generate paper with streaming response"""
        
        start_time = timezone.now()
        
        try:
            # Validate inputs
            validated_inputs = self.validate_inputs(user_inputs)
            
            # Check credits
            if not self.check_user_credits():
                raise PaperGenerationError("Insufficient credits")
            
            # Create paper record
            paper = GeneratedPaper.objects.create(
                user=self.user,
                template=self.template,
                title=title or f"Generated Paper - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                status='generating',
                user_inputs=validated_inputs,
                generation_parameters={
                    'model': 'gpt-4',
                    'temperature': 0.7,
                    'max_tokens': 4000
                }
            )
            
            # Deduct credits
            self.deduct_credits(paper)
            
            # Build prompts
            system_prompt, user_prompt = self.build_prompts(validated_inputs)
            
            # Detect language for prompt selection
            combined_input = ' '.join(str(v) for v in validated_inputs.values())
            detected_language = PromptService.detect_language(combined_input)
            
            # Yield initial status
            yield {
                'type': 'status',
                'message': 'Starting generation...',
                'paper_id': paper.id,
                'detected_language': detected_language
            }
            
            # Generate content using LLM service streaming
            content_chunks = []
            for chunk in self.llm_manager.stream_with_prompt(
                prompt_name='academic_paper_formatter',
                user_input=user_prompt,
                language=detected_language
            ):
                content_chunks.append(chunk)
                yield {
                    'type': 'content',
                    'chunk': chunk,
                    'paper_id': paper.id
                }
            
            # Combine all chunks
            content = ''.join(content_chunks)
            
            # Update paper with final content
            paper.content = content
            paper.status = 'completed'
            paper.generation_time = timezone.now() - start_time
            paper.credits_used = self.template.estimated_credits
            paper.calculate_word_count()
            paper.save()
            
            # Update user statistics
            self.user.total_papers_generated += 1
            self.user.save()
            
            # Parse and create sections
            self._create_paper_sections(paper)
            
            # Yield completion status
            yield {
                'type': 'completed',
                'message': 'Generation completed successfully',
                'paper': paper
            }
            
            return paper
            
        except Exception as e:
            # Update paper status to failed
            if 'paper' in locals():
                paper.status = 'failed'
                paper.error_message = str(e)
                paper.generation_time = timezone.now() - start_time
                paper.save()
            
            # Yield error status
            yield {
                'type': 'error',
                'message': str(e)
            }
            
            raise PaperGenerationError(f"Generation failed: {str(e)}")
    
    def _create_paper_sections(self, paper: GeneratedPaper):
        """Parse generated content and create sections based on template structure"""
        
        if not self.template.format.template_structure:
            return
        
        structure = self.template.format.template_structure
        sections = structure.get('sections', [])
        
        if not sections:
            return
        
        content = paper.content
        
        # Simple section parsing based on headers
        current_section = None
        current_content = ""
        section_order = 0
        
        for line in content.split('\n'):
            line = line.strip()
            
            # Check if line is a section header
            is_header = False
            for section in sections:
                section_name = section.get('name', '')
                if section_name.lower() in line.lower() and (line.startswith('#') or line.isupper()):
                    # Save previous section
                    if current_section and current_content.strip():
                        PaperSection.objects.create(
                            paper=paper,
                            section_name=current_section,
                            content=current_content.strip(),
                            order=section_order,
                            word_count=len(current_content.split())
                        )
                        section_order += 1
                    
                    # Start new section
                    current_section = section_name
                    current_content = ""
                    is_header = True
                    break
            
            if not is_header and current_section:
                current_content += line + "\n"
        
        # Save last section
        if current_section and current_content.strip():
            PaperSection.objects.create(
                paper=paper,
                section_name=current_section,
                content=current_content.strip(),
                order=section_order,
                word_count=len(current_content.split())
            )


class PaperFormatManager:
    """Manager for paper format operations"""
    
    @staticmethod
    def get_available_formats():
        """Get all available paper formats"""
        from apps.papers.models import PaperFormat
        return PaperFormat.objects.filter(is_active=True, is_deleted=False)
    
    @staticmethod
    def get_templates_by_format(format_id: int, language: str = 'en'):
        """Get templates for a specific format and language"""
        from apps.papers.models import PaperTemplate
        return PaperTemplate.objects.filter(
            format_id=format_id,
            language=language,
            is_active=True,
            is_deleted=False
        )
    
    @staticmethod
    def get_popular_templates(limit: int = 10):
        """Get most popular templates based on usage"""
        from apps.papers.models import PaperTemplate
        from django.db.models import Count
        
        return PaperTemplate.objects.filter(
            is_active=True,
            is_deleted=False
        ).annotate(
            usage_count=Count('generated_papers')
        ).order_by('-usage_count')[:limit]


class PaperExportService:
    """Service for exporting papers to different formats"""
    
    def __init__(self, paper: GeneratedPaper):
        self.paper = paper
    
    def export_to_pdf(self) -> str:
        """Export paper to PDF format"""
        # This would integrate with a PDF generation library
        # For now, return a placeholder path
        return f"/media/generated_papers/pdf/{self.paper.id}.pdf"
    
    def export_to_docx(self) -> str:
        """Export paper to DOCX format"""
        # This would integrate with python-docx library
        # For now, return a placeholder path
        return f"/media/generated_papers/docx/{self.paper.id}.docx"
    
    def export_to_latex(self) -> str:
        """Export paper to LaTeX format"""
        # This would convert the content to LaTeX format
        # For now, return a placeholder path
        return f"/media/generated_papers/latex/{self.paper.id}.tex"

