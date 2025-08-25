"""
Template Management Service

This module handles template operations and management.
"""

from typing import Dict, List, Any, Optional
from django.db.models import Q, Count
from apps.papers.models import PaperTemplate, PaperFormat, GeneratedPaper


class TemplateManager:
    """Manager for template operations"""
    
    @staticmethod
    def get_templates_by_type(paper_type: str, language: str = 'en') -> List[PaperTemplate]:
        """Get templates by paper type and language"""
        return PaperTemplate.objects.filter(
            paper_type=paper_type,
            language=language,
            is_active=True,
            is_deleted=False
        ).select_related('format').order_by('order', 'name')
    
    @staticmethod
    def get_featured_templates(limit: int = 6) -> List[PaperTemplate]:
        """Get featured templates for homepage"""
        return PaperTemplate.objects.filter(
            is_active=True,
            is_deleted=False
        ).annotate(
            usage_count=Count('generated_papers')
        ).order_by('-usage_count', 'order')[:limit]
    
    @staticmethod
    def search_templates(query: str, language: str = 'en') -> List[PaperTemplate]:
        """Search templates by name, description, or paper type"""
        return PaperTemplate.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(paper_type__icontains=query),
            language=language,
            is_active=True,
            is_deleted=False
        ).select_related('format').order_by('order', 'name')
    
    @staticmethod
    def get_template_with_stats(template_id: int) -> Optional[Dict[str, Any]]:
        """Get template with usage statistics"""
        try:
            template = PaperTemplate.objects.select_related('format').get(
                id=template_id,
                is_active=True,
                is_deleted=False
            )
            
            # Calculate statistics
            total_usage = template.generated_papers.count()
            successful_generations = template.generated_papers.filter(status='completed').count()
            average_rating = template.generated_papers.filter(
                feedback__isnull=False
            ).aggregate(
                avg_rating=Count('feedback__rating')
            )['avg_rating'] or 0
            
            return {
                'template': template,
                'stats': {
                    'total_usage': total_usage,
                    'successful_generations': successful_generations,
                    'success_rate': (successful_generations / total_usage * 100) if total_usage > 0 else 0,
                    'average_rating': average_rating
                }
            }
        except PaperTemplate.DoesNotExist:
            return None
    
    @staticmethod
    def get_user_templates(user, limit: int = 10) -> List[PaperTemplate]:
        """Get templates recently used by user"""
        recent_papers = GeneratedPaper.objects.filter(
            user=user,
            is_deleted=False
        ).select_related('template').order_by('-created_at')[:limit]
        
        template_ids = [paper.template.id for paper in recent_papers]
        
        return PaperTemplate.objects.filter(
            id__in=template_ids,
            is_active=True,
            is_deleted=False
        ).distinct()


