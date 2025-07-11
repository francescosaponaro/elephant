"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, ChevronLeft, ChevronRight } from "lucide-react";

type Flashcard = {
  question: string;
  type: "yesno" | "text";
};

type AnswerRecord = {
  question: string;
  answer: string;
  correct?: boolean;
};

export default function FlashcardQuiz({
  questions,
  originalText,
  onDone,
}: {
  questions: Flashcard[];
  originalText: string;
  onDone?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [userAnswers, setUserAnswers] = useState<AnswerRecord[]>([]);
  const [gradedAnswers, setGradedAnswers] = useState<AnswerRecord[] | null>(
    null
  );
  const [isGrading, setIsGrading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const currentCard = questions[index];

  // Add swipe gesture
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    let startX: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (startX !== null) {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (diff > 75) handleDontKnow();
      }
      startX = null;
    };

    el.addEventListener("touchstart", handleTouchStart);
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [index]);

  const next = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIndex((prev) => prev + 1);
      setIsFlipping(false);
    }, 300);
  };

  const handleAnswer = () => {
    setUserAnswers((prev) => [
      ...prev,
      { question: currentCard.question, answer: answer.trim() },
    ]);
    setAnswer("");
    next();
  };

  const handleDontKnow = () => {
    setUserAnswers((prev) => [
      ...prev,
      { question: currentCard.question, answer: "Don't know", correct: false },
    ]);
    next();
  };

  const handleYesNoAnswer = (choice: "Yes" | "No") => {
    setUserAnswers((prev) => [
      ...prev,
      { question: currentCard.question, answer: choice },
    ]);
    next();
  };

  // Grade answers when quiz is done
  useEffect(() => {
    const gradeAnswers = async () => {
      if (index < questions.length || userAnswers.length !== questions.length)
        return;

      setIsGrading(true);
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: userAnswers.map((q) => ({
            question: q.question,
            userAnswer: q.answer,
          })),
          originalText,
        }),
      });

      const data = await res.json();
      setGradedAnswers(data.gradedAnswers);
      setIsGrading(false);
    };

    gradeAnswers();
  }, [index, userAnswers, questions.length, originalText]);

  const progress = ((index + 1) / questions.length) * 100;

  if (!questions || questions.length === 0)
    return <p className="text-center">No questions found.</p>;

  if (gradedAnswers) {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 text-center max-w-xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Quiz Complete!
        </h2>
        <div className="space-y-4 text-left">
          {gradedAnswers.map((entry, i) => (
            <div
              key={i}
              className="bg-white/90 border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <p className="font-semibold mb-1">Q: {entry.question}</p>
              <p className="text-gray-600">Correct answer: {entry.answer}</p>
              <p
                className={`mt-1 text-sm font-medium ${
                  entry.correct ? "text-green-600" : "text-red-500"
                }`}
              >
                {entry.correct ? "✅ Correct" : "❌ Incorrect"}
              </p>
            </div>
          ))}
        </div>
        {onDone && (
          <Button
            onClick={onDone}
            className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:scale-105 transition"
          >
            Finish
          </Button>
        )}
      </div>
    );
  }

  if (index >= questions.length || isGrading) {
    return (
      <div className="text-center mt-20 text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 mx-auto mb-4" />
        Grading your answers...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <Brain className="w-6 h-6 text-purple-600" />
          <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Knowledge Check
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <Card
        className={`backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-purple-500/10 text-center transform transition-all duration-300 ${
          isFlipping ? "scale-95 opacity-50" : "scale-100 opacity-100"
        }`}
        ref={cardRef}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => index > 0 && setIndex(index - 1)}
              disabled={index === 0}
              className="opacity-50 hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Question {index + 1}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => index < questions.length - 1 && next()}
              disabled={index === questions.length - 1}
              className="opacity-50 hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-8 py-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100 mb-8">
            <p className="text-xl font-medium text-gray-800 leading-relaxed">
              {currentCard.question}
            </p>
          </div>

          {currentCard.type === "yesno" ? (
            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                onClick={() => handleYesNoAnswer("Yes")}
                className="h-12 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✓ Yes
              </Button>
              <Button
                onClick={() => handleYesNoAnswer("No")}
                className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✗ No
              </Button>
              <Button
                onClick={handleDontKnow}
                variant="outline"
                className="h-12 px-8 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transform hover:scale-105 transition-all duration-200 bg-transparent"
              >
                🤷 Don't Know
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="h-14 text-lg border-2 border-gray-200 focus:border-purple-400 transition-all duration-300 rounded-xl"
                onKeyDown={(e) =>
                  e.key === "Enter" && answer.trim() && handleAnswer()
                }
              />
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleAnswer}
                  disabled={!answer.trim()}
                  className="h-12 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
                >
                  Submit Answer
                </Button>
                <Button
                  onClick={handleDontKnow}
                  variant="outline"
                  className="h-12 px-8 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transform hover:scale-105 transition-all duration-200 bg-transparent"
                >
                  Don't Know
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-center pt-4 pb-6">
          <div className="text-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
            💡 Swipe left on mobile to mark "Don't Know"
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Brain, ChevronLeft, ChevronRight } from "lucide-react";

// type Flashcard = {
//   question: string;
//   type: "yesno" | "text";
// };

// type AnswerRecord = {
//   question: string;
//   answer: string;
//   correct?: boolean; // You can later hook this into GPT validation
// };

// export default function FlashcardQuiz({
//   questions,
//   onDone,
// }: {
//   questions: Flashcard[];
//   onDone?: () => void;
// }) {
//   const [index, setIndex] = useState(0);
//   const [answer, setAnswer] = useState("");
//   const [isFlipping, setIsFlipping] = useState(false);
//   const [userAnswers, setUserAnswers] = useState<AnswerRecord[]>([]);
//   const currentCard = questions[index];
//   const cardRef = useRef<HTMLDivElement>(null);

//   const next = () => {
//     setIsFlipping(true);
//     setTimeout(() => {
//       setIndex((prev) => prev + 1);
//       setIsFlipping(false);
//     }, 300);
//   };

//   const handleAnswer = () => {
//     setUserAnswers((prev) => [
//       ...prev,
//       { question: currentCard.question, answer: answer.trim() },
//     ]);
//     setAnswer("");
//     next();
//   };

//   const handleDontKnow = () => {
//     setUserAnswers((prev) => [
//       ...prev,
//       { question: currentCard.question, answer: "Don't know", correct: false },
//     ]);
//     next();
//   };

//   const handleYesNoAnswer = (choice: "Yes" | "No") => {
//     setUserAnswers((prev) => [
//       ...prev,
//       { question: currentCard.question, answer: choice },
//     ]);
//     next();
//   };

//   useEffect(() => {
//     const el = cardRef.current;
//     if (!el) return;
//     let startX: number | null = null;

//     const handleTouchStart = (e: TouchEvent) => {
//       startX = e.touches[0].clientX;
//     };

//     const handleTouchEnd = (e: TouchEvent) => {
//       if (startX !== null) {
//         const endX = e.changedTouches[0].clientX;
//         const diff = startX - endX;
//         if (diff > 75) {
//           handleDontKnow();
//         }
//       }
//       startX = null;
//     };

//     el.addEventListener("touchstart", handleTouchStart);
//     el.addEventListener("touchend", handleTouchEnd);
//     return () => {
//       el.removeEventListener("touchstart", handleTouchStart);
//       el.removeEventListener("touchend", handleTouchEnd);
//     };
//   }, [index]);

//   const progress = ((index + 1) / questions.length) * 100;

//   // ✅ Show results when quiz is done
//   if (index >= questions.length) {
//     return (
//       <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 text-center max-w-xl mx-auto">
//         <h2 className="text-3xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//           Quiz Complete!
//         </h2>
//         <p className="text-lg text-gray-700 mb-4">
//           You answered {userAnswers.length} questions.
//         </p>
//         <div className="space-y-4 text-left">
//           {userAnswers.map((entry, i) => (
//             <div
//               key={i}
//               className="bg-white/90 border border-gray-200 rounded-xl p-4 shadow-sm"
//             >
//               <p className="font-semibold mb-1">Q: {entry.question}</p>
//               <p className="text-gray-600">Your answer: {entry.answer}</p>
//               {entry.correct === false && (
//                 <p className="text-red-500 text-sm mt-1">Marked incorrect</p>
//               )}
//             </div>
//           ))}
//         </div>
//         {onDone && (
//           <Button
//             onClick={onDone}
//             className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:scale-105 transition"
//           >
//             Finish
//           </Button>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
//       {/* Header */}
//       <div className="text-center mb-6">
//         <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
//           <Brain className="w-6 h-6 text-purple-600" />
//           <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//             Knowledge Check
//           </span>
//         </div>
//       </div>

//       {/* Progress */}
//       <div className="mb-6">
//         <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
//           <span>
//             Question {index + 1} of {questions.length}
//           </span>
//           <span>{Math.round(progress)}% Complete</span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div
//             className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
//             style={{ width: `${progress}%` }}
//           />
//         </div>
//       </div>

//       {/* Card */}
//       <Card
//         className={`backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-purple-500/10 text-center transform transition-all duration-300 ${
//           isFlipping ? "scale-95 opacity-50" : "scale-100 opacity-100"
//         }`}
//         ref={cardRef}
//       >
//         <CardHeader className="pb-4">
//           <div className="flex items-center justify-between">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => index > 0 && setIndex(index - 1)}
//               disabled={index === 0}
//               className="opacity-50 hover:opacity-100"
//             >
//               <ChevronLeft className="w-5 h-5" />
//             </Button>
//             <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//               Question {index + 1}
//             </h3>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => index < questions.length - 1 && next()}
//               disabled={index === questions.length - 1}
//               className="opacity-50 hover:opacity-100"
//             >
//               <ChevronRight className="w-5 h-5" />
//             </Button>
//           </div>
//         </CardHeader>

//         <CardContent className="px-8 py-6">
//           <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100 mb-8">
//             <p className="text-xl font-medium text-gray-800 leading-relaxed">
//               {currentCard.question}
//             </p>
//           </div>

//           {currentCard.type === "yesno" ? (
//             <div className="flex justify-center gap-4 flex-wrap">
//               <Button
//                 onClick={() => handleYesNoAnswer("Yes")}
//                 className="h-12 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 ✓ Yes
//               </Button>
//               <Button
//                 onClick={() => handleYesNoAnswer("No")}
//                 className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 ✗ No
//               </Button>
//               <Button
//                 onClick={handleDontKnow}
//                 variant="outline"
//                 className="h-12 px-8 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transform hover:scale-105 transition-all duration-200 bg-transparent"
//               >
//                 🤷 Don't Know
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               <Input
//                 value={answer}
//                 onChange={(e) => setAnswer(e.target.value)}
//                 placeholder="Type your answer here..."
//                 className="h-14 text-lg border-2 border-gray-200 focus:border-purple-400 transition-all duration-300 rounded-xl"
//                 onKeyDown={(e) =>
//                   e.key === "Enter" && answer.trim() && handleAnswer()
//                 }
//               />
//               <div className="flex justify-center gap-4">
//                 <Button
//                   onClick={handleAnswer}
//                   disabled={!answer.trim()}
//                   className="h-12 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
//                 >
//                   Submit Answer
//                 </Button>
//                 <Button
//                   onClick={handleDontKnow}
//                   variant="outline"
//                   className="h-12 px-8 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transform hover:scale-105 transition-all duration-200 bg-transparent"
//                 >
//                   Don't Know
//                 </Button>
//               </div>
//             </div>
//           )}
//         </CardContent>

//         <CardFooter className="justify-center pt-4 pb-6">
//           <div className="text-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
//             💡 Swipe left on mobile to mark "Don't Know"
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }
