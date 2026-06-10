// Builds a friendly fallback summary paragraph from the list of seating
// rules that fired, used when no Gemini API key is configured.

const SENTENCES = {
  rotation: [
    'Everyone has been moved to a new area of the classroom this week to keep things fresh.',
  ],
  separateEnergy: [
    'High-energy learners have been spaced out to help the whole class stay focused.',
  ],
  distracted: [
    'Students who find it hard to concentrate have been seated away from more talkative classmates.',
  ],
  genderBalance: [
    'Boys and girls are evenly spread across the room.',
  ],
  workWellWith: [
    'Friendly pairs who work well together have been kept close to each other.',
  ],
  spreadSupport: [
    'Students who benefit from extra support are distributed across different parts of the classroom.',
  ],
  peerHelpers: [
    'Advanced learners are positioned throughout the room so they can support their peers.',
  ],
};

// Rough order of "interesting-ness" so the paragraph reads naturally.
const PRIORITY_ORDER = [
  'rotation',
  'separateEnergy',
  'distracted',
  'spreadSupport',
  'peerHelpers',
  'workWellWith',
  'genderBalance',
];

export function buildFallbackSummary(firedRules = []) {
  const fired = new Set(firedRules);
  const ordered = PRIORITY_ORDER.filter((id) => fired.has(id) && SENTENCES[id]);

  if (ordered.length === 0) {
    return "This week's seating chart is ready! Take a look at the map below to see where everyone is sitting.";
  }

  const count = Math.min(4, Math.max(2, ordered.length));
  const chosen = ordered.slice(0, count).map((id) => {
    const options = SENTENCES[id];
    return options[Math.floor(Math.random() * options.length)];
  });

  return chosen.join(' ');
}
