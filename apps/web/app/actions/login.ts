'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export type LoginState = {
  error?: string;
};

export async function loginUser(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: '请输入邮箱和密码。' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/',
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return { error: '邮箱或密码不正确，请重试。' };
      }
      return { error: '暂时无法登录，请稍后重试。' };
    }

    throw error;
  }
}
