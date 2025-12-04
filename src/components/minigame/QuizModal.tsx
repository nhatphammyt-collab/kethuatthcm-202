import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { Question } from '../../types/game';
import { getRandomQuestion } from '../../services/firebase/gameService';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnswer: (isCorrect: boolean) => void; // Callback khi trả lời xong
  roomId?: string; // Optional: để track answeredBy
  playerId?: string; // Optional: để track answeredBy
}

export default function QuizModal({ 
  isOpen, 
  onClose, 
  onAnswer,
  roomId,
  playerId 
}: QuizModalProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // 10 giây countdown

  // Load question when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset và load question mới mỗi lần mở modal
      setQuestion(null);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      setTimeLeft(10); // Reset timer
      loadQuestion();
    }
  }, [isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuestion(null);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      setTimeLeft(10);
    }
  }, [isOpen]);

  // Timer countdown - 10 giây
  useEffect(() => {
    if (!isOpen || showResult || !question || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, showResult, question, loading]);

  // Auto submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && question && !showResult && !loading) {
      const correct = selectedAnswer !== null && selectedAnswer === question.correctAnswer;
      setIsCorrect(correct);
      setShowResult(true);
      
      setTimeout(() => {
        onAnswer(correct);
        setTimeout(() => {
          onClose();
        }, 2000);
      }, 1500);
    }
  }, [timeLeft, question, showResult, loading, selectedAnswer, onAnswer, onClose]);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const randomQuestion = await getRandomQuestion();
      if (randomQuestion) {
        setQuestion(randomQuestion);
      } else {
        alert('Không tìm thấy câu hỏi. Vui lòng thử lại.');
        onClose();
      }
    } catch (error) {
      console.error('Error loading question:', error);
      alert('Lỗi khi tải câu hỏi. Vui lòng thử lại.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return; // Prevent selecting after showing result
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (!question) return; // Allow submit even if no answer selected (timeout)

    const correct = selectedAnswer !== null && selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    // Call callback after a short delay
    setTimeout(() => {
      onAnswer(correct);
      // Auto close after showing result
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl shadow-2xl border-2 border-[#FFD700] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#FFD700]">
          <h2 className="text-2xl font-bold text-[#FFD700]">TÌM LƯỢT LẮC</h2>
          {/* Timer - thay thế nút X */}
          {question && !showResult && !loading && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg transition-all ${
              timeLeft <= 3 
                ? 'bg-red-500 text-white animate-pulse scale-110' 
                : timeLeft <= 5
                ? 'bg-orange-500 text-white'
                : 'bg-[#FFD700] text-[#b30000]'
            }`}>
              <span>⏱️</span>
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin mb-4" />
              <p className="text-white text-lg">Đang tải câu hỏi...</p>
            </div>
          ) : question ? (
            <>
              {/* Question */}
              <div className="mb-6">
                <p className="text-white text-xl font-semibold leading-relaxed">
                  {question.question}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === question.correctAnswer;
                  const showCorrect = showResult && isCorrectAnswer;
                  const showWrong = showResult && isSelected && !isCorrectAnswer;

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-xl font-semibold transition-all ${
                        showCorrect
                          ? 'bg-green-500 text-white border-2 border-green-300'
                          : showWrong
                          ? 'bg-red-500 text-white border-2 border-red-300'
                          : isSelected
                          ? 'bg-[#FFD700] text-[#b30000] border-2 border-[#FFD700] scale-105'
                          : 'bg-white/10 text-white border-2 border-transparent hover:bg-white/20 hover:border-[#FFD700]/50'
                      } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span>{option}</span>
                        {showCorrect && (
                          <CheckCircle2 className="ml-auto w-6 h-6" />
                        )}
                        {showWrong && (
                          <XCircle className="ml-auto w-6 h-6" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Result Message */}
              {showResult && (
                <div
                  className={`mb-6 p-4 rounded-xl text-center font-bold text-lg ${
                    isCorrect
                      ? 'bg-green-500/20 text-green-300 border-2 border-green-500'
                      : 'bg-red-500/20 text-red-300 border-2 border-red-500'
                  }`}
                >
                  {isCorrect ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Chính xác! Bạn nhận được 1 lượt lắc!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="w-6 h-6" />
                      <span>Sai rồi! Hãy thử lại lần sau.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              {!showResult && (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedAnswer !== null
                      ? 'bg-[#FFD700] text-[#b30000] hover:scale-105 hover:shadow-2xl shadow-lg'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  XÁC NHẬN
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-white text-lg">Không có câu hỏi</p>
              <button
                onClick={loadQuestion}
                className="mt-4 bg-[#FFD700] text-[#b30000] px-6 py-2 rounded-lg font-semibold hover:scale-105"
              >
                Tải lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

