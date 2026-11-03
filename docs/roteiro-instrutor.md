# Roteiro do instrutor

Workshop **Introdução ao Git (com JavaScript)**, 2h, público misto. Exposição curta e foco em exercícios.

## Preparação

- [ ] Publicar este repositório e marcar **Settings** > **Template repository**.
- [ ] Criar um repositório de teste a partir do template e rodar o fluxo E2 a E6 com duas contas (veja [Checklist de ensaio](#checklist-de-ensaio)).
- [ ] Enviar os pré-requisitos com antecedência: Git 2.23+, Node 22 LTS+, VS Code, conta no GitHub com HTTPS (token) ou SSH configurado.
- [ ] Definir as duplas antes do início (ímpar: o instrutor faz par com alguém).
- [ ] Deixar abertos: slides ([slides/slides.md](../slides/slides.md)), [exercicios.md](exercicios.md) e um terminal com fonte grande.

## Cronograma

| # | Bloco | Tempo | Início |
|---|---|---|---|
| 0 | Abertura e checagem do setup | 5 | 0:00 |
| 1 | História e funcionamento do Git | 10 | 0:05 |
| 2 | Primeiros passos no repositório local (E1) | 13 | 0:15 |
| — | Pausa | 5 | 0:28 |
| 3 | Remoto: template, `git clone`, colaborador, Issue de progresso | 8 | 0:33 |
| 4 | 4.1 Intro JS (10) + E2 (12) | 22 | 0:41 |
| 5 | Módulos ESM (E3) | 12 | 1:03 |
| 6 | `pull`, `push` e conflito (E4) | 12 | 1:15 |
| 7 | `rebase`, `reset` e Conventional Commits (E5) | 10 | 1:27 |
| 8 | Pull Request e review (E6), Gitflow, CI/CD e outras forges | 12 | 1:37 |
| 9 | Encerramento e análise rápida | 5 | 1:49 |
| — | Folga | 6 | 1:54 |

Se atrasar mais de 10 minutos até o bloco 6, transforme o E5 em demonstração e siga direto para o E6.

## Blocos

### 0. Abertura (5 min)

- Objetivo: sair com um Pull Request aprovado no próprio repositório.
- Todos rodam `git --version` e `node -v`. Quem estiver sem setup acompanha a dupla.

### 1. História e funcionamento do Git (10 min)

Falas-chave:
- **O que é:** um sistema de controle de versão distribuído, rápido e escalável.
- **Por que:** em 2005 o kernel Linux perdeu o uso gratuito do BitKeeper, proprietário, e precisava de uma ferramenta rápida e distribuída.
- **Como:** Linus Torvalds desenhou o Git como um sistema de arquivos em que tudo é identificado por um hash do conteúdo, o que garante velocidade e integridade.
- **Quando:** abril de 2005. Em julho, Junio Hamano assumiu a manutenção.
- Centralizado (CVS, SVN): um servidor guarda o histórico. Distribuído (Git): cada clone tem o histórico completo.
- O Git guarda **fotos** (snapshots) do projeto, não diferenças. Cada commit aponta para uma foto e para o commit anterior.
- Três áreas: diretório de trabalho, staging (`git add`) e repositório (`git commit`).
- Branch e `HEAD` são só ponteiros para commits. Por isso criar branch é instantâneo.

Fontes: [README do Git](https://github.com/git/git/blob/master/README.md), [About](https://git-scm.com/about), [gitglossary](https://git-scm.com/docs/gitglossary), [gitdatamodel](https://git-scm.com/docs/gitdatamodel), [Pro Git 1.1 a 1.3](https://git-scm.com/book/pt-br/v2/Primeiros-Passos-Uma-Breve-Hist%c3%b3ria-do-Git) e [e-mail de Linus Torvalds, jul/2005](https://marc.info/?l=git&m=112243466603239).

### 2. Repositório local (13 min)

- Demonstre o passo 1 e 2 do E1 projetando o terminal; depois os alunos fazem sozinhos (8 min).
- Mostre `git status` antes e depois de cada `add` e `commit`: é o comando mais útil para iniciantes.
- Feche com o `git diff` do binário: "o Git é ótimo com texto; para binários grandes existe o Git LFS".

### 3. Repositório remoto (8 min)

- Demonstre **Use this template**, a adição da dupla como colaborador e o **Run workflow**.
- Mostre a Issue criada: "ela vai se marcar sozinha conforme vocês avançam".
- Todos fazem `git clone`. Explique que `origin` é só o apelido do remoto (`git remote -v`).

### 4. JavaScript e E2 (22 min)

**4.1 Introdução ao JavaScript (10 min). Falas-chave:**
- Criado por Brendan Eich na Netscape, em 1995, em cerca de 10 dias, para dar interatividade às páginas.
- Chamou-se Mocha, depois LiveScript e por fim JavaScript, aproveitando a fama do Java. As duas linguagens não têm relação.
- Padronizado como ECMAScript (Ecma, 1997). O ES6/ES2015 trouxe `let`/`const`, arrow functions, classes e módulos.
- Em 2009 o Node.js levou o JS para fora do navegador.
- Funcionamento: interpretado com compilação JIT, tipagem dinâmica, uma thread com event loop.
- Demonstração rápida no `node` (REPL): `let`/`const`, template literals, objeto `{ x: 3, y: 4 }`, função com valor padrão, arrow function.

**E2 (12 min):** os alunos seguem [exercicios.md](exercicios.md#e2-branch-e-primeiros-arquivos-javascript). Ao final, mostre a aba **Actions** e o **Summary** de um aluno.

### 5. Módulos ESM e E3 (12 min)

- CommonJS (`require`/`module.exports`) é o formato histórico do Node. ESM (`import`/`export`) é o padrão da linguagem, usado no navegador e no Node.
- `.mjs` força ESM; no ESM o `import` precisa da extensão do arquivo.
- `git mv` registra a renomeação: mostre `git status` com `renamed:`.

### 6. Pull, push e conflito: E4 (12 min)

- `git pull` = `git fetch` + `git merge`.
- Antes do exercício, mostre um arquivo com marcadores de conflito e explique os três blocos.
- Reforce: "conflito não é erro, é o Git pedindo uma decisão".

### 7. Rebase, reset e Conventional Commits: E5 (10 min)

- Desenhe merge vs. rebase (slide). Rebase reescreve commits; merge preserva o histórico.
- `reset --soft` (mantém staging), `--mixed` (padrão, mantém arquivos), `--hard` (descarta tudo; cuidado).
- Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`; `!` ou `BREAKING CHANGE` para mudanças incompatíveis. Permite gerar changelog e versão (SemVer) automaticamente.
- `git reflog` como rede de segurança.

### 8. Pull Request, Gitflow e CI/CD: E6 (12 min)

- E6 primeiro (7 min); os conceitos enquanto as duplas aprovam.
- Gitflow: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`. Trunk-based: branches curtas direto na `main`, comum com CI/CD maduro.
- CI/CD: a própria Actions do workshop é um exemplo. Abra `.github/workflows/progresso.yml` e mostre gatilhos (`on`), `permissions`, `jobs` e `steps`.
- Outras forges: Azure DevOps (Azure Pipelines) e GitLab (GitLab CI) seguem a mesma ideia de pipeline em YAML versionado junto com o código. Apenas citar.

### 9. Encerramento (5 min)

- Abra a busca de Issues de progresso (veja [Análise dos resultados](#análise-dos-resultados)) e comente o panorama da turma.
- Próximos passos: rebase interativo, `cherry-pick`, `git bisect`, hooks e proteção de branch.

## Arquivos dos exercícios

A pasta `exercicios/` tem uma subpasta por exercício (`e2/`, `e3/`), cada uma com o esqueleto (`exe-N-*`) e a solução (`sol-N-*`). Os alunos podem copiar a solução: o objetivo é praticar os comandos Git e ver o código rodar e os testes passarem.

Para manutenção, em `.github/scripts/`:

- `verificar-testes.sh`: confere os testes contra os arquivos `exe-*` (devem falhar) e `sol-*` (devem passar).
- `simular-progresso.sh`: simula o fluxo E2 a E6 com um remoto local e roda a automação em `--dry-run`, incluindo os casos negativos. Nunca usa o remoto real.

## Como a automação funciona

`.github/workflows/progresso.yml` roda em `push`, `pull_request`, `pull_request_review` e `workflow_dispatch` e executa `.github/scripts/progresso.mjs`, que:

1. Procura a Issue com o label `progresso` e a cria se não existir.
2. Na branch de trabalho, verifica E2 a E5 (arquivos, `node --test`, merges, marcadores de conflito, mensagens de commit, ancestralidade com a `main`).
3. No PR mergeado, consulta os reviews: E6 exige uma aprovação de alguém que não é o autor.
4. Marca os itens novos na Issue (nunca desmarca), publica o resumo no **Summary** e fecha a Issue quando o E6 é concluído.

Para testar localmente sem chamar a API: `node .github/scripts/progresso.mjs --dry-run`, com `GITHUB_EVENT_NAME`, `GITHUB_EVENT_PATH` e, opcionalmente, `DRY_RUN_FIXTURES` (JSON com respostas simuladas por `"MÉTODO /caminho"`).

## Análise dos resultados

- Peça a cada aluno o link do repositório (chat ou formulário) no bloco 3.
- Se os repositórios forem públicos, a busca do GitHub reúne todas as Issues: `is:issue label:progresso "Progresso do workshop"`.
- Em cada repositório: a Issue mostra o que foi concluído; a aba **Actions** mostra cada tentativa e o **Summary** explica o que faltou.
- Sinais úteis: muitas falhas no E4 indicam pull feito antes do commit local; no E5, mensagens fora do padrão.

## Checklist de ensaio

- [ ] Template publicado e marcado como template.
- [ ] Repositório criado a partir do template; **Run workflow** cria a Issue.
- [ ] E2: push na branch marca E2.
- [ ] E3: push marca E3.
- [ ] E4 negativo: commit com marcadores de conflito não marca E4.
- [ ] E4: conflito resolvido marca E4.
- [ ] E5 negativo: commit fora do padrão não marca E5.
- [ ] E5: após o rebase, E4 continua marcado e E5 é marcado.
- [ ] E6 negativo: autor não consegue aprovar o próprio PR.
- [ ] E6 negativo: merge sem aprovação não marca E6.
- [ ] E6: merge com aprovação da dupla marca E6 e fecha a Issue.
- [ ] Ensaio cronometrado; tempos reais anotados na tabela de cronograma.
