// All localStorage persistence helpers for ClassMapper.

const KEYS = {
  students: 'classmapper_students',
  layout: 'classmapper_layout',
  history: 'classmapper_history',
  rules: 'classmapper_rules',
  settings: 'classmapper_settings',
};

export const DEFAULT_LAYOUT = {
  type: 'rows',
  rows: 4,
  cols: 5,
};

export const DEFAULT_RULES = {
  hardRules: {
    frontRowSpecialNeeds: true,
    enforceAvoidWith: true,
    hearingVisionFrontCenter: true,
  },
  softRules: [
    { id: 'rotation', label: "Rotate students from last week", description: "Move students to a different area of the room than where they sat last week.", enabled: true, priority: 4 },
    { id: 'separateEnergy', label: 'Separate high-energy and disruptive students', description: 'Keep students with high energy or disruptive behavior away from each other.', enabled: true, priority: 4 },
    { id: 'distracted', label: "Don't seat distracted students next to outgoing", description: 'Easily distracted students are kept away from very outgoing/talkative classmates.', enabled: true, priority: 3 },
    { id: 'genderBalance', label: 'Balance boys and girls across the room', description: 'Spread boys and girls evenly so no area is dominated by one gender.', enabled: true, priority: 2 },
    { id: 'workWellWith', label: "Seat 'works well with' pairs close together", description: 'Friends or partners who work well together are placed near each other.', enabled: true, priority: 3 },
    { id: 'spreadSupport', label: "Spread 'needs support' students around the room", description: 'Students who need extra academic support are distributed across the room.', enabled: true, priority: 3 },
    { id: 'peerHelpers', label: 'Distribute advanced students as peer helpers', description: 'Advanced students are spread out so they can help classmates nearby.', enabled: true, priority: 2 },
  ],
  customRules: [],
};

export const DEFAULT_SETTINGS = {
  geminiApiKey: '',
  teacherName: '',
  classroomName: '',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Students
export function getStudents() {
  return read(KEYS.students, []);
}
export function saveStudents(students) {
  write(KEYS.students, students);
}

// Layout
export function getLayout() {
  return read(KEYS.layout, DEFAULT_LAYOUT);
}
export function saveLayout(layout) {
  write(KEYS.layout, layout);
}

// History (last 10)
export function getHistory() {
  return read(KEYS.history, []);
}
export function addHistoryEntry(entry) {
  const history = getHistory();
  history.unshift(entry);
  write(KEYS.history, history.slice(0, 10));
  return history.slice(0, 10);
}
export function deleteHistoryEntry(id) {
  const history = getHistory().filter((h) => h.id !== id);
  write(KEYS.history, history);
  return history;
}

// Seating rules
export function getRules() {
  const stored = read(KEYS.rules, null);
  if (!stored) return structuredClone(DEFAULT_RULES);
  return {
    ...structuredClone(DEFAULT_RULES),
    ...stored,
    hardRules: { ...DEFAULT_RULES.hardRules, ...(stored.hardRules || {}) },
    softRules: stored.softRules || structuredClone(DEFAULT_RULES.softRules),
    customRules: stored.customRules || [],
  };
}
export function saveRules(rules) {
  write(KEYS.rules, rules);
}
export function resetRules() {
  const defaults = structuredClone(DEFAULT_RULES);
  write(KEYS.rules, defaults);
  return defaults;
}

// Settings
export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
}
export function saveSettings(settings) {
  write(KEYS.settings, settings);
}

// Clear everything
export function clearAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
