import { v4 as uuidv4 } from 'uuid';
import { query, logChatHistory } from '../db.js';
import { classifyIntent, routeMessage } from '../ai/orchestrator.js';

const DAILY_LIMIT = Number.isFinite(Number(process.env.AI_DAILY_LIMIT))
  ? Number(process.env.AI_DAILY_LIMIT)
  : 50;

const DISCLAIMER = {
  en: 'For urgent symptoms, contact your doctor.',
  bn: '????? ?????? ??? ????? ????????? ???? ??????? ?????'
};

const parseLocale = (locale) => (locale === 'bn' ? 'bn' : 'en');

const toTrimmedString = (value, maxLen = 4000) => {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) : str;
};

const parseBoolean = (value) => {
  if (value === true || value === false) return value;
  const normalized = String(value || '').trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return false;
};

const appendDisclaimer = (text, locale) => {
  const base = String(text || '').trim();
  const disclaimer = DISCLAIMER[locale] || DISCLAIMER.en;
  if (!base) return disclaimer;

  const normalized = base.toLowerCase();
  if (normalized.includes(DISCLAIMER.en.toLowerCase()) || normalized.includes(DISCLAIMER.bn.toLowerCase())) {
    return base;
  }

  const separator = base.endsWith('.') || base.endsWith('?') ? ' ' : '. ';
  return `${base}${separator}${disclaimer}`;
};

const parseBloodPressure = (value) => {
  if (!value) return { systolic: null, diastolic: null };
  const match = String(value).match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!match) return { systolic: null, diastolic: null };
  return {
    systolic: Number(match[1]),
    diastolic: Number(match[2])
  };
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (!Number.isFinite(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

const getDailyUsageCount = async (userId) => {
  const rows = await query(
    'SELECT COUNT(*) AS count FROM chat_history WHERE user_id = ? AND created_at >= CURDATE()',
    [userId]
  );
  return Number(rows?.[0]?.count || 0);
};

const fetchUserContext = async (userId) => {
  const [metaRows, profileRows, motherRows] = await Promise.all([
    query(
      "SELECT meta_key, meta_value FROM app_user_meta WHERE user_id = ? AND meta_key IN ('pregnancyWeek')",
      [userId]
    ),
    query('SELECT date_of_birth FROM user_profiles WHERE user_id = ? LIMIT 1', [userId]),
    query('SELECT id, health_conditions FROM mothers WHERE user_id = ? LIMIT 1', [userId])
  ]);

  const meta = metaRows.reduce((acc, row) => {
    acc[row.meta_key] = row.meta_value;
    return acc;
  }, {});

  const age = calculateAge(profileRows[0]?.date_of_birth || null);
  const mother = motherRows[0] || null;

  let pregnancy = null;
  let checkin = null;

  if (mother?.id) {
    const pregnancyRows = await query(
      'SELECT id, gestational_age_weeks, updated_at, created_at FROM pregnancies WHERE mother_id = ? ORDER BY updated_at DESC, created_at DESC LIMIT 1',
      [mother.id]
    );
    pregnancy = pregnancyRows[0] || null;

    if (pregnancy?.id) {
      const checkinRows = await query(
        'SELECT weight_kg, blood_pressure, glucose_level, checkin_date, created_at FROM pregnancy_checkins WHERE pregnancy_id = ? ORDER BY checkin_date DESC, created_at DESC LIMIT 1',
        [pregnancy.id]
      );
      checkin = checkinRows[0] || null;
    }
  }

  const bp = parseBloodPressure(checkin?.blood_pressure);

  return {
    week: Number(meta.pregnancyWeek) || pregnancy?.gestational_age_weeks || null,
    blood_pressure: checkin?.blood_pressure || null,
    bp_systolic: Number.isFinite(bp.systolic) ? bp.systolic : null,
    bp_diastolic: Number.isFinite(bp.diastolic) ? bp.diastolic : null,
    weight: checkin?.weight_kg || null,
    glucose_level: checkin?.glucose_level || null,
    age,
    medical_conditions: mother?.health_conditions || null
  };
};

export async function handleAiChat({
  message,
  locale,
  userId,
  includeContext = false
}) {
  const trimmedMessage = toTrimmedString(message);
  if (!trimmedMessage) {
    const err = new Error('Message is required');
    err.status = 400;
    throw err;
  }

  const normalizedLocale = parseLocale(locale);
  const usageCount = await getDailyUsageCount(userId);
  if (usageCount >= DAILY_LIMIT) {
    const err = new Error('Daily AI query limit reached');
    err.status = 429;
    throw err;
  }

  const useContext = parseBoolean(includeContext);
  // Cloud models are allowed with or without context; context only controls extra data access.
  const allowCloud = true;
  const userData = useContext ? await fetchUserContext(userId) : null;

  const intent = classifyIntent(trimmedMessage);
  const result = await routeMessage({
    message: trimmedMessage,
    locale: normalizedLocale,
    intent,
    userData,
    allowCloud,
    timeoutMs: 20000
  });

  const finalText = appendDisclaimer(result.text, normalizedLocale);

  await logChatHistory({
    id: uuidv4(),
    userId,
    message: trimmedMessage,
    response: finalText,
    modelUsed: result.modelUsed || 'fallback',
    intent,
    locale: normalizedLocale
  });

  return {
    text: finalText,
    model_used: result.modelUsed || 'fallback',
    intent,
    sources: result.sources || [],
    risk_level: result.riskLevel || undefined
  };
}

