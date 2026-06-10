import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SeatingGrid from '../components/SeatingGrid';
import SummaryCard from '../components/SummaryCard';
import { LAYOUT_OPTIONS } from '../lib/constants';
import { generateSeating } from '../lib/seatingAlgorithm';
import { buildFallbackSummary } from '../lib/summaryBuilder';
import { generateGeminiSummary } from '../lib/geminiApi';
import { exportMapToPdf } from '../lib/pdfExport';
import {
  getStudents,
  getLayout,
  saveLayout,
  getRules,
  getHistory,
  addHistoryEntry,
  getSettings,
} from '../lib/storage';

function formatWeekLabel(date) {
  return `Week of ${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
}

export default function MapScreen() {
  const [students] = useState(getStudents());
  const [layout, setLayout] = useState(getLayout());
  const [weekLabel, setWeekLabel] = useState(formatWeekLabel(new Date()));
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const mapRef = useRef(null);
  const settings = getSettings();

  const updateLayout = (changes) => {
    const next = { ...layout, ...changes };
    setLayout(next);
    saveLayout(next);
  };

  const handleGenerate = async () => {
    if (students.length === 0) return;
    setGenerating(true);

    const rules = getRules();
    const history = getHistory();
    const lastWeekGrid = history[0]?.grid || null;

    const { grid, firedRules } = generateSeating(students, layout, lastWeekGrid, rules);

    let summary;
    let aiGenerated = false;
    let autoNote = false;

    if (settings.geminiApiKey) {
      try {
        summary = await generateGeminiSummary({ apiKey: settings.geminiApiKey, students, grid, rules });
        aiGenerated = true;
      } catch (error) {
        console.error('Gemini summary failed, using fallback:', error);
        summary = buildFallbackSummary(firedRules);
        autoNote = true;
      }
    } else {
      summary = buildFallbackSummary(firedRules);
    }

    const entry = {
      id: uuidv4(),
      weekLabel,
      date: new Date().toISOString(),
      grid,
      layout,
      summary,
    };
    addHistoryEntry(entry);

    setResult({ grid, summary, aiGenerated, autoNote });
    setGenerating(false);
  };

  const handleExportPdf = async () => {
    if (!mapRef.current) return;
    await exportMapToPdf(mapRef.current, {
      classroomName: settings.classroomName,
      teacherName: settings.teacherName,
      weekLabel,
      fileName: `classmapper-${weekLabel.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    });
  };

  return (
    <div className="fade-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">🗺️ Weekly Map</h1>
        <p className="text-gray-400 mt-1">Generate this week's seating chart in one click.</p>
      </div>

      <section className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 md:p-5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1.5">Week label</p>
          <input
            type="text"
            value={weekLabel}
            onChange={(e) => setWeekLabel(e.target.value)}
            className="w-full md:w-72 px-3 py-2 rounded-xl border-2 border-brand-100 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-700 mb-1.5">Classroom layout</p>
          <div className="flex flex-wrap gap-2">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateLayout({ type: opt.value })}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition border-2 ${
                  layout.type === opt.value
                    ? 'bg-brand-400 border-brand-400 text-white'
                    : 'bg-white border-brand-100 text-gray-600 hover:border-brand-300'
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6 flex-wrap">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-1.5">Rows</p>
            <input
              type="number"
              min={1}
              max={8}
              value={layout.rows}
              onChange={(e) => updateLayout({ rows: Math.max(1, Math.min(8, Number(e.target.value) || 1)) })}
              className="w-24 px-3 py-2 rounded-xl border-2 border-brand-100 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700 mb-1.5">Columns</p>
            <input
              type="number"
              min={1}
              max={8}
              value={layout.cols}
              onChange={(e) => updateLayout({ cols: Math.max(1, Math.min(8, Number(e.target.value) || 1)) })}
              className="w-24 px-3 py-2 rounded-xl border-2 border-brand-100 focus:border-brand-400 focus:outline-none"
            />
          </div>
        </div>

        {students.length === 0 ? (
          <p className="text-sm text-orange-500 font-bold">⚠️ Add students to your roster before generating a map.</p>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="self-start px-5 py-3 rounded-2xl font-extrabold bg-brand-500 text-white shadow-md shadow-brand-200 hover:bg-brand-600 transition disabled:opacity-60"
          >
            {generating ? '✨ Generating…' : "✨ Generate This Week's Map"}
          </button>
        )}
      </section>

      {result ? (
        <section className="flex flex-col gap-4">
          <div ref={mapRef} className="bg-white rounded-2xl p-4 md:p-5 border border-brand-100">
            <div className="text-center mb-3">
              <p className="font-extrabold text-gray-800 text-lg">{settings.classroomName || 'Our Classroom'}</p>
              <p className="text-sm text-gray-400">
                {settings.teacherName ? `${settings.teacherName} · ` : ''}
                {weekLabel}
              </p>
            </div>
            <SeatingGrid grid={result.grid} students={students} layout={layout} />
            <div className="mt-4">
              <SummaryCard summary={result.summary} aiGenerated={result.aiGenerated} autoNote={result.autoNote} />
            </div>
          </div>
          <button
            onClick={handleExportPdf}
            className="self-start px-4 py-2.5 rounded-2xl font-extrabold bg-pastel-blue text-blue-700 hover:brightness-95 transition"
          >
            📄 Export PDF
          </button>
        </section>
      ) : (
        <div className="text-center py-16 fade-in">
          <p className="text-5xl mb-3">🗺️</p>
          <p className="text-lg font-bold text-gray-600">No map generated yet</p>
          <p className="text-gray-400 mt-1">Set up your classroom layout and click generate above.</p>
        </div>
      )}
    </div>
  );
}
