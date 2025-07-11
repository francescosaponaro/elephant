"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import WordDisplay from "@/components/WordsDisplay";
import FlashcardQuiz from "@/components/FlashcardQuiz";
import { BookOpen, Play, CheckCircle } from "lucide-react";

type Flashcard = {
  question: string;
  type: "yesno" | "text";
};

export default function HomePage() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<
    "input" | "confirm" | "countdown" | "go" | "reading" | "recap" | "quiz"
  >("input");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recap, setRecap] = useState("");
  const [quiz, setQuiz] = useState<Flashcard[]>([]);

  const handleStart = () => setPhase("confirm");

  const startCountdown = () => {
    let count = 3;
    setPhase("countdown");
    setCountdown(count);
    playBeep(); // 🔊 play immediately with "3"

    const interval = setInterval(() => {
      count -= 1;

      if (count > 0) {
        setCountdown(count);
        playBeep();
      } else {
        clearInterval(interval);
        setCountdown(null);
        setPhase("go");
        playGo();
        setTimeout(() => {
          setPhase("reading");
        }, 1000);
      }
    }, 1000);
  };

  const playBeep = () => new Audio("/beep.mp3").play();
  const playGo = () => new Audio("/go.mp3").play();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Input Phase */}
        {phase === "input" && (
          <div className="animate-in fade-in-0 duration-500">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-blue-500/10">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Speed Learning
                </h2>
                <p className="text-gray-600 mt-2">
                  Paste your text and start your focused reading session
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text here to begin your learning journey..."
                    className="min-h-[200px] text-lg border-2 border-gray-200 focus:border-blue-400 transition-all duration-300 resize-none rounded-xl"
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                    {text.trim().split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={!text.trim()}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning Session
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Confirm Phase */}
        {phase === "confirm" && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-purple-500/10 text-center">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Ready to Focus?
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  You'll see one word at a time for maximum focus.
                  <br />
                  <span className="text-sm text-gray-500">
                    Get ready to absorb knowledge!
                  </span>
                </p>
                <Button
                  onClick={startCountdown}
                  className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl rounded-full"
                >
                  Yes, Let's Go! 🚀
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Countdown Phase */}
        {phase === "countdown" && (
          <div className="flex items-center justify-center">
            <div className="text-9xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent animate-in zoom-in-50 duration-300 drop-shadow-2xl">
              {countdown}
            </div>
          </div>
        )}

        {/* Go Phase */}
        {phase === "go" && (
          <div className="flex items-center justify-center">
            <div className="text-8xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent animate-bounce drop-shadow-2xl text-center">
              GO! 🎯
            </div>
          </div>
        )}

        {/* Reading Phase */}
        {phase === "reading" && (
          <WordDisplay
            text={text}
            setRecap={setRecap}
            setQuiz={setQuiz}
            onComplete={() => setPhase("recap")}
          />
        )}

        {/* Recap Phase */}
        {phase === "recap" && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-indigo-500/10">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Learning Summary
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                  <p className="text-lg leading-relaxed text-gray-700">
                    {recap}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="justify-end pt-6">
                <Button
                  onClick={() => setPhase("quiz")}
                  className="h-12 px-8 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Test Your Knowledge 🧠
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === "quiz" && (
          <FlashcardQuiz
            questions={quiz}
            onDone={() => {
              alert("🎉 Quiz completed! Great job!");
              setPhase("input");
            }}
          />
        )}
      </div>
    </main>
  );
}

// "use client";
// import { useState } from "react";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardHeader,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import WordDisplay from "@/components/WordsDisplay";
// import FlashcardQuiz from "@/components/FlashcardQuiz";

// type Flashcard = {
//   question: string;
//   type: "yesno" | "text";
// };

// export default function HomePage() {
//   const [text, setText] = useState("");
//   const [phase, setPhase] = useState<
//     "input" | "confirm" | "countdown" | "go" | "reading" | "recap" | "quiz"
//   >("input");
//   const [countdown, setCountdown] = useState<number | null>(null);
//   const [recap, setRecap] = useState("");
//   const [quiz, setQuiz] = useState<Flashcard[]>([]);

//   const handleStart = () => setPhase("confirm");

//   const startCountdown = () => {
//     let count = 3;
//     setPhase("countdown");
//     setCountdown(count);

//     const interval = setInterval(() => {
//       playBeep();
//       count -= 1;
//       if (count > 0) {
//         setCountdown(count);
//       } else {
//         clearInterval(interval);
//         setCountdown(null);
//         setPhase("go");
//         playGo();
//         setTimeout(() => {
//           setPhase("reading");
//         }, 1000);
//       }
//     }, 1000);
//   };

//   const playBeep = () => new Audio("/beep.mp3").play();
//   const playGo = () => new Audio("/go.mp3").play();

//   return (
//     <main className="max-w-xl mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
//       {phase === "input" && (
//         <Card className="w-full">
//           <CardHeader>
//             <h2 className="text-xl font-semibold">Paste Your Text</h2>
//           </CardHeader>
//           <CardContent>
//             <Textarea
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//               placeholder="Paste your text here..."
//               className="mb-4"
//             />
//             <Button onClick={handleStart} disabled={!text.trim()}>
//               Start
//             </Button>
//           </CardContent>
//         </Card>
//       )}

//       {phase === "confirm" && (
//         <Card className="w-full text-center">
//           <CardHeader>
//             <h2 className="text-xl font-semibold">Ready to begin?</h2>
//           </CardHeader>
//           <CardContent>
//             <p className="mb-4 text-muted-foreground">
//               You will see one word at a time. Ready?
//             </p>
//             <Button onClick={startCountdown}>Yes, Let’s Go!</Button>
//           </CardContent>
//         </Card>
//       )}

//       {phase === "countdown" && (
//         <div className="text-7xl font-bold">{countdown}</div>
//       )}

//       {phase === "go" && (
//         <div className="text-6xl font-extrabold text-green-600 animate-pulse">
//           GO!
//         </div>
//       )}

//       {phase === "reading" && (
//         <WordDisplay
//           text={text}
//           setRecap={setRecap}
//           setQuiz={setQuiz}
//           onComplete={() => setPhase("recap")}
//         />
//       )}

//       {phase === "recap" && (
//         <Card className="p-4 mt-4 text-left w-full">
//           <h3 className="text-xl font-bold mb-2">📝 Summary</h3>
//           <p className="mb-4">{recap}</p>
//           <CardFooter className="justify-end">
//             <Button onClick={() => setPhase("quiz")}>Take Quiz</Button>
//           </CardFooter>
//         </Card>
//       )}

//       {phase === "quiz" && (
//         <FlashcardQuiz
//           questions={quiz}
//           onDone={() => {
//             alert("Quiz finished!");
//             setPhase("input"); // Or reset/review phase
//           }}
//         />
//       )}
//     </main>
//   );
// }
