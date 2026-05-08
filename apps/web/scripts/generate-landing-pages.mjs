#!/usr/bin/env node
import {
  getAllCities,
  professionData,
  stateData,
  countryNamePt,
  calculateMarketRates,
} from "@freelaz/shared";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");
const SITE_URL = "https://freelaz.com";

const slugify = (input) =>
  input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatUSD = (n) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

async function findAssetPaths() {
  const indexHtml = await readFile(join(DIST, "index.html"), "utf8");
  const css = indexHtml.match(/href="(\/assets\/[^"]+\.css)"/)?.[1] ?? null;
  const js = indexHtml.match(/src="(\/assets\/[^"]+\.js)"/)?.[1] ?? null;
  return { css, js };
}

function pageShell({
  title,
  description,
  canonical,
  jsonLd,
  body,
  cssHref,
}) {
  const cssTag = cssHref ? `<link rel="stylesheet" href="${cssHref}" />` : "";
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#1f2937" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${SITE_URL}/og-image.jpg" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Freelaz" />
  <meta name="twitter:card" content="summary_large_image" />
  ${cssTag}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body class="bg-gray-900 text-gray-100">
  <main class="max-w-4xl mx-auto px-4 py-10 sm:py-16">
    <nav class="text-sm text-gray-400 mb-6">
      <a href="/" class="hover:text-white">Freelaz</a>
    </nav>
    ${body}
    <div class="mt-12 p-6 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl text-center">
      <h2 class="text-xl sm:text-2xl font-bold mb-2">Calcule sua taxa agora</h2>
      <p class="text-sm sm:text-base mb-4 opacity-90">
        Ferramenta gratuita. Considera custo de vida, impostos e localização do cliente.
      </p>
      <a href="/" class="inline-block bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100">
        Abrir Calculadora →
      </a>
    </div>
  </main>
  <footer class="text-center text-xs text-gray-500 py-8">
    <a href="/" class="hover:text-gray-300">freelaz.com</a> · Calculadora de Preço para Freelancer Brasileiro
  </footer>
</body>
</html>
`;
}

function professionLabelPt(key) {
  return professionData[key]?.name?.pt ?? key;
}

function cityPageBody(loc) {
  const countryPt = countryNamePt(loc.country);
  const rateBands = [
    {
      label: "Júnior",
      rate: loc.localDeveloperRates.junior,
    },
    { label: "Pleno", rate: loc.localDeveloperRates.mid },
    { label: "Sênior", rate: loc.localDeveloperRates.senior },
  ];

  const yourCompetitiveSenior = Math.round(loc.localDeveloperRates.senior * 0.75);

  return `
    <h1 class="text-3xl sm:text-4xl font-bold mb-4">
      Quanto cobrar de cliente em ${escapeHtml(
        loc.namePortuguese || loc.city
      )} sendo freelancer brasileiro
    </h1>
    <p class="text-lg text-gray-300 mb-8">
      Guia de precificação para freelancers brasileiros que prestam serviço para clientes em
      ${escapeHtml(loc.namePortuguese || loc.city)}, ${escapeHtml(countryPt)}.
      Inclui custo de vida local, taxas praticadas por desenvolvedores na região e
      faixa competitiva sugerida para profissionais brasileiros remotos.
    </p>

    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Custo de vida</div>
        <div class="text-2xl font-bold">${formatUSD(loc.costOfLiving)}</div>
        <div class="text-xs text-gray-400">por mês</div>
      </div>
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Salário médio líquido</div>
        <div class="text-2xl font-bold">${formatUSD(loc.averageNetSalary)}</div>
        <div class="text-xs text-gray-400">por mês</div>
      </div>
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Poder de compra</div>
        <div class="text-2xl font-bold">${loc.purchasingPowerIndex}%</div>
        <div class="text-xs text-gray-400">vs. média global</div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-2xl font-bold mb-4">Taxas praticadas em ${escapeHtml(
        loc.namePortuguese || loc.city
      )}</h2>
      <div class="grid grid-cols-3 gap-4">
        ${rateBands
          .map(
            (b) => `
              <div class="bg-gray-800 rounded-xl p-5 text-center">
                <div class="text-xs text-gray-400 mb-1">${b.label}</div>
                <div class="text-xl font-bold">${formatUSD(b.rate)}/h</div>
              </div>`
          )
          .join("")}
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-2xl font-bold mb-3">Faixa competitiva para freelancer brasileiro</h2>
      <p class="text-gray-300 mb-4">
        Para clientes em ${escapeHtml(loc.namePortuguese || loc.city)}, freelancers
        brasileiros remotos costumam praticar cerca de 25% abaixo da taxa de um profissional
        sênior local — ou seja, próximo de
        <strong class="text-white">${formatUSD(yourCompetitiveSenior)}/h</strong> para nível sênior,
        ajustado pelo poder de compra local. A taxa exata depende do seu custo de vida,
        impostos e regime tributário (ex.: MEI com exportação de serviços, alíquota a partir de 6%).
      </p>
      <p class="text-gray-400 text-sm">
        Use a calculadora para ver o número específico para o seu perfil — ela considera o seu estado
        de origem no Brasil, o regime tributário, e o ajuste pelo poder de compra de
        ${escapeHtml(loc.namePortuguese || loc.city)}.
      </p>
    </section>
  `;
}

function professionPageBody(key) {
  const data = professionData[key];
  const namePt = data.name.pt;
  const market = calculateMarketRates(key, "pleno", 100);
  const senior = calculateMarketRates(key, "senior", 100);

  return `
    <h1 class="text-3xl sm:text-4xl font-bold mb-4">
      Quanto cobrar como ${escapeHtml(namePt)} freelancer no Brasil
    </h1>
    <p class="text-lg text-gray-300 mb-8">
      Faixas de taxa horária praticadas por ${escapeHtml(
        namePt.toLowerCase()
      )} freelancers brasileiros, em USD por hora,
      considerando trabalho remoto para clientes nacionais e internacionais.
    </p>

    <section class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Pleno</div>
        <div class="text-2xl font-bold">${formatUSD(market.min)} – ${formatUSD(market.max)}/h</div>
      </div>
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Sênior</div>
        <div class="text-2xl font-bold">${formatUSD(senior.min)} – ${formatUSD(senior.max)}/h</div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-2xl font-bold mb-3">Como precificar como ${escapeHtml(namePt)}</h2>
      <p class="text-gray-300 mb-3">
        Sua taxa horária ideal depende de quatro fatores: custo de vida na sua cidade,
        reserva financeira e gastos extras, regime tributário, e a localização do cliente.
        A regra simples: some custo + reserva + extras, divida pelo bruto que cobre seus impostos,
        e divida pelas horas faturáveis no mês.
      </p>
      <p class="text-gray-300">
        Para clientes internacionais, o regime de exportação de serviços (MEI a partir de 6%)
        e o ajuste pelo poder de compra do mercado do cliente costumam permitir taxas significativamente
        maiores do que clientes nacionais.
      </p>
    </section>
  `;
}

function statePageBody(key) {
  const s = stateData[key];
  return `
    <h1 class="text-3xl sm:text-4xl font-bold mb-4">
      Calculadora de taxa freelancer em ${escapeHtml(s.name)}
    </h1>
    <p class="text-lg text-gray-300 mb-8">
      Quanto cobrar como freelancer baseado em ${escapeHtml(s.name)}, considerando
      o índice de custo de vida regional (${s.costIndex}% relativo a São Paulo) e ajustes para
      clientes nacionais e internacionais.
    </p>

    <section class="bg-gray-800 rounded-xl p-5 mb-10">
      <h2 class="text-xl font-bold mb-3">Sobre ${escapeHtml(s.name)}</h2>
      <p class="text-gray-300">
        Índice de custo de vida: <strong>${s.costIndex}%</strong> (referência São Paulo = 100%).
        Profissionais em ${escapeHtml(s.name)} podem ajustar suas necessidades mensais por
        este índice ao calcular a taxa horária — uma realidade financeira menor permite taxas
        mais competitivas para o mesmo padrão de vida.
      </p>
    </section>
  `;
}

async function writePage(relPath, html) {
  const dir = join(DIST, relPath);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html, "utf8");
}

async function generate() {
  await mkdir(DIST, { recursive: true });
  const { css } = await findAssetPaths();

  const urls = [{ loc: `${SITE_URL}/`, priority: "1.0", changefreq: "weekly" }];

  const cities = getAllCities();
  for (const loc of cities) {
    const slug = `${slugify(loc.city)}-${slugify(loc.country)}`;
    const path = `cliente-em/${slug}`;
    const canonical = `${SITE_URL}/${path}`;
    const cityPt = loc.namePortuguese || loc.city;
    const countryPt = countryNamePt(loc.country);

    const title = `Quanto cobrar de cliente em ${cityPt} (${countryPt}) — Freelaz`;
    const description = `Quanto cobrar como freelancer brasileiro para clientes em ${cityPt}, ${countryPt}. Taxas locais, custo de vida e faixa competitiva.`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      inLanguage: "pt-BR",
      mainEntityOfPage: canonical,
      publisher: { "@type": "Organization", name: "Freelaz" },
      about: { "@type": "Place", name: `${loc.city}, ${loc.country}` },
    };

    await writePage(
      path,
      pageShell({
        title,
        description,
        canonical,
        jsonLd,
        body: cityPageBody(loc),
        cssHref: css,
      })
    );

    urls.push({ loc: canonical, priority: "0.8", changefreq: "monthly" });
  }

  for (const key of Object.keys(professionData)) {
    const slug = slugify(professionLabelPt(key));
    const path = `freelancer/${slug}`;
    const canonical = `${SITE_URL}/${path}`;
    const namePt = professionLabelPt(key);
    const title = `Quanto cobrar como ${namePt} freelancer brasileiro — Freelaz`;
    const description = `Faixas de taxa horária para ${namePt.toLowerCase()} freelancer no Brasil. Pleno, sênior, mercado nacional e internacional.`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      inLanguage: "pt-BR",
      mainEntityOfPage: canonical,
      publisher: { "@type": "Organization", name: "Freelaz" },
    };
    await writePage(
      path,
      pageShell({
        title,
        description,
        canonical,
        jsonLd,
        body: professionPageBody(key),
        cssHref: css,
      })
    );
    urls.push({ loc: canonical, priority: "0.8", changefreq: "monthly" });
  }

  for (const key of Object.keys(stateData)) {
    const s = stateData[key];
    const slug = slugify(s.name);
    const path = `estado/${slug}`;
    const canonical = `${SITE_URL}/${path}`;
    const title = `Calculadora de taxa freelancer em ${s.name} — Freelaz`;
    const description = `Quanto cobrar como freelancer em ${s.name}. Calculadora considera custo de vida regional e clientes nacionais e internacionais.`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      inLanguage: "pt-BR",
      mainEntityOfPage: canonical,
      publisher: { "@type": "Organization", name: "Freelaz" },
      about: { "@type": "Place", name: `${s.name}, Brasil` },
    };
    await writePage(
      path,
      pageShell({
        title,
        description,
        canonical,
        jsonLd,
        body: statePageBody(key),
        cssHref: css,
      })
    );
    urls.push({ loc: canonical, priority: "0.7", changefreq: "monthly" });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>
`;
  await writeFile(join(DIST, "sitemap.xml"), sitemap, "utf8");

  console.log(
    `[seo] generated ${cities.length} city + ${
      Object.keys(professionData).length
    } profession + ${Object.keys(stateData).length} state pages, sitemap with ${
      urls.length
    } URLs`
  );
}

generate().catch((err) => {
  console.error("[seo] failed:", err);
  process.exit(1);
});
