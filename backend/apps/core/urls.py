from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'providers', views.LLMProviderViewSet, basename='llmprovider')
router.register(r'models', views.LLMModelViewSet, basename='llmmodel')
router.register(r'prompt-templates', views.PromptTemplateViewSet, basename='prompttemplate')

urlpatterns = [
    # LLM Generation
    path('generate/', views.generate_content, name='generate_content'),
    path('stream/', views.stream_content, name='stream_content'),
    
    # Language Detection
    path('detect-language/', views.detect_language, name='detect_language'),
    
    # Configuration
    # path('prompt-templates/', views.get_prompt_templates, name='get_prompt_templates'),
    # path('providers/', views.get_llm_providers, name='get_llm_providers'),  # legacy, active only
    # path('models/', views.get_llm_models, name='get_llm_models'),
    # CRUD API
    path('', include(router.urls)),
]