/**
 * In-Memory Post Store
 *
 * ⚠️  DEMO STORAGE — data lives only in server memory and is lost
 *     on every deployment / serverless cold start. Replace with a
 *     real database (e.g. PostgreSQL, MongoDB, Planetscale) for
 *     production use.
 *
 * The store is a simple array held in module scope. Because Next.js
 * API routes on Vercel run as serverless functions, data may be
 * shared within a single instance but will NOT persist across
 * cold starts or different instances.
 */

let posts = [
  // Seed data so the feed isn't empty on first load
  {
    id: "seed-1",
    text: "Just joined this platform! Excited to connect with everyone here. What are you all working on today?",
    author: "Sarah K.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    moderation: { label: "Neutral", confidence: 1.0 },
  },
  {
    id: "seed-2",
    text: "Beautiful morning for a walk in the park. Nature is the best therapy.",
    author: "Alex M.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    moderation: { label: "Neutral", confidence: 1.0 },
  },
  {
    id: "seed-3",
    text: "Working on a new open-source project this weekend. Who wants to collaborate?",
    author: "Jordan P.",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    moderation: { label: "Neutral", confidence: 1.0 },
  },
];

/**
 * Return all posts, newest first.
 * @returns {Array} copy of the posts array
 */
export function getAllPosts() {
  return [...posts].reverse();
}

/**
 * Add a new post to the store.
 * @param {{ text: string, author: string, moderation: { label: string, confidence: number } }} post
 * @returns {Object} the created post (with generated id + timestamp)
 */
export function addPost({ text, author, moderation }) {
  const post = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    author,
    createdAt: new Date().toISOString(),
    moderation,
  };
  posts.push(post);
  return post;
}
