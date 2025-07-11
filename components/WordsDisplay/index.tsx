"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pause, Play, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";

type Flashcard = {
  question: string;
  type: "yesno" | "text";
};

export default function WordDisplay({
  text,
  onComplete,
  setRecap,
  setQuiz,
}: {
  text: string;
  onComplete: () => void;
  setRecap: (summary: string) => void;
  setQuiz: (questions: Flashcard[]) => void;
}) {
  const words = text.split(/\s+/);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [startTime] = useState(Date.now());
  const TOTAL_TIME = 120;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [hasFetched, setHasFetched] = useState(false);
  const [speed, setSpeed] = useState(400); // default: 400ms per word
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const elapsedMs = Date.now() - startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const remaining = Math.max(0, TOTAL_TIME - elapsedSeconds);
    setTimeLeft(remaining);

    // Check if reading is done — either time ran out or text is finished
    if (
      (elapsedMs >= TOTAL_TIME * 1000 || index >= words.length) &&
      !hasFetched
    ) {
      setIsPlaying(false);
      setHasFetched(true);
      setLoading(true); // Start loader

      fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
        .then((res) => res.json())
        .then((data) => {
          setRecap(data.summary);
          setQuiz(data.questions);
          onComplete();
        })
        .finally(() => setLoading(false)); // Stop loader;
    }

    // Timer interval
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const seconds = Math.floor(elapsed / 1000);
      setTimeLeft(Math.max(0, TOTAL_TIME - seconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, index, hasFetched, text, setRecap, setQuiz, onComplete]);

  useEffect(() => {
    if (!isPlaying || index >= words.length || timeLeft <= 0) return;

    const currentWord = words[index] || "";
    const adjustedSpeed =
      currentWord.length < 4 ? Math.max(100, speed * 0.5) : speed;

    const timer = setTimeout(() => {
      setIndex((i) => i + 1);
    }, adjustedSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, index, timeLeft, speed]);

  const progress = (index / words.length) * 100;
  const timeProgress = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

  return (
    <div className="animate-in fade-in-0 duration-500">
      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid" />
        </div>
      )}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-blue-500/10 p-8">
        {/* Progress and Timer */}
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Word {index + 1} of {words.length}
            </span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span
                className={`font-mono ${
                  timeLeft <= 10 ? "text-red-500 font-bold" : ""
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-1000 ${
                  timeLeft <= 10
                    ? "bg-gradient-to-r from-red-500 to-orange-500"
                    : "bg-gradient-to-r from-green-500 to-blue-500"
                }`}
                style={{ width: `${timeProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Word Display */}
        <div className="text-center mb-8">
          <div className="min-h-[120px] flex items-center justify-center">
            <div
              key={index}
              className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent animate-in fade-in-0 zoom-in-50 duration-200"
              style={{ fontFamily: "FastSans", wordBreak: "break-word" }}
            >
              {words[index] || ""}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <Button
            onClick={() => setIsPlaying((p) => !p)}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Speed Slider */}
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-blue-500/10 p-6">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Playback Speed
          </div>
          <div className="px-4 md:px-12">
            <Slider
              defaultValue={[speed]}
              min={100}
              max={1000}
              step={50}
              onValueChange={([val]) => setSpeed(val)}
              className="[&>span:first-child]:h-3 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-gray-200 [&>span:first-child]:to-gray-300 [&>span:first-child]:rounded-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-blue-500 [&_[role=slider]]:to-purple-600 [&_[role=slider]]:w-6 [&_[role=slider]]:h-6 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-blue-500 [&>span:first-child_span]:to-purple-500 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-110 [&_[role=slider]:focus-visible]:transition-transform [&_[role=slider]]:hover:scale-105 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200"
            />
            <div className="text-sm text-gray-500 mt-3 font-medium">
              {speed} ms per word
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";

// type Flashcard = {
//   question: string;
//   type: "yesno" | "text";
// };

// export default function WordDisplay({
//   text,
//   onComplete,
//   setRecap,
//   setQuiz,
// }: {
//   text: string;
//   onComplete: () => void;
//   setRecap: (summary: string) => void;
//   setQuiz: (questions: Flashcard[]) => void;
// }) {
//   const words = text.split(/\s+/);
//   const [index, setIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [startTime] = useState(Date.now());

//   useEffect(() => {
//     let timer: NodeJS.Timeout;

//     const elapsed = () => Date.now() - startTime;

//     if (isPlaying && index < words.length && elapsed() < 60000) {
//       timer = setTimeout(() => setIndex((i) => i + 1), 200);
//     }

//     if (index >= words.length || elapsed() >= 60000) {
//       setIsPlaying(false);

//       fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text }),
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           setRecap(data.summary);
//           setQuiz(data.questions);
//           onComplete();
//         });
//     }

//     return () => clearTimeout(timer);
//   }, [isPlaying, index, startTime, text, setRecap, setQuiz, onComplete]);

//   return (
//     <div className="text-center mt-8">
//       <div className="text-5xl font-semibold mb-6 h-20">{words[index]}</div>
//       <Button onClick={() => setIsPlaying((p) => !p)}>
//         {isPlaying ? "Pause" : "Play"}
//       </Button>
//     </div>
//   );
// }
