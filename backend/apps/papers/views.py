from rest_framework import permissions
from .models import FormatCreditPrice
from .serializers import FormatCreditPriceSerializer
# API ViewSet for FormatCreditPrice
from rest_framework import viewsets
class FormatCreditPriceViewSet(viewsets.ModelViewSet):
    queryset = FormatCreditPrice.objects.all()
    serializer_class = FormatCreditPriceSerializer
    permission_classes = [permissions.IsAuthenticated]
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
from django.http import HttpResponse, JsonResponse
import base64
import re
import logging
from .models import FormatCreditPrice

# Configure logger
logger = logging.getLogger(__name__)

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
        """Format a paper using AI (for HomePage, accepts user payload for custom formatting)"""
        file = request.FILES.get('file')
        requirements = request.data.get('requirements', '')
        output_format = request.data.get('output_format', 'docx')
        title = request.data.get('title', '')
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


        # Parse user requirements - can be JSON or plain text
        user_requirements = self._parse_requirements(requirements)

        # Get user (must be authenticated)
        user = request.user if request.user.is_authenticated else None
        if not user:
            return Response({'error': 'Authentication required to generate papers.'}, status=401)


        # Get credit prices for each format option from the database
        format_credit_prices = {f.format: f.credit_price for f in FormatCreditPrice.objects.all()}
        format_name = user_requirements.get('format') or user_requirements.get('name') or output_format
        credit_price = format_credit_prices.get(format_name, 1)

        # Check user credits
        if user.credits < credit_price:
            return Response({'error': f'Insufficient credits. Required: {credit_price}, Available: {user.credits}'}, status=402)

        # Deduct credits
        user.credits -= credit_price
        user.total_credits_used += credit_price
        user.save()

        # Construct optimal prompt based on user requirements and output format
        prompt = self._construct_optimal_prompt(
            user_requirements=user_requirements,
            output_format=output_format,
            title=title,
            language=language,
            text=text
        )

        # Generate formatted content using LLM
        try:
            # Always get the active provider and model from the database
            from apps.core.models import LLMProvider, LLMModel
            provider = LLMProvider.objects.filter(is_active=True).order_by('-is_default').first()
            model = None
            if provider:
                model = LLMModel.objects.filter(provider=provider, is_active=True).order_by('-is_default').first()
            if provider and model:
                llm_manager = LLMManager(provider=provider, model=model)
            else:
                llm_manager = LLMManager()
            messages = [
                {"role": "system", "content": "You are an expert academic editor. Format papers according to user specifications. Return only the formatted content without explanations or AI commentary."},
                {"role": "user", "content": prompt}
            ]
            formatted_content = llm_manager.llm_service.generate_response(messages)
            # Clean up and extract relevant content based on output_format
            formatted_content = self._clean_ai_response(formatted_content, output_format)
        except Exception as e:
            # If it's an LLMServiceError, return only the actual error message if available
            if hasattr(e, 'details') and isinstance(e.details, dict):
                # Try to extract OpenAI/LLM error message
                error_msg = None
                details = e.details.get('response')
                if details:
                    try:
                        error_json = json.loads(details)
                        if 'error' in error_json and 'message' in error_json['error']:
                            error_msg = error_json['error']['message']
                    except Exception:
                        pass
                if error_msg:
                    return Response({'error': error_msg}, status=500)
            # Fallback: show the exception string
            return Response({'error': str(e)}, status=500)

        # Return response based on format type
        return self._format_response(formatted_content, output_format, title)

    def _parse_requirements(self, requirements):
        """Parse user requirements from JSON or plain text"""
        try:
            # Try to parse as JSON first
            if isinstance(requirements, str) and requirements.strip().startswith('{'):
                return json.loads(requirements)
        except json.JSONDecodeError:
            pass
        
        # If not JSON, treat as plain text description
        return {
            'description': requirements,
            'sections': [],
            'formatting': {},
            'style_guidelines': '',
            'citation_style': ''
        }

    def _construct_optimal_prompt(self, user_requirements, output_format, title, language, text):
        """Construct the best possible prompt for optimal formatting results"""
        
        # Extract requirements components
        description = user_requirements.get('description', '')
        sections = user_requirements.get('sections', [])
        formatting = user_requirements.get('formatting', {})
        style_guidelines = user_requirements.get('style_guidelines', '')
        citation_style = user_requirements.get('citation_style', '')
        
        # Build sections string
        sections_str = ""
        if sections:
            sections_str = "\n".join([
                f"{i+1}. {section.get('name', section) if isinstance(section, dict) else section}"
                for i, section in enumerate(sections)
            ])
        
        # Build formatting requirements string
        formatting_str = ""
        if formatting:
            formatting_str = "\n".join([
                f"- {key.replace('_', ' ').title()}: {value}"
                for key, value in formatting.items()
            ])
        
        # Select language-appropriate prompt template
        if language.startswith('zh'):
            prompt_template = """请按照以下要求格式化学术论文：

用户要求：{description}

{sections_section}
{formatting_section}
{style_section}
{citation_section}

输出格式：{output_format}
{title_section}

原始内容：
{text}

请直接输出格式化后的{output_format}内容，不要包含任何解释或说明。"""
        else:
            prompt_template = """Format this academic paper according to the following specifications:

User Requirements: {description}

{sections_section}
{formatting_section}
{style_section}
{citation_section}

Output Format: {output_format}
{title_section}

Original Content:
{text}

Return only the formatted {output_format} content without any explanations or commentary."""

        # Build conditional sections
        sections_section = f"Required Sections:\n{sections_str}" if sections_str else ""
        formatting_section = f"Formatting Requirements:\n{formatting_str}" if formatting_str else ""
        style_section = f"Style Guidelines: {style_guidelines}" if style_guidelines else ""
        citation_section = f"Citation Style: {citation_style}" if citation_style else ""
        title_section = f"Title: {title}" if title else ""
        
        return prompt_template.format(
            description=description,
            sections_section=sections_section,
            formatting_section=formatting_section,
            style_section=style_section,
            citation_section=citation_section,
            output_format=output_format.upper(),
            title_section=title_section,
            text=text
        )

    def _clean_ai_response(self, content, output_format=None):
        """
        Remove AI talk, explanations, and other conversational artifacts from the response.
        Additionally, extract the relevant content for latex, md, etc. based on output_format.
        """
        ai_patterns = [
            r"^\s*here is the formatted document.*?\n",
            r"^\s*i have formatted the paper as requested.*?\n",
            r"^\s*certainly, here is the formatted version.*?\n",
            r"^\s*of course, here is the document.*?\n",
            r"^\s*alright, i've formatted the paper.*?\n",
            r"^\s*here's the formatted version of your document.*?\n",
            r"i've applied the specified formatting.*?\n",
            r"the document now follows the.*?guidelines.*?\n",
            r"please note that i have made the following changes.*?\n",
            r"i have also taken the liberty of.*?\n",
            r"Okay,*?\n",
            r"i hope this meets your requirements.*?\n",
            r"let me know if you need any further adjustments.*?\n",
            r"if you have any other questions, feel free to ask.*?\n",
            r"^\s*```[a-zA-Z]*\n",
            r"\n```\s*$",
            r"^\s*sure, here.*?\n",
            r"^\s*absolutely, here.*?\n",
            r"^\s*no problem, here.*?\n",
        ]

        cleaned_content = content
        for pattern in ai_patterns:
            cleaned_content = re.sub(pattern, '', cleaned_content, flags=re.IGNORECASE | re.MULTILINE)
        cleaned_content = cleaned_content.strip()

        # Format-specific extraction
        if output_format:
            fmt = output_format.lower()
            if fmt == 'latex':
                # Ensure output starts with \documentclass
                match = re.search(r'(\\documentclass[\s\S]*?\\end{document})', cleaned_content, re.MULTILINE)
                if match:
                    return match.group(1).strip()
                idx = cleaned_content.find('\\documentclass')
                if idx != -1:
                    return cleaned_content[idx:].strip()
            elif fmt == 'md':
                # If markdown is inside triple backticks, extract it
                md_match = re.search(r'```(?:markdown)?\n([\s\S]*?)\n```', cleaned_content, re.IGNORECASE)
                if md_match:
                    md_content = md_match.group(1).strip()
                else:
                    md_content = cleaned_content
                # Ensure markdown starts with # (header)
                lines = md_content.lstrip().splitlines()
                for i, line in enumerate(lines):
                    if line.strip().startswith('#'):
                        return '\n'.join(lines[i:]).strip()
                # If no header found, return all
                return md_content.strip()
            elif fmt == 'docx':
                # For docx preview, start from first line with ** (heading)
                lines = cleaned_content.lstrip().splitlines()
                for i, line in enumerate(lines):
                    if line.strip().startswith('**'):
                        return '\n'.join(lines[i:]).strip()
                return cleaned_content
            elif fmt == 'pdf':
                # For pdf, just return the cleaned content
                return cleaned_content
        return cleaned_content

    def _format_response(self, formatted_content, output_format, title):
        """Format the response based on output format"""
        file_ext = output_format.lower()
        file_name = f"{title or 'formatted_paper'}.{file_ext}"
        content_types = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'latex': 'application/x-latex',
            'md': 'text/markdown',
        }
        content_type = content_types.get(file_ext, 'application/octet-stream')

        if file_ext in ['md', 'latex']:
            encoded = base64.b64encode(formatted_content.encode('utf-8')).decode('utf-8')
            return JsonResponse({
                'formatted_content': formatted_content,
                'file_name': file_name,
                'file_base64': encoded,
                'content_type': content_type
            })
        elif file_ext in ['pdf', 'docx']:
            # For binary formats, return both file and preview text, and a file_url for frontend download
            if isinstance(formatted_content, str):
                file_bytes = formatted_content.encode('utf-8')
            else:
                file_bytes = formatted_content
            encoded = base64.b64encode(file_bytes).decode('utf-8')
            # Serve the file as a temporary download URL (in-memory, not persistent)
            # For now, return a data URL for direct download
            file_url = f"data:{content_type};base64,{encoded}"
            return JsonResponse({
                'formatted_content': formatted_content,
                'file_name': file_name,
                'file_base64': encoded,
                'file_url': file_url,
                'content_type': content_type
            })
        else:
            # Default fallback: just return as file download
            if isinstance(formatted_content, str):
                file_bytes = formatted_content.encode('utf-8')
            else:
                file_bytes = formatted_content
            response = HttpResponse(file_bytes, content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response

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

        # User credit check and deduction
        user = request.user if request.user.is_authenticated else None
        if not user:
            return Response({'error': 'Authentication required to format papers.'}, status=401)
        credit_price = paper_format.credit_price
        if user.credits < credit_price:
            return Response({'error': f'Insufficient credits. Required: {credit_price}, Available: {user.credits}'}, status=402)
        user.credits -= credit_price
        user.total_credits_used += credit_price
        user.save()

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
            # Log the rendered system prompt for debugging
            logger.info(f"Rendered system prompt: {formatted_content}")
            # Remove AI explanations/thinking, keep only HTML
            formatted_content = extract_html_from_response(formatted_content)
        except Exception as e:
            return Response({'error': f'LLM formatting failed: {str(e)}'}, status=500)

        return Response({
            'formatted_content': formatted_content,
            'format': PaperFormatSerializer(paper_format).data
        })


