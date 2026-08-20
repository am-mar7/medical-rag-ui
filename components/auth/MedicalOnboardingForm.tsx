'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function MedicalOnboardingForm() {
  const router = useRouter();
  const { savePersonalMemory } = useAuth();

  const [step, setStep] = useState(1);
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [bpStatus, setBpStatus] = useState<string>('');
  const [cardioHistory, setCardioHistory] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMultiSelect = (item: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (item === 'None') {
      setState(['None']);
      return;
    }
    const filtered = state.filter((i) => i !== 'None');
    if (filtered.includes(item)) {
      const updated = filtered.filter((i) => i !== item);
      setState(updated.length ? updated : []);
    } else {
      setState([...filtered, item]);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const summaryParts: string[] = [];

      if (ageGroup) {
        summaryParts.push(`Age Group: ${ageGroup}`);
      }
      if (bpStatus) {
        summaryParts.push(`Blood Pressure Status: ${bpStatus}`);
      }
      if (cardioHistory.length > 0) {
        summaryParts.push(`Cardiovascular History: ${cardioHistory.join(', ')}`);
      }
      if (medications.length > 0) {
        summaryParts.push(`Current Medications: ${medications.join(', ')}`);
      }
      if (riskFactors.length > 0) {
        summaryParts.push(`Risk Factors: ${riskFactors.join(', ')}`);
      }
      if (customNotes.trim()) {
        summaryParts.push(`Additional Notes: ${customNotes.trim()}`);
      }

      const medicalProfileText = `Initial Cardiovascular Medical Profile: ${summaryParts.join(' | ')}`;

      // Save to personal memory context
      await savePersonalMemory(medicalProfileText);
      localStorage.setItem('medical_rag_onboarding_completed', 'true');

      // Navigate to chat
      router.push('/chat');
    } catch (err) {
      console.error('Error saving medical profile onboarding:', err);
      router.push('/chat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-sm">
          <img src="/logo.png" alt="Beats4U Logo" className="h-full w-full object-contain" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Initial Medical Profile – Cardiovascular Health
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Welcome! Please answer these quick questions so your AI clinical assistant understands your health background and provides tailored, evidence-grounded guidance.
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        {[
          { num: 1, label: 'Age & Blood Pressure' },
          { num: 2, label: 'Heart History & Meds' },
          { num: 3, label: 'Risk Factors & Notes' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex items-center gap-2 cursor-pointer transition ${
              step === s.num ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 font-medium opacity-70'
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition ${
                step === s.num
                  ? 'bg-blue-600 text-white shadow'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </span>
            <span className="hidden sm:inline text-xs">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl shadow-slate-100 dark:shadow-none space-y-6">
        <form onSubmit={step === 3 ? handleComplete : (e) => { e.preventDefault(); setStep(step + 1); }}>
          {/* STEP 1: Age Group & Blood Pressure */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Question 1: Age Group */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-900 dark:text-white">
                  1. Age Group
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'under40', label: 'Under 40 Years' },
                    { id: '40-59', label: '40 - 59 Years' },
                    { id: '60plus', label: '60+ Years' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAgeGroup(opt.label)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                        ageGroup === opt.label
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Blood Pressure Status */}
              <div className="space-y-3 pt-2">
                <label className="block text-base font-semibold text-slate-900 dark:text-white">
                  2. Blood Pressure / Hypertension Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'diagnosed', label: 'Diagnosed Hypertension', desc: 'Prescribed or confirmed high BP' },
                    { id: 'borderline', label: 'Prehypertension / Borderline', desc: 'Slightly elevated BP levels' },
                    { id: 'normal', label: 'Normal Blood Pressure', desc: 'BP within healthy normal range' },
                    { id: 'unsure', label: 'Not Sure / Unchecked', desc: 'Have not measured BP recently' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBpStatus(opt.label)}
                      className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                        bpStatus === opt.label
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!ageGroup || !bpStatus}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-40 transition shadow"
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Heart History & Current Medications */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Question 3: Cardiovascular History */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-900 dark:text-white">
                  3. Cardiovascular History
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'angina', label: 'Angina / Chest Pain' },
                    { id: 'heart_attack', label: 'Prior Heart Attack or Stroke' },
                    { id: 'arrhythmia', label: 'Arrhythmia / Palpitations' },
                    { id: 'none_cardio', label: 'None' },
                  ].map((opt) => {
                    const selected = cardioHistory.includes(opt.label);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleMultiSelect(opt.label, cardioHistory, setCardioHistory)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                          selected
                            ? 'border-blue-600 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-sm">{opt.label}</span>
                        <span className={`h-5 w-5 rounded-full border flex items-center justify-center text-xs ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 4: Current Medications */}
              <div className="space-y-3 pt-2">
                <label className="block text-base font-semibold text-slate-900 dark:text-white">
                  4. Current Cardiovascular Medications
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'anti_hypertensive', label: 'Anti-hypertensives (e.g. Lisinopril, Amlodipine)' },
                    { id: 'aspirin', label: 'Aspirin or Blood Thinners' },
                    { id: 'statins', label: 'Statins / Cholesterol Lowering' },
                    { id: 'no_meds', label: 'None' },
                  ].map((opt) => {
                    const selected = medications.includes(opt.label);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleMultiSelect(opt.label, medications, setMedications)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                          selected
                            ? 'border-blue-600 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xs sm:text-sm">{opt.label}</span>
                        <span className={`h-5 w-5 rounded-full border flex items-center justify-center text-xs ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={cardioHistory.length === 0 || medications.length === 0}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-40 transition shadow"
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Risk Factors & Additional Notes */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Question 5: Risk Factors */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-900 dark:text-white">
                  5. Risk Factors & Health Habits
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'smoker', label: 'Smoker' },
                    { id: 'cholesterol', label: 'High Cholesterol' },
                    { id: 'diabetes', label: 'Diabetes' },
                    { id: 'family_history', label: 'Family Heart History' },
                    { id: 'no_risk', label: 'None' },
                  ].map((opt) => {
                    const selected = riskFactors.includes(opt.label);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleMultiSelect(opt.label, riskFactors, setRiskFactors)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                          selected
                            ? 'border-blue-600 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xs sm:text-sm">{opt.label}</span>
                        <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 6: Custom Notes */}
              <div className="space-y-2 pt-2">
                <label className="block text-base font-semibold text-slate-900 dark:text-white">
                  6. Additional Symptoms or Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Occasional occipital headaches during exertion, taking daily multivitamins..."
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || riskFactors.length === 0}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50 transition shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? (
                    'Saving Medical Profile...'
                  ) : (
                    <>
                      <span>Save & Start Chat</span>
                      <span>✨</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
