from django.contrib import admin
from django.utils.html import format_html
from .models import (
    LandingPageSection, Testimonial, Feature, FAQ, LocalizationText
)


@admin.register(LandingPageSection)
class LandingPageSectionAdmin(admin.ModelAdmin):
    """Landing Page Section admin"""
    
    list_display = [
        'section_type', 'language', 'title', 'is_active', 
        'order', 'created_at'
    ]
    list_filter = ['section_type', 'language', 'is_active', 'created_at']
    search_fields = ['title', 'subtitle']
    ordering = ['order', 'section_type']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('section_type', 'language', 'title', 'subtitle')
        }),
        ('Content', {
            'fields': ('content',),
            'description': 'JSON content for flexible section data'
        }),
        ('Display Settings', {
            'fields': ('is_active', 'order')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    """Testimonial admin"""
    
    list_display = [
        'name', 'company', 'language', 'rating', 
        'is_featured', 'order', 'created_at'
    ]
    list_filter = ['language', 'rating', 'is_featured', 'created_at']
    search_fields = ['name', 'company', 'content']
    ordering = ['-is_featured', 'order']
    
    fieldsets = (
        ('Person Information', {
            'fields': ('name', 'role', 'company', 'avatar')
        }),
        ('Testimonial Content', {
            'fields': ('content', 'rating', 'language')
        }),
        ('Display Settings', {
            'fields': ('is_featured', 'order')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)
    
    actions = ['mark_as_featured', 'unmark_as_featured']
    
    def mark_as_featured(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f"Marked {count} testimonials as featured.")
    mark_as_featured.short_description = "Mark as featured"
    
    def unmark_as_featured(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f"Unmarked {count} testimonials as featured.")
    unmark_as_featured.short_description = "Unmark as featured"


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    """Feature admin"""
    
    list_display = [
        'title', 'language', 'icon', 'is_active', 
        'order', 'created_at'
    ]
    list_filter = ['language', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['order', 'title']
    
    fieldsets = (
        ('Feature Information', {
            'fields': ('title', 'description', 'icon', 'language')
        }),
        ('Display Settings', {
            'fields': ('is_active', 'order')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    """FAQ admin"""
    
    list_display = [
        'question', 'category', 'language', 'is_active', 
        'order', 'created_at'
    ]
    list_filter = ['category', 'language', 'is_active', 'created_at']
    search_fields = ['question', 'answer', 'category']
    ordering = ['category', 'order']
    
    fieldsets = (
        ('FAQ Content', {
            'fields': ('question', 'answer', 'category', 'language')
        }),
        ('Display Settings', {
            'fields': ('is_active', 'order')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)


@admin.register(LocalizationText)
class LocalizationTextAdmin(admin.ModelAdmin):
    """Localization Text admin"""
    
    list_display = [
        'key', 'language', 'category', 'text_preview', 'created_at'
    ]
    list_filter = ['language', 'category', 'created_at']
    search_fields = ['key', 'text', 'category']
    ordering = ['category', 'key', 'language']
    
    fieldsets = (
        ('Localization Information', {
            'fields': ('key', 'language', 'category')
        }),
        ('Content', {
            'fields': ('text',)
        }),
    )
    
    def text_preview(self, obj):
        """Show preview of text content"""
        if len(obj.text) > 50:
            return obj.text[:50] + "..."
        return obj.text
    text_preview.short_description = "Text Preview"
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_deleted=False)

