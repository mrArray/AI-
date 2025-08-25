from rest_framework import serializers
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field
from .models import (
    PaperFormat, PaperTemplate, GeneratedPaper, PaperSection, PaperFeedback
)

User = get_user_model()


class PaperFormatSerializer(serializers.ModelSerializer):
    """Serializer for paper formats"""
    template_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PaperFormat
        fields = [
            'id', 'name', 'description', 'template_structure',
            'style_guidelines', 'citation_style', 'is_active',
            'order', 'template_count', 'created_at', 'updated_at',
            'language', 'prompt_template_en', 'prompt_template_zh'
        ]
        read_only_fields = ['id', 'template_count', 'created_at', 'updated_at']
    
    @extend_schema_field(serializers.IntegerField)
    def get_template_count(self, obj):
        return obj.templates.filter(is_active=True, is_deleted=False).count()


class PaperTemplateSerializer(serializers.ModelSerializer):
    """Serializer for paper templates"""
    format_name = serializers.CharField(source='format.name', read_only=True)
    usage_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PaperTemplate
        fields = [
            'id', 'name', 'paper_type', 'format', 'format_name',
            'language', 'description', 'required_fields', 'optional_fields',
            'estimated_credits', 'is_active', 'is_premium', 'order',
            'usage_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'format_name', 'usage_count', 'created_at', 'updated_at']
    
    @extend_schema_field(serializers.IntegerField)
    def get_usage_count(self, obj):
        return obj.generated_papers.filter(status='completed').count()


class PaperTemplateDetailSerializer(PaperTemplateSerializer):
    """Detailed serializer for paper templates"""
    format = PaperFormatSerializer(read_only=True)
    
    class Meta(PaperTemplateSerializer.Meta):
        fields = PaperTemplateSerializer.Meta.fields + [
            'system_prompt', 'user_prompt_template', 'example_output',
            'validation_rules'
        ]


class PaperSectionSerializer(serializers.ModelSerializer):
    """Serializer for paper sections"""
    
    class Meta:
        model = PaperSection
        fields = [
            'id', 'section_name', 'content', 'order', 'word_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'word_count', 'created_at', 'updated_at']


class GeneratedPaperSerializer(serializers.ModelSerializer):
    """Serializer for generated papers"""
    template_name = serializers.CharField(source='template.name', read_only=True)
    format_name = serializers.CharField(source='template.format.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    sections = PaperSectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = GeneratedPaper
        fields = [
            'id', 'title', 'template', 'template_name', 'format_name',
            'user_email', 'content', 'word_count', 'status',
            'credits_used', 'generation_time', 'error_message',
            'pdf_file', 'docx_file', 'sections', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'template_name', 'format_name', 'user_email',
            'word_count', 'generation_time', 'sections', 'created_at', 'updated_at'
        ]


class GeneratedPaperListSerializer(serializers.ModelSerializer):
    """Simplified serializer for paper list"""
    template_name = serializers.CharField(source='template.name', read_only=True)
    format_name = serializers.CharField(source='template.format.name', read_only=True)
    
    class Meta:
        model = GeneratedPaper
        fields = [
            'id', 'title', 'template_name', 'format_name',
            'word_count', 'status', 'credits_used',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'template_name', 'format_name', 'created_at', 'updated_at']


class PaperGenerationRequestSerializer(serializers.Serializer):
    """Serializer for paper generation requests"""
    template_id = serializers.IntegerField()
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    user_inputs = serializers.JSONField()
    
    def validate_template_id(self, value):
        try:
            template = PaperTemplate.objects.get(
                id=value,
                is_active=True,
                is_deleted=False
            )
            return value
        except PaperTemplate.DoesNotExist:
            raise serializers.ValidationError("Invalid template ID")
    
    def validate_user_inputs(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("User inputs must be a dictionary")
        return value


class PaperFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for paper feedback"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    paper_title = serializers.CharField(source='paper.title', read_only=True)
    
    class Meta:
        model = PaperFeedback
        fields = [
            'id', 'paper', 'paper_title', 'user_email', 'rating',
            'comment', 'content_quality', 'structure_quality',
            'language_quality', 'is_helpful', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'paper_title', 'user_email', 'created_at', 'updated_at']


class PaperValidationSerializer(serializers.Serializer):
    """Serializer for paper validation requests"""
    content = serializers.CharField()
    template_id = serializers.IntegerField()
    target_word_count = serializers.IntegerField(required=False, allow_null=True)
    
    def validate_template_id(self, value):
        try:
            PaperTemplate.objects.get(id=value, is_active=True, is_deleted=False)
            return value
        except PaperTemplate.DoesNotExist:
            raise serializers.ValidationError("Invalid template ID")


class PaperExportSerializer(serializers.Serializer):
    """Serializer for paper export requests"""
    paper_id = serializers.IntegerField()
    format = serializers.ChoiceField(choices=['pdf', 'docx', 'latex'])
    
    def validate_paper_id(self, value):
        try:
            GeneratedPaper.objects.get(id=value, status='completed')
            return value
        except GeneratedPaper.DoesNotExist:
            raise serializers.ValidationError("Invalid paper ID or paper not completed")


class TemplateSearchSerializer(serializers.Serializer):
    """Serializer for template search requests"""
    query = serializers.CharField(required=False, allow_blank=True)
    paper_type = serializers.CharField(required=False, allow_blank=True)
    language = serializers.CharField(default='en')
    format_id = serializers.IntegerField(required=False, allow_null=True)
    is_premium = serializers.BooleanField(required=False, allow_null=True)
    
    def validate_format_id(self, value):
        if value is not None:
            try:
                PaperFormat.objects.get(id=value, is_active=True, is_deleted=False)
                return value
            except PaperFormat.DoesNotExist:
                raise serializers.ValidationError("Invalid format ID")
        return value


class PaperValidationResponseSerializer(serializers.Serializer):
    """Serializer for paper validation response"""
    is_valid = serializers.BooleanField()
    score = serializers.FloatField()
    issues = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    suggestions = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    word_count = serializers.IntegerField()
    estimated_credits = serializers.IntegerField()


class PaperExportResponseSerializer(serializers.Serializer):
    """Serializer for paper export response"""
    success = serializers.BooleanField()
    file_url = serializers.URLField(required=False)
    file_name = serializers.CharField(required=False)
    format = serializers.CharField()
    error_message = serializers.CharField(required=False)


class TemplateSearchResponseSerializer(serializers.Serializer):
    """Serializer for template search response"""
    results = PaperTemplateSerializer(many=True)
    total_count = serializers.IntegerField()
    query = serializers.CharField(required=False)
    filters_applied = serializers.DictField(required=False)