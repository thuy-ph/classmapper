import { useEffect, useRef, useState } from 'react';
import HistoryList from '../components/HistoryList';
import SeatingGrid from '../components/SeatingGrid';
import SummaryCard from '../components/SummaryCard';
import { getHistory, deleteHistoryEntry, getStudents, getSettings, getLayout } from '../lib/storage';
import { exportMapToPdf } from '../lib/pdfExport';

export default function HistoryScreen() {
  const [history, setHistory] = useState(getHistory());
  const [previewEntry, setPreviewEntry] = useState(null);
  const [exportingEntry, setExportingEntry] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const students = getStudents();
  const settings = getSettings();
  const exportRef = useRef(null);

  const handleDelete = (entry) => {
    setHistory(deleteHistoryEntry(entry.id));
    setConfirmDelete(null);
    if (previewEntry?.id === entry.id) setPreviewEntry(null);
  };

  useEffect(() => {
    if (!exportingEntry || !exportRef.current) return;
    (async () => {
      try {
        await exportMapToPdf(exportRef.current, {
          classroomName: settings.classroomName,
          teacherName: settings.teacherName,
          weekLabel: exportingEntry.weekLabel,
          fileName: `classmapper-${exportingEntry.weekLabel.replace(/\s+/g, '-').toLowerCase()}.pdf`,
        });
      } finally {
        setExportingEntry(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportingEntry]);

  return (
    <div className="fade-in flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">📋 History</h1>
        <p className="text-gray-400 mt-1">Your last 10 weekly seating maps.</p>
      </div>

      <HistoryList
        history={history}
        onPreview={setPreviewEntry}
        onDelete={setConfirmDelete}
        onExport={setExportingEntry}
      />

      {previewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="fade-in bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-brand-700">{previewEntry.weekLabel}</h2>
              <button onClick={() => setPreviewEntry(null)} className="text-2xl leading-none text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <SeatingGrid grid={previewEntry.grid} students={students} layout={previewEntry.layout || getLayout()} />
            <div className="mt-4">
              <SummaryCard summary={previewEntry.summary} />
            </div>
            <button
              onClick={() => setExportingEntry(previewEntry)}
              className="mt-4 px-4 py-2 rounded-xl font-bold bg-pastel-blue text-blue-700 hover:brightness-95 transition"
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="fade-in bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-4xl mb-2">🗑️</p>
            <h3 className="text-lg font-extrabold text-gray-800">Delete "{confirmDelete.weekLabel}"?</h3>
            <p className="text-gray-400 mt-1 mb-5">This can't be undone.</p>
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

      {/* Off-screen render target used for PDF export */}
      {exportingEntry && (
        <div className="fixed -left-[9999px] top-0 w-[800px] bg-pastel-yellow/0 p-4" ref={exportRef}>
          <div className="bg-white p-4 rounded-2xl">
            <SeatingGrid grid={exportingEntry.grid} students={students} layout={exportingEntry.layout || getLayout()} />
            <div className="mt-4">
              <SummaryCard summary={exportingEntry.summary} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
