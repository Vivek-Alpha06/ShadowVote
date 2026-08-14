export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-shadow-purple" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
