import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from apps.core.llm_service import LLMService
import requests
import logging
logging.getLogger('apps.core').setLevel(logging.DEBUG)

def test_ollama():
    print("\n=== Ollama Debugging ===")
    
    # 1. Direct connection test
    try:
        print("Testing base API connection...")
        response = requests.get("http://localhost:11434/api/tags", timeout=3)
        if response.status_code == 200:
            print("✅ /api/tags works")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"🚫 Connection failed: {str(e)}")
        return

    # 2. Test old chat endpoint
    try:
        print("\nTesting old /api/chat endpoint...")
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={"model": "deepseek-r1:7b", "messages": [{"role": "user", "content": "test"}]},
            timeout=5
        )
        print(f"🔌 Response status: {response.status_code}")
        print(f"📝 Response text: {response.text[:100]}...")
    except Exception as e:
        print(f"🔴 /api/chat error: {str(e)}")
    
    # 3. Test new chat completions endpoint
    try:
        print("\nTesting new /v1/chat/completions endpoint...")
        response = requests.post(
            "http://localhost:11434/v1/chat/completions",
            json={
                "model": "deepseek-r1:7b",
                "messages": [{"role": "user", "content": "test"}],
                "stream": False
            },
            timeout=5
        )
        print(f"🟢 Response status: {response.status_code}")
        print(f"📝 Response text: {response.text[:100]}...")
    except Exception as e:
        print(f"🔴 /v1/chat/completions error: {str(e)}")
    
    # 4. Test through Django's service
    print("\nTesting Django LLMService...")
    try:
        llm = LLMService()
        endpoint = llm._get_endpoint_url()
        print(f"🔧 Using endpoint: {endpoint}")
        
        messages = [{"role": "user", "content": "Hello"}]
        response = llm.generate_response(messages)
        print(f"✅ Django response: {response[:50]}...")
    except Exception as e:
        print(f"🔴 Django service error: {str(e)}")
def test_ollama_response():
    """Test raw response from Ollama"""
    url = "http://localhost:11434/v1/chat/completions"
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "deepseek-r1:7b",
        "messages": [{"role": "user", "content": "Say 'TEST_OK'"}],
        "stream": False
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {response.headers}")
        print(f"Response Text: {response.text[:500]}")
        
        if response.text.strip() == "":
            print("⚠️ EMPTY RESPONSE RECEIVED")
            
        try:
            print("JSON Response:", response.json())
        except Exception as e:
            print(f"JSON Parsing Error: {str(e)}")
            
    except Exception as e:
        print(f"Request failed: {str(e)}")


test_ollama_response()
test_ollama()