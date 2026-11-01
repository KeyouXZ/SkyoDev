'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createUserSession, removeUserFromSession } from './core/session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@/types/roles';

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  role: z.number().int().optional(),
});

export async function signIn(unsafeData: z.infer<typeof signInSchema>) {
  const result = signInSchema.safeParse(unsafeData);

  if (!result.success) {
    return { success: false, error: 'Invalid email or password format' };
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        name: true,
        profileImageUrl: true,
      },
    });

    if (!user || !user.password) {
      return { success: false, error: 'Invalid credentials' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid credentials' };
    }

    const cookieStore = await cookies();
    await createUserSession(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      },
      cookieStore
    );

    return { success: true };
  } catch (error) {
    console.error('Sign-in error:', error);
    return { success: false, error: 'Internal authentication error' };
  }
}

export async function signUp(unsafeData: z.infer<typeof signUpSchema>) {
  const result = signUpSchema.safeParse(unsafeData);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Invalid registration data' };
  }

  const { email, password, firstName, lastName, role } = result.data;
  const displayName = result.data.name ?? (firstName || lastName ? `${firstName ?? ''} ${lastName ?? ''}`.trim() : null);

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: 'A user with this email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role ?? Role.USER;

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        name: displayName,
        role: assignedRole,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        profileImageUrl: true,
      },
    });

    const cookieStore = await cookies();
    await createUserSession(newUser, cookieStore);

    return { success: true };
  } catch (error) {
    console.error('Sign-up error:', error);
    return { success: false, error: 'Failed to create user account' };
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  await removeUserFromSession(cookieStore);
  redirect('/login');
}
