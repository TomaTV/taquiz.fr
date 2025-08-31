"use client";

import { useState, useEffect } from "react";

export default function QuizGame({
  question,
  questionIndex,
  totalQuestions,
  onAnswerSubmit,
  sessionData,
}) {
  const [answer, setAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [playersAnswered, setPlayersAnswered] = useState([]);

  useEffect(() => {
    // Reset for new question
    setAnswer("");
    setHasAnswered(false);
    setPlayersAnswered([]);
  }, [questionIndex]);

  const handleSubmit = () => {
    if (!answer.trim() || hasAnswered) return;

    setHasAnswered(true);
    onAnswerSubmit(answer.trim());
  };

  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Question {questionIndex + 1} sur {totalQuestions}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{question}</h2>
        </div>

        {/* Answer Input */}
        <div className="mb-8">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={hasAnswered}
            placeholder="Tape ta réponse ici..."
            className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/50 resize-none text-lg"
            rows="4"
            maxLength={300}
          />
          <div className="text-right text-sm text-gray-500 mt-2">
            {answer.length}/300
          </div>
        </div>

        {/* Submit Button */}
        <div className="mb-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || hasAnswered}
            className="bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-pink-500 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {hasAnswered ? "✓ Répondu" : "Soumettre la réponse"}
          </button>
        </div>

        {/* Players Status */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Statut des Joueurs
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {sessionData?.players?.map((player) => (
              <div
                key={player.id}
                className={`flex items-center space-x-2 p-3 rounded-xl border ${
                  playersAnswered.includes(player.name)
                    ? "bg-green-400 border-green-600 text-green-800"
                    : "bg-gray-400 border-gray-600 text-gray-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full text-gray-800 ${
                    playersAnswered.includes(player.name)
                      ? "bg-green-400 text-green-800"
                      : "bg-gray-400 text-gray-800"
                  }`}
                ></div>
                <span className="text-sm font-medium truncate text-gray-800">
                  {player.name}
                </span>
              </div>
            ))}
          </div>

          {hasAnswered && (
            <div className="mt-4 text-center text-sm text-gray-600">
              En attente que les autres joueurs terminent...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
