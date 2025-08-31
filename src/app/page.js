"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuiz } from "@/hooks/useSocket";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { createQuiz, joinQuiz, isConnected } = useQuiz();

  const handleStartQuiz = async () => {
    if (!playerName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const sessionId = await createQuiz(playerName.trim());
      router.push(`/quiz/${sessionId}`);
    } catch (error) {
      console.error("Failed to create quiz:", error);
      alert("Erreur lors de la création du quiz. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinQuiz = async () => {
    if (!playerName.trim() || !joinCode.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await joinQuiz(joinCode.trim().toUpperCase(), playerName.trim());
      router.push(`/quiz/${joinCode.trim().toUpperCase()}`);
    } catch (error) {
      console.error("Failed to join quiz:", error);
      alert("Impossible de rejoindre. Vérifiez le code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-sm font-medium text-gray-500 mb-3 tracking-wider uppercase">
            le taquiz
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          ></div>
          <span className="ml-2 text-sm text-gray-600">
            {isConnected ? "Connecté" : "Connexion..."}
          </span>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-pink-400 rounded-xl focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-300 bg-white text-gray-800 placeholder-gray-600 shadow-lg"
            placeholder="Ton pseudo..."
            maxLength={20}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!isJoining ? (
            <>
              {/* Start New Quiz */}
              <button
                onClick={handleStartQuiz}
                disabled={!playerName.trim() || !isConnected || isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
              >
                {isLoading ? "Création..." : "Créer le Quiz »"}
              </button>

              {/* Join Quiz Button */}
              <button
                onClick={() => setIsJoining(true)}
                disabled={!isConnected || isLoading}
                className="w-full border-2 border-purple-400 text-purple-700 font-semibold py-4 px-6 rounded-xl hover:bg-purple-100 hover:border-purple-500 hover:scale-105 transition-all duration-300 disabled:opacity-50 shadow-lg"
              >
                Rejoindre un Quiz avec le Code
              </button>
            </>
          ) : (
            <>
              {/* Join Code Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:border-blue-600 focus:outline-none transition-colors bg-white text-center text-lg tracking-widest text-gray-800 placeholder-gray-600 shadow-sm"
                  placeholder="CODE DU QUIZ"
                  maxLength={8}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsJoining(false)}
                  disabled={isLoading}
                  className="flex-1 border-2 border-gray-300 text-gray-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  Retour
                </button>
                <button
                  onClick={handleJoinQuiz}
                  disabled={
                    !playerName.trim() ||
                    !joinCode.trim() ||
                    !isConnected ||
                    isLoading
                  }
                  className="flex-1 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-500 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? "Rejoindre..." : "Rejoindre »"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
