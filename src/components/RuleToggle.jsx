function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
        checked ? 'bg-brand-400' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function HardRuleToggle({ label, enabled, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-brand-50 last:border-b-0">
      <div>
        <p className="font-bold text-gray-700">{label}</p>
        {!enabled && (
          <p className="text-xs text-orange-500 font-semibold mt-1">
            ⚠️ Turning this off may affect student wellbeing
          </p>
        )}
      </div>
      <Toggle checked={enabled} onChange={onChange} />
    </div>
  );
}

export function SoftRuleToggle({ label, description, enabled, priority, onToggle, onPriorityChange }) {
  return (
    <div className="py-3 border-b border-brand-50 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-gray-700">{label}</p>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      {enabled && (
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-bold text-gray-400">Low</span>
          <input
            type="range"
            min={1}
            max={5}
            value={priority}
            onChange={(e) => onPriorityChange(Number(e.target.value))}
            className="flex-1 accent-brand-500"
          />
          <span className="text-xs font-bold text-gray-400">High</span>
          <span className="text-sm font-extrabold text-brand-600 w-5 text-center">{priority}</span>
        </div>
      )}
    </div>
  );
}
