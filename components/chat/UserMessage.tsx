export default function UserMessage({ text }: { text: string }) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800/60 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-sm font-semibold text-white shadow-sm">
            U
          </div>
          <div className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-blue-50/70 dark:bg-slate-900 px-4 py-2.5 text-sm leading-7 text-slate-900 dark:text-slate-100 shadow-sm">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
