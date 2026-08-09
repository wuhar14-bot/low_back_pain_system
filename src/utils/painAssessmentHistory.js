const STORAGE_PREFIX = 'lbp-pain-assessments:';

// Regions are ordered from proximal to distal for the rule-based classifier.
const DISTAL_REGIONS = new Set([
  'thigh_left', 'thigh_right', 'knee_left', 'knee_right',
  'calf_left', 'calf_right', 'ankle_left', 'ankle_right',
  'foot_left', 'foot_right'
]);

export function classifyCentralisation(previousAreas = {}, currentAreas = {}) {
  const previous = new Set(Object.entries(previousAreas).filter(([, v]) => v).map(([k]) => k));
  const current = new Set(Object.entries(currentAreas).filter(([, v]) => v).map(([k]) => k));
  const previousDistal = [...previous].filter((key) => DISTAL_REGIONS.has(key));
  const currentDistal = [...current].filter((key) => DISTAL_REGIONS.has(key));
  const newlyDistal = currentDistal.filter((key) => !previous.has(key));
  const disappearedDistal = previousDistal.filter((key) => !current.has(key));

  if (newlyDistal.length > 0 || currentDistal.length > previousDistal.length) return 'peripheralisation';
  if (previousDistal.length > 0 && currentDistal.length === 0 && current.size > 0) return 'complete_centralisation';
  if (disappearedDistal.length > 0) return 'partial_centralisation';
  return 'no_change';
}

export function getPainAssessmentHistory(patientId) {
  if (!patientId) return [];
  try { return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${patientId}`) || '[]'); }
  catch { return []; }
}

export function recordPainAssessment(patientId, painAreas, metadata = {}) {
  if (!patientId || !painAreas) return [];
  const history = getPainAssessmentHistory(patientId);
  const previous = history.at(-1)?.pain_areas || {};
  const entry = {
    id: `${patientId}-${Date.now()}`,
    patient_id: patientId,
    recorded_at: new Date().toISOString(),
    pain_areas: painAreas,
    centralisation: history.length ? classifyCentralisation(previous, painAreas) : 'baseline',
    algorithm_version: 'centralisation-v1',
    ...metadata
  };
  const next = [...history, entry];
  localStorage.setItem(`${STORAGE_PREFIX}${patientId}`, JSON.stringify(next));
  return next;
}
