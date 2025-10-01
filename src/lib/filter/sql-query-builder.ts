import {
  FilterDefinition,
  FilterGroup,
  FilterCondition,
  SqlQuery,
  FieldSchema,
  OPERATORS,
} from "./types";

export class SqlQueryBuilder {
  private schema: FieldSchema[];

  constructor(schema: FieldSchema[]) {
    this.schema = schema;
  }

  buildQuery(filter: FilterDefinition, tableName: string): SqlQuery {
    const whereClause = this.buildGroupQuery(filter);
    const query = `SELECT * FROM ${tableName}${
      whereClause ? ` WHERE ${whereClause}` : ""
    }`;

    return {
      query,
    };
  }

  private buildGroupQuery(group: FilterGroup): string {
    const conditions: string[] = [];

    if (group.and) {
      const andConditions = group.and.map((item) =>
        "field" in item
          ? this.buildConditionQuery(item)
          : `${this.buildGroupQuery(item)}`
      );
      conditions.push(`(${andConditions.join(" AND ")})`);
    }

    if (group.or) {
      const orConditions = group.or.map((item) =>
        "field" in item
          ? this.buildConditionQuery(item)
          : `${this.buildGroupQuery(item)}`
      );
      conditions.push(`(${orConditions.join(" OR ")})`);
    }

    return conditions.join(" AND ");
  }

  private buildConditionQuery(condition: FilterCondition): string {
    const { field, operator, value } = condition;
    const columnName = `"${field}"`;
    const fieldSchema = this.schema.find((f) => f.name === field);

    if (!fieldSchema) {
      const error = new Error(`Field '${field}' not found in schema`);
      (error as any).status = 400;
      throw error;
    }

    const processedValue = this.processValueByType(value, fieldSchema.type);

    switch (operator) {
      case OPERATORS.EQ:
        return `${columnName} = ${this.formatValue(
          processedValue,
          fieldSchema.type,
          field
        )}`;

      case OPERATORS.NEQ:
        return `${columnName} != ${this.formatValue(
          processedValue,
          fieldSchema.type,
          field
        )}`;

      case OPERATORS.GT:
        return `${columnName} > ${this.formatValue(
          processedValue,
          fieldSchema.type,
          field
        )}`;

      case OPERATORS.LT:
        return `${columnName} < ${this.formatValue(
          processedValue,
          fieldSchema.type,
          field
        )}`;

      case OPERATORS.GTE:
        return `${columnName} >= ${this.formatValue(
          processedValue,
          fieldSchema.type,
          field
        )}`;

      case OPERATORS.LTE:
        return `${columnName} <= ${this.formatValue(
          processedValue,
          fieldSchema.type,
          field
        )}`;

      case OPERATORS.IN:
        const processedArray = (value as any[]).map((v) =>
          this.processValueByType(v, fieldSchema.type)
        );
        const formattedValues = processedArray
          .map((v) => this.formatValue(v, fieldSchema.type, field))
          .join(", ");
        return `${columnName} IN (${formattedValues})`;

      case OPERATORS.BETWEEN:
        const [min, max] = value as [any, any];
        const processedMin = this.processValueByType(min, fieldSchema.type);
        const processedMax = this.processValueByType(max, fieldSchema.type);
        return `${columnName} BETWEEN ${this.formatValue(
          processedMin,
          fieldSchema.type,
          field
        )} AND ${this.formatValue(processedMax, fieldSchema.type, field)}`;

      case OPERATORS.CONTAINS:
        return `${columnName} ILIKE ${this.formatValue(
          `%${value}%`,
          "string"
        )}`;

      case OPERATORS.STARTS_WITH:
        return `${columnName} ILIKE ${this.formatValue(`${value}%`, "string")}`;

      case OPERATORS.ENDS_WITH:
        return `${columnName} ILIKE ${this.formatValue(`%${value}`, "string")}`;

      case OPERATORS.IS_NULL:
        return `${columnName} IS NULL`;

      case OPERATORS.IS_NOT_NULL:
        return `${columnName} IS NOT NULL`;

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private formatValue(
    value: any,
    fieldType: string,
    fieldName?: string
  ): string {
    switch (fieldType) {
      case "string":
        return `'${String(value).replace(/'/g, "''")}'`;

      case "enum":
        if (fieldName) {
          const fieldSchema = this.schema.find((f) => f.name === fieldName);
          if (fieldSchema?.enumTypeName) {
            return `'${String(value)}'::${fieldSchema.enumTypeName}`;
          }
        }
        return `'${String(value)}'`;

      case "number":
        return String(Number(value));

      case "boolean":
        return String(Boolean(value));

      case "date":
        const dateValue = value instanceof Date ? value : new Date(value);
        return `'${dateValue.toISOString()}'`;

      case "uuid":
        return `'${String(value)}'`;

      default:
        return `'${String(value)}'`;
    }
  }

  private processValueByType(value: any, fieldType: string): any {
    switch (fieldType) {
      case "number":
        return Number(value);

      case "boolean":
        return Boolean(value);

      case "date":
        if (typeof value === "string") {
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            throw new Error(`Invalid date value: ${value}`);
          }
          return dateValue;
        }

      case "uuid":
        if (typeof value === "string") {
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(value)) {
            throw new Error(`Invalid UUID value: ${value}`);
          }
        }
        return value;

      case "enum":
      case "string":
      default:
        return value;
    }
  }
}
