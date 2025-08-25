from django.urls import path
from . import views

urlpatterns = [
    # LLM Generation
    path('generate/', views.generate_content, name='generate_content'),
    path('stream/', views.stream_content, name='stream_content'),
    
    # Language Detection
    path('detect-language/', views.detect_language, name='detect_language'),
    
    # Configuration
    path('prompt-templates/', views.get_prompt_templates, name='get_prompt_templates'),
    path('providers/', views.get_llm_providers, name='get_llm_providers'),
    path('models/', views.get_llm_models, name='get_llm_models'),
]