import { useState } from 'react';
import { getSettings, saveSettings, clearAllData } from '../lib/storage';
import { testGeminiKey } from '../lib/geminiApi';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(getSettings());
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'ok' | 'fail'
  const [confirmClear, setConfirmClear] = useState(false);

  const persist = (next) => {
    setSettings(next);
    saveSettings(next);
  };

  const update = (key, value) => {
    persist({ ...settings, [key]: value });
  };

  const handleTestKey = async () => {
    if (!settings.geminiApiKey) return;
    setTestStatus('testing');
    const ok = await testGeminiKey(settings.geminiApiKey);
    setTestStatus(ok ? 'ok' : 'fail');
  };

  const handleClearAll = () => {
    clearAllData();
    setConfirmClear(false);
    window.location.reload();
  };

  return (
    <div className="fade-in flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">⚙️ Settings</h1>
        <p className="text-gray-400 mt-1">Personalize ClassMapper for your classroom.</p>
      </div>

      <section className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 md:p-5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1.5">Teacher name</p>
          <input
            type="text"
            value={settings.teacherName}
            onChange={(e) => update('teacherName', e.target.value)}
            placeholder="e.g. Ms. Rivera"
            className="w-full px-3 py-2 rounded-xl border-2 border-brand-100 focus:border-brand-400 focus:outline-none"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1.5">Classroom name</p>
          <input
            type="text"
            value={settings.classroomName}
            onChange={(e) => update('classroomName', e.target.value)}
            placeholder="e.g. Room 12 — Sunflowers"
            className="w-full px-3 py-2 rounded-xl border-2 border-brand-100 focus:border-brand-400 focus:outline-none"
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 md:p-5 flex flex-col gap-3">
        <h2 className="font-extrabold text-gray-800">🤖 Gemini API Key (optional)</h2>
        <p className="text-sm text-gray-400">
          Get a free key at{' '}
          <a
            href="https://aistudio.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-brand-500 font-bold underline"
          >
            aistudio.google.com
          </a>{' '}
          — no credit card needed
        </p>
        <input
          type="password"
          value={settings.geminiApiKey}
          onChange={(e) => {
            update('geminiApiKey', e.target.value);
            setTestStatus(null);
          }}
          placeholder="Paste your Gemini API key"
          className="w-full px-3 py-2 rounded-xl border-2 border-brand-100 focus:border-brand-400 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleTestKey}
            disabled={!settings.geminiApiKey || testStatus === 'testing'}
            className="px-4 py-2 rounded-xl font-bold bg-brand-500 text-white hover:bg-brand-600 transition disabled:opacity-50"
          >
            {testStatus === 'testing' ? 'Testing…' : '🔑 Test key'}
          </button>
          {testStatus === 'ok' && <span className="font-bold text-green-600">✅ Working</span>}
          {testStatus === 'fail' && <span className="font-bold text-red-500">❌ Invalid</span>}
        </div>
        {!settings.geminiApiKey && (
          <p className="text-xs text-gray-400">
            No key? No problem — ClassMapper will write the weekly summary for you automatically.
          </p>
        )}
      </section>

      <hr className="border-brand-100" />

      <section className="flex flex-col gap-3">
        {confirmClear ? (
          <div className="bg-pastel-pink rounded-2xl p-4 flex flex-col gap-3">
            <p className="font-bold text-pink-800">
              Are you sure? This will permanently delete all students, history, and settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2 rounded-xl font-bold bg-white text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition"
              >
                Yes, delete everything
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="self-start px-4 py-2 rounded-xl font-bold bg-red-50 text-red-500 hover:bg-red-100 transition"
          >
            🗑️ Clear all data
          </button>
        )}
      </section>
    </div>
  );
}
