export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#2e335b]">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#cdd0e5] border-t-[#2e335b]" />
      {label && <p className="text-xs sm:text-sm font-medium text-[#2e335b]/75">{label}</p>}
    </div>
  );
}
