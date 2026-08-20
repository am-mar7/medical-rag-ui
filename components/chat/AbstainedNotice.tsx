export default function AbstainedNotice() {
  return (
    <div className="mb-4 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-200">
      <span aria-hidden>⚠</span>
      <div>
        <div className="font-semibold">Insufficient evidence</div>
        <div className="mt-1 text-rose-700 dark:text-rose-300">
          The assistant could not establish enough supporting evidence for a reliable answer.
        </div>
      </div>
    </div>
  );
}
