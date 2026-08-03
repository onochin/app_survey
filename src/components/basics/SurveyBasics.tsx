import { useState } from "react";
import {
  availableBasicsLessons,
  basicsLessons,
  initialBasicsLessonId,
  type AvailableBasicsLessonId,
} from "./basicsCourse";
import {
  evaluateBasicsQuizAnswer,
  getBasicsQuizQuestionsForLesson,
} from "./data/quizData";
import BasicsQuizPanel, {
  type BasicsQuizAnswerStateMap,
} from "./ui/BasicsQuizPanel";
import LessonFooter from "./ui/LessonFooter";
import LessonHeader from "./ui/LessonHeader";
import LessonNavigation from "./ui/LessonNavigation";
import type { BasicsLessonComponentProps } from "./types";

function SurveyBasics({ onOpenTraverse }: BasicsLessonComponentProps) {
  const [activeLessonId, setActiveLessonId] =
    useState<AvailableBasicsLessonId>(initialBasicsLessonId);
  const [completedLessonIds, setCompletedLessonIds] = useState<
    readonly AvailableBasicsLessonId[]
  >([]);
  const [quizAnswerStates, setQuizAnswerStates] =
    useState<BasicsQuizAnswerStateMap>({});
  const activeLessonData =
    availableBasicsLessons.find(
      (lesson) => lesson.id === activeLessonId,
    ) ?? basicsLessons[0];
  const ActiveLessonComponent = activeLessonData.component;
  const activeQuizQuestions = getBasicsQuizQuestionsForLesson(
    activeLessonData.id,
  );
  const progress =
    (completedLessonIds.length / availableBasicsLessons.length) * 100;
  const nextLesson = activeLessonData.nextLessonId
    ? availableBasicsLessons.find(
        (lesson) => lesson.id === activeLessonData.nextLessonId,
      )
    : undefined;
  const isLastLesson = nextLesson === undefined;

  const completeLesson = (): void => {
    setCompletedLessonIds((current) =>
      current.includes(activeLessonId)
        ? current
        : [...current, activeLessonId],
    );

    setActiveLessonId(nextLesson?.id ?? initialBasicsLessonId);
  };

  const selectQuizOption = (
    questionId: string,
    optionId: string,
  ): void => {
    setQuizAnswerStates((current) => ({
      ...current,
      [questionId]: {
        selectedOptionId: optionId,
        isAnswered: false,
        isCorrect: null,
        isExplanationVisible: false,
      },
    }));
  };

  const submitQuizAnswer = (questionId: string): void => {
    setQuizAnswerStates((current) => {
      const answerState = current[questionId];

      if (!answerState?.selectedOptionId) {
        return current;
      }

      const evaluation = evaluateBasicsQuizAnswer(
        questionId,
        answerState.selectedOptionId,
      );

      if (!evaluation) {
        return current;
      }

      return {
        ...current,
        [questionId]: {
          ...answerState,
          isAnswered: true,
          isCorrect: evaluation.isCorrect,
          isExplanationVisible: true,
        },
      };
    });
  };

  return (
    <div className="basics-page">
      <section className="basics-hero" aria-labelledby="basics-page-title">
        <div className="basics-hero-copy">
          <span className="basics-eyebrow">
            <span aria-hidden="true">はじめの一歩</span>
            BEGINNER COURSE
          </span>
          <h1 id="basics-page-title">
            測量は、<em>点と点の関係</em>を
            <br />
            数字で表すこと。
          </h1>
          <p>
            専門用語を暗記する前に、図を動かして「何を測っているのか」を
            つかみましょう。4つのミニラボで、測量の共通言語を学びます。
          </p>
          <div className="basics-hero-meta" aria-label="教材の概要">
            <span>
              <strong>11</strong>
              基本キーワード
            </span>
            <span>
              <strong>4</strong>
              ミニラボ
            </span>
            <span>
              <strong>約15</strong>
              分
            </span>
          </div>
        </div>

        <div className="basics-hero-illustration" aria-hidden="true">
          <svg viewBox="0 0 440 270">
            <defs>
              <linearGradient id="hero-ground" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#e7f2ff" />
                <stop offset="100%" stopColor="#edf8ef" />
              </linearGradient>
              <filter id="hero-shadow" height="160%" width="160%" x="-30%" y="-30%">
                <feDropShadow
                  dx="0"
                  dy="7"
                  floodColor="#073b72"
                  floodOpacity=".16"
                  stdDeviation="7"
                />
              </filter>
            </defs>
            <path
              className="hero-contour"
              d="M20 197c58-40 97 12 151-25s88-12 126-46 81-20 123 2M9 224c65-38 102 9 160-19s96-10 135-45 75-18 125 4M44 165c41-28 74 0 116-24s83-9 121-37 80-23 132 8"
            />
            <path
              className="hero-ground-plane"
              d="m58 184 185-105 146 71-189 109Z"
              fill="url(#hero-ground)"
            />
            <path className="hero-grid-lines" d="m96 163 146 71M137 139l146 71M178 116l146 71M219 93l146 71M105 211 291 106M151 234 337 129" />
            <path className="hero-measure-line" d="M120 191 323 150" />
            <g className="hero-known-point" transform="translate(120 191)">
              <circle r="15" />
              <circle r="5" />
              <text x="-11" y="-24">
                A
              </text>
            </g>
            <g className="hero-new-point" transform="translate(323 150)">
              <circle r="15" />
              <circle r="5" />
              <text x="-10" y="-24">
                P1
              </text>
            </g>
            <g
              className="hero-total-station"
              filter="url(#hero-shadow)"
              transform="translate(208 91)"
            >
              <path d="M0 50v22M0 68l-28 60M0 68l30 60M0 68v60" />
              <path d="M-28 128h9M21 128h18M-6 128H7" />
              <rect height="32" rx="7" width="64" x="-32" y="18" />
              <circle cx="26" cy="34" r="14" />
              <circle cx="26" cy="34" r="6" />
              <path d="M-20 18V4h43v14" />
            </g>
            <g className="hero-north" transform="translate(375 48)">
              <text x="0" y="-12">
                N
              </text>
              <path d="M0 45V0m0 0-8 16L0 12 8 16Z" />
            </g>
            <g className="hero-distance-pill" transform="translate(227 169)">
              <rect height="28" rx="14" width="96" x="-48" y="-14" />
              <text y="5">
                42.68 m
              </text>
            </g>
          </svg>
        </div>
      </section>

      <section className="basics-course-progress" aria-label="基礎教材の進捗">
        <div>
          <span>コース進捗</span>
          <strong>
            {completedLessonIds.length} / {availableBasicsLessons.length} 章
          </strong>
        </div>
        <div
          aria-label={`基礎教材の進捗 ${Math.round(progress)}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="basics-progress-track"
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>好きな章から始められます</p>
      </section>

      <LessonNavigation
        activeLessonId={activeLessonId}
        completedLessonIds={completedLessonIds}
        lessons={basicsLessons}
        onSelectLesson={setActiveLessonId}
      />

      <section
        aria-labelledby="active-lesson-title"
        className="basics-lesson-shell"
      >
        <LessonHeader lesson={activeLessonData} />

        <div className="basics-lesson-content">
          <ActiveLessonComponent onOpenTraverse={onOpenTraverse} />
        </div>

        <BasicsQuizPanel
          answerStates={quizAnswerStates}
          lessonId={activeLessonData.id}
          onSelectOption={selectQuizOption}
          onSubmitAnswer={submitQuizAnswer}
          questions={activeQuizQuestions}
        />

        <LessonFooter
          isLastLesson={isLastLesson}
          onCompleteLesson={completeLesson}
        />
      </section>

      <p className="basics-course-note">
        本教材の数値と図は学習用の例です。実務の成果作成や精度判定には使用しないでください。
      </p>
    </div>
  );
}

export default SurveyBasics;
