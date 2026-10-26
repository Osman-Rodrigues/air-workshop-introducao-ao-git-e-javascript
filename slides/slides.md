---
marp: true
theme: default
paginate: true
lang: pt-BR
title: Introdução ao Git (com JavaScript)
---

<!-- _class: lead -->

# Introdução ao Git

### com uma pitada de JavaScript

`air-workshop-introducao-ao-git-e-javascript`

---

## Objetivo de hoje

Sair daqui com um **Pull Request aprovado** no seu próprio repositório.

```text
git init → commit → clone → branch → push → conflito → rebase → Pull Request
```

Checagem rápida:

```bash
git --version   # 2.23 ou mais recente
node -v         # 22 ou mais recente
```

---

<!-- _class: lead -->

# 1. História e funcionamento do Git

---

## Por que o Git surgiu?

- Até 2005 o kernel Linux era versionado no **BitKeeper**, proprietário e com licença gratuita.
- Em abril de 2005 a licença foi revogada.
- **Linus Torvalds** escreveu o Git em poucos dias. Metas:
  - velocidade
  - integridade (tudo identificado por hash)
  - trabalho **distribuído**
- Em julho de 2005, **Junio Hamano** assumiu a manutenção, que mantém até hoje.

---

## Centralizado vs. distribuído

```text
 Centralizado (CVS, SVN)            Distribuído (Git)

        [servidor]                [remoto]   [remoto]
       /    |     \                   \       /
     dev   dev    dev            [clone]---[clone]
  (só a cópia atual)            (histórico completo em cada um)
```

Com o Git você faz commit, consulta o histórico e cria branches **sem rede**.

---

## Fotos, não diferenças

Cada commit guarda uma **foto** do projeto e aponta para o commit anterior.

```text
 a1b2c3 ←── d4e5f6 ←── 9f8e7d
                          ↑
                         main ←── HEAD
```

- O identificador (`9f8e7d...`) é um hash SHA do conteúdo.
- **Branch** é só um ponteiro para um commit.
- **HEAD** aponta para onde você está.

---

## As três áreas

```text
 diretório de trabalho ──git add──▶ staging ──git commit──▶ repositório (.git)
        ▲                                                         │
        └──────────────────── git switch / git restore ───────────┘
```

`git status` diz em qual área cada arquivo está.

---

<!-- _class: lead -->

# 2. Repositório local

### E1: `git init`, `status`, `add`, `commit`, `log`

---

## E1 em 6 comandos

```bash
mkdir ~/git-sandbox && cd ~/git-sandbox
git init
head -c 1024 /dev/urandom > arquivo.bin
git add arquivo.bin
git commit -m "adiciona arquivo binario"
git log --oneline
```

Troque o arquivo e rode `git diff`: **Binary files differ**.
O Git compara texto linha a linha. Para binários grandes existe o **Git LFS**.

---

<!-- _class: lead -->

# Pausa (5 min)

---

<!-- _class: lead -->

# 3. Repositório remoto

---

## Do template ao clone

1. **Use this template** > crie o repositório na sua conta.
2. **Settings** > **Collaborators**: adicione a sua dupla.
3. **Actions** > **Progresso do workshop** > **Run workflow**.
4. Clone:

```bash
git clone <URL-do-seu-repositorio>
cd <nome-do-seu-repositorio>
git remote -v   # origin = apelido do remoto
```

A Issue **Progresso do workshop** se marca sozinha conforme você avança.

---

<!-- _class: lead -->

# 4. JavaScript em 10 minutos

---

## De onde veio o JavaScript?

- **1995**, Netscape: **Brendan Eich** cria a linguagem em cerca de 10 dias.
- Mocha → LiveScript → **JavaScript** (marketing: o Java estava em alta; as linguagens não têm relação).
- **1997**: padronizado como **ECMAScript**.
- **2009**: o **Node.js** leva o JS para fora do navegador.
- **2015**: ES6 traz `let`/`const`, arrow functions, classes e **módulos**.

---

## Como o JavaScript funciona

- Interpretado, com compilação **JIT** no motor (V8, SpiderMonkey...).
- **Tipagem dinâmica**: o tipo é do valor, não da variável.
- **Uma thread** com **event loop**: tarefas demoradas não bloqueiam.

```js
const minhaLocalizacao = { x: 3, y: 4 };
let nome = "Ana";

function saudar(nome = "mundo") {
  return `Olá, ${nome}!`;
}

const dobro = (n) => n * 2;
```

---

## E2: branch e primeiros snippets

