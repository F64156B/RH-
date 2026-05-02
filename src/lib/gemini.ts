import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const MODEL = 'gemini-1.5-flash';

function getModel() {
  if (!genAI) throw new Error('Gemini API key não configurada (VITE_GEMINI_API_KEY).');
  return genAI.getGenerativeModel({ model: MODEL });
}

export async function generateJobScope(params: {
  cargo: string;
  area: string;
  marca: string;
  unidade: string;
  motivo?: string;
}): Promise<string> {
  const model = getModel();
  const prompt = `Você é um especialista em RH automotivo de luxo. Gere uma descrição corporativa, sóbria e objetiva para a vaga abaixo. Inclua: Resumo, Responsabilidades (5-7 bullets), Requisitos Técnicos, Diferenciais, Soft Skills. Tom premium e direto, em português do Brasil. Nada de emojis.

Cargo: ${params.cargo}
Área: ${params.area}
Marca: ${params.marca}
Unidade: ${params.unidade}
Motivo da abertura: ${params.motivo ?? 'Não informado'}`;
  const res = await model.generateContent(prompt);
  return res.response.text();
}

export type ScreeningResult = { score: number; tags: string[]; resumo: string };

export async function screenCandidate(params: {
  resume: string;
  jobTitle: string;
  jobDescription: string;
}): Promise<ScreeningResult> {
  const model = getModel();
  const prompt = `Você é um analista de Triagem de RH. Avalie a aderência do currículo à vaga. Retorne SOMENTE um JSON válido no formato exato:
{"score": <inteiro 0-100>, "tags": ["tag1","tag2","tag3","tag4"], "resumo": "<até 240 caracteres>"}

VAGA: ${params.jobTitle}
DESCRIÇÃO: ${params.jobDescription}

CURRÍCULO:
${params.resume}`;
  const res = await model.generateContent(prompt);
  const text = res.response.text().trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Resposta da IA inválida.');
  const parsed = JSON.parse(match[0]);
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6).map(String) : [],
    resumo: String(parsed.resumo ?? ''),
  };
}
