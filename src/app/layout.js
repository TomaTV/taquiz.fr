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
  title: "AQuiz - Personality Quiz",
  description: "Discover your type in men! Real-time multiplayer personality quiz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QuizProvider>
          {children}
        </QuizProvider>
      </body>
    </html>
  );
}
