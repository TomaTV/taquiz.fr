'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, push, set, get, onValue, off, serverTimestamp } from 'firebase/database';

const QuizContext = createContext();

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    // Simulate connection status
    setIsConnected(true);
  }, []);

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const resetQuiz = async (sessionId) => {
    try {
      const updates = {
        state: 'waiting',
        questions: [],
        currentQuestionIndex: 0,
        answers: {},
        playerQuestions: {},
        selectedQuestion: 0,
        showPlayerNames: false
      };
      
      // Mettre à jour tous les champs en une fois
      for (const [key, value] of Object.entries(updates)) {
        await set(ref(database, `sessions/${sessionId}/${key}`), value);
      }
      
      console.log('Quiz reset successfully');
    } catch (error) {
      console.error('Error resetting quiz:', error);
      throw error;
    }
  };

  const createQuiz = async (playerName) => {
    try {
      const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const playerId = Math.random().toString(36).substring(2, 15);
      
      const player = {
        id: playerId,
        name: playerName,
        isCreator: true,
        joinedAt: Date.now()
      };

      const session = {
        id: sessionId,
        createdAt: serverTimestamp(),
        state: 'waiting',
        questions: [],
        currentQuestionIndex: 0,
        players: {
          [playerId]: player
        },
        answers: {},
        playerQuestions: {}
      };

      await set(ref(database, `sessions/${sessionId}`), session);
      
      setCurrentSession({ ...session, id: sessionId });
      setCurrentPlayer(player);
      
      return sessionId;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  };

  const joinQuiz = async (sessionId, playerName) => {
    try {
      const playerId = Math.random().toString(36).substring(2, 15);
      
      const player = {
        id: playerId,
        name: playerName,
        isCreator: false,
        joinedAt: Date.now()
      };

      await set(ref(database, `sessions/${sessionId}/players/${playerId}`), player);
      
      setCurrentPlayer(player);
      
      // Listen to session updates
      const sessionRef = ref(database, `sessions/${sessionId}`);
      onValue(sessionRef, (snapshot) => {
        const sessionData = snapshot.val();
        if (sessionData) {
          setCurrentSession({ ...sessionData, id: sessionId });
        }
      });

    } catch (error) {
      console.error('Error joining quiz:', error);
      throw error;
    }
  };

  const addPlayerQuestions = async (sessionId, playerId, questions) => {
    try {
      const questionData = {
        questions,
        submittedAt: Date.now()
      };
      
      await set(ref(database, `sessions/${sessionId}/playerQuestions/${playerId}`), questionData);
      
      console.log('Player questions added:', questions);
    } catch (error) {
      console.error('Error adding player questions:', error);
      throw error;
    }
  };

  const startQuizFromQuestions = async (sessionId) => {
    try {
      // Récupérer les données de session
      const snapshot = await get(ref(database, `sessions/${sessionId}`));
      const sessionData = snapshot.val();
      
      const allQuestions = [];
      const playerQuestions = sessionData.playerQuestions || {};
      
      Object.values(playerQuestions).forEach(playerData => {
        if (playerData.questions) {
          allQuestions.push(...playerData.questions);
        }
      });
      
      if (allQuestions.length < 3) {
        throw new Error('Not enough questions');
      }
      
      // Mélanger les questions
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
      
      await set(ref(database, `sessions/${sessionId}/questions`), shuffledQuestions);
      await set(ref(database, `sessions/${sessionId}/state`), 'answering');
      await set(ref(database, `sessions/${sessionId}/currentQuestionIndex`), 0);
      
      console.log('Quiz started with questions:', shuffledQuestions);
    } catch (error) {
      console.error('Error starting quiz:', error);
      throw error;
    }
  };

  const submitAnswer = async (sessionId, playerId, questionIndex, answer) => {
    try {
      const answerData = {
        answer,
        submittedAt: Date.now()
      };
      
      await set(
        ref(database, `sessions/${sessionId}/answers/${playerId}/${questionIndex}`), 
        answerData
      );
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  const listenToSession = (sessionId, callback) => {
    const sessionRef = ref(database, `sessions/${sessionId}`);
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const sessionData = snapshot.val();
      if (sessionData) {
        callback({ ...sessionData, id: sessionId });
      }
    });
    
    return () => off(sessionRef, unsubscribe);
  };

  const value = {
    isConnected,
    currentSession,
    currentPlayer,
    createQuiz,
    joinQuiz,
    addPlayerQuestions,
    startQuizFromQuestions,
    submitAnswer,
    listenToSession,
    resetQuiz
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

// For backward compatibility
export const useSocket = useQuiz;
export const SocketProvider = QuizProvider;
