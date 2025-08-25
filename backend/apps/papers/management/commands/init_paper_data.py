"""
Custom management command to initialize paper formats and templates
"""

from django.core.management.base import BaseCommand
from apps.papers.generators import PaperFormatService, FormatTemplateGenerator


class Command(BaseCommand):
    help = 'Initialize standard paper formats and templates'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--formats-only',
            action='store_true',
            help='Initialize only paper formats, skip templates',
        )
        parser.add_argument(
            '--templates-only',
            action='store_true',
            help='Initialize only templates, skip formats',
        )
        parser.add_argument(
            '--languages',
            nargs='+',
            default=['en'],
            help='Languages to create templates for (default: en)',
        )
    
    def handle(self, *args, **options):
        if not options['templates_only']:
            self.stdout.write('Creating standard paper formats...')
            formats = PaperFormatService.create_standard_formats()
            self.stdout.write(
                self.style.SUCCESS(f'Created {len(formats)} paper formats')
            )
        
        if not options['formats_only']:
            self.stdout.write('Creating templates for formats...')
            from apps.papers.models import PaperFormat
            
            formats = PaperFormat.objects.filter(is_active=True, is_deleted=False)
            total_templates = 0
            
            for format_obj in formats:
                templates = FormatTemplateGenerator.create_templates_for_format(
                    format_obj, 
                    options['languages']
                )
                total_templates += len(templates)
                self.stdout.write(f'Created {len(templates)} templates for {format_obj.name}')
            
            self.stdout.write(
                self.style.SUCCESS(f'Created {total_templates} total templates')
            )
        
        self.stdout.write(
            self.style.SUCCESS('Initialization completed successfully!')
        )

