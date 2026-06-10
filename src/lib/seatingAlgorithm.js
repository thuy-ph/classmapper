// Pure, dependency-free seating chart generator.
//
// generateSeating(students, layout, lastWeekGrid, seatingRules) -> { grid, firedRules }
//
// `grid` is a 2D array (layout.rows x layout.cols) of student IDs or null.
// `firedRules` is the list of soft-rule ids that meaningfully influenced
// the final arrangement, used to build the weekly summary.

const FRONT_ROW_INDEX = (layout) => (layout.type === 'u-shape' ? 1 : 0);

// --- Seat geometry -------------------------------------------------------

// Builds the list of usable seats for a given layout.
//   - "rows": a plain rows x cols grid, row 0 is closest to the teacher.
//   - "pods": same grid, but seats are grouped into 2x2 clusters for
//     adjacency purposes (a "pod" of four desks pushed together).
//   - "u-shape": seats line the perimeter of the grid; row 0 is left empty
//     so the teacher has open space at the front of the room.
export function buildSeats(layout) {
  const { type, rows, cols } = layout;
  const seats = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (type === 'u-shape') {
        if (row === 0) continue;
        const isPerimeter = row === rows - 1 || col === 0 || col === cols - 1;
        if (!isPerimeter) continue;
      }
      seats.push({ row, col });
    }
  }
  return seats;
}

// Splits the room into four quadrants, used for rotation, gender balance,
// and "spread students out" style rules.
function getZone(seat, layout) {
  const midRow = layout.rows / 2;
  const midCol = layout.cols / 2;
  const vertical = seat.row < midRow ? 'front' : 'back';
  const horizontal = seat.col < midCol ? 'left' : 'right';
  return `${vertical}-${horizontal}`;
}

// Returns the seats considered "next to" a given seat: pod-mates for the
// "pods" layout, or direct up/down/left/right neighbours otherwise.
function getAdjacentSeats(seat, seats, layout) {
  if (layout.type === 'pods') {
    const podRow = Math.floor(seat.row / 2);
    const podCol = Math.floor(seat.col / 2);
    return seats.filter(
      (s) =>
        s !== seat &&
        Math.floor(s.row / 2) === podRow &&
        Math.floor(s.col / 2) === podCol
    );
  }
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  return seats.filter((s) =>
    deltas.some(([dr, dc]) => s.row === seat.row + dr && s.col === seat.col + dc)
  );
}

function isFrontRow(seat, layout) {
  return seat.row === FRONT_ROW_INDEX(layout);
}

// The handful of front-row seats closest to the centre column - used for
// students with hearing/vision difficulties.
function frontCenterSeats(seats, layout) {
  const frontRow = FRONT_ROW_INDEX(layout);
  const centerCol = (layout.cols - 1) / 2;
  const frontSeats = seats
    .filter((s) => s.row === frontRow)
    .sort((a, b) => Math.abs(a.col - centerCol) - Math.abs(b.col - centerCol));
  return frontSeats.slice(0, Math.max(1, Math.ceil(frontSeats.length / 2)));
}

// --- Student ordering ------------------------------------------------------

// Students with more constraints are seated first, so the easy-to-place
// students fill in around them.
function complexityScore(student) {
  const c = student.characteristics || {};
  let score = 0;
  if ((c.specialNeeds || []).length > 0) score += 10;
  if ((c.avoidWith || []).length > 0) score += 5;
  if ((c.workWellWith || []).length > 0) score += 1;
  return score;
}

function sortStudentsByComplexity(students) {
  return [...students].sort((a, b) => complexityScore(b) - complexityScore(a));
}

// --- Hard constraints ------------------------------------------------------

// Returns false if seating `student` at `seat` would break one of the
// "always enforced" rules.
function passesHardConstraints(student, seat, grid, seats, layout, hardRules, studentsById) {
  const c = student.characteristics || {};
  const specialNeeds = c.specialNeeds || [];

  if (hardRules.frontRowSpecialNeeds && specialNeeds.includes('front-row') && !isFrontRow(seat, layout)) {
    return false;
  }

  if (hardRules.hearingVisionFrontCenter && (specialNeeds.includes('hearing') || specialNeeds.includes('vision'))) {
    const frontCenter = frontCenterSeats(seats, layout);
    const available = frontCenter.filter((s) => grid[s.row][s.col] === null);
    if (available.length > 0) {
      if (!available.some((s) => s.row === seat.row && s.col === seat.col)) return false;
    } else if (!isFrontRow(seat, layout)) {
      return false;
    }
  }

  if (hardRules.enforceAvoidWith) {
    const avoid = new Set(c.avoidWith || []);
    const neighbors = getAdjacentSeats(seat, seats, layout);
    for (const n of neighbors) {
      const occupantId = grid[n.row][n.col];
      if (!occupantId) continue;
      if (avoid.has(occupantId)) return false;
      const occupant = studentsById[occupantId];
      if (occupant?.characteristics?.avoidWith?.includes(student.id)) return false;
    }
  }

  return true;
}

