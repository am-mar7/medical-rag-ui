import type { Metadata } from 'next';
import MedicalOnboardingForm from '@/components/auth/MedicalOnboardingForm';

export const metadata: Metadata = {
  title: 'Medical Profile | Beats4U Assistant',
  description: 'Initial cardiovascular health questionnaire for personalizing your Beats4U AI assistant',
};

export default function OnboardingPage() {
  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-6">
      <MedicalOnboardingForm />
    </div>
  );
}
