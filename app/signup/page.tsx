import type { Metadata } from 'next';
import SignUpForm from '@/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up | Beats4U Assistant',
  description: 'Create an account for Beats4U Assistant',
};

export default function SignUpPage() {
  return (
    <div className="w-full flex items-center justify-center p-4">
      <SignUpForm />
    </div>
  );
}
