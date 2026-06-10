import { getInitial, getTraitTags, genderColor } from '../lib/constants';

export default function StudentCard({ student, onEdit, onDelete }) {
  const tags = getTraitTags(student.characteristics);

  return (
    <div className="fade-in bg-white rounded-2xl shadow-sm border border-brand-100 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold text-brand-700 shrink-0"
          style={{ backgroundColor: student.avatarColor || genderColor(student.gender) }}
        >
          {getInitial(student.name)}
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-gray-800 truncate">{student.name}</p>
          <span
            className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-0.5"
            style={{ backgroundColor: genderColor(student.gender) }}
          >
            {student.gender === 'boy' ? '👦 Boy' : student.gender === 'girl' ? '👧 Girl' : '🧒 Other'}
          </span>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex gap-1 text-lg">
          {tags.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={() => onEdit(student)}
          className="flex-1 text-sm font-bold py-1.5 rounded-xl bg-pastel-blue text-blue-700 hover:brightness-95 transition"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(student)}
          className="flex-1 text-sm font-bold py-1.5 rounded-xl bg-pastel-pink text-pink-700 hover:brightness-95 transition"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
