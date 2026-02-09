/**
 * Mock ML Content Classifier
 *
 * Simulates a machine-learning content moderation system using
 * deterministic keyword-based scoring. Each category has a weighted
 * keyword dictionary. The text is scored against every category,
 * scores are normalized to a 0-1 confidence range, and the highest
 * scoring category is returned. Falls back to "Neutral" when no
 * keywords match.
 *
 * This module is designed to be swappable with a real ML model —
 * see README.md for integration instructions.
 */

// ---------------------------------------------------------------------------
// Keyword dictionaries — each word carries a base weight (0-1).
// Higher weight = stronger signal for that category.
// ---------------------------------------------------------------------------

const KEYWORD_DICTIONARIES = {
  "Hate speech": {
    hate: 0.9,
    racist: 0.95,
    racism: 0.95,
    bigot: 0.85,
    bigotry: 0.85,
    slur: 0.8,
    nazi: 0.95,
    supremacist: 0.9,
    supremacy: 0.9,
    discriminate: 0.7,
    discrimination: 0.7,
    inferior: 0.6,
    dehumanize: 0.85,
    xenophobia: 0.8,
    xenophobic: 0.8,
    antisemitic: 0.9,
    antisemitism: 0.9,
    homophobic: 0.85,
    homophobia: 0.85,
    transphobic: 0.85,
    transphobia: 0.85,
    ethnic: 0.3,
    "go back": 0.5,
  },

  Extremism: {
    terrorism: 0.95,
    terrorist: 0.95,
    radicalize: 0.9,
    radicalization: 0.9,
    jihad: 0.85,
    extremist: 0.9,
    extremism: 0.9,
    propaganda: 0.6,
    recruit: 0.4,
    martyr: 0.7,
    caliphate: 0.85,
    insurgent: 0.7,
    militia: 0.6,
    overthrow: 0.7,
    revolt: 0.5,
    uprising: 0.5,
    bomb: 0.6,
    detonate: 0.8,
    weapon: 0.4,
    attack: 0.35,
    destroy: 0.35,
  },

  Cyberbullying: {
    bully: 0.85,
    bullying: 0.85,
    loser: 0.6,
    ugly: 0.5,
    worthless: 0.75,
    pathetic: 0.65,
    nobody: 0.4,
    "kill yourself": 0.95,
    kys: 0.95,
    harass: 0.8,
    harassment: 0.8,
    stalk: 0.7,
    stalking: 0.7,
    humiliate: 0.7,
    shame: 0.5,
    embarrass: 0.4,
    threaten: 0.7,
    intimidate: 0.7,
    "die alone": 0.8,
    crybaby: 0.5,
  },

  "Fraud / Scam": {
    scam: 0.9,
    fraud: 0.9,
    phishing: 0.85,
    "free money": 0.85,
    "send money": 0.8,
    "wire transfer": 0.75,
    "bank account": 0.5,
    "credit card": 0.45,
    "social security": 0.7,
    lottery: 0.65,
    winner: 0.4,
    prince: 0.6,
    inheritance: 0.55,
    "act now": 0.6,
    "limited time": 0.5,
    guarantee: 0.35,
    "risk free": 0.7,
    "double your": 0.75,
    crypto: 0.35,
    investment: 0.3,
    "click here": 0.6,
    urgent: 0.4,
    password: 0.45,
    verify: 0.35,
  },

  "Toxic language": {
    stupid: 0.5,
    idiot: 0.65,
    moron: 0.7,
    dumb: 0.5,
    shut: 0.3,
    trash: 0.5,
    garbage: 0.45,
    terrible: 0.3,
    awful: 0.3,
    disgusting: 0.5,
    toxic: 0.6,
    poison: 0.35,
    horrible: 0.35,
    worst: 0.3,
    suck: 0.4,
    jerk: 0.5,
    creep: 0.45,
    freak: 0.4,
    annoying: 0.3,
    obnoxious: 0.4,
  },
};

// ---------------------------------------------------------------------------
// Classification logic
// ---------------------------------------------------------------------------

/**
 * Tokenize and normalize input text for comparison.
 * Converts to lowercase and keeps only word characters + spaces.
 */
function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ");
}

/**
 * Score a piece of text against a single keyword dictionary.
 *
 * For each keyword found in the text the keyword's weight is added
 * to the running total. Multi-word keywords (phrases) are matched
 * using `includes`. Single words use a word-boundary aware check.
 *
 * @param {string} normalizedText  — pre-processed lowercase text
 * @param {Object}  dictionary     — { keyword: weight } map
 * @returns {number} raw cumulative score
 */
function scoreCategory(normalizedText, dictionary) {
  let score = 0;

  for (const [keyword, weight] of Object.entries(dictionary)) {
    // Phrase matching (multi-word keywords)
    if (keyword.includes(" ")) {
      if (normalizedText.includes(keyword)) {
        score += weight;
      }
      continue;
    }

    // Single-word matching with word-boundary awareness
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const matches = normalizedText.match(regex);
    if (matches) {
      // Diminishing returns for repeated keywords
      score += weight * (1 + Math.log(matches.length));
    }
  }

  return score;
}

/**
 * Convert a raw score to a 0-1 confidence value using a sigmoid-like
 * curve. This keeps confidence realistic — a single keyword match
 * yields moderate confidence; multiple matches push it higher.
 *
 * @param {number} raw — raw cumulative score
 * @returns {number} confidence between 0 and 1
 */
function toConfidence(raw) {
  // Sigmoid: 2/(1+e^(-k*x)) - 1, clamped to [0.1, 0.99]
  const k = 1.2;
  const sigmoid = 2 / (1 + Math.exp(-k * raw)) - 1;
  return Math.min(0.99, Math.max(0.1, sigmoid));
}

/**
 * Classify a text string into one of the moderation categories.
 *
 * @param {string} text — the raw post text
 * @returns {{ label: string, confidence: number }}
 */
export function classify(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return { label: "Neutral", confidence: 1.0 };
  }

  const normalizedText = normalize(text);
  let bestLabel = "Neutral";
  let bestScore = 0;

  // Score text against every category
  for (const [category, dictionary] of Object.entries(KEYWORD_DICTIONARIES)) {
    const score = scoreCategory(normalizedText, dictionary);
    if (score > bestScore) {
      bestScore = score;
      bestLabel = category;
    }
  }

  // If no meaningful signal, return Neutral with full confidence
  if (bestScore < 0.1) {
    return { label: "Neutral", confidence: 1.0 };
  }

  return {
    label: bestLabel,
    confidence: parseFloat(toConfidence(bestScore).toFixed(2)),
  };
}
