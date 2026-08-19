export default function AbstainedNotice() {
  return (
    <div className="mb-4 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <span aria-hidden>⚠</span>
      <div>
        <div className="font-semibold">Insufficient evidence</div>
        <div className="mt-1 text-rose-700">
          The assistant could not establish enough supporting evidence for a reliable answer.
        </div>
      </div>
    </div>
  );
}
