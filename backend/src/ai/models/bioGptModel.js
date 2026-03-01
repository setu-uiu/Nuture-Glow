const DEFAULT_MODEL = process.env.BIOGPT_MODEL || 'microsoft/biogpt';

const buildPrompt = ({ message, locale, context }) => {
  const language = locale === 'bn' ? 'Bengali' : 'English';
  const contextLine = context ? `\nPatient context: ${context}` : '';
  return [
    'You are a board-certified obstetric clinician.',
    `Respond in ${language} with a confident, professional tone.`,
    'Do not diagnose or prescribe. Provide general, evidence-informed guidance only.',
    'Format:',
    '1) Brief clinical summary (1-2 sentences).',
    '2) Guidance (2-4 short bullet points).',
    '3) When to seek urgent care (1 short sentence).',
    '4) One brief follow-up question.',
    'Keep the response under 160 words.',
    contextLine,
    '',
    `Question: ${message}`,
    'Answer:'
  ]
    .filter(Boolean)
    .join('\n');
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

export async function runBioGpt({ message, locale = 'en', context, timeoutMs = 3000 }) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not configured');
  }

  const prompt = buildPrompt({ message, locale, context });
  const url = `https://api-inference.huggingface.co/models/${DEFAULT_MODEL}`;

  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 220,
          temperature: 0.3,
          return_full_text: false
        }
      })
    },
    timeoutMs
  );

  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    throw new Error(`BioGPT request failed (${response.status}): ${raw || 'unknown error'}`);
  }

  const payload = await response.json();
  const candidate = Array.isArray(payload) ? payload[0] : payload;
  if (candidate?.error) {
    throw new Error(`BioGPT error: ${candidate.error}`);
  }
  const text = String(candidate?.generated_text || candidate?.text || '').trim();
  if (!text) {
    throw new Error('BioGPT returned empty response');
  }

  return { text, modelUsed: 'biogpt', sources: [] };
}


