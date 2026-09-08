"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, ChevronUp, Sparkles, X } from "lucide-react";
import type { Lesson, Topic } from "@/lib/content";
import { CodeBlock } from "./CodeBlock";
import { GlossaryText } from "./GlossaryText";
import { CardToolButton } from "@/components/tools/CardToolButton";
import { quizForLesson } from "@/lib/quizzes";
import { relevantGear } from "@/lib/inventory";
import { useApp, XP_PER_CARD, XP_PER_LESSON, XP_PER_QUIZ } from "@/lib/store";
import {
  playBack,
  playComplete,
  playCorrect,
  playIncorrect,
  playTap,
} from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface FloatingXp {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export function LessonView({ lesson, topic }: { lesson: Lesson; topic: Topic }) {
  const readCard = useApp((s) => s.readCard);
  const completeLesson = useApp((s) => s.completeLesson);
  const answerQuiz = useApp((s) => s.answerQuiz);
  const inventory = useApp((s) => s.inventory);
  // Frozen at mount: re-reading an already-finished lesson gives no XP.
  const [wasCompletedBefore] = useState(() =>
    useApp.getState().completedLessons.includes(lesson.id)
  );

  const quiz = quizForLesson(lesson.id);
  const storedAnswer = useApp((s) =>
    quiz ? s.quizAnswers[quiz.id] : undefined
  );
  // Whether this quiz was already answered before this lesson was opened.
  const [answeredBefore] = useState(() =>
    quiz ? Boolean(useApp.getState().quizAnswers[quiz.id]) : false
  );

  // index 0 = cover; 1..cards.length = content cards; then the quiz beat.
  const quizStep = quiz ? lesson.cards.length + 1 : -1;
  const totalSteps = lesson.cards.length + 1 + (quiz ? 1 : 0);

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [finished, setFinished] = useState(false);
  const maxSeen = useRef(0);
  const [floats, setFloats] = useState<FloatingXp[]>([]);
  const floatId = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);

  const gear = relevantGear(lesson.id, inventory);

  const spawnFloat = useCallback((x: number, y: number, amount: number) => {
    const id = ++floatId.current;
    setFloats((f) => [...f, { id, x, y, amount }]);
    setTimeout(() => setFloats((f) => f.filter((fl) => fl.id !== id)), 1000);
  }, []);

  const finish = useCallback(() => {
    setFinished(true);
    playComplete();
    if (!wasCompletedBefore) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.7 },
        disableForReducedMotion: true,
      });
    }
    completeLesson(lesson.id);
  }, [wasCompletedBefore, completeLesson, lesson.id]);

  const advance = (e: React.MouseEvent<HTMLElement>) => {
    if (finished) return;
    const next = index + 1;
    if (next < totalSteps) {
      playTap();
      setDirection(1);
      setIndex(next);
      // Award XP the first time each *content* card is revealed
      // (the quiz beat has its own reward).
      if (next > maxSeen.current) {
        maxSeen.current = next;
        if (!wasCompletedBefore && next <= lesson.cards.length) {
          readCard();
          const rect = sectionRef.current?.getBoundingClientRect();
          spawnFloat(
            e.clientX - (rect?.left ?? 0),
            e.clientY - (rect?.top ?? 0),
            XP_PER_CARD
          );
        }
      }
    } else {
      finish();
    }
  };

  const goBack = () => {
    if (finished) {
      setFinished(false);
      playBack();
      return;
    }
    if (index > 0) {
      playBack();
      setDirection(-1);
      setIndex(index - 1);
    }
  };

  const selectQuizOption = (e: React.MouseEvent<HTMLElement>, choice: number) => {
    if (!quiz || storedAnswer) return;
    const correct = answerQuiz(quiz, choice);
    if (correct) {
      playCorrect();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#34d399", "#a7f3d0", "#fbbf24"],
        disableForReducedMotion: true,
      });
      const rect = sectionRef.current?.getBoundingClientRect();
      spawnFloat(
        e.clientX - (rect?.left ?? 0),
        e.clientY - (rect?.top ?? 0),
        XP_PER_QUIZ
      );
    } else {
      playIncorrect();
    }
  };

  const card = index > 0 && index <= lesson.cards.length ? lesson.cards[index - 1] : null;
  const onQuizStep = quiz !== undefined && index === quizStep;

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative h-full w-full snap-start overflow-hidden bg-gradient-to-br",
        topic.gradient
      )}
    >
      {/* dark veil so text pops over the gradient */}
      <div className="absolute inset-0 bg-black/55" />

      {/* story-style progress segments */}
      <div className="absolute top-0 inset-x-0 z-20 flex gap-1 px-3 pt-14">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={false}
              animate={{ width: finished || i < index ? "100%" : i === index ? "100%" : "0%" }}
              transition={{ duration: 0.25 }}
              style={{ opacity: finished || i <= index ? 1 : 0 }}
            />
          </div>
        ))}
      </div>

      {/* topic tag */}
      <div className="absolute top-[4.6rem] left-4 z-20 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
        <span>{topic.emoji}</span>
        <span>{topic.name}</span>
        {wasCompletedBefore && !finished && (
          <span className="flex items-center gap-1 text-emerald-300">
            <Check className="size-3" /> done
          </span>
        )}
      </div>

      {/* tap zones — hidden during the quiz beat so options are tappable */}
      {!finished && !onQuizStep && (
        <>
          <button
            aria-label="Previous card"
            className="absolute inset-y-0 left-0 z-10 w-[32%]"
            onClick={goBack}
          />
          <button
            aria-label="Next card"
            className="absolute inset-y-0 right-0 z-10 w-[68%]"
            onClick={advance}
          />
        </>
      )}

      {/* card content — above the tap zones but transparent to taps, so
          inline accessories (glossary terms, tool buttons, quiz options)
          can opt back in with pointer-events-auto */}
      <div className="pointer-events-none relative z-20 flex h-full flex-col justify-center px-6 pb-24 pt-28">
        <AnimatePresence mode="popLayout" custom={direction}>
          {finished ? (
            <motion.div
              key="done"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                className="flex size-24 items-center justify-center rounded-full bg-white/15 backdrop-blur"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              >
                <Check className="size-12 text-emerald-300" strokeWidth={3} />
              </motion.div>
              <h2 className="text-2xl font-extrabold">Lesson complete!</h2>
              {!wasCompletedBefore ? (
                <p className="flex items-center gap-1.5 text-lg font-bold text-amber-300">
                  <Sparkles className="size-5" /> +{XP_PER_LESSON} XP
                </p>
              ) : (
                <p className="text-sm text-white/70">
                  Repetition builds mastery. Nice refresher.
                </p>
              )}
              <motion.p
                className="mt-6 flex items-center gap-1 text-sm text-white/80"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              >
                <ChevronUp className="size-4" /> swipe up for the next one
              </motion.p>
            </motion.div>
          ) : index === 0 ? (
            <motion.div
              key="cover"
              custom={direction}
              initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="flex flex-col gap-4"
            >
              <span className="text-5xl">{topic.emoji}</span>
              <h1 className="text-[2rem] font-extrabold leading-tight">
                {lesson.title}
              </h1>
              <p className="text-lg text-white/85">{lesson.hook}</p>
              {gear.length > 0 && (
                <p className="flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                  ⚙️ Picked for your lab · {gear.map((g) => g.name).join(", ")}
                </p>
              )}
              <p className="mt-4 text-sm font-medium text-white/60">
                {lesson.cards.length} quick cards
                {quiz ? " + 1 quick question" : ""} · tap to start ➜
              </p>
            </motion.div>
          ) : onQuizStep && quiz ? (
            <motion.div
              key="quiz"
              custom={direction}
              initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="pointer-events-auto relative z-20 flex flex-col gap-3"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                ⚡ Quick check
              </p>
              <h2 className="text-xl font-extrabold leading-snug">
                {quiz.prompt}
              </h2>
              {answeredBefore && (
                <p className="text-xs font-semibold text-white/60">
                  You already answered this one — here&apos;s a recap.
                </p>
              )}
              <div className="mt-1 flex flex-col gap-2">
                {quiz.options.map((option, i) => {
                  const isCorrect = i === quiz.correctIndex;
                  const isChosen = storedAnswer?.choice === i;
                  return (
                    <button
                      key={i}
                      disabled={Boolean(storedAnswer)}
                      onClick={(e) => selectQuizOption(e, i)}
                      className={cn(
                        "rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold leading-snug transition-colors",
                        !storedAnswer &&
                          "border-white/25 bg-white/10 backdrop-blur-sm active:bg-white/25",
                        storedAnswer && isCorrect &&
                          "border-emerald-300 bg-emerald-400/25 text-emerald-100",
                        storedAnswer && isChosen && !isCorrect &&
                          "border-rose-300 bg-rose-400/25 text-rose-100",
                        storedAnswer && !isChosen && !isCorrect &&
                          "border-white/10 bg-white/5 text-white/50"
                      )}
                    >
                      <span className="flex items-start gap-2">
                        {storedAnswer && isCorrect && (
                          <Check className="mt-0.5 size-4 shrink-0" strokeWidth={3} />
                        )}
                        {storedAnswer && isChosen && !isCorrect && (
                          <X className="mt-0.5 size-4 shrink-0" strokeWidth={3} />
                        )}
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {storedAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="rounded-2xl bg-black/40 p-4 text-sm leading-relaxed text-white/85 backdrop-blur-sm">
                      <p className="mb-1 font-bold">
                        {storedAnswer.correct
                          ? answeredBefore
                            ? "You got this right. 🎉"
                            : `Nailed it! +${XP_PER_QUIZ} XP`
                          : "Not quite — but now you know:"}
                      </p>
                      {quiz.explanation}
                    </div>
                    <button
                      onClick={finish}
                      className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-black active:scale-95 transition-transform"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {!storedAnswer && (
                <button
                  onClick={finish}
                  className="mx-auto mt-1 text-xs font-semibold text-white/50 underline-offset-2 hover:underline"
                >
                  skip for now
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={index}
              custom={direction}
              initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="flex flex-col gap-4"
            >
              {card?.heading && (
                <h2 className="text-2xl font-extrabold leading-snug">
                  {card.heading}
                </h2>
              )}
              {card && (
                <GlossaryText
                  text={card.body}
                  className="text-lg leading-relaxed text-white/90"
                />
              )}
              {card?.code && <CodeBlock code={card.code} />}
              {card?.tool && <CardToolButton toolId={card.tool} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* card counter + tap hint */}
      {!finished && !onQuizStep && (
        <div className="absolute bottom-20 inset-x-0 z-0 flex items-center justify-between px-6 text-xs font-medium text-white/50">
          <span>{index > 0 ? "◂ tap left to go back" : ""}</span>
          <span>
            {index + 1} / {totalSteps}
          </span>
        </div>
      )}

      {/* floating XP indicators */}
      {floats.map((f) => (
        <span
          key={f.id}
          className="animate-float-up pointer-events-none absolute z-30 text-base font-extrabold text-amber-300 drop-shadow"
          style={{ left: f.x - 24, top: f.y - 30 }}
        >
          +{f.amount} XP
        </span>
      ))}
    </section>
  );
}
