import { PrismaClient } from "@prisma/client";

export class UserRepository {
  constructor(private prisma: PrismaClient) { }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { user_email: email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: any) {
    return this.prisma.user.create({
      data,
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
