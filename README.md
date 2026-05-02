# BDG · Sistema de Gestão de Vagas e Recrutamento

Plataforma corporativa para o **Brasil Dealer Group** — 1.000+ colaboradores, 40 lojas, 15 marcas automotivas de luxo.

## Stack

- **React 18 + TypeScript + Vite + React Router**
- **Tailwind CSS** (paleta institucional sóbria: grafite, bordô-couro, branco-perla)
- **Firebase** (Firestore + Google Auth)
- **Gemini API** (autocomplete de vagas e triagem de currículos)
- **Lucide React** · **xlsx**

## Setup

```bash
cp .env.example .env       # preencha as chaves
npm install
npm run dev
```

### Variáveis de ambiente

`VITE_FIREBASE_*` — configuração do projeto Firebase.
`VITE_GEMINI_API_KEY` — chave do Google Generative AI.

> Sem as envs definidas, a aplicação renderiza uma tela de **Configuração necessária**
> em vez de quebrar — útil para previews em Vercel/Netlify/GitHub Pages sem credenciais.

## Deploy

- **Vercel / Netlify**: defina as `VITE_*` como variáveis de ambiente do projeto.
  Os arquivos `vercel.json` e `netlify.toml` já configuram o fallback SPA.
- **GitHub Pages**: o build usa `base: './'` (paths relativos) e `public/404.html`
  redireciona deep-links para a raiz, deixando o React Router resolver o restante.

## Permissões

- **Master / RH (admin):** `pedro.souza04101993@gmail.com` — acesso completo (Admin, Kanban, Estratégico).
- **Solicitantes:** demais usuários — visualizam apenas as próprias vagas.

## Módulos

- **0 · Administrativo:** Marcas, Unidades, Áreas, Cargos, Colaboradores (CRUD + import Excel).
- **1 · Vagas:** listagem em cards com SLA temporal e formulário em etapas com IA.
- **2 · Kanban:** Triagem → Entrevista RH → Teste Técnico → Entrevista Gestor → Proposta → Contratado.
- **3 · Dashboards:** estratégico (admin) e painel do solicitante.
