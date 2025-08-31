export const getUserRoom = (userId: string) => `user:${userId}`;
export const getRoleRoom = (role?: string) => {
  if (!role) {
    console.warn("⚠️ getRoleRoom called with undefined role");
    return "role:unknown";
  }
  return `role:${role.toLowerCase()}`;
};

export const getLabRoom = (labId: string) => `lab:${labId}`;
