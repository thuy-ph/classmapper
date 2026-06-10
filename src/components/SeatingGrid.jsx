import { buildSeats } from '../lib/seatingAlgorithm';
import { getInitial, getTraitTags, genderColor } from '../lib/constants';

function SeatCell({ student }) {
  if (!student) {
    return (
      <div className="flex items-center justify-center text-xs font-bold text-brand-200 border-2 border-dashed border-brand-200 rounded-2xl bg-white/40 min-h-[84px]">
        empty seat
      </div>
    );
  }

  const tags = getTraitTags(student.characteristics);

  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white shadow-sm border border-brand-100 min-h-[84px] p-2 text-center">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm text-brand-700"
        style={{ backgroundColor: student.avatarColor || genderColor(student.gender) }}
      >
        {getInitial(student.name)}
      </div>
      <p className="text-xs font-bold text-gray-700 leading-tight truncate w-full">{student.name}</p>
      {tags.length > 0 && (
        <div className="flex gap-0.5 text-sm leading-none">
          {tags.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SeatingGrid({ grid, students, layout }) {
  if (!grid) return null;

  const studentsById = Object.fromEntries(students.map((s) => [s.id, s]));
  const seats = buildSeats(layout);
  const seatSet = new Set(seats.map((s) => `${s.row}-${s.col}`));

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-pastel-lavender border-2 border-dashed border-brand-300 rounded-2xl py-2 text-center font-extrabold text-brand-600 text-sm">
        🧑‍🏫 Teacher's Desk
      </div>
      <div
        className="grid gap-2 md:gap-3"
        style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
      >
        {grid.map((row, r) =>
          row.map((studentId, c) => {
            const key = `${r}-${c}`;
            if (!seatSet.has(key)) {
              return <div key={key} className="min-h-[84px]" />;
            }
            return (
              <div key={key}>
                <SeatCell student={studentId ? studentsById[studentId] : null} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
