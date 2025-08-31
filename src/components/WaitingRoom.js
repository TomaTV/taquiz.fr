"use client";

import { useState } from "react";

export default function WaitingRoom({
  sessionId,
  sessionData,
  currentPlayer,
  onStartQuestions,
}) {
  const [copied, setCopied] = useState(false);

  const copySessionId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const isCreator = currentPlayer?.isCreator;
  const playersCount = sessionData?.players?.length || 0;
  const canStart = playersCount >= 2 && isCreator;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Salle d'attente
          </h1>
          <p className="text-gray-600">
            Partagez le code avec vos amis pour rejoindre !
          </p>
        </div>

        {/* Session Code */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Code du Quiz
            </div>
            <div
              onClick={copySessionId}
              className="bg-gradient-to-r from-pink-400 to-purple-500 text-white text-3xl font-bold py-4 px-8 rounded-2xl cursor-pointer hover:from-pink-500 hover:to-purple-600 transition-all duration-200 tracking-widest"
            >
              {sessionId}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {copied ? "✓ Copied!" : "Click to copy"}
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Joueurs ({playersCount})
          </h3>
          <div className="space-y-2">
            {sessionData?.players?.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-white/50 rounded-xl p-3 border border-pink-200"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      player.isCreator ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  ></div>
                  <span className="font-medium text-gray-700">
                    {player.name}
                  </span>
                </div>
                {player.isCreator && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Hôte
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="text-center">
          {playersCount < 2 ? (
            <div className="text-gray-600 mb-4">
              En attente de plus de joueurs... (minimum 2 requis)
            </div>
          ) : (
            <div className="text-green-600 mb-4 font-medium">
              ✓ Prêt à commencer ! ({playersCount} joueurs)
            </div>
          )}

          {isCreator && canStart && (
            <button
              onClick={onStartQuestions}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-500 hover:to-blue-600 transition-all duration-200 shadow-lg"
            >
              Créer des questions →
            </button>
          )}

          {!isCreator && (
            <div className="text-gray-600">
              En attente que l'hôte démarre le quiz...
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => (window.location.href = "/")}
            className="text-gray-500 hover:text-gray-700 underline text-sm"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
