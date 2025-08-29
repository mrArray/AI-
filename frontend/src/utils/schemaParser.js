// Mock OpenAPI schema parser for drf-spectacular
// In a real implementation, this would fetch the schema from the Django backend

export const mockOpenAPISchema = {
  components: {
    schemas: {
      LLMProvider: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          name: { type: 'string', maxLength: 100, title: 'Provider Name' },
          provider_type: {
            type: 'string',
            enum: ['openai', 'anthropic', 'azure_openai', 'ollama', 'custom'],
            title: 'Provider Type'
          },
          base_url: { type: 'string', format: 'uri', title: 'Base URL' },
          api_key: { type: 'string', writeOnly: true, title: 'API Key' },
          is_active: { type: 'boolean', default: true, title: 'Active' },
          is_default: { type: 'boolean', default: false, title: 'Default Provider' },
          timeout: { type: 'integer', minimum: 1, maximum: 300, default: 30, title: 'Timeout (seconds)' },
          max_retries: { type: 'integer', minimum: 0, maximum: 10, default: 3, title: 'Max Retries' },
          created_at: { type: 'string', format: 'date-time', readOnly: true },
          updated_at: { type: 'string', format: 'date-time', readOnly: true }
        },
        required: ['name', 'provider_type', 'base_url']
      },
      LLMModel: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          provider: { type: 'integer', title: 'Provider' },
          name: { type: 'string', maxLength: 100, title: 'Model Name' },
          display_name: { type: 'string', maxLength: 100, title: 'Display Name' },
          description: { type: 'string', title: 'Description' },
          context_length: { type: 'integer', minimum: 1, title: 'Context Length' },
          max_tokens: { type: 'integer', minimum: 1, title: 'Max Tokens' },
          temperature_default: { type: 'number', minimum: 0, maximum: 2, default: 0.7, title: 'Default Temperature' },
          supports_streaming: { type: 'boolean', default: true, title: 'Supports Streaming' },
          is_active: { type: 'boolean', default: true, title: 'Active' },
          is_default: { type: 'boolean', default: false, title: 'Default Model' },
          cost_per_1k_tokens: { type: 'number', minimum: 0, title: 'Cost per 1K Tokens' },
          created_at: { type: 'string', format: 'date-time', readOnly: true },
          updated_at: { type: 'string', format: 'date-time', readOnly: true }
        },
        required: ['provider', 'name', 'display_name']
      },
      PromptTemplate: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          name: { type: 'string', maxLength: 100, title: 'Template Name' },
          language: {
            type: 'string',
            enum: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de'],
            default: 'en',
            title: 'Language'
          },
          prompt_type: {
            type: 'string',
            enum: ['code_review', 'summarization', 'translation', 'email_generation', 'bug_analysis', 'custom'],
            title: 'Prompt Type'
          },
          description: { type: 'string', title: 'Description' },
          template: { type: 'string', title: 'Template Content' },
          variables: { type: 'string', title: 'Variables (comma-separated)' },
          is_active: { type: 'boolean', default: true, title: 'Active' },
          is_default: { type: 'boolean', default: false, title: 'Default Template' },
          created_at: { type: 'string', format: 'date-time', readOnly: true },
          updated_at: { type: 'string', format: 'date-time', readOnly: true }
        },
        required: ['name', 'language', 'prompt_type', 'template']
      },
      LLMConfiguration: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          default_provider: { type: 'integer', title: 'Default Provider' },
          default_model: { type: 'integer', title: 'Default Model' },
          default_temperature: { type: 'number', minimum: 0, maximum: 2, default: 0.7, title: 'Default Temperature' },
          default_max_tokens: { type: 'integer', minimum: 1, default: 2048, title: 'Default Max Tokens' },
          enable_streaming: { type: 'boolean', default: true, title: 'Enable Streaming' },
          enable_caching: { type: 'boolean', default: true, title: 'Enable Caching' },
          cache_ttl: { type: 'integer', minimum: 60, default: 3600, title: 'Cache TTL (seconds)' },
          rate_limit_per_minute: { type: 'integer', minimum: 1, default: 60, title: 'Rate Limit per Minute' },
          enable_logging: { type: 'boolean', default: true, title: 'Enable Logging' },
          log_level: {
            type: 'string',
            enum: ['DEBUG', 'INFO', 'WARNING', 'ERROR'],
            default: 'INFO',
            title: 'Log Level'
          },
          created_at: { type: 'string', format: 'date-time', readOnly: true },
          updated_at: { type: 'string', format: 'date-time', readOnly: true }
        },
        required: ['default_provider', 'default_model']
      }
    }
  }
};

