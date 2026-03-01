import { runBioGpt } from './models/bioGptModel.js';
import { runGpt4 } from './models/gpt4Model.js';
import { runRiskPredictor } from './models/riskPredictorModel.js';

const parseEnvBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return fallback;
};

const sanitize = (value) => String(value || '').trim();

const intentMatchers = {
  'mental-health': [
    /\banxious\b/, /\banxiety\b/, /\bstress\b/, /\boverwhelm\b/, /\bpanic\b/, /\bsad\b/, /\bdepress\b/,
    /\blonely\b/, /\bcry(ing)?\b/, /\bmental\b/, /\bworried\b/, /\bfear\b/, /\bself-harm\b/, /\bsuicid/i
  ],
  monitoring: [
    /\bbp\b/, /blood\s*pressure/i, /\bpressure\b/, /\bglucose\b/, /\bsugar\b/, /\bheart\s*rate\b/, /\bpulse\b/,
    /\bweight\b/, /\bbmi\b/, /\bweek\b/, /\bweeks\b/, /\bmonitor\b/, /\btracking\b/, /\breading\b/,
    /\d{2,3}\s*\/\s*\d{2,3}/
  ],
  nutrition: [
    /\bfood\b/, /\beat\b/, /\bnutrition\b/, /\bdiet\b/, /\bvitamin\b/, /\bfolic\b/, /\bcalcium\b/,
    /\biron\b/, /\bprotein\b/, /\bhydration\b/, /\bwater\b/, /\bmeal\b/
  ],
  medical: [
    /\bsymptom\b/, /\bpain\b/, /\bfever\b/, /\bbleed\b/, /\bcramp\b/, /\bheadache\b/, /\bnausea\b/,
    /\bdizzy\b/, /\bshortness\b/, /\bpreeclampsia\b/, /\bgestational\b/, /\bdiabetes\b/, /\binfection\b/,
    /\bvaccine\b/, /\bmedication\b/, /\bmedicine\b/, /\btablet\b/
  ]
};

const buildContextSummary = (userData, riskResult) => {
  if (!userData) return '';
  const parts = [];
  const week = userData.week ?? userData.pregnancyWeek;
  if (week) parts.push(`Pregnancy week: ${week}`);
  const bp = userData.blood_pressure || userData.bp;
  if (bp) parts.push(`Blood pressure: ${bp}`);
  if (userData.bp_systolic && userData.bp_diastolic) {
    parts.push(`Blood pressure (numeric): ${userData.bp_systolic}/${userData.bp_diastolic}`);
  }
  if (userData.weight) parts.push(`Weight: ${userData.weight} kg`);
  if (userData.bmi) parts.push(`BMI: ${userData.bmi}`);
  if (userData.age) parts.push(`Age: ${userData.age}`);
  if (userData.medical_conditions) {
    const raw = String(userData.medical_conditions);
    parts.push(`Medical conditions: ${raw.slice(0, 180)}`);
  }
  if (riskResult?.riskLevel) {
    parts.push(`Risk predictor level: ${riskResult.riskLevel}`);
  }
  return parts.join('; ');
};

export function classifyIntent(message) {
  const normalized = sanitize(message).toLowerCase();
  if (!normalized) return 'general';

  for (const [intent, patterns] of Object.entries(intentMatchers)) {
    if (patterns.some((pattern) => pattern.test(normalized))) {
      return intent;
    }
  }

  return 'general';
}

const buildRiskText = (riskResult, locale) => {
  const labelMap = {
    en: { low: 'Low', medium: 'Medium', high: 'High' },
    bn: { low: 'কম', medium: 'মাঝারি', high: 'উচ্চ' }
  };
  const labels = locale === 'bn' ? labelMap.bn : labelMap.en;
  const riskLabel = labels[riskResult.riskLevel] || riskResult.riskLevel;

  const lines = [];
  if (locale === 'bn') {
    lines.push(`ঝুঁকি স্তর: ${riskLabel}`);
    if (riskResult.alerts?.length) {
      lines.push(`সতর্কতা: ${riskResult.alerts.join(' ')}`);
    }
    if (riskResult.recommendations?.length) {
      lines.push('পরামর্শ:');
      riskResult.recommendations.forEach((rec) => lines.push(`- ${rec}`));
    }
  } else {
    lines.push(`Risk level: ${riskLabel}`);
    if (riskResult.alerts?.length) {
      lines.push(`Alerts: ${riskResult.alerts.join(' ')}`);
    }
    if (riskResult.recommendations?.length) {
      lines.push('Recommendations:');
      riskResult.recommendations.forEach((rec) => lines.push(`- ${rec}`));
    }
  }

  return lines.join('\n');
};

