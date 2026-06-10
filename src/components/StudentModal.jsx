import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  GENDER_OPTIONS,
  ATTENTION_OPTIONS,
  ENERGY_OPTIONS,
  SOCIAL_OPTIONS,
  ACADEMIC_OPTIONS,
  BEHAVIOR_OPTIONS,
  SPECIAL_NEEDS_OPTIONS,
  randomAvatarColor,
} from '../lib/constants';

const EMPTY_STUDENT = {
  id: null,
  name: '',
  gender: 'boy',
  avatarColor: null,
  characteristics: {
    attention: 'average',
    energy: 'moderate',
    social: 'middle',
    academicPace: 'on-track',
    behavior: 'neutral',
    specialNeeds: [],
    workWellWith: [],
    avoidWith: [],
  },
};

function SegmentedButtons({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-sm font-bold text-gray-700 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition border-2 ${
              value === opt.value
                ? 'bg-brand-400 border-brand-400 text-white'
                : 'bg-white border-brand-100 text-gray-600 hover:border-brand-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, options, values, onToggle }) {
  return (
    <div>
      <p className="text-sm font-bold text-gray-700 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = values.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold cursor-pointer border-2 transition ${
                checked
                  ? 'bg-pastel-yellow border-yellow-300 text-yellow-800'
                  : 'bg-white border-brand-100 text-gray-600 hover:border-brand-300'
              }`}
            >
              <input
                type="checkbox"
                className="accent-brand-500"
                checked={checked}
                onChange={() => onToggle(opt.value)}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function StudentMultiSelect({ label, options, values, onToggle, emptyText }) {
  return (
    <div>
      <p className="text-sm font-bold text-gray-700 mb-1.5">{label}</p>
      {options.length === 0 ? (
        <p className="text-sm text-gray-400 italic">{emptyText}</p>
      ) : (
        <div className="max-h-32 overflow-y-auto flex flex-col gap-1 border-2 border-brand-100 rounded-xl p-2 bg-white">
          {options.map((opt) => {
            const checked = values.includes(opt.value);
            return (
              <label key={opt.value} className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-brand-50 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  className="accent-brand-500"
                  checked={checked}
                  onChange={() => onToggle(opt.value)}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentModal({ student, allStudents, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    student
      ? {
          ...EMPTY_STUDENT,
          ...student,
          characteristics: { ...EMPTY_STUDENT.characteristics, ...student.characteristics },
        }
      : { ...EMPTY_STUDENT, characteristics: { ...EMPTY_STUDENT.characteristics } }
  );

  const updateChar = (key, value) => {
    setForm((f) => ({ ...f, characteristics: { ...f.characteristics, [key]: value } }));
  };

  const toggleListValue = (key, value) => {
    setForm((f) => {
      const list = f.characteristics[key] || [];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, characteristics: { ...f.characteristics, [key]: next } };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const toSave = {
      ...form,
      id: form.id || uuidv4(),
      avatarColor: form.avatarColor || randomAvatarColor(),
    };
    onSave(toSave);
  };

  const otherStudents = allStudents.filter((s) => s.id !== form.id);
  const studentOptions = otherStudents.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 p-0 md:p-4">
      <div className="fade-in bg-white rounded-t-3xl md:rounded-3xl shadow-xl w-full md:max-w-2xl max-h-[92vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-5 md:p-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-brand-700">
              {student ? '✏️ Edit Student' : '➕ Add Student'}
            </h2>
            <button type="button" onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-1.5">Name</p>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Maya"
              className="w-full px-3 py-2 rounded-xl border-2 border-brand-100 focus:border-brand-400 focus:outline-none"
            />
          </div>

          <SegmentedButtons
            label="Gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={(v) => setForm((f) => ({ ...f, gender: v }))}
          />

          <SegmentedButtons
            label="Attention span"
            options={ATTENTION_OPTIONS}
            value={form.characteristics.attention}
            onChange={(v) => updateChar('attention', v)}
          />

          <SegmentedButtons
            label="Energy level"
            options={ENERGY_OPTIONS}
            value={form.characteristics.energy}
            onChange={(v) => updateChar('energy', v)}
          />

          <SegmentedButtons
            label="Social style"
            options={SOCIAL_OPTIONS}
            value={form.characteristics.social}
            onChange={(v) => updateChar('social', v)}
          />

          <SegmentedButtons
            label="Academic pace"
            options={ACADEMIC_OPTIONS}
            value={form.characteristics.academicPace}
            onChange={(v) => updateChar('academicPace', v)}
          />

          <SegmentedButtons
            label="Behavior"
            options={BEHAVIOR_OPTIONS}
            value={form.characteristics.behavior}
            onChange={(v) => updateChar('behavior', v)}
          />

          <CheckboxGroup
            label="Special needs"
            options={SPECIAL_NEEDS_OPTIONS}
            values={form.characteristics.specialNeeds}
            onToggle={(v) => toggleListValue('specialNeeds', v)}
          />

          <StudentMultiSelect
            label="Works well with"
            options={studentOptions}
            values={form.characteristics.workWellWith}
            onToggle={(v) => toggleListValue('workWellWith', v)}
            emptyText="Add more students to choose friends."
          />

          <StudentMultiSelect
            label="Should NOT sit near"
            options={studentOptions}
            values={form.characteristics.avoidWith}
            onToggle={(v) => toggleListValue('avoidWith', v)}
            emptyText="Add more students to set this."
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold bg-brand-500 text-white hover:bg-brand-600 transition shadow-md shadow-brand-200"
            >
              💾 Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