// --- Soft rule scoring ------------------------------------------------------

// Finds where a student sat last week, by id.
function findSeatInGrid(grid, studentId) {
  if (!grid) return null;
  for (let row = 0; row < grid.length; row++) {
    const cols = grid[row] || [];
    for (let col = 0; col < cols.length; col++) {
      if (cols[col] === studentId) return { row, col };
    }
  }
  return null;
}

const isHighEnergyOrDisruptive = (student) =>
  student?.characteristics?.energy === 'high' || student?.characteristics?.behavior === 'disruptive';

// Returns { score: 0..1, applicable: true } if the rule has something to say
// about this student/seat combination, or null if it doesn't apply.
function ruleSatisfaction(ruleId, student, seat, grid, seats, layout, lastWeekGrid, studentsById) {
  const c = student.characteristics || {};

  switch (ruleId) {
    case 'rotation': {
      const lastSeat = findSeatInGrid(lastWeekGrid, student.id);
      if (!lastSeat) return null;
      const sameZone = getZone(lastSeat, layout) === getZone(seat, layout);
      return { score: sameZone ? 0 : 1, applicable: true };
    }

    case 'separateEnergy': {
      if (!isHighEnergyOrDisruptive(student)) return null;
      const neighbors = getAdjacentSeats(seat, seats, layout);
      const conflict = neighbors.some((n) => isHighEnergyOrDisruptive(studentsById[grid[n.row][n.col]]));
      return { score: conflict ? 0 : 1, applicable: true };
    }

    case 'distracted': {
      const isDistracted = c.attention === 'easily-distracted';
      const isOutgoing = c.social === 'outgoing';
      if (!isDistracted && !isOutgoing) return null;
      const neighbors = getAdjacentSeats(seat, seats, layout);
      const conflict = neighbors.some((n) => {
        const other = studentsById[grid[n.row][n.col]];
        if (!other) return false;
        if (isDistracted && other.characteristics?.social === 'outgoing') return true;
        if (isOutgoing && other.characteristics?.attention === 'easily-distracted') return true;
        return false;
      });
      return { score: conflict ? 0 : 1, applicable: true };
    }

    case 'genderBalance': {
      const zone = getZone(seat, layout);
      let same = 0;
      let different = 0;
      for (const s of seats) {
        const occupantId = grid[s.row][s.col];
        if (!occupantId || getZone(s, layout) !== zone) continue;
        const occupant = studentsById[occupantId];
        if (occupant.gender === student.gender) same++;
        else different++;
      }
      const total = same + different;
      if (total === 0) return { score: 1, applicable: true };
      const score = same <= different ? 1 : Math.max(0, 1 - (same - different) / (total + 1));
      return { score, applicable: true };
    }

    case 'workWellWith': {
      const friends = c.workWellWith || [];
      if (friends.length === 0) return null;
      let placedFriends = 0;
      let scoreSum = 0;
      for (const friendId of friends) {
        const friendSeat = findSeatInGrid(grid, friendId);
        if (!friendSeat) continue;
        placedFriends++;
        const distance = Math.abs(friendSeat.row - seat.row) + Math.abs(friendSeat.col - seat.col);
        scoreSum += 1 / (1 + distance);
      }
      if (placedFriends === 0) return null;
      return { score: scoreSum / placedFriends, applicable: true };
    }

    case 'spreadSupport': {
      if (c.academicPace !== 'needs-support') return null;
      const zone = getZone(seat, layout);
      let countInZone = 0;
      for (const s of seats) {
        const occupantId = grid[s.row][s.col];
        if (!occupantId || getZone(s, layout) !== zone) continue;
        if (studentsById[occupantId].characteristics?.academicPace === 'needs-support') countInZone++;
      }
      return { score: 1 / (1 + countInZone), applicable: true };
    }

    case 'peerHelpers': {
      if (c.academicPace !== 'advanced') return null;
      const zone = getZone(seat, layout);
      let countInZone = 0;
      for (const s of seats) {
        const occupantId = grid[s.row][s.col];
        if (!occupantId || getZone(s, layout) !== zone) continue;
        if (studentsById[occupantId].characteristics?.academicPace === 'advanced') countInZone++;
      }
      return { score: 1 / (1 + countInZone), applicable: true };
    }

    default:
      return null;
  }
}

