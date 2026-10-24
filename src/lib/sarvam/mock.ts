import { LANGUAGES } from "@/lib/languages";

const DEMO_QUESTIONS: Record<string, { text: string; english: string }> = {
  "en-IN": {
    text: "I just got married, how do I change my name?",
    english: "I just got married, how do I change my name?",
  },
  "hi-IN": {
    text: "मेरी अभी शादी हुई है, मैं अपना नाम कैसे बदलूँ?",
    english: "I just got married, how do I change my name?",
  },
  "ta-IN": {
    text: "எனக்கு இப்போது தான் திருமணம் ஆனது, என் பெயரை எப்படி மாற்றுவது?",
    english: "I just got married, how do I change my name?",
  },
  "te-IN": {
    text: "నాకు ఇప్పుడే పెళ్లి అయింది, నా పేరు ఎలా మార్చుకోవాలి?",
    english: "I just got married, how do I change my name?",
  },
  "bn-IN": {
    text: "আমার সবে বিয়ে হয়েছে, আমি কীভাবে আমার নাম পরিবর্তন করব?",
    english: "I just got married, how do I change my name?",
  },
  "mr-IN": {
    text: "माझं नुकतंच लग्न झालं आहे, मी माझं नाव कसं बदलू?",
    english: "I just got married, how do I change my name?",
  },
};

export function mockTranscribe(lang: string): { transcript: string; languageCode: string; note?: string } {
  const demo = DEMO_QUESTIONS[lang];
  if (demo) return { transcript: demo.text, languageCode: lang };
  return {
    transcript: DEMO_QUESTIONS["en-IN"].text,
    languageCode: "en-IN",
    note: `Demo mode has no sample phrase in ${LANGUAGES.find((l) => l.code === lang)?.name ?? lang}; used English.`,
  };
}

/** Keyword glossary so demo mode can route a few Hindi phrases without a translation service. */
const HI_GLOSSARY: [RegExp, string][] = [
  [/शादी|विवाह/, "marriage"],
  [/नाम/, "name"],
  [/बदल/, "change"],
  [/आधार/, "aadhaar"],
  [/पैन/, "pan"],
  [/खो/, "lost"],
  [/पासपोर्ट/, "passport"],
  [/राज्य|शहर/, "moving another state"],
  [/राशन/, "ration card"],
  [/छात्रवृत्ति/, "scholarship"],
  [/किसान/, "farmer"],
];

const DEMO_REVERSE = new Map(
  Object.values(DEMO_QUESTIONS).map((d) => [d.text, d.english] as const),
);

export function mockToEnglish(text: string): { text: string; ok: boolean } {
  const exact = DEMO_REVERSE.get(text.trim());
  if (exact) return { text: exact, ok: true };
  if (/[\u0900-\u097f]/.test(text)) {
    const words = HI_GLOSSARY.filter(([re]) => re.test(text)).map(([, w]) => w);
    if (words.length) return { text: words.join(" "), ok: true };
  }
  return { text, ok: !/[^\u0000-\u024f\s\p{P}]/u.test(text) };
}

const HI_FIXED: [string, string][] = [
  [
    "Here is the usual order for “Change your name after marriage”.",
    "“शादी के बाद नाम बदलें” के लिए आमतौर पर यही क्रम अपनाया जाता है।",
  ],
  [
    "It involves several different offices, so I have put the steps in the order that avoids rework.",
    "इसमें कई अलग-अलग कार्यालय शामिल हैं, इसलिए मैंने चरणों को ऐसे क्रम में रखा है जिससे दोबारा काम न करना पड़े।",
  ],
  [
    "Tick steps off in the checklist below as you go.",
    "आगे बढ़ते हुए नीचे दी गई चेकलिस्ट में चरणों पर निशान लगाते जाएँ।",
  ],
  [
    "I have not confirmed fees or timings from official pages, so check each official site before you pay anything.",
    "मैंने शुल्क और समय आधिकारिक पेजों से पुष्ट नहीं किए हैं, इसलिए कुछ भी भुगतान करने से पहले हर आधिकारिक साइट देख लें।",
  ],
  [
    "I do not have a reliable official source for that in my directory, so I will not guess.",
    "मेरी निर्देशिका में इसके लिए कोई भरोसेमंद आधिकारिक स्रोत नहीं है, इसलिए मैं अंदाज़ा नहीं लगाऊँगा।",
  ],
  [
    "Use the official link below to do the actual application. Seva Saathi cannot submit anything for you.",
    "वास्तविक आवेदन के लिए नीचे दिया गया आधिकारिक लिंक इस्तेमाल करें। Seva Saathi आपकी ओर से कुछ भी जमा नहीं कर सकता।",
  ],
];

export function mockFromEnglish(text: string, target: string): { text: string; translated: boolean } {
  if (target === "hi-IN") {
    let out = text;
    let hit = false;
    for (const [en, hi] of HI_FIXED) {
      if (out.includes(en)) {
        out = out.replace(en, hi);
        hit = true;
      }
    }
    return { text: out, translated: hit };
  }
  return { text, translated: false };
}
