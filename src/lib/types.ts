export type ID = string;

export type Marca = { id?: ID; nome: string; sigla: string; ativa?: boolean };
export type Unidade = { id?: ID; nome: string; cidade: string; uf: string; marcaId?: ID };
export type Area = { id?: ID; nome: string };
export type Cargo = { id?: ID; nome: string; areaId?: ID; nivel?: string };
export type Colaborador = {
  id?: ID;
  nome: string;
  email: string;
  cargo?: string;
  unidade?: string;
  marca?: string;
  status?: 'ativo' | 'desligado';
};

export type VagaStatus =
  | 'pendente'
  | 'aprovada'
  | 'em_recrutamento'
  | 'em_proposta'
  | 'concluida'
  | 'cancelada';

export type Vaga = {
  id?: ID;
  cargo: string;
  area: string;
  marca: string;
  marcaSigla?: string;
  unidade: string;
  motivo: 'substituicao' | 'aumento_quadro' | 'projeto';
  substituidoColaboradorId?: ID;
  metricaJustificativa?: string;
  descricao: string;
  status: VagaStatus;
  requesterEmail: string;
  requesterName?: string;
  createdAt: number;
  slaDias?: number;
};

export type CandidatoStage =
  | 'triagem'
  | 'entrevista_rh'
  | 'teste_tecnico'
  | 'entrevista_gestor'
  | 'proposta'
  | 'contratado';

export const CANDIDATO_STAGES: { key: CandidatoStage; label: string }[] = [
  { key: 'triagem', label: 'Triagem' },
  { key: 'entrevista_rh', label: 'Entrevista RH' },
  { key: 'teste_tecnico', label: 'Teste Técnico' },
  { key: 'entrevista_gestor', label: 'Entrevista Gestor' },
  { key: 'proposta', label: 'Proposta' },
  { key: 'contratado', label: 'Contratado' },
];

export type Candidato = {
  id?: ID;
  vagaId: ID;
  nome: string;
  email: string;
  curriculo: string;
  stage: CandidatoStage;
  score?: number;
  tags?: string[];
  resumo?: string;
  createdAt: number;
};
