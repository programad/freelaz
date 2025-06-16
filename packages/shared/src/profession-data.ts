export const professionData = {
  frontend: {
    name: { pt: "Desenvolvedor Frontend", en: "Frontend Developer" },
    salaryRange: {
      junior: [3500, 6000],
      pleno: [4500, 8000],
      senior: [6000, 12000],
      specialist: [8000, 15000],
    },
  },
  backend: {
    name: { pt: "Desenvolvedor Backend", en: "Backend Developer" },
    salaryRange: {
      junior: [4000, 6500],
      pleno: [5000, 9000],
      senior: [7000, 13000],
      specialist: [9000, 16000],
    },
  },
  fullstack: {
    name: { pt: "Desenvolvedor Full Stack", en: "Full Stack Developer" },
    salaryRange: {
      junior: [4500, 7000],
      pleno: [5500, 10000],
      senior: [7500, 14000],
      specialist: [10000, 18000],
    },
  },
  mobile: {
    name: { pt: "Desenvolvedor Mobile", en: "Mobile Developer" },
    salaryRange: {
      junior: [4000, 6500],
      pleno: [5000, 9500],
      senior: [7000, 13500],
      specialist: [9000, 16500],
    },
  },
  "ux-ui": {
    name: { pt: "Designer UX/UI", en: "UX/UI Designer" },
    salaryRange: {
      junior: [3000, 5500],
      pleno: [4000, 7500],
      senior: [5500, 11000],
      specialist: [7000, 13000],
    },
  },
  copywriter: {
    name: { pt: "Copywriter", en: "Copywriter" },
    salaryRange: {
      junior: [2500, 4500],
      pleno: [3000, 6500],
      senior: [4500, 9000],
      specialist: [6000, 12000],
    },
  },
};

export type ProfessionKey = keyof typeof professionData;
export type ExperienceLevel = "junior" | "pleno" | "senior" | "specialist";