const attemptWithRemaining = async (fn, getRemaining, label = 'model') => {
  const remaining = getRemaining();
  if (remaining <= 0) {
    console.warn(`[AI] ${label} skipped — deadline already passed`);
    return null;
  }
  try {
    return await fn(remaining);
  } catch (err) {
    console.error(`[AI] ${label} failed:`, err?.message || err);
    return null;
  }
};

export async function routeMessage({
  message,
  locale = 'en',
  intent = 'general',
  userData,
  allowCloud,
  timeoutMs = 3000
}) {
  const fallbackLocale = locale === 'bn' ? 'bn' : 'en';

  const enableBioGpt = parseEnvBoolean(process.env.ENABLE_BIOGPT, true);
  const enableGpt4 = parseEnvBoolean(process.env.ENABLE_GPT4, true);
  const enableRisk = parseEnvBoolean(process.env.ENABLE_RISK_PREDICTOR, true);
  const deadline = Date.now() + timeoutMs;
  const remaining = () => Math.max(1, deadline - Date.now());

  const contextSummary = allowCloud ? buildContextSummary(userData) : '';

  if (intent === 'monitoring' && enableRisk && userData) {
    const riskResult = await attemptWithRemaining(
      (ms) => runRiskPredictor({ userData, locale: fallbackLocale, timeoutMs: ms }),
      remaining,
      'risk-predictor'
    );

    if (riskResult) {
      let text = buildRiskText(riskResult, fallbackLocale);
      if (allowCloud && enableBioGpt && remaining() > 1200) {
        const guidance = await attemptWithRemaining(
          (ms) => runBioGpt({ message, locale: fallbackLocale, context: buildContextSummary(userData, riskResult), timeoutMs: ms }),
          remaining
        );
        if (guidance?.text) {
          text = `${text}\n\n${guidance.text}`;
        }
      }
      return {
        text,
        modelUsed: 'risk-predictor',
        intent,
        sources: [],
        riskLevel: riskResult.riskLevel
      };
    }
  }

  const chain = [];
  if (intent === 'medical' || intent === 'nutrition' || intent === 'monitoring') {
    if (allowCloud && enableBioGpt) {
      chain.push({ fn: (ms) => runBioGpt({ message, locale: fallbackLocale, context: contextSummary, timeoutMs: ms }), label: 'biogpt' });
    }
    if (allowCloud && enableGpt4) {
      chain.push({ fn: (ms) => runGpt4({ message, locale: fallbackLocale, context: contextSummary, timeoutMs: ms }), label: 'gpt4' });
    }
  } else if (intent === 'mental-health') {
    if (allowCloud && enableGpt4) {
      chain.push({ fn: (ms) => runGpt4({ message, locale: fallbackLocale, context: contextSummary, timeoutMs: ms }), label: 'gpt4' });
    }
    if (allowCloud && enableBioGpt) {
      chain.push({ fn: (ms) => runBioGpt({ message, locale: fallbackLocale, context: contextSummary, timeoutMs: ms }), label: 'biogpt' });
    }
  } else {
    if (allowCloud && enableBioGpt && intent === 'general') {
      chain.push({ fn: (ms) => runBioGpt({ message, locale: fallbackLocale, context: contextSummary, timeoutMs: ms }), label: 'biogpt' });
    }
    if (allowCloud && enableGpt4) {
      chain.push({ fn: (ms) => runGpt4({ message, locale: fallbackLocale, context: contextSummary, timeoutMs: ms }), label: 'gpt4' });
    }
  }

  for (const { fn, label } of chain) {
    const result = await attemptWithRemaining(fn, remaining, label);
    if (result?.text) {
      return {
        text: result.text,
        modelUsed: result.modelUsed || 'gpt4',
        intent,
        sources: result.sources || [],
        riskLevel: result.riskLevel
      };
    }
  }

  const err = new Error('AI service unavailable. Please try again shortly.');
  err.status = 503;
  throw err;
}
