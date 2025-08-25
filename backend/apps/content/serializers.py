from rest_framework import serializers
from .models import (
    LandingPageSection, Testimonial, Feature, FAQ, LocalizationText
)


class LandingPageSectionSerializer(serializers.ModelSerializer):
    """Serializer for landing page sections"""
    
    class Meta:
        model = LandingPageSection
        fields = [
            'id', 'section_type', 'language', 'title', 'subtitle',
            'content', 'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TestimonialSerializer(serializers.ModelSerializer):
    """Serializer for testimonials"""
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'name', 'role', 'company', 'content', 'avatar',
            'rating', 'language', 'is_featured', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FeatureSerializer(serializers.ModelSerializer):
    """Serializer for features"""
    
    class Meta:
        model = Feature
        fields = [
            'id', 'title', 'description', 'icon', 'language',
            'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FAQSerializer(serializers.ModelSerializer):
    """Serializer for FAQs"""
    
    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'answer', 'language', 'category',
            'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LocalizationTextSerializer(serializers.ModelSerializer):
    """Serializer for localization texts"""
    
    class Meta:
        model = LocalizationText
        fields = [
            'id', 'key', 'language', 'text', 'category',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LandingPageDataSerializer(serializers.Serializer):
    """Serializer for complete landing page data"""
    hero = LandingPageSectionSerializer(required=False, allow_null=True)
    features = FeatureSerializer(many=True)
    testimonials = TestimonialSerializer(many=True)
    cta = LandingPageSectionSerializer(required=False, allow_null=True)
    interactive = LandingPageSectionSerializer(required=False, allow_null=True)


class SearchResponseSerializer(serializers.Serializer):
    """Serializer for search results"""
    sections = LandingPageSectionSerializer(many=True)
    features = FeatureSerializer(many=True)
    testimonials = TestimonialSerializer(many=True)
    faqs = FAQSerializer(many=True)


class AvailableLanguageSerializer(serializers.Serializer):
    """Serializer for available languages"""
    code = serializers.CharField()
    name = serializers.CharField()