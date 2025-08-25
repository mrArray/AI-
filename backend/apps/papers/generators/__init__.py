"""
Paper Generation Module Initialization

This module initializes the paper generation system.
"""

from .paper_generator import PaperGenerator, PaperGenerationError, PaperFormatManager, PaperExportService
from .template_manager import TemplateManager, TemplateValidator, TemplateRecommendationEngine
from .format_service import PaperFormatService, FormatTemplateGenerator
from .utils import ContentProcessor, CitationFormatter, PaperValidator, PaperMetrics, FileNameGenerator

__all__ = [
    'PaperGenerator',
    'PaperGenerationError',
    'PaperFormatManager',
    'PaperExportService',
    'TemplateManager',
    'TemplateValidator',
    'TemplateRecommendationEngine',
    'PaperFormatService',
    'FormatTemplateGenerator',
    'ContentProcessor',
    'CitationFormatter',
    'PaperValidator',
    'PaperMetrics',
    'FileNameGenerator',
]