// Sums the weighted satisfaction of every enabled soft rule for placing
// `student` at `seat`. Mutates `firedRules` with any rule that applied.
function scoreSeat(student, seat, grid, seats, layout, lastWeekGrid, enabledSoftRules, studentsById, firedRules) {
  let total = 0;
  for (const rule of enabledSoftRules) {
    const result = ruleSatisfaction(rule.id, student, seat, grid, seats, layout, lastWeekGrid, studentsById);
    if (!result) continue;
    total += rule.priority * result.score;
    firedRules.add(rule.id);
  }
  return total;
}

// Sum of every placed student's seat score - used to evaluate swaps.
function roomScore(grid, seats, layout, lastWeekGrid, enabledSoftRules, studentsById) {
  let total = 0;
  const scratch = new Set();
  for (const seat of seats) {
    const occupantId = grid[seat.row][seat.col];
    if (!occupantId) continue;
    total += scoreSeat(studentsById[occupantId], seat, grid, seats, layout, lastWeekGrid, enabledSoftRules, studentsById, scratch);
  }
  return total;
}

// --- Main entry point ------------------------------------------------------

export function generateSeating(students, layout, lastWeekGrid, seatingRules) {
  const seats = buildSeats(layout);
  const grid = Array.from({ length: layout.rows }, () => Array(layout.cols).fill(null));
  const studentsById = Object.fromEntries(students.map((s) => [s.id, s]));
  const hardRules = seatingRules?.hardRules || {};
  const enabledSoftRules = (seatingRules?.softRules || []).filter((r) => r.enabled);

  // 1-3: order students, then greedily place the most constrained first.
  const sortedStudents = sortStudentsByComplexity(students);
  const emptySeats = [...seats];
  const placementFired = new Set();

  for (const student of sortedStudents) {
    if (emptySeats.length === 0) break;

    let candidates = emptySeats.filter((seat) =>
      passesHardConstraints(student, seat, grid, seats, layout, hardRules, studentsById)
    );
    if (candidates.length === 0) candidates = emptySeats;

    let bestSeat = candidates[0];
    let bestScore = -Infinity;
    for (const seat of candidates) {
      // Tiny random jitter avoids always picking the same seat on ties.
      const score =
        scoreSeat(student, seat, grid, seats, layout, lastWeekGrid, enabledSoftRules, studentsById, placementFired) +
        Math.random() * 0.001;
      if (score > bestScore) {
        bestScore = score;
        bestSeat = seat;
      }
    }

    grid[bestSeat.row][bestSeat.col] = student.id;
    emptySeats.splice(emptySeats.indexOf(bestSeat), 1);
  }

  // 6. Local improvement: try random swaps, keep them only if they help.
  const placedSeats = seats.filter((s) => grid[s.row][s.col] !== null);
  let currentScore = roomScore(grid, seats, layout, lastWeekGrid, enabledSoftRules, studentsById);

  for (let i = 0; i < 300 && placedSeats.length >= 2; i++) {
    const a = placedSeats[Math.floor(Math.random() * placedSeats.length)];
    const b = placedSeats[Math.floor(Math.random() * placedSeats.length)];
    if (a === b) continue;

    const studentAId = grid[a.row][a.col];
    const studentBId = grid[b.row][b.col];
    grid[a.row][a.col] = studentBId;
    grid[b.row][b.col] = studentAId;

    const validA = passesHardConstraints(studentsById[studentBId], a, grid, seats, layout, hardRules, studentsById);
    const validB = passesHardConstraints(studentsById[studentAId], b, grid, seats, layout, hardRules, studentsById);
    const newScore = validA && validB ? roomScore(grid, seats, layout, lastWeekGrid, enabledSoftRules, studentsById) : -Infinity;

    if (newScore > currentScore) {
      currentScore = newScore;
    } else {
      grid[a.row][a.col] = studentAId;
      grid[b.row][b.col] = studentBId;
    }
  }

  // 7. Work out which rules actually had an effect on the final layout.
  const firedRules = new Set();
  for (const seat of seats) {
    const occupantId = grid[seat.row][seat.col];
    if (!occupantId) continue;
    scoreSeat(studentsById[occupantId], seat, grid, seats, layout, lastWeekGrid, enabledSoftRules, studentsById, firedRules);
  }

  return { grid, firedRules: Array.from(firedRules) };
}
