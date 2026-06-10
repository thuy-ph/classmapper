import { useState } from 'react';
import { HardRuleToggle, SoftRuleToggle } from '../components/RuleToggle';
import { getRules, saveRules, resetRules } from '../lib/storage';

const HARD_RULE_LABELS = {
  frontRowSpecialNeeds: 'Students who need the front row are always placed in row 1',
  enforceAvoidWith: "Students in each other's \"avoid\" list are never seated adjacent",
  hearingVisionFrontCenter: 'Hearing/vision difficulties placed front and center',
};

export default function RulesScreen() {
  const [rules, setRules] = useState(getRules());
  const [newRule, setNewRule] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const persist = (next) => {
    setRules(next);
    saveRules(next);
  };

  const toggleHardRule = (key, value) => {
    persist({ ...rules, hardRules: { ...rules.hardRules, [key]: value } });
  };

  const updateSoftRule = (id, changes) => {
    persist({
      ...rules,
      softRules: rules.softRules.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    });
  };

  const addCustomRule = () => {
    const text = newRule.trim();
    if (!text) return;
    persist({ ...rules, customRules: [...rules.customRules, text] });
    setNewRule('');
  };

  const removeCustomRule = (index) => {
    persist({ ...rules, customRules: rules.customRules.filter((_, i) => i !== index) });
  };

  const handleReset = () => {
    persist(resetRules());
    setConfirmReset(false);
  };

  return (
    <div className="fade-in flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">📐 Seating Rules</h1>
        <p className="text-gray-400 mt-1">Customize how ClassMapper builds your seating chart.</p>
      </div>

      <section className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 md:p-5">
        <h2 className="font-extrabold text-gray-800 mb-1">🔒 Always Enforced</h2>
        <p className="text-sm text-gray-400 mb-2">These hard rules keep students safe and comfortable.</p>
        {Object.entries(rules.hardRules).map(([key, value]) => (
          <HardRuleToggle
            key={key}
            label={HARD_RULE_LABELS[key]}
            enabled={value}
            onChange={(v) => toggleHardRule(key, v)}
          />
        ))}
      </section>

      <section className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 md:p-5">
        <h2 className="font-extrabold text-gray-800 mb-1">🎚️ Preferences — adjust to your class</h2>
        <p className="text-sm text-gray-400 mb-2">Turn rules on or off, and set how strongly each one matters.</p>
        {rules.softRules.map((rule) => (
          <SoftRuleToggle
            key={rule.id}
            label={rule.label}
            description={rule.description}
            enabled={rule.enabled}
            priority={rule.priority}
            onToggle={(v) => updateSoftRule(rule.id, { enabled: v })}
            onPriorityChange={(p) => updateSoftRule(rule.id, { priority: p })}
          />
        ))}
      </section>

      <section className="bg-white rounded-2xl border border-brand-100 shadow-sm p-4 md:p-5">
        <h2 className="font-extrabold text-gray-800 mb-1">✍️ Your Own Rules</h2>
        <div className="flex flex-col gap-2 mt-2">
          {rules.customRules.map((rule, i) => (
            <div key={i} className="flex items-center justify-between gap-3 bg-pastel-lavender rounded-xl px-3 py-2">
              <p className="text-sm text-gray-700">{rule}</p>
              <button onClick={() => removeCustomRule(i)} className="text-lg shrink-0">
                🗑️
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomRule();
              }
            }}
            placeholder="e.g. Keep Jamie near the window"
            className="flex-1 px-3 py-2 rounded-xl border-2 border-brand-100 focus:border-brand-400 focus:outline-none text-sm"
          />
          <button
            onClick={addCustomRule}
            className="px-4 py-2 rounded-xl font-bold bg-brand-500 text-white hover:bg-brand-600 transition shrink-0"
          >
            ➕ Add a rule
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          💡 Custom rules are passed to the AI when generating your summary. They work best when a Gemini API key is
          set in Settings.
        </p>
      </section>

      <div>
        {confirmReset ? (
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm font-bold text-gray-600">Reset all rules to their defaults?</p>
            <button onClick={handleReset} className="px-3 py-1.5 rounded-xl font-bold bg-red-500 text-white text-sm">
              Yes, reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 rounded-xl font-bold bg-gray-100 text-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-sm"
          >
            ↩️ Reset to defaults
          </button>
        )}
      </div>
    </div>
  );
}
