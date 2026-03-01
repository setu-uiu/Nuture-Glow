/**
 * Vaccine Schedule — Types and Helper Functions
 *
 * The actual vaccine catalog is loaded from the database via
 * `db.getVaccineSchedule()` → GET /api/vaccine-schedule.
 *
 * This file only exports types and pure functions that build
 * dose options / timing groups from the loaded data.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VaccineDose {
  dose: string;
  ageMonths: number;
  ageWeeks: number;
  ageLabel: string;
}

export interface VaccineInfo {
  name: string;
  shortName: string;
  category: 'EPI' | 'Additional';
  doses: VaccineDose[];
  description: string;
}

export interface VaccineDoseOption {
  label: string;
  vaccineName: string;
  shortName: string;
  dose: string;
  ageMonths: number;
  ageWeeks: number;
  ageLabel: string;
  category: 'EPI' | 'Additional';
  description: string;
  suggestedDate: string;
}

// ─── Helper Functions (work with any VaccineInfo[] data) ─────────────────────

/** Build a flat list of all dose options for dropdown / merge */
export function buildVaccineDoseOptions(
  schedule: VaccineInfo[],
  childDob?: string
): VaccineDoseOption[] {
  const options: VaccineDoseOption[] = [];
  const dob = childDob ? new Date(childDob) : null;

  for (const v of schedule) {
    for (const d of v.doses) {
      let suggestedDate = '';
      if (dob && !isNaN(dob.getTime())) {
        const suggested = new Date(dob);
        suggested.setDate(suggested.getDate() + d.ageWeeks * 7);
        suggestedDate = suggested.toISOString().split('T')[0];
      }

      options.push({
        label: v.doses.length === 1 ? v.shortName : `${v.shortName} \u2013 ${d.dose}`,
        vaccineName: v.name,
        shortName: v.shortName,
        dose: d.dose,
        ageMonths: d.ageMonths,
        ageWeeks: d.ageWeeks,
        ageLabel: d.ageLabel,
        category: v.category,
        description: v.description,
        suggestedDate,
      });
    }
  }

  return options;
}

/** Group vaccines by timing period for organized display */
export function getVaccinesByTimingGroup(
  schedule: VaccineInfo[]
): { group: string; vaccines: VaccineDoseOption[] }[] {
  const allOptions = buildVaccineDoseOptions(schedule);
  const groups = [
    { label: 'At Birth', minWeeks: 0, maxWeeks: 0 },
    { label: '6 Weeks (1.5 Months)', minWeeks: 5, maxWeeks: 7 },
    { label: '10 Weeks (2.5 Months)', minWeeks: 9, maxWeeks: 11 },
    { label: '14 Weeks (3.5 Months)', minWeeks: 13, maxWeeks: 15 },
    { label: '6 Months', minWeeks: 24, maxWeeks: 28 },
    { label: '9 Months', minWeeks: 37, maxWeeks: 41 },
    { label: '12 Months (1 Year)', minWeeks: 50, maxWeeks: 56 },
    { label: '15 Months', minWeeks: 63, maxWeeks: 67 },
    { label: '18 Months (1.5 Years)', minWeeks: 76, maxWeeks: 80 },
    { label: '2\u20133 Years', minWeeks: 91, maxWeeks: 160 },
    { label: '4\u20135 Years', minWeeks: 200, maxWeeks: 270 },
    { label: '9+ Years', minWeeks: 400, maxWeeks: 600 },
  ];

  return groups
    .map(g => ({
      group: g.label,
      vaccines: allOptions.filter(o => o.ageWeeks >= g.minWeeks && o.ageWeeks <= g.maxWeeks),
    }))
    .filter(g => g.vaccines.length > 0);
}

/** Get vaccines suggested for a specific pregnancy/baby week */
export function getVaccinesForWeek(schedule: VaccineInfo[], week: number): VaccineDoseOption[] {
  const allOptions = buildVaccineDoseOptions(schedule);
  return allOptions.filter(o => o.ageWeeks >= week - 2 && o.ageWeeks <= week + 4);
}

/** Format age for display */
export function formatAge(ageMonths: number): string {
  if (ageMonths === 0) return 'At birth';
  if (ageMonths < 2) return `${Math.round(ageMonths * 4.33)} weeks`;
  if (ageMonths < 24) return `${ageMonths} months`;
  const years = Math.floor(ageMonths / 12);
  const remainingMonths = ageMonths % 12;
  if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
}

/** Get all unique vaccine base names */
export function getAllVaccineNames(schedule: VaccineInfo[]): string[] {
  return schedule.map(v => v.name);
}

/**
 * Normalise raw rows returned by the API into VaccineInfo[].
 * The API returns rows from app_catalog whose `data` column
 * already contains name, shortName, category, doses[], description.
 * Some fields may arrive stringified (e.g. doses as JSON string).
 */
export function normalizeScheduleRows(rows: any[]): VaccineInfo[] {
  return rows
    .map((row): VaccineInfo | null => {
      try {
        const name = row.name || '';
        const shortName = row.shortName || '';
        const category = row.category === 'EPI' ? 'EPI' : 'Additional';
        let doses: VaccineDose[] = [];
        if (typeof row.doses === 'string') {
          doses = JSON.parse(row.doses);
        } else if (Array.isArray(row.doses)) {
          doses = row.doses;
        }
        const description = row.description || '';
        if (!name || !shortName || doses.length === 0) return null;
        return { name, shortName, category, doses, description };
      } catch {
        return null;
      }
    })
    .filter((v): v is VaccineInfo => v !== null);
}
