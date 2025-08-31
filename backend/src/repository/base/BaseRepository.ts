// src/repository/base/BaseRepository.ts

import { IRepository } from "./IRepository";
import { handlePrismaError } from "./prismaErrors";

export class BaseRepository<T, CreateInput, UpdateInput> implements IRepository<T, CreateInput, UpdateInput> {
  constructor(protected model: any) { }

  async findAll(): Promise<T[]> {
    try {
      return await this.model.findMany();
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async findById(id: string | number): Promise<T | null> {
    try {
      return await this.model.findUnique({ where: { id } });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async create(data: CreateInput): Promise<T> {
    try {
      return await this.model.create({ data });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async update(id: string | number, data: UpdateInput): Promise<T> {
    try {
      return await this.model.update({ where: { id }, data });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async delete(id: string | number): Promise<T> {
    try {
      return await this.model.delete({ where: { id } });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

  async paginate(skip: number, take: number): Promise<T[]> {
    try {
      return await this.model.findMany({ skip, take });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }
  async findManyBy(where: Partial<T>): Promise<T[]> {
    return this.model.findMany({ where });
  }
}
