import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Beats4U Assistant',
  description: 'Log in to your Beats4U account',
};

export default function LoginPage() {
  return (
    <div className="w-full flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
