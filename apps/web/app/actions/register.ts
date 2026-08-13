'use server';

import { validateRegistration } from '@basis-forum/core';
import { db, users } from "@basis-forum/database";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

type RegisterState = { error?: string };

export async function registerUser(_previousState: RegisterState, formData: FormData): Promise<RegisterState> {
  const validation = validateRegistration({
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    password: String(formData.get('password') || ''),
  });

  if (!validation.ok) return { error: validation.error };

  const { name, email, password } = validation.data;
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
