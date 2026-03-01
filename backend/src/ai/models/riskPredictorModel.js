const DEFAULT_URL = process.env.RISK_PREDICTOR_URL || 'http://localhost:5000/predict';

const parseNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseBloodPressure = (value) => {
  if (!value) return { systolic: null, diastolic: null };
  const match = String(value).match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!match) return { systolic: null, diastolic: null };
  const systolic = parseNumber(match[1]);
  const diastolic = parseNumber(match[2]);
  return { systolic, diastolic };
};

const buildRecommendations = (riskLevel, locale) => {
  const en = {
    low: [
      'Keep regular prenatal checkups.',
      'Maintain a balanced diet and stay hydrated.',
      'Continue light activity as advised by your doctor.'
    ],
    medium: [
      'Monitor your blood pressure and symptoms daily.',
      'Discuss recent readings with your clinician.',
      'Prioritize rest and hydration.'
    ],
    high: [
      'Contact your healthcare provider promptly to review your readings.',
      'Watch for headache, vision changes, or swelling.',
      'Avoid strenuous activity until reviewed by a clinician.'
    ]
  };

  const bn = {
    low: [
      '?????? ????-????? ????? ?????? ????',
      '???? ????? ? ???????? ???? ??????? ?????',
      '????????? ??????? ??????? ????? ??????? ?????'
    ],
    medium: [
      '??????? ? ?????? ???????? ?????????? ?????',
      '?????????? ????? ???? ????????? ????? ??? ?????',
      '??????? ? ???? ????? ??????'
    ],
    high: [
      '????? ????? ????? ????????? ???? ?????????? ?????',
      '?????????, ?????? ?????, ?? ???? ?????? ??? ???? ????? ?????',
      '????????? ??????? ?? ????? ??????? ???? ??? ????? ?????'
    ]
  };

  const table = locale === 'bn' ? bn : en;
  return table[riskLevel] || table.low;
};

const buildAlerts = (features, locale) => {
  const alerts = [];
  const systolic = features.bp_systolic;
  const diastolic = features.bp_diastolic;
  const highBp = (Number.isFinite(systolic) && systolic >= 140) ||
    (Number.isFinite(diastolic) && diastolic >= 90);

  if (highBp) {
    alerts.push(locale === 'bn'
      ? '??????? ????????? ???? ???? ???????'
      : 'Blood pressure appears elevated.');
  }

  return alerts;
};

const computeHeuristicRisk = (features) => {
  let score = 0.15;
  const { week, bp_systolic, bp_diastolic, weight, bmi, age, medical_conditions } = features;

  if (Number.isFinite(week) && week >= 28) score += 0.05;
  if (Number.isFinite(bp_systolic) && bp_systolic >= 140) score += 0.3;
  if (Number.isFinite(bp_diastolic) && bp_diastolic >= 90) score += 0.3;
  if (Number.isFinite(bp_systolic) && bp_systolic >= 160) score += 0.15;
  if (Number.isFinite(bp_diastolic) && bp_diastolic >= 110) score += 0.15;
  if (Number.isFinite(age) && age >= 35) score += 0.08;
  if (Number.isFinite(bmi) && bmi >= 30) score += 0.08;
  if (Number.isFinite(weight) && weight >= 90) score += 0.05;

  const conditions = String(medical_conditions || '').toLowerCase();
  if (conditions.includes('diabetes') || conditions.includes('gestational')) score += 0.1;
  if (conditions.includes('hypertension') || conditions.includes('preeclampsia')) score += 0.12;

  score = Math.min(1, Math.max(0, score));
  let riskLevel = 'low';
  if (score >= 0.66) riskLevel = 'high';
  else if (score >= 0.33) riskLevel = 'medium';

  return { score, riskLevel };
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export async function runRiskPredictor({ userData, locale = 'en', timeoutMs = 3000 }) {
  if (!userData) {
    throw new Error('User data is required for risk prediction');
  }

  const bp = parseBloodPressure(userData.blood_pressure || userData.bp);
  const features = {
    week: parseNumber(userData.week ?? userData.pregnancyWeek),
    bp_systolic: parseNumber(userData.bp_systolic ?? bp.systolic),
    bp_diastolic: parseNumber(userData.bp_diastolic ?? bp.diastolic),
    weight: parseNumber(userData.weight),
    bmi: parseNumber(userData.bmi),
    age: parseNumber(userData.age),
    medical_conditions: userData.medical_conditions || userData.medicalConditions || ''
  };

  const hasAnyData = Object.values(features).some((value) => value !== null && value !== undefined && value !== '');
  if (!hasAnyData) {
    throw new Error('Insufficient data for risk prediction');
  }

  let riskScore;
  let riskLevel;
  let recommendations = [];
  let alerts = [];

  try {
    const response = await fetchWithTimeout(
      DEFAULT_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week: features.week,
          bp_systolic: features.bp_systolic,
          bp_diastolic: features.bp_diastolic,
          weight: features.weight,
          bmi: features.bmi,
          age: features.age,
          medical_conditions: features.medical_conditions
        })
      },
      timeoutMs
    );

    if (!response.ok) {
      throw new Error(`Risk predictor service error (${response.status})`);
    }

    const data = await response.json();
    riskScore = Number(data?.risk_score);
    if (!Number.isFinite(riskScore)) {
      throw new Error('Invalid risk_score');
    }
    riskScore = Math.min(1, Math.max(0, riskScore));
    if (riskScore >= 0.66) riskLevel = 'high';
    else if (riskScore >= 0.33) riskLevel = 'medium';
    else riskLevel = 'low';

    recommendations = Array.isArray(data?.recommendations)
      ? data.recommendations.map((item) => String(item)).filter(Boolean)
      : [];
    alerts = Array.isArray(data?.alerts)
      ? data.alerts.map((item) => String(item)).filter(Boolean)
      : [];
  } catch (err) {
    const heuristic = computeHeuristicRisk(features);
    riskScore = heuristic.score;
    riskLevel = heuristic.riskLevel;
  }

  if (!recommendations.length) {
    recommendations = buildRecommendations(riskLevel, locale);
  }
  if (!alerts.length) {
    alerts = buildAlerts(features, locale);
  }

  return {
    riskScore,
    riskLevel,
    recommendations,
    alerts,
    modelUsed: 'risk-predictor'
  };
}

