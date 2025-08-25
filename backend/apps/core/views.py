from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.openapi import OpenApiTypes
from django.http import StreamingHttpResponse
import json
import logging

from apps.core.llm_service import LLMManager, PromptService
from apps.core.models import PromptTemplate, LLMProvider, LLMModel
from .serializers import (
    LLMGenerateRequestSerializer, LLMGenerateResponseSerializer,
    PromptTemplateSerializer, LLMProviderSerializer, LLMModelSerializer,
    LanguageDetectionRequestSerializer, LanguageDetectionResponseSerializer
)

logger = logging.getLogger(__name__)

@extend_schema(
    summary="Generate content using LLM",
    description="Generate content using configured LLM with automatic language detection and prompt guiding",
    request=LLMGenerateRequestSerializer,
    responses={200: LLMGenerateResponseSerializer}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_content(request):
    """Generate content using LLM with prompt guiding"""
    serializer = LLMGenerateRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user_input = serializer.validated_data['content']
    prompt_name = serializer.validated_data.get('prompt_name', 'general_assistant')
    language = serializer.validated_data.get('language')
    variables = serializer.validated_data.get('variables', {})
    
    try:
        llm_manager = LLMManager()
        
        # Generate response with prompt guiding
        response = llm_manager.generate_with_prompt(
            prompt_name=prompt_name,
            user_input=user_input,
            language=language,
            **variables
        )
        
        # Detect the language used
        detected_language = PromptService.detect_language(user_input) if not language else language
        
        return Response({
            'content': response,
            'detected_language': detected_language,
            'prompt_name': prompt_name,
            'success': True
        })
        
    except Exception as e:
        logger.error(f"Error generating content: {e}")
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(
    summary="Stream content generation using LLM",
    description="Stream content generation using configured LLM with automatic language detection",
    request=LLMGenerateRequestSerializer,
    responses=None  # Special case for streaming responses
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stream_content(request):
    """Stream content generation using LLM"""
    serializer = LLMGenerateRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user_input = serializer.validated_data['content']
    prompt_name = serializer.validated_data.get('prompt_name', 'general_assistant')
    language = serializer.validated_data.get('language')
    variables = serializer.validated_data.get('variables', {})
    
    try:
        llm_manager = LLMManager()
        
        def generate():
            # Send initial metadata
            detected_language = PromptService.detect_language(user_input) if not language else language
            yield f"data: {json.dumps({'type': 'metadata', 'detected_language': detected_language, 'prompt_name': prompt_name})}\n\n"
            
            # Stream the response
            for chunk in llm_manager.stream_with_prompt(
                prompt_name=prompt_name,
                user_input=user_input,
                language=language,
                **variables
            ):
                yield f"data: {json.dumps({'type': 'content', 'chunk': chunk})}\n\n"
            
            # Send completion signal
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        
        response = StreamingHttpResponse(
            generate(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['Connection'] = 'keep-alive'
        return response
        
    except Exception as e:
        logger.error(f"Error streaming content: {e}")
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(
    summary="Get available prompt templates",
    description="Retrieve available prompt templates with optional language filtering",
    parameters=[
        OpenApiParameter(
            name='language',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description='Filter by language (en, zh-hans)'
        ),
        OpenApiParameter(
            name='prompt_type',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description='Filter by prompt type (system, user, assistant)'
        ),
    ],
    responses={200: PromptTemplateSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_prompt_templates(request):
    """Get available prompt templates"""
    language = request.query_params.get('language')
    prompt_type = request.query_params.get('prompt_type')
    
    queryset = PromptTemplate.objects.filter(is_active=True)
    
    if language:
        queryset = queryset.filter(language=language)
    
    if prompt_type:
        queryset = queryset.filter(prompt_type=prompt_type)
    
    queryset = queryset.order_by('-is_default', 'language', 'name')
    
    serializer = PromptTemplateSerializer(queryset, many=True)
    return Response(serializer.data)

@extend_schema(
    summary="Detect language of text",
    description="Detect the language of provided text (Chinese vs English)",
    request=LanguageDetectionRequestSerializer,
    responses={200: LanguageDetectionResponseSerializer}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_language(request):
    """Detect language of provided text"""
    serializer = LanguageDetectionRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    content = serializer.validated_data['content']
    
    detected_language = PromptService.detect_language(content)
    
    # Calculate confidence based on character analysis
    chinese_chars = sum(1 for char in content if '\u4e00' <= char <= '\u9fff')
    total_chars = len(content.replace(' ', ''))
    
    if total_chars == 0:
        confidence = 0.0
    else:
        chinese_ratio = chinese_chars / total_chars
        if detected_language == 'zh-hans':
            confidence = min(chinese_ratio * 2, 1.0)  # Scale up confidence for Chinese
        else:
            confidence = min((1 - chinese_ratio) * 2, 1.0)  # Scale up confidence for English
    
    return Response({
        'language': detected_language,
        'confidence': confidence,
        'chinese_chars': chinese_chars,
        'total_chars': total_chars
    })

@extend_schema(
    summary="Get available LLM providers",
    description="Retrieve available LLM providers and models",
    responses={200: LLMProviderSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_llm_providers(request):
    """Get available LLM providers"""
    providers = LLMProvider.objects.filter(is_active=True).prefetch_related('models')
    serializer = LLMProviderSerializer(providers, many=True)
    return Response(serializer.data)

@extend_schema(
    summary="Get available LLM models",
    description="Retrieve available LLM models with optional provider filtering",
    parameters=[
        OpenApiParameter(
            name='provider_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description='Filter by provider ID'
        ),
    ],
    responses={200: LLMModelSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_llm_models(request):
    """Get available LLM models"""
    provider_id = request.query_params.get('provider_id')
    
    queryset = LLMModel.objects.filter(is_active=True).select_related('provider')
    
    if provider_id:
        queryset = queryset.filter(provider_id=provider_id)
    
    queryset = queryset.order_by('-is_default', 'display_name')
    
    serializer = LLMModelSerializer(queryset, many=True)
    return Response(serializer.data)