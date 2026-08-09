import { useState } from "react";
import SurveyBasics from "./components/basics/SurveyBasics";
import {
  initialBasicsLessonId,
  type AvailableBasicsLessonId,
} from "./components/basics/basicsCourse";
import SurveyGnss from "./components/gnss/SurveyGnss";
import { gnssLessons } from "./components/gnss/gnssCourse";
import type { GnssLessonId } from "./components/gnss/types";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import type { LearningSection } from "./components/layout/Sidebar";
import TraverseWorkspace from "./components/traverse/TraverseWorkspace";

function App() {
  const [activeSection, setActiveSection] =
    useState<LearningSection>("traverse");
  const [activeBasicsLessonId, setActiveBasicsLessonId] =
    useState<AvailableBasicsLessonId>(initialBasicsLessonId);
  const [activeGnssLessonId, setActiveGnssLessonId] =
    useState<GnssLessonId>(gnssLessons[0].id);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        メインコンテンツへ移動
      </a>
      <Header />

      <div className="app-body">
        <Sidebar
          activeBasicsLessonId={activeBasicsLessonId}
          activeGnssLessonId={activeGnssLessonId}
          activeSection={activeSection}
          onBasicsLessonChange={setActiveBasicsLessonId}
          onGnssLessonChange={setActiveGnssLessonId}
          onSectionChange={setActiveSection}
        />

        <main className="main-content" id="main-content">
          <nav
            aria-label="教材の切り替え"
            className="mobile-section-navigation"
          >
            <button
              aria-current={activeSection === "basics" ? "page" : undefined}
              className={activeSection === "basics" ? "is-selected" : ""}
              onClick={() => setActiveSection("basics")}
              type="button"
            >
              測量の基礎
            </button>
            <button
              aria-current={activeSection === "gnss" ? "page" : undefined}
              className={activeSection === "gnss" ? "is-selected" : ""}
              onClick={() => setActiveSection("gnss")}
              type="button"
            >
              GNSS / Drogger
            </button>
            <button
              aria-current={activeSection === "traverse" ? "page" : undefined}
              className={activeSection === "traverse" ? "is-selected" : ""}
              onClick={() => setActiveSection("traverse")}
              type="button"
            >
              多角測量
            </button>
          </nav>
          <section hidden={activeSection !== "basics"}>
            <SurveyBasics
              activeLessonId={activeBasicsLessonId}
              onActiveLessonChange={setActiveBasicsLessonId}
              onOpenTraverse={() => setActiveSection("traverse")}
            />
          </section>
          <section hidden={activeSection !== "gnss"}>
            <SurveyGnss
              activeLessonId={activeGnssLessonId}
              onActiveLessonChange={setActiveGnssLessonId}
            />
          </section>
          <section hidden={activeSection !== "traverse"}>
            <TraverseWorkspace />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
