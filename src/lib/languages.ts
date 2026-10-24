export type Language = {
  /** BCP-47 code as used by Sarvam APIs. */
  code: string;
  name: string;
  native: string;
  /** Sarvam Bulbul text-to-speech supports this language. */
  tts: boolean;
};

export const LANGUAGES: Language[] = [
  { code: "en-IN", name: "English", native: "English", tts: true },
  { code: "hi-IN", name: "Hindi", native: "हिन्दी", tts: true },
  { code: "bn-IN", name: "Bengali", native: "বাংলা", tts: true },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்", tts: true },
  { code: "te-IN", name: "Telugu", native: "తెలుగు", tts: true },
  { code: "mr-IN", name: "Marathi", native: "मराठी", tts: true },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી", tts: true },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", tts: true },
  { code: "ml-IN", name: "Malayalam", native: "മലയാളം", tts: true },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", tts: true },
  { code: "od-IN", name: "Odia", native: "ଓଡ଼ିଆ", tts: true },
  { code: "as-IN", name: "Assamese", native: "অসমীয়া", tts: false },
  { code: "ur-IN", name: "Urdu", native: "اردو", tts: false },
  { code: "ne-IN", name: "Nepali", native: "नेपाली", tts: false },
  { code: "kok-IN", name: "Konkani", native: "कोंकणी", tts: false },
  { code: "mai-IN", name: "Maithili", native: "मैथिली", tts: false },
  { code: "sd-IN", name: "Sindhi", native: "سنڌي", tts: false },
  { code: "sa-IN", name: "Sanskrit", native: "संस्कृतम्", tts: false },
  { code: "doi-IN", name: "Dogri", native: "डोगरी", tts: false },
  { code: "brx-IN", name: "Bodo", native: "बर'", tts: false },
  { code: "mni-IN", name: "Manipuri (Meiteilon)", native: "মৈতৈলোন্", tts: false },
  { code: "ks-IN", name: "Kashmiri", native: "کٲشُر", tts: false },
  { code: "sat-IN", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", tts: false },
];

export const DEFAULT_LANGUAGE = "en-IN";

export const languageByCode = Object.fromEntries(LANGUAGES.map((l) => [l.code, l])) as Record<
  string,
  Language
>;

export const isSupportedLanguage = (code: string) => code in languageByCode;
