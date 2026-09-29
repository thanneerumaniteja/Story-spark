import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import mammoth from 'mammoth';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Writing Assistant Endpoint (8 distinct literary assistance modes)
app.post('/api/ai/writing-assist', async (req, res) => {
  try {
    const { action, title, content, genre, mood, selectedText } = req.body;
    const ai = getGeminiClient();

    const targetExcerpt = selectedText || content || '';
    if (!targetExcerpt.trim() && action !== 'ideas' && action !== 'opening_hook') {
      return res.status(400).json({ error: 'Please write a few lines first so the editorial assistant can analyze your prose.' });
    }

    const prompts: Record<string, string> = {
      improve: `You are a literary magazine editor. Improve the grammar, rhythm, and readability of the following passage while strictly preserving the writer's unique voice and tone. Do NOT rewrite the whole story into generic prose. Provide 2-3 concrete, surgical line edits or a polished version of the excerpt, and explain why each change strengthens the prose.\n\nTitle: ${title || 'Untitled'}\nGenre: ${genre || 'Literary'}\nMood: ${mood || 'Reflective'}\n\nPassage:\n${targetExcerpt}`,
      ideas: `You are a literary story consultant. Based on the current story draft (or title/genre/mood if just starting), suggest 3 distinct, evocative narrative directions or scene developments the writer could explore next when feeling stuck. Keep each idea concise and inspiring without writing the story for them.\n\nTitle: ${title || 'Untitled'}\nGenre: ${genre || 'Literary'}\nMood: ${mood || 'Reflective'}\n\nCurrent Draft:\n${targetExcerpt || '(Just starting)'}`,
      plot_check: `You are a sharp continuity and narrative editor. Analyze the following short story draft for potential plot holes, pacing gaps, unfulfilled setups, or confusing transitions. Offer constructive editorial notes.\n\nTitle: ${title || 'Untitled'}\nDraft:\n${targetExcerpt}`,
      character_check: `You are a literary character analyst. Examine the characters in this short story draft for emotional authenticity, distinct dialogue voice, and any inconsistent behavior or motivation.\n\nTitle: ${title || 'Untitled'}\nDraft:\n${targetExcerpt}`,
      opening_hook: `You are a literary editor specializing in short fiction openings. Suggest 3 compelling, atmospheric opening hook variations (first 1-2 sentences) that fit the story's premise, genre (${genre}), and mood (${mood}), preserving the author's sensibility.\n\nTitle: ${title || 'Untitled'}\nCurrent Draft:\n${targetExcerpt || '(Beginning of manuscript)'}`,
      ending_ideas: `You are a short story editor. Suggest 3 resonant ending directions (e.g., an understated emotional revelation, a quiet twist, or a lingering image) that would bring this story to an unforgettable close.\n\nTitle: ${title || 'Untitled'}\nGenre: ${genre}\nMood: ${mood}\nDraft:\n${targetExcerpt}`,
      description: `Write 2 compelling, atmospheric 1-2 sentence story descriptions (loglines/blurbs) suitable for a literary discovery card on StorySpark. Avoid clichés.\n\nTitle: ${title || 'Untitled'}\nGenre: ${genre}\nMood: ${mood}\nDraft:\n${targetExcerpt}`,
      tags: `Suggest the best primary genre, subgenre, 3 moods, 4 literary themes, and 6 search tags (#Tag format) for this story.\n\nTitle: ${title || 'Untitled'}\nDraft:\n${targetExcerpt}`,
    };

    const promptText = prompts[action] || prompts.improve;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are an insightful, respectful literary editor at StorySpark. You help emerging short story writers refine their craft without replacing their voice.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Brief editorial perspective on the manuscript.',
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: 'Short title for this suggestion or note' },
                  text: { type: Type.STRING, description: 'The suggested text, rewrite, or editorial insight' },
                  rationale: { type: Type.STRING, description: 'Why this helps the story' },
                  replaceableText: { type: Type.STRING, description: 'Optional direct prose snippet the writer can insert or apply' },
                },
                required: ['label', 'text', 'rationale'],
              },
            },
          },
          required: ['summary', 'suggestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI writing-assist error:', err);
    res.status(500).json({ error: err.message || 'Failed to run AI writing assistant.' });
  }
});

