"""
Paper Format Service

This module handles paper format operations and structure management.
"""

from typing import Dict, List, Any, Optional
from apps.papers.models import PaperFormat, PaperTemplate


class PaperFormatService:
    """Service for managing paper formats and their structures"""
    
    # Standard academic paper formats
    STANDARD_FORMATS = {
        'apa': {
            'name': 'APA Style',
            'description': 'American Psychological Association style for psychology and social sciences',
            'citation_style': 'APA',
            'template_structure': {
                'sections': [
                    {'name': 'Title Page', 'required': True, 'order': 1},
                    {'name': 'Abstract', 'required': True, 'order': 2},
                    {'name': 'Introduction', 'required': True, 'order': 3},
                    {'name': 'Literature Review', 'required': False, 'order': 4},
                    {'name': 'Methodology', 'required': True, 'order': 5},
                    {'name': 'Results', 'required': True, 'order': 6},
                    {'name': 'Discussion', 'required': True, 'order': 7},
                    {'name': 'Conclusion', 'required': True, 'order': 8},
                    {'name': 'References', 'required': True, 'order': 9},
                    {'name': 'Appendices', 'required': False, 'order': 10}
                ],
                'formatting': {
                    'font': 'Times New Roman',
                    'font_size': 12,
                    'line_spacing': 'double',
                    'margins': '1 inch',
                    'page_numbers': 'top right'
                }
            },
            'style_guidelines': '''
APA Style Guidelines:
- Use 12-point Times New Roman font
- Double-space throughout the paper
- 1-inch margins on all sides
- Page numbers in the top right corner
- In-text citations: (Author, Year)
- Reference list in alphabetical order
- Headings: Level 1 (Centered, Bold), Level 2 (Flush Left, Bold)
            '''
        },
        'mla': {
            'name': 'MLA Style',
            'description': 'Modern Language Association style for literature and humanities',
            'citation_style': 'MLA',
            'template_structure': {
                'sections': [
                    {'name': 'Header', 'required': True, 'order': 1},
                    {'name': 'Introduction', 'required': True, 'order': 2},
                    {'name': 'Body Paragraphs', 'required': True, 'order': 3},
                    {'name': 'Conclusion', 'required': True, 'order': 4},
                    {'name': 'Works Cited', 'required': True, 'order': 5}
                ],
                'formatting': {
                    'font': 'Times New Roman',
                    'font_size': 12,
                    'line_spacing': 'double',
                    'margins': '1 inch',
                    'page_numbers': 'top right with last name'
                }
            },
            'style_guidelines': '''
MLA Style Guidelines:
- Use 12-point Times New Roman font
- Double-space throughout the paper
- 1-inch margins on all sides
- Last name and page number in top right corner
- In-text citations: (Author Page#)
- Works Cited page in alphabetical order
- No title page required
            '''
        },
        'chicago': {
            'name': 'Chicago Style',
            'description': 'Chicago Manual of Style for history and literature',
            'citation_style': 'Chicago',
            'template_structure': {
                'sections': [
                    {'name': 'Title Page', 'required': True, 'order': 1},
                    {'name': 'Introduction', 'required': True, 'order': 2},
                    {'name': 'Body', 'required': True, 'order': 3},
                    {'name': 'Conclusion', 'required': True, 'order': 4},
                    {'name': 'Bibliography', 'required': True, 'order': 5}
                ],
                'formatting': {
                    'font': 'Times New Roman',
                    'font_size': 12,
                    'line_spacing': 'double',
                    'margins': '1 inch',
                    'page_numbers': 'top right or bottom center'
                }
            },
            'style_guidelines': '''
Chicago Style Guidelines:
- Use 12-point Times New Roman font
- Double-space throughout the paper
- 1-inch margins on all sides
- Page numbers in top right or bottom center
- Footnotes or endnotes for citations
- Bibliography in alphabetical order
- Title page with paper title, author, course, and date
            '''
        },
        'ieee': {
            'name': 'IEEE Style',
            'description': 'Institute of Electrical and Electronics Engineers style for engineering and technology',
            'citation_style': 'IEEE',
            'template_structure': {
                'sections': [
                    {'name': 'Title', 'required': True, 'order': 1},
                    {'name': 'Abstract', 'required': True, 'order': 2},
                    {'name': 'Keywords', 'required': True, 'order': 3},
                    {'name': 'Introduction', 'required': True, 'order': 4},
                    {'name': 'Related Work', 'required': False, 'order': 5},
                    {'name': 'Methodology', 'required': True, 'order': 6},
                    {'name': 'Results', 'required': True, 'order': 7},
                    {'name': 'Discussion', 'required': True, 'order': 8},
                    {'name': 'Conclusion', 'required': True, 'order': 9},
                    {'name': 'References', 'required': True, 'order': 10}
                ],
                'formatting': {
                    'font': 'Times New Roman',
                    'font_size': 10,
                    'line_spacing': 'single',
                    'margins': '0.75 inch',
                    'columns': 'two-column'
                }
            },
            'style_guidelines': '''
IEEE Style Guidelines:
- Use 10-point Times New Roman font
- Single-space throughout the paper
- Two-column format
- 0.75-inch margins
- Numbered citations [1], [2], etc.
- References in order of appearance
- Section headings in Roman numerals
            '''
        }
    }
    
    @staticmethod
    def create_standard_formats():
        """Create standard paper formats in the database"""
        created_formats = []
        
        for format_key, format_data in PaperFormatService.STANDARD_FORMATS.items():
            format_obj, created = PaperFormat.objects.get_or_create(
                name=format_data['name'],
                defaults={
                    'description': format_data['description'],
                    'citation_style': format_data['citation_style'],
                    'template_structure': format_data['template_structure'],
                    'style_guidelines': format_data['style_guidelines'],
                    'is_active': True
                }
            )
            
            if created:
                created_formats.append(format_obj)
        
        return created_formats
    
    @staticmethod
    def get_format_by_citation_style(citation_style: str) -> Optional[PaperFormat]:
        """Get paper format by citation style"""
        try:
            return PaperFormat.objects.get(
                citation_style=citation_style,
                is_active=True,
                is_deleted=False
            )
        except PaperFormat.DoesNotExist:
            return None
    
    @staticmethod
    def validate_format_structure(structure: Dict[str, Any]) -> List[str]:
        """Validate paper format structure"""
        errors = []
        
        if not isinstance(structure, dict):
            errors.append("Structure must be a dictionary")
            return errors
        
        # Validate sections
        if 'sections' not in structure:
            errors.append("Structure must contain 'sections' key")
        elif not isinstance(structure['sections'], list):
            errors.append("Sections must be a list")
        else:
            for i, section in enumerate(structure['sections']):
                if not isinstance(section, dict):
                    errors.append(f"Section {i} must be a dictionary")
                    continue
                
                if 'name' not in section:
                    errors.append(f"Section {i} must have a 'name' field")
                
                if 'order' not in section:
                    errors.append(f"Section {i} must have an 'order' field")
                elif not isinstance(section['order'], int):
                    errors.append(f"Section {i} order must be an integer")
        
        # Validate formatting if present
        if 'formatting' in structure:
            formatting = structure['formatting']
            if not isinstance(formatting, dict):
                errors.append("Formatting must be a dictionary")
        
        return errors
    
    @staticmethod
    def get_section_requirements(format_obj: PaperFormat) -> Dict[str, Any]:
        """Get section requirements for a paper format"""
        if not format_obj.template_structure:
            return {}
        
        sections = format_obj.template_structure.get('sections', [])
        
        return {
            'required_sections': [s['name'] for s in sections if s.get('required', False)],
            'optional_sections': [s['name'] for s in sections if not s.get('required', False)],
            'section_order': {s['name']: s['order'] for s in sections},
            'total_sections': len(sections)
        }
    
    @staticmethod
    def generate_section_prompts(format_obj: PaperFormat, paper_topic: str) -> Dict[str, str]:
        """Generate section-specific prompts for a paper format"""
        if not format_obj.template_structure:
            return {}
        
        sections = format_obj.template_structure.get('sections', [])
        prompts = {}
        
        section_prompts = {
            'Title Page': f"Create a title page for a {format_obj.citation_style} style paper on '{paper_topic}'. Include appropriate formatting and required elements.",
            'Abstract': f"Write an abstract for a research paper on '{paper_topic}' following {format_obj.citation_style} style guidelines. Keep it concise and informative.",
            'Introduction': f"Write an introduction section for a paper on '{paper_topic}'. Provide background, context, and clearly state the research question or thesis.",
            'Literature Review': f"Write a literature review section for '{paper_topic}'. Summarize relevant existing research and identify gaps.",
            'Methodology': f"Write a methodology section for a research paper on '{paper_topic}'. Describe the research approach, methods, and procedures.",
            'Results': f"Write a results section for a research paper on '{paper_topic}'. Present findings clearly and objectively.",
            'Discussion': f"Write a discussion section for a research paper on '{paper_topic}'. Interpret results, discuss implications, and address limitations.",
            'Conclusion': f"Write a conclusion section for a paper on '{paper_topic}'. Summarize key findings and suggest future research directions.",
            'References': f"Create a reference list for a {format_obj.citation_style} style paper on '{paper_topic}'. Include relevant academic sources.",
            'Bibliography': f"Create a bibliography for a {format_obj.citation_style} style paper on '{paper_topic}'. Include relevant academic sources."
        }
        
        for section in sections:
            section_name = section['name']
            if section_name in section_prompts:
                prompts[section_name] = section_prompts[section_name]
            else:
                prompts[section_name] = f"Write the {section_name} section for a paper on '{paper_topic}' following {format_obj.citation_style} style guidelines."
        
        return prompts


