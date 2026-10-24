const SCRIPTS: { re: RegExp; langs: string[] }[] = [
  { re: /[\u0900-\u097f]/, langs: ["hi-IN", "mr-IN", "ne-IN", "kok-IN", "mai-IN", "sa-IN", "doi-IN", "brx-IN"] },
  { re: /[\u0980-\u09ff]/, langs: ["bn-IN", "as-IN", "mni-IN"] },
  { re: /[\u0b80-\u0bff]/, langs: ["ta-IN"] },
  { re: /[\u0c00-\u0c7f]/, langs: ["te-IN"] },
  { re: /[\u0c80-\u0cff]/, langs: ["kn-IN"] },
  { re: /[\u0d00-\u0d7f]/, langs: ["ml-IN"] },
  { re: /[\u0a80-\u0aff]/, langs: ["gu-IN"] },
  { re: /[\u0a00-\u0a7f]/, langs: ["pa-IN"] },
  { re: /[\u0b00-\u0b7f]/, langs: ["od-IN"] },
  { re: /[\u0600-\u06ff]/, langs: ["ur-IN", "sd-IN", "ks-IN"] },
  { re: /[\u1c50-\u1c7f]/, langs: ["sat-IN"] },
  { re: /[\uabc0-\uabff]/, langs: ["mni-IN"] },
];

/** Returns a language code if the text is written in an Indic script, preferring the UI language. */
export function detectIndicLanguage(text: string, preferred: string): string | null {
  for (const s of SCRIPTS) {
    if (s.re.test(text)) return s.langs.includes(preferred) ? preferred : s.langs[0];
  }
  return null;
}
