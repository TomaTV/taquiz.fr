"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuiz } from "@/hooks/useSocket";
import { database } from "@/lib/firebase";
import { ref, onValue, off, set } from "firebase/database";
import QuizResults from "@/components/QuizResults";

const GAME_STATES = {
  WAITING: "waiting",
  CREATING_QUESTIONS: "creating_questions",
  ANSWERING: "answering",
  RESULTS: "results",
};

export default function QuizSession() {
  const params = useParams();
  const router = useRouter();
  const { currentPlayer, addPlayerQuestions, startQuizFromQuestions } =
    useQuiz();

  const [sessionData, setSessionData] = useState(null);
  const [localGameState, setLocalGameState] = useState(GAME_STATES.WAITING);
  const [showQuestionCreator, setShowQuestionCreator] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Rediriger si pas de joueur (accès direct à l'URL)
  useEffect(() => {
    if (!loading && !currentPlayer) {
      console.log("No current player found, redirecting to home");
      router.push("/");
    }
  }, [currentPlayer, loading, router]);

  // Listen to session changes
  useEffect(() => {
    if (!params.sessionId) return;

    const sessionRef = ref(database, `sessions/${params.sessionId}`);
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSessionData(data);
        console.log("Session state changed to:", data.state);

        // Mettre à jour l'état local selon l'état Firebase
        setLocalGameState(data.state || GAME_STATES.WAITING);

        // Fermer l'interface de création si on passe en answering ou results
        if (
          data.state === GAME_STATES.ANSWERING ||
          data.state === GAME_STATES.RESULTS
        ) {
          setShowQuestionCreator(false);
        }

        setQuestions(data.questions || []);
        setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        setLoading(false);
      } else {
        setError("Session not found");
        setLoading(false);
      }
    });

    return () => off(sessionRef, unsubscribe);
  }, [params.sessionId]);

  // Reset answer state when question changes
  useEffect(() => {
    setCurrentAnswer("");
    setHasAnswered(false);
  }, [currentQuestionIndex]);

  // Check if all players answered and move to next question
  useEffect(() => {
    if (
      !sessionData ||
      localGameState !== GAME_STATES.ANSWERING ||
      !currentPlayer?.isCreator
    )
      return;

    const checkAllAnswered = async () => {
      const players = Object.keys(sessionData.players || {});
      const answers = sessionData.answers || {};

      const allAnswered = players.every(
        (playerId) => answers[playerId]?.[currentQuestionIndex] !== undefined
      );

      if (allAnswered) {
        if (currentQuestionIndex < questions.length - 1) {
          await set(
            ref(database, `sessions/${params.sessionId}/currentQuestionIndex`),
            currentQuestionIndex + 1
          );
        } else {
          await set(
            ref(database, `sessions/${params.sessionId}/state`),
            GAME_STATES.RESULTS
          );
        }
      }
    };

    checkAllAnswered();
  }, [
    sessionData,
    currentQuestionIndex,
    questions.length,
    localGameState,
    params.sessionId,
    currentPlayer,
  ]);

  const handleStartQuestions = () => {
    setShowQuestionCreator(true);
  };

  const handleQuestionsSubmit = async (newQuestions) => {
    try {
      console.log("Submitting questions:", newQuestions);

      // Vérifier que currentPlayer existe
      if (!currentPlayer || !currentPlayer.id) {
        alert("Erreur: joueur non identifié. Retournez à l'accueil.");
        router.push("/");
        return;
      }

      await addPlayerQuestions(
        params.sessionId,
        currentPlayer.id,
        newQuestions
      );
      // Fermer l'interface de création pour ce joueur
      setShowQuestionCreator(false);
    } catch (error) {
      console.error("Error submitting questions:", error);
      alert("Erreur lors de la soumission des questions. Veuillez réessayer.");
    }
  };

  const handleStartQuiz = async () => {
    try {
      await startQuizFromQuestions(params.sessionId);
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("Pas assez de questions pour démarrer le quiz.");
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim() || hasAnswered || !currentPlayer) return;

    setHasAnswered(true);
    try {
      await set(
        ref(
          database,
          `sessions/${params.sessionId}/answers/${currentPlayer.id}/${currentQuestionIndex}`
        ),
        {
          answer: currentAnswer.trim(),
          submittedAt: Date.now(),
        }
      );
    } catch (error) {
      console.error("Error submitting answer:", error);
      setHasAnswered(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <h2 className="text-red-800 font-semibold mb-2">Erreur</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Si le joueur est en train de créer des questions (interface locale)
  if (showQuestionCreator) {
    return (
      <QuestionCreator
        onSubmit={handleQuestionsSubmit}
        onCancel={() => setShowQuestionCreator(false)}
      />
    );
  }

  // Waiting Room
  if (localGameState === GAME_STATES.WAITING) {
    const playersCount = Object.keys(sessionData?.players || {}).length;
    const playerQuestions = sessionData?.playerQuestions || {};
    const totalQuestions = Object.values(playerQuestions).reduce(
      (acc, player) => acc + (player.questions?.length || 0),
      0
    );
    const playersWithQuestions = Object.keys(playerQuestions).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Salle d'Attente
            </h1>
            <p className="text-gray-600">
              Partage le code avec tes amis pour qu'ils te rejoignent !
            </p>
          </div>

          <div className="mb-8 text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Code du Quiz
            </div>
            <div className="bg-gradient-to-r from-pink-400 to-purple-500 text-white text-3xl font-bold py-4 px-8 rounded-2xl tracking-widest">
              {params.sessionId}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Joueurs ({playersCount})
            </h3>
            <div className="space-y-2">
              {Object.values(sessionData?.players || {}).map((player) => {
                const hasSubmittedQuestions =
                  playerQuestions[player.id]?.questions?.length > 0;
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-white/50 rounded-xl p-3 border border-pink-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          hasSubmittedQuestions
                            ? "bg-green-400"
                            : player.isCreator
                            ? "bg-yellow-400"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="font-medium text-gray-700">
                        {player.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasSubmittedQuestions && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {playerQuestions[player.id].questions.length} Q
                        </span>
                      )}
                      {player.isCreator && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Hôte
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Questions Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-center">
              <div className="text-sm font-medium text-blue-800 mb-1">
                Questions Collectées
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {totalQuestions}
              </div>
              <div className="text-xs text-blue-600">
                {playersWithQuestions} sur {playersCount} joueurs ont contribué
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            {playersCount < 2 ? (
              <div className="text-gray-600 mb-4">
                En attente de plus de joueurs... (minimum 2 requis)
              </div>
            ) : (
              <>
                {/* Add Questions Button */}
                <button
                  onClick={handleStartQuestions}
                  className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-500 hover:to-purple-600 transition-all duration-200 shadow-lg"
                >
                  {playerQuestions[currentPlayer?.id]
                    ? "Modifier mes questions"
                    : "Ajouter des questions"}{" "}
                  →
                </button>

                {/* Start Quiz Button (only for creator and when enough questions) */}
                {currentPlayer?.isCreator && totalQuestions >= 3 && (
                  <button
                    onClick={handleStartQuiz}
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                  >
                    🚀 Démarrer le Quiz Maintenant ! ({totalQuestions}{" "}
                    questions)
                  </button>
                )}

                {currentPlayer?.isCreator && totalQuestions < 3 && (
                  <div className="text-gray-600 text-sm">
                    Minimum 3 questions pour lancer (actuellement:{" "}
                    {totalQuestions})
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Game
  if (localGameState === GAME_STATES.ANSWERING) {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const players = Object.values(sessionData?.players || {});
    const answers = sessionData?.answers || {};

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} sur {questions.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {questions[currentQuestionIndex]}
            </h2>
          </div>

          <div className="mb-8">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={hasAnswered}
              placeholder="Écris ta réponse ici..."
              className="w-full p-4 border-2 border-pink-400 rounded-xl focus:border-purple-600 focus:outline-none transition-colors bg-white resize-none text-lg text-gray-800 placeholder-gray-600 shadow-sm"
              rows="4"
              maxLength={300}
            />
          </div>

          <div className="text-center mb-8">
            <button
              onClick={handleAnswerSubmit}
              disabled={!currentAnswer.trim() || hasAnswered}
              className="bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-pink-500 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              {hasAnswered ? "✓ Répondu" : "Soumettre la Réponse"}
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-3">
              {players.map((player) => {
                const playerAnswered =
                  answers[player.id]?.[currentQuestionIndex] !== undefined;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center space-x-2 p-3 rounded-xl border ${
                      playerAnswered
                        ? "bg-green-300 border-green-500"
                        : "bg-gray-300 border-gray-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        playerAnswered ? "bg-green-400" : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="text-sm font-medium truncate text-black">
                      {player.name}
                    </span>
                  </div>
                );
              })}
            </div>
            {hasAnswered && (
              <div className="mt-4 text-center text-sm text-gray-600">
                En attente des autres joueurs...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (localGameState === GAME_STATES.RESULTS) {
    return (
      <QuizResults sessionData={sessionData} sessionId={params.sessionId} />
    );
  }

  return null;
}

// Question Creator Component
function QuestionCreator({ onSubmit, onCancel }) {
  const [questions, setQuestions] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => setQuestions([...questions, ""]);

  const updateQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const validQuestions = questions.filter((q) => q.trim());
    if (validQuestions.length < 1) {
      alert("Veuillez ajouter au moins 1 question");
      return;
    }
    setIsSubmitting(true);
    onSubmit(validQuestions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Ajoute Tes Questions
          </h1>
          <p className="text-gray-600">
            Tout le monde peut contribuer ! Ajoute 1-5 questions.
          </p>
        </div>

        <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
          {questions.map((question, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-2">
                {index + 1}
              </div>
              <div className="flex-1">
                <textarea
                  value={question}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder="Écris ta question ici..."
                  className="w-full p-3 border-2 border-pink-400 rounded-xl focus:border-purple-600 focus:outline-none transition-colors bg-white resize-none text-gray-800 placeholder-gray-600 shadow-sm"
                  rows="3"
                  maxLength={200}
                />
              </div>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(index)}
                  className="flex-shrink-0 w-8 h-8 bg-red-400 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors mt-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {questions.length < 10 && (
          <div className="text-center mb-8">
            <button
              onClick={addQuestion}
              className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
            >
              + Ajouter une question
            </button>
          </div>
        )}

        <div className="text-center space-y-4">
          <div className="text-center mb-4">
            <span className="text-sm text-gray-600">
              Questions: {questions.filter((q) => q.trim()).length}/5
              {questions.filter((q) => q.trim()).length < 1 &&
                " (ajouter au moins 1)"}
            </span>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 border-2 border-gray-300 text-gray-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                questions.filter((q) => q.trim()).length < 1 || isSubmitting
              }
              className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-green-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              {isSubmitting ? "Soumission en cours..." : "Soumettre →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
