import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Language code mapping to MyMemory codes
const LANGUAGE_MAP = {
  zh: 'zh-CN',
};

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/translate', async (req, res) => {
  try {
    const { text, from, to } = req.body;

    if (!text || !to) {
      return res.status(400).json({ error: 'Missing required fields: text, to' });
    }

    const sourceLang = (!from || from === 'auto') ? 'en' : from;
    const fromCode = LANGUAGE_MAP[sourceLang] || sourceLang;
    const toCode = LANGUAGE_MAP[to] || to;

    console.log(`[API] Translating: ${fromCode} → ${toCode}: "${String(text).substring(0, 50)}"`);

    const encodedText = encodeURIComponent(String(text).trim());
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${fromCode}|${toCode}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || `Translation failed with status ${data.responseStatus}`);
    }

    const translatedText = data.responseData.translatedText;
    console.log(`[API] Result: "${translatedText}"`);

    res.json({
      text: translatedText,
      from: { language: { iso: sourceLang } },
    });
  } catch (error) {
    console.error('[API Error]', error);
    const message = error instanceof Error ? error.message : 'Translation failed';
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
});
