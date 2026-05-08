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
const TOP_CITY_KEYS = [
  "san-francisco-united-states",
  "new-york-city-united-states",
  "seattle-united-states",
  "austin-united-states",
  "london-united-kingdom",
  "berlin-germany",
];

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

const formatUSDEn = (n) =>
  new Intl.NumberFormat("en-US", {
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
  lang,
  title,
  description,
  canonical,
  alternateUrl,
  jsonLd,
  body,
  cssHref,
  cta,
  footer,
}) {
  const cssTag = cssHref ? `<link rel="stylesheet" href="${cssHref}" />` : "";
  const altLang = lang === "pt-BR" ? "en" : "pt-BR";
  const xDefault = lang === "pt-BR" ? canonical : alternateUrl;
  return `<!DOCTYPE html>
<html lang="${lang}">
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
  <link rel="alternate" hreflang="${lang}" href="${escapeHtml(canonical)}" />
  <link rel="alternate" hreflang="${altLang}" href="${escapeHtml(alternateUrl)}" />
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(xDefault)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${SITE_URL}/og-image.jpg" />
  <meta property="og:locale" content="${lang === "pt-BR" ? "pt_BR" : "en_US"}" />
  <meta property="og:site_name" content="Freelaz" />
  <meta name="twitter:card" content="summary_large_image" />
  ${cssTag}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body class="bg-gray-900 text-gray-100">
  <main class="max-w-4xl mx-auto px-4 py-10 sm:py-16">
    <nav class="text-sm text-gray-400 mb-6 flex justify-between">
      <a href="${lang === "pt-BR" ? "/" : "/en/"}" class="hover:text-white">Freelaz</a>
      <a href="${alternateUrl}" class="hover:text-white">
        ${lang === "pt-BR" ? "🇺🇸 English" : "🇧🇷 Português"}
      </a>
    </nav>
    ${body}
    <div class="mt-12 p-6 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl text-center">
      <h2 class="text-xl sm:text-2xl font-bold mb-2">${cta.heading}</h2>
      <p class="text-sm sm:text-base mb-4 opacity-90">${cta.body}</p>
      <a href="/" class="inline-block bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100">
        ${cta.button} →
      </a>
    </div>
  </main>
  <footer class="text-center text-xs text-gray-500 py-8">
    <a href="/" class="hover:text-gray-300">freelaz.com</a> · ${footer}
  </footer>
</body>
</html>
`;
}

const cityUrl = (loc, lang) => {
  const slug = `${slugify(loc.city)}-${slugify(loc.country)}`;
  return lang === "pt-BR"
    ? `${SITE_URL}/cliente-em/${slug}`
    : `${SITE_URL}/en/clients-in/${slug}`;
};

const professionUrl = (key, lang) => {
  const namePt = professionData[key].name.pt;
  const nameEn = professionData[key].name.en;
  const slug =
    lang === "pt-BR" ? slugify(namePt) : slugify(nameEn);
  return lang === "pt-BR"
    ? `${SITE_URL}/freelancer/${slug}`
    : `${SITE_URL}/en/freelancer/${slug}`;
};

const stateUrl = (key, lang) => {
  const slug = slugify(stateData[key].name);
  return lang === "pt-BR"
    ? `${SITE_URL}/estado/${slug}`
    : `${SITE_URL}/en/state/${slug}`;
};

