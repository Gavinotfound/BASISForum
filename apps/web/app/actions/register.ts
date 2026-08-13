'use server';

import { db, users } from "@basis-forum/database";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

type RegisterState = { error?: string };

export async function registerUser(_previousState: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (name.length < 2 || name.length > 60) return { error: 'Enter a display name between 2 and 60 characters.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Use a password with at least 8 characters.' };

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      username: email.split('@')[0],
      role: 'student',
    });
  } catch {
    return { error: "User already exists" };
  }

  redirect('/login');
}
