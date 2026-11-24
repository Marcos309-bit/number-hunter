export type MatchStatus = 'em_andamento' | 'vitoria' | 'abandonada';

export type GuessDirection = 'MAIOR' | 'MENOR' | 'ACERTOU';

export interface GuessEntry {
  valor: number;
  direcao: GuessDirection;
  timestamp: string;
}

export interface PlayerSession {
  jogadorId: number;
  nome: string;
  nomeNormalizado: string;
}

export interface ActiveMatchState {
  partidaId: number;
  status: MatchStatus;
  tentativas: number;
  dataInicio: string;
  serverNow: string;
  palpites: GuessEntry[];
}

export interface GuessResponse {
  partidaId: number;
  status: MatchStatus;
  resultado: GuessDirection;
  mensagem: string;
  tentativas: number;
  palpites: GuessEntry[];
  numeroSecreto?: number;
  tempoSegundos?: number;
  dataInicio?: string;
  dataFim?: string;
}

export interface RankingEntry {
  posicao: number;
  jogadorId: number;
  nome: string;
  tempoSegundos: number;
  tentativas: number;
  dataConquista: string;
}

export interface RankingStats {
  melhorTempo: number | null;
  menorTentativas: number | null;
  totalPartidas: number;
  totalJogadores: number;
}

export interface RankingPayload {
  ranking: RankingEntry[];
  stats: RankingStats;
}
