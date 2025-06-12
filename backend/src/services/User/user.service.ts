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

  async getUserById(id: number) {
    return this.userRepository.findById(id);
  }

  async createUser(data: CreateUserDTO) {
    return this.userRepository.create(data);
  }

  async updateUser(id: number, data: UpdateUserDTO) {
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }

  async updateProfile(id: number, profileData: UpdateUserDTO) {
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
