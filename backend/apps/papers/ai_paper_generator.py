"""
AI Paper Generator for creating papers based on user requirements
Compatible with the Document Format Converter UI
"""
from typing import Dict, Any, Optional
from apps.core.llm_service import LLMManager, extract_html_from_response
from .models import PaperFormat


class AIPaperGenerator:
    """Generate papers using AI based on user requirements"""
    
    def __init__(self):
        self.llm_manager = LLMManager()
    
    def generate_paper(
        self,
        requirements: str,
        output_format: str = "docx",
        title: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generate a paper based on user requirements
        
        Args:
            requirements: User's formatting and content requirements
            output_format: Desired output format (docx, pdf, latex, md)
            title: Optional paper title
            language: Language preference
            
        Returns:
            Dictionary containing generated paper and metadata
        """
        try:
            # Determine paper title
            if not title:
                title = self._extract_title_from_requirements(requirements)
            
            # Create generation prompt
            generation_prompt = self._create_generation_prompt(
                requirements, output_format, title, language
            )
            
            # Generate paper content
            generated_content = self.llm_manager.generate_with_prompt(
                prompt_name="generate_ai_paper",
                user_input=generation_prompt,
                language=language
            )
            
            # Extract and format HTML content
            formatted_content = extract_html_from_response(generated_content)
            
            # Create format information
            format_info = self._create_format_info(output_format, requirements)
            
            return {
                'success': True,
                'formatted_content': formatted_content,
                'format': format_info,
                'title': title,
                'word_count': len(formatted_content.split()),
                'output_format': output_format,
                'language': language
            }
            
        except Exception as e:
            # Fallback to mock generator if LLM fails
            try:
                from .mock_generator import MockAIPaperGenerator
                mock_generator = MockAIPaperGenerator()
                return mock_generator.generate_paper(requirements, output_format, title, language)
            except Exception as mock_error:
                return {
                    'success': False,
                    'error': f"Paper generation failed: {str(e)}. Mock fallback also failed: {str(mock_error)}",
                    'formatted_content': '',
                    'format': self._create_format_info(output_format, requirements)
                }
    
    def _extract_title_from_requirements(self, requirements: str) -> str:
        """Extract or generate a title from requirements"""
        # Simple title extraction/generation
        lines = requirements.strip().split('\n')
        first_line = lines[0] if lines else ""
        
        # If first line looks like a title, use it
        if len(first_line) < 100 and not first_line.endswith('.'):
            return first_line.strip()
        
        # Generate a generic title
        if "ieee" in requirements.lower():
            return "IEEE Conference Paper"
        elif "apa" in requirements.lower():
            return "APA Format Research Paper"
        elif "mla" in requirements.lower():
            return "MLA Format Essay"
        elif "thesis" in requirements.lower():
            return "Academic Thesis"
        elif "research" in requirements.lower():
            return "Research Paper"
        else:
            return "Academic Document"
    
    def _create_generation_prompt(
        self,
        requirements: str,
        output_format: str,
        title: str,
        language: str
    ) -> str:
        """Create the prompt for paper generation"""
        
        format_instructions = {
            'docx': 'Microsoft Word document format with proper headings, paragraphs, and formatting',
            'pdf': 'PDF-ready format with proper page layout and typography',
            'latex': 'LaTeX format with appropriate document class and packages',
            'md': 'Markdown format with proper heading hierarchy and formatting'
        }
        
        format_instruction = format_instructions.get(output_format, format_instructions['docx'])
        
        prompt = f"""
You are an expert academic writer and formatter. Generate a complete, well-structured academic paper based on the following requirements:

Title: {title}
Output Format: {output_format.upper()} ({format_instruction})
Language: {language}

User Requirements:
{requirements}

Please generate a comprehensive academic paper that includes:

1. **Title Page/Header** - Properly formatted title and author information
2. **Abstract** - Concise summary of the paper (if appropriate for the format)
3. **Introduction** - Clear introduction to the topic
4. **Main Body** - Well-organized sections with appropriate headings
5. **Conclusion** - Comprehensive conclusion summarizing key points
6. **References** - Properly formatted citations and bibliography (sample references if needed)

Formatting Guidelines:
- Use proper academic formatting standards
- Include appropriate section headings
- Maintain consistent formatting throughout
- Use proper citation style (APA, MLA, IEEE, etc. as specified in requirements)
- Ensure the content is substantial and well-researched
- Format the output as clean HTML that can be easily converted to {output_format.upper()}

Generate a complete, publication-ready academic paper that meets all the specified requirements.
"""
        
        return prompt
    
    def _create_format_info(self, output_format: str, requirements: str) -> Dict[str, Any]:
        """Create format information for the response"""
        
        format_names = {
            'docx': 'Microsoft Word Document',
            'pdf': 'PDF Document',
            'latex': 'LaTeX Document',
            'md': 'Markdown Document'
        }
        
        # Try to determine citation style from requirements
        citation_style = 'APA'  # default
        if 'ieee' in requirements.lower():
            citation_style = 'IEEE'
        elif 'mla' in requirements.lower():
            citation_style = 'MLA'
        elif 'chicago' in requirements.lower():
            citation_style = 'Chicago'
        elif 'apa' in requirements.lower():
            citation_style = 'APA'
        
        return {
            'id': None,
            'name': f"AI Generated {format_names.get(output_format, 'Document')}",
            'description': f"AI-generated academic paper in {output_format.upper()} format based on user requirements",
            'language': 'en',
            'citation_style': citation_style,
            'template_structure': {
                'sections': [
                    {'name': 'Title Page', 'required': True, 'order': 1},
                    {'name': 'Abstract', 'required': False, 'order': 2},
                    {'name': 'Introduction', 'required': True, 'order': 3},
                    {'name': 'Main Body', 'required': True, 'order': 4},
                    {'name': 'Conclusion', 'required': True, 'order': 5},
                    {'name': 'References', 'required': True, 'order': 6}
                ],
                'formatting': {
                    'font_family': 'Times New Roman' if 'times' in requirements.lower() else 'Arial',
                    'font_size': '12pt',
                    'line_spacing': 'double' if 'double' in requirements.lower() else 'single',
                    'margins': '1 inch',
                    'citation_style': citation_style
                }
            },
            'style_guidelines': requirements[:200] + '...' if len(requirements) > 200 else requirements,
            'created_at': None,
            'updated_at': None
        }

