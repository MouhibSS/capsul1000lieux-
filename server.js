import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

app.post('/api/chat', async (req, res) => {
  console.log('📨 Request received');
  try {
    const { message } = req.body;
    console.log('📝 Message:', message);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('🤖 Calling Gemini...');

    const result = await model.generateContent(message);
    const text = result.response.text();
    console.log('✅ Got response');

    res.json({ reply: text, locations: [] });
  } catch (err) {
    console.error('❌ ERROR:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
