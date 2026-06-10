// Shared header row for the hero dashboard widgets: icon bubble + title,
// with an optional `right` slot (e.g. carousel dots).
export default function WidgetHeader({ icon, title, right = null, className = "mb-3" }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <p className="text-white font-semibold text-xs uppercase tracking-wide">{title}</p>
      </div>
      {right}
    </div>
  );
}
