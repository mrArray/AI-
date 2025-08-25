from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from .models import (
    LandingPageSection, Testimonial, Feature, FAQ, LocalizationText
)
from .serializers import (
    LandingPageSectionSerializer, TestimonialSerializer, FeatureSerializer,
    FAQSerializer, LocalizationTextSerializer, LandingPageDataSerializer,
    SearchResponseSerializer, AvailableLanguageSerializer
)


class LandingPageSectionListView(generics.ListAPIView):
    """List landing page sections"""
    serializer_class = LandingPageSectionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        language = self.request.query_params.get('language', 'en')
        section_type = self.request.query_params.get('section_type')
        
        queryset = LandingPageSection.objects.filter(
            language=language,
            is_active=True,
            is_deleted=False
        ).order_by('order')
        
        if section_type:
            queryset = queryset.filter(section_type=section_type)
        
        return queryset
    
    @extend_schema(
        summary="Get landing page sections",
        description="Retrieve landing page sections by language and type",
        parameters=[
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (default: en)'
            ),
            OpenApiParameter(
                name='section_type',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Section type filter'
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TestimonialListView(generics.ListAPIView):
    """List testimonials"""
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        language = self.request.query_params.get('language', 'en')
        featured_only = self.request.query_params.get('featured', 'false').lower() == 'true'
        
        queryset = Testimonial.objects.filter(
            language=language,
            is_deleted=False
        ).order_by('-is_featured', 'order')
        
        if featured_only:
            queryset = queryset.filter(is_featured=True)
        
        return queryset
    
    @extend_schema(
        summary="Get testimonials",
        description="Retrieve testimonials by language",
        parameters=[
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (default: en)'
            ),
            OpenApiParameter(
                name='featured',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Show only featured testimonials'
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class FeatureListView(generics.ListAPIView):
    """List features"""
    serializer_class = FeatureSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        language = self.request.query_params.get('language', 'en')
        
        return Feature.objects.filter(
            language=language,
            is_active=True,
            is_deleted=False
        ).order_by('order')
    
    @extend_schema(
        summary="Get features",
        description="Retrieve product features by language",
        parameters=[
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (default: en)'
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class FAQListView(generics.ListAPIView):
    """List FAQs"""
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        language = self.request.query_params.get('language', 'en')
        category = self.request.query_params.get('category')
        
        queryset = FAQ.objects.filter(
            language=language,
            is_active=True,
            is_deleted=False
        ).order_by('category', 'order')
        
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset
    
    @extend_schema(
        summary="Get FAQs",
        description="Retrieve frequently asked questions by language and category",
        parameters=[
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (default: en)'
            ),
            OpenApiParameter(
                name='category',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='FAQ category filter'
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class LandingPageDataView(APIView):
    """Get complete landing page data"""
    permission_classes = [AllowAny]
    serializer_class = LandingPageDataSerializer
    
    @extend_schema(
        summary="Get complete landing page data",
        description="Retrieve all landing page content for a specific language",
        parameters=[
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (default: en)'
            ),
        ],
        responses={200: LandingPageDataSerializer}
    )
    def get(self, request):
        """Get complete landing page data"""
        language = request.query_params.get('language', 'en')
        
        # Get sections organized by type
        sections = LandingPageSection.objects.filter(
            language=language,
            is_active=True,
            is_deleted=False
        ).order_by('order')
        
        sections_by_type = {}
        for section in sections:
            sections_by_type[section.section_type] = LandingPageSectionSerializer(section).data
        
        # Get features
        features = Feature.objects.filter(
            language=language,
            is_active=True,
            is_deleted=False
        ).order_by('order')
        
        # Get testimonials
        testimonials = Testimonial.objects.filter(
            language=language,
            is_deleted=False
        ).order_by('-is_featured', 'order')[:6]  # Limit to 6 testimonials
        
        data = {
            'hero': sections_by_type.get('hero'),
            'features': FeatureSerializer(features, many=True).data,
            'testimonials': TestimonialSerializer(testimonials, many=True).data,
            'cta': sections_by_type.get('cta'),
            'interactive': sections_by_type.get('interactive'),
        }
        
        return Response(data)


class LocalizationTextView(APIView):
    """Get localization texts"""
    permission_classes = [AllowAny]
    serializer_class = None  # Custom response structure
    
    @extend_schema(
        summary="Get localization texts",
        description="Retrieve localization texts for a specific language and category",
        parameters=[
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (default: en)'
            ),
            OpenApiParameter(
                name='category',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Text category filter'
            ),
        ],
        responses={
            200: OpenApiResponse(
                description="Localization texts organized by category",
                response=OpenApiTypes.OBJECT
            )
        }
    )
    def get(self, request):
        """Get localization texts"""
        language = request.query_params.get('language', 'en')
        category = request.query_params.get('category')
        
        queryset = LocalizationText.objects.filter(
            language=language,
            is_deleted=False
        )
        
        if category:
            queryset = queryset.filter(category=category)
        
        texts = queryset.order_by('category', 'key')
        
        # Organize texts by category and key
        result = {}
        for text in texts:
            if text.category not in result:
                result[text.category] = {}
            result[text.category][text.key] = text.text
        
        return Response(result)


class SearchContentView(APIView):
    """Search across all content types"""
    permission_classes = [AllowAny]
    serializer_class = SearchResponseSerializer
    
    @extend_schema(
        summary="Search content",
        description="Search across all content types",
        parameters=[
            OpenApiParameter(
                name='q',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Search query',
                required=True
            ),
            OpenApiParameter(
                name='language',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Language code (default: en)'
            ),
        ],
        responses={200: SearchResponseSerializer}
    )
    def get(self, request):
        """Search across all content types"""
        query = request.query_params.get('q')
        language = request.query_params.get('language', 'en')
        
        if not query:
            return Response({
                'error': 'Search query is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Search in different content types
        results = {
            'sections': [],
            'features': [],
            'testimonials': [],
            'faqs': []
        }
        
        # Search sections
        sections = LandingPageSection.objects.filter(
            Q(title__icontains=query) | Q(subtitle__icontains=query),
            language=language,
            is_active=True,
            is_deleted=False
        )
        results['sections'] = LandingPageSectionSerializer(sections, many=True).data
        
        # Search features
        features = Feature.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query),
            language=language,
            is_active=True,
            is_deleted=False
        )
        results['features'] = FeatureSerializer(features, many=True).data
        
        # Search testimonials
        testimonials = Testimonial.objects.filter(
            Q(name__icontains=query) | Q(content__icontains=query) | Q(company__icontains=query),
            language=language,
            is_deleted=False
        )
        results['testimonials'] = TestimonialSerializer(testimonials, many=True).data
        
        # Search FAQs
        faqs = FAQ.objects.filter(
            Q(question__icontains=query) | Q(answer__icontains=query),
            language=language,
            is_active=True,
            is_deleted=False
        )
        results['faqs'] = FAQSerializer(faqs, many=True).data
        
        return Response(results)


class AvailableLanguagesView(APIView):
    """Get available languages"""
    permission_classes = [AllowAny]
    serializer_class = AvailableLanguageSerializer
    
    @extend_schema(
        summary="Get available languages",
        description="Get list of available languages for content",
        responses={200: AvailableLanguageSerializer(many=True)}
    )
    def get(self, request):
        """Get available languages"""
        # Get languages from different content types
        section_languages = LandingPageSection.objects.filter(
            is_active=True,
            is_deleted=False
        ).values_list('language', flat=True).distinct()
        
        feature_languages = Feature.objects.filter(
            is_active=True,
            is_deleted=False
        ).values_list('language', flat=True).distinct()
        
        testimonial_languages = Testimonial.objects.filter(
            is_deleted=False
        ).values_list('language', flat=True).distinct()
        
        # Combine and deduplicate
        all_languages = set(list(section_languages) + list(feature_languages) + list(testimonial_languages))
        
        # Language mapping
        language_names = {
            'en': 'English',
            'zh-CN': '简体中文',
            'zh-TW': '繁體中文',
            'ja': '日本語',
            'ko': '한국어',
            'ha': 'Hausa',
        }
        
        languages = [
            {
                'code': lang,
                'name': language_names.get(lang, lang)
            }
            for lang in sorted(all_languages)
        ]
        
        return Response(languages)