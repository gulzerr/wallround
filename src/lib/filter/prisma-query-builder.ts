import {
  FilterDefinition,
  FilterGroup,
  FilterCondition,
  OPERATORS,
} from "./types";

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
      case OPERATORS.EQ:
        return { [field]: { equals: value } };
      case OPERATORS.NEQ:
        return { [field]: { not: value } };
      case OPERATORS.GT:
        return { [field]: { gt: value } };
      case OPERATORS.LT:
        return { [field]: { lt: value } };
      case OPERATORS.GTE:
        return { [field]: { gte: value } };
      case OPERATORS.LTE:
        return { [field]: { lte: value } };
      case OPERATORS.IN:
        return { [field]: { in: value } };
      case OPERATORS.BETWEEN:
        return { [field]: { gte: value[0], lte: value[1] } };
      case OPERATORS.CONTAINS:
        return { [field]: { contains: value, mode: "insensitive" } };
      case OPERATORS.STARTS_WITH:
        return { [field]: { startsWith: value, mode: "insensitive" } };
      case OPERATORS.ENDS_WITH:
        return { [field]: { endsWith: value, mode: "insensitive" } };
      case OPERATORS.IS_NULL:
        return { [field]: { equals: null } };
      case OPERATORS.IS_NOT_NULL:
        return { [field]: { not: null } };
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}
