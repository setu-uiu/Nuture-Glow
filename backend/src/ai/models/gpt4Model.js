const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const buildMessages = ({ message, locale, context }) => {
  const language = locale === 'bn' ? 'Bengali' : 'English';
  const contextLine = context ? `Patient context: ${context}` : null;
  const systemParts = [
    'You are a board-certified OB-GYN and maternal health specialist.',
    `Respond in ${language} with a calm, authoritative, and empathetic tone.`,
    'Do not diagnose or prescribe. Provide general, evidence-informed guidance only.',
    'Structure the response as:',
    'Summary (1-2 sentences).',
    'Guidance (2-4 bullet points).',
    'Red flags/when to seek urgent care (1 short sentence).',
    'One brief follow-up question.',
    'Keep the response under 180 words.'
  ];

  return [
    { role: 'system', content: systemParts.join('\n') },
    ...(contextLine ? [{ role: 'system', content: contextLine }] : []),
    { role: 'user', content: message }
  ];
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

export async function runGpt4({ message, locale = 'en', context, timeoutMs = 3000 }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetchWithTimeout(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: buildMessages({ message, locale, context }),
        temperature: 0.4,
        max_tokens: 320
      })
    },
    timeoutMs
  );

  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    throw new Error(`GPT-4 request failed (${response.status}): ${raw || 'unknown error'}`);
  }

  const data = await response.json();
  const text = String(data?.choices?.[0]?.message?.content || '').trim();
  if (!text) {
    throw new Error('GPT-4 returned empty response');
  }

  return { text, modelUsed: 'gpt4', sources: [] };
}


