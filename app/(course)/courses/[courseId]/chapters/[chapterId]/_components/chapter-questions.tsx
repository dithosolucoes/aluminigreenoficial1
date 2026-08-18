"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MessageSquare, Send, CornerDownRight, Loader2, HelpCircle, MessageCircle } from "lucide-react";

interface Answer {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  isTeacher: boolean;
  createdAt: string;
}

interface Question {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  createdAt: string;
  answers: Answer[];
}

interface ChapterQuestionsProps {
  courseId: string;
  chapterId: string;
}

export const ChapterQuestions = ({
  courseId,
  chapterId,
}: ChapterQuestionsProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/courses/${courseId}/chapters/${chapterId}/questions`
      );
      setQuestions(response.data);
    } catch (error) {
      console.error("[FETCH_QUESTIONS]", error);
      toast.error("Não foi possível carregar as dúvidas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [courseId, chapterId]);

  const onSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newQuestion.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/questions`,
        { content: newQuestion }
      );

      toast.success("Dúvida publicada com sucesso!");
      setNewQuestion("");
      // Add new question to the top of the list instantly with empty answers
      setQuestions((prev) => [
        { ...response.data, answers: [] },
        ...prev,
      ]);
    } catch (error) {
      console.error("[SUBMIT_QUESTION]", error);
      toast.error("Erro ao publicar dúvida. Verifique sua conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitReply = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      return;
    }

    try {
      setIsSubmittingReply(true);
      const response = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/questions/${questionId}/answers`,
        { content: replyContent }
      );

      toast.success("Resposta enviada com sucesso!");
      setReplyContent("");
      setReplyingToId(null);

      // Instantly insert the reply into the target question
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === questionId) {
            return {
              ...q,
              answers: [...q.answers, response.data],
            };
          }
          return q;
        })
      );
    } catch (error) {
      console.error("[SUBMIT_REPLY]", error);
      toast.error("Erro ao enviar resposta.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 border-t mt-6 bg-slate-50/50" id="chapter-support-area">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex items-center gap-x-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <MessageSquare className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Canal de Dúvidas & Suporte</h3>
            <p className="text-xs text-slate-500">Tem alguma pergunta sobre a aula? Deixe sua dúvida abaixo para que o instrutor ou outros alunos possam responder!</p>
          </div>
        </div>

        {/* Question Submission Box */}
        <form onSubmit={onSubmitQuestion} className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm" id="question-form">
          <div className="flex items-center gap-x-2 text-xs font-semibold text-slate-500 mb-1">
            <HelpCircle className="h-4 w-4 text-emerald-600" />
            <span>Qual é a sua dúvida?</span>
          </div>
          <textarea
            id="question-input-field"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            disabled={isSubmitting}
            placeholder="Digite sua dúvida ou comentário de forma clara e detalhada..."
            rows={3}
            className="w-full p-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 disabled:opacity-50 transition"
          />
          <div className="flex justify-end">
            <button
              id="submit-question-btn"
              type="submit"
              disabled={isSubmitting || !newQuestion.trim()}
              className="flex items-center gap-x-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-md active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Enviar Pergunta
                </>
              )}
            </button>
          </div>
        </form>

        {/* Questions List */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Discussões Recentes</h4>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-y-3" id="questions-loader">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Carregando perguntas e respostas...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center gap-y-3" id="questions-empty-state">
              <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                <MessageCircle className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-slate-700">Nenhuma dúvida por enquanto!</p>
              <p className="text-xs text-slate-500 max-w-sm">Esta aula ainda não tem discussões registradas. Seja o primeiro a fazer uma pergunta!</p>
            </div>
          ) : (
            <div className="space-y-6" id="questions-list-container">
              {questions.map((question) => (
                <div
                  key={question.id}
                  id={`question-card-${question.id}`}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
                >
                  {/* Student Question Card */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/20">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-x-3">
                        {question.userImage ? (
                          <img
                            src={question.userImage}
                            alt={question.userName}
                            className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm">
                            {question.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-800">{question.userName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{formatDate(question.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-700 text-sm mt-3.5 leading-relaxed whitespace-pre-line pl-0.5">
                      {question.content}
                    </p>

                    <div className="mt-4 flex justify-end">
                      <button
                        id={`reply-btn-${question.id}`}
                        onClick={() => {
                          if (replyingToId === question.id) {
                            setReplyingToId(null);
                          } else {
                            setReplyingToId(question.id);
                            setReplyContent("");
                          }
                        }}
                        className="text-emerald-700 hover:text-emerald-800 text-xs font-bold tracking-wide uppercase hover:underline flex items-center gap-1"
                      >
                        Responder
                      </button>
                    </div>
                  </div>

                  {/* Reply Input Form under the specific question */}
                  {replyingToId === question.id && (
                    <form
                      onSubmit={(e) => onSubmitReply(e, question.id)}
                      className="p-4 bg-slate-50 border-b border-slate-100 space-y-3"
                      id={`reply-form-${question.id}`}
                    >
                      <textarea
                        id={`reply-input-${question.id}`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        disabled={isSubmittingReply}
                        placeholder="Escreva sua resposta para esta dúvida..."
                        rows={2}
                        className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:opacity-50 transition"
                      />
                      <div className="flex justify-end gap-x-2">
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="text-slate-500 hover:text-slate-700 text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                          Cancelar
                        </button>
                        <button
                          id={`submit-reply-btn-${question.id}`}
                          type="submit"
                          disabled={isSubmittingReply || !replyContent.trim()}
                          className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold px-4 py-1.5 rounded-md transition"
                        >
                          {isSubmittingReply ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Responder"
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Nested Answers List */}
                  {question.answers && question.answers.length > 0 && (
                    <div className="bg-slate-50/40 p-4 space-y-3" id={`answers-list-${question.id}`}>
                      {question.answers.map((answer) => (
                        <div
                          key={answer.id}
                          id={`answer-item-${answer.id}`}
                          className={`p-3.5 rounded-xl border flex gap-x-3 items-start ${
                            answer.isTeacher
                              ? "bg-emerald-50/75 border-emerald-200/80 shadow-sm"
                              : "bg-white border-slate-100"
                          }`}
                        >
                          <div className="text-slate-400 mt-1">
                            <CornerDownRight className="h-4 w-4" />
                          </div>

                          {answer.userImage ? (
                            <img
                              src={answer.userImage}
                              alt={answer.userName}
                              className="w-8 h-8 rounded-full border border-slate-200 object-cover mt-0.5"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${
                              answer.isTeacher
                                ? "bg-emerald-700 text-white border border-emerald-800"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}>
                              {answer.userName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-x-2">
                              <span className={`text-xs font-bold ${answer.isTeacher ? "text-emerald-900" : "text-slate-800"}`}>
                                {answer.userName}
                              </span>
                              {answer.isTeacher && (
                                <span className="bg-emerald-700 text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded tracking-wide border border-emerald-800">
                                  Instrutor 🎓
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 font-medium">
                                • {formatDate(answer.createdAt)}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed ${answer.isTeacher ? "text-emerald-950 font-medium" : "text-slate-600"}`}>
                              {answer.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
