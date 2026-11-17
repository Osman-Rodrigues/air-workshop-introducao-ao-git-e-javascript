import { saudar } from "./saudacao.mjs";
import { minhaLocalizacao, distancia, descrever } from "./localizacao.mjs";

const nome = "Ana";
const origem = { x: 0, y: 0 };
const dist = distancia(origem, minhaLocalizacao);

console.log(`${saudar(nome)} Você está em ${descrever(minhaLocalizacao)}, a ${dist} unidades da origem.`);