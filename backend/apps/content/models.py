from django.db import models
from apps.core.models import BaseModel


class LandingPageSection(BaseModel):
    """Admin-manageable landing page sections"""
    
    SECTION_TYPES = [
        ('hero', 'Hero Section'),
        ('features', 'Features Section'),
        ('testimonials', 'Testimonials Section'),
        ('cta', 'Call to Action Section'),
        ('interactive', 'Interactive Section'),
    ]
    
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES)
    language = models.CharField(max_length=10, default='en')
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True)
    content = models.JSONField(default=dict, help_text="Flexible content storage as JSON")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'section_type']
        unique_together = ['section_type', 'language']
    
    def __str__(self):
        return f"{self.get_section_type_display()} ({self.language})"


class Testimonial(BaseModel):
    """User testimonials for landing page"""
    
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    company = models.CharField(max_length=100, blank=True)
    content = models.TextField()
    avatar = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    rating = models.PositiveIntegerField(default=5, help_text="Rating out of 5")
    language = models.CharField(max_length=10, default='en')
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-is_featured', 'order', '-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.company}"


class Feature(BaseModel):
    """Product features for landing page"""
    
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Icon class or name")
    language = models.CharField(max_length=10, default='en')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'title']
    
    def __str__(self):
        return f"{self.title} ({self.language})"


class FAQ(BaseModel):
    """Frequently Asked Questions"""
    
    question = models.CharField(max_length=200)
    answer = models.TextField()
    language = models.CharField(max_length=10, default='en')
    category = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['category', 'order']
    
    def __str__(self):
        return f"{self.question} ({self.language})"


class LocalizationText(BaseModel):
    """Dynamic localization texts"""
    
    key = models.CharField(max_length=100, help_text="Translation key")
    language = models.CharField(max_length=10)
    text = models.TextField()
    category = models.CharField(max_length=50, default='general')
    is_active = models.BooleanField(default=True)

    
    class Meta:
        unique_together = ['key', 'language']
        ordering = ['category', 'key']
    
    def __str__(self):
        return f"{self.key} ({self.language})"

