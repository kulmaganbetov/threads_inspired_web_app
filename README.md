# SafeThreads — Content-Aware Social Feed

A full-stack social network web application inspired by **Threads / Instagram**, featuring a **mock ML system** for detecting destructive content in posts. Built with **Next.js (App Router)** and deployable to **Vercel** with zero configuration.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Mock ML Classifier](#mock-ml-classifier)
4. [Content Classification Categories](#content-classification-categories)
5. [API Reference](#api-reference)
6. [Project Structure](#project-structure)
7. [How to Run Locally](#how-to-run-locally)
8. [How to Deploy on Vercel](#how-to-deploy-on-vercel)
9. [Replacing Mock ML with a Real Model](#replacing-mock-ml-with-a-real-model)
10. [Tech Stack](#tech-stack)

---

## Project Overview

SafeThreads demonstrates how a social media platform can integrate content moderation into its posting pipeline. Every post submitted by a user is automatically analyzed by a classification system that assigns a category label and confidence score.

**Key features:**
- Create short text posts (up to 500 characters)
- Real-time social feed with newest posts first
- Automatic content moderation labels on every post
- Color-coded severity badges (Red / Yellow / Green)
- Fully responsive, minimalist Threads-inspired UI
- No authentication, no database, no external services

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                   │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ PostComposer │───>│   Feed List  │                   │
│  │  (textarea)  │    │  (PostCards) │                   │
│  └──────┬───────┘    └──────▲───────┘                   │
│         │ POST /api/posts   │ GET /api/posts            │
└─────────┼───────────────────┼───────────────────────────┘
          │                   │
          ▼                   │
┌─────────────────────────────────────────────────────────┐
│                 SERVER (Next.js API Routes)              │
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │           /app/api/posts/route.js            │        │
│  │                                              │        │
│  │  POST handler:                               │        │
│  │    1. Validate input                         │        │
│  │    2. Run classifier(text)  ──────────┐      │        │
│  │    3. Store post + label              │      │        │
│  │    4. Return response                 │      │        │
│  │                                       │      │        │
│  │  GET handler:                         │      │        │
│  │    1. Fetch all posts                 │      │        │
│  │    2. Return with labels              │      │        │
│  └───────────────┬───────────────────────┼──────┘        │
│                  │                       │               │
│         ┌────────▼────────┐   ┌──────────▼──────────┐    │
│         │  /lib/store.js  │   │ /lib/classifier.js  │    │
│         │  (in-memory     │   │ (keyword-based       │    │
│         │   post array)   │   │  mock ML scoring)   │    │
│         └─────────────────┘   └─────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Mock ML Classifier

The classifier in `lib/classifier.js` simulates a machine-learning content moderation pipeline using **deterministic keyword-based scoring**.

### How It Works

1. **Tokenization** — Input text is lowercased and non-alphanumeric characters are replaced with spaces.
2. **Keyword Matching** — The normalized text is scored against five keyword dictionaries (one per harmful category). Each keyword has a pre-assigned weight between 0 and 1.
3. **Score Accumulation** — For each keyword found, its weight is added to the category's score. Multi-word phrases use substring matching; single words use word-boundary regex. Repeated keywords yield diminishing returns via logarithmic scaling.
4. **Confidence Normalization** — Raw scores are mapped to a 0-1 confidence value using a sigmoid-like function: `2 / (1 + e^(-k * score)) - 1`, clamped to [0.1, 0.99].
5. **Classification** — The category with the highest score wins. If no category scores above 0.1, the post is classified as **Neutral** with 1.0 confidence.

### Output Format

```json
{
  "label": "Fraud / Scam",
  "confidence": 0.83
}
```

### Why This Approach?

- **Deterministic** — Same input always produces the same output
- **Zero dependencies** — No ML libraries required
- **Explainable** — Every classification can be traced back to specific keywords
- **Fast** — Sub-millisecond classification time

---

## Content Classification Categories

| Category | Badge Color | Description |
|---|---|---|
| Hate speech | Red | Discriminatory language targeting identity groups |
| Extremism | Red | Violent ideology, radicalization, terrorism |
| Cyberbullying | Yellow | Personal attacks, harassment, threats |
| Fraud / Scam | Yellow | Financial scams, phishing, deceptive offers |
| Toxic language | Yellow | General insults, profanity, hostile tone |
| Neutral | Green | No harmful content detected |

---

## API Reference

### `GET /api/posts`

Returns all posts with moderation labels, newest first.

**Response:**
```json
{
  "posts": [
    {
      "id": "post-1707000000000-abc123",
      "text": "Hello world!",
      "author": "User",
      "createdAt": "2025-02-04T00:00:00.000Z",
      "moderation": {
        "label": "Neutral",
        "confidence": 1.0
      }
    }
  ]
}
```

### `POST /api/posts`

Creates a new post. Content is classified automatically.

**Request body:**
```json
{
  "text": "Post content here",
  "author": "Optional Name"
}
```

**Response (201):**
```json
{
  "post": {
    "id": "post-1707000000000-abc123",
    "text": "Post content here",
    "author": "Optional Name",
    "createdAt": "2025-02-04T00:00:00.000Z",
    "moderation": {
      "label": "Neutral",
      "confidence": 1.0
    }
  }
}
```

**Validation:**
- `text` is required, non-empty string
- Maximum 500 characters

---

## Project Structure

```
/
├── app/
│   ├── api/
│   │   └── posts/
│   │       └── route.js          # GET + POST API handlers
│   ├── components/
│   │   ├── Feed.js               # Main feed (fetches + renders posts)
│   │   ├── ModerationBadge.js    # Color-coded classification badge
│   │   ├── PostCard.js           # Individual post display
│   │   └── PostComposer.js       # New post form (textarea + submit)
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout with metadata
│   └── page.js                   # Home page (header + feed + footer)
├── lib/
│   ├── classifier.js             # Mock ML keyword-based classifier
│   └── store.js                  # In-memory post storage (demo)
├── public/                       # Static assets
├── next.config.mjs               # Next.js configuration
├── package.json
└── README.md
```

---

## How to Run Locally

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Clone the repository
git clone <repository-url>
cd <repository-name>

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

The app runs entirely locally with no external services or environment variables.

---

## How to Deploy on Vercel

### One-Click Deploy

1. Push this repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the GitHub repository
4. Click **Deploy** — no configuration needed

### Why It Works with Zero Config

- Uses Next.js **App Router** (Vercel's native framework)
- No custom server — all logic runs in API routes / serverless functions
- No environment variables required
- No external database or services
- In-memory storage works within serverless function instances
- Compatible with Vercel Edge and Serverless runtimes

### Important Note on Data Persistence

The in-memory store resets on every cold start. On Vercel's serverless platform, this means data may be lost when instances scale down. This is intentional for this demo. For production, replace `lib/store.js` with a real database (see next section).

---

## Replacing Mock ML with a Real Model

The classifier is isolated in `lib/classifier.js` and exposes a single function:

```js
export function classify(text) → { label: string, confidence: number }
```

### To integrate a real ML model:

1. **Option A: External API (recommended for Vercel)**
   ```js
   // lib/classifier.js
   export async function classify(text) {
     const response = await fetch("https://your-ml-api.com/classify", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ text }),
     });
     const { label, confidence } = await response.json();
     return { label, confidence };
   }
   ```
   Update the API route to `await classify(text)`.

2. **Option B: On-device model (e.g., TensorFlow.js)**
   ```js
   // lib/classifier.js
   import * as tf from "@tensorflow/tfjs";

   let model;
   async function loadModel() {
     if (!model) model = await tf.loadLayersModel("/model/model.json");
     return model;
   }

   export async function classify(text) {
     const model = await loadModel();
     const tensor = preprocess(text); // your tokenizer
     const prediction = model.predict(tensor);
     // Map prediction to { label, confidence }
   }
   ```

3. **Option C: Python microservice**
   - Deploy a Flask/FastAPI service with your trained model
   - Call it from `classify()` via `fetch()`
   - Host on a GPU provider for heavy models

### Steps to migrate:
1. Replace the body of `classify()` in `lib/classifier.js`
2. If the new function is async, update the API route to use `await`
3. Add any necessary environment variables in Vercel dashboard
4. Deploy

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | Node.js |
| Styling | Inline styles (zero-dependency) |
| Font | Geist (via next/font) |
| Storage | In-memory array (demo) |
| Classifier | Keyword-based scoring (mock ML) |
| Deployment | Vercel (serverless) |
