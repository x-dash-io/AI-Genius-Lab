export const ROLES = ["learner", "admin"] as const;

export type Role = (typeof ROLES)[number];

const roleRank: Record<Role, number> = {
  learner: 1,
  admin: 2,
};

export function hasRole(userRole: Role, requiredRole: Role) {
  return roleRank[userRole] >= roleRank[requiredRole];
}
