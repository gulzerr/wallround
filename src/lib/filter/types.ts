import { Joi } from "celebrate";

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

export enum OPERATORS {
  EQ = "eq",
  NEQ = "neq",
  GT = "gt",
  LT = "lt",
  GTE = "gte",
  LTE = "lte",
  IN = "in",
  BETWEEN = "between",
  CONTAINS = "contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}

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

export const conditionSchema = Joi.object({
  field: Joi.string().required(),
  operator: Joi.string()
    .valid(...Object.values(OPERATORS))
    .required(),
  value: Joi.any(),
});

const groupSchema: Joi.Schema = Joi.object({
  and: Joi.array().items(
    Joi.alternatives().try(conditionSchema, Joi.link("#group"))
  ),
  or: Joi.array().items(
    Joi.alternatives().try(conditionSchema, Joi.link("#group"))
  ),
})
  .id("group")
  .or("and", "or");

export const filterValidationSchema = Joi.object({
  and: Joi.array().items(Joi.alternatives().try(conditionSchema, groupSchema)),
  or: Joi.array().items(Joi.alternatives().try(conditionSchema, groupSchema)),
  config: Joi.string().valid("prisma", "sql").optional(),
}).or("and", "or");
