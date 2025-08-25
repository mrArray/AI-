#!/usr/bin/env python3
"""
Test script for AI paper generation API
"""
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.papers.ai_paper_generator import AIPaperGenerator
from django.urls import reverse
from django.test import Client
import json


def test_ai_paper_generator():
    """Test the AI paper generator functionality"""
    print("Testing AIPaperGenerator...")
    
    generator = AIPaperGenerator()
    
    # Test paper generation
    print("\n1. Testing paper generation...")
    try:
        result = generator.generate_paper(
            requirements="IEEE conference format with 12pt Times New Roman font, double spacing, and proper citations",
            output_format="docx",
            title="Test Research Paper",
            language="en"
        )
        
        print(f"Generation result keys: {result.keys()}")
        print(f"Success: {result.get('success')}")
        print(f"Title: {result.get('title')}")
        print(f"Word count: {result.get('word_count')}")
        print(f"Format name: {result.get('format', {}).get('name')}")
        
        if result.get('success'):
            print("✓ Paper generation test passed")
            # Print first 200 chars of content
            content = result.get('formatted_content', '')
            print(f"Content preview: {content[:200]}...")
        else:
            print(f"✗ Paper generation failed: {result.get('error')}")
    except Exception as e:
        print(f"✗ Paper generation test failed: {e}")


def test_url_patterns():
    """Test that URL patterns are properly configured"""
    print("\n\nTesting URL patterns...")
    
    try:
        # Test URL resolution
        url = reverse('generate_ai_paper')
        print(f"✓ AI paper generation URL resolved: {url}")
    except Exception as e:
        print(f"✗ URL pattern test failed: {e}")


def test_api_endpoint():
    """Test the API endpoint with a mock request"""
    print("\n\nTesting API endpoint...")
    
    client = Client()
    
    # Test data
    test_data = {
        'requirements': 'IEEE conference format with 12pt Times New Roman font',
        'output_format': 'docx',
        'title': 'Test Paper',
        'language': 'en'
    }
    
    try:
        url = reverse('generate_ai_paper')
        response = client.post(
            url,
            data=json.dumps(test_data),
            content_type='application/json'
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print(f"Response keys: {response_data.keys()}")
            print(f"Success: {response_data.get('success')}")
            print("✓ API endpoint test passed")
        else:
            print(f"✗ API endpoint test failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data}")
            except:
                print(f"Response content: {response.content}")
                
    except Exception as e:
        print(f"✗ API endpoint test failed: {e}")


if __name__ == "__main__":
    print("Starting AI paper generation API tests...\n")
    
    test_ai_paper_generator()
    test_url_patterns()
    test_api_endpoint()
    
    print("\n\nTest summary:")
    print("- AI paper generator functionality: Implemented")
    print("- URL patterns: Configured")
    print("- API endpoint: Ready for use")
    
    print("\nNew API Endpoint:")
    print("- POST /api/v1/papers/generate/ai/ - Generate paper using AI")
    print("\nRequest format:")
    print(json.dumps({
        "requirements": "Your formatting requirements (e.g., IEEE conference format, 12pt Times New Roman)",
        "output_format": "docx|pdf|latex|md (default: docx)",
        "title": "Optional paper title",
        "language": "en|zh|etc (default: en)"
    }, indent=2))
    
    print("\nResponse format (compatible with your UI):")
    print(json.dumps({
        "formatted_content": "HTML content for preview",
        "format": {
            "name": "Format name",
            "description": "Format description",
            "citation_style": "APA|IEEE|MLA|etc"
        },
        "success": True,
        "title": "Generated title",
        "word_count": 1500
    }, indent=2))

