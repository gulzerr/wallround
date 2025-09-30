# Backend Query Builder and Filter Library

A Node.js backend service that provides a reusable filter library for building complex database queries with field exposure restrictions and type-safe validation.

## Features

- **Reusable Filter Library**: Type-safe filter definitions with validation
- **Field Exposure Restriction**: Only explicitly allowed fields can be filtered
- **Complex Query Support**: Nested AND/OR groups with multiple operators
- **Multiple Query Builders**: Extensible architecture supporting both ORM and raw SQL query
- **Comprehensive Validation**: Type checking, operator validation, and special rules
- **REST API**: Both GET and POST endpoints for filtering
- **Full Test Coverage**: Unit and integration tests

## Tech Stack

- **Node.js** (LTS) with **TypeScript** (strict mode)
- **Express.js**
- **Prisma** ORM for database operations
- **Jest** for testing
- **PostgreSQL** database

## Setup Instructions

### Prerequisites

- Node.js (LTS version)
- PostgreSQL database
- Yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:gulzerr/wallround.git
   cd wallround
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file with your database configuration:

   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/wallround"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   ```

   The run the following queries in database

   ````sql
   -- Create the role enum
    CREATE TYPE role AS ENUM ('user', 'admin', 'moderator');
    DROP TYPE "role";

    -- Create the users table
    CREATE TABLE "users" (
      id SERIAL PRIMARY KEY,
      uuid TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      role "role" DEFAULT 'user',
      "isActive" BOOLEAN DEFAULT true,
      password TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
       ```

   ````

5. **Start the development server**
   ```bash
   yarn dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Filter Users

#### POST /users/filter

Filter users using JSON in request body.

**Request Body:**

```json
{
  "and": [
    { "field": "age", "operator": "gt", "value": 30 },
    {
      "or": [
        { "field": "role", "operator": "eq", "value": "admin" },
        { "field": "isActive", "operator": "eq", "value": true }
      ]
    }
  ]
}
```

#### GET /users/filter

Filter users using URL-encoded query parameter.

**Query Parameter:**

```
GET /users/filter?filter=%7B%0A%20%20%22and%22%3A%20%5B%0A%20%20%20%20%7B%20%22field%22%3A%20%22age%22,%20%22operator%22%3A%20%22gt%22,%20%22value%22%3A%2030%20%7D,%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22or%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%7B%20%22field%22%3A%20%22role%22,%20%22operator%22%3A%20%22eq%22,%20%22value%22%3A%20%22admin%22%20%7D,%0A%20%20%20%20%20%20%20%20%7B%20%22field%22%3A%20%22isActive%22,%20%22operator%22%3A%20%22eq%22,%20%22value%22%3A%20true%20%7D%0A%20%20%20%20%20%20%5D%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D
```

**Response Examples:**

**Success Response:**

```json
{
  "isError": false,
  "body": {
    "message": "Users filtered successfully",
    "data": [
      {
        "id": 1,
        "email": "admin@example.com",
        "name": "Admin User",
        "age": 35,
        "role": "admin",
        "isActive": true,
        "createdAt": "2025-09-27T12:13:35.390Z"
      },
      {
        "id": 4,
        "email": "bob.wilson@example.com",
        "name": "Bob Wilson",
        "age": 45,
        "role": "user",
        "isActive": true,
        "createdAt": "2025-09-27T12:13:35.397Z"
      }
    ]
  }
}
```

**Validation Error Response:**

```json
{
  "isError": true,
  "body": {
    "message": "\"Filter validation failed: Field 'password' is not filterable\""
  }
}
```

## Filter JSON Format

### Structure

```json
{
  "and": [...],  // Array of conditions or nested groups
  "or": [...]    // Array of conditions or nested groups
}
```

### Conditions

```json
{
  "field": "fieldName",
  "operator": "operatorName",
  "value": "fieldValue"
}
```

### Supported Operators

| Operator      | Description           | Example                                                           |
| ------------- | --------------------- | ----------------------------------------------------------------- |
| `eq`          | Equals                | `{"field": "name", "operator": "eq", "value": "John"}`            |
| `neq`         | Not equals            | `{"field": "role", "operator": "neq", "value": "admin"}`          |
| `gt`          | Greater than          | `{"field": "age", "operator": "gt", "value": 25}`                 |
| `lt`          | Less than             | `{"field": "age", "operator": "lt", "value": 65}`                 |
| `gte`         | Greater than or equal | `{"field": "age", "operator": "gte", "value": 18}`                |
| `lte`         | Less than or equal    | `{"field": "age", "operator": "lte", "value": 100}`               |
| `in`          | In array              | `{"field": "role", "operator": "in", "value": ["admin", "user"]}` |
| `between`     | Between two values    | `{"field": "age", "operator": "between", "value": [25, 35]}`      |
| `contains`    | String contains       | `{"field": "name", "operator": "contains", "value": "John"}`      |
| `starts_with` | String starts with    | `{"field": "email", "operator": "starts_with", "value": "admin"}` |
| `ends_with`   | String ends with      | `{"field": "email", "operator": "ends_with", "value": ".com"}`    |
| `is_null`     | Is null               | `{"field": "deletedAt", "operator": "is_null"}`                   |
| `is_not_null` | Is not null           | `{"field": "lastLogin", "operator": "is_not_null"}`               |

### Filterable Fields

| Field       | Type    | Allowed Operators                         |
| ----------- | ------- | ----------------------------------------- |
| `id`        | uuid    | eq, neq, in                               |
| `email`     | string  | eq, neq, contains, starts_with, ends_with |
| `name`      | string  | eq, neq, contains, starts_with, ends_with |
| `age`       | number  | eq, neq, gt, lt, gte, lte, between, in    |
| `role`      | enum    | eq, neq, in                               |
| `isActive`  | boolean | eq, neq                                   |
| `createdAt` | date    | eq, neq, gt, lt, gte, lte, between        |

**Note:** The `password` field is not filterable for security reasons.

## Example Requests

### Simple Filter

```bash
curl -X POST http://localhost:3000/api/users/filter \
  -H "Content-Type: application/json" \
  -d '{
    "and": [
      {"field": "role", "operator": "eq", "value": "admin"}
    ]
  }'
```

### Complex Nested Filter

```bash
curl --request POST \
  --url http://127.0.0.1:3000/users/filter \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/11.4.0' \
  --data '{
	"and": [
		{
			"field": "age",
			"operator": "gt",
			"value": 30
		},
		{
			"or": [
				{
					"field": "role",
					"operator": "eq",
					"value": "admin"
				},
				{
					"field": "password",
					"operator": "eq",
					"value": true
				}
			]
		}
	],
	"config": "sql"
}'
```

### GET Request with URL Parameter

```bash
curl --request GET \
  --url 'http://127.0.0.1:3000/users/filter?filter=%257B%250A%2520%2520%2522and%2522%253A%2520%255B%250A%2520%2520%2520%2520%257B%2520%2522field%2522%253A%2520%2522age%2522%252C%2520%2522operator%2522%253A%2520%2522gt%2522%252C%2520%2522value%2522%253A%252030%2520%257D%252C%250A%2520%2520%2520%2520%257B%250A%2520%2520%2520%2520%2520%2520%2522or%2522%253A%2520%255B%250A%2520%2520%2520%2520%2520%2520%2520%2520%257B%2520%2522field%2522%253A%2520%2522role%2522%252C%2520%2522operator%2522%253A%2520%2522eq%2522%252C%2520%2522value%2522%253A%2520%2522admin%2522%2520%257D%252C%250A%2520%2520%2520%2520%2520%2520%2520%2520%257B%2520%2522field%2522%253A%2520%2522isActive%2522%252C%2520%2522operator%2522%253A%2520%2522eq%2522%252C%2520%2522value%2522%253A%2520true%2520%257D%250A%2520%2520%2520%2520%2520%2520%255D%250A%2520%2520%2520%2520%257D%250A%2520%2520%255D%250A%257D' \
  --header 'User-Agent: insomnia/11.4.0'
```

## Testing

### Run All Tests

```bash
yarn test
```

### Run only the end to end test

```bash
yarn test tests/user-filter.integration.test.ts
```

### E2E Test Result

![Test Result](E2E-test-result.png)

### Test Categories

- **Unit Tests**: Filter validation, query building, type checking
- **Integration Tests**: API endpoints, database queries, error handling

## Design Decisions

### 1. **Modular Architecture**

- Separated concerns: validation, query building, and API handling
- Each component has a single responsibility
- Easy to test and maintain

### 2. **Type Safety**

- Full TypeScript implementation with strict mode
- Comprehensive type definitions for all filter components
- Compile-time error detection

### 3. **Field Exposure Control**

- Schema-based approach for defining filterable fields
- Validation enforced at the library level, not just API level
- Clear error messages for unauthorized field access

### 4. **Extensible Query Builders**

- Interface-based design allows plugging different query builders
- Currently supports Raw SQL and Prisma, easily extensible to other ORMs
- Query building logic separated from validation logic

### 5. **Comprehensive Validation**

- Multi-layer validation: structure, fields, operators, types, values
- Special validation rules for specific operators (between, in, null checks)
- Detailed error messages for debugging

### 6. **Security First**

- Password field explicitly marked as non-filterable
- Input validation prevents injection attacks
- Type checking prevents unexpected data types

## Extending the Filter Library

### Adding New Field Types

1. **Update the FieldType union**:

```typescript
// src/lib/filter/types.ts
export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "uuid"
  | "custom";
```

### Adding New Operators

1. **Update the Operator union**:

```typescript
// src/lib/filter/types.ts
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
  | "is_not_null"
  | "custom_operator";
```

## Sample Data

The application includes sample users for testing:

- **Admin User** (admin@example.com) - Admin role, age 35, active
- **John Doe** (john.doe@example.com) - User role, age 28, active
- **Jane Smith** (jane.smith@example.com) - Moderator role, age 32, inactive
- **Bob Wilson** (bob.wilson@example.com) - User role, age 45, active
- **Alice Brown** (alice.brown@example.com) - Admin role, age 29, active

## SQL query for creating these datasets

## Error Handling

```sql
-- Insert sample users data
INSERT INTO "users" ( uuid, email, name, age, role, isActive, password) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', 'Admin User', 35, 'admin'::role, true, 'hashedPassword1'),
('550e8400-e29b-41d4-a716-446655440002', 'john.doe@example.com', 'John Doe', 28, 'user'::role, true, 'hashedPassword2'),
('550e8400-e29b-41d4-a716-446655440003', 'jane.smith@example.com', 'Jane Smith', 32, 'moderator'::role, false, 'hashedPassword3'),
('550e8400-e29b-41d4-a716-446655440004', 'bob.wilson@example.com', 'Bob Wilson', 45, 'user'::role, true, 'hashedPassword4'),
('550e8400-e29b-41d4-a716-446655440005', 'alice.brown@example.com', 'Alice Brown', 29, 'admin'::role, true, 'hashedPassword5');
```

The API handles various error scenarios:

- **400 Bad Request**: Invalid filter structure, non-filterable fields, type mismatches
- **500 Internal Server Error**: Database connection issues, unexpected errors

All errors include descriptive messages to help with debugging.

## Performance Considerations

- Efficient Prisma queries with proper indexing
- Validation happens before database queries
- Minimal data transfer (password field excluded from responses)
- Query optimization through proper WHERE clause generation

## Security Features

- Field exposure restriction prevents sensitive data access
- Input validation prevents injection attacks
- Type safety prevents unexpected data manipulation
- Password field explicitly excluded from all operations
