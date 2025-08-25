from .views import AIPaperFormatView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import PaperFormatWithLLMView, TemplateSearchView, FeaturedTemplatesView, RecommendedTemplatesView

router = DefaultRouter()
router.register(r'templates', views.PaperTemplateViewSet, basename='paper-templates')
router.register(r'feedback', views.PaperFeedbackViewSet, basename='paper-feedback')

urlpatterns = [
    # Paper formats
    path('formats/', views.PaperFormatListView.as_view(), name='paper_formats'),
    path('formats/<int:pk>/', views.PaperFormatDetailView.as_view(), name='paper_format_detail'),
    
    # Templates
    path('templates/search/', TemplateSearchView.as_view(), name='search_templates'),
    path('templates/featured/', FeaturedTemplatesView.as_view(), name='featured_templates'),
    path('templates/recommended/', RecommendedTemplatesView.as_view(), name='recommended_templates'),
    
    # Paper generation
    path('generate/', views.generate_paper, name='generate_paper'),
    path('generate/stream/', views.generate_paper_stream, name='generate_paper_stream'),
    path('validate/', views.validate_paper, name='validate_paper'),
    path('export/', views.export_paper, name='export_paper'),
    
    # Generated papers
    path('history/', views.GeneratedPaperListView.as_view(), name='paper_history'),
    path('<int:pk>/', views.GeneratedPaperDetailView.as_view(), name='paper_detail'),
    
    # Router URLs
    path('', include(router.urls)),
    path('formats/format/', PaperFormatWithLLMView.as_view(), name='format_with_llm'),
        
    # New: AI Paper Format for HomePage integration
    path('ai-format/', AIPaperFormatView.as_view(), name='ai_paper_format'),
]

