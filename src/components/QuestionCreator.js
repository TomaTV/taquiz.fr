"use client";

import { useState } from "react";

export default function QuestionCreator({ onSubmit }) {
  const [questions, setQuestions] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

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

    if (validQuestions.length < 3) {
      alert("Please add at least 3 questions");
      return;
    }

    setIsSubmitting(true);
    onSubmit(validQuestions);
  };

  const canSubmit = questions.filter((q) => q.trim()).length >= 3;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Créer des Questions
          </h1>
          <p className="text-gray-600">
            Ajoutez des questions de personnalité pour que tout le monde puisse
            répondre
          </p>
        </div>

        {/* Questions List */}
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
                  placeholder="Écrivez votre question ici..."
                  className="w-full p-3 border-2 border-pink-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white/50 resize-none"
                  rows="3"
                  maxLength={200}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {question.length}/200
                </div>
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

        {/* Add Question Button */}
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

        {/* Submit */}
        <div className="text-center">
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              Questions: {questions.filter((q) => q.trim()).length}/10
              {questions.filter((q) => q.trim()).length < 3 && " (minimum 3)"}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? "Chargement du Quiz..." : "Démarrer le Quiz →"}
          </button>
        </div>
      </div>
    </div>
  );
}
