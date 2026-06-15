// ──────────────────────────────────────────────────────────────────────────────
// The ANTS — Mock Database Facade
// ──────────────────────────────────────────────────────────────────────────────
//
// MVP Phase 1: All features import data from this single facade.
// When Supabase is connected, these functions will be replaced with
// real database queries — but the function signatures stay the same.
//
// ⚠️  NEVER hardcode mock arrays inside component files.
//     Always import from '@/lib/mock/database'.
// ──────────────────────────────────────────────────────────────────────────────

import { Profile, AuthUser, UserRole } from '@/types';

// ── Mock User Profiles ──────────────────────────────────────────────────────

const mockProfiles: Profile[] = [
  {
    id: 'user-student-001',
    email: 'thiri@theants.edu',
    name: 'Thiri Aung',
    avatar: '',
    role: 'student',
    bio: 'IGCSE student aiming for straight A*s. Love physics and maths!',
    title: 'IGCSE Student',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'user-teacher-001',
    email: 'u.kyaw@theants.edu',
    name: 'U Kyaw Min',
    avatar: '',
    role: 'teacher',
    bio: 'Experienced A Level Chemistry teacher with 10+ years of tutoring Myanmar students.',
    title: 'A Level Chemistry Teacher',
    createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'user-contributor-001',
    email: 'aye.chan@theants.edu',
    name: 'Aye Chan Thu',
    avatar: '',
    role: 'contributor',
    bio: 'Cambridge-trained educator building curriculum resources for Myanmar students.',
    title: 'Curriculum Developer',
    socialLinks: {
      github: 'https://github.com/ayechanthu',
      linkedin: 'https://linkedin.com/in/ayechanthu',
    },
    createdAt: '2025-06-20T08:00:00Z',
  },
  {
    id: 'user-main-contributor-001',
    email: 'daw.hla@theants.edu',
    name: 'Daw Hla Myint',
    avatar: '',
    role: 'main_contributor',
    bio: 'Senior gatekeeper and lead reviewer. 15 years in international education.',
    title: 'Head of Content',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/dawhlamyint',
      website: 'https://dawhlamyint.com',
    },
    createdAt: '2025-03-10T08:00:00Z',
  },
];

// ── Password Store (mock only — never do this in production!) ────────────────

const mockPasswords: Record<string, string> = {
  'thiri@theants.edu': 'student123',
  'u.kyaw@theants.edu': 'teacher123',
  'aye.chan@theants.edu': 'contributor123',
  'daw.hla@theants.edu': 'maincontributor123',
};

// ── Auth Functions ───────────────────────────────────────────────────────────

/**
 * Authenticate a user with email and password.
 * Returns the AuthUser on success, null on failure.
 */
export function mockLogin(email: string, password: string): AuthUser | null {
  const normalizedEmail = email.toLowerCase().trim();
  const storedPassword = mockPasswords[normalizedEmail];

  if (!storedPassword || storedPassword !== password) {
    return null;
  }

  const profile = mockProfiles.find((p) => p.email === normalizedEmail);
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    profile,
  };
}

/**
 * Register a new user with email, password, name, and role.
 * Returns the created AuthUser. In production, this would create a
 * Supabase auth user + profile row.
 */
export function mockSignup(
  email: string,
  password: string,
  name: string,
  role: UserRole
): AuthUser | { error: string } {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists
  if (mockPasswords[normalizedEmail]) {
    return { error: 'An account with this email already exists.' };
  }

  const newProfile: Profile = {
    id: `user-${role}-${Date.now()}`,
    email: normalizedEmail,
    name,
    avatar: '',
    role,
    createdAt: new Date().toISOString(),
  };

  // Add to in-memory stores
  mockProfiles.push(newProfile);
  mockPasswords[normalizedEmail] = password;

  return {
    id: newProfile.id,
    email: newProfile.email,
    profile: newProfile,
  };
}

// ── Profile Queries ──────────────────────────────────────────────────────────

/** Get a single profile by user ID */
export function getProfile(userId: string): Profile | undefined {
  return mockProfiles.find((p) => p.id === userId);
}

/** Get a profile by email */
export function getProfileByEmail(email: string): Profile | undefined {
  return mockProfiles.find((p) => p.email === email.toLowerCase().trim());
}

/** Get all profiles (admin use) */
export function getAllProfiles(): Profile[] {
  return [...mockProfiles];
}

/** Get all profiles with a specific role */
export function getProfilesByRole(role: UserRole): Profile[] {
  return mockProfiles.filter((p) => p.role === role);
}

// ── Type Guard ───────────────────────────────────────────────────────────────

/** Check if a signup result is an error */
export function isSignupError(
  result: AuthUser | { error: string }
): result is { error: string } {
  return 'error' in result;
}
