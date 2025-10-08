import request from "supertest";
import app from "../src/app";

describe("POST /users/filter with prisma query", () => {
  it("should return all users with empty filter", async () => {
    const response = await request(app)
      .post("/users/filter")
      .send()
      .expect(200);

    expect(response.body.isError).toBe(false);
    expect(response.body.body.data).toHaveLength(5);
  });

  it("should filter users by role", async () => {
    const filter = {
      and: [{ field: "role", operator: "eq", value: "admin" }],
      config: "prisma",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(200);

    expect(response.body.isError).toBe(false);
    expect(response.body.body.data).toHaveLength(2);
    expect(
      response.body.body.data.every((user: any) => user.role === "admin")
    ).toBe(true);
  });

  it("should filter users by age range", async () => {
    const filter = {
      and: [{ field: "age", operator: "between", value: [30, 40] }],
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(200);

    expect(response.body.isError).toBe(false);
    expect(
      response.body.body.data.every(
        (user: any) => user.age >= 30 && user.age <= 40
      )
    ).toBe(true);
  });

  it("should reject non-filterable fields", async () => {
    const filter = {
      and: [{ field: "password", operator: "eq", value: "test" }],
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("not filterable");
  });

  it("should reject invalid operators", async () => {
    const filter = {
      and: [{ field: "name", operator: "gt", value: "test" }],
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("not allowed for field");
  });

  it("should reject unsupported operator for field type", async () => {
    const filter = {
      and: [{ field: "age", operator: "contains", value: "test" }],
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("not allowed for field");
  });

  it("should reject type mismatch in value", async () => {
    const filter = {
      and: [{ field: "age", operator: "eq", value: "not_a_number" }],
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("is not a valid number");
  });

  it("should reject between operator with wrong number of values", async () => {
    const filter = {
      and: [{ field: "age", operator: "between", value: [30] }],
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("requires exactly two values");
  });

  it("should reject in operator with non-array value", async () => {
    const filter = {
      and: [{ field: "role", operator: "in", value: "admin" }],
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("requires an array of values");
  });

  it("should handle complex nested filters", async () => {
    const filter = {
      and: [
        { field: "age", operator: "gt", value: 30 },
        {
          or: [
            { field: "role", operator: "eq", value: "admin" },
            { field: "isActive", operator: "eq", value: true },
          ],
        },
      ],
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(200);

    expect(response.body.isError).toBe(false);
    expect(response.body.body.data.every((user: any) => user.age > 30)).toBe(
      true
    );
  });

  it("should reject mixed valid and invalid conditions in the same group", async () => {
    const filter = {
      and: [
        { field: "age", operator: "gt", value: 30 },
        { field: "password", operator: "eq", value: "secret" },
        { field: "role", operator: "eq", value: "admin" },
      ],
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("not filterable");
  });
});

describe("POST /users/filter with raw SQL query", () => {
  it("should return all users with empty filter", async () => {
    const response = await request(app)
      .post("/users/filter")
      .send({ config: "sql" })
      .expect(200);

    expect(response.body.isError).toBe(false);
    expect(response.body.body.data).toHaveLength(5);
  });

  it("should filter users by role", async () => {
    const filter = {
      and: [{ field: "role", operator: "eq", value: "admin" }],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(200);

    expect(response.body.isError).toBe(false);
    expect(response.body.body.data).toHaveLength(2);
    expect(
      response.body.body.data.every((user: any) => user.role === "admin")
    ).toBe(true);
  });

  it("should filter users by age range", async () => {
    const filter = {
      and: [{ field: "age", operator: "between", value: [30, 40] }],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(200);

    expect(response.body.isError).toBe(false);
    expect(
      response.body.body.data.every(
        (user: any) => user.age >= 30 && user.age <= 40
      )
    ).toBe(true);
  });

  it("should reject non-filterable fields", async () => {
    const filter = {
      and: [{ field: "password", operator: "eq", value: "test" }],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("not filterable");
  });

  it("should reject invalid operators", async () => {
    const filter = {
      and: [{ field: "name", operator: "gt", value: "test" }],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("not allowed for field");
  });

  it("should reject unsupported operator for field type", async () => {
    const filter = {
      and: [{ field: "age", operator: "contains", value: "test" }],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("not allowed for field");
  });

  it("should reject type mismatch in value", async () => {
    const filter = {
      and: [{ field: "age", operator: "eq", value: "not_a_number" }],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("is not a valid number");
  });

  it("should reject between operator with wrong number of values", async () => {
    const filter = {
      and: [{ field: "age", operator: "between", value: [30] }],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("requires exactly two values");
  });

  it("should reject in operator with non-array value", async () => {
    const filter = {
      and: [{ field: "role", operator: "in", value: "admin" }],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("requires an array of values");
  });

  it("should handle complex nested filters", async () => {
    const filter = {
      and: [
        { field: "age", operator: "gt", value: 30 },
        {
          or: [
            { field: "role", operator: "eq", value: "admin" },
            { field: "isActive", operator: "eq", value: true },
          ],
        },
      ],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(200);

    expect(response.body.isError).toBe(false);
    expect(response.body.body.data.every((user: any) => user.age > 30)).toBe(
      true
    );
  });

  it("should reject mixed valid and invalid conditions in the same group", async () => {
    const filter = {
      and: [
        { field: "age", operator: "gt", value: 30 },
        { field: "password", operator: "eq", value: "secret" },
        { field: "role", operator: "eq", value: "admin" },
      ],
      config: "sql",
    };

    const response = await request(app)
      .post("/users/filter")
      .send(filter)
      .expect(400);

    expect(response.body.isError).toBe(true);
    expect(response.body.body.message).toContain("not filterable");
  });
});

describe("GET /users/filter with encoded parameter", () => {
  it("should handle URL-encoded filter parameter", async () => {
    const filter = {
      and: [
        { field: "age", operator: "gt", value: 30 },
        {
          or: [
            { field: "role", operator: "eq", value: "admin" },
            { field: "isActive", operator: "eq", value: true },
          ],
        },
      ],
      config: "sql",
    };

    const encodedFilter = encodeURIComponent(JSON.stringify(filter));

    const response = await request(app)
      .get(`/users/filter?filter=${encodedFilter}`)
      .expect(200);

    expect(response.body.isError).toBe(false);
    expect(response.body.body.data.every((user: any) => user.age > 30)).toBe(
      true
    );
  });
});
