import "./globals.css";

export const metadata = {
  title: "SafeThreads — Content-Aware Social Feed",
  description:
    "A Threads-inspired social network with mock ML content moderation. Built with Next.js for Vercel deployment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