function relatedSection(items, lang) {
  if (items.length === 0) return "";
  const heading =
    lang === "pt-BR" ? "📎 Páginas Relacionadas" : "📎 Related Pages";
  return `
    <section class="mt-10 pt-6 border-t border-gray-700">
      <h2 class="text-lg font-bold mb-3 text-gray-200">${heading}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        ${items
          .map(
            (i) => `
              <a href="${i.href}" class="text-sm text-blue-300 hover:text-blue-200 underline">
                ${escapeHtml(i.label)}
              </a>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function cityPageBody(loc, lang) {
  const cityName = lang === "pt-BR" ? loc.namePortuguese || loc.city : loc.city;
  const countryName = lang === "pt-BR" ? countryNamePt(loc.country) : loc.country;
  const fmt = lang === "pt-BR" ? formatUSD : formatUSDEn;
  const yourCompetitiveSenior = Math.round(loc.localDeveloperRates.senior * 0.75);

  const t =
    lang === "pt-BR"
      ? {
          h1: `Quanto cobrar de cliente em ${cityName} sendo freelancer brasileiro`,
          intro: `Guia de precificação para freelancers brasileiros que prestam serviço para clientes em ${cityName}, ${countryName}. Inclui custo de vida local, taxas praticadas por desenvolvedores na região e faixa competitiva sugerida para profissionais brasileiros remotos.`,
          col: { cost: "Custo de vida", salary: "Salário médio líquido", power: "Poder de compra" },
          per: "por mês",
          vs: "vs. média global",
          ratesH2: `Taxas praticadas em ${cityName}`,
          levels: { junior: "Júnior", mid: "Pleno", senior: "Sênior" },
          competitiveH2: "Faixa competitiva para freelancer brasileiro",
          competitiveBody: `Para clientes em ${cityName}, freelancers brasileiros remotos costumam praticar cerca de 25% abaixo da taxa de um profissional sênior local — ou seja, próximo de <strong class="text-white">${fmt(yourCompetitiveSenior)}/h</strong> para nível sênior, ajustado pelo poder de compra local. A taxa exata depende do seu custo de vida, impostos e regime tributário (ex.: MEI com exportação de serviços, alíquota a partir de 6%).`,
          competitiveFoot: `Use a calculadora para ver o número específico para o seu perfil — ela considera o seu estado de origem no Brasil, o regime tributário, e o ajuste pelo poder de compra de ${cityName}.`,
        }
      : {
          h1: `Brazilian freelancer rates for clients in ${cityName}`,
          intro: `Pricing guide for Brazilian freelancers serving clients in ${cityName}, ${countryName}. Includes local cost of living, prevailing developer rates, and the competitive band that remote Brazilian professionals typically quote.`,
          col: { cost: "Cost of living", salary: "Average net salary", power: "Purchasing power" },
          per: "per month",
          vs: "vs global average",
          ratesH2: `Local developer rates in ${cityName}`,
          levels: { junior: "Junior", mid: "Mid", senior: "Senior" },
          competitiveH2: "Competitive band for Brazilian freelancers",
          competitiveBody: `For clients in ${cityName}, remote Brazilian freelancers typically quote ~25% below a local senior rate — around <strong class="text-white">${fmt(yourCompetitiveSenior)}/h</strong> at senior level, adjusted for local purchasing power. The exact number depends on the freelancer's cost of living, tax burden, and regime (e.g. Brazilian MEI for service exports starts at 6%).`,
          competitiveFoot: `Use the calculator to get the number for your profile — it considers your home state in Brazil, your tax regime, and the purchasing-power adjustment for ${cityName}.`,
        };

  const rateBands = [
    { label: t.levels.junior, rate: loc.localDeveloperRates.junior },
    { label: t.levels.mid, rate: loc.localDeveloperRates.mid },
    { label: t.levels.senior, rate: loc.localDeveloperRates.senior },
  ];

  return `
    <h1 class="text-3xl sm:text-4xl font-bold mb-4">${escapeHtml(t.h1)}</h1>
    <p class="text-lg text-gray-300 mb-8">${escapeHtml(t.intro)}</p>

    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">${t.col.cost}</div>
        <div class="text-2xl font-bold">${fmt(loc.costOfLiving)}</div>
        <div class="text-xs text-gray-400">${t.per}</div>
      </div>
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">${t.col.salary}</div>
        <div class="text-2xl font-bold">${fmt(loc.averageNetSalary)}</div>
        <div class="text-xs text-gray-400">${t.per}</div>
      </div>
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">${t.col.power}</div>
        <div class="text-2xl font-bold">${loc.purchasingPowerIndex}%</div>
        <div class="text-xs text-gray-400">${t.vs}</div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-2xl font-bold mb-4">${escapeHtml(t.ratesH2)}</h2>
      <div class="grid grid-cols-3 gap-4">
        ${rateBands
          .map(
            (b) => `
              <div class="bg-gray-800 rounded-xl p-5 text-center">
                <div class="text-xs text-gray-400 mb-1">${b.label}</div>
                <div class="text-xl font-bold">${fmt(b.rate)}/h</div>
              </div>`
          )
          .join("")}
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-2xl font-bold mb-3">${escapeHtml(t.competitiveH2)}</h2>
      <p class="text-gray-300 mb-4">${t.competitiveBody}</p>
      <p class="text-gray-400 text-sm">${escapeHtml(t.competitiveFoot)}</p>
    </section>
  `;
}

function professionPageBody(key, lang) {
  const data = professionData[key];
  const name = lang === "pt-BR" ? data.name.pt : data.name.en;
  const market = calculateMarketRates(key, "pleno", 100);
  const senior = calculateMarketRates(key, "senior", 100);
  const fmt = lang === "pt-BR" ? formatUSD : formatUSDEn;

  if (lang === "pt-BR") {
    return `
      <h1 class="text-3xl sm:text-4xl font-bold mb-4">
        Quanto cobrar como ${escapeHtml(name)} freelancer no Brasil
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Faixas de taxa horária praticadas por ${escapeHtml(
          name.toLowerCase()
        )} freelancers brasileiros, em USD por hora, considerando trabalho remoto para clientes nacionais e internacionais.
      </p>

      <section class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div class="bg-gray-800 rounded-xl p-5">
          <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Pleno</div>
          <div class="text-2xl font-bold">${fmt(market.min)} – ${fmt(market.max)}/h</div>
        </div>
        <div class="bg-gray-800 rounded-xl p-5">
          <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Sênior</div>
          <div class="text-2xl font-bold">${fmt(senior.min)} – ${fmt(senior.max)}/h</div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-bold mb-3">Como precificar como ${escapeHtml(name)}</h2>
        <p class="text-gray-300 mb-3">
          Sua taxa horária ideal depende de quatro fatores: custo de vida na sua cidade, reserva financeira e gastos extras, regime tributário, e a localização do cliente. A regra simples: some custo + reserva + extras, divida pelo bruto que cobre seus impostos, e divida pelas horas faturáveis no mês.
        </p>
        <p class="text-gray-300">
          Para clientes internacionais, o regime de exportação de serviços (MEI a partir de 6%) e o ajuste pelo poder de compra do mercado do cliente costumam permitir taxas significativamente maiores do que clientes nacionais.
        </p>
      </section>
    `;
  }

  return `
    <h1 class="text-3xl sm:text-4xl font-bold mb-4">
      Brazilian ${escapeHtml(name.toLowerCase())} freelancer rates
    </h1>
    <p class="text-lg text-gray-300 mb-8">
      Hourly rates that ${escapeHtml(
        name.toLowerCase()
      )} freelancers from Brazil typically quote, in USD per hour, for remote work with domestic and international clients.
    </p>

    <section class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Mid level</div>
        <div class="text-2xl font-bold">${fmt(market.min)} – ${fmt(market.max)}/h</div>
      </div>
      <div class="bg-gray-800 rounded-xl p-5">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-1">Senior</div>
        <div class="text-2xl font-bold">${fmt(senior.min)} – ${fmt(senior.max)}/h</div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-2xl font-bold mb-3">How to price as a ${escapeHtml(name)}</h2>
      <p class="text-gray-300 mb-3">
        Your ideal hourly rate depends on four levers: cost of living in your city, your financial buffer and extras, your tax burden, and the client's location. The simple rule: sum cost + savings + extras, divide by the gross that absorbs taxes, then divide by your billable hours per month.
      </p>
      <p class="text-gray-300">
        For international clients, Brazilian MEI service-export taxation (starting at 6%) plus a purchasing-power adjustment to the client market typically supports significantly higher rates than domestic clients.
      </p>
    </section>
  `;
}

function statePageBody(key, lang) {
  const s = stateData[key];
  if (lang === "pt-BR") {
    return `
      <h1 class="text-3xl sm:text-4xl font-bold mb-4">
        Calculadora de taxa freelancer em ${escapeHtml(s.name)}
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Quanto cobrar como freelancer baseado em ${escapeHtml(
          s.name
        )}, considerando o índice de custo de vida regional (${s.costIndex}% relativo a São Paulo) e ajustes para clientes nacionais e internacionais.
      </p>

      <section class="bg-gray-800 rounded-xl p-5 mb-10">
        <h2 class="text-xl font-bold mb-3">Sobre ${escapeHtml(s.name)}</h2>
        <p class="text-gray-300">
          Índice de custo de vida: <strong>${s.costIndex}%</strong> (referência São Paulo = 100%). Profissionais em ${escapeHtml(s.name)} podem cobrar taxas competitivas com margem confortável dada uma realidade financeira regional menor.
        </p>
      </section>
    `;
  }
  return `
    <h1 class="text-3xl sm:text-4xl font-bold mb-4">
      Brazilian freelancer rates from ${escapeHtml(s.name)}
    </h1>
    <p class="text-lg text-gray-300 mb-8">
      Pricing calculator for freelancers based in ${escapeHtml(
        s.name
      )}, Brazil — accounting for the regional cost-of-living index (${s.costIndex}% of São Paulo) and adjustments for domestic and international clients.
    </p>

    <section class="bg-gray-800 rounded-xl p-5 mb-10">
      <h2 class="text-xl font-bold mb-3">About ${escapeHtml(s.name)}</h2>
      <p class="text-gray-300">
        Cost-of-living index: <strong>${s.costIndex}%</strong> (São Paulo = 100%). Freelancers in ${escapeHtml(s.name)} can quote competitively with comfortable margin given a lower regional baseline.
      </p>
    </section>
  `;
}

const CTAS = {
  "pt-BR": {
    heading: "Calcule sua taxa agora",
    body: "Ferramenta gratuita. Considera custo de vida, impostos, regime tributário e localização do cliente.",
    button: "Abrir Calculadora",
    footer: "Calculadora de Preço para Freelancer Brasileiro",
  },
  en: {
    heading: "Calculate your rate now",
    body: "Free tool. Factors in cost of living, taxes, regime, and client location.",
    button: "Open Calculator",
    footer: "Brazilian Freelancer Rate Calculator",
  },
};

async function writePage(relPath, html) {
  const dir = join(DIST, relPath);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html, "utf8");
}

