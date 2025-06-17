import { prisma } from '../../repository/base/transaction';
import { BaseRepository } from '../../repository/base/BaseRepository';
import { User, UserRole } from '@prisma/client';

type CreateUserDTO = Pick<User, 'user_email' | 'user_name' | 'user_role'>;
type UpdateUserDTO = Partial<CreateUserDTO>;

export class UserService {
  private userRepository: BaseRepository<User, CreateUserDTO, UpdateUserDTO>;

  constructor() {
    this.userRepository = new BaseRepository(prisma.user);
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: CreateUserDTO) {
    return this.userRepository.create(data);
  }

  async updateUser(id: string, data: Partial<User>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async updateProfile(id: string, profileData: UpdateUserDTO) {
    return this.updateUser(id, profileData);
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { user_email: email } // ✅ fixed incorrect reference
    });
  }

  async searchUsers(name?: string, role?: UserRole) {
    return prisma.user.findMany({
      where: {
        AND: [
          name ? { user_name: { contains: name, mode: 'insensitive' } } : {},
          role ? { user_role: role } : {} // ✅ fixed reference to correct field
        ]
      },
      orderBy: { user_name: 'asc' }
    });
  }
}
