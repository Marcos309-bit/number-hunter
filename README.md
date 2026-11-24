# NUMBER HUNTER — Futuristic Vice City

Jogo web completo de adivinhação de números aleatórios (`1` a `100`), com identidade visual futurista inspirada na estética neon de Vice City.

## Tecnologias

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** (Glassmorphism, neon gradients e responsividade completa)
- **PostgreSQL (Neon Database)** com **`@neondatabase/serverless`**
- **Vercel** para deploy e **`@vercel/functions`** para métricas customizadas
- **GitHub** para versionamento

## Funcionalidades

- **Tela Inicial (`/`):** apresentação futurista, explicação do jogo, login simples apenas pelo nome do jogador (sem senha/e-mail) com normalização para evitar duplicidade e sessão via cookie HTTP-only assinado.
- **Arena de Jogo (`/play`):** número secreto gerado e validado exclusivamente no servidor, dicas animadas (**MAIOR** em azul-turquesa, **MENOR** em rosa neon), cronômetro digital sincronizado com o servidor, contador de tentativas, histórico de palpites e opção de abandonar partida.
- **Tela de Vitória:** partículas neon em canvas, número descoberto, tempo oficial e tentativas, com botões **PLAY AGAIN** e **VIEW RANKING**.
- **Ranking Global (`/ranking`):** pódio futurista (1º ouro, 2º prata, 3º bronze), melhor marca por jogador (menor tempo + menor tentativas como desempate) e estatísticas gerais.

## Configuração Local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure `.env.local` com base em `.env.example`:
   ```env
   DATABASE_URL="postgresql://..."
   SESSION_SECRET="seu-segredo-aleatorio"
   ```
3. Execute em desenvolvimento:
   ```bash
   npm run dev
   ```

As tabelas `jogadores` e `partidas` (ver [src/db/schema.sql](src/db/schema.sql)) são criadas automaticamente na primeira conexão caso ainda não existam.

## Build e Deploy na Vercel

```bash
npm run build
```

Configure `DATABASE_URL` e `SESSION_SECRET` nas variáveis de ambiente do projeto na Vercel e faça o deploy via GitHub ou `vercel --prod`.
