function countSeated(grid) {
  if (!grid) return 0;
  return grid.flat().filter(Boolean).length;
}

export default function HistoryList({ history, onPreview, onDelete, onExport }) {
  if (history.length === 0) {
    return (
      <div className="text-center py-16 fade-in">
        <p className="text-5xl mb-3">📋</p>
        <p className="text-lg font-bold text-gray-600">No history yet</p>
        <p className="text-gray-400 mt-1">Generate a weekly map and it'll show up here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 flex items-center justify-between gap-3 flex-wrap"
        >
          <button onClick={() => onPreview(entry)} className="text-left flex-1 min-w-[160px]">
            <p className="font-extrabold text-gray-800">{entry.weekLabel}</p>
            <p className="text-sm text-gray-400">
              {new Date(entry.date).toLocaleDateString()} · {countSeated(entry.grid)} students seated
            </p>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onExport(entry)}
              className="px-3 py-1.5 rounded-xl text-sm font-bold bg-pastel-blue text-blue-700 hover:brightness-95 transition"
            >
              📄 Export PDF
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="px-3 py-1.5 rounded-xl text-sm font-bold bg-pastel-pink text-pink-700 hover:brightness-95 transition"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
