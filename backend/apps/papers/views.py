from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import generics, permissions, status, viewsets, serializers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count
from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter, extend_schema_field
from drf_spectacular.openapi import OpenApiTypes
import json

from .models import (
    PaperFormat, PaperTemplate, GeneratedPaper, PaperFeedback
)
from .serializers import (
    PaperFormatSerializer, PaperTemplateSerializer, PaperTemplateDetailSerializer,
    GeneratedPaperSerializer, GeneratedPaperListSerializer, PaperGenerationRequestSerializer,
    PaperFeedbackSerializer, PaperValidationSerializer, PaperExportSerializer,
    TemplateSearchSerializer, PaperValidationResponseSerializer, PaperExportResponseSerializer,
    TemplateSearchResponseSerializer
)
from .generators import (
    PaperGenerator, PaperGenerationError, TemplateManager,
    TemplateRecommendationEngine, PaperValidator, PaperMetrics
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, parsers
from .utils import extract_text_from_file
from apps.core.llm_service import LLMManager, extract_html_from_response

# New API for HomePage integration
class AIPaperFormatView(APIView):
    """API endpoint for AI paper formatting (HomePage integration)"""
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(
        summary="AI Paper Formatting (HomePage integration)",
        description="Format a paper using AI based on uploaded file and requirements.",
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {'type': 'string', 'format': 'binary'},
                    'requirements': {'type': 'string'},
                    'output_format': {'type': 'string', 'enum': ['docx', 'pdf', 'latex', 'md'], 'default': 'docx'},
                    'title': {'type': 'string', 'required': False},
                    'language': {'type': 'string', 'default': 'en'}
                }
            },
            'application/json': {
                'type': 'object',
                'properties': {
                    'requirements': {'type': 'string'},
                    'output_format': {'type': 'string', 'enum': ['docx', 'pdf', 'latex', 'md'], 'default': 'docx'},
                    'title': {'type': 'string', 'required': False},
                    'language': {'type': 'string', 'default': 'en'}
                }
            }
        },
        responses={200: OpenApiTypes.OBJECT}
    )
    def post(self, request):
        """Format a paper using AI (for HomePage, no template, direct LLM prompt)"""
        file = request.FILES.get('file')
        requirements = request.data.get('requirements', '')
        output_format = request.data.get('output_format', 'docx')
        title = request.data.get('title')
        language = request.data.get('language', 'en')

        # Validate required fields
        if not file or not requirements:
            return Response({'error': 'File and requirements are required.'}, status=400)

        valid_formats = ['docx', 'pdf', 'latex', 'md']
        if output_format not in valid_formats:
            return Response({'error': 'Invalid output format.'}, status=400)

        try:
            text = extract_text_from_file(file)
        except Exception as e:
            return Response({'error': f'File extraction failed: {str(e)}'}, status=400)



        # Use the same prompt structure as PaperFormatWithLLMView, but requirements as the template
        # requirements is expected to be a JSON string or dict with structure/formatting info
        try:
            user_template = requirements
            if isinstance(user_template, str):
                try:
                    user_template = json.loads(user_template)
                except Exception:
                    user_template = {'description': user_template}
        except Exception:
            user_template = {'description': requirements}

        # Prepare variables for prompt
        description = user_template.get('description', '') if isinstance(user_template, dict) else str(user_template)
        sections = user_template.get('sections', []) if isinstance(user_template, dict) else []
        formatting = user_template.get('formatting', {}) if isinstance(user_template, dict) else {}
        style_guidelines = user_template.get('style_guidelines', '') if isinstance(user_template, dict) else ''
        citation_style = user_template.get('citation_style', '') if isinstance(user_template, dict) else ''

        sections_str = "\n".join(
            [f"{s.get('order', i+1)}. {s.get('name', '')} ({'Required' if s.get('required', False) else 'Optional'})" for i, s in enumerate(sections)]
        )
        formatting_str = "\n".join(
            [f"- {k.replace('_', ' ').capitalize()}: {v}" for k, v in formatting.items()]
        )

        # Select prompt template based on language
        if language.startswith('zh'):
            prompt_template = (
                "你是一位资深学术编辑。请根据下述要求对论文内容进行格式化和润色。\n\n"
                "描述：{description}\n\n"
                "章节顺序：\n{sections}\n\n"
                "格式要求：\n{formatting}\n\n"
                "风格指南：\n{style_guidelines}\n\n"
                "引用格式：{citation_style}\n\n"
                "期望输出格式：{output_format}\n"
                "标题：{title}\n"
                "语言：{language}\n"
                "---\n"
                "以下是用户上传文件提取的未排版内容：\n"
                "{text}\n\n"
                "---\n"
                "请直接返回排版后的论文内容（HTML或纯文本），无需解释说明，仅输出排版结果。"
            )
        else:
            prompt_template = (
                "You are an expert academic editor. Format the following paper according to the provided requirements.\n\n"
                "Description: {description}\n\n"
                "Sections (in order):\n{sections}\n\n"
                "Formatting requirements:\n{formatting}\n\n"
                "Style Guidelines:\n{style_guidelines}\n\n"
                "Citation Style: {citation_style}\n\n"
                "Preferred output format: {output_format}\n"
                "Title: {title}\n"
                "Language: {language}\n"
                "---\n"
                "Here is the unformatted content extracted from the user's file:\n"
                "{text}\n\n"
                "---\n"
                "Please return the formatted paper as HTML or plain text, ready for download in the requested format. "
                "Do not include explanations, only the formatted paper."
            )

        prompt = prompt_template.format(
            description=description,
            sections=sections_str,
            formatting=formatting_str,
            style_guidelines=style_guidelines,
            citation_style=citation_style,
            output_format=output_format.upper(),
            title=title if title else '[No Title Provided]',
            language=language,
            text=text
        )

        llm_manager = LLMManager()
        try:
            # Always use the default prompt template for the detected language
            system_template = llm_manager.prompt_service.get_default_prompt(language, 'system')
            if not system_template:
                return Response({"error": f"No default prompt template found for language '{language}'."}, status=500)
            system_prompt = llm_manager.prompt_service.render_prompt(
                system_template,
                description=description,
                sections=sections_str,
                formatting=formatting_str,
                style_guidelines=style_guidelines,
                citation_style=citation_style,
                output_format=output_format.upper(),
                title=title if title else '[No Title Provided]',
                language=language,
                text=text
            )
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ]
            formatted_content = llm_manager.llm_service.generate_response(messages)
            formatted_content = extract_html_from_response(formatted_content)
        except Exception as e:
            return Response({'error': f'LLM formatting failed: {str(e)}'}, status=500)

        file_name = f"formatted_paper.{output_format}"
        return Response({
            'formatted_content': formatted_content,
            'file_name': file_name
        })

