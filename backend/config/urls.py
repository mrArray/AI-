from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

# Non-internationalized URLs
urlpatterns = [


    # 👇 Serve Swagger UI directly at root '/'
    path('', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/content/', include('apps.content.urls')),
    path('api/v1/papers/', include('apps.papers.urls')),
    path('api/v1/billing/', include('apps.billing.urls')),
    path('api/v1/llm/', include('apps.core.urls')),
    
    # Language switching
    path('i18n/', include('django.conf.urls.i18n')),
]

# Internationalized URLs
urlpatterns += i18n_patterns(
    # Admin with language support
    path('admin/', admin.site.urls),
    prefix_default_language=False,
)

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

