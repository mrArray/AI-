from django.urls import path
from . import views

urlpatterns = [
    # Landing page content
    path('landing-page/', views.LandingPageDataView.as_view(), name='landing_page_data'),
    path('sections/', views.LandingPageSectionListView.as_view(), name='landing_sections'),
    path('testimonials/', views.TestimonialListView.as_view(), name='testimonials'),
    path('features/', views.FeatureListView.as_view(), name='features'),
    path('faqs/', views.FAQListView.as_view(), name='faqs'),
    
    # Localization
    path('localization/', views.LocalizationTextView.as_view(), name='localization_texts'),
    path('languages/', views.AvailableLanguagesView.as_view(), name='available_languages'),
    
    # Search
    path('search/', views.SearchContentView.as_view(), name='search_content'),
]