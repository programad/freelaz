export const COUNTRY_NAMES_PT: Record<string, string> = {
  "United States": "Estados Unidos",
  "United Kingdom": "Reino Unido",
  Germany: "Alemanha",
  France: "França",
  Spain: "Espanha",
  Netherlands: "Holanda",
  Switzerland: "Suíça",
  Sweden: "Suécia",
  Finland: "Finlândia",
  Poland: "Polônia",
  "Czech Republic": "República Tcheca",
  Hungary: "Hungria",
  Bulgaria: "Bulgária",
  Romania: "Romênia",
  Canada: "Canadá",
  Australia: "Austrália",
  Singapore: "Singapura",
  Japan: "Japão",
  Brazil: "Brasil",
  Portugal: "Portugal",
  Ireland: "Irlanda",
};

export const CATEGORY_NAMES_PT: Record<string, string> = {
  tech_hub: "hub tecnológico",
  business_center: "centro empresarial",
  capital: "capital",
  major_city: "cidade importante",
};

export const countryNamePt = (country: string): string =>
  COUNTRY_NAMES_PT[country] ?? country;

export const categoryNamePt = (category: string): string =>
  CATEGORY_NAMES_PT[category] ?? category;
