export function SteelBackdrop() {
  return (
    <div className="steel-backdrop" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-steel-bright/30 to-transparent" />
    </div>
  );
}