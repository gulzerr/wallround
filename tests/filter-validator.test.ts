import { FilterValidator } from "../src/lib/filter/validator";
import { FieldSchema } from "../src/lib/filter/types";

describe("FilterValidator", () => {
  let validator: FilterValidator;

  beforeEach(() => {
    const schema: FieldSchema[] = [
      {
        name: "name",
        type: "string",
        allowedOperators: ["eq", "neq", "contains", "is_null"],
        filterable: true,
      },
      {
        name: "age",
        type: "number",
        allowedOperators: ["eq", "gt", "lt", "between"],
        filterable: true,
      },
      {
        name: "password",
        type: "string",
        allowedOperators: [],
        filterable: false,
      },
    ];

    validator = new FilterValidator(schema);
  });

  describe("Field Exposure Restriction", () => {
    it("should reject non-filterable fields", () => {
      const filter = {
        and: [{ field: "password", operator: "eq" as const, value: "test" }],
      };

      const errors = validator.validate(filter);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("is not filterable");
    });

    it("should reject non-existent fields", () => {
      const filter = {
        and: [{ field: "nonexistent", operator: "eq" as const, value: "test" }],
      };

      const errors = validator.validate(filter);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("does not exist");
    });
  });

  describe("Operator Validation", () => {
    it("should reject unsupported operators for field type", () => {
      const filter = {
        and: [{ field: "name", operator: "gt" as const, value: "test" }],
      };

      const errors = validator.validate(filter);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("not allowed for field");
    });
  });

  describe("Value Validation", () => {
    it("should validate between operator requires exactly two values", () => {
      const filter = {
        and: [{ field: "age", operator: "between" as const, value: [25] }],
      };

      const errors = validator.validate(filter);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("exactly two values");
    });

    it("should validate null operators have no value", () => {
      const filter = {
        and: [{ field: "name", operator: "is_null" as const, value: "test" }],
      };

      const errors = validator.validate(filter);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("should not have a value");
    });
  });

  describe("Type Validation", () => {
    it("should validate string types", () => {
      const filter = {
        and: [{ field: "name", operator: "eq" as const, value: 123 }],
      };

      const errors = validator.validate(filter);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("not a valid string");
    });

    it("should validate number types", () => {
      const filter = {
        and: [{ field: "age", operator: "eq" as const, value: "not-a-number" }],
      };

      const errors = validator.validate(filter);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("not a valid number");
    });
  });

  describe("Valid Filters", () => {
    it("should pass valid simple filter", () => {
      const filter = {
        and: [{ field: "name", operator: "eq" as const, value: "John" }],
      };

      const errors = validator.validate(filter);
      expect(errors).toHaveLength(0);
    });

    it("should pass valid nested filter", () => {
      const filter = {
        and: [
          { field: "age", operator: "gt" as const, value: 25 },
          {
            or: [
              { field: "name", operator: "contains" as const, value: "John" },
            ],
          },
        ],
      };

      const errors = validator.validate(filter);
      expect(errors).toHaveLength(0);
    });
  });
});
