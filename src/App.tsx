import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import CalculationSteps from "./components/traverse/CalculationSteps";
import TraverseSimulator from "./components/traverse/TraverseSimulator";

const learningStages = ["観測", "計算", "誤差確認"] as const;

function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        メインコンテンツへ移動
      </a>
      <Header />

      <div className="app-body">
        <Sidebar />

        <main className="main-content" id="main-content">
          <section className="page-heading" aria-labelledby="page-title">
            <div>
              <p className="eyebrow">多角測量 / 学習シミュレーター</p>
              <div className="page-title-row">
                <h1 id="page-title">閉合多角測量シミュレーター</h1>
                <span className="phase-badge">Phase 2</span>
              </div>
              <p className="page-description">
                まずは現場図を読み、測点・観測辺・内角の関係をつかみます。
              </p>
            </div>

            <ol className="learning-stages" aria-label="学習の流れ">
              {learningStages.map((stage, index) => (
                <li
                  className={index === 0 ? "is-active" : ""}
                  key={stage}
                >
                  <span className="stage-number">{index + 1}</span>
                  <span>{stage}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="dashboard-grid">
            <TraverseSimulator />

            <aside className="learning-panel" aria-label="学習ガイド">
              <CalculationSteps />

              <section className="focus-card card">
                <div className="card-heading">
                  <span className="card-heading-icon" aria-hidden="true">
                    i
                  </span>
                  <div>
                    <p className="card-kicker">今回のポイント</p>
                    <h2>図の読み方</h2>
                  </div>
                </div>
                <ul className="focus-list">
                  <li>北を基準に方位を捉える</li>
                  <li>測点を巡回順に確認する</li>
                  <li>距離と内角の位置を対応させる</li>
                </ul>
              </section>

              <section className="next-phase-card">
                <span className="next-phase-label">NEXT · Phase 3</span>
                <h2>測点を動かして観測する</h2>
                <p>
                  ドラッグ、観測値編集、段階計算は次のフェーズで有効になります。
                </p>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
