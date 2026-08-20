import type { Metadata } from 'next';
import SignUpForm from '@/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up | Medical RAG Assistant',
  description: 'Create an account for Medical RAG Assistant',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 md:min-h-screen">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-8 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 shadow-2xl shadow-slate-200/50 dark:shadow-none">
        {/* Ambient Gradient Accents */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

        <SignUpForm />
      </div>
    </div>
  );
}