class PaperFormatListView(generics.ListAPIView):
    """List available paper formats"""
    serializer_class = PaperFormatSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        language = self.request.query_params.get('language')
        queryset = PaperFormat.objects.filter(
            is_active=True,
            is_deleted=False
        ).order_by('order', 'name')
        if language:
            queryset = queryset.filter(language=language)
        return queryset
    
    @extend_schema(
        summary="Get paper formats",
        description="Retrieve all available paper formats (APA, MLA, Chicago, etc.)",
        parameters=[
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (optional)'
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class PaperFormatDetailView(generics.RetrieveAPIView):
    """Retrieve details of a specific paper format"""
    serializer_class = PaperFormatSerializer
    permission_classes = [AllowAny]
    queryset = PaperFormat.objects.filter(is_active=True, is_deleted=False)

    @extend_schema(
        summary="Get paper format details",
        description="Retrieve details for a specific paper format by ID",
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Format ID'
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class PaperTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for paper templates"""
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PaperTemplateDetailSerializer
        return PaperTemplateSerializer
    
    def get_queryset(self):
        queryset = PaperTemplate.objects.filter(
            is_active=True,
            is_deleted=False
        ).select_related('format').order_by('order', 'name')
        
        # Filter by query parameters
        paper_type = self.request.query_params.get('paper_type')
        language = self.request.query_params.get('language', 'en')
        format_id = self.request.query_params.get('format_id')
        is_premium = self.request.query_params.get('is_premium')
        
        queryset = queryset.filter(language=language)
        
        if paper_type:
            queryset = queryset.filter(paper_type=paper_type)
        
        if format_id:
            queryset = queryset.filter(format_id=format_id)
        
        if is_premium is not None:
            queryset = queryset.filter(is_premium=is_premium.lower() == 'true')
        
        return queryset
    
    @extend_schema(
        summary="Get paper templates",
        description="Retrieve paper templates with optional filtering",
        parameters=[
            OpenApiParameter(
                name='paper_type',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by paper type'
            ),
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (default: en)'
            ),
            OpenApiParameter(
                name='format_id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Filter by format ID'
            ),
            OpenApiParameter(
                name='is_premium',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Filter by premium status'
            ),
        ],
        responses={200: PaperTemplateSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Get template details",
        description="Retrieve detailed information about a specific template",
        responses={200: PaperTemplateDetailSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    @extend_schema(
        summary="Get similar templates",
        description="Get templates similar to the specified template",
        responses={200: PaperTemplateSerializer(many=True)}
    )
    def similar(self, request, pk=None):
        """Get similar templates"""
        template = self.get_object()
        engine = TemplateRecommendationEngine(request.user if request.user.is_authenticated else None)
        similar_templates = engine.get_similar_templates(template)
        
        serializer = PaperTemplateSerializer(similar_templates, many=True)
        return Response(serializer.data)


class TemplateSearchView(APIView):
    """Search templates by various criteria"""
    permission_classes = [AllowAny]
    serializer_class = TemplateSearchResponseSerializer
    
    @extend_schema(
        summary="Search templates",
        description="Search templates by various criteria",
        parameters=[
            OpenApiParameter(
                name='q',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Search query'
            ),
            OpenApiParameter(
                name='paper_type',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by paper type'
            ),
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (default: en)'
            ),
            OpenApiParameter(
                name='format_id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Filter by format ID'
            ),
        ],
        responses={200: TemplateSearchResponseSerializer}
    )
    def get(self, request):
        """Search templates"""
        serializer = TemplateSearchSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        
        query = serializer.validated_data.get('query')
        paper_type = serializer.validated_data.get('paper_type')
        language = serializer.validated_data.get('language', 'en')
        format_id = serializer.validated_data.get('format_id')
        is_premium = serializer.validated_data.get('is_premium')
        
        if query:
            templates = TemplateManager.search_templates(query, language)
        else:
            templates = PaperTemplate.objects.filter(
                language=language,
                is_active=True,
                is_deleted=False
            ).select_related('format')
        
        # Apply additional filters
        if paper_type:
            templates = templates.filter(paper_type=paper_type)
        
        if format_id:
            templates = templates.filter(format_id=format_id)
        
        if is_premium is not None:
            templates = templates.filter(is_premium=is_premium)
        
        templates = templates.order_by('order', 'name')
        total_count = templates.count()
        
        # Prepare filters applied dictionary
        filters_applied = {}
        if query:
            filters_applied['query'] = query
        if paper_type:
            filters_applied['paper_type'] = paper_type
        if format_id:
            filters_applied['format_id'] = format_id
        if is_premium is not None:
            filters_applied['is_premium'] = is_premium
        
        template_serializer = PaperTemplateSerializer(templates, many=True)
        
        return Response({
            'results': template_serializer.data,
            'total_count': total_count,
            'query': query,
            'filters_applied': filters_applied
        })


class FeaturedTemplatesView(APIView):
    """Get featured/popular templates for homepage"""
    permission_classes = [AllowAny]
    serializer_class = PaperTemplateSerializer
    
    @extend_schema(
        summary="Get featured templates",
        description="Get featured/popular templates for homepage",
        responses={200: PaperTemplateSerializer(many=True)}
    )
    def get(self, request):
        """Get featured templates"""
        templates = TemplateManager.get_featured_templates()
        serializer = PaperTemplateSerializer(templates, many=True)
        return Response(serializer.data)


class RecommendedTemplatesView(APIView):
    """Get personalized template recommendations for the user"""
    permission_classes = [IsAuthenticated]
    serializer_class = PaperTemplateSerializer
    
    @extend_schema(
        summary="Get recommended templates",
        description="Get personalized template recommendations for the user",
        responses={200: PaperTemplateSerializer(many=True)}
    )
    def get(self, request):
        """Get recommended templates for user"""
        engine = TemplateRecommendationEngine(request.user)
        templates = engine.get_recommended_templates()
        serializer = PaperTemplateSerializer(templates, many=True)
        return Response(serializer.data)


class GeneratedPaperListView(generics.ListAPIView):
    """List user's generated papers"""
    serializer_class = GeneratedPaperListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GeneratedPaper.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('template', 'template__format').order_by('-created_at')
    
    @extend_schema(
        summary="Get user's papers",
        description="Retrieve list of papers generated by the current user",
        responses={200: GeneratedPaperListSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class GeneratedPaperDetailView(generics.RetrieveAPIView):
    """Get paper details"""
    serializer_class = GeneratedPaperSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GeneratedPaper.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('template', 'template__format').prefetch_related('sections')
    
    @extend_schema(
        summary="Get paper details",
        description="Retrieve detailed information about a specific generated paper",
        responses={200: GeneratedPaperSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class PaperGenerationView(APIView):
    """Base class for paper generation views"""
    permission_classes = [IsAuthenticated]
    serializer_class = PaperGenerationRequestSerializer


@extend_schema(
    summary="Generate paper",
    description="Generate a new academic paper using AI",
    request=PaperGenerationRequestSerializer,
    responses={201: GeneratedPaperSerializer}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_paper(request):
    """Generate a new paper"""
    serializer = PaperGenerationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    template_id = serializer.validated_data['template_id']
    title = serializer.validated_data.get('title')
    user_inputs = serializer.validated_data['user_inputs']
    
    try:
        # Get template
        template = get_object_or_404(
            PaperTemplate,
            id=template_id,
            is_active=True,
            is_deleted=False
        )
        
        # Check if user has enough credits
        if request.user.credits < template.estimated_credits:
            return Response({
                'error': 'Insufficient credits',
                'required_credits': template.estimated_credits,
                'user_credits': request.user.credits
            }, status=status.HTTP_402_PAYMENT_REQUIRED)
        
        # Generate paper
        generator = PaperGenerator(template, request.user)
        paper = generator.generate(user_inputs, title)
        
        # --- LLM HTML extraction logic ---
        if hasattr(paper, "content") and paper.content:
            paper.content = extract_html_from_response(paper.content)
            paper.save(update_fields=["content"])
        # --- end LLM HTML extraction logic ---
        
        serializer = GeneratedPaperSerializer(paper)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except PaperGenerationError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    summary="Generate paper with streaming",
    description="Generate a paper with real-time streaming response",
    request=PaperGenerationRequestSerializer,
    responses={200: OpenApiTypes.OBJECT}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_paper_stream(request):
    """Generate paper with streaming response"""
    serializer = PaperGenerationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    template_id = serializer.validated_data['template_id']
    title = serializer.validated_data.get('title')
    user_inputs = serializer.validated_data['user_inputs']
    
    try:
        # Get template
        template = get_object_or_404(
            PaperTemplate,
            id=template_id,
            is_active=True,
            is_deleted=False
        )
        
        # Check credits
        if request.user.credits < template.estimated_credits:
            return Response({
                'error': 'Insufficient credits'
            }, status=status.HTTP_402_PAYMENT_REQUIRED)
        
        # Generate streaming response
        def generate():
            generator = PaperGenerator(template, request.user)
            for chunk in generator.stream_generate(user_inputs, title):
                yield f"data: {json.dumps(chunk)}\n\n"
        
        response = StreamingHttpResponse(
            generate(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['Connection'] = 'keep-alive'
        return response
        
    except PaperGenerationError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    summary="Validate paper",
    description="Validate generated paper content",
    request=PaperValidationSerializer,
    responses={200: PaperValidationResponseSerializer}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_paper(request):
    """Validate paper content"""
    serializer = PaperValidationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    content = serializer.validated_data['content']
    template_id = serializer.validated_data['template_id']
    target_word_count = serializer.validated_data.get('target_word_count')
    
    try:
        template = get_object_or_404(PaperTemplate, id=template_id)
        
        # Get format requirements
        required_sections = []
        if template.format and template.format.template_structure:
            sections = template.format.template_structure.get('sections', [])
            required_sections = [s['name'] for s in sections if s.get('required', False)]
        
        # Validate structure
        structure_validation = PaperValidator.validate_paper_structure(content, required_sections)
        
        # Validate word count
        word_count_validation = {}
        if target_word_count:
            word_count_validation = PaperValidator.validate_word_count(content, target_word_count)
        
        # Validate citations
        citation_validation = PaperValidator.validate_citations(content)
        
        # Calculate metrics
        metrics = PaperMetrics.calculate_metrics(content)
        
        return Response({
            'is_valid': structure_validation.get('is_valid', True),
            'score': metrics.get('overall_score', 0.0),
            'issues': structure_validation.get('issues', []),
            'suggestions': structure_validation.get('suggestions', []),
            'word_count': len(content.split()),
            'estimated_credits': template.estimated_credits
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    summary="Export paper",
    description="Export paper to different formats (PDF, DOCX, LaTeX)",
    request=PaperExportSerializer,
    responses={200: PaperExportResponseSerializer}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_paper(request):
    """Export paper to different formats"""
    serializer = PaperExportSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    paper_id = serializer.validated_data['paper_id']
    export_format = serializer.validated_data['format']
    
    try:
        paper = get_object_or_404(
            GeneratedPaper,
            id=paper_id,
            user=request.user,
            status='completed',
            is_deleted=False
        )
        
        # TODO: Implement actual export functionality
        # For now, return placeholder response
        
        return Response({
            'success': True,
            'file_url': f'/api/v1/papers/{paper_id}/download/{export_format}/',
            'file_name': f'{paper.title}.{export_format}',
            'format': export_format
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'format': export_format,
            'error_message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


class PaperFeedbackViewSet(viewsets.ModelViewSet):
    """ViewSet for paper feedback"""
    serializer_class = PaperFeedbackSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaperFeedback.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('paper', 'user')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @extend_schema(
        summary="Create paper feedback",
        description="Submit feedback for a generated paper",
        request=PaperFeedbackSerializer,
        responses={201: PaperFeedbackSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        summary="Get paper feedback",
        description="Retrieve feedback for user's papers",
        responses={200: PaperFeedbackSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Update paper feedback",
        description="Update existing paper feedback",
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Feedback ID'
            ),
        ],
        request=PaperFeedbackSerializer,
        responses={200: PaperFeedbackSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        summary="Partially update paper feedback",
        description="Partially update existing paper feedback",
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Feedback ID'
            ),
        ],
        request=PaperFeedbackSerializer,
        responses={200: PaperFeedbackSerializer}
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        summary="Retrieve paper feedback",
        description="Retrieve specific paper feedback by ID",
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Feedback ID'
            ),
        ],
        responses={200: PaperFeedbackSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        summary="Delete paper feedback",
        description="Delete existing paper feedback",
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Feedback ID'
            ),
        ],
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class PaperFormatWithLLMView(APIView):
    """Format paper content using LLM"""
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    serializer_class = serializers.Serializer  # Dummy serializer for schema generation

    @extend_schema(
        summary="Format paper with LLM",
        description="Format paper content according to specified format using LLM",
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {'type': 'string', 'format': 'binary'},
                    'format_id': {'type': 'integer'},
                    'language': {'type': 'string', 'default': 'en'}
                }
            }
        },
        responses={200: OpenApiTypes.OBJECT}
    )
    def post(self, request):
        file = request.FILES.get('file')
        format_id = request.data.get('format_id')
        language = request.data.get('language', 'en')

        if not file or not format_id:
            return Response({'error': 'File and format_id are required.'}, status=400)

        try:
            text = extract_text_from_file(file)
        except Exception as e:
            return Response({'error': f'File extraction failed: {str(e)}'}, status=400)

        try:
            paper_format = PaperFormat.objects.get(
                pk=format_id, is_active=True, is_deleted=False
            )
        except PaperFormat.DoesNotExist:
            return Response({'error': 'Format not found.'}, status=404)

        # Prepare variables for prompt
        sections = paper_format.template_structure.get('sections', []) if paper_format.template_structure else []
        formatting = paper_format.template_structure.get('formatting', {}) if paper_format.template_structure else {}

        sections_str = "\n".join(
            [f"{s['order']}. {s['name']} ({'Required' if s.get('required') else 'Optional'})" for s in sections]
        )
        formatting_str = "\n".join(
            [f"- {k.replace('_', ' ').capitalize()}: {v}" for k, v in formatting.items()]
        )

        # Select prompt template based on language
        prompt_template = paper_format.prompt_template_en or ""
        if paper_format.language == 'zh' and paper_format.prompt_template_zh:
            prompt_template = paper_format.prompt_template_zh

        # Fallback if no template is set
        if not prompt_template:
            prompt_template = (
                "You are an expert academic editor. Format the following paper according to the '{name}' style.\n\n"
                "Description: {description}\n\n"
                "Sections (in order):\n{sections}\n\n"
                "Formatting requirements:\n{formatting}\n\n"
                "Style Guidelines:\n{style_guidelines}\n\n"
                "Citation Style: {citation_style}\n\n"
                "---\n"
                "Here is the unformatted content extracted from the user's file:\n"
                "{text}\n\n"
                "---\n"
                "Please return the formatted paper as HTML, including all required sections, formatting, and style."
            )

        prompt = prompt_template.format(
            name=paper_format.name,
            description=paper_format.description,
            sections=sections_str,
            formatting=formatting_str,
            style_guidelines=paper_format.style_guidelines or "",
            citation_style=paper_format.citation_style or "",
            text=text
        )

        llm_manager = LLMManager()
        try:
            formatted_content = llm_manager.generate_with_prompt(
                prompt_name="format_paper",
                user_input=prompt,
                language=language
            )
            # Remove AI explanations/thinking, keep only HTML
            formatted_content = extract_html_from_response(formatted_content)
        except Exception as e:
            return Response({'error': f'LLM formatting failed: {str(e)}'}, status=500)

        return Response({
            'formatted_content': formatted_content,
            'format': PaperFormatSerializer(paper_format).data
        })