async function generate() {
  await mkdir(DIST, { recursive: true });
  const { css } = await findAssetPaths();

  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "weekly" },
    { loc: `${SITE_URL}/en/`, priority: "0.9", changefreq: "weekly" },
  ];

  const cities = getAllCities();
  const cityByKey = new Map(
    cities.map((c) => [
      `${slugify(c.city)}-${slugify(c.country)}`,
      c,
    ])
  );
  const topCities = TOP_CITY_KEYS.map((k) => cityByKey.get(k)).filter(Boolean);

  for (const lang of ["pt-BR", "en"]) {
    const cta = CTAS[lang === "pt-BR" ? "pt-BR" : "en"];
    const langPrefix = lang === "pt-BR" ? "" : "en/";

    // City pages
    for (const loc of cities) {
      const slug = `${slugify(loc.city)}-${slugify(loc.country)}`;
      const path =
        lang === "pt-BR"
          ? `cliente-em/${slug}`
          : `en/clients-in/${slug}`;
      const canonical = `${SITE_URL}/${path}`;
      const altUrl = cityUrl(loc, lang === "pt-BR" ? "en" : "pt-BR");
      const cityDisplay = lang === "pt-BR" ? loc.namePortuguese || loc.city : loc.city;
      const countryDisplay = lang === "pt-BR" ? countryNamePt(loc.country) : loc.country;
      const title =
        lang === "pt-BR"
          ? `Quanto cobrar de cliente em ${cityDisplay} (${countryDisplay}) — Freelaz`
          : `Brazilian freelancer rates for clients in ${cityDisplay} (${countryDisplay}) — Freelaz`;
      const description =
        lang === "pt-BR"
          ? `Quanto cobrar como freelancer brasileiro para clientes em ${cityDisplay}, ${countryDisplay}. Taxas locais, custo de vida e faixa competitiva.`
          : `How much should a Brazilian freelancer charge for clients in ${cityDisplay}, ${countryDisplay}. Local rates, cost of living, competitive band.`;

      const related = [
        ...["fullstack", "frontend", "backend"].slice(0, 3).map((k) => ({
          href: professionUrl(k, lang),
          label:
            lang === "pt-BR"
              ? `Taxa de ${professionData[k].name.pt}`
              : `${professionData[k].name.en} rates`,
        })),
        {
          href: stateUrl("sp", lang),
          label:
            lang === "pt-BR"
              ? "Calculadora para São Paulo"
              : "Calculator for São Paulo",
        },
      ];

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        inLanguage: lang === "pt-BR" ? "pt-BR" : "en",
        mainEntityOfPage: canonical,
        publisher: { "@type": "Organization", name: "Freelaz" },
        about: { "@type": "Place", name: `${loc.city}, ${loc.country}` },
      };

      const body =
        cityPageBody(loc, lang) + relatedSection(related, lang);

      await writePage(
        path,
        pageShell({
          lang,
          title,
          description,
          canonical,
          alternateUrl: altUrl,
          jsonLd,
          body,
          cssHref: css,
          cta: { heading: cta.heading, body: cta.body, button: cta.button },
          footer: cta.footer,
        })
      );

      urls.push({ loc: canonical, priority: "0.8", changefreq: "monthly" });
    }

    // Profession pages
    for (const key of Object.keys(professionData)) {
      const namePt = professionData[key].name.pt;
      const nameEn = professionData[key].name.en;
      const slug = lang === "pt-BR" ? slugify(namePt) : slugify(nameEn);
      const path = `${langPrefix}freelancer/${slug}`;
      const canonical = `${SITE_URL}/${path}`;
      const altUrl = professionUrl(key, lang === "pt-BR" ? "en" : "pt-BR");
      const display = lang === "pt-BR" ? namePt : nameEn;

      const title =
        lang === "pt-BR"
          ? `Quanto cobrar como ${display} freelancer brasileiro — Freelaz`
          : `Brazilian ${display.toLowerCase()} freelancer rates — Freelaz`;
      const description =
        lang === "pt-BR"
          ? `Faixas de taxa horária para ${display.toLowerCase()} freelancer no Brasil. Pleno, sênior, mercado nacional e internacional.`
          : `Hourly rate bands for Brazilian ${display.toLowerCase()} freelancers. Mid, senior, domestic and international market.`;

      const related = topCities.slice(0, 5).map((c) => ({
        href: cityUrl(c, lang),
        label:
          lang === "pt-BR"
            ? `Cliente em ${c.namePortuguese || c.city}`
            : `Clients in ${c.city}`,
      }));

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        inLanguage: lang === "pt-BR" ? "pt-BR" : "en",
        mainEntityOfPage: canonical,
        publisher: { "@type": "Organization", name: "Freelaz" },
      };

      const body =
        professionPageBody(key, lang) + relatedSection(related, lang);

      await writePage(
        path,
        pageShell({
          lang,
          title,
          description,
          canonical,
          alternateUrl: altUrl,
          jsonLd,
          body,
          cssHref: css,
          cta: { heading: cta.heading, body: cta.body, button: cta.button },
          footer: cta.footer,
        })
      );

      urls.push({ loc: canonical, priority: "0.8", changefreq: "monthly" });
    }

    // State pages
    for (const key of Object.keys(stateData)) {
      const s = stateData[key];
      const slug = slugify(s.name);
      const path = `${langPrefix}${lang === "pt-BR" ? "estado" : "state"}/${slug}`;
      const canonical = `${SITE_URL}/${path}`;
      const altUrl = stateUrl(key, lang === "pt-BR" ? "en" : "pt-BR");

      const title =
        lang === "pt-BR"
          ? `Calculadora de taxa freelancer em ${s.name} — Freelaz`
          : `Brazilian freelancer rates from ${s.name} — Freelaz`;
      const description =
        lang === "pt-BR"
          ? `Quanto cobrar como freelancer em ${s.name}. Calculadora considera custo de vida regional e clientes nacionais e internacionais.`
          : `How freelancers based in ${s.name}, Brazil should price for domestic and international clients. Free calculator.`;

      const related = [
        ...topCities.slice(0, 2).map((c) => ({
          href: cityUrl(c, lang),
          label:
            lang === "pt-BR"
              ? `Cliente em ${c.namePortuguese || c.city}`
              : `Clients in ${c.city}`,
        })),
        ...["fullstack", "frontend"].map((k) => ({
          href: professionUrl(k, lang),
          label:
            lang === "pt-BR"
              ? `Taxa de ${professionData[k].name.pt}`
              : `${professionData[k].name.en} rates`,
        })),
      ];

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        inLanguage: lang === "pt-BR" ? "pt-BR" : "en",
        mainEntityOfPage: canonical,
        publisher: { "@type": "Organization", name: "Freelaz" },
        about: { "@type": "Place", name: `${s.name}, Brasil` },
      };

      const body =
        statePageBody(key, lang) + relatedSection(related, lang);

      await writePage(
        path,
        pageShell({
          lang,
          title,
          description,
          canonical,
          alternateUrl: altUrl,
          jsonLd,
          body,
          cssHref: css,
          cta: { heading: cta.heading, body: cta.body, button: cta.button },
          footer: cta.footer,
        })
      );

      urls.push({ loc: canonical, priority: "0.7", changefreq: "monthly" });
    }
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
    `[seo] generated ${cities.length * 2} city + ${
      Object.keys(professionData).length * 2
    } profession + ${Object.keys(stateData).length * 2} state pages, sitemap with ${urls.length} URLs`
  );
}

generate().catch((err) => {
  console.error("[seo] failed:", err);
  process.exit(1);
});
