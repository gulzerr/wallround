import { PrismaQueryBuilder } from "../src/lib/filter/prisma-query-builder";

describe("PrismaQueryBuilder", () => {
  let queryBuilder: PrismaQueryBuilder;

  beforeEach(() => {
    queryBuilder = new PrismaQueryBuilder();
  });

  describe("Simple Conditions", () => {
    it("should build eq condition", () => {
      const filter = {
        and: [{ field: "name", operator: "eq" as const, value: "John" }],
      };

      const query = queryBuilder.buildPrismaQuery(filter);
      expect(query).toEqual({
        AND: [{ name: { equals: "John" } }],
      });
    });

    it("should build gt condition", () => {
      const filter = {
        and: [{ field: "age", operator: "gt" as const, value: 25 }],
      };

      const query = queryBuilder.buildPrismaQuery(filter);
      expect(query).toEqual({
        AND: [{ age: { gt: 25 } }],
      });
    });

    it("should build contains condition", () => {
      const filter = {
        and: [{ field: "name", operator: "contains" as const, value: "John" }],
      };

      const query = queryBuilder.buildPrismaQuery(filter);
      expect(query).toEqual({
        AND: [{ name: { contains: "John", mode: "insensitive" } }],
      });
    });

    it("should build between condition", () => {
      const filter = {
        and: [{ field: "age", operator: "between" as const, value: [25, 35] }],
      };

      const query = queryBuilder.buildPrismaQuery(filter);
      expect(query).toEqual({
        AND: [{ age: { gte: 25, lte: 35 } }],
      });
    });

    it("should build is_null condition", () => {
      const filter = {
        and: [{ field: "name", operator: "is_null" as const }],
      };

      const query = queryBuilder.buildPrismaQuery(filter);
      expect(query).toEqual({
        AND: [{ name: { equals: null } }],
      });
    });
  });

  describe("Complex Filters", () => {
    it("should build nested AND/OR conditions", () => {
      const filter = {
        and: [
          { field: "age", operator: "gt" as const, value: 30 },
          {
            or: [
              { field: "role", operator: "eq" as const, value: "admin" },
              { field: "isActive", operator: "eq" as const, value: true },
            ],
          },
        ],
      };

      const query = queryBuilder.buildPrismaQuery(filter);
      expect(query).toEqual({
        AND: [
          { age: { gt: 30 } },
          {
            OR: [{ role: { equals: "admin" } }, { isActive: { equals: true } }],
          },
        ],
      });
    });
  });
});
