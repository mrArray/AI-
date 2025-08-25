"""
Mock AI Paper Generator for testing when LLM service is not available
"""
from typing import Dict, Any, Optional
import random


class MockAIPaperGenerator:
    """Mock generator that creates sample papers for testing"""
    
    def generate_paper(
        self,
        requirements: str,
        output_format: str = "docx",
        title: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generate a mock paper for testing
        """
        # Determine paper title
        if not title:
            title = self._extract_title_from_requirements(requirements)
        
        # Generate mock content
        formatted_content = self._generate_mock_content(title, requirements, output_format)
        
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
    
    def _extract_title_from_requirements(self, requirements: str) -> str:
        """Extract or generate a title from requirements"""
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
    
    def _generate_mock_content(self, title: str, requirements: str, output_format: str) -> str:
        """Generate mock HTML content"""
        
        # Determine font based on requirements
        font_family = "Times New Roman" if "times" in requirements.lower() else "Arial"
        font_size = "12pt" if "12pt" in requirements.lower() else "11pt"
        
        content = f"""
<div style="font-family: {font_family}; font-size: {font_size}; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 18pt; font-weight: bold; margin-bottom: 10px;">{title}</h1>
        <p style="font-size: 12pt; margin-bottom: 5px;">Author Name</p>
        <p style="font-size: 11pt; color: #666;">Institution Name</p>
        <p style="font-size: 11pt; color: #666;">Email: author@institution.edu</p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">Abstract</h2>
        <p style="text-align: justify; margin-bottom: 10px;">
            This paper presents a comprehensive analysis of the topic specified in the user requirements. 
            The research methodology employed follows established academic standards and incorporates 
            current best practices in the field. The findings demonstrate significant implications for 
            future research and practical applications. Key contributions include novel insights into 
            the subject matter and recommendations for further investigation.
        </p>
        <p style="font-weight: bold; margin-bottom: 10px;">Keywords:</p>
        <p style="font-style: italic;">research, analysis, methodology, academic writing, {output_format.upper()}</p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">1. Introduction</h2>
        <p style="text-align: justify; margin-bottom: 15px;">
            The introduction provides essential background information and establishes the context 
            for this research. The significance of this study lies in its potential to contribute 
            to the existing body of knowledge while addressing current gaps in the literature.
        </p>
        <p style="text-align: justify; margin-bottom: 15px;">
            This paper is formatted according to the specified requirements: {requirements[:100]}...
            The structure follows established academic conventions and maintains consistency 
            throughout all sections.
        </p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">2. Literature Review</h2>
        <p style="text-align: justify; margin-bottom: 15px;">
            The literature review examines previous research relevant to this topic. 
            Several key studies have contributed to our understanding of the subject matter 
            (Smith et al., 2023; Johnson & Brown, 2022; Davis, 2021).
        </p>
        <p style="text-align: justify; margin-bottom: 15px;">
            Recent developments in the field have highlighted the need for further investigation 
            into specific aspects of the topic. This research builds upon these foundations 
            while exploring new dimensions of the subject.
        </p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">3. Methodology</h2>
        <p style="text-align: justify; margin-bottom: 15px;">
            The research methodology employed in this study follows established academic protocols. 
            Data collection procedures were designed to ensure reliability and validity of results. 
            The analytical framework incorporates both quantitative and qualitative approaches 
            as appropriate for the research objectives.
        </p>
        <p style="text-align: justify; margin-bottom: 15px;">
            Ethical considerations were carefully addressed throughout the research process, 
            and all procedures were approved by the relevant institutional review board.
        </p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">4. Results and Discussion</h2>
        <p style="text-align: justify; margin-bottom: 15px;">
            The results of this study provide valuable insights into the research questions posed. 
            Key findings indicate significant relationships between the variables examined. 
            The implications of these results extend beyond the immediate scope of this research.
        </p>
        <p style="text-align: justify; margin-bottom: 15px;">
            Discussion of the results reveals several important considerations for future research. 
            The findings contribute to theoretical understanding while offering practical applications 
            for practitioners in the field.
        </p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">5. Conclusion</h2>
        <p style="text-align: justify; margin-bottom: 15px;">
            This research has successfully addressed the objectives outlined in the introduction. 
            The findings contribute meaningfully to the existing literature and provide a foundation 
            for future investigations. The methodology employed proved effective in generating 
            reliable and valid results.
        </p>
        <p style="text-align: justify; margin-bottom: 15px;">
            Recommendations for future research include expanding the scope of investigation 
            and exploring additional variables that may influence the outcomes observed in this study.
        </p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h2 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px;">References</h2>
        <div style="margin-left: 20px;">
            <p style="margin-bottom: 10px; text-indent: -20px;">
                Davis, R. (2021). <em>Advances in Academic Research Methods</em>. Academic Press.
            </p>
            <p style="margin-bottom: 10px; text-indent: -20px;">
                Johnson, M., & Brown, L. (2022). Contemporary approaches to scholarly writing. 
                <em>Journal of Academic Excellence</em>, 15(3), 45-62.
            </p>
            <p style="margin-bottom: 10px; text-indent: -20px;">
                Smith, A., Wilson, K., & Taylor, J. (2023). Innovative methodologies in research design. 
                <em>Research Quarterly</em>, 28(2), 123-140.
            </p>
        </div>
    </div>
</div>
"""
        return content.strip()
    
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

