import { createMockPrismaClient } from "../../tests/prisma-mock";
import { LabRepository } from "@src/repository/lab/LabRepository";
import { Prisma, Lab, LabStatus } from "@prisma/client";

describe("LabRepository", () => {
  const prisma = createMockPrismaClient();
  const repo = new LabRepository(prisma);

  const mockLabCreateInput: Prisma.LabCreateInput = {
    lab_name: "Physics Lab",
    lab_capacity: 30,
    status: LabStatus.ACTIVE,
    location: "Block A",
    description: "Handles experiments",
    organization: { connect: { id: "org-1" } },
    admin: { connect: { id: "admin-1" } }
  };

  const mockLabResult: Lab = {
    id: "1",
    lab_name: "Physics Lab",
    lab_capacity: 30,
    status: LabStatus.ACTIVE,
    location: "Block A",
    description: "Handles experiments",
    organizationId: "org-1",
    adminId: "admin-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    isOccupied: false
  };

  it("should return all labs", async () => {
    prisma.lab.findMany.mockResolvedValue([mockLabResult]);

    const result = await repo.getAllLabs();

    expect(result).toEqual([mockLabResult]);
    expect(prisma.lab.findMany).toHaveBeenCalled();
  });

  it("should return lab by ID", async () => {
    prisma.lab.findUnique.mockResolvedValue(mockLabResult);

    const result = await repo.getLabById("1");

    expect(result).toEqual(mockLabResult);
    expect(prisma.lab.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });

  it("should create a lab", async () => {
    prisma.lab.create.mockResolvedValue(mockLabResult);

    const result = await repo.createLab(mockLabCreateInput);

    expect(result).toEqual(mockLabResult);
    expect(prisma.lab.create).toHaveBeenCalledWith({
      data: mockLabCreateInput,
    });
  });

  it("should delete a lab", async () => {
    prisma.lab.delete.mockResolvedValue(mockLabResult);

    const result = await repo.deleteLab("1");

    expect(result).toEqual(mockLabResult);
    expect(prisma.lab.delete).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });
});
