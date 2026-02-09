/**
 * In-Memory Post Store
 *
 * ⚠️  DEMO STORAGE — data lives only in server memory and is lost
 *     on every deployment / serverless cold start.
 */

const BLOCKED_LABELS = ["Hate speech", "Extremism", "Cyberbullying", "Fraud / Scam"];

// ---------------------------------------------------------------------------
// Users (demo accounts)
// ---------------------------------------------------------------------------

const users = [
  {
    id: "user-1",
    username: "demo",
    password: "password",
    displayName: "Demo User",
    bio: "Just a demo account exploring SafeThreads!",
    joinedAt: "2025-01-15T10:00:00.000Z",
  },
  {
    id: "user-2",
    username: "alice",
    password: "alice123",
    displayName: "Alice Johnson",
    bio: "Tech enthusiast & coffee lover.",
    joinedAt: "2025-01-20T08:30:00.000Z",
  },
  {
    id: "user-3",
    username: "bob",
    password: "bob123",
    displayName: "Bob Smith",
    bio: "Designer by day, gamer by night.",
    joinedAt: "2025-02-01T14:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

let posts = [
  {
    id: "seed-1",
    text: "Just joined this platform! Excited to connect with everyone here. What are you all working on today?",
    authorId: "user-2",
    author: "Alice Johnson",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    moderation: { label: "Neutral", confidence: 1.0 },
    likes: ["user-3"],
    reactions: { "user-3": "heart" },
    comments: [
      {
        id: "comment-seed-1",
        postId: "seed-1",
        authorId: "user-3",
        author: "Bob Smith",
        text: "Welcome! Working on a new design project.",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    media: null,
  },
  {
    id: "seed-2",
    text: "Beautiful morning for a walk in the park. Nature is the best therapy.",
    authorId: "user-3",
    author: "Bob Smith",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    moderation: { label: "Neutral", confidence: 1.0 },
    likes: ["user-1", "user-2"],
    reactions: { "user-1": "fire", "user-2": "heart" },
    comments: [],
    media: null,
  },
  {
    id: "seed-3",
    text: "Working on a new open-source project this weekend. Who wants to collaborate?",
    authorId: "user-1",
    author: "Demo User",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    moderation: { label: "Neutral", confidence: 1.0 },
    likes: ["user-2"],
    reactions: { "user-2": "rocket" },
    comments: [
      {
        id: "comment-seed-2",
        postId: "seed-3",
        authorId: "user-2",
        author: "Alice Johnson",
        text: "Count me in! What tech stack?",
        createdAt: new Date(Date.now() - 9000000).toISOString(),
      },
    ],
    media: null,
  },
];

// ---------------------------------------------------------------------------
// Sessions (token -> userId)
// ---------------------------------------------------------------------------

const sessions = new Map();

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export function authenticateUser(username, password) {
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;

  const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  sessions.set(token, user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      joinedAt: user.joinedAt,
    },
  };
}

export function getUserByToken(token) {
  if (!token) return null;
  const userId = sessions.get(token);
  if (!userId) return null;
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    joinedAt: user.joinedAt,
  };
}

export function getUserById(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    joinedAt: user.joinedAt,
  };
}

export function logoutUser(token) {
  sessions.delete(token);
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export function getAllPosts() {
  return [...posts].reverse();
}

export function getPostsByUser(userId) {
  return posts.filter((p) => p.authorId === userId).reverse();
}

export function isBlocked(label) {
  return BLOCKED_LABELS.includes(label);
}

export function addPost({ text, authorId, author, moderation, media }) {
  const post = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    authorId,
    author,
    createdAt: new Date().toISOString(),
    moderation,
    likes: [],
    reactions: {},
    comments: [],
    media: media || null,
  };
  posts.push(post);
  return post;
}

// ---------------------------------------------------------------------------
// Likes
// ---------------------------------------------------------------------------

export function toggleLike(postId, userId) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  const idx = post.likes.indexOf(userId);
  if (idx === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(idx, 1);
    // Also remove reaction when unliking
    delete post.reactions[userId];
  }
  return post;
}

// ---------------------------------------------------------------------------
// Reactions
// ---------------------------------------------------------------------------

const VALID_REACTIONS = ["heart", "fire", "laugh", "sad", "rocket", "clap"];

export function setReaction(postId, userId, emoji) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  if (!VALID_REACTIONS.includes(emoji)) return null;

  // Setting a reaction also adds a like
  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
  }
  post.reactions[userId] = emoji;
  return post;
}

export function removeReaction(postId, userId) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  delete post.reactions[userId];
  // Also remove like
  const idx = post.likes.indexOf(userId);
  if (idx !== -1) post.likes.splice(idx, 1);
  return post;
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export function addComment({ postId, authorId, author, text }) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  const comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    postId,
    authorId,
    author,
    text,
    createdAt: new Date().toISOString(),
  };
  post.comments.push(comment);
  return comment;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export function getUserStats(userId) {
  const userPosts = posts.filter((p) => p.authorId === userId);
  const totalLikes = userPosts.reduce((sum, p) => sum + p.likes.length, 0);
  const totalComments = userPosts.reduce((sum, p) => sum + p.comments.length, 0);
  return {
    postsCount: userPosts.length,
    likesReceived: totalLikes,
    commentsReceived: totalComments,
  };
}
