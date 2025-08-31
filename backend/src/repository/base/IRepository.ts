// src/repository/base/IRepository.ts

export interface IRepository<T, CreateInput, UpdateInput> {
  findAll(): Promise<T[]>;
  findById(id: string | number): Promise<T | null>;
  create(data: CreateInput): Promise<T>;
  update(id: string | number, data: UpdateInput): Promise<T>;
  delete(id: string | number): Promise<T>;
  paginate(skip: number, take: number): Promise<T[]>;
}
