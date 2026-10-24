export type UiStrings = {
  askTitle: string;
  askPlaceholder: string;
  askButton: string;
  searchPlaceholder: string;
  navServices: string;
  navTopics: string;
  navJourneys: string;
  navUpdates: string;
  navAsk: string;
  listening: string;
  tapToSpeak: string;
  readAloud: string;
  language: string;
};

const en: UiStrings = {
  askTitle: "Ask India.Gov",
  askPlaceholder: "Ask in your own words, e.g. I just got married, how do I change my name?",
  askButton: "Ask",
  searchPlaceholder: "Search services, schemes and departments",
  navServices: "Services",
  navTopics: "Topics",
  navJourneys: "Life events",
  navUpdates: "Updates",
  navAsk: "Ask",
  listening: "Listening…",
  tapToSpeak: "Speak your question",
  readAloud: "Read aloud",
  language: "Language",
};

const hi: UiStrings = {
  askTitle: "India.Gov से पूछें",
  askPlaceholder: "अपने शब्दों में पूछें, जैसे: मेरी अभी शादी हुई है, नाम कैसे बदलूँ?",
  askButton: "पूछें",
  searchPlaceholder: "सेवाएँ, योजनाएँ और विभाग खोजें",
  navServices: "सेवाएँ",
  navTopics: "विषय",
  navJourneys: "जीवन की घटनाएँ",
  navUpdates: "अपडेट",
  navAsk: "पूछें",
  listening: "सुन रहे हैं…",
  tapToSpeak: "अपना प्रश्न बोलें",
  readAloud: "सुनें",
  language: "भाषा",
};

const dictionaries: Record<string, UiStrings> = { "en-IN": en, "hi-IN": hi };

export function uiStrings(lang: string): UiStrings {
  return dictionaries[lang] ?? en;
}
