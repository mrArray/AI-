"""
Paper Generation Utilities

This module contains utility functions for paper generation.
"""

import re
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from django.utils.text import slugify


class ContentProcessor:
    """Utility class for processing generated content"""
    
    @staticmethod
    def clean_content(content: str) -> str:
        """Clean and format generated content"""
        if not content:
            return ""
        
        # Remove excessive whitespace
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        content = re.sub(r'[ \t]+', ' ', content)
        
        # Fix common formatting issues
        content = content.replace(' ,', ',')
        content = content.replace(' .', '.')
        content = content.replace(' ;', ';')
        content = content.replace(' :', ':')
        
        # Ensure proper spacing after punctuation
        content = re.sub(r'([.!?])([A-Z])', r'\1 \2', content)
        
        return content.strip()
    
    @staticmethod
    def extract_title(content: str) -> Optional[str]:
        """Extract title from generated content"""
        lines = content.split('\n')
        
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and not line.startswith('#'):
                # Remove markdown formatting
                title = re.sub(r'[#*_`]', '', line).strip()
                if 5 <= len(title) <= 200:  # Reasonable title length
                    return title
        
        return None
    
    @staticmethod
    def extract_sections(content: str) -> List[Dict[str, Any]]:
        """Extract sections from generated content"""
        sections = []
        current_section = None
        current_content = []
        
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Check if line is a section header
            if line.startswith('#') or (line.isupper() and len(line.split()) <= 5):
                # Save previous section
                if current_section:
                    section_content = '\n'.join(current_content).strip()
                    if section_content:
                        sections.append({
                            'name': current_section,
                            'content': section_content,
                            'word_count': len(section_content.split())
                        })
                
                # Start new section
                current_section = re.sub(r'[#*_]', '', line).strip()
                current_content = []
            else:
                if current_section:
                    current_content.append(line)
        
        # Save last section
        if current_section:
            section_content = '\n'.join(current_content).strip()
            if section_content:
                sections.append({
                    'name': current_section,
                    'content': section_content,
                    'word_count': len(section_content.split())
                })
        
        return sections
    
    @staticmethod
    def calculate_readability_score(content: str) -> Dict[str, float]:
        """Calculate readability metrics for content"""
        if not content:
            return {'flesch_reading_ease': 0, 'flesch_kincaid_grade': 0}
        
        # Simple readability calculation
        sentences = len(re.findall(r'[.!?]+', content))
        words = len(content.split())
        syllables = ContentProcessor._count_syllables(content)
        
        if sentences == 0 or words == 0:
            return {'flesch_reading_ease': 0, 'flesch_kincaid_grade': 0}
        
        # Flesch Reading Ease
        flesch_reading_ease = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
        
        # Flesch-Kincaid Grade Level
        flesch_kincaid_grade = (0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59
        
        return {
            'flesch_reading_ease': max(0, min(100, flesch_reading_ease)),
            'flesch_kincaid_grade': max(0, flesch_kincaid_grade)
        }
    
    @staticmethod
    def _count_syllables(text: str) -> int:
        """Count syllables in text (simplified)"""
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        syllable_count = 0
        
        for word in words:
            # Simple syllable counting
            vowels = 'aeiouy'
            syllables = 0
            prev_was_vowel = False
            
            for char in word:
                is_vowel = char in vowels
                if is_vowel and not prev_was_vowel:
                    syllables += 1
                prev_was_vowel = is_vowel
            
            # Handle silent e
            if word.endswith('e') and syllables > 1:
                syllables -= 1
            
            # Ensure at least one syllable per word
            syllables = max(1, syllables)
            syllable_count += syllables
        
        return syllable_count


class CitationFormatter:
    """Utility class for formatting citations"""
    
    @staticmethod
    def format_apa_citation(author: str, year: str, title: str, source: str = "") -> str:
        """Format citation in APA style"""
        citation = f"{author} ({year}). {title}."
        if source:
            citation += f" {source}."
        return citation
    
    @staticmethod
    def format_mla_citation(author: str, title: str, source: str, year: str = "") -> str:
        """Format citation in MLA style"""
        citation = f"{author}. \"{title}.\" {source}"
        if year:
            citation += f", {year}"
        citation += "."
        return citation
    
    @staticmethod
    def format_chicago_citation(author: str, title: str, source: str, year: str = "") -> str:
        """Format citation in Chicago style"""
        citation = f"{author}. \"{title}.\" {source}"
        if year:
            citation += f" ({year})"
        citation += "."
        return citation
    
    @staticmethod
    def extract_citations(content: str) -> List[str]:
        """Extract citations from content"""
        # Pattern for common citation formats
        patterns = [
            r'\([A-Za-z\s,]+\d{4}\)',  # APA style (Author, Year)
            r'\([A-Za-z\s]+\d+\)',     # MLA style (Author Page)
            r'\[\d+\]',                # IEEE style [1]
        ]
        
        citations = []
        for pattern in patterns:
            citations.extend(re.findall(pattern, content))
        
        return list(set(citations))  # Remove duplicates


class PaperValidator:
    """Utility class for validating generated papers"""
    
    @staticmethod
    def validate_paper_structure(content: str, required_sections: List[str]) -> Dict[str, Any]:
        """Validate paper structure against requirements"""
        sections = ContentProcessor.extract_sections(content)
        section_names = [s['name'].lower() for s in sections]
        
        missing_sections = []
        for required in required_sections:
            if not any(required.lower() in name for name in section_names):
                missing_sections.append(required)
        
        return {
            'is_valid': len(missing_sections) == 0,
            'missing_sections': missing_sections,
            'found_sections': [s['name'] for s in sections],
            'total_sections': len(sections)
        }
    
    @staticmethod
    def validate_word_count(content: str, target_words: int, tolerance: float = 0.2) -> Dict[str, Any]:
        """Validate word count against target"""
        actual_words = len(content.split())
        min_words = int(target_words * (1 - tolerance))
        max_words = int(target_words * (1 + tolerance))
        
        return {
            'is_valid': min_words <= actual_words <= max_words,
            'actual_words': actual_words,
            'target_words': target_words,
            'min_words': min_words,
            'max_words': max_words,
            'percentage': (actual_words / target_words) * 100 if target_words > 0 else 0
        }
    
    @staticmethod
    def validate_citations(content: str, min_citations: int = 3) -> Dict[str, Any]:
        """Validate citation count"""
        citations = CitationFormatter.extract_citations(content)
        
        return {
            'is_valid': len(citations) >= min_citations,
            'citation_count': len(citations),
            'min_required': min_citations,
            'citations': citations
        }


class PaperMetrics:
    """Utility class for calculating paper metrics"""
    
    @staticmethod
    def calculate_metrics(content: str) -> Dict[str, Any]:
        """Calculate comprehensive metrics for a paper"""
        if not content:
            return {}
        
        words = content.split()
        sentences = re.findall(r'[.!?]+', content)
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        # Basic metrics
        word_count = len(words)
        sentence_count = len(sentences)
        paragraph_count = len(paragraphs)
        character_count = len(content)
        
        # Advanced metrics
        avg_words_per_sentence = word_count / sentence_count if sentence_count > 0 else 0
        avg_sentences_per_paragraph = sentence_count / paragraph_count if paragraph_count > 0 else 0
        
        # Readability
        readability = ContentProcessor.calculate_readability_score(content)
        
        # Citations
        citations = CitationFormatter.extract_citations(content)
        
        # Sections
        sections = ContentProcessor.extract_sections(content)
        
        return {
            'word_count': word_count,
            'sentence_count': sentence_count,
            'paragraph_count': paragraph_count,
            'character_count': character_count,
            'avg_words_per_sentence': round(avg_words_per_sentence, 2),
            'avg_sentences_per_paragraph': round(avg_sentences_per_paragraph, 2),
            'readability': readability,
            'citation_count': len(citations),
            'section_count': len(sections),
            'sections': sections
        }


class FileNameGenerator:
    """Utility class for generating file names"""
    
    @staticmethod
    def generate_paper_filename(title: str, user_id: int, format_name: str = "", extension: str = "pdf") -> str:
        """Generate a filename for a paper"""
        # Clean title
        clean_title = slugify(title)[:50]  # Limit length
        
        # Add timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Build filename
        parts = [clean_title, f"user_{user_id}", timestamp]
        if format_name:
            parts.append(slugify(format_name))
        
        filename = "_".join(parts) + f".{extension}"
        return filename
    
    @staticmethod
    def generate_unique_filename(base_name: str, extension: str = "pdf") -> str:
        """Generate a unique filename with timestamp"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        clean_base = slugify(base_name)[:30]
        return f"{clean_base}_{timestamp}.{extension}"

