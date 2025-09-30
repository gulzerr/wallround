import { FieldSchema, FilterCondition, FilterGroup, FilterDefinition, ValidationError, Operator, FieldType } from './types';

export class FilterValidator {
  private schema: Map<string, FieldSchema> = new Map();

  constructor(fields: FieldSchema[]) {
    fields.forEach(field => this.schema.set(field.name, field));
  }

  validate(filter: FilterDefinition): ValidationError[] {
    const errors: ValidationError[] = [];
    this.validateGroup(filter, errors);
    return errors;
  }

  private validateGroup(group: FilterGroup, errors: ValidationError[]): void {
    if (group.and) {
      group.and.forEach(item => {
        if ('field' in item) {
          this.validateCondition(item, errors);
        } else {
          this.validateGroup(item, errors);
        }
      });
    }

    if (group.or) {
      group.or.forEach(item => {
        if ('field' in item) {
          this.validateCondition(item, errors);
        } else {
          this.validateGroup(item, errors);
        }
      });
    }
  }

  private validateCondition(condition: FilterCondition, errors: ValidationError[]): void {
    const field = this.schema.get(condition.field);
    
    if (!field) {
      errors.push({
        field: condition.field,
        message: `Field '${condition.field}' does not exist`
      });
      return;
    }

    if (!field.filterable) {
      errors.push({
        field: condition.field,
        message: `Field '${condition.field}' is not filterable`
      });
      return;
    }

    if (!field.allowedOperators.includes(condition.operator)) {
      errors.push({
        field: condition.field,
        operator: condition.operator,
        message: `Operator '${condition.operator}' is not allowed for field '${condition.field}'`
      });
      return;
    }

    this.validateValue(condition, field, errors);
  }

  private validateValue(condition: FilterCondition, field: FieldSchema, errors: ValidationError[]): void {
    const { operator, value, field: fieldName } = condition;

    // Null operators should not have values
    if (['is_null', 'is_not_null'].includes(operator)) {
      if (value !== undefined) {
        errors.push({
          field: fieldName,
          operator,
          message: `Operator '${operator}' should not have a value`
        });
      }
      return;
    }

    // Other operators require values
    if (value === undefined || value === null) {
      errors.push({
        field: fieldName,
        operator,
        message: `Operator '${operator}' requires a value`
      });
      return;
    }

    // Special validation for specific operators
    if (operator === 'between') {
      if (!Array.isArray(value) || value.length !== 2) {
        errors.push({
          field: fieldName,
          operator,
          message: `Operator 'between' requires exactly two values`
        });
        return;
      }
    }

    if (operator === 'in') {
      if (!Array.isArray(value)) {
        errors.push({
          field: fieldName,
          operator,
          message: `Operator 'in' requires an array of values`
        });
        return;
      }
    }

    // Type validation
    this.validateValueType(value, field.type, fieldName, operator, errors);
  }

  private validateValueType(value: any, type: FieldType, fieldName: string, operator: string, errors: ValidationError[]): void {
    const values = Array.isArray(value) ? value : [value];
    
    for (const val of values) {
      if (!this.isValidType(val, type)) {
        errors.push({
          field: fieldName,
          operator,
          message: `Value '${val}' is not a valid ${type}`
        });
      }
    }
  }

  private isValidType(value: any, type: FieldType): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return !isNaN(Date.parse(value));
      case 'uuid':
        return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
      case 'enum':
        return typeof value === 'string';
      default:
        return false;
    }
  }
}
