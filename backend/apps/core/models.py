from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import URLValidator
import json


class TimeStampedModel(models.Model):
    """Abstract base model with timestamp fields"""
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        abstract = True


class BaseModel(TimeStampedModel):
    """Base model with common fields"""
    is_active = models.BooleanField(_('Is Active'), default=True)
    is_deleted = models.BooleanField(_('Is Deleted'), default=False)
    
    class Meta:
        abstract = True


class LLMProvider(models.Model):
    """Model for LLM providers like Ollama, OpenAI, etc."""
    
    PROVIDER_CHOICES = [
        ('ollama', 'Ollama'),
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic'),
        ('google', 'Google'),
    ]
    
    name = models.CharField(_('Provider Name'), max_length=100)
    provider_type = models.CharField(_('Provider Type'), max_length=20, choices=PROVIDER_CHOICES)
    base_url = models.URLField(_('Base URL'), help_text=_('Base URL for the API endpoint'))
    api_key = models.CharField(_('API Key'), max_length=500, blank=True, help_text=_('API key if required'))
    is_active = models.BooleanField(_('Is Active'), default=True)
    is_default = models.BooleanField(_('Is Default'), default=False)
    timeout = models.IntegerField(_('Timeout (seconds)'), default=30)
    max_retries = models.IntegerField(_('Max Retries'), default=3)
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('LLM Provider')
        verbose_name_plural = _('LLM Providers')
        ordering = ['-is_default', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_provider_type_display()})"
    
    def save(self, *args, **kwargs):
        # Ensure only one default provider
        if self.is_default:
            LLMProvider.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class LLMModel(models.Model):
    """Model for specific LLM models available from providers"""
    
    provider = models.ForeignKey(LLMProvider, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(_('Model Name'), max_length=100)
    display_name = models.CharField(_('Display Name'), max_length=200)
    description = models.TextField(_('Description'), blank=True)
    context_length = models.IntegerField(_('Context Length'), default=4096)
    max_tokens = models.IntegerField(_('Max Tokens'), default=2048)
    temperature_default = models.FloatField(_('Default Temperature'), default=0.7)
    is_active = models.BooleanField(_('Is Active'), default=True)
    is_default = models.BooleanField(_('Is Default'), default=False)
    supports_streaming = models.BooleanField(_('Supports Streaming'), default=True)
    cost_per_1k_tokens = models.DecimalField(_('Cost per 1K tokens'), max_digits=10, decimal_places=6, default=0)
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('LLM Model')
        verbose_name_plural = _('LLM Models')
        ordering = ['-is_default', 'display_name']
        unique_together = ['provider', 'name']
    
    def __str__(self):
        return f"{self.display_name} ({self.provider.name})"
    
    def save(self, *args, **kwargs):
        # Ensure only one default model per provider
        if self.is_default:
            LLMModel.objects.filter(provider=self.provider, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class PromptTemplate(models.Model):
    """Model for prompt templates with language support"""
    
    LANGUAGE_CHOICES = [
        ('en', _('English')),
        ('zh-hans', _('Chinese (Simplified)')),
    ]
    
    PROMPT_TYPE_CHOICES = [
        ('system', _('System Prompt')),
        ('user', _('User Prompt')),
        ('assistant', _('Assistant Prompt')),
    ]
    
    name = models.CharField(_('Template Name'), max_length=200)
    language = models.CharField(_('Language'), max_length=10, choices=LANGUAGE_CHOICES, default='en')
    prompt_type = models.CharField(_('Prompt Type'), max_length=20, choices=PROMPT_TYPE_CHOICES, default='system')
    template = models.TextField(_('Prompt Template'), help_text=_('Use {variable_name} for variables'))
    description = models.TextField(_('Description'), blank=True)
    variables = models.JSONField(_('Variables'), default=dict, help_text=_('JSON object defining template variables'))
    is_active = models.BooleanField(_('Is Active'), default=True)
    is_default = models.BooleanField(_('Is Default'), default=False)
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('Prompt Template')
        verbose_name_plural = _('Prompt Templates')
        ordering = ['-is_default', 'language', 'name']
        unique_together = ['name', 'language', 'prompt_type']
    
    def __str__(self):
        return f"{self.name} ({self.get_language_display()})"
    
    def save(self, *args, **kwargs):
        # Ensure only one default template per language and type
        if self.is_default:
            PromptTemplate.objects.filter(
                language=self.language, 
                prompt_type=self.prompt_type, 
                is_default=True
            ).update(is_default=False)
        super().save(*args, **kwargs)
    
    def render(self, **kwargs):
        """Render the template with provided variables"""
        try:
            return self.template.format(**kwargs)
        except KeyError as e:
            raise ValueError(f"Missing variable: {e}")


class LLMConfiguration(models.Model):
    """Global LLM configuration settings"""
    
    default_provider = models.ForeignKey(
        LLMProvider, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='default_configs',
        verbose_name=_('Default Provider')
    )
    default_model = models.ForeignKey(
        LLMModel, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='default_configs',
        verbose_name=_('Default Model')
    )
    default_temperature = models.FloatField(_('Default Temperature'), default=0.7)
    default_max_tokens = models.IntegerField(_('Default Max Tokens'), default=2048)
    enable_streaming = models.BooleanField(_('Enable Streaming'), default=True)
    enable_caching = models.BooleanField(_('Enable Caching'), default=True)
    cache_ttl = models.IntegerField(_('Cache TTL (seconds)'), default=3600)
    rate_limit_per_minute = models.IntegerField(_('Rate Limit per Minute'), default=60)
    enable_logging = models.BooleanField(_('Enable Logging'), default=True)
    log_level = models.CharField(
        _('Log Level'), 
        max_length=10, 
        choices=[
            ('DEBUG', 'Debug'),
            ('INFO', 'Info'),
            ('WARNING', 'Warning'),
            ('ERROR', 'Error'),
        ],
        default='INFO'
    )
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('LLM Configuration')
        verbose_name_plural = _('LLM Configurations')
    
    def __str__(self):
        return f"LLM Configuration (Updated: {self.updated_at.strftime('%Y-%m-%d %H:%M')})"
    
    @classmethod
    def get_config(cls):
        """Get the current configuration, create if doesn't exist"""
        config, created = cls.objects.get_or_create(pk=1)
        return config

