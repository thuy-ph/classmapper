import { useState } from 'react';
import StudentCard from '../components/StudentCard';
import StudentModal from '../components/StudentModal';
import { getStudents, saveStudents } from '../lib/storage';

export default function RosterScreen() {
  const [students, setStudents] = useState(getStudents());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const persist = (next) => {
    setStudents(next);
    saveStudents(next);
  };

  const openAdd = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const handleSave = (student) => {
    const exists = students.some((s) => s.id === student.id);
    const next = exists ? students.map((s) => (s.id === student.id ? student : s)) : [...students, student];
    persist(next);
    setModalOpen(false);
  };

  const handleDelete = (student) => {
    const next = students
      .filter((s) => s.id !== student.id)
      .map((s) => ({
        ...s,
        characteristics: {
          ...s.characteristics,
          workWellWith: (s.characteristics.workWellWith || []).filter((id) => id !== student.id),
          avoidWith: (s.characteristics.avoidWith || []).filter((id) => id !== student.id),
        },
      }));
    persist(next);
    setConfirmDelete(null);
  };

  return (
    <div className="fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">🏫 Class Roster</h1>
          <p className="text-gray-400 mt-1">{students.length} student{students.length === 1 ? '' : 's'}</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-2xl font-extrabold bg-brand-500 text-white shadow-md shadow-brand-200 hover:bg-brand-600 transition"
        >
          ➕ Add Student
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-20 fade-in">
          <p className="text-6xl mb-3">🧑‍🎓</p>
          <p className="text-lg font-bold text-gray-600">No students added yet</p>
          <p className="text-gray-400 mt-1 mb-4">Add your class roster to get started.</p>
          <button
            onClick={openAdd}
            className="px-4 py-2.5 rounded-2xl font-extrabold bg-brand-500 text-white shadow-md shadow-brand-200 hover:bg-brand-600 transition"
          >
            ➕ Add your first student
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={openEdit}
              onDelete={(s) => setConfirmDelete(s)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <StudentModal
          key={editingStudent ? editingStudent.id : 'new'}
          student={editingStudent}
          allStudents={students}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="fade-in bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-4xl mb-2">🗑️</p>
            <h3 className="text-lg font-extrabold text-gray-800">Delete {confirmDelete.name}?</h3>
            <p className="text-gray-400 mt-1 mb-5">This will remove them from the roster and any pairings.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
