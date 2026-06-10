// Thin wrapper around the Gemini API for generating the weekly summary
// paragraph and verifying an API key in Settings.

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function gridToText(grid, studentsById) {
  return grid
    .map((row, r) => {
      const cells = row.map((id) => (id ? studentsById[id]?.name || 'Unknown' : 'empty'));
      return `Row ${r + 1}: ${cells.join(', ')}`;
    })
    .join('\n');
}

function buildPrompt({ students, grid, rules, studentsById }) {
  const activeRuleLabels = (rules?.softRules || [])
    .filter((r) => r.enabled)
    .map((r) => `- ${r.label}`)
    .join('\n') || 'None';

  const customRules = (rules?.customRules || []).length
    ? rules.customRules.map((r) => `- ${r}`).join('\n')
    : 'None';

  return `You are a friendly assistant helping a kindergarten teacher understand this week's classroom seating plan. Write a warm, encouraging 2-3 sentence summary explaining the key decisions. Keep it simple, positive, and jargon-free - the teacher is not technical.

Student profiles:
${JSON.stringify(students, null, 2)}

This week's seating grid (names by position):
${gridToText(grid, studentsById)}

Active seating rules:
${activeRuleLabels}

Custom rules from the teacher:
${customRules}`;
}

// Returns the generated summary text, or throws on any failure.
export async function generateGeminiSummary({ apiKey, students, grid, rules }) {
  const studentsById = Object.fromEntries(students.map((s) => [s.id, s]));
  const prompt = buildPrompt({ students, grid, rules, studentsById });

  const response = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini API returned no text');
  return text.trim();
}

// Used by the "Test key" button in Settings - makes a minimal call and
// resolves true/false depending on whether it succeeded.
export async function testGeminiKey(apiKey) {
  try {
    const response = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say hello in one word.' }] }],
      }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data?.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (error) {
    console.error('Gemini key test failed:', error);
    return false;
  }
}
