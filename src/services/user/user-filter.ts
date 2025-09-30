import prisma from "../../utils/db";
import {
  FilterDefinition,
  FilterValidator,
  PrismaQueryBuilder,
} from "../../lib/filter";
import { userFilterSchema } from "../../schemas/user-schema";
import { SqlQueryBuilder } from "../../lib/filter/sql-query-builder";

export class UserFilterService {
  private validator: FilterValidator;
  private queryBuilder: PrismaQueryBuilder;
  private sqlQueryBuilder?: SqlQueryBuilder;

  constructor(queryBuilder?: PrismaQueryBuilder) {
    this.validator = new FilterValidator(userFilterSchema);
    this.queryBuilder = queryBuilder || new PrismaQueryBuilder();
  }

  async filterUsers(filter: FilterDefinition, config?: string) {
    const errors = this.validator.validate(filter);

    if (errors.length > 0) {
      const error = new Error(
        `Filter validation failed: ${errors.map((e) => e.message).join(", ")}`
      );
      (error as any).status = 400;
      throw error;
    }

    try {
      if (config && config === "sql") {
        this.sqlQueryBuilder = new SqlQueryBuilder(userFilterSchema);
        const result = this.sqlQueryBuilder.buildQuery(filter, "users");
        const users = await prisma.$queryRawUnsafe(result.query);
        return users;
      }
      const query = this.queryBuilder.buildPrismaQuery(filter);
      const users = await prisma.user.findMany({
        where: query,
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
      return users;
    } catch (error) {
      const err = new Error(
        `Database query failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      (err as any).status = 500;
      throw err;
    }
  }
}