export class SchemaParser {
  constructor(schema = mockOpenAPISchema) {
    this.schema = schema;
  }

  // Get model schema by name
  getModelSchema(modelName) {
    return this.schema.components?.schemas?.[modelName] || null;
  }

  // Parse field configuration for forms
  parseFieldConfig(fieldName, fieldSchema) {
    const config = {
      name: fieldName,
      label: fieldSchema.title || this.formatLabel(fieldName),
      type: this.getFieldType(fieldSchema),
      required: false,
      readOnly: fieldSchema.readOnly || false,
      writeOnly: fieldSchema.writeOnly || false,
      description: fieldSchema.description,
      validation: {}
    };

    // Add validation rules
    if (fieldSchema.maxLength) {
      config.validation.maxLength = fieldSchema.maxLength;
    }
    if (fieldSchema.minimum !== undefined) {
      config.validation.min = fieldSchema.minimum;
    }
    if (fieldSchema.maximum !== undefined) {
      config.validation.max = fieldSchema.maximum;
    }
    if (fieldSchema.format) {
      config.validation.format = fieldSchema.format;
    }

    // Add options for enum fields
    if (fieldSchema.enum) {
      config.options = fieldSchema.enum.map(value => ({
        value,
        label: this.formatLabel(value)
      }));
    }

    // Set default value
    if (fieldSchema.default !== undefined) {
      config.defaultValue = fieldSchema.default;
    }

    return config;
  }

  // Get form configuration for a model
  getFormConfig(modelName, requiredFields = []) {
    const schema = this.getModelSchema(modelName);
    if (!schema) return null;

    const fields = [];
    const properties = schema.properties || {};

    Object.entries(properties).forEach(([fieldName, fieldSchema]) => {
      // Skip read-only fields in forms (except for display)
      if (fieldSchema.readOnly && !['id', 'created_at', 'updated_at'].includes(fieldName)) {
        return;
      }

      const fieldConfig = this.parseFieldConfig(fieldName, fieldSchema);
      fieldConfig.required = requiredFields.includes(fieldName) || (schema.required || []).includes(fieldName);
      
      fields.push(fieldConfig);
    });

    return {
      modelName,
      fields,
      requiredFields: schema.required || []
    };
  }

  // Get table configuration for a model
  getTableConfig(modelName) {
    const schema = this.getModelSchema(modelName);
    if (!schema) return null;

    const columns = [];
    const properties = schema.properties || {};

    Object.entries(properties).forEach(([fieldName, fieldSchema]) => {
      // Skip write-only fields in tables
      if (fieldSchema.writeOnly) return;

      const column = {
        key: fieldName,
        label: fieldSchema.title || this.formatLabel(fieldName),
        type: this.getColumnType(fieldSchema),
        sortable: !['object', 'array'].includes(fieldSchema.type),
        filterable: ['string', 'boolean', 'integer'].includes(fieldSchema.type)
      };

      // Add special rendering for certain field types
      if (fieldSchema.enum) {
        column.type = 'enum';
        column.options = fieldSchema.enum;
      }

      if (fieldSchema.format === 'date-time') {
        column.type = 'datetime';
      }

      if (fieldSchema.format === 'uri') {
        column.type = 'url';
      }

      columns.push(column);
    });

    return {
      modelName,
      columns
    };
  }

  // Helper methods
  getFieldType(fieldSchema) {
    if (fieldSchema.enum) return 'select';
    if (fieldSchema.type === 'boolean') return 'checkbox';
    if (fieldSchema.type === 'integer') return 'number';
    if (fieldSchema.type === 'number') return 'number';
    if (fieldSchema.format === 'date-time') return 'datetime';
    if (fieldSchema.format === 'uri') return 'url';
    if (fieldSchema.format === 'email') return 'email';
    if (fieldSchema.writeOnly) return 'password';
    if (fieldSchema.maxLength && fieldSchema.maxLength > 255) return 'textarea';
    return 'text';
  }

  getColumnType(fieldSchema) {
    if (fieldSchema.type === 'boolean') return 'boolean';
    if (fieldSchema.format === 'date-time') return 'date';
    if (fieldSchema.format === 'uri') return 'url';
    if (fieldSchema.enum) return 'badge';
    return 'text';
  }

  formatLabel(text) {
    return text
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Get all available models
  getAvailableModels() {
    return Object.keys(this.schema.components?.schemas || {});
  }
}

// Export singleton instance
export const schemaParser = new SchemaParser();

