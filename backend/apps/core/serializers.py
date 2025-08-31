from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import LLMProvider, LLMModel, PromptTemplate, LLMConfiguration

# Define LLMModelSerializer first
class LLMModelSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    
    class Meta:
        model = LLMModel
        fields = [
            'id', 'name', 'display_name', 'description', 'provider', 'provider_name',
            'context_length', 'max_tokens', 'temperature_default', 'is_active', 
            'is_default', 'supports_streaming', 'cost_per_1k_tokens',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

# Now define LLMProviderSerializer that references LLMModelSerializer
class LLMProviderSerializer(serializers.ModelSerializer):
    models = serializers.SerializerMethodField()
    
    class Meta:
        model = LLMProvider
        fields = ['id', 'name', 'provider_type', 'base_url', 'is_active', 'is_default', 'models', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    @extend_schema_field(LLMModelSerializer(many=True))
    def get_models(self, obj):
        """Return active models for this provider"""
        queryset = obj.models.filter(is_active=True)
        return LLMModelSerializer(queryset, many=True).data

# Other serializers remain the same
class PromptTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromptTemplate
        fields = [
            'id', 'name', 'language', 'prompt_type', 'template', 'description',
            'variables', 'is_active', 'is_default', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class LLMConfigurationSerializer(serializers.ModelSerializer):
    default_provider_name = serializers.CharField(source='default_provider.name', read_only=True)
    default_model_name = serializers.CharField(source='default_model.display_name', read_only=True)
    
    class Meta:
        model = LLMConfiguration
        fields = [
            'id', 'default_provider', 'default_provider_name', 'default_model', 'default_model_name',
            'default_temperature', 'default_max_tokens', 'enable_streaming', 'enable_caching',
            'cache_ttl', 'rate_limit_per_minute', 'enable_logging', 'log_level'
        ]
        read_only_fields = ['id']

class LLMGenerateRequestSerializer(serializers.Serializer):
    content = serializers.CharField(help_text="Content to process with LLM")
    prompt_name = serializers.CharField(
        required=False, 
        default='general_assistant',
        help_text="Name of the prompt template to use"
    )
    language = serializers.ChoiceField(
        choices=[('en', 'English'), ('zh-hans', 'Chinese')],
        required=False,
        help_text="Language for prompt selection (auto-detected if not provided)"
    )
    variables = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Variables to substitute in the prompt template"
    )
    temperature = serializers.FloatField(
        required=False,
        min_value=0.0,
        max_value=2.0,
        help_text="Temperature for response generation"
    )
    max_tokens = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=8192,
        help_text="Maximum tokens to generate"
    )

class LLMGenerateResponseSerializer(serializers.Serializer):
    content = serializers.CharField(help_text="Generated content")
    detected_language = serializers.CharField(help_text="Detected language of input")
    prompt_name = serializers.CharField(help_text="Prompt template used")
    success = serializers.BooleanField(help_text="Whether generation was successful")
    error = serializers.CharField(required=False, help_text="Error message if any")

class LanguageDetectionRequestSerializer(serializers.Serializer):
    content = serializers.CharField(help_text="Text content to analyze for language detection")

class LanguageDetectionResponseSerializer(serializers.Serializer):
    language = serializers.CharField(help_text="Detected language code")
    confidence = serializers.FloatField(help_text="Confidence score (0.0 to 1.0)")
    chinese_chars = serializers.IntegerField(help_text="Number of Chinese characters")
    total_chars = serializers.IntegerField(help_text="Total number of characters")