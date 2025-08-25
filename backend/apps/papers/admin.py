from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    PaperFormat, PaperTemplate, GeneratedPaper, 
    PaperSection, PaperFeedback
)


@admin.register(PaperFormat)
class PaperFormatAdmin(admin.ModelAdmin):
    """Paper Format admin"""
    
    list_display = ('name', 'language', 'is_active')
    list_filter = ['citation_style', 'language', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'citation_style', 'language']
    ordering = ['order', 'name']
    
    fields = (
        'name', 'language', 'description', 'template_structure', 'style_guidelines',
        'citation_style', 'prompt_template_en', 'prompt_template_zh', 'is_active', 'order'
    )
    
    def template_count(self, obj):
        """Count of templates using this format"""
        return obj.templates.count()
    template_count.short_description = "Templates"
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)


@admin.register(PaperTemplate)
class PaperTemplateAdmin(admin.ModelAdmin):
    """Paper Template admin"""
    
    list_display = [
        'name', 'paper_type', 'format', 'language', 
        'estimated_credits', 'is_active', 'is_premium', 
        'usage_count', 'created_at'
    ]
    list_filter = [
        'paper_type', 'format', 'language', 'is_active', 
        'is_premium', 'created_at'
    ]
    search_fields = ['name', 'description']
    ordering = ['order', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'paper_type', 'format', 'language', 'description')
        }),
        ('AI Prompts', {
            'fields': ('system_prompt', 'user_prompt_template'),
            'classes': ('collapse',)
        }),
        ('Template Configuration', {
            'fields': ('required_fields', 'optional_fields', 'validation_rules'),
            'description': 'JSON configuration for user inputs'
        }),
        ('Example & Validation', {
            'fields': ('example_output',),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('estimated_credits', 'is_active', 'is_premium', 'order')
        }),
    )
    
    def usage_count(self, obj):
        """Count of papers generated using this template"""
        return obj.generated_papers.count()
    usage_count.short_description = "Usage Count"
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)
    
    actions = ['activate_templates', 'deactivate_templates', 'mark_as_premium']
    
    def activate_templates(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"Activated {count} templates.")
    activate_templates.short_description = "Activate selected templates"
    
    def deactivate_templates(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"Deactivated {count} templates.")
    deactivate_templates.short_description = "Deactivate selected templates"
    
    def mark_as_premium(self, request, queryset):
        count = queryset.update(is_premium=True)
        self.message_user(request, f"Marked {count} templates as premium.")
    mark_as_premium.short_description = "Mark as premium"


class PaperSectionInline(admin.TabularInline):
    """Inline admin for paper sections"""
    model = PaperSection
    extra = 0
    fields = ['section_name', 'word_count', 'order']
    readonly_fields = ['word_count']


@admin.register(GeneratedPaper)
class GeneratedPaperAdmin(admin.ModelAdmin):
    """Generated Paper admin"""
    
    list_display = [
        'title', 'user', 'template', 'status', 
        'word_count', 'credits_used', 'created_at'
    ]
    list_filter = [
        'status', 'template__paper_type', 'template__language', 
        'created_at', 'credits_used'
    ]
    search_fields = ['title', 'user__email', 'template__name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Paper Information', {
            'fields': ('user', 'template', 'title', 'status')
        }),
        ('Content', {
            'fields': ('content', 'word_count'),
            'classes': ('collapse',)
        }),
        ('Generation Details', {
            'fields': ('user_inputs', 'generation_parameters', 'credits_used', 'generation_time')
        }),
        ('Files', {
            'fields': ('pdf_file', 'docx_file')
        }),
        ('Error Information', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['word_count', 'generation_time']
    inlines = [PaperSectionInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)
    
    actions = ['recalculate_word_count']
    
    def recalculate_word_count(self, request, queryset):
        count = 0
        for paper in queryset:
            paper.calculate_word_count()
            count += 1
        self.message_user(request, f"Recalculated word count for {count} papers.")
    recalculate_word_count.short_description = "Recalculate word count"


@admin.register(PaperFeedback)
class PaperFeedbackAdmin(admin.ModelAdmin):
    """Paper Feedback admin"""
    
    list_display = [
        'paper', 'user', 'rating', 'content_quality', 
        'structure_quality', 'language_quality', 'is_helpful', 'created_at'
    ]
    list_filter = [
        'rating', 'content_quality', 'structure_quality', 
        'language_quality', 'is_helpful', 'created_at'
    ]
    search_fields = ['paper__title', 'user__email', 'comment']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Feedback Information', {
            'fields': ('paper', 'user', 'rating', 'is_helpful')
        }),
        ('Quality Ratings', {
            'fields': ('content_quality', 'structure_quality', 'language_quality')
        }),
        ('Comments', {
            'fields': ('comment',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)

