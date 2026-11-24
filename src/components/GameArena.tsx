'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Flag,
  History,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Target,
} from 'lucide-react';
import { Navbar } from './Navbar';
import { VictoryModal } from './VictoryModal';
import { formatDuration } from '@/lib/format';
import { useGameTimer } from '@/hooks/useGameTimer';
import type { ActiveMatchState, GuessDirection, GuessEntry, PlayerSession } from '@/types/game';

interface GameArenaProps {
  player: PlayerSession;
  initialMatch: ActiveMatchState | null;
}

interface FeedbackState {
  direcao: GuessDirection;
  mensagem: string;
  valor: number;
}

export function GameArena({ player, initialMatch }: GameArenaProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [match, setMatch] = useState<ActiveMatchState | null>(initialMatch);
  const [guessInput, setGuessInput] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(() => {
    if (!initialMatch || initialMatch.palpites.length === 0) return null;
    const last = initialMatch.palpites[initialMatch.palpites.length - 1];
    return {
      direcao: last.direcao,
      valor: last.valor,
      mensagem:
        last.direcao === 'MAIOR'
          ? 'O NÚMERO SECRETO É MAIOR!'
          : last.direcao === 'MENOR'
            ? 'O NÚMERO SECRETO É MENOR!'
            : 'ACERTOU! YOU FOUND THE NUMBER!',
    };
  });

  const [victoryData, setVictoryData] = useState<{
    secretNumber: number;
    elapsedSeconds: number;
    attempts: number;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRunning = Boolean(match && match.status === 'em_andamento' && !victoryData);
  const elapsedSeconds = useGameTimer({
    dataInicio: match?.dataInicio ?? null,
    serverNow: match?.serverNow ?? null,
    isRunning,
    finalElapsedSeconds: victoryData?.elapsedSeconds ?? null,
  });

  const handleStartNewMatch = async () => {
    setError(null);
    setStarting(true);
    try {
      const res = await fetch('/api/game/start', { method: 'POST' });
      const data = await res.json();
      if (res.status === 401) {
        router.push('/');
        return;
      }
      if (!res.ok) {
        setError(data.error ?? 'Erro ao iniciar nova partida.');
        return;
      }

      setMatch(data.match);
      setVictoryData(null);
      setFeedback(null);
      setGuessInput('');
      window.setTimeout(() => inputRef.current?.focus(), 60);
    } catch {
      setError('Falha de conexão ao iniciar a partida.');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitGuess = async (e: FormEvent) => {
    e.preventDefault();
    if (!match || match.status !== 'em_andamento' || victoryData) return;

    setError(null);
    const trimmed = guessInput.trim();
    if (!trimmed) {
      setError('Digite um número entre 1 e 100.');
      return;
    }

    const numericValue = Number(trimmed);
    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 100) {
      setError('O palpite deve ser um número inteiro entre 1 e 100.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/game/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partidaId: match.partidaId,
          palpite: numericValue,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        router.push('/');
        return;
      }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível validar o palpite.');
        return;
      }

      setMatch((prev) =>
        prev
          ? {
              ...prev,
              status: data.status,
              tentativas: data.tentativas,
              palpites: data.palpites,
            }
          : prev
      );

      setFeedback({
        direcao: data.resultado,
        mensagem: data.mensagem,
        valor: numericValue,
      });

      setGuessInput('');

      if (data.resultado === 'ACERTOU' && typeof data.numeroSecreto === 'number') {
        setVictoryData({
          secretNumber: data.numeroSecreto,
          elapsedSeconds: data.tempoSegundos ?? elapsedSeconds,
          attempts: data.tentativas,
        });
      } else {
        inputRef.current?.focus();
      }
    } catch {
      setError('Erro de comunicação com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAbandon = async () => {
    if (!match || match.status !== 'em_andamento') return;
    setAbandoning(true);
    setError(null);
    try {
      const res = await fetch('/api/game/abandon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partidaId: match.partidaId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Não foi possível abandonar a partida.');
        return;
      }
      setMatch(null);
      setFeedback(null);
      setGuessInput('');
    } catch {
      setError('Erro de rede ao abandonar a partida.');
    } finally {
      setAbandoning(false);
    }
  };

  const reversedGuesses: GuessEntry[] = match ? [...match.palpites].reverse() : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar player={player} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Top HUD Strip */}
        <section className="glass-panel mb-6 grid grid-cols-2 gap-3 rounded-2xl p-4 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-vice-navy/70 px-3.5 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Jogador
            </span>
            <p className="mt-0.5 truncate font-display text-sm font-bold text-white sm:text-base">
              {player.nome}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-vice-navy/70 px-3.5 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Partida Atual
            </span>
            <p className="mt-0.5 font-mono text-sm font-bold text-vice-purple sm:text-base">
              {match ? `#${match.partidaId}` : 'AGUARDANDO'}
            </p>
          </div>

          <div className="rounded-xl border border-vice-cyan/30 bg-vice-navy/70 px-3.5 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-vice-cyan">
              <Clock className="h-3.5 w-3.5" />
              <span>Cronômetro</span>
            </div>
            <p className="mt-0.5 font-mono text-lg font-extrabold tracking-wider text-white sm:text-xl">
              {formatDuration(elapsedSeconds)}
            </p>
          </div>

          <div className="rounded-xl border border-vice-pink/30 bg-vice-navy/70 px-3.5 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-vice-pink">
              <Target className="h-3.5 w-3.5" />
              <span>Tentativas</span>
            </div>
            <p className="mt-0.5 font-mono text-lg font-extrabold text-white sm:text-xl">
              {match?.tentativas ?? 0}
            </p>
          </div>
        </section>

        {!match ? (
          /* No Active Match View */
          <section className="glass-panel-neon mx-auto max-w-2xl rounded-3xl p-8 text-center sm:p-10">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-vice-cyan">
              Arena Pronta
            </p>
            <h1 className="mt-2 font-display text-2xl font-black uppercase tracking-wider text-white sm:text-3xl">
              Nenhuma partida ativa
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-300 sm:text-base">
              Inicie uma nova caçada agora mesmo. O servidor sorteará um número secreto entre 1 e
              100 e começará a contar o seu tempo.
            </p>

            {error && (
              <p className="mt-4 rounded-xl border border-vice-pink/60 bg-vice-pink/15 px-4 py-2 text-sm font-semibold text-pink-200">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleStartNewMatch}
              disabled={starting}
              className="btn-neon-primary mx-auto mt-6 inline-flex items-center gap-2.5 rounded-xl px-8 py-4 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-white disabled:opacity-60"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{starting ? 'INICIANDO...' : 'INICIAR NOVA PARTIDA'}</span>
            </button>
          </section>
        ) : (
          /* Active / Finished Match Arena */
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Guess Console */}
            <section className="glass-panel-neon rounded-3xl p-6 sm:p-8 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-vice-cyan">
                    Terminal de Decodificação
                  </span>
                  <h1 className="mt-1 font-display text-xl font-black uppercase tracking-wider text-white sm:text-2xl">
                    Descubra o Número (1 – 100)
                  </h1>
                </div>

                {match.status === 'em_andamento' ? (
                  <button
                    type="button"
                    onClick={handleAbandon}
                    disabled={abandoning}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-vice-orange/40 bg-vice-orange/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-vice-orange transition hover:border-vice-orange hover:bg-vice-orange/20 disabled:opacity-50"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>{abandoning ? 'Abandonando...' : 'Abandonar'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartNewMatch}
                    disabled={starting}
                    className="btn-neon-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{starting ? 'Iniciando...' : 'Nova Partida'}</span>
                  </button>
                )}
              </div>

              {/* Dynamic Feedback Banner */}
              <div className="mt-6 min-h-[104px]">
                {feedback ? (
                  <div
                    key={`${feedback.valor}-${match.tentativas}`}
                    className={`animate-feedback-pop flex items-center gap-4 rounded-2xl border p-4 sm:p-5 ${
                      feedback.direcao === 'MAIOR'
                        ? 'border-vice-cyan/70 bg-vice-cyan/15 shadow-neon-cyan'
                        : feedback.direcao === 'MENOR'
                          ? 'border-vice-pink/70 bg-vice-pink/15 shadow-neon-pink'
                          : 'border-vice-purple bg-gradient-to-r from-vice-pink/25 via-vice-purple/30 to-vice-cyan/25 shadow-neon-purple'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        feedback.direcao === 'MAIOR'
                          ? 'bg-vice-cyan/25 text-vice-cyan'
                          : feedback.direcao === 'MENOR'
                            ? 'bg-vice-pink/25 text-vice-pink'
                            : 'bg-vice-purple/35 text-white'
                      }`}
                    >
                      {feedback.direcao === 'MAIOR' ? (
                        <ArrowUp className="h-7 w-7 animate-bounce" />
                      ) : feedback.direcao === 'MENOR' ? (
                        <ArrowDown className="h-7 w-7 animate-bounce" />
                      ) : (
                        <Sparkles className="h-7 w-7 text-vice-cyan" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                        Último palpite: {feedback.valor}
                      </p>
                      <p
                        className={`mt-0.5 font-display text-base font-extrabold uppercase tracking-wider sm:text-xl ${
                          feedback.direcao === 'MAIOR'
                            ? 'text-vice-cyan'
                            : feedback.direcao === 'MENOR'
                              ? 'text-vice-pink'
                              : 'neon-text-gradient'
                        }`}
                      >
                        {feedback.mensagem}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[104px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center text-sm text-slate-400">
                    Digite um número entre <strong className="mx-1 text-vice-cyan">1</strong> e{' '}
                    <strong className="mx-1 text-vice-pink">100</strong> para receber pistas do
                    sistema.
                  </div>
                )}
              </div>

              {/* Large Highlighted Guess Form */}
              <form onSubmit={handleSubmitGuess} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="guess-input" className="sr-only">
                    Seu palpite entre 1 e 100
                  </label>
                  <input
                    ref={inputRef}
                    id="guess-input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100}
                    step={1}
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    disabled={match.status !== 'em_andamento' || submitting}
                    placeholder="00"
                    autoFocus
                    className="w-full rounded-2xl border-2 border-vice-cyan/45 bg-vice-black/85 px-6 py-5 text-center font-mono text-4xl font-extrabold tracking-widest text-white shadow-neon-cyan transition placeholder:text-slate-700 focus:border-vice-pink focus:shadow-neon-pink focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-5xl"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-vice-pink/60 bg-vice-pink/15 px-4 py-2.5 text-center text-sm font-semibold text-pink-200"
                  >
                    {error}
                  </div>
                )}

                {match.status === 'em_andamento' ? (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-neon-primary flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 font-display text-base font-extrabold uppercase tracking-[0.2em] text-white disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'VERIFICANDO...' : 'SUBMIT GUESS'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartNewMatch}
                    disabled={starting}
                    className="btn-neon-primary flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 font-display text-base font-extrabold uppercase tracking-[0.2em] text-white disabled:opacity-60"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{starting ? 'INICIANDO...' : 'PLAY AGAIN'}</span>
                  </button>
                )}
              </form>
            </section>

            {/* Guess History */}
            <aside className="glass-panel flex flex-col rounded-3xl p-6 lg:col-span-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-vice-pink" />
                  <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
                    Histórico de Palpites
                  </h2>
                </div>
                <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs font-bold text-vice-cyan">
                  {reversedGuesses.length}
                </span>
              </div>

              {reversedGuesses.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-12 text-center text-sm text-slate-400">
                  Nenhum palpite enviado ainda nesta partida.
                </div>
              ) : (
                <ul className="mt-4 max-h-[360px] space-y-2.5 overflow-y-auto pr-1">
                  {reversedGuesses.map((item, idx) => {
                    const attemptNumber = reversedGuesses.length - idx;
                    return (
                      <li
                        key={`${item.timestamp}-${attemptNumber}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-vice-navy/65 px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-slate-400">
                            #{String(attemptNumber).padStart(2, '0')}
                          </span>
                          <span className="font-mono text-lg font-extrabold text-white">
                            {item.valor}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wider ${
                            item.direcao === 'MAIOR'
                              ? 'border border-vice-cyan/40 bg-vice-cyan/15 text-vice-cyan'
                              : item.direcao === 'MENOR'
                                ? 'border border-vice-pink/40 bg-vice-pink/15 text-vice-pink'
                                : 'border border-vice-purple/60 bg-vice-purple/30 text-white'
                          }`}
                        >
                          {item.direcao === 'MAIOR' && <ArrowUp className="h-3 w-3" />}
                          {item.direcao === 'MENOR' && <ArrowDown className="h-3 w-3" />}
                          {item.direcao === 'ACERTOU' && <Sparkles className="h-3 w-3" />}
                          <span>{item.direcao}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>
          </div>
        )}
      </main>

      <VictoryModal
        open={Boolean(victoryData)}
        secretNumber={victoryData?.secretNumber ?? 0}
        elapsedSeconds={victoryData?.elapsedSeconds ?? 0}
        attempts={victoryData?.attempts ?? 0}
        playerName={player.nome}
        onPlayAgain={handleStartNewMatch}
        restarting={starting}
      />
    </div>
  );
}
