import { sanitizePlayerName } from './normalize';

export const MIN_NUMBER = 1;
export const MAX_NUMBER = 100;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 28;

export function validatePlayerName(rawName: unknown): {
  valid: boolean;
  nome?: string;
  error?: string;
} {
  if (typeof rawName !== 'string') {
    return { valid: false, error: 'Informe um nome de jogador válido.' };
  }

  const nome = sanitizePlayerName(rawName);
  if (nome.length < MIN_NAME_LENGTH) {
    return {
      valid: false,
      error: `O nome deve ter pelo menos ${MIN_NAME_LENGTH} caracteres.`,
    };
  }

  if (nome.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`,
    };
  }

  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9_.\-\s]+$/.test(nome)) {
    return {
      valid: false,
      error: 'Use apenas letras, números, espaços, ponto, hífen ou underline.',
    };
  }

  return { valid: true, nome };
}

export function validateGuessValue(rawGuess: unknown): {
  valid: boolean;
  valor?: number;
  error?: string;
} {
  if (rawGuess === null || rawGuess === undefined || rawGuess === '') {
    return { valid: false, error: 'Digite um número entre 1 e 100.' };
  }

  const parsed = typeof rawGuess === 'number' ? rawGuess : Number(String(rawGuess).trim());

  if (!Number.isInteger(parsed)) {
    return { valid: false, error: 'Digite apenas números inteiros válidos.' };
  }

  if (parsed < MIN_NUMBER || parsed > MAX_NUMBER) {
    return {
      valid: false,
      error: `O palpite deve estar entre ${MIN_NUMBER} e ${MAX_NUMBER}.`,
    };
  }

  return { valid: true, valor: parsed };
}
