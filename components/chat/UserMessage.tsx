export default function UserMessage({ text }: { text: string }) {
  return (
    <div className="border-b border-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
            A
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-2 text-sm leading-7 text-slate-800">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