```bash
git switch -c feature/saudacao-localizacao
mkdir snippets
cp exercicios/e2/exe-2-saudacao.js snippets/01-saudacao.js   # antes
node snippets/01-saudacao.js
git add snippets/01-saudacao.js
git commit -m "adiciona esqueleto da saudacao"
cp exercicios/e2/sol-2-saudacao.js snippets/01-saudacao.js   # depois
git diff
git commit -am "implementa saudacao com nome"
# o mesmo para 02-minha-localizacao.js, com npm test antes e depois
git push -u origin feature/saudacao-localizacao
```

Confira a aba **Actions** > **Summary**.

---

<!-- _class: lead -->

# 5. Módulos ESM

---

## CommonJS vs. ES Modules

| CommonJS (histórico do Node) | ESM (padrão da linguagem) |
|---|---|
| `const { saudar } = require("./saudacao.js")` | `import { saudar } from "./saudacao.mjs"` |
| `module.exports = { saudar }` | `export function saudar() {}` |
| carregamento síncrono | carregamento assíncrono, análise estática |

```bash
git mv snippets/01-saudacao.js snippets/saudacao.mjs
git status   # renamed: ...
```

Saída esperada: `Olá, Ana! Você está em (3, 4), a 5 unidades da origem.`

---

<!-- _class: lead -->

# 6. Pull, push e conflito

---

## `git pull` = `git fetch` + `git merge`

```text
<<<<<<< HEAD
  return `Bem-vindo, ${nome}!`;      ← sua versão
=======
  return `Oi, ${nome}!`;             ← versão do remoto
>>>>>>> 3c4d5e6...
```

1. Escolha o texto final.
2. Apague **todos** os marcadores.
3. `git add` + `git commit` + `git push`.

Conflito não é erro: é o Git pedindo uma decisão.

---

<!-- _class: lead -->

# 7. Rebase, reset e Conventional Commits

---

## Merge vs. rebase

```text
 merge:                          rebase:
 A──B──C──────M  feature         A──B──E──C'──D'  feature
     \       /                   (C e D reaplicados sobre E:
      E─────┘    main             histórico linear, novos hashes)
```

**Regra de ouro:** não reescreva commits que outras pessoas já usam.
Por isso `git push --force-with-lease`, e não `--force`.

---

## `git reset`

| Modo | HEAD | Staging | Arquivos |
|---|---|---|---|
| `--soft` | move | mantém | mantém |
| `--mixed` (padrão) | move | limpa | mantém |
| `--hard` | move | limpa | **descarta** |

Rede de segurança: `git reflog` lista todas as posições anteriores do `HEAD`.

---

## Conventional Commits

```text
tipo(escopo): descrição

feat(snippets): adiciona saudacao com localizacao
fix(localizacao): corrige calculo da distancia
docs: atualiza readme
feat(api)!: remove endpoint antigo     ← mudança incompatível
```

Tipos comuns: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`.
Permite gerar **changelog** e **versão** (SemVer) automaticamente.

---

## E5 em 6 comandos

```bash
git fetch
git reset --soft main            # junta seus commits no staging
git commit -m "feat(snippets): adiciona saudacao com localizacao"
git rebase origin/main           # reaplica sobre a main atualizada
npm test
git push --force-with-lease
```

---

<!-- _class: lead -->

# 8. Pull Request, Gitflow e CI/CD

---

## E6: Pull Request

1. Abra o PR `feature/saudacao-localizacao` → `main`, com título Conventional.
2. Peça o review da dupla.
3. Aprove o PR da dupla.
4. Com aprovação, **Merge pull request**.

O GitHub não deixa o autor aprovar o próprio PR.

---

## Gitflow vs. trunk-based

```text
 Gitflow
 main     ──●────────────────●──────────●──      (versões publicadas)
 hotfix/*    \              / \        /
 release/*    \        ●───●   ●──────●
 develop  ─────●──●──●───────────●──
 feature/*      \__/ \__/
```

**Trunk-based:** branches curtas, integradas na `main` várias vezes ao dia. Comum com CI/CD maduro.

---

## CI/CD: a Actions deste workshop

```yaml
on: [push, pull_request, pull_request_review, workflow_dispatch]
permissions: { contents: read, issues: write }
jobs:
  progresso:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: node .github/scripts/progresso.mjs
```

Eventos do Git (push, PR, review) **disparam** pipelines versionados junto com o código.
Mesma ideia em outras forges: **Azure DevOps** (Azure Pipelines) e **GitLab** (GitLab CI).

---

<!-- _class: lead -->

# Encerramento

---

## O que vimos

`init` · `status` · `add` · `commit` · `log` · `diff` · `clone` · `switch` · `push` · `pull` · `merge` · `rebase` · `reset` · `reflog` · Pull Request

**Próximos passos:** rebase interativo, `cherry-pick`, `git bisect`, hooks, proteção de branch.

Obrigado!
