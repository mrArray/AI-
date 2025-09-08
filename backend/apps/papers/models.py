from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


class PaperFormat(BaseModel):
    """Different academic paper formats (APA, MLA, Chicago, etc.)"""
    
    FORMAT_CHOICES = [
        ('docx', 'DOCX'),
        ('pdf', 'PDF'),
        ('latex', 'LaTeX'),
        ('md', 'Markdown'),
    ]
    name = models.CharField(max_length=100, unique=True, choices=FORMAT_CHOICES)
    description = models.TextField()
    template_structure = models.JSONField(
        default=dict,
        help_text="JSON structure defining paper sections and requirements"
    )
    style_guidelines = models.TextField(blank=True, help_text="Formatting and style guidelines")
    credit_price = models.PositiveIntegerField(default=1, help_text="Credit cost to generate this paper format")
    citation_style = models.CharField(max_length=50, default='APA')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    language = models.CharField(max_length=10, default='en', help_text="Language code, e.g. 'en', 'zh'")  # <-- Modified line
    
    # AI Prompts
    prompt_template_en = models.TextField(
        blank=True, null=True,
        help_text="Prompt template for LLM in English. Use {name}, {description}, {sections}, {formatting}, {style_guidelines}, {citation_style}, {text} as variables."
    )
    prompt_template_zh = models.TextField(
        blank=True, null=True,
        help_text="Prompt template for LLM in Chinese. Use {name}, {description}, {sections}, {formatting}, {style_guidelines}, {citation_style}, {text} as variables."
    )
    
    class Meta:
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class PaperTemplate(BaseModel):
    """Specific paper templates for different types and languages"""
    
    PAPER_TYPES = [
        ('research', 'Research Paper'),
        ('essay', 'Essay'),
        ('thesis', 'Thesis'),
        ('dissertation', 'Dissertation'),
        ('report', 'Report'),
        ('proposal', 'Proposal'),
        ('review', 'Literature Review'),
    ]
    
    name = models.CharField(max_length=100)
    paper_type = models.CharField(max_length=20, choices=PAPER_TYPES)
    format = models.ForeignKey(PaperFormat, on_delete=models.CASCADE, related_name='templates')
    language = models.CharField(max_length=10, default='en')
    description = models.TextField()
    
    # AI Prompts
    system_prompt = models.TextField(help_text="System prompt for AI generation")
    user_prompt_template = models.TextField(help_text="Template for user prompt with placeholders")
    


# Move FormatCreditPrice to top-level
class FormatCreditPrice(models.Model):
    FORMAT_CHOICES = [
        ('docx', 'DOCX'),
        ('pdf', 'PDF'),
        ('latex', 'LaTeX'),
        ('md', 'Markdown'),
    ]

    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, unique=True)
    credit_price = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_format_display()} ({self.credit_price} credits)"


class GeneratedPaper(BaseModel):
    """History of generated papers"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_papers')
    template = models.ForeignKey(PaperTemplate, on_delete=models.CASCADE, related_name='generated_papers')
    
    # Paper details
    title = models.CharField(max_length=200)
    content = models.TextField()
    word_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    # Generation parameters
    user_inputs = models.JSONField(default=dict, help_text="User provided inputs")
    generation_parameters = models.JSONField(default=dict, help_text="AI generation parameters")
    
    # Status and metrics
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    credits_used = models.PositiveIntegerField(default=0)
    generation_time = models.DurationField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # File storage
    pdf_file = models.FileField(upload_to='generated_papers/pdf/', blank=True, null=True)
    docx_file = models.FileField(upload_to='generated_papers/docx/', blank=True, null=True)
    

    recovery_context = models.JSONField(
        null=True,
        blank=True,
        help_text="Context data for recovery if generation fails"
    )
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.user.email}"
    
    def calculate_word_count(self):
        """Calculate and update word count"""
        if self.content:
            self.word_count = len(self.content.split())
            self.save(update_fields=['word_count'])
        return self.word_count


class PaperSection(BaseModel):
    """Individual sections of a generated paper"""
    
    paper = models.ForeignKey(GeneratedPaper, on_delete=models.CASCADE, related_name='sections')
    section_name = models.CharField(max_length=100)
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)
    word_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        unique_together = ['paper', 'section_name']
    
    def __str__(self):
        return f"{self.paper.title} - {self.section_name}"


class PaperFeedback(BaseModel):
    """User feedback on generated papers"""
    
    paper = models.ForeignKey(GeneratedPaper, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    rating = models.PositiveIntegerField(help_text="Rating from 1 to 5")
    comment = models.TextField(blank=True)
    
    # Specific feedback categories
    content_quality = models.PositiveIntegerField(default=5)
    structure_quality = models.PositiveIntegerField(default=5)
    language_quality = models.PositiveIntegerField(default=5)
    
    is_helpful = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['paper', 'user']
    
    def __str__(self):
        return f"Feedback for {self.paper.title} by {self.user.email}"

