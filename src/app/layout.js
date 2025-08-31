import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QuizProvider } from "@/hooks/useSocket";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TAQuiz - Découvre tes amis ! 💕✨",
  description:
    "Quiz de personnalité fun entre amis ! Découvre quel type d'amis tu as avec tes potes. Multijoueur en temps réel 🎮",
  keywords: "quiz, personnalité, amis, multijoueur, fun, type d'amis, jeu",
  authors: [{ name: "esotericfawn" }],
  metadataBase: new URL("https://taquiz.vercel.app"),
  openGraph: {
    title: "TAQuiz - Découvre tes amis ! 💕✨",
    description:
      "Quiz de personnalité fun entre amis ! Joue avec tes potes et découvre quel type d'amis tu as. Multijoueur en temps réel 🎮",
    url: "https://taquiz.vercel.app",
    siteName: "TAQuiz",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TAQuiz - Quiz de personnalité entre amis - Découvre ton type d'amis avec tes potes !",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TAQuiz - Découvre ton type d'amis ! 💕✨",
    description:
      "Quiz de personnalité fun entre amis ! Multijoueur temps réel 🎮",
    creator: "@esotericfawn",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        {/* Meta tags additionnels */}
        <meta name="theme-color" content="#ec4899" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Preconnect pour optimiser */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QuizProvider>{children}</QuizProvider>
      </body>
    </html>
  );
}
