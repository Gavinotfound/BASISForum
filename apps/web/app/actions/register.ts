'use server';

import { db, users } from "@basis-forum/database";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

type RegisterState = { error?: string };

export async function registerUser(_previousState: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: "Missing fields" };

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
