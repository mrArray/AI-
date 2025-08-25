from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils.html import format_html
from django.urls import reverse
from django.http import JsonResponse
from .models import LLMProvider, LLMModel, PromptTemplate, LLMConfiguration

# Customize admin site
admin.site.site_header = _('Academic Paper Generator Admin')
admin.site.site_title = _('Academic Paper Generator')
admin.site.index_title = _('Welcome to Academic Paper Generator Administration')

# Add language switcher to admin
class AdminLanguageMixin:
    """Mixin to add language switching functionality to admin"""
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['available_languages'] = settings.LANGUAGES
        return context

# Override admin site to include language switcher
class CustomAdminSite(admin.AdminSite):
    site_header = _('Academic Paper Generator Admin')
    site_title = _('Academic Paper Generator')
    index_title = _('Welcome to Academic Paper Generator Administration')
    
    def each_context(self, request):
        context = super().each_context(request)
        context['available_languages'] = settings.LANGUAGES
        context['current_language'] = request.LANGUAGE_CODE
        return context

# Replace default admin site
admin.site = CustomAdminSite()
admin.sites.site = admin.site


@admin.register(LLMProvider)
class LLMProviderAdmin(admin.ModelAdmin):
    list_display = ['name', 'provider_type', 'base_url', 'is_active', 'is_default', 'created_at']
    list_filter = ['provider_type', 'is_active', 'is_default']
    search_fields = ['name', 'base_url']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'provider_type', 'base_url')
        }),
        (_('Authentication'), {
            'fields': ('api_key',),
            'classes': ('collapse',)
        }),
        (_('Configuration'), {
            'fields': ('is_active', 'is_default', 'timeout', 'max_retries')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('models')


@admin.register(LLMModel)
class LLMModelAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'provider', 'name', 'context_length', 'is_active', 'is_default']
    list_filter = ['provider', 'is_active', 'is_default', 'supports_streaming']
    search_fields = ['name', 'display_name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('provider', 'name', 'display_name', 'description')
        }),
        (_('Model Configuration'), {
            'fields': ('context_length', 'max_tokens', 'temperature_default', 'supports_streaming')
        }),
        (_('Status & Pricing'), {
            'fields': ('is_active', 'is_default', 'cost_per_1k_tokens')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('provider')


@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'language', 'prompt_type', 'is_active', 'is_default', 'created_at']
    list_filter = ['language', 'prompt_type', 'is_active', 'is_default']
    search_fields = ['name', 'description', 'template']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'language', 'prompt_type', 'description')
        }),
        (_('Template Content'), {
            'fields': ('template', 'variables')
        }),
        (_('Status'), {
            'fields': ('is_active', 'is_default')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['template'].widget.attrs['rows'] = 10
        form.base_fields['variables'].widget.attrs['rows'] = 5
        return form


@admin.register(LLMConfiguration)
class LLMConfigurationAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'default_provider', 'default_model', 'enable_streaming', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (_('Default Settings'), {
            'fields': ('default_provider', 'default_model', 'default_temperature', 'default_max_tokens')
        }),
        (_('Features'), {
            'fields': ('enable_streaming', 'enable_caching', 'cache_ttl')
        }),
        (_('Rate Limiting'), {
            'fields': ('rate_limit_per_minute',)
        }),
        (_('Logging'), {
            'fields': ('enable_logging', 'log_level')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one configuration instance
        return not LLMConfiguration.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of configuration
        return False
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('default_provider', 'default_model')