// 2. AI Story Metadata Analysis (when preparing to publish)
app.post('/api/ai/story-metadata', async (req, res) => {
  try {
    const { title, content } = req.body;
    const ai = getGeminiClient();

    const wordCount = (content || '').trim().split(/\s+/).filter(Boolean).length;
    const fallbackMinutes = Math.max(2, Math.round(wordCount / 200));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analyze this short story manuscript and extract accurate literary metadata for discovery.\n\nTitle: ${title}\nWord Count: ${wordCount}\n\nManuscript:\n${content}`,
      config: {
        systemInstruction: 'Analyze short fiction manuscripts deeply, capturing both surface genre and deeper emotional/semantic themes.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genre: {
              type: Type.STRING,
              description: 'Primary genre from: Mystery, Horror, Fantasy, Science Fiction, Romance, Drama, Adventure, Comedy, Thriller, Slice of Life, Historical, Experimental',
            },
            subgenre: {
              type: Type.STRING,
              description: 'Specific literary subgenre, e.g., Psychological Mystery, Botanical Sci-Fi, Quiet Domestic Drama',
            },
            moods: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 moods such as Mysterious, Dark, Emotional, Peaceful, Thought-provoking, Thrilling, Funny, Magical, Heartbreaking',
            },
            readingTimeMinutes: {
              type: Type.INTEGER,
              description: 'Estimated reading time in minutes based on complexity and length',
            },
            themes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 core literary themes, e.g., Isolation, Memory, Unreliable Narrator, Grief, Second Chances',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '5-7 search keywords/tags without # prefix',
            },
            contentWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Any appropriate content warnings (or "None" if suitable for all readers)',
            },
            suggestedDescription: {
              type: Type.STRING,
              description: 'A single evocative 1-2 sentence hook description for story cards',
            },
            semanticEssence: {
              type: Type.STRING,
              description: '1 sentence describing what the story is truly about beneath the plot',
            },
          },
          required: [
            'genre',
            'subgenre',
            'moods',
            'readingTimeMinutes',
            'themes',
            'tags',
            'contentWarnings',
            'suggestedDescription',
            'semanticEssence',
          ],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    if (!data.readingTimeMinutes) {
      data.readingTimeMinutes = fallbackMinutes;
    }
    res.json(data);
  } catch (err: any) {
    console.error('AI story-metadata error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze story metadata.' });
  }
});

// 3. AI Content Moderation before Publication
app.post('/api/ai/moderate', async (req, res) => {
  try {
    const { title, content } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Review this short story submission before publication on StorySpark.\nCheck for:\n1. Spam or gibberish\n2. Hate speech or targeted harassment\n3. Explicitly disallowed harmful content\n4. Verbatim copy of famous copyrighted works\n\nDo NOT automatically accuse writers of plagiarism for common tropes. Only flag if there is a clear concern.\n\nTitle: ${title}\nContent:\n${content}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: 'Either "approved" or "flagged_for_review"',
            },
            flags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific concerns if any, empty array if approved',
            },
            editorialNote: {
              type: Type.STRING,
              description: 'Respectful, clear explanation of the moderation check result',
            },
            originalitySignal: {
              type: Type.STRING,
              description: 'Brief positive note on the manuscript structure and voice',
            },
          },
          required: ['status', 'flags', 'editorialNote', 'originalitySignal'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (err: any) {
    console.error('AI moderation error:', err);
    res.status(500).json({ error: err.message || 'Failed to run moderation check.' });
  }
});

// 4. Semantic Story Discovery & Natural Language / Voice Filter Engine
app.post('/api/ai/semantic-discover', async (req, res) => {
  try {
    const { query, stories } = req.body;
    const ai = getGeminiClient();

    const catalogSummary = (stories || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      author: s.author,
      genre: s.genre,
      mood: s.mood,
      readingTime: s.readingTime,
      themes: s.themes,
      tags: s.tags,
      description: s.description,
      semanticEssence: s.semanticEssence,
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `A reader on StorySpark is searching for a short story with this natural request:\n"${query}"\n\nAvailable Story Catalog:\n${JSON.stringify(catalogSummary, null, 2)}\n\nUnderstand the semantic nuance of the request (for example, "creepy but not extremely scary", "shocking ending", "5-minute mystery", "dark mystery involving mirrors", "emotional story under 5 minutes"). Select the best matching stories in ranked order and explain why each fits.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interpretedIntent: {
              type: Type.STRING,
              description: 'Warm, literary 1-sentence summary of what the reader is looking for',
            },
            extractedFilters: {
              type: Type.OBJECT,
              properties: {
                maxReadingTime: { type: Type.INTEGER, description: 'Target reading time in minutes if mentioned, or 0 if any' },
                genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                moods: { type: Type.ARRAY, items: { type: Type.STRING } },
                themes: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['maxReadingTime', 'genres', 'moods', 'themes'],
            },
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  storyId: { type: Type.STRING },
                  matchReason: { type: Type.STRING, description: 'Specific reason why this story matches their semantic request' },
                },
                required: ['storyId', 'matchReason'],
              },
            },
          },
          required: ['interpretedIntent', 'extractedFilters', 'matches'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (err: any) {
    console.error('AI semantic-discover error:', err);
    res.status(500).json({ error: err.message || 'Semantic discovery failed.' });
  }
});

