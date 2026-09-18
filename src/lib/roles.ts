/**
 * Canonical role strings — matching the backend's Authorization policies
 * (see Absensi-Tefa Models/Auth.cs). 'Pelajar' is tolerated as a legacy
 * alias for 'Anggota' on the frontend only.
 */
export const ROLES = {
  ADMIN: 'Admin',
  PM: 'PM',
  GURU: 'Guru',
  ANGGOTA: 'Anggota',
  DEVOPS: 'DevOps',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** True if the given role is the student role ('Anggota' canonical, 'Pelajar' alias). */
export function isAnggota(role: string): boolean {
  return role === ROLES.ANGGOTA || role === 'Pelajar';
}

/** Canonicalize a legacy/alias role string to its canonical form. */
export function normalizeRole(role: string): Role {
  if (isAnggota(role)) return ROLES.ANGGOTA;
  if (role === ROLES.ADMIN) return ROLES.ADMIN;
  if (role === ROLES.PM) return ROLES.PM;
  if (role === ROLES.GURU) return ROLES.GURU;
  if (role === ROLES.DEVOPS) return ROLES.DEVOPS;
  return ROLES.ANGGOTA;
}

/** The home path (role landing page) for a given role. */
export function roleHomePath(role: string): string {
  switch (normalizeRole(role)) {
    case ROLES.ADMIN: return '/admin';
    case ROLES.PM: return '/pm';
    case ROLES.GURU: return '/guru';
    case ROLES.DEVOPS: return '/devops';
    default: return '/dashboard';
  }
}

/** Human-readable Indonesian label for a role. */
export const ROLE_LABELS: Record<Role, string> = {
  Admin: 'Administrator',
  PM: 'Project Manager',
  Guru: 'Guru Pengawas',
  Anggota: 'Pelajar',
  DevOps: 'DevOps Engineer',
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[normalizeRole(role)];
}
