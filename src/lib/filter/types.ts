export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "uuid";

export type Operator =
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "in"
  | "between"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "is_null"
  | "is_not_null";

export const OPERATORS: Operator[] = [
  "eq",
  "neq",
  "gt",
  "lt",
  "gte",
  "lte",
  "in",
  "between",
  "contains",
  "starts_with",
  "ends_with",
  "is_null",
  "is_not_null",
];

export interface FieldSchema {
  name: string;
  type: FieldType;
  allowedOperators: Operator[];
  filterable: boolean;
  enumTypeName?: string;
}

export interface FilterCondition {
  field: string;
  operator: Operator;
  value?: any;
}

export interface FilterGroup {
  and?: (FilterCondition | FilterGroup)[];
  or?: (FilterCondition | FilterGroup)[];
}

export type FilterDefinition = FilterGroup;

export interface ValidationError {
  field?: string;
  operator?: string;
  message: string;
}

export interface SqlQuery {
  query: string;
}
