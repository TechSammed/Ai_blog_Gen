export default function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <p className="text-slate-600 text-base">{text}</p>
    </div>
  );
}
