import { FieldSchema } from "../lib/filter";

export const userFilterSchema: FieldSchema[] = [
  {
    name: "id",
    type: "uuid",
    allowedOperators: ["eq", "neq", "in"],
    filterable: true,
  },
  {
    name: "email",
    type: "string",
    allowedOperators: ["eq", "neq", "contains", "starts_with", "ends_with"],
    filterable: true,
  },
  {
    name: "name",
    type: "string",
    allowedOperators: ["eq", "neq", "contains", "starts_with", "ends_with"],
    filterable: true,
  },
  {
    name: "age",
    type: "number",
    allowedOperators: ["eq", "neq", "gt", "lt", "gte", "lte", "between", "in"],
    filterable: true,
  },
  {
    name: "role",
    type: "enum",
    allowedOperators: ["eq", "neq", "in"],
    filterable: true,
    enumTypeName: "role",
  },
  {
    name: "isActive",
    type: "boolean",
    allowedOperators: ["eq", "neq"],
    filterable: true,
  },
  {
    name: "createdAt",
    type: "date",
    allowedOperators: ["eq", "neq", "gt", "lt", "gte", "lte", "between"],
    filterable: true,
  },
  {
    name: "password",
    type: "string",
    allowedOperators: [],
    filterable: false, // Sensitive field - not filterable
  },
];
