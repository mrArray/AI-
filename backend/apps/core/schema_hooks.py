"""
Schema hooks for customizing OpenAPI documentation
"""

def custom_preprocessing_hook(endpoints):
    """
    Custom preprocessing hook for OpenAPI schema generation
    """
    # Add custom tags and organize endpoints
    for path, path_regex, method, callback in endpoints:
        # Add custom tags based on URL patterns
        if path.startswith('/api/v1/auth/'):
            callback.cls.tags = ['Authentication']
        elif path.startswith('/api/v1/content/'):
            callback.cls.tags = ['Content Management']
        elif path.startswith('/api/v1/papers/'):
            callback.cls.tags = ['Paper Management']
        elif path.startswith('/api/v1/billing/'):
            callback.cls.tags = ['Billing & Payments']
    
    return endpoints


def custom_postprocessing_hook(result, generator, request, public):
    """
    Custom postprocessing hook for OpenAPI schema
    """
    # Add custom schema information
    result['info']['contact'] = {
        'name': 'Academic Paper Generator API Support',
        'email': 'api-support@academicpapers.com',
        'url': 'https://academicpapers.com/support'
    }
    
    result['info']['license'] = {
        'name': 'Proprietary',
        'url': 'https://academicpapers.com/license'
    }
    
    # Add servers information
    result['servers'] = [
        {
            'url': 'https://api.academicpapers.com/api/v1',
            'description': 'Production server'
        },
        {
            'url': 'https://staging-api.academicpapers.com/api/v1',
            'description': 'Staging server'
        },
        {
            'url': 'http://localhost:8000/api/v1',
            'description': 'Development server'
        }
    ]
    
    # Add security schemes
    result['components']['securitySchemes'] = {
        'BearerAuth': {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
            'description': 'JWT token obtained from login endpoint'
        }
    }
    
    # Add global security requirement
    result['security'] = [{'BearerAuth': []}]
    
    # Add custom response schemas
    if 'components' not in result:
        result['components'] = {}
    
    if 'schemas' not in result['components']:
        result['components']['schemas'] = {}
    
    # Add common error response schemas
    result['components']['schemas']['ErrorResponse'] = {
        'type': 'object',
        'properties': {
            'error': {
                'type': 'string',
                'description': 'Error message'
            },
            'details': {
                'type': 'object',
                'description': 'Detailed error information'
            },
            'code': {
                'type': 'string',
                'description': 'Error code'
            }
        },
        'required': ['error']
    }
    
    result['components']['schemas']['ValidationError'] = {
        'type': 'object',
        'properties': {
            'field_name': {
                'type': 'array',
                'items': {'type': 'string'},
                'description': 'Field-specific error messages'
            }
        }
    }
    
    result['components']['schemas']['PaginatedResponse'] = {
        'type': 'object',
        'properties': {
            'count': {
                'type': 'integer',
                'description': 'Total number of items'
            },
            'next': {
                'type': 'string',
                'nullable': True,
                'description': 'URL for next page'
            },
            'previous': {
                'type': 'string',
                'nullable': True,
                'description': 'URL for previous page'
            },
            'results': {
                'type': 'array',
                'items': {},
                'description': 'Array of result items'
            }
        },
        'required': ['count', 'results']
    }
    
    return result