class FormatTemplateGenerator:
    """Generator for creating templates based on paper formats"""
    
    @staticmethod
    def create_templates_for_format(format_obj: PaperFormat, languages: List[str] = None) -> List[PaperTemplate]:
        """Create standard templates for a paper format"""
        
        if languages is None:
            languages = ['en']
        
        paper_types = ['research', 'essay', 'thesis', 'report', 'proposal']
        created_templates = []
        
        for paper_type in paper_types:
            for language in languages:
                template_name = f"{format_obj.name} {paper_type.title()} Paper"
                
                # Check if template already exists
                if PaperTemplate.objects.filter(
                    name=template_name,
                    paper_type=paper_type,
                    format=format_obj,
                    language=language
                ).exists():
                    continue
                
                # Generate prompts
                system_prompt = FormatTemplateGenerator._generate_system_prompt(format_obj, paper_type)
                user_prompt_template = FormatTemplateGenerator._generate_user_prompt_template(format_obj, paper_type)
                required_fields = FormatTemplateGenerator._generate_required_fields(paper_type)
                
                template = PaperTemplate.objects.create(
                    name=template_name,
                    paper_type=paper_type,
                    format=format_obj,
                    language=language,
                    description=f"Generate a {paper_type} paper following {format_obj.name} formatting guidelines",
                    system_prompt=system_prompt,
                    user_prompt_template=user_prompt_template,
                    required_fields=required_fields,
                    estimated_credits=5,
                    is_active=True
                )
                
                created_templates.append(template)
        
        return created_templates
    
    @staticmethod
    def _generate_system_prompt(format_obj: PaperFormat, paper_type: str) -> str:
        """Generate system prompt for a template"""
        return f"""You are an expert academic writer specializing in {format_obj.name} style papers. 

Your task is to generate a high-quality {paper_type} paper that follows {format_obj.citation_style} formatting guidelines.

Key requirements:
- Follow {format_obj.name} style guidelines strictly
- Use proper academic language and tone
- Include appropriate citations and references
- Structure the paper according to standard {paper_type} format
- Ensure logical flow and coherent arguments

Style Guidelines:
{format_obj.style_guidelines}

Paper Structure:
{format_obj.template_structure}

Generate a complete, well-structured academic paper that meets all requirements."""
    
    @staticmethod
    def _generate_user_prompt_template(format_obj: PaperFormat, paper_type: str) -> str:
        """Generate user prompt template for a template"""
        return f"""Please generate a {paper_type} paper with the following specifications:

Topic: {{topic}}
Length: {{length}} words (approximately)
Academic Level: {{academic_level}}
Subject Area: {{subject_area}}

Additional Requirements:
{{additional_requirements}}

Please ensure the paper:
1. Follows {format_obj.name} formatting guidelines
2. Includes proper citations and references
3. Has a clear thesis statement and logical structure
4. Uses appropriate academic language
5. Meets the specified length requirement

Generate a complete paper with all necessary sections."""
    
    @staticmethod
    def _generate_required_fields(paper_type: str) -> List[Dict[str, Any]]:
        """Generate required fields for a template"""
        base_fields = [
            {
                'name': 'topic',
                'type': 'text',
                'label': 'Paper Topic',
                'placeholder': 'Enter the main topic or research question',
                'required': True,
                'min_length': 10,
                'max_length': 200
            },
            {
                'name': 'length',
                'type': 'number',
                'label': 'Paper Length (words)',
                'placeholder': '1500',
                'required': True,
                'min_value': 500,
                'max_value': 10000
            },
            {
                'name': 'academic_level',
                'type': 'select',
                'label': 'Academic Level',
                'options': ['High School', 'Undergraduate', 'Graduate', 'PhD'],
                'required': True
            },
            {
                'name': 'subject_area',
                'type': 'text',
                'label': 'Subject Area',
                'placeholder': 'e.g., Psychology, History, Computer Science',
                'required': True,
                'max_length': 100
            }
        ]
        
        # Add paper-type specific fields
        if paper_type == 'research':
            base_fields.append({
                'name': 'research_question',
                'type': 'textarea',
                'label': 'Research Question',
                'placeholder': 'What specific question does your research address?',
                'required': True,
                'max_length': 500
            })
        elif paper_type == 'thesis':
            base_fields.append({
                'name': 'thesis_statement',
                'type': 'textarea',
                'label': 'Thesis Statement',
                'placeholder': 'Your main argument or position',
                'required': True,
                'max_length': 300
            })
        
        base_fields.append({
            'name': 'additional_requirements',
            'type': 'textarea',
            'label': 'Additional Requirements',
            'placeholder': 'Any specific requirements, sources to include, or special instructions',
            'required': False,
            'max_length': 1000
        })
        
        return base_fields