// 5. Audio Transcription for Voice Discovery (fallback when MediaRecorder is used)
app.post('/api/ai/voice-transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioBase64,
            },
          },
          {
            text: 'Transcribe the spoken story search request accurately. Return only the transcribed text.',
          },
        ],
      },
    });

    res.json({ transcript: (response.text || '').trim() });
  } catch (err: any) {
    console.error('Voice transcription error:', err);
    res.status(500).json({ error: err.message || 'Failed to transcribe voice query.' });
  }
});

// 6. Manuscript File Upload Parser (Word .docx/.doc, PDF .pdf, Text .txt/.md)
app.post('/api/manuscript/parse', async (req, res) => {
  try {
    const { fileName, mimeType, base64Data } = req.body;
    if (!base64Data || !fileName) {
      return res.status(400).json({ error: 'Missing uploaded file data.' });
    }

    const lowerName = String(fileName).toLowerCase();
    const buffer = Buffer.from(base64Data, 'base64');
    const cleanBaseTitle = String(fileName)
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();

    let extractedText = '';
    let detectedType: 'pdf' | 'word' | 'text' = 'text';

    // Case A: Word Document (.docx / .doc)
    if (
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc') ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      detectedType = 'word';
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = (result.value || '').trim();
      } catch (wordErr) {
        console.warn('Mammoth raw extraction fallback:', wordErr);
        extractedText = buffer.toString('utf8').replace(/[^\x20-\x7E\n\r]/g, ' ');
      }
    }
    // Case B: PDF Document (.pdf)
    else if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
      detectedType = 'pdf';
      // First attempt high-fidelity Gemini multimodal PDF extraction
      try {
        const ai = getGeminiClient();
        const pdfResp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Data,
                },
              },
              {
                text: 'Extract the complete story title, full story paragraphs in exact order, suggested primary genre, mood, reading time in minutes, and a 1-sentence hook description from this PDF manuscript.',
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                paragraphs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                genre: { type: Type.STRING },
                mood: { type: Type.STRING },
                readingTime: { type: Type.INTEGER },
                description: { type: Type.STRING },
              },
              required: ['title', 'paragraphs', 'genre', 'mood', 'readingTime', 'description'],
            },
          },
        });

        const parsedPdf = JSON.parse(pdfResp.text || '{}');
        if (parsedPdf.paragraphs && parsedPdf.paragraphs.length > 0) {
          return res.json({
            title: parsedPdf.title || cleanBaseTitle || 'Uploaded Story',
            paragraphs: parsedPdf.paragraphs,
            genre: parsedPdf.genre || 'Mystery',
            mood: parsedPdf.mood || 'Mysterious',
            readingTime: parsedPdf.readingTime || 5,
            description:
              parsedPdf.description || parsedPdf.paragraphs[0]?.slice(0, 140) + '…',
            fileType: 'pdf',
          });
        }
      } catch (geminiPdfErr) {
        console.warn('Gemini PDF extraction fallback to local stream parser:', geminiPdfErr);
      }

      // Fallback local PDF literal text extraction if Gemini API is unreachable
      const rawLatin = buffer.toString('latin1');
      const matches = Array.from(rawLatin.matchAll(/\(([^()\\]{3,})\)/g)).map((m) => m[1]);
      extractedText = matches.join(' ').replace(/\s+/g, ' ').trim();
    }
    // Case C: Plain Text / Markdown / RTF
    else {
      detectedType = 'text';
      extractedText = buffer.toString('utf8').trim();
    }

    const lines = extractedText
      .split(/\r?\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    let inferredTitle = cleanBaseTitle || 'Uploaded Manuscript';
    let bodyParagraphs = lines;

    if (lines.length > 1 && lines[0].length < 90 && !lines[0].endsWith('.')) {
      inferredTitle = lines[0].replace(/^#\s*/, '');
      bodyParagraphs = lines.slice(1);
    }

    if (bodyParagraphs.length === 0) {
      bodyParagraphs = [
        `[Manuscript imported from ${fileName}]`,
        'Review or edit your imported paragraphs below before publishing to StorySpark.',
      ];
    }

    const wordCount = bodyParagraphs.join(' ').split(/\s+/).filter(Boolean).length;
    const estMinutes = Math.max(2, Math.round(wordCount / 180));

    return res.json({
      title: inferredTitle,
      paragraphs: bodyParagraphs,
      genre: 'Mystery',
      mood: 'Mysterious',
      readingTime: estMinutes,
      description: bodyParagraphs[0].slice(0, 145) + (bodyParagraphs[0].length > 145 ? '…' : ''),
      fileType: detectedType,
    });
  } catch (err: any) {
    console.error('Manuscript parse error:', err);
    res.status(500).json({ error: err.message || 'Could not parse uploaded manuscript file.' });
  }
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StorySpark server running on http://localhost:${PORT}`);
  });
}

startServer();
