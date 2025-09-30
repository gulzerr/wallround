import { FilterDefinition, FilterGroup, FilterCondition } from "./types";

export class PrismaQueryBuilder {
  buildPrismaQuery(filter: FilterDefinition): any {
    return this.buildGroupQuery(filter);
  }

  private buildGroupQuery(group: FilterGroup): any {
    const conditions: any[] = [];

    if (group.and) {
      const andConditions = group.and.map((item) =>
        "field" in item
          ? this.buildConditionQuery(item)
          : this.buildGroupQuery(item)
      );
      conditions.push({ AND: andConditions });
    }

    if (group.or) {
      const orConditions = group.or.map((item) =>
        "field" in item
          ? this.buildConditionQuery(item)
          : this.buildGroupQuery(item)
      );
      conditions.push({ OR: orConditions });
    }

    return conditions.length === 1 ? conditions[0] : { AND: conditions };
  }

  private buildConditionQuery(condition: FilterCondition): any {
    const { field, operator, value } = condition;

    switch (operator) {
      case "eq":
        return { [field]: { equals: value } };
      case "neq":
        return { [field]: { not: value } };
      case "gt":
        return { [field]: { gt: value } };
      case "lt":
        return { [field]: { lt: value } };
      case "gte":
        return { [field]: { gte: value } };
      case "lte":
        return { [field]: { lte: value } };
      case "in":
        return { [field]: { in: value } };
      case "between":
        return { [field]: { gte: value[0], lte: value[1] } };
      case "contains":
        return { [field]: { contains: value, mode: "insensitive" } };
      case "starts_with":
        return { [field]: { startsWith: value, mode: "insensitive" } };
      case "ends_with":
        return { [field]: { endsWith: value, mode: "insensitive" } };
      case "is_null":
        return { [field]: { equals: null } };
      case "is_not_null":
        return { [field]: { not: null } };
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}
