import prisma from "./db";

export const sampleUsers = [
  {
    id: 1,
    uuid: "550e8400-e29b-41d4-a716-446655440001",
    email: "admin@example.com",
    name: "Admin User",
    age: 35,
    role: "admin" as const,
    isActive: true,
    password: "hashedPassword1",
  },
  {
    id: 2,
    uuid: "550e8400-e29b-41d4-a716-446655440002",
    email: "john.doe@example.com",
    name: "John Doe",
    age: 28,
    role: "user" as const,
    isActive: true,
    password: "hashedPassword2",
  },
  {
    id: 3,
    uuid: "550e8400-e29b-41d4-a716-446655440003",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    age: 32,
    role: "moderator" as const,
    isActive: false,
    password: "hashedPassword3",
  },
  {
    id: 4,
    uuid: "550e8400-e29b-41d4-a716-446655440004",
    email: "bob.wilson@example.com",
    name: "Bob Wilson",
    age: 45,
    role: "user" as const,
    isActive: true,
    password: "hashedPassword4",
  },
  {
    id: 5,
    uuid: "550e8400-e29b-41d4-a716-446655440005",
    email: "alice.brown@example.com",
    name: "Alice Brown",
    age: 29,
    role: "admin" as const,
    isActive: true,
    password: "hashedPassword5",
  },
];

export async function seedUsers() {
  try {
    await prisma.user.deleteMany();

    for (const user of sampleUsers) {
      await prisma.user.create({
        data: user,
      });
    }

    console.log("Sample users seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// (async () => {
//   await seedUsers();
// })();
