const STOPWORDS = new Set([
  "a", "an", "the", "i", "me", "my", "we", "our", "you", "your", "to", "of", "for", "in", "on", "at", "and", "or",
  "is", "are", "am", "do", "does", "how", "what", "where", "when", "can", "should", "will", "would", "get", "got",
  "need", "want", "with", "from", "it", "this", "that", "be", "have", "has", "just", "please", "help", "about",
  "now", "as", "by", "if", "so", "there",
]);

const SYNONYMS: Record<string, string[]> = {
  married: ["marriage"],
  marry: ["marriage"],
  wedding: ["marriage"],
  wed: ["marriage"],
  shaadi: ["marriage"],
  vivah: ["marriage"],
  surname: ["name"],
  lastname: ["name"],
  rename: ["name"],
  renew: ["renewal"],
  licence: ["license", "driving"],
  dl: ["driving", "license"],
  vote: ["voter"],
  voting: ["voter"],
  epic: ["voter"],
  epf: ["epfo"],
  pf: ["epfo", "provident"],
  uan: ["epfo"],
  itr: ["income", "tax", "return"],
  efile: ["income", "tax"],
  efiling: ["income", "tax"],
  "e-filing": ["income", "tax"],
  moved: ["moving", "shift"],
  move: ["moving", "shift"],
  relocate: ["moving", "shift"],
  relocating: ["moving", "shift"],
  shifting: ["shift", "moving"],
  migrate: ["moving"],
  lost: ["lost", "duplicate", "retrieve"],
  misplaced: ["lost"],
  stolen: ["lost"],
  missing: ["lost"],
  forgot: ["lost", "retrieve"],
  forgotten: ["lost", "retrieve"],
  duplicate: ["lost", "reprint"],
  reprint: ["lost", "duplicate"],
  card: ["card"],
  adhar: ["aadhaar"],
  aadhar: ["aadhaar"],
  aadhaar: ["aadhaar"],
  pancard: ["pan"],
  rashan: ["ration"],
  ration: ["ration"],
  kisan: ["farmer"],
  farmers: ["farmer"],
  crop: ["agriculture"],
  jobs: ["job", "employment"],
  scholarships: ["scholarship"],
  hospital: ["health"],
  doctor: ["health"],
  complaint: ["grievance"],
  complain: ["grievance"],
  rti: ["information", "right"],
  gstin: ["gst"],
  fine: ["challan"],
  loan: ["credit"],
  tax: ["tax"],
};

const stem = (w: string) =>
  w.length > 4 && w.endsWith("ies")
    ? w.slice(0, -3) + "y"
    : w.length > 4 && w.endsWith("ing")
      ? w.slice(0, -3)
      : w.length > 3 && w.endsWith("es") && !w.endsWith("ses")
        ? w.slice(0, -2)
        : w.length > 3 && w.endsWith("s") && !w.endsWith("ss")
          ? w.slice(0, -1)
          : w;

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0900-\u0dff\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string, expand = true): string[] {
  const out: string[] = [];
  for (const raw of normalize(text).split(" ")) {
    if (!raw || STOPWORDS.has(raw)) continue;
    const w = stem(raw);
    out.push(w);
    if (expand) {
      for (const s of SYNONYMS[raw] ?? SYNONYMS[w] ?? []) out.push(stem(s));
    }
  }
  return out;
}

/** One group per meaningful word. Synonyms are alternatives inside the group, not extra required words. */
export function queryConcepts(text: string): string[][] {
  const groups: string[][] = [];
  for (const raw of normalize(text).split(" ")) {
    if (!raw || STOPWORDS.has(raw)) continue;
    const w = stem(raw);
    const syns = (SYNONYMS[raw] ?? SYNONYMS[w] ?? []).map(stem);
    groups.push([...new Set([w, ...syns])]);
  }
  return groups;
}
