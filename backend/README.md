# Academic Paper Tool -  Backend

## Overview

This is a completely  Django backend for the Academic Paper Generator application, built following Django best practices and modern API design principles. The application provides comprehensive functionality for generating academic papers using AI technology with support for multiple formats, templates, and languages.

## Key Features

### 🏗️ Architecture Improvements
- **Modular App Structure**: Organized into focused Django apps (users, content, papers, billing, core)
- **Django Best Practices**: Follows Django conventions and patterns
- **Clean Code Architecture**: Separation of concerns with dedicated services and utilities
- **Comprehensive Admin Interface**: Full admin panel for content management

### 📝 Paper Generation System
- **Multiple Academic Formats**: APA, MLA, Chicago, IEEE styles with proper formatting
- **Template System**: Flexible template engine with customizable prompts
- **AI Integration**: OpenAI GPT integration for content generation
- **Format Validation**: Automatic validation of paper structure and requirements
- **Export Options**: PDF, DOCX, and LaTeX export capabilities

### 🌐 Dynamic Content Management
- **Admin-Manageable Content**: Landing page sections, testimonials, features, FAQs
- **Multi-language Support**: Comprehensive localization system
- **Dynamic Templates**: Template management through admin interface
- **Content Versioning**: Track changes and maintain content history

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Account Security**: Failed login protection, account lockout
- **Email Verification**: Secure email verification system
- **Password Security**: Strong password requirements and secure storage

### 💳 Billing & Payment System
- **Credit System**: Flexible credit-based payment model
- **Package Management**: Multiple credit packages with features
- **Transaction Tracking**: Comprehensive transaction history
- **Subscription Support**: Monthly subscription plans

### 📚 API Documentation
- **Swagger UI**: Complete interactive API documentation
- **OpenAPI Schema**: Comprehensive API schema with examples
- **Field Documentation**: Detailed field descriptions and validation rules
- **Error Handling**: Standardized error responses and codes

## Project Structure

```
backend/
├── config/                 # Django project configuration
│   ├── settings.py        # Main settings with environment configuration
│   ├── urls.py           # Main URL routing
│   └── wsgi.py           # WSGI configuration
├── apps/                  # Django applications
│   ├── users/            # User management and authentication
│   ├── content/          # Dynamic content management
│   ├── papers/           # Paper generation and templates
│   ├── billing/          # Payment and billing system
│   └── core/             # Shared utilities and base models
├── requirements.txt       # Python dependencies
├── .env.example          # Environment configuration template
└── API_DOCUMENTATION.md  # Comprehensive API documentation
```

## Installation & Setup

### 1. Environment Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: SECRET_KEY, DATABASE_URL, OPENAI_API_KEY
```

### 3. Database Setup
```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Initialize paper formats and templates
python manage.py init_paper_data
```

### 4. Run Development Server
```bash
python manage.py runserver 0.0.0.0:8000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `GET /api/v1/auth/profile/` - Get user profile
- `PATCH /api/v1/auth/profile/` - Update user profile

### Content Management
- `GET /api/v1/content/landing-page/` - Get landing page data
- `GET /api/v1/content/testimonials/` - Get testimonials
- `GET /api/v1/content/features/` - Get features
- `GET /api/v1/content/faqs/` - Get FAQs
- `GET /api/v1/content/localization/` - Get localization texts

### Paper Management
- `GET /api/v1/papers/formats/` - Get paper formats
- `GET /api/v1/papers/templates/` - Get paper templates
- `POST /api/v1/papers/generate/` - Generate paper
- `POST /api/v1/papers/validate/` - Validate paper content
- `GET /api/v1/papers/history/` - Get user's papers

### Billing & Payments
- `GET /api/v1/billing/packages/` - Get credit packages
- `POST /api/v1/billing/purchase/` - Purchase credits
- `GET /api/v1/billing/transactions/` - Get transaction history
- `GET /api/v1/billing/info/` - Get billing information

### Documentation
- `/api/docs/` - Swagger UI documentation
- `/api/redoc/` - ReDoc documentation
- `/api/schema/` - OpenAPI schema

## Admin Interface

Access the Django admin at `/admin/` with superuser credentials.

### Available Admin Modules
- **Users**: User management, profiles, permissions
- **Content**: Landing page sections, testimonials, features, FAQs
- **Papers**: Formats, templates, generated papers, feedback
- **Billing**: Packages, transactions, subscriptions, payment methods

## Key Improvements from Original

### 1. Architecture
- **Before**: Monolithic structure with mixed concerns
- **After**: Modular Django apps with clear separation of concerns

### 2. Models
- **Before**: Basic user and document models
- **After**: Comprehensive models for all business entities with relationships

### 3. API Design
- **Before**: Basic CRUD operations
- **After**: RESTful APIs with proper serialization, validation, and documentation

### 4. Content Management
- **Before**: Static frontend content
- **After**: Dynamic admin-manageable content with multi-language support

### 5. Paper Generation
- **Before**: Simple document generation
- **After**: Comprehensive paper generation system with formats, templates, and validation

### 6. Documentation
- **Before**: Minimal API documentation
- **After**: Complete Swagger UI with detailed field and endpoint documentation

## Environment Variables

### Required
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: Database connection string
- `OPENAI_API_KEY`: OpenAI API key for paper generation

### Optional
- `DEBUG`: Debug mode (default: False)
- `ALLOWED_HOSTS`: Allowed hosts (default: localhost)
- `REDIS_URL`: Redis connection for caching
- `EMAIL_*`: Email configuration for notifications
- `STRIPE_*`: Stripe configuration for payments

## Testing

```bash
# Run tests
python manage.py test

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

## Deployment

### Production Settings
1. Set `DEBUG=False` in environment
2. Configure proper database (PostgreSQL recommended)
3. Set up Redis for caching and sessions
4. Configure email backend for notifications
5. Set up static file serving (WhiteNoise included)

### Docker Deployment
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Configuration**: Proper cross-origin request handling
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Protection**: Django ORM prevents SQL injection
- **XSS Protection**: Built-in XSS protection mechanisms

## Performance Optimizations

- **Database Optimization**: Proper indexing and query optimization
- **Caching**: Redis caching for frequently accessed data
- **Pagination**: Efficient pagination for large datasets
- **Select Related**: Optimized database queries with select_related
- **Static Files**: Efficient static file serving with WhiteNoise

## Monitoring & Logging

- **Sentry Integration**: Error tracking and monitoring
- **Django Logging**: Comprehensive logging configuration
- **Health Checks**: System health monitoring endpoints
- **Performance Metrics**: Request/response time tracking

## Contributing

1. Follow Django coding standards
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Use proper commit messages and PR descriptions

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or questions about the API, please contact the development team or refer to the comprehensive API documentation at `/api/docs/`.

---

**Note**: This backend provides a solid foundation for the Academic Paper Generator application with modern Django practices, comprehensive API documentation, and scalable architecture. The system is designed to handle production workloads while maintaining code quality and developer experience.