class TemplateValidator:
    """Validator for template configurations"""
    
    @staticmethod
    def validate_template_structure(template: PaperTemplate) -> Dict[str, List[str]]:
        """Validate template structure and configuration"""
        errors = {}
        
        # Validate required fields
        if not template.required_fields:
            errors.setdefault('required_fields', []).append("At least one required field must be defined")
        else:
            for i, field in enumerate(template.required_fields):
                if not isinstance(field, dict):
                    errors.setdefault('required_fields', []).append(f"Field {i} must be a dictionary")
                    continue
                
                if 'name' not in field:
                    errors.setdefault('required_fields', []).append(f"Field {i} must have a 'name' property")
                
                if 'type' not in field:
                    errors.setdefault('required_fields', []).append(f"Field {i} must have a 'type' property")
                elif field['type'] not in ['text', 'number', 'email', 'textarea', 'select']:
                    errors.setdefault('required_fields', []).append(f"Field {i} has invalid type: {field['type']}")
        
        # Validate prompts
        if not template.system_prompt.strip():
            errors.setdefault('prompts', []).append("System prompt cannot be empty")
        
        if not template.user_prompt_template.strip():
            errors.setdefault('prompts', []).append("User prompt template cannot be empty")
        
        # Validate prompt placeholders
        required_field_names = [field.get('name') for field in template.required_fields if field.get('name')]
        user_prompt = template.user_prompt_template
        
        for field_name in required_field_names:
            placeholder = f"{{{field_name}}}"
            if placeholder not in user_prompt:
                errors.setdefault('prompts', []).append(f"Required field '{field_name}' not found in user prompt template")
        
        # Validate format structure if exists
        if template.format and template.format.template_structure:
            structure = template.format.template_structure
            if not isinstance(structure, dict):
                errors.setdefault('format', []).append("Template structure must be a dictionary")
            elif 'sections' in structure and not isinstance(structure['sections'], list):
                errors.setdefault('format', []).append("Template structure sections must be a list")
        
        return errors
    
    @staticmethod
    def validate_user_inputs(template: PaperTemplate, user_inputs: Dict[str, Any]) -> Dict[str, List[str]]:
        """Validate user inputs against template requirements"""
        errors = {}
        
        # Check required fields
        for field in template.required_fields:
            field_name = field.get('name')
            field_type = field.get('type')
            
            if not field_name:
                continue
            
            if field_name not in user_inputs:
                errors.setdefault(field_name, []).append("This field is required")
                continue
            
            value = user_inputs[field_name]
            
            # Type validation
            if field_type == 'text' and not isinstance(value, str):
                errors.setdefault(field_name, []).append("Must be text")
            elif field_type == 'number':
                try:
                    float(value)
                except (ValueError, TypeError):
                    errors.setdefault(field_name, []).append("Must be a number")
            elif field_type == 'email':
                import re
                email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                if not re.match(email_pattern, str(value)):
                    errors.setdefault(field_name, []).append("Must be a valid email address")
            
            # Length validation
            if isinstance(value, str):
                min_length = field.get('min_length', 0)
                max_length = field.get('max_length', 10000)
                
                if len(value) < min_length:
                    errors.setdefault(field_name, []).append(f"Must be at least {min_length} characters")
                elif len(value) > max_length:
                    errors.setdefault(field_name, []).append(f"Must be no more than {max_length} characters")
        
        return errors


class TemplateRecommendationEngine:
    """Engine for recommending templates to users"""
    
    def __init__(self, user):
        self.user = user
    
    def get_recommended_templates(self, limit: int = 5) -> List[PaperTemplate]:
        """Get recommended templates based on user history and preferences"""
        
        # Get user's paper history
        user_papers = GeneratedPaper.objects.filter(
            user=self.user,
            is_deleted=False
        ).select_related('template')
        
        if not user_papers.exists():
            # New user - return popular templates
            return TemplateManager.get_featured_templates(limit)
        
        # Get user's preferred paper types
        preferred_types = user_papers.values('template__paper_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Get user's preferred language
        user_language = getattr(self.user, 'language', 'en')
        
        # Build recommendation query
        recommendations = []
        
        # 1. Templates of preferred types that user hasn't used
        used_template_ids = user_papers.values_list('template_id', flat=True)
        
        for pref_type in preferred_types[:3]:  # Top 3 preferred types
            similar_templates = PaperTemplate.objects.filter(
                paper_type=pref_type['template__paper_type'],
                language=user_language,
                is_active=True,
                is_deleted=False
            ).exclude(
                id__in=used_template_ids
            ).annotate(
                usage_count=Count('generated_papers')
            ).order_by('-usage_count')[:2]
            
            recommendations.extend(similar_templates)
        
        # 2. Fill remaining slots with popular templates
        if len(recommendations) < limit:
            popular_templates = TemplateManager.get_featured_templates(
                limit - len(recommendations)
            )
            
            for template in popular_templates:
                if template not in recommendations:
                    recommendations.append(template)
                    if len(recommendations) >= limit:
                        break
        
        return recommendations[:limit]
    
    def get_similar_templates(self, template: PaperTemplate, limit: int = 3) -> List[PaperTemplate]:
        """Get templates similar to the given template"""
        
        return PaperTemplate.objects.filter(
            paper_type=template.paper_type,
            language=template.language,
            is_active=True,
            is_deleted=False
        ).exclude(
            id=template.id
        ).annotate(
            usage_count=Count('generated_papers')
        ).order_by('-usage_count')[:limit]

