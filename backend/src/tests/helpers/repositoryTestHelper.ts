import { createMockPrismaClient } from "@/tests/prisma-mock";
import { UserRepository } from "@/repository/user/UserRepository";
import { UserRole } from "@prisma/client";

describe("UserRepository", () => {
  const prisma = createMockPrismaClient();
  const repo = new UserRepository(prisma);

  const mockUser = {
    id: "1",
    user_name: "Alice",
    user_email: "alice@example.com",
    user_role: UserRole.USER,
    user_password: "",
    validation_key: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizationId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user by email", async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await repo.findByEmail("alice@example.com");

    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { user_email: "alice@example.com" },
    });
  });

  it("should return user by id", async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await repo.findById("1");

    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });

  it("should create a new user", async () => {
    prisma.user.create.mockResolvedValue(mockUser);

    const result = await repo.createUser(mockUser);

    expect(result).toEqual(mockUser);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: mockUser,
    });
  });

  it("should delete user by id", async () => {
    prisma.user.delete.mockResolvedValue(mockUser);

    const result = await repo.deleteUser("1");

    expect(result).toEqual(mockUser);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });
});
