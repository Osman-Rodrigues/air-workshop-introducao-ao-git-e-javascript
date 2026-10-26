// Atualiza a Issue de progresso do workshop a partir do evento do GitHub Actions.
// Uso: node .github/scripts/progresso.mjs [--dry-run]
import {
  appendFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { execFileSync } from "node:child_process";

const DRY_RUN = process.argv.includes("--dry-run");
const env = process.env;
const evento = env.GITHUB_EVENT_NAME ?? "workflow_dispatch";
const payload = env.GITHUB_EVENT_PATH
  ? JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8"))
  : {};
const API = env.GITHUB_API_URL ?? "https://api.github.com";
const REPO = env.GITHUB_REPOSITORY;
const PRINCIPAL = payload.repository?.default_branch ?? "main";

const MARCADOR = "<!-- progresso-workshop -->";
const LABEL = "progresso";
const CONVENTIONAL =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([\w./-]+\))?!?: \S/;
const MARCADOR_CONFLITO = /^(<{7}|={7}|>{7})( |$)/m;

const EXERCICIOS = [
  [
    "E1",
    "Sandbox local: `git init`, `status`, `add`, `commit` e `log` com um arquivo binário (marque você mesmo)",
  ],
  [
    "E2",
    "Branch de trabalho com `01-saudacao.js` e `02-minha-localizacao.js` enviada por `push`",
  ],
  ["E3", "Migração para módulos ESM (`.mjs`) com `saudacao-localizacao.mjs`"],
  [
    "E4",
    "Conflito resolvido após `git pull` (commit de merge, sem marcadores de conflito)",
  ],
  [
    "E5",
    "Branch rebaseada na principal, sem merges e com commits no padrão Conventional Commits",
  ],
  ["E6", "Pull Request aprovado pela dupla e mergeado na branch principal"],
];

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gitOk(...args) {
  try {
    execFileSync("git", args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function testePassa(arquivo) {
  // O código do aluno roda sem acesso ao token.
  const { GITHUB_TOKEN, ...envSemToken } = env;
  try {
    execFileSync(process.execPath, ["--test", arquivo], {
      stdio: "pipe",
      env: envSemToken,
    });
    return true;
  } catch {
    return false;
  }
}

const existe = (...arquivos) =>
  arquivos.every((arquivo) => existsSync(`exercicios/${arquivo}`));

async function api(metodo, caminho, corpo, { ignorarStatus = [] } = {}) {
  if (DRY_RUN) {
    // DRY_RUN_FIXTURES: JSON com respostas simuladas, ex.: { "GET /pulls/1/reviews?per_page=100": [] }
    const fixtures = env.DRY_RUN_FIXTURES
      ? JSON.parse(readFileSync(env.DRY_RUN_FIXTURES, "utf8"))
      : {};
    console.log(`[dry-run] ${metodo} ${caminho}`);
    return fixtures[`${metodo} ${caminho}`] ?? null;
  }
  const resposta = await fetch(`${API}/repos/${REPO}${caminho}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (ignorarStatus.includes(resposta.status)) return null;
  if (!resposta.ok)
    throw new Error(
      `${metodo} ${caminho} falhou: ${resposta.status} ${await resposta.text()}`,
    );
  return resposta.status === 204 ? null : resposta.json();
}

function lerEstado(corpo = "") {
  return Object.fromEntries(
    EXERCICIOS.map(([id]) => [
      id,
      new RegExp(`^- \\[[xX]\\] \\*\\*${id}\\*\\*`, "m").test(corpo),
    ]),
  );
}

function montarCorpo(estado) {
  return [
    MARCADOR,
    "## Progresso do workshop",
    "",
    "Atualizado automaticamente pela Actions `Progresso do workshop`. O **E1** é local: marque-o você mesmo.",
    "",
    ...EXERCICIOS.map(
      ([id, descricao]) =>
        `- [${estado[id] ? "x" : " "}] **${id}** — ${descricao}`,
    ),
    "",
  ].join("\n");
}

async function buscarIssue() {
  const issues =
    (await api("GET", `/issues?labels=${LABEL}&state=all&per_page=100`)) ?? [];
  return (
    issues.find(
      (issue) => !issue.pull_request && issue.body?.includes(MARCADOR),
    ) ?? null
  );
}

async function garantirIssue() {
  const existente = await buscarIssue();
  if (existente) return existente;
  await api(
    "POST",
    "/labels",
    { name: LABEL, color: "0e8a16", description: "Progresso do workshop" },
    { ignorarStatus: [422] },
  );
  return api("POST", "/issues", {
    title: "Progresso do workshop",
    body: montarCorpo({}),
    labels: [LABEL],
  });
}

function branchDeTrabalho() {
  const pr = payload.pull_request;
  if (pr) return pr.head.ref;
  if (evento === "push" && env.GITHUB_REF_TYPE !== "tag" && !payload.deleted)
    return env.GITHUB_REF_NAME;
  return null;
}

function verificarRepositorio(estadoAnterior) {
  const resultado = {};
  const branch = branchDeTrabalho();
  if (!branch || branch === PRINCIPAL) return resultado;

  const base = `origin/${PRINCIPAL}`;
  const intervalo = `${base}..HEAD`;

  const e3 =
    existe("e3/saudacao.mjs", "e3/localizacao.mjs", "e3/saudacao-localizacao.mjs") &&
    testePassa("tests/e3-esm.test.mjs");
  resultado.E3 = {
    ok: e3,
    detalhe: e3
      ? "Módulos ESM aprovados nos testes"
      : "Rode `npm test` e confira `tests/e3-esm.test.mjs`",
  };

  const e2Atual =
    existe("e2/01-saudacao.js", "e2/02-minha-localizacao.js") &&
    testePassa("tests/e2-commonjs.test.mjs");
  // Depois do E3 os arquivos .js somem; o histórico prova que o E2 foi feito.
  const e2Historico =
    e3 &&
    git("log", "--format=%H", "HEAD", "--", "exercicios/e2/01-saudacao.js") !== "";
  const e2 = e2Atual || e2Historico;
  resultado.E2 = {
    ok: e2,
    detalhe: e2
      ? `Branch \`${branch}\` com os arquivos do E2 aprovados`
      : "Rode `npm test` e confira `tests/e2-commonjs.test.mjs`",
  };

  const merges = git("rev-list", "--merges", intervalo);
  const comMarcador = readdirSync("exercicios", { recursive: true })
    .map((arquivo) => `exercicios/${arquivo}`)
    .filter(
      (arquivo) =>
        statSync(arquivo).isFile() &&
        MARCADOR_CONFLITO.test(readFileSync(arquivo, "utf8")),
    );
  const e4 = merges !== "" && comMarcador.length === 0;
  resultado.E4 = {
    ok: e4,
    detalhe: comMarcador.length
      ? `Marcadores de conflito em: ${comMarcador.join(", ")}`
      : merges === ""
        ? "Nenhum commit de merge na branch (o `git pull` precisa gerar um merge)"
        : "Conflito resolvido",
  };

  const commits = git("log", "--no-merges", "--format=%s", intervalo)
    .split("\n")
    .filter(Boolean);
  const foraDoPadrao = commits.filter(
    (mensagem) => !CONVENTIONAL.test(mensagem),
  );
  const contemPrincipal = gitOk("merge-base", "--is-ancestor", base, "HEAD");
  const pendencias = [
    !(estadoAnterior.E4 || e4) && "conclua o E4 antes",
    merges !== "" && "ainda há commits de merge (faça o rebase)",
    !contemPrincipal && `a branch não contém \`${base}\``,
    commits.length === 0 && "nenhum commit na branch",
    foraDoPadrao.length > 0 &&
      `commits fora do padrão: ${foraDoPadrao.map((m) => `"${m}"`).join(", ")}`,
  ].filter(Boolean);
  resultado.E5 = {
    ok: pendencias.length === 0,
    detalhe: pendencias.length
      ? pendencias.join("; ")
      : "Histórico linear e Conventional Commits",
  };

  return resultado;
}

async function verificarPullRequest() {
  const pr = payload.pull_request;
  if (!pr) return {};
  const avisos = CONVENTIONAL.test(pr.title)
    ? ""
    : ` (título do PR fora do padrão Conventional Commits: "${pr.title}")`;

  if (evento === "pull_request_review") {
    const aprovado = payload.review?.state?.toLowerCase() === "approved";
    return {
      E6: {
        ok: false,
        detalhe:
          (aprovado
            ? "PR aprovado; falta o merge"
            : "Review registrado; aguardando aprovação") + avisos,
      },
    };
  }
  if (evento !== "pull_request") return {};
  if (
    !(payload.action === "closed" && pr.merged && pr.base.ref === PRINCIPAL)
  ) {
    return {
      E6: {
        ok: false,
        detalhe: `PR #${pr.number} aberto; peça o review da dupla${avisos}`,
      },
    };
  }

  const reviews =
    (await api("GET", `/pulls/${pr.number}/reviews?per_page=100`)) ?? [];
  const aprovado = reviews.some(
    (review) =>
      review.state === "APPROVED" && review.user?.login !== pr.user?.login,
  );
  return {
    E6: {
      ok: aprovado,
      detalhe:
        (aprovado
          ? `PR #${pr.number} aprovado e mergeado`
          : `PR #${pr.number} mergeado sem aprovação da dupla`) + avisos,
    },
  };
}

function escreverResumo(estadoAnterior, estado, resultados) {
  const linhas = [
    "## Progresso do workshop",
    "",
    `Evento: \`${evento}\``,
    "",
    "| Exercício | Status | Detalhe desta execução |",
    "|---|---|---|",
    ...EXERCICIOS.map(([id]) => {
      const detalhe =
        estadoAnterior[id] && !resultados[id]?.ok
          ? "Concluído em execução anterior"
          : (resultados[id]?.detalhe ??
            (id === "E1"
              ? "Autodeclarado na Issue"
              : "Não verificado neste evento"));
      return `| ${id} | ${estado[id] ? "concluído" : "pendente"} | ${detalhe.replaceAll("|", "\\|")} |`;
    }),
    "",
  ].join("\n");
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, linhas);
  if (DRY_RUN || !env.GITHUB_STEP_SUMMARY) console.log(linhas);
}

const issue = await garantirIssue();
const estadoAnterior = lerEstado(issue?.body);
const resultados = {
  ...verificarRepositorio(estadoAnterior),
  ...(await verificarPullRequest()),
};

// Itens concluídos nunca são desmarcados: um rebase pode apagar a evidência de etapas anteriores.
const estado = Object.fromEntries(
  EXERCICIOS.map(([id]) => [
    id,
    estadoAnterior[id] || Boolean(resultados[id]?.ok),
  ]),
);
escreverResumo(estadoAnterior, estado, resultados);

if (DRY_RUN) {
  console.log(montarCorpo(estado));
} else {
  // Relê a Issue para não sobrescrever um E1 marcado durante esta execução.
  const atual = (await buscarIssue()) ?? issue;
  const estadoAtual = lerEstado(atual.body);
  const final = Object.fromEntries(
    EXERCICIOS.map(([id]) => [id, estado[id] || estadoAtual[id]]),
  );
  const corpo = montarCorpo(final);
  if (corpo !== atual.body)
    await api("PATCH", `/issues/${atual.number}`, { body: corpo });

  if (final.E6 && !estadoAtual.E6) {
    await api("POST", `/issues/${atual.number}/comments`, {
      body: "Pull Request aprovado e mergeado. Workshop concluído!",
    });
    await api("PATCH", `/issues/${atual.number}`, {
      state: "closed",
      state_reason: "completed",
    });
  }
}
