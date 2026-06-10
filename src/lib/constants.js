// Shared option lists and display helpers used across the app.

export const GENDER_OPTIONS = [
  { value: 'boy', label: 'Boy' },
  { value: 'girl', label: 'Girl' },
  { value: 'other', label: 'Other' },
];

export const ATTENTION_OPTIONS = [
  { value: 'easily-distracted', label: 'Easily Distracted' },
  { value: 'average', label: 'Average' },
  { value: 'focused', label: 'Focused' },
];

export const ENERGY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'calm', label: 'Calm' },
];

export const SOCIAL_OPTIONS = [
  { value: 'outgoing', label: 'Outgoing' },
  { value: 'shy', label: 'Shy' },
  { value: 'middle', label: 'Middle' },
];

export const ACADEMIC_OPTIONS = [
  { value: 'needs-support', label: 'Needs Support' },
  { value: 'on-track', label: 'On Track' },
  { value: 'advanced', label: 'Advanced' },
];

export const BEHAVIOR_OPTIONS = [
  { value: 'disruptive', label: 'Disruptive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'well-behaved', label: 'Well-behaved' },
];

export const SPECIAL_NEEDS_OPTIONS = [
  { value: 'front-row', label: 'Needs front row' },
  { value: 'extra-space', label: 'Needs extra space' },
  { value: 'hearing', label: 'Hearing difficulty' },
  { value: 'vision', label: 'Vision difficulty' },
  { value: 'left-handed', label: 'Left-handed' },
];

export const LAYOUT_OPTIONS = [
  { value: 'rows', label: 'Rows', emoji: '📏' },
  { value: 'pods', label: 'Pods', emoji: '🟩' },
  { value: 'u-shape', label: 'U-Shape', emoji: '🧲' },
];

export const AVATAR_COLORS = [
  '#FFD6E8', // pink
  '#D6F5E3', // green
  '#D6E9FF', // blue
  '#FFF3C4', // yellow
  '#E5D6FF', // lavender
  '#FFE0CC', // orange
  '#D6FFF6', // mint
  '#FBD6FF', // magenta
];

export function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

const TRAIT_TAGS = {
  energy: { high: '⚡', calm: undefined },
  attention: { focused: '🎯', 'easily-distracted': '⚠️' },
  academicPace: { advanced: '🌟', 'needs-support': '💛' },
  social: { shy: '🌸', outgoing: '🗣️' },
  behavior: { 'well-behaved': '😊' },
};

// Returns up to 2 small emoji "tags" describing a student's key traits,
// used on the seating map.
export function getTraitTags(characteristics = {}) {
  const tags = [];
  for (const [trait, valueMap] of Object.entries(TRAIT_TAGS)) {
    const value = characteristics[trait];
    const emoji = valueMap[value];
    if (emoji) tags.push(emoji);
  }
  return tags.slice(0, 2);
}

export function getInitial(name = '') {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function genderColor(gender) {
  if (gender === 'boy') return '#DFF1FF';
  if (gender === 'girl') return '#FFE1EC';
  return '#ECE2FF';
}
