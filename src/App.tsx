import { useState } from "react";
import SurveyBasics from "./components/basics/SurveyBasics";
import SurveyGnss from "./components/gnss/SurveyGnss";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import type { LearningSection } from "./components/layout/Sidebar";
import TraverseWorkspace from "./components/traverse/TraverseWorkspace";

function App() {
  const [activeSection, setActiveSection] =
    useState<LearningSection>("traverse");

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        メインコンテンツへ移動
      </a>
      <Header />

      <div className="app-body">
        <Sidebar
          activeSection={activeSection}
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
            <SurveyBasics onOpenTraverse={() => setActiveSection("traverse")} />
          </section>
          <section hidden={activeSection !== "gnss"}>
            <SurveyGnss />
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
