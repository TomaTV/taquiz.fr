'use client';

import { useState, useEffect } from 'react';
import { useQuiz } from '@/hooks/useSocket';
import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

export default function QuizResults({ sessionData, sessionId }) {
  const { currentPlayer, resetQuiz } = useQuiz();
  const [selectedQuestion, setSelectedQuestion] = useState(sessionData?.selectedQuestion || 0);
  const [showPlayerNames, setShowPlayerNames] = useState(sessionData?.showPlayerNames || false);
  const [isResetting, setIsResetting] = useState(false);
  
  const questions = sessionData?.questions || [];
  const players = Object.values(sessionData?.players || {});
  const answers = sessionData?.answers || {};
  const isCreator = currentPlayer?.isCreator;

  // Synchroniser avec Firebase (seul l'hôte peut changer)
  const changeQuestion = async (newIndex) => {
    if (!isCreator) return;
    
    try {
      await set(ref(database, `sessions/${sessionId}/selectedQuestion`), newIndex);
    } catch (error) {
      console.error('Error changing question:', error);
    }
  };
  
  const toggleNames = async () => {
    if (!isCreator) return;
    
    try {
      await set(ref(database, `sessions/${sessionId}/showPlayerNames`), !showPlayerNames);
    } catch (error) {
      console.error('Error toggling names:', error);
    }
  };

  const handleRestart = async () => {
    if (!isCreator) {
      console.log('Only creator can restart');
      return;
    }
    
    console.log('Starting restart process...');
    setIsResetting(true);
    
    try {
      await resetQuiz(sessionId);
      console.log('Quiz reset completed');
      // Pas besoin de redirection, Firebase va automatiquement changer l'état
    } catch (error) {
      console.error('Error restarting quiz:', error);
      alert('Erreur lors du redémarrage du quiz');
    } finally {
      setIsResetting(false);
    }
  };

  // Écouter les changements de l'hôte
  useEffect(() => {
    if (sessionData?.selectedQuestion !== undefined) {
      setSelectedQuestion(sessionData.selectedQuestion);
    }
    if (sessionData?.showPlayerNames !== undefined) {
      setShowPlayerNames(sessionData.showPlayerNames);
    }
  }, [sessionData]);

  const getRandomColor = (index) => {
    const colors = [
      'from-pink-400 to-rose-400',
      'from-purple-400 to-indigo-400', 
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-orange-400 to-yellow-400',
      'from-red-400 to-pink-400'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Terminé !</h1>
            <p className="text-gray-600 mb-4">Voici ce que tout le monde a répondu</p>
            {!isCreator && (
              <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-2 mt-4">
                🎮 L'hôte contrôle la navigation des résultats
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">Question {selectedQuestion + 1} sur {questions.length}</div>
            <h2 className="text-2xl font-bold text-gray-800">
              {questions[selectedQuestion]}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {players.map((player, playerIndex) => (
              <div key={player.id} className={`bg-gradient-to-r ${getRandomColor(playerIndex)} p-6 rounded-2xl text-white shadow-lg`}>
                <div className="mb-3">
                  <h3 className="font-bold text-lg">
                    {showPlayerNames ? player.name : `Joueur ${playerIndex + 1}`}
                  </h3>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/90 font-medium">
                    {answers[player.id]?.[selectedQuestion]?.answer || 'Pas de réponse'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contrôles - seul l'hôte peut les utiliser */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => changeQuestion(Math.max(0, selectedQuestion - 1))}
              disabled={selectedQuestion === 0 || !isCreator}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isCreator 
                  ? 'bg-gray-400 hover:bg-gray-500 text-white disabled:opacity-50' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              ← Précédente
            </button>
            
            <button
              onClick={toggleNames}
              disabled={!isCreator}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isCreator
                  ? showPlayerNames 
                    ? 'bg-purple-500 text-white hover:bg-purple-600' 
                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {showPlayerNames ? 'Cacher les Noms' : 'Montrer les Noms'}
            </button>
            
            <button
              onClick={() => changeQuestion(Math.min(questions.length - 1, selectedQuestion + 1))}
              disabled={selectedQuestion === questions.length - 1 || !isCreator}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isCreator 
                  ? 'bg-gray-400 hover:bg-gray-500 text-white disabled:opacity-50' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Suivante →
            </button>
          </div>

          {!isCreator && (
            <div className="text-center text-gray-600 text-sm mb-6">
              L'hôte navigue dans les résultats pour tout le monde
            </div>
          )}

          <div className="text-center space-y-4">
            {isCreator ? (
              <>
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleRestart}
                    disabled={isResetting}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all duration-200 shadow-lg disabled:opacity-50"
                  >
                    {isResetting ? 'Redémarrage...' : '🔄 Rejouer Ensemble'}
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-500 hover:to-purple-600 transition-all duration-200 shadow-lg"
                  >
                    🆕 Nouveau Quiz
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mt-3">
                  📝 "Rejouer" garde les mêmes joueurs et reset le quiz
                </p>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-blue-800 text-sm font-medium">
                    🎮 L'hôte peut relancer un quiz avec les mêmes joueurs
                  </p>
                </div>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-lg"
                >
                  Quitter vers l'Accueil
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
