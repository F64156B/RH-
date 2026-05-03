# Migração para o Lovable · BDG Recruitment

Guia para levar este sistema para a plataforma [Lovable](https://lovable.dev).
Há três caminhos — escolha o que melhor se encaixa no seu fluxo:

1. **Importar via GitHub (mais rápido e fiel)** — recomendado.
2. **Recriar via prompt mestre** (quando você quer um restart limpo no Lovable).
3. **Híbrido** — importar e usar o prompt para refinar/iterar.

---

## 1) Importar via GitHub (recomendado)

O Lovable suporta projetos React + Vite + TypeScript + Tailwind, exatamente o stack
deste repo. Esse caminho preserva todo o código existente.

### Passos

1. Faça push da branch `claude/migrate-loovable-platform-fQZaF` (ou `main`) para o GitHub.
2. Acesse https://lovable.dev → **New Project** → **Import from GitHub**.
3. Conecte sua conta GitHub e selecione `f64156b/rh-`.
4. Escolha a branch que quer importar.
5. No painel do projeto Lovable, vá em **Settings → Environment Variables** e
   cadastre as chaves do `.env.example`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY`
6. No console do Firebase, em **Authentication → Settings → Authorized domains**,
   adicione o domínio `*.lovable.app` (ou o domínio que o Lovable atribuir ao projeto).
7. Rode o preview no Lovable. O `vite.config.ts` já usa `base: './'` e o SPA
   fallback do Lovable funciona nativo — não precisa mexer.

### Cuidados na importação

- **Lovable usa shadcn/ui por padrão**. Seu projeto já tem `components/ui/*`
  feitos à mão (Button, Card, Input, Modal, Badge, EmptyState, Toast). Eles
  continuam funcionando — não deixe a IA do Lovable "rebradar" para shadcn em
  massa, peça incrementos pontuais.
- **Firestore Rules** (`firestore.rules`) não rodam no Lovable — continue
  publicando-as via `firebase deploy --only firestore:rules` localmente ou em CI.
- **Gemini API**: a chave fica exposta no bundle por ser `VITE_*`. Para produção
  considere mover as chamadas Gemini para uma Edge Function (o Lovable tem
  integração nativa com Supabase, mas você pode manter Firebase + Cloud Functions).

---

## 2) Prompt mestre (recriação do zero no Lovable)

Use este prompt no campo inicial do Lovable ("Describe your idea") quando quiser
que a IA gere o esqueleto. Depois cole iterativamente as seções de "Páginas" e
"Regras".

````
Crie uma plataforma corporativa de RH chamada "BDG · Gestão de Vagas" para o
Brasil Dealer Group (1.000+ colaboradores, 40 lojas, 15 marcas automotivas
de luxo).

# Stack obrigatório
- React 18 + TypeScript + Vite + React Router v6
- Tailwind CSS (sem shadcn — componentes próprios em src/components/ui)
- Firebase (Firestore + Google Auth) — config via VITE_FIREBASE_*
- Google Generative AI (Gemini 1.5 Flash) — VITE_GEMINI_API_KEY
- lucide-react para ícones
- xlsx para importação Excel
- Sem libs de estado global; use Context apenas para Auth

# Identidade visual
Paleta institucional sóbria, premium-automotivo:
- graphite #0E1116 (texto/headers)
- pearl #F7F7F5 e pearlSoft #FCFCFC (fundos)
- bordeaux #7B1E1E e bordeaux-dark #651616 (primária — couro/luxo)
- slateText #3A3F47, silver #6B7280, mist #E5E7EB
- success #1F6F4A, warning #B8860B, danger #8B1F1F
Tipografia: Inter (sans) + JetBrains Mono (números tabulares com font-feature
"tnum"). Border-radius padrão 12px. Sombras suaves (shadow-card / cardHover).
Layout: sidebar fixa à esquerda + topbar com breadcrumb + área de conteúdo.

# Permissões
- Master/RH (admin único): pedro.souza04101993@gmail.com — acesso total.
- Solicitantes: demais usuários autenticados — só veem as próprias vagas.
- Aprovadores: leem vagas onde aparecem como approverEmail e podem mudar
  apenas status/approvalDecidedAt/approvalNote.

# Modelos (Firestore collections)
- marcas { nome, sigla, ativa }
- unidades { nome, cidade, uf, marcaId }
- areas { nome }
- cargos { nome, areaId, nivel }
- colaboradores { nome, email, cargo, unidade, marca, status }
- matriz_aprovacao { marcaId?, areaId?, cargoNivel?, approverEmail, approverNome }
- vagas {
    cargo, area, marca, marcaSigla, unidade, motivo (substituicao|aumento_quadro|projeto),
    substituidoColaboradorId?, metricaJustificativa?, descricao,
    status (pendente|aprovada|em_recrutamento|em_proposta|concluida|cancelada),
    approverEmail?, approvalDecidedAt?, approvalNote?,
    requesterEmail, requesterName?, createdAt, slaDias?
  }
- candidatos { vagaId, nome, email, curriculo, stage, score?, tags?, resumo?, createdAt }
  stages: triagem → entrevista_rh → teste_tecnico → entrevista_gestor → proposta → contratado

# Páginas / Rotas
- /login — Google Sign-In, card centralizado com brasão BDG.
- /vagas — listagem em cards; filtros por status/marca/unidade; SLA temporal
  (badge verde <15d, âmbar 15–30d, vermelho >30d a partir de createdAt).
- /vagas/nova — formulário em 4 etapas (Identificação → Justificativa →
  Descrição → Revisão). Botão "✨ Gerar com IA" preenche descrição via Gemini
  com base em cargo+área+marca. Auto-resolve approverEmail consultando
  matriz_aprovacao (mais específico vence: marca+area+nivel > marca+area > marca).
- /vagas/:id — detalhe + timeline de status + ações por papel.
- /aprovacoes — fila do aprovador logado (badge com contador no menu).
- /kanban — colunas por estágio, drag-and-drop entre estágios, modal de
  triagem por IA (cola currículo, Gemini retorna score 0-100 + resumo + tags).
- /admin — abas: Marcas, Unidades, Áreas, Cargos, Colaboradores, Matriz.
  CRUD em tabela + import de Excel (xlsx) com preview e dedupe por nome/email.
- /matriz — editor da matriz de aprovação.
- /dashboard — admin vê visão estratégica (funil, sparklines, donut por marca,
  tempo médio por etapa, SLA vencido); solicitante vê apenas próprias vagas.

# Componentes UI próprios (src/components/ui)
Button (variants: primary bordeaux, secondary outline, ghost, danger),
Card, Input (com label/erro/ícone), Modal (portal + ESC + overlay),
Badge (status colorido), EmptyState, Toast (provider + hook useToast).
Charts em SVG puro: Sparkline, Donut, Funnel, Bars.

# Regras de negócio
- Solicitante só edita vaga enquanto status='pendente'.
- Aprovador só altera os 3 campos de aprovação.
- Ao aprovar, status vira 'aprovada'; ao iniciar triagem, 'em_recrutamento'.
- SLA conta dias corridos desde createdAt.
- Tela "Configuração necessária" (SetupNotice) se faltar qualquer VITE_FIREBASE_*.

# Estrutura de pastas
src/{App.tsx,main.tsx,index.css}
src/components/{Layout,PageHeader,Breadcrumbs,CrudTable,ErrorBoundary,SetupNotice}.tsx
src/components/ui/* e src/components/charts/*
src/lib/{firebase,firestore,auth,gemini,approvals,useApprovalsCount,xlsx-import,analytics,types}.ts(x)
src/pages/{Login,Vagas,NovaVaga,VagaDetail,Aprovacoes,Kanban,Admin,Matriz,Dashboard}.tsx

Comece gerando: estrutura de pastas + tailwind.config.js + Layout + Login +
rota protegida. Não use shadcn. Não instale libs além das listadas.
````

### Prompts incrementais sugeridos (em ordem)

1. "Implemente `src/lib/firebase.ts`, `auth.tsx` (Context com Google Sign-In,
   detecção de admin pelo e-mail master) e `firestore.ts` (helpers genéricos
   listAll/getById/create/update/remove para qualquer coleção)."
2. "Crie `src/lib/types.ts` com os tipos exatos descritos no escopo e
   `src/lib/approvals.ts` com `resolveApprover(vaga, regras)` aplicando a
   regra de especificidade."
3. "Implemente `/vagas` com card de SLA e filtros."
4. "Implemente `/vagas/nova` em 4 etapas com integração Gemini."
5. "Implemente `/kanban` com drag-and-drop nativo (HTML5 DnD, sem libs)."
6. "Implemente `/admin` com tabs e import xlsx (preview + dedupe)."
7. "Implemente `/dashboard` com charts SVG."

---

## 3) Pós-migração — checklist

- [ ] Variáveis `VITE_*` cadastradas no Lovable.
- [ ] Domínio do Lovable autorizado no Firebase Auth.
- [ ] `firestore.rules` publicado via Firebase CLI.
- [ ] Testar fluxo: login admin → criar marca/unidade/área/cargo → cadastrar
      regra na matriz → solicitante cria vaga → aprovador aprova → kanban
      avança até "contratado".
- [ ] Testar tela "Configuração necessária" removendo uma env temporariamente.
- [ ] Avaliar mover chamadas Gemini para função serverless (a chave hoje vai
      para o bundle).

---

## Observações sobre o Lovable

- **Edição por prompt**: descreva mudanças em linguagem natural; a IA edita
  os arquivos. Para ajustes pontuais, use o seletor visual ("clique no botão
  e peça para mudar a cor").
- **Sync GitHub**: ative em Settings para que cada alteração no Lovable vire
  commit na branch. Permite seguir trabalhando localmente em paralelo.
- **Supabase nativo**: o Lovable empurra Supabase, mas você pode (e deve)
  manter Firebase — apenas instrua a IA a "não migrar para Supabase".
- **Limites de prompt**: se o projeto travar por tamanho, divida pedidos
  por página e peça resultados em arquivos pequenos.
