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
  voicePrivacy: string;
};

const en: UiStrings = {
  askTitle: "Ask Seva Saathi",
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
  voicePrivacy:
    "Voice audio is processed on our server only for transcription and is not stored by Seva Saathi. Sarvam’s retention applies when a key is configured.",
};

const hi: UiStrings = {
  askTitle: "Seva Saathi से पूछें",
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
  voicePrivacy:
    "आवाज़ केवल ट्रांसक्रिप्शन के लिए सर्वर पर भेजी जाती है; Seva Saathi इसे संग्रहीत नहीं करता। Sarvam की नीति लागू होती है जब API कुंजी सेट हो।",
};

const bn: UiStrings = {
  ...en,
  askTitle: "Seva Saathi-কে জিজ্ঞাসা করুন",
  askPlaceholder: "আপনার কথায় জিজ্ঞাসা করুন, যেমন: বিবাহের পর নাম কীভাবে বদলাব?",
  askButton: "জিজ্ঞাসা",
  navServices: "সেবা",
  navJourneys: "জীবনের ঘটনা",
  navAsk: "জিজ্ঞাসা",
  voicePrivacy: "কণ্ঠস্বর শুধু ট্রান্সক্রিপশনের জন্য সার্ভারে যায়; Seva Saathi সংরক্ষণ করে না।",
};

const ta: UiStrings = {
  ...en,
  askTitle: "Seva Saathi-யை கேளுங்கள்",
  askPlaceholder: "உங்கள் வார்த்தைகளில் கேளுங்கள், எ.கா. திருமணத்திற்குப் பிறகு பெயர் மாற்றம்?",
  askButton: "கேளுங்கள்",
  navServices: "சேவைகள்",
  navJourneys: "வாழ்க்கை நிகழ்வுகள்",
  navAsk: "கேளுங்கள்",
  voicePrivacy: "குரல் டிரான்ஸ்கிரிப்ஷனுக்காக மட்டுமே சேவையகத்திற்கு அனுப்பப்படும்; Seva Saathi சேமிக்காது.",
};

const te: UiStrings = {
  ...en,
  askTitle: "Seva Saathiని అడగండి",
  askPlaceholder: "మీ మాటల్లో అడగండి, ఉదా: పెళ్లి తర్వాత పేరు మార్చడం?",
  askButton: "అడగండి",
  navServices: "సేవలు",
  navJourneys: "జీవిత సంఘటనలు",
  navAsk: "అడగండి",
  voicePrivacy: "వాయిస్ ట్రాన్స్క్రిప్షన్ కోసం మాత్రమే సర్వర్‌కు పంపబడుతుంది; Seva Saathi నిల్వ చేయదు.",
};

const mr: UiStrings = {
  ...hi,
  askTitle: "Seva Saathi ला विचारा",
  navJourneys: "जीवनातील घटना",
};

const gu: UiStrings = {
  ...en,
  askTitle: "Seva Saathi ને પૂછો",
  askButton: "પૂછો",
  navServices: "સેવાઓ",
  navJourneys: "જીવનની ઘટનાઓ",
};

const dictionaries: Record<string, UiStrings> = {
  "en-IN": en,
  "hi-IN": hi,
  "bn-IN": bn,
  "ta-IN": ta,
  "te-IN": te,
  "mr-IN": mr,
  "gu-IN": gu,
};

export function uiStrings(lang: string): UiStrings {
  return dictionaries[lang] ?? en;
}
