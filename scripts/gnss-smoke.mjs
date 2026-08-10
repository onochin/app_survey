import { chromium } from "playwright";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function hasVisibleKeyboardFocus(locator) {
  return locator.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const hasOutline =
      style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0;
    const hasShadow = style.boxShadow !== "none";

    return element.matches(":focus-visible") && (hasOutline || hasShadow);
  });
}

async function getPageMetrics(page) {
  return page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
}

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173/";
const baseOrigin = new URL(baseUrl).origin;
const saveScreenshots = process.env.GNSS_SCREENSHOTS === "1";
const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const pageErrors = [];
const externalApiRequests = [];
let page;

try {
  page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(10_000);
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => {
    const requestUrl = new URL(request.url());

    if (
      (requestUrl.protocol === "http:" || requestUrl.protocol === "https:") &&
      requestUrl.origin !== baseOrigin
    ) {
      externalApiRequests.push(request.url());
    }
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  assert(
    await page
      .getByRole("heading", {
        name: "閉合トラバース測量シミュレーター",
      })
      .isVisible(),
    "既存の初期表示が閉合トラバースではありません。",
  );

  const sidebar = page.locator(".sidebar");
  const basicsSidebarButton = sidebar.getByRole("button", {
    name: "測量の基礎",
    exact: true,
  });
  const gnssSidebarButton = sidebar.getByRole("button", {
    name: "GNSS / Drogger",
    exact: true,
  });

  assert(
    (await basicsSidebarButton.getAttribute("aria-expanded")) === "false" &&
      (await gnssSidebarButton.getAttribute("aria-expanded")) === "false",
    "初期表示で章サブメニューが閉じていません。",
  );

  await basicsSidebarButton.click();
  assert(
    await page
      .getByRole("heading", { name: /測量は、.*点と点の関係/ })
      .isVisible(),
    "測量の基礎を開けません。",
  );
  const basicsSidebarLessons = sidebar.locator("#sidebar-basics-lessons");
  assert(
    (await basicsSidebarButton.getAttribute("aria-expanded")) === "true" &&
      (await basicsSidebarLessons.getByRole("button").count()) === 9,
    "測量の基礎の左サブメニューに9章が表示されません。",
  );
  await basicsSidebarLessons
    .locator('[data-sidebar-lesson-id="distance-and-direction"]')
    .click();
  assert(
    await page
      .getByRole("heading", {
        name: "座標・標高・高さの基準",
        exact: true,
      })
      .isVisible(),
    "測量の基礎の左サブメニューから第2章を開けません。",
  );
  await basicsSidebarLessons
    .locator('[data-sidebar-lesson-id="point-and-position"]')
    .click();

  await gnssSidebarButton.click();
  assert(
    (await page.getByRole("heading", { name: "GNSS測量", exact: true }).isVisible()) &&
      (await page
        .getByRole("heading", { name: "GNSS測量の全体像", exact: true })
        .isVisible()),
    "GNSS教材または第1章を開けません。",
  );
  const gnssSidebarLessons = sidebar.locator("#sidebar-gnss-lessons");
  assert(
    (await gnssSidebarButton.getAttribute("aria-expanded")) === "true" &&
      (await gnssSidebarLessons.getByRole("button").count()) === 5 &&
      !(await sidebar.locator("#sidebar-basics-lessons").isVisible()),
    "GNSS / Droggerの左サブメニュー5章または教材ごとの開閉が正しくありません。",
  );
  await gnssSidebarLessons
    .locator('[data-sidebar-lesson-id="gnss-observations"]')
    .click();
  assert(
    await page
      .getByRole("heading", {
        name: "GNSSは何を観測しているのか",
        exact: true,
      })
      .isVisible(),
    "GNSSの左サブメニューから第2章を開けません。",
  );
  await gnssSidebarLessons
    .locator('[data-sidebar-lesson-id="gnss-overview"]')
    .click();
  assert(
    (await page.locator('[data-lesson-id="gnss-overview"]').count()) === 1,
    "安定した章ID gnss-overview が画面へ反映されていません。",
  );
  const overviewLesson = page.locator('[data-lesson-id="gnss-overview"]');
  const lessonNavigation = page.locator(".gnss-lesson-navigation");
  assert(
    (await lessonNavigation.getByRole("button").count()) === 5,
    "GNSS教材の利用可能な章が5章ではありません。",
  );

  const storageKeysBeforeGnssOperations = await page.evaluate(() =>
    Object.keys(window.localStorage).sort(),
  );
  assert(
    storageKeysBeforeGnssOperations.every(
      (storageKey) => !storageKey.toLowerCase().includes("gnss"),
    ),
    "GNSS教材用localStorageキーが追加されています。",
  );

  const understoodButton = overviewLesson.getByRole("button", {
    name: "この章を理解できた",
  });
  assert(
    await overviewLesson.getByText("0 / 5 章", { exact: true }).isVisible(),
    "GNSS教材の初期進捗が0 / 5章ではありません。",
  );
  await understoodButton.click();
  assert(
    await overviewLesson.getByText("1 / 5 章", { exact: true }).isVisible(),
    "GNSS第1章の理解済み進捗が1 / 5章になりません。",
  );

  const representativeCaseCard = page.getByTestId("gnss-purpose-card");
  const representativeCaseText = await representativeCaseCard.textContent();
  assert(
    (await representativeCaseCard.getByRole("button").count()) === 0 &&
      (await representativeCaseCard
        .getByText("一般の調査・測量", { exact: true })
        .isVisible()) &&
      (await representativeCaseCard.getByText("P1", { exact: true }).isVisible()) &&
      (await representativeCaseCard
        .getByText("平面位置 ＋ 高さ", { exact: true })
        .isVisible()) &&
      ["電探", "オーリス", "深浅測量", "ドローン"].every((example) =>
        representativeCaseText?.includes(example),
      ),
    "一般の調査・測量の代表ケース、P1、成果、実務例が表示されません。",
  );

  const workflowCard = page.getByTestId("gnss-workflow-card");
  const workflowButtons = workflowCard.locator(".gnss-workflow-selector button");
  assert(
    (await workflowButtons.count()) === 9,
    "GNSS現場フローが9工程ではありません。",
  );
  await workflowButtons.nth(0).focus();
  await page.keyboard.press("Tab");
  assert(
    await hasVisibleKeyboardFocus(workflowButtons.nth(1)),
    "GNSS工程ボタンのキーボードフォーカスが視認できません。",
  );
  await page.keyboard.press("Enter");
  assert(
    (await workflowButtons.nth(1).getAttribute("aria-current")) === "step",
    "GNSS工程をキーボードで切り替えられません。",
  );
  for (let index = 0; index < 9; index += 1) {
    await workflowButtons.nth(index).click();
    assert(
      (await workflowButtons.nth(index).getAttribute("aria-current")) === "step",
      `GNSS現場フロー${index + 1}を選択できません。`,
    );
  }
  assert(
    (await workflowCard.getByText("成果確認", { exact: true }).count()) >= 1 &&
      (await workflowCard.getByText("成果整理と現場判断", { exact: true }).isVisible()),
    "第9工程の詳細が表示されません。",
  );

  assert(
    (await page
      .getByRole("img", {
        name: "GNSS衛星、既知点A、基準局、移動局、新点P1の仮想現場図",
      })
      .isVisible()) &&
      (await overviewLesson
        .getByText("DG-RPO1RWS + u-blox ANN-MB-00", { exact: true })
        .isVisible()),
    "仮想現場図またはPパッケージ実機例が表示されません。",
  );

  const informationCard = page.getByTestId("gnss-information-card");
  for (let index = 1; index < 7; index += 1) {
    await informationCard.getByRole("button", { name: "次へ", exact: true }).click();
  }
  const informationDetailText = await informationCard
    .locator(".gnss-information-detail")
    .textContent();
  const informationMessageText = await informationCard
    .locator(".gnss-important-message")
    .textContent();
  assert(
    (await informationCard.locator(".gnss-information-detail").getByText("P1の位置", { exact: true }).isVisible()) &&
      (informationMessageText?.includes("完成したX・Y座標") ?? false),
    `情報フローをP1の位置まで進められないか、重要メッセージがありません。detail=${informationDetailText ?? "なし"} message=${informationMessageText ?? "なし"}`,
  );
  await informationCard.getByRole("button", { name: "戻る", exact: true }).click();
  await informationCard.getByRole("button", { name: "次へ", exact: true }).click();

  const methodSelector = page.getByTestId("gnss-method-selector");
  const expectedMethodDetails = [
    ["自前基準局RTK", "既知点AのPパッケージ基準局", "基準局A → 移動局（基準局側の情報）"],
    ["ネットワーク型RTK", "ネットワーク型RTK配信サービス", "配信サービス → インターネット → 移動局"],
    ["CLAS", "みちびき（準天頂衛星）", "みちびき → 衛星経由 → 移動局"],
  ];
  for (const [methodName, source, path] of expectedMethodDetails) {
    await methodSelector.getByRole("button", { name: methodName, exact: true }).click();
    assert(
      (await page.getByText(source, { exact: true }).isVisible()) &&
        (await page.getByText(path, { exact: true }).isVisible()),
      `${methodName}の情報源または経路が仮想現場図へ反映されません。`,
    );
  }
  assert(
    await page.getByText(/3方式は同じ仕組みではありません/).isVisible(),
    "3方式を同一視しない注意が表示されません。",
  );

  const observationCard = page.getByTestId("gnss-observation-card");
  await observationCard
    .getByRole("button", { name: "FLOATへ進める", exact: true })
    .click();
  await observationCard
    .getByRole("button", { name: "FIXへ進める", exact: true })
    .click();
  const p1Result = page.getByTestId("gnss-p1-result");
  assert(
    (await p1Result.isVisible()) &&
      (await p1Result.getByText("1012.345 m", { exact: true }).isVisible()) &&
      (await p1Result.getByText("1008.765 m", { exact: true }).isVisible()) &&
      (await p1Result.getByText("49.832 m", { exact: true }).isVisible()) &&
      (await p1Result.getByText("一般の調査・測量点", { exact: true }).isVisible()),
    "FIX後のP1固定成果または用途が表示されません。",
  );

  const qualityCard = page.getByTestId("gnss-quality-card");
  const qualityInputs = qualityCard.locator(".gnss-quality-grid input");
  assert(
    (await qualityInputs.count()) === 8,
    "FIX後の品質管理項目が8件ではありません。",
  );
  for (let index = 0; index < 8; index += 1) {
    await qualityInputs.nth(index).check();
  }
  assert(
    (await qualityCard.getByText("P1の成果を使用する準備ができました", { exact: true }).isVisible()) &&
      (await qualityCard.getByText(/FIXしていることと、成果が正しいことは同じではありません/).isVisible()),
    "品質管理完了または中心メッセージが表示されません。",
  );

  const questionOne = page.getByTestId(
    "gnss-quiz-question-gnss-q01-base-coordinate",
  );
  await questionOne.getByLabel(/FIXなので基準局座標の誤り/).check();
  await questionOne
    .getByRole("button", { name: "回答を確認する" })
    .click();
  const questionOneFeedback = questionOne.locator(".gnss-quiz-feedback");
  assert(
    (await questionOneFeedback.getByText("不正解", { exact: true }).isVisible()) &&
      (await questionOneFeedback.getByText("正解：B", { exact: true }).isVisible()) &&
      (await questionOneFeedback
        .getByRole("heading", { name: "Aを選んだ場合の解説", exact: true })
        .isVisible()) &&
      (await questionOneFeedback
        .getByText(/絶対座標が正しいことまでは確認しません/)
        .isVisible()) &&
      (await questionOneFeedback
        .getByRole("heading", { name: "解説", exact: true })
        .isVisible()) &&
      (await questionOneFeedback
        .getByText(/FIXは基準局へ入力した絶対座標の正しさを保証しない/)
        .isVisible()) &&
      (await questionOneFeedback.locator("dl").count()) === 0 &&
      !(await questionOneFeedback.innerText()).includes("正答"),
    "問1の不正解状態、正解文字、誤答固有理由、正解の解説が正しく表示されません。",
  );
  await questionOne.getByLabel(/相対関係を高精度に求めても/).check();
  await questionOne
    .getByRole("button", { name: "回答を確認する" })
    .click();
  assert(
    (await questionOneFeedback.getByText("正解", { exact: true }).isVisible()) &&
      (await questionOneFeedback.getByText("正解：B", { exact: true }).isVisible()) &&
      (await questionOneFeedback.locator(".gnss-quiz-selected-explanation").count()) === 0 &&
      (await questionOneFeedback
        .getByText(/FIXは基準局へ入力した絶対座標の正しさを保証しない/)
        .isVisible()) &&
      !(await questionOneFeedback.innerText()).includes("正答"),
    "問1の正解状態、正解文字、重複のない解説を表示できません。",
  );

  const questionTwo = page.getByTestId("gnss-quiz-question-gnss-q02-fix-quality");
  await questionTwo.getByLabel(/基準局座標、基準局・移動局のアンテナ高/).check();
  await questionTwo
    .getByRole("button", { name: "回答を確認する" })
    .click();
  assert(
    (await questionTwo.getByText("正解", { exact: true }).isVisible()) &&
      (await questionTwo.getByText("正解：C", { exact: true }).isVisible()) &&
      (await questionTwo.getByText(/FIXは重要な測位状態だが/).isVisible()),
    "問2の正解文字と解説が表示されません。",
  );

  const questionThree = page.getByTestId("gnss-quiz-question-gnss-q03-field-method");
  await questionThree.getByLabel(/CLAS対応受信機による測位を候補/).check();
  await questionThree
    .getByRole("button", { name: "回答を確認する" })
    .click();
  assert(
    (await questionThree.getByText("正解", { exact: true }).isVisible()) &&
      (await questionThree.getByText("正解：B", { exact: true }).isVisible()) &&
      (await questionThree.getByText(/携帯通信に依存しない高精度GNSS測位/).isVisible()),
    "問3の正解文字と解説が表示されません。",
  );

  const chapterTwoNavigationButton = lessonNavigation.getByRole("button", {
    name: /第2章.*GNSSは何を観測しているのか/,
  });
  await chapterTwoNavigationButton.click();
  const observationsLesson = page.locator(
    '[data-lesson-id="gnss-observations"]',
  );
  assert(
    (await observationsLesson.isVisible()) &&
      (await observationsLesson
        .getByRole("heading", {
          name: "GNSSは何を観測しているのか",
          exact: true,
        })
        .isVisible()) &&
      (await observationsLesson
        .getByText(/衛星から自分の座標そのものを受け取っているわけではない/)
        .isVisible()),
    "GNSS第2章または最重要メッセージを表示できません。",
  );
  assert(
    (await observationsLesson.locator(".gnss-card").count()) === 9,
    "GNSS第2章が9カードではありません。",
  );

  const signalCard = page.getByTestId("gnss-observations-signal-card");
  const signalCardText = await signalCard.innerText();
  assert(
    [
      "測位用の信号を継続的に送信",
      "受信した信号を観測して位置を計算",
      "GNSS衛星は、受信機から「電波を送ってください」という合図を受けて応答しているわけではありません。",
      "一般のGNSS測位では、衛星から受信機への一方向の測位信号を受信機が利用します。",
      "返事が戻るまでの往復時間を測っているのではありません",
      "送信時刻と、受信機が受け取った時刻の関係",
    ].every((expectedText) => signalCardText.includes(expectedText)),
    "カード2の衛星から受信機への一方向通信または非往復時間の説明が不足しています。",
  );

  const observationsUnderstoodButton = observationsLesson.getByRole("button", {
    name: "この章を理解できた",
  });
  await observationsUnderstoodButton.click();
  assert(
    await observationsLesson.getByText("2 / 5 章", { exact: true }).isVisible(),
    "GNSS第2章の理解済み操作で進捗が2 / 5章になりません。",
  );

  const travelTimeCard = page.getByTestId("gnss-observations-travel-time-card");
  const travelTimeSlider = travelTimeCard.getByTestId(
    "gnss-travel-time-slider",
  );
  assert(
    (await travelTimeSlider.inputValue()) === "70" &&
      (await travelTimeCard.getByText(/≈ 21,000 km/).isVisible()) &&
      (await travelTimeCard.getByText(/1 msの違い ≈ 300 km/).isVisible()) &&
      (await travelTimeCard.getByText(/1 μs.*約300 m/).isVisible()),
    "70ms、1ms、1μsの初期換算表示が正しくありません。",
  );
  await travelTimeSlider.fill("85");
  assert(
    await travelTimeCard.getByText(/≈ 25,500 km/).isVisible(),
    "到達時間85msが約25,500kmへ反映されません。",
  );

  const pseudorangeCard = page.getByTestId(
    "gnss-observations-pseudorange-card",
  );
  await pseudorangeCard
    .getByRole("button", { name: "現実のGNSS", exact: true })
    .click();
  await pseudorangeCard
    .getByRole("button", { name: "1 μs", exact: true })
    .click();
  const pseudorangeFixedExample = pseudorangeCard.getByTestId(
    "gnss-pseudorange-fixed-example",
  );
  const pseudorangeDistanceBreakdown = pseudorangeCard.locator(
    ".gnss-observations-distance-breakdown",
  );
  const pseudorangeFixedExampleText = await pseudorangeFixedExample.innerText();
  assert(
    (await pseudorangeDistanceBreakdown
      .getByText("21,000.000 km", { exact: true })
      .isVisible()) &&
      (await pseudorangeCard.getByText(/約 \+0\.300 km/).isVisible()) &&
      (await pseudorangeDistanceBreakdown
        .getByText("約21,000.300 km", { exact: true })
        .isVisible()) &&
      (await pseudorangeCard
        .getByText(/本当の距離そのものが300m伸びたわけではない/)
        .isVisible()) &&
      (await pseudorangeCard
        .getByText(/少なくとも4機の衛星を利用/)
        .isVisible()) &&
      pseudorangeFixedExampleText.includes("真の幾何学的距離") &&
      pseudorangeFixedExampleText.includes("21,000.000 km") &&
      pseudorangeFixedExampleText.includes("21,000.300 km") &&
      pseudorangeFixedExampleText.includes(
        "影響を含んだ距離相当の観測値全体",
      ) &&
      pseudorangeFixedExampleText.includes(
        "擬似距離とは「ずれた分の0.300 km」だけを指す言葉ではありません。",
      ),
    "現実のGNSSと1μs時計ずれの擬似距離表示が正しくありません。",
  );

  const carrierCard = page.getByTestId("gnss-observations-carrier-card");
  const carrierSlider = carrierCard.getByTestId(
    "gnss-carrier-movement-slider",
  );
  await carrierSlider.fill("9.5");
  assert(
    (await carrierCard.getByText("9.5 cm", { exact: true }).isVisible()) &&
      (await carrierCard.getByText("0.50波長", { exact: true }).isVisible()) &&
      (await carrierCard.getByText(/1波長 ≈ 19 cm/).isVisible()),
    "搬送波位相の9.5cm・0.50波長表示が連動しません。",
  );

  const ambiguityCard = page.getByTestId(
    "gnss-observations-ambiguity-card",
  );
  await ambiguityCard
    .getByRole("button", { name: "13 + 0.35波長", exact: true })
    .click();
  assert(
    (await ambiguityCard
      .getByTestId("gnss-fractional-phase-13")
      .getByText("0.35波長", { exact: true })
      .isVisible()) &&
      (await ambiguityCard.getByText(/？波長 \+ 0\.35波長/).isVisible()),
    "整数部分を変えたときに小数位相0.35が維持されません。",
  );
  const ambiguityResolutionFlow = ambiguityCard.getByTestId(
    "gnss-ambiguity-resolution-flow",
  );
  const ambiguityCardText = await ambiguityCard.innerText();
  assert(
    (await ambiguityResolutionFlow.locator("li").count()) === 7 &&
      [
        "複数衛星を観測",
        "擬似距離などから概略位置を求める",
        "搬送波位相を比較・解析",
        "整数波長数の候補を絞る",
        "整数アンビギュイティを整数としてまだ確定できていない状態",
        "複数の観測結果の整合性を確認",
        "整数アンビギュイティを整数値として固定解にできた状態",
        "4機あれば整数アンビギュイティが決定できる",
        "整数波長数は1億程度の桁",
      ].every((expectedText) => ambiguityCardText.includes(expectedText)),
    "整数候補の解析、FLOAT・FIX、4衛星との区別、模式値の説明が不足しています。",
  );
  await ambiguityCard
    .getByRole("button", {
      name: "観測結果が最も整合する12波長を固定解として採用する",
      exact: true,
    })
    .click();
  assert(
    (await ambiguityCard
      .getByText("12波長 + 0.35波長", { exact: true })
      .isVisible()) &&
      (await ambiguityCard
        .locator(".gnss-observations-fix-flow")
        .getByText("FIX", { exact: true })
        .isVisible()) &&
      (await ambiguityCard
        .getByText(/FIXは解析終了という意味ではありません/)
        .isVisible()) &&
      (await ambiguityCard
        .getByText(/条件悪化や衛星遮蔽等によってFLOATへ戻る場合/)
        .isVisible()),
    "整数波長数の模式確定とFLOAT・FIXへの接続が表示されません。",
  );

  const comparisonCard = page.getByTestId(
    "gnss-observations-comparison-card",
  );
  await comparisonCard
    .getByRole("button", { name: "搬送波位相", exact: true })
    .click();
  await comparisonCard
    .getByTestId("gnss-comparison-movement-slider")
    .fill("5");
  assert(
    (await comparisonCard.getByText(/約0\.26波長の変化/).isVisible()) &&
      (await comparisonCard.getByText(/擬似距離が不要.*ではありません/).isVisible()) &&
      (await comparisonCard.getByText("FLOAT → FIX", { exact: true }).isVisible()),
    "擬似距離・搬送波位相の比較操作または相対解析への接続が表示されません。",
  );

  const frequencyCard = page.getByTestId(
    "gnss-observations-frequency-card",
  );
  const frequencyCombinations = frequencyCard.getByTestId(
    "gnss-frequency-combinations",
  );
  const frequencyCases = [
    "L1のみ → 1周波",
    "L1 + L2 → 2周波",
    "L1 + L5 → 2周波",
    "L1 + L2 + L5 → 3周波",
  ];
  for (const expectedSummary of frequencyCases) {
    assert(
      await frequencyCombinations
        .getByText(expectedSummary, { exact: true })
        .isVisible(),
      `${expectedSummary}が整理後の周波数表示にありません。`,
    );
  }

  const noIonosphereInfluenceButton = frequencyCard.getByRole("button", {
    name: "影響なし",
    exact: true,
  });
  const hasIonosphereInfluenceButton = frequencyCard.getByRole("button", {
    name: "影響あり",
    exact: true,
  });
  await noIonosphereInfluenceButton.focus();
  await page.keyboard.press("Tab");
  assert(
    await hasIonosphereInfluenceButton.evaluate(
      (element) => element === document.activeElement,
    ),
    "第2章の電離層比較ボタン間をTabキーで移動できません。",
  );
  const observationsVisibleFocus = await hasVisibleKeyboardFocus(
    hasIonosphereInfluenceButton,
  );
  await page.keyboard.press("Enter");
  const observationsKeyboardOperation =
    (await hasIonosphereInfluenceButton.getAttribute("aria-pressed")) ===
    "true";
  assert(
    observationsVisibleFocus && observationsKeyboardOperation,
    "第2章の電離層比較を可視フォーカス付きでキーボード操作できません。",
  );
  const frequencyCardText = await frequencyCard.innerText();
  assert(
    (await frequencyCard
      .getByText(/周波数ごとの差を利用し、電離層の影響を推定・低減/)
      .isVisible()) &&
      (await frequencyCard
        .getByText(/L1＝擬似距離、L2＝搬送波位相/)
        .isVisible()) &&
      (await frequencyCard.getByText(/CLASではL6系の信号/).isVisible()) &&
      frequencyCardText.includes("従来から高精度な2周波GNSS") &&
      frequencyCardText.includes("高い送信電力と広い帯域") &&
      frequencyCardText.includes(
        "L1 + L2もL1 + L5も、どちらも2周波観測です。",
      ) &&
      frequencyCardText.includes(
        "L1 + L5だから必ずL1 + L2より高精度になる、という意味ではありません。",
      ),
    "複数周波数、電離層、L2・L5、コード・搬送波、CLAS L6の説明が不足しています。",
  );

  const multiGnssCard = page.getByTestId(
    "gnss-observations-multi-gnss-card",
  );
  const globalSystemTableText = await multiGnssCard
    .getByTestId("gnss-global-system-table")
    .innerText();
  const multiGnssCardText = await multiGnssCard.innerText();
  assert(
    [
      "GPS",
      "アメリカ",
      "1993年",
      "GLONASS",
      "ロシア",
      "1995年",
      "Galileo",
      "EU",
      "2016年",
      "BeiDou",
      "中国",
      "2020年（BDS-3）",
    ].every((expectedText) => globalSystemTableText.includes(expectedText)) &&
      multiGnssCardText.includes("QZSS（みちびき）") &&
      multiGnssCardText.includes(
        "日本の地域衛星測位システム。2018年にサービス開始。",
      ) &&
      multiGnssCardText.includes("地域衛星測位システムNavIC") &&
      multiGnssCardText.includes("インドとその周辺地域"),
    "全球型4システム、QZSS、NavICの具体的な表示が不足しています。",
  );
  for (const systemLabel of ["GLONASS", "Galileo", "BeiDou", "QZSS"]) {
    await multiGnssCard
      .getByLabel(new RegExp(`^${systemLabel}`))
      .check();
  }
  await multiGnssCard
    .getByRole("button", { name: "山地・森林", exact: true })
    .click();
  await multiGnssCard
    .getByRole("button", {
      name: "空全体へ分散した衛星配置",
      exact: true,
    })
    .click();
  assert(
    (await multiGnssCard.getByText("multi GNSS", { exact: true }).isVisible()) &&
      (await multiGnssCard.getByText("10機", { exact: true }).isVisible()) &&
      (await multiGnssCard
        .getByText(/衛星数だけでなく衛星配置も重要/)
        .isVisible()) &&
      (await multiGnssCard
        .getByText(/マルチGNSSなら山林でも必ずFIXするわけではありません/)
        .isVisible()),
    "複数GNSS、山地・森林、衛星配置の固定教材例が反映されません。",
  );

  const observationQuestionIds = [
    "gnss-observations-q01-receiver-observation",
    "gnss-observations-q02-pseudorange",
    "gnss-observations-q03-carrier-phase",
    "gnss-observations-q04-integer-ambiguity",
    "gnss-observations-q05-multi-frequency",
    "gnss-observations-q06-multi-gnss",
    "gnss-observations-q07-signal-combination",
  ];
  const observationCorrectOptionIndexes = [1, 2, 0, 3, 1, 2, 0];
  const observationCorrectOptionLetters = ["B", "C", "A", "D", "B", "C", "A"];
  assert(
    new Set(observationCorrectOptionLetters).size === 4 &&
      observationCorrectOptionLetters.filter((letter) => letter === "A").length === 2 &&
      observationCorrectOptionLetters.filter((letter) => letter === "B").length === 2 &&
      observationCorrectOptionLetters.filter((letter) => letter === "C").length === 2 &&
      observationCorrectOptionLetters.filter((letter) => letter === "D").length === 1,
    "第2章7問の表示上の正答文字がA～Dへ分散していません。",
  );
  const observationQuestionOne = page.getByTestId(
    `gnss-quiz-question-${observationQuestionIds[0]}`,
  );
  await observationQuestionOne.locator('input[type="radio"]').nth(0).check();
  await observationQuestionOne
    .getByRole("button", { name: "回答を確認する", exact: true })
    .click();
  const observationQuestionOneFeedback = observationQuestionOne.locator(
    ".gnss-quiz-feedback",
  );
  assert(
    (await observationQuestionOneFeedback
      .getByText("不正解", { exact: true })
      .isVisible()) &&
      (await observationQuestionOneFeedback
        .getByText("正解：B", { exact: true })
        .isVisible()) &&
      (await observationQuestionOneFeedback
        .getByRole("heading", { name: "Aを選んだ場合の解説", exact: true })
        .isVisible()) &&
      (await observationQuestionOneFeedback
        .getByText(/完成した座標が届くのではありません/)
        .isVisible()) &&
      (await observationQuestionOneFeedback
        .getByRole("heading", { name: "解説", exact: true })
        .isVisible()) &&
      !(await observationQuestionOneFeedback.innerText()).includes("正答"),
    "第2章問1の誤答固有理由と正解理由が最新形式で表示されません。",
  );

  for (const [questionIndex, questionId] of observationQuestionIds.entries()) {
    const question = page.getByTestId(`gnss-quiz-question-${questionId}`);
    const correctOptionIndex = observationCorrectOptionIndexes[questionIndex];
    const correctOptionLetter = observationCorrectOptionLetters[questionIndex];

    assert(
      correctOptionIndex !== undefined && correctOptionLetter !== undefined,
      `${questionId}の正答位置データがありません。`,
    );
    await question
      .locator('input[type="radio"]')
      .nth(correctOptionIndex)
      .check();
    await question
      .getByRole("button", { name: "回答を確認する", exact: true })
      .click();
    const feedback = question.locator(".gnss-quiz-feedback");
    assert(
      (await feedback.getByText("正解", { exact: true }).isVisible()) &&
        (await feedback
          .getByText(`正解：${correctOptionLetter}`, { exact: true })
          .isVisible()) &&
        (await feedback.locator(".gnss-quiz-selected-explanation").count()) === 0 &&
        (await feedback
          .getByRole("heading", { name: "解説", exact: true })
          .isVisible()) &&
        !(await feedback.innerText()).includes("正答"),
      `${questionId}の正答表示または重複のない解説が正しくありません。`,
    );
  }
  assert(
    (await page
      .getByTestId("gnss-observations-quiz-panel")
      .locator(".gnss-quiz-question")
      .count()) === 7,
    "GNSS第2章の確認問題が7問ではありません。",
  );

  const chapterThreeNavigationButton = lessonNavigation.getByRole("button", {
    name: /第3章.*GNSSの座標と高さ/,
  });
  await chapterThreeNavigationButton.click();
  const coordinateHeightLesson = page.locator(
    '[data-lesson-id="gnss-coordinate-height"]',
  );
  assert(
    (await coordinateHeightLesson.isVisible()) &&
      (await coordinateHeightLesson
        .getByRole("heading", {
          name: "GNSSで求めた位置は、どう成果になる？",
          exact: true,
        })
        .isVisible()) &&
      (await coordinateHeightLesson.locator("[data-gnss-coordinate-card]").count()) ===
        10,
    "GNSS第3章または10カード構成を表示できません。",
  );

  const coordinateHeightUnderstoodButton = coordinateHeightLesson.getByRole(
    "button",
    { name: "この章を理解できた" },
  );
  await coordinateHeightUnderstoodButton.click();
  assert(
    await coordinateHeightLesson.getByText("3 / 5 章", { exact: true }).isVisible(),
    "GNSS第3章の理解済み操作で進捗が3 / 5章になりません。",
  );

  const earthCenteredCard = page.getByTestId("gnss-earth-centered-card");
  await earthCenteredCard.getByTestId("gnss-earth-position-equator").click();
  assert(
    (await earthCenteredCard.getByText("赤道付近（模式値）", { exact: true }).count()) >=
      1 &&
      (await earthCenteredCard.getByText("+6,378 km", { exact: true }).isVisible()),
    "カード2で赤道付近の模式位置と地心直交座標を連動表示できません。",
  );
  await earthCenteredCard.getByTestId("gnss-earth-position-japan").click();
  const earthCenteredCardText = await earthCenteredCard.innerText();
  assert(
    [
      "日本付近の基準サンプル",
      "緯度 約36°N / 経度 約140°E",
      "Xc",
      "Yc",
      "Zc",
      "-3959340.298 m",
      "3352854.354 m",
      "3697471.502 m",
      "教材派生値",
      "地球の重心（地球中心）",
      "Z軸の正方向が北極方向",
      "唯一の公式な座標記号という意味ではありません",
      "地心直交座標Xc・Yc・Zcと、日本の平面直角座標X・Yは別の座標です。",
    ].every((expectedText) => earthCenteredCardText.includes(expectedText)),
    "カード2の地心原点、位置目安、Z軸方向、平面直角座標との区別が不足しています。",
  );

  const geodeticCard = page.getByTestId("gnss-geodetic-card");
  const earthCenteredRepresentationButton = geodeticCard.getByTestId(
    "gnss-representation-earth-centered",
  );
  const geodeticRepresentationButton = geodeticCard.getByTestId(
    "gnss-representation-geodetic",
  );
  await earthCenteredRepresentationButton.focus();
  await page.keyboard.press("Tab");
  const coordinateHeightVisibleFocus = await hasVisibleKeyboardFocus(
    geodeticRepresentationButton,
  );
  await page.keyboard.press("Enter");
  const coordinateHeightKeyboardOperation =
    (await geodeticRepresentationButton.getAttribute("aria-pressed")) === "true";
  const geodeticCardText = await geodeticCard.innerText();
  assert(
    coordinateHeightVisibleFocus &&
      coordinateHeightKeyboardOperation &&
      [
        "35°39′29.1572″ N",
        "139°44′28.8869″ E",
        "63.3853 m",
        "数値の表し方が変わっただけで、日本付近の基準サンプルが別の地点へ移動したわけではありません。",
      ].every((expectedText) => geodeticCardText.includes(expectedText)),
    "カード3の座標表現切替または可視フォーカス付きキーボード操作が正しくありません。",
  );

  const planeCoordinateCard = page.getByTestId("gnss-plane-coordinate-card");
  const planeZoneNineText = await planeCoordinateCard
    .getByTestId("gnss-plane-zone-9-result")
    .innerText();
  const planeCoordinateCardText = await planeCoordinateCard.innerText();
  assert(
    planeZoneNineText.includes("X = -37928.1965 m") &&
      planeZoneNineText.includes("Y = -8327.6987 m") &&
      planeZoneNineText.includes("確認済み換算値") &&
      planeZoneNineText.includes("X：北方向が正、Y：東方向が正") &&
      (await planeCoordinateCard
        .getByTestId("gnss-plane-axis-diagram")
        .isVisible()) &&
      [
        "原点 X=0、Y=0",
        "北 X+",
        "南 X−",
        "東 Y+",
        "西 Y−",
        "IX系原点：緯度36°、経度139°50′",
        "X軸は北が正、南が負です。",
        "Y軸は東が正、西が負です。",
        "X<0、Y<0",
      ].every((expectedText) =>
        planeCoordinateCardText.includes(expectedText),
      ),
    "カード4に第IX系の原点、軸方向、南西側の確認済みX・Yが表示されません。",
  );
  await planeCoordinateCard.getByTestId("gnss-plane-system-other-zone").click();
  assert(
    (await planeCoordinateCard
      .getByText(/系を変えると原点・投影条件が変わるためX・Yが変化/)
      .isVisible()) &&
      (await planeCoordinateCard
        .getByText(/未確認の具体値は表示しません/)
        .isVisible()),
    "カード4で別系の概念表示へ切り替えられません。",
  );

  const datumCard = page.getByTestId("gnss-datum-card");
  await datumCard.getByTestId("gnss-reveal-datum").click();
  const datumCardText = await datumCard.innerText();
  assert(
    [
      "日本測地系2024（JGD2024）",
      "ITRF（世界規模の基準枠）",
      "JGD2024（日本の測地基準）",
      "GRS80は地球の形を近似する準拠楕円体",
      "同じ概念の別名ではありません",
      "WGS84",
      "WGS84 = JGD2024 と同一視しません。",
      "水平位置の緯度・経度と平面直角座標成果は引き継がれている",
    ].every((expectedText) => datumCardText.includes(expectedText)),
    "カード5のJGD2024、ITRF、GRS80、WGS84の確認表示が不足しています。",
  );

  const epochCard = page.getByTestId("gnss-epoch-card");
  const epochCardText = await epochCard.innerText();
  assert(
    [
      "成果基準時点（公表成果の基準となる時点）",
      "観測時点（実際に観測した時点）",
      "JGD2011が元期、JGD2024が今期という意味ではありません",
      "2011年5月24日",
      "2024年6月1日",
      "1000.000 m",
      "1000.035 m",
      "999.982 m",
      "+0.035 m",
      "-0.018 m",
      "元期 → 今期の実際の移動量",
      "今期 → 元期へ戻す補正量",
      "-0.035 m",
      "+0.018 m",
      "地面は実際に動く",
      "常に同じ補正を行うわけではありません",
      "実在地点の変動量ではありません",
    ].every((expectedText) => epochCardText.includes(expectedText)),
    "カード6の元期・今期、実際の基準日例、T1仮想変位が不足しています。",
  );
  const unalignedAdoptedCoordinateText = await epochCard
    .getByTestId("gnss-epoch-adopted-coordinate")
    .innerText();
  assert(
    unalignedAdoptedCoordinateText.includes("今期の観測値") &&
      unalignedAdoptedCoordinateText.includes("1000.035 m") &&
      unalignedAdoptedCoordinateText.includes("999.982 m") &&
      unalignedAdoptedCoordinateText.includes(
        "× 今期の値のままでは元期成果と時点がそろわない",
      ),
    "カード6の時点未整合時に、採用座標が今期値として表示されません。",
  );
  await epochCard.getByTestId("gnss-epoch-aligned").click();
  const alignedAdoptedCoordinateText = await epochCard
    .getByTestId("gnss-epoch-adopted-coordinate")
    .innerText();
  assert(
    alignedAdoptedCoordinateText.includes("元期へそろえた値") &&
      alignedAdoptedCoordinateText.includes("採用 X\n1000.000 m") &&
      alignedAdoptedCoordinateText.includes("採用 Y\n1000.000 m") &&
      alignedAdoptedCoordinateText.includes(
        "✓ 国家座標・既知成果と同じ元期で比較",
      ),
    "カード6で元期へそろえた採用座標を数値表示できません。",
  );

  const heightReferenceCard = page.getByTestId("gnss-height-reference-card");
  const heightDiagram = heightReferenceCard.locator(
    ".gnss-coordinate-height-diagram svg",
  );
  const getHeightDiagramFixedGeometry = () =>
    heightDiagram.evaluate((diagram) => {
      const point = diagram.querySelector(".gnss-coordinate-point");
      const surface = diagram.querySelector(".gnss-coordinate-surface");
      const geoid = diagram.querySelector(".gnss-coordinate-geoid");
      const ellipsoid = diagram.querySelector(
        ".gnss-coordinate-ellipsoid-line",
      );

      return {
        pointCx: point?.getAttribute("cx"),
        pointCy: point?.getAttribute("cy"),
        surfacePath: surface?.getAttribute("d"),
        geoidPath: geoid?.getAttribute("d"),
        ellipsoidPath: ellipsoid?.getAttribute("d"),
      };
    });
  const heightGeometryBefore = await getHeightDiagramFixedGeometry();
  await heightReferenceCard.getByTestId("gnss-height-reference-elevation").click();
  const heightGeometryAfter = await getHeightDiagramFixedGeometry();
  assert(
    (await heightReferenceCard
      .getByText("標高 26.6800 m", { exact: true })
      .isVisible()) &&
      (await heightReferenceCard
        .getByText(/平均海面と整合する、重力を考慮した高さの基準面/)
        .isVisible()) &&
      (await heightReferenceCard
        .getByText(/楕円体高と標高は、同じP1までの高さでも基準面が異なります/)
        .isVisible()) &&
      (await heightReferenceCard
        .getByText("P1（位置は固定）", { exact: true })
        .isVisible()) &&
      JSON.stringify(heightGeometryAfter) === JSON.stringify(heightGeometryBefore),
    "カード7で高さ表示を切り替えたときにP1または3つの基準面が動きました。",
  );

  const heightConversionCard = page.getByTestId("gnss-height-conversion-card");
  await heightConversionCard.getByTestId("gnss-height-conversion-applied").click();
  assert(
    (await heightConversionCard
      .getByTestId("gnss-height-conversion-result")
      .getByText("26.6800 m", { exact: true })
      .isVisible()) &&
      (await heightConversionCard
        .getByText("ジオイド2024日本とその周辺", { exact: true })
        .isVisible()) &&
      (await heightConversionCard
        .getByText(/ジオイド高36.7053 mはP1の高さそのものではなく/)
        .isVisible()) &&
      (await heightConversionCard
        .getByText("H = h - N", { exact: true })
        .isVisible()),
    "カード8でジオイド適用後の標高、モデル、H = h - Nを確認できません。",
  );
  await heightConversionCard.getByTestId("gnss-height-conversion-misused").click();
  assert(
    (await heightConversionCard
      .getByTestId("gnss-height-conversion-result")
      .getByText(/楕円体高を標高として使用しています。差：36.7053 m/)
      .isVisible()) &&
      (await heightConversionCard.getByText("FIX ✓", { exact: true }).isVisible()),
    "カード8でFIX状態のまま高さ種類の誤りを表示できません。",
  );

  const antennaCard = page.getByTestId("gnss-antenna-card");
  const antennaCardText = await antennaCard.innerText();
  assert(
    (await antennaCard.getByTestId("gnss-antenna-height-selector").count()) === 0 &&
      !antennaCardText.includes("2.100 m") &&
      [
        "アンテナ基準点の位置",
        "アンテナ高 2.000 m",
        "地上の測点 P1",
        "正確に記録・設定する",
      ].every((expectedText) => antennaCardText.includes(expectedText)) &&
      (await antennaCard.getByTestId("gnss-antenna-static-flow").isVisible()) &&
      (await antennaCard
        .getByText(/アンテナ基準位置・位相中心補正等も関係/)
        .isVisible()),
    "カード9の誤入力比較が残っているか、静的なアンテナ位置→アンテナ高→測点位置の関係が不足しています。",
  );

  const finalCheckCard = page.getByTestId("gnss-final-check-card");
  const finalReviewTable = finalCheckCard.getByTestId(
    "gnss-final-review-table",
  );
  const finalReviewText = await finalReviewTable.innerText();
  assert(
    (await finalReviewTable.locator("tbody tr").count()) === 9 &&
      [
        "測地系",
        "平面直角座標系",
        "座標の時点",
        "高さの種類",
        "高さの基準・ジオイド",
        "アンテナ高",
        "基準局座標",
        "既知点・再観測",
        "観測環境",
      ].every((expectedText) => finalReviewText.includes(expectedText)) &&
      (await finalCheckCard.getByTestId("gnss-final-issue-selector").count()) === 0 &&
      (await finalCheckCard.getByTestId("gnss-final-check-all").count()) === 0 &&
      (await finalCheckCard.getByTestId("gnss-final-quality-grid").count()) === 0 &&
      (await finalCheckCard
        .getByText("FIXしていることと、成果条件が正しいことは別。", {
          exact: true,
        })
        .isVisible()),
    "カード10が9項目の静的確認表になっていないか、旧確認ボタンが残っています。",
  );

  const coordinateHeightQuestionIds = [
    "gnss-coordinate-height-q01-same-position",
    "gnss-coordinate-height-q02-plane-system",
    "gnss-coordinate-height-q03-jgd2024",
    "gnss-coordinate-height-q04-epoch",
    "gnss-coordinate-height-q05-height-conversion",
    "gnss-coordinate-height-q06-height-type",
    "gnss-coordinate-height-q07-antenna-height",
    "gnss-coordinate-height-q08-final-quality-check",
  ];
  const coordinateHeightCorrectOptionIndexes = [2, 3, 0, 3, 1, 2, 0, 3];
  const coordinateHeightCorrectOptionLetters = ["C", "D", "A", "D", "B", "C", "A", "D"];
  assert(
    new Set(coordinateHeightCorrectOptionLetters).size === 4,
    "第3章8問の表示上の正答文字がA～Dへ分散していません。",
  );
  const coordinateHeightQuestionOne = page.getByTestId(
    `gnss-quiz-question-${coordinateHeightQuestionIds[0]}`,
  );
  await coordinateHeightQuestionOne.locator('input[type="radio"]').nth(0).check();
  await coordinateHeightQuestionOne
    .getByRole("button", { name: "回答を確認する", exact: true })
    .click();
  const coordinateHeightQuestionOneFeedback =
    coordinateHeightQuestionOne.locator(".gnss-quiz-feedback");
  assert(
    (await coordinateHeightQuestionOneFeedback
      .getByText("不正解", { exact: true })
      .isVisible()) &&
      (await coordinateHeightQuestionOneFeedback
        .getByText("正解：C", { exact: true })
        .isVisible()) &&
      (await coordinateHeightQuestionOneFeedback
        .getByRole("heading", { name: "Aを選んだ場合の解説", exact: true })
        .isVisible()) &&
      (await coordinateHeightQuestionOneFeedback
        .getByText(/北極はZ軸の正方向を示しますが、座標の原点ではありません/)
        .isVisible()),
    "第3章問1の誤答固有理由と正解文字が表示されません。",
  );
  const coordinateHeightQuestionTwo = page.getByTestId(
    `gnss-quiz-question-${coordinateHeightQuestionIds[1]}`,
  );
  const coordinateHeightQuestionTwoText =
    await coordinateHeightQuestionTwo.innerText();
  const coordinateHeightQuestionTwoCorrectLabel =
    coordinateHeightQuestionTwo.locator("fieldset label").nth(3);
  assert(
    coordinateHeightQuestionTwoText.includes(
      "原点（緯度36°、経度139°50′）から見て南西側",
    ) &&
      (await coordinateHeightQuestionTwoCorrectLabel
        .locator(".gnss-option-letter")
        .getByText("D", { exact: true })
        .isVisible()) &&
      (await coordinateHeightQuestionTwoCorrectLabel
        .getByText("X<0、Y<0", { exact: true })
        .isVisible()),
    "第3章問2に第IX系原点の南西側と表示上の選択肢Dがありません。",
  );

  for (const [questionIndex, questionId] of coordinateHeightQuestionIds.entries()) {
    const question = page.getByTestId(`gnss-quiz-question-${questionId}`);
    const correctOptionIndex = coordinateHeightCorrectOptionIndexes[questionIndex];
    const correctOptionLetter = coordinateHeightCorrectOptionLetters[questionIndex];

    assert(
      correctOptionIndex !== undefined && correctOptionLetter !== undefined,
      `${questionId}の正答位置データがありません。`,
    );
    await question.locator('input[type="radio"]').nth(correctOptionIndex).check();
    await question
      .getByRole("button", { name: "回答を確認する", exact: true })
      .click();
    const feedback = question.locator(".gnss-quiz-feedback");
    assert(
      (await feedback.getByText("正解", { exact: true }).isVisible()) &&
        (await feedback
          .getByText(`正解：${correctOptionLetter}`, { exact: true })
          .isVisible()) &&
        (await feedback.locator(".gnss-quiz-selected-explanation").count()) === 0 &&
        (await feedback
          .getByRole("heading", { name: "解説", exact: true })
          .isVisible()) &&
        !(await feedback.innerText()).includes("正答"),
      `${questionId}の正答表示または重複のない解説が正しくありません。`,
    );
  }
  assert(
    (await page
      .getByTestId("gnss-coordinate-height-quiz-panel")
      .locator(".gnss-quiz-question")
      .count()) === 8,
    "GNSS第3章の確認問題が8問ではありません。",
  );

  const chapterFourNavigationButton = lessonNavigation.getByRole("button", {
    name: /第4章.*GNSS測位方式を比較する/,
  });
  await chapterFourNavigationButton.click();
  const positioningMethodsLesson = page.locator(
    '[data-lesson-id="gnss-positioning-methods"]',
  );
  assert(
    (await positioningMethodsLesson.isVisible()) &&
      (await positioningMethodsLesson
        .getByRole("heading", {
          name: "GNSS測位方式を比較する",
          exact: true,
        })
        .isVisible()) &&
      (await positioningMethodsLesson
        .locator("[data-gnss-positioning-card]")
        .count()) === 9,
    "GNSS第4章または9カード構成を表示できません。",
  );

  const positioningMethodsUnderstoodButton =
    positioningMethodsLesson.getByRole("button", {
      name: "この章を理解できた",
    });
  await positioningMethodsUnderstoodButton.click();
  assert(
    await positioningMethodsLesson
      .getByText("4 / 5 章", { exact: true })
      .isVisible(),
    "GNSS第4章の理解済み操作で進捗が4 / 5章になりません。",
  );

  const positioningInformationCard = page.getByTestId(
    "gnss-positioning-information-card",
  );
  const positioningInformationText = await positioningInformationCard.innerText();
  const positioningResultBoxes = positioningInformationCard.locator(
    ".gnss-positioning-source-result",
  );
  assert(
    [
      "概略位置～m級",
      "方式によりm級～cm級",
      "高精度な測量に利用",
      "後処理",
    ].every((expectedText) => positioningInformationText.includes(expectedText)) &&
      (await positioningResultBoxes.count()) === 3 &&
      (await positioningResultBoxes.allTextContents()).every(
        (text) => text.trim() === "P1の位置を求める",
      ) &&
      (await positioningInformationCard.getByRole("button").count()) === 0,
    "カード2の精度傾向、統一結果表示、後処理または静的UIが正しくありません。",
  );

  const singleDgnssCard = page.getByTestId(
    "gnss-positioning-single-dgnss-card",
  );
  const singleDgnssCardText = await singleDgnssCard.innerText();
  assert(
    [
      "単独測位",
      "DGNSS",
      "基準局や補正サービスからの外部補正情報を使わず",
      "受信機内部で補正・推定",
      "単独測位 ≠ 何も補正していない測位",
      "既知位置の基準局",
      "DGNSSにも基準局はある",
      "基準局が必要 ≠ 利用者が自分で現場基準局を設置",
      "3D fix / GNSS fix",
      "RTK FIX",
      "DGNSSはコードだけ",
    ].every((expectedText) => singleDgnssCardText.includes(expectedText)),
    "カード3の単独測位とDGNSSの静的比較が不足しています。",
  );

  const ownBaseCard = page.getByTestId("gnss-positioning-own-base-card");
  const correctBaseCoordinateButton = ownBaseCard.getByTestId(
    "gnss-own-base-correct",
  );
  const offsetBaseCoordinateButton = ownBaseCard.getByTestId(
    "gnss-own-base-offset",
  );
  const ownBaseResult = ownBaseCard.getByTestId("gnss-own-base-result");
  const initialOwnBaseResultText = await ownBaseResult.innerText();
  const ownBaseFlowText = await ownBaseCard.innerText();
  const desktopCoordinatePanelLayout = await ownBaseResult
    .locator("[data-coordinate-field]")
    .evaluateAll((elements) => ({
      count: elements.length,
      rowCount: new Set(
        elements.map((element) => Math.round(element.getBoundingClientRect().top)),
      ).size,
    }));
  assert(
    [
      "2地点の観測を比較",
      "AからP1までの位置の差を求める",
      "基準局Aの既知座標 ＋ AからP1までの位置の差",
      "X方向・Y方向・高さ方向",
      "X方向だけの教材例",
    ].every((expectedText) => ownBaseFlowText.includes(expectedText)) &&
      desktopCoordinatePanelLayout.count === 4 &&
      desktopCoordinatePanelLayout.rowCount === 1 &&
      initialOwnBaseResultText.includes("1000.000 m") &&
      initialOwnBaseResultText.includes("+12.345 m") &&
      initialOwnBaseResultText.includes("1012.345 m") &&
      initialOwnBaseResultText.includes("FIX"),
    "カード4の正しい基準局座標、相対X、P1.X、FIXが正しくありません。",
  );
  await correctBaseCoordinateButton.focus();
  await page.keyboard.press("Tab");
  const positioningMethodsVisibleFocus = await hasVisibleKeyboardFocus(
    offsetBaseCoordinateButton,
  );
  await page.keyboard.press("Enter");
  const positioningMethodsKeyboardOperation =
    (await offsetBaseCoordinateButton.getAttribute("aria-pressed")) === "true";
  const offsetOwnBaseResultText = await ownBaseResult.innerText();
  const changedCoordinateFields = ownBaseResult.locator(
    "[data-coordinate-field].is-changed",
  );
  assert(
    positioningMethodsVisibleFocus &&
      positioningMethodsKeyboardOperation &&
      offsetOwnBaseResultText.includes("1000.500 m") &&
      offsetOwnBaseResultText.includes("+12.345 m") &&
      offsetOwnBaseResultText.includes("1012.845 m") &&
      offsetOwnBaseResultText.includes("FIX") &&
      (await changedCoordinateFields.count()) === 2 &&
      (await changedCoordinateFields
        .filter({ has: page.getByText("基準局 A.X", { exact: true }) })
        .count()) === 1 &&
      (await changedCoordinateFields
        .filter({ has: page.getByText("P1.X", { exact: true }) })
        .count()) === 1 &&
      !(await ownBaseResult
        .locator('[data-coordinate-field="fix"]')
        .getAttribute("class"))?.includes("is-changed") &&
      !(await ownBaseResult
        .locator('[data-coordinate-field="relative-x"]')
        .getAttribute("class"))?.includes("is-changed") &&
      (await ownBaseCard
        .getByText(/FIXもA→P1の位置の差も同じ.*P1\.Xも \+0\.500 m違います。/, {
          exact: true,
        })
        .isVisible()),
    "カード4の+0.500m誤入力、P1.X、FIX維持またはキーボード操作が正しくありません。",
  );

  const networkCard = page.getByTestId("gnss-positioning-network-card");
  const networkCardText = await networkCard.innerText();
  assert(
    [
      "自前RTK",
      "ネットワーク型RTK",
      "電子基準点網など",
      "配信側の処理",
      "RTK用の情報",
      "インターネット",
      "基準となるGNSS観測を利用しない",
      "どちらにも電子基準点等の地上側の基準情報が関係",
      "座標系、高さ、アンテナ高",
    ].every((expectedText) => networkCardText.includes(expectedText)),
    "カード5の自前RTKとネットワーク型RTKの経路・品質比較が不足しています。",
  );

  const clasCard = page.getByTestId("gnss-positioning-clas-card");
  const clasCardText = await clasCard.innerText();
  assert(
    [
      "CLASは「ネットワーク型RTKのインターネットなし版」ではありません。",
      "ネットワーク型RTK・CLASに共通",
      "GNSS測位信号　L1 / L2 / L5 等",
      "RTK用の情報",
      "インターネット",
      "CLAS補強情報を生成",
      "みちびき",
      "L6D",
      "CLAS対応受信機 P1",
      "L6DでP1までの距離を測っているのではありません。",
      "みちびきだけで測位することは別",
    ].every((expectedText) => clasCardText.includes(expectedText)) &&
      (await clasCard
        .getByTestId("gnss-network-clas-signal-table")
        .locator("tbody tr")
        .count()) === 3,
    "カード6のNRTK・CLAS経路、L6D補強情報、禁止誤解の説明が不足しています。",
  );

  const staticCard = page.getByTestId("gnss-positioning-static-card");
  const staticCardText = await staticCard.innerText();
  assert(
    (await staticCard.getByTestId("gnss-static-timeline").isVisible()) &&
      [
        "一定時間同時観測",
        "観測データを保存",
        "後処理",
        "基線解析",
        "コード観測",
        "搬送波位相",
        "RINEX",
      ].every((expectedText) => staticCardText.includes(expectedText)),
    "カード7の同時観測タイムライン、後処理、観測データが不足しています。",
  );

  const sixMethodsCard = page.getByTestId(
    "gnss-positioning-six-methods-card",
  );
  const methodTable = sixMethodsCard.getByTestId(
    "gnss-positioning-method-table",
  );
  const dgnssMethodRowText = await methodTable
    .locator('[data-method-id="dgnss"]')
    .innerText();
  assert(
    (await methodTable.locator("tbody tr").count()) === 6 &&
      (await methodTable.locator('[data-method-id="single"]').isVisible()) &&
      (await methodTable.locator('[data-method-id="dgnss"]').isVisible()) &&
      (await methodTable
        .locator('[data-method-id="own-base-rtk"]')
        .isVisible()) &&
      (await methodTable
        .locator('[data-method-id="network-rtk"]')
        .isVisible()) &&
      (await methodTable.locator('[data-method-id="clas"]').isVisible()) &&
      (await methodTable.locator('[data-method-id="static"]').isVisible()) &&
      dgnssMethodRowText.includes("既知位置の基準局で作った補正情報") &&
      dgnssMethodRowText.includes("必須ではない") &&
      dgnssMethodRowText.includes(
        "基準局で分かったGNSS測位のずれを、観測点P1の位置改善に利用する",
      ) &&
      dgnssMethodRowText.includes("主にリアルタイム") &&
      (await sixMethodsCard
        .getByText(/DGNSSにも基準局はあります。/)
        .isVisible()) &&
      (await sixMethodsCard
        .getByText(/上位・下位.*単純なランキング/)
        .isVisible()),
    "カード8の6方式比較表またはランキングではない説明が不足しています。",
  );

  const selectionCard = page.getByTestId(
    "gnss-positioning-selection-card",
  );
  const presetButtons = selectionCard
    .getByTestId("gnss-positioning-presets")
    .getByRole("button");
  const candidatePanel = selectionCard.getByTestId(
    "gnss-positioning-candidates",
  );
  assert(
    (await presetButtons.count()) === 5,
    "カード9の現場プリセットが5件ではありません。",
  );
  const positioningPresetCandidates = [
    ["general-good-network", "network-rtk"],
    ["mountain-no-mobile", "clas"],
    ["own-base-available", "own-base-rtk"],
    ["control-point-static", "static"],
    ["rough-position", "single"],
  ];
  for (const [presetId, candidateId] of positioningPresetCandidates) {
    await selectionCard
      .getByTestId(`gnss-positioning-preset-${presetId}`)
      .click();
    assert(
      await candidatePanel
        .locator(`[data-candidate-id="${candidateId}"]`)
        .isVisible(),
      `${presetId}で${candidateId}が検討候補になりません。`,
    );
  }

  await selectionCard
    .getByTestId("gnss-positioning-preset-general-good-network")
    .click();
  assert(
    await candidatePanel
      .locator('[data-candidate-id="network-rtk"]')
      .isVisible(),
    "通信良好条件でネットワーク型RTKが候補になりません。",
  );
  await selectionCard
    .getByTestId("gnss-condition-mobileConnection-unavailable")
    .click();
  const offlineCandidateText = await candidatePanel.innerText();
  assert(
    (await candidatePanel.locator('[data-candidate-id="clas"]').isVisible()) &&
      offlineCandidateText.includes("ネットワーク型RTK：携帯通信経路を再確認") &&
      offlineCandidateText.includes("基準局を設置できる条件なら候補"),
    "携帯圏外への変更でCLAS候補とNRTK・自前RTKの再検討理由が表示されません。",
  );
  await selectionCard
    .getByTestId("gnss-condition-skyView-difficult")
    .click();
  assert(
    (await selectionCard
      .getByTestId("gnss-positioning-sky-warning")
      .getByText(
        "GNSS方式を選ぶ前に、GNSS観測条件そのものを確認してください。",
        { exact: true },
      )
      .isVisible()) &&
      (await candidatePanel.locator("[data-candidate-id]").count()) === 0 &&
      (await candidatePanel
        .getByText("追加条件の確認が必要", { exact: true })
        .isVisible()),
    "上空視界が厳しい場合にGNSS観測条件警告または安全な候補保留が出ません。",
  );
  await selectionCard
    .getByTestId("gnss-condition-skyView-good")
    .click();
  assert(
    await candidatePanel.locator('[data-candidate-id="clas"]').isVisible(),
    "上空視界を良好へ戻した後にCLAS候補へ戻りません。",
  );

  const positioningQuestionIds = [
    "gnss-positioning-methods-q01-single-dgnss",
    "gnss-positioning-methods-q02-own-base-rtk",
    "gnss-positioning-methods-q03-network-rtk",
    "gnss-positioning-methods-q04-clas",
    "gnss-positioning-methods-q05-static",
    "gnss-positioning-methods-q06-comparison",
    "gnss-positioning-methods-q07-field-no-mobile",
    "gnss-positioning-methods-q08-method-selection",
  ];
  const positioningCorrectOptionIndexes = [0, 2, 3, 1, 0, 2, 3, 1];
  const positioningCorrectOptionLetters = ["A", "C", "D", "B", "A", "C", "D", "B"];
  assert(
    ["A", "B", "C", "D"].every(
      (letter) =>
        positioningCorrectOptionLetters.filter((current) => current === letter)
          .length === 2,
    ),
    "第4章8問の表示上の正答文字がA～D各2問ではありません。",
  );
  const positioningQuestionOne = page.getByTestId(
    `gnss-quiz-question-${positioningQuestionIds[0]}`,
  );
  await positioningQuestionOne.locator('input[type="radio"]').nth(1).check();
  await positioningQuestionOne
    .getByRole("button", { name: "回答を確認する", exact: true })
    .click();
  const positioningQuestionOneFeedback = positioningQuestionOne.locator(
    ".gnss-quiz-feedback",
  );
  assert(
    (await positioningQuestionOneFeedback
      .getByText("不正解", { exact: true })
      .isVisible()) &&
      (await positioningQuestionOneFeedback
        .getByText("正解：A", { exact: true })
        .isVisible()) &&
      (await positioningQuestionOneFeedback
        .getByRole("heading", { name: "Bを選んだ場合の解説", exact: true })
        .isVisible()) &&
      (await positioningQuestionOneFeedback
        .getByText(/コードか搬送波か.*だけで分けるものではありません/)
        .isVisible()) &&
      (await positioningQuestionOneFeedback
        .getByRole("heading", { name: "解説", exact: true })
        .isVisible()),
    "第4章問1の誤答固有理由、正解文字、正答理由が表示されません。",
  );

  for (const [questionIndex, questionId] of positioningQuestionIds.entries()) {
    const question = page.getByTestId(`gnss-quiz-question-${questionId}`);
    const correctOptionIndex = positioningCorrectOptionIndexes[questionIndex];
    const correctOptionLetter = positioningCorrectOptionLetters[questionIndex];

    assert(
      correctOptionIndex !== undefined && correctOptionLetter !== undefined,
      `${questionId}の正答位置データがありません。`,
    );
    await question.locator('input[type="radio"]').nth(correctOptionIndex).check();
    await question
      .getByRole("button", { name: "回答を確認する", exact: true })
      .click();
    const feedback = question.locator(".gnss-quiz-feedback");
    assert(
      (await feedback.getByText("正解", { exact: true }).isVisible()) &&
        (await feedback
          .getByText(`正解：${correctOptionLetter}`, { exact: true })
          .isVisible()) &&
        (await feedback.locator(".gnss-quiz-selected-explanation").count()) === 0 &&
        (await feedback
          .getByRole("heading", { name: "解説", exact: true })
          .isVisible()) &&
        !(await feedback.innerText()).includes("正答"),
      `${questionId}の正答表示または重複のない解説が正しくありません。`,
    );
  }
  assert(
    (await page
      .getByTestId("gnss-positioning-methods-quiz-panel")
      .locator(".gnss-quiz-question")
      .count()) === 8,
    "GNSS第4章の確認問題が8問ではありません。",
  );

  const chapterFiveNavigationButton = lessonNavigation.getByRole("button", {
    name: /第5章.*自前RTK① 基準局をつくる/,
  });
  await chapterFiveNavigationButton.click();
  const ownBaseStationLesson = page.locator(
    '[data-lesson-id="gnss-own-base-station"]',
  );
  assert(
    (await ownBaseStationLesson.isVisible()) &&
      (await ownBaseStationLesson
        .getByRole("heading", {
          name: "自前RTKの基準局をつくる",
          exact: true,
        })
        .isVisible()) &&
      (await ownBaseStationLesson.locator("[data-gnss-own-base-card]").count()) ===
        9,
    "GNSS第5章または9カード構成を表示できません。",
  );

  const ownBaseStationUnderstoodButton = ownBaseStationLesson.getByRole(
    "button",
    { name: "この章を理解できた" },
  );
  await ownBaseStationUnderstoodButton.click();
  assert(
    await ownBaseStationLesson.getByText("5 / 5 章", { exact: true }).isVisible(),
    "GNSS第5章の理解済み操作で進捗が5 / 5章になりません。",
  );

  const ownBaseIntroCard = page.getByTestId("gnss-own-base-intro-card");
  const ownBaseIntroText = await ownBaseIntroCard.innerText();
  assert(
    [
      "基準局Aの座標が0.500 m違えば",
      "その基準局Aの座標はどこから来るのでしょうか？",
      "基準局座標を決める",
      "その座標の点とアンテナを結び付ける",
      "GNSSを安定して観測できる場所へ設置する",
      "基準局として使う前に確認する",
      "測量成果の基準として適切な基準局をつくれた",
    ].every((expectedText) => ownBaseIntroText.includes(expectedText)),
    "第5章カード1の第4章接続、中心問い、準備フローが不足しています。",
  );

  const ownBaseElementsCard = page.getByTestId("gnss-own-base-elements-card");
  const ownBaseElementsText = await ownBaseElementsCard.innerText();
  assert(
    (await ownBaseElementsCard.locator("[data-element-id]").count()) === 3 &&
      [
        "基準となる座標",
        "現地のGNSSアンテナ",
        "GNSS観測環境",
        "カード3・4・5",
        "カード6",
        "カード7",
        "カード8",
      ].every((expectedText) => ownBaseElementsText.includes(expectedText)),
    "第5章カード2の座標・アンテナ・観測環境の3要素が不足しています。",
  );

  const ownBaseCoordinateSourceCard = page.getByTestId(
    "gnss-own-base-coordinate-source-card",
  );
  const ownBaseCoordinateSourceText =
    await ownBaseCoordinateSourceCard.innerText();
  const ownBaseCoordinateSourceTable = ownBaseCoordinateSourceCard.getByTestId(
    "gnss-own-base-coordinate-source-table",
  );
  assert(
    (await ownBaseCoordinateSourceTable.locator("tbody tr").count()) === 4 &&
      [
        "既知点の成果を使う",
        "サーベイイン等で受信機から位置を得る",
        "単独測位で得た位置を使う",
        "スタティック等の測量で位置を決める",
        "座標の出どころ",
        "成果の基準として適切か",
        "外部補正情報を使わず",
        "自動的に決まるとは限りません",
      ].every((expectedText) =>
        ownBaseCoordinateSourceText.includes(expectedText),
      ),
    "第5章カード3の4つの座標入口または成果適合の説明が不足しています。",
  );

  const ownBaseKnownPointCard = page.getByTestId(
    "gnss-own-base-known-point-card",
  );
  const ownBaseKnownPointText = await ownBaseKnownPointCard.innerText();
  const ownBaseKnownPointValues = ownBaseKnownPointCard.getByTestId(
    "gnss-own-base-known-point-values",
  );
  assert(
    [
      "既知点Aの成果を確認",
      "使用する点がAであることを確認",
      "Aへ基準局アンテナを設置",
      "既知点 A",
      "X = 1000.000 m / Y = 1000.000 m",
      "標高 = 50.000 m",
      "基準局アンテナ高",
      "1.800 m",
      "測地系",
      "座標の時点",
      "Drogger Pパッケージ",
      "DG-RPO1RWS + u-blox ANN-MB-00",
    ].every((expectedText) => ownBaseKnownPointText.includes(expectedText)) &&
      (await ownBaseKnownPointValues.locator("dl > div").count()) === 6,
    "第5章カード4の既知点A既存値、成果条件または設置フローが不足しています。",
  );

  const ownBaseNoKnownPointCard = page.getByTestId(
    "gnss-own-base-no-known-point-card",
  );
  const ownBaseNoKnownPointText = await ownBaseNoKnownPointCard.innerText();
  assert(
    (await ownBaseNoKnownPointCard.locator("[data-branch-id]").count()) === 2 &&
      [
        "基準局候補点 B",
        "座標：まだ確定していない",
        "何の成果が必要？",
        "現場内での相対的な位置関係を扱う",
        "ローカルな基準",
        "既存の国家座標・測量成果へ整合させたい",
        "目的に適した測量",
        "相対的な位置関係を高精度に求められること",
        "≠ 自前RTKが一切できない",
        "≠ 基準局候補点Bの絶対座標も正しい",
      ].every((expectedText) => ownBaseNoKnownPointText.includes(expectedText)),
    "第5章カード5の既知点なし分岐または相対・国家座標の区別が不足しています。",
  );

  const ownBaseAntennaCard = page.getByTestId("gnss-own-base-antenna-card");
  const ownBaseAntennaText = await ownBaseAntennaCard.innerText();
  assert(
    (await ownBaseAntennaCard.getByRole("img").isVisible()) &&
      [
        "GNSSアンテナ",
        "アンテナ高 1.800 m",
        "既知点 A",
        "使用する点の位置へ正しく設置する",
        "求心する",
        "アンテナ高を測定・記録する",
        "アンテナを確実に固定する",
        "観測中に動かない状態にする",
      ].every((expectedText) => ownBaseAntennaText.includes(expectedText)),
    "第5章カード6の求心・アンテナ高・固定の模式図と確認項目が不足しています。",
  );

  const ownBaseSiteCard = page.getByTestId("gnss-own-base-site-card");
  const ownBaseSiteText = await ownBaseSiteCard.innerText();
  assert(
    (await ownBaseSiteCard.locator("[data-site-example-id]").count()) === 2 &&
      [
        "○",
        "比較的良い例",
        "上空が開けている",
        "アンテナが安定",
        "△",
        "注意が必要な例",
        "建物の壁の近く",
        "樹木等で上空が遮られる",
        "反射しやすい物の近くを避ける",
        "安全に継続して設置できる",
      ].every((expectedText) => ownBaseSiteText.includes(expectedText)),
    "第5章カード7の上空視界・反射物・固定・安全の静的比較が不足しています。",
  );

  const ownBaseFinalCheckCard = page.getByTestId(
    "gnss-own-base-final-check-card",
  );
  const ownBaseFinalCheckTable = ownBaseFinalCheckCard.getByTestId(
    "gnss-own-base-final-check-table",
  );
  const ownBaseFinalCheckText = await ownBaseFinalCheckCard.innerText();
  assert(
    (await ownBaseFinalCheckTable.locator("tbody tr").count()) === 8 &&
      [
        "使用する点",
        "基準局座標",
        "座標の出どころ",
        "測地系・座標の時点",
        "求心",
        "アンテナ高",
        "固定状態",
        "上空視界・周辺環境",
        "これで基準局そのものの準備はできました",
      ].every((expectedText) => ownBaseFinalCheckText.includes(expectedText)),
    "第5章カード8の基準局使用前8項目確認表が不足しています。",
  );

  const ownBaseNextCard = page.getByTestId("gnss-own-base-next-card");
  const ownBaseNextText = await ownBaseNextCard.innerText();
  assert(
    [
      "基準局の準備ができた",
      "基準局はGNSSを観測している",
      "移動局P1は基準局側の情報をまだ受け取っていない",
      "その情報をどうやって届ける？",
      "第6章 自前RTK② 補正情報を届ける",
      "どんな形で、どの経路を通って移動局へ届くのでしょうか？",
      "RTCM",
      "Ntrip",
      "Caster",
      "通信経路",
    ].every((expectedText) => ownBaseNextText.includes(expectedText)),
    "第5章カード9の第6章への接続が不足しています。",
  );

  const ownBaseStaticCards = ownBaseStationLesson.locator(
    '[data-gnss-own-base-card="2"], [data-gnss-own-base-card="3"], [data-gnss-own-base-card="4"], [data-gnss-own-base-card="5"], [data-gnss-own-base-card="6"], [data-gnss-own-base-card="7"], [data-gnss-own-base-card="8"]',
  );
  assert(
    (await ownBaseStaticCards.getByRole("button").count()) === 0,
    "第5章カード2～8へ不要な切替操作が追加されています。",
  );

  const ownBaseQuestionIds = [
    "gnss-own-base-station-q01-coordinate-basis",
    "gnss-own-base-station-q02-known-point",
    "gnss-own-base-station-q03-no-known-point",
    "gnss-own-base-station-q04-coordinate-source",
    "gnss-own-base-station-q05-antenna-installation",
    "gnss-own-base-station-q06-site-condition",
    "gnss-own-base-station-q07-final-check",
    "gnss-own-base-station-q08-next-correction-delivery",
  ];
  const ownBaseCorrectOptionIndexes = [1, 2, 0, 3, 1, 2, 0, 3];
  const ownBaseCorrectOptionLetters = ["B", "C", "A", "D", "B", "C", "A", "D"];
  assert(
    ["A", "B", "C", "D"].every(
      (letter) =>
        ownBaseCorrectOptionLetters.filter((current) => current === letter)
          .length === 2,
    ),
    "第5章8問の表示上の正答文字がA～D各2問ではありません。",
  );
  const ownBaseQuestionOne = page.getByTestId(
    `gnss-quiz-question-${ownBaseQuestionIds[0]}`,
  );
  const ownBaseQuestionOneOptions = ownBaseQuestionOne.locator(
    'input[type="radio"]',
  );
  await ownBaseFinalCheckTable.focus();
  await page.keyboard.press("Tab");
  const ownBaseStationVisibleFocus = await hasVisibleKeyboardFocus(
    ownBaseQuestionOneOptions.nth(0),
  );
  await page.keyboard.press("Space");
  const ownBaseStationKeyboardOperation =
    await ownBaseQuestionOneOptions.nth(0).isChecked();
  await ownBaseQuestionOne
    .getByRole("button", { name: "回答を確認する", exact: true })
    .click();
  const ownBaseQuestionOneFeedback = ownBaseQuestionOne.locator(
    ".gnss-quiz-feedback",
  );
  assert(
    ownBaseStationVisibleFocus &&
      ownBaseStationKeyboardOperation &&
      (await ownBaseQuestionOneFeedback
        .getByText("不正解", { exact: true })
        .isVisible()) &&
      (await ownBaseQuestionOneFeedback
        .getByText("正解：B", { exact: true })
        .isVisible()) &&
      (await ownBaseQuestionOneFeedback
        .getByRole("heading", { name: "Aを選んだ場合の解説", exact: true })
        .isVisible()) &&
      (await ownBaseQuestionOneFeedback
        .getByText(/FIXは相対測位の固定解.*自動修正するものではありません/)
        .isVisible()) &&
      (await ownBaseQuestionOneFeedback
        .getByRole("heading", { name: "解説", exact: true })
        .isVisible()),
    "第5章問1のキーボード操作、誤答固有理由、正解文字、正答理由が正しくありません。",
  );

  for (const [questionIndex, questionId] of ownBaseQuestionIds.entries()) {
    const question = page.getByTestId(`gnss-quiz-question-${questionId}`);
    const correctOptionIndex = ownBaseCorrectOptionIndexes[questionIndex];
    const correctOptionLetter = ownBaseCorrectOptionLetters[questionIndex];

    assert(
      correctOptionIndex !== undefined && correctOptionLetter !== undefined,
      `${questionId}の正答位置データがありません。`,
    );
    await question.locator('input[type="radio"]').nth(correctOptionIndex).check();
    await question
      .getByRole("button", { name: "回答を確認する", exact: true })
      .click();
    const feedback = question.locator(".gnss-quiz-feedback");
    assert(
      (await feedback.getByText("正解", { exact: true }).isVisible()) &&
        (await feedback
          .getByText(`正解：${correctOptionLetter}`, { exact: true })
          .isVisible()) &&
        (await feedback.locator(".gnss-quiz-selected-explanation").count()) ===
          0 &&
        (await feedback
          .getByRole("heading", { name: "解説", exact: true })
          .isVisible()) &&
        !(await feedback.innerText()).includes("正答"),
      `${questionId}の正答表示または重複のない解説が正しくありません。`,
    );
  }
  assert(
    (await ownBaseStationLesson
      .getByTestId("gnss-own-base-station-quiz-panel")
      .locator(".gnss-quiz-question")
      .count()) === 8,
    "GNSS第5章の確認問題が8問ではありません。",
  );

  await lessonNavigation
    .getByRole("button", { name: /第1章.*GNSS測量の全体像/ })
    .click();
  assert(
    (await overviewLesson.isVisible()) &&
      (await workflowButtons.nth(8).getAttribute("aria-current")) === "step" &&
      (await methodSelector
        .getByRole("button", { name: "CLAS", exact: true })
        .getAttribute("aria-pressed")) === "true" &&
      (await p1Result.isVisible()) &&
      (await questionThree.getByText("正解", { exact: true }).isVisible()) &&
      (await overviewLesson.getByText("5 / 5 章", { exact: true }).isVisible()),
    "第4章から戻ったときにGNSS第1章の状態が保持されません。",
  );
  await chapterTwoNavigationButton.click();
  assert(
    (await observationsLesson.isVisible()) &&
      (await travelTimeSlider.inputValue()) === "85" &&
      (await carrierSlider.inputValue()) === "9.5" &&
      (await hasIonosphereInfluenceButton.getAttribute("aria-pressed")) ===
        "true" &&
      (await page
        .getByTestId(`gnss-quiz-question-${observationQuestionIds[6]}`)
        .getByText("正解", { exact: true })
        .isVisible()),
    "GNSS章往復後に第2章の操作・問題状態が保持されません。",
  );
  await chapterThreeNavigationButton.click();
  assert(
    (await coordinateHeightLesson.isVisible()) &&
      (await geodeticRepresentationButton.getAttribute("aria-pressed")) === "true" &&
      (await planeCoordinateCard
        .getByTestId("gnss-plane-system-other-zone")
        .getAttribute("aria-pressed")) === "true" &&
      (await datumCard.getByTestId("gnss-datum-result").isVisible()) &&
      (await epochCard.getByTestId("gnss-epoch-aligned").getAttribute("aria-pressed")) ===
        "true" &&
      (await heightReferenceCard
        .getByTestId("gnss-height-reference-elevation")
        .getAttribute("aria-pressed")) === "true" &&
      (await heightConversionCard
        .getByTestId("gnss-height-conversion-misused")
        .getAttribute("aria-pressed")) === "true" &&
      (await antennaCard.getByTestId("gnss-antenna-static-flow").isVisible()) &&
      (await finalReviewTable.locator("tbody tr").count()) === 9 &&
      (await page
        .getByTestId(
          `gnss-quiz-question-${coordinateHeightQuestionIds[7]}`,
        )
        .getByText("正解", { exact: true })
        .isVisible()),
    "GNSS章往復後に第3章の操作・問題状態が保持されません。",
  );
  await chapterFourNavigationButton.click();
  assert(
    (await positioningMethodsLesson.isVisible()) &&
      (await offsetBaseCoordinateButton.getAttribute("aria-pressed")) === "true" &&
      (await candidatePanel.locator('[data-candidate-id="clas"]').isVisible()) &&
      (await selectionCard
        .getByTestId("gnss-condition-mobileConnection-unavailable")
        .getAttribute("aria-pressed")) === "true" &&
      (await page
        .getByTestId(`gnss-quiz-question-${positioningQuestionIds[7]}`)
        .getByText("正解", { exact: true })
        .isVisible()),
    "GNSS章往復後に第4章の操作・候補・問題状態が保持されません。",
  );
  await chapterFiveNavigationButton.click();
  assert(
    (await ownBaseStationLesson.isVisible()) &&
      (await ownBaseStationLesson
        .getByTestId("gnss-own-base-station-quiz-panel")
        .locator(".gnss-quiz-feedback")
        .count()) === 8 &&
      (await page
        .getByTestId(`gnss-quiz-question-${ownBaseQuestionIds[7]}`)
        .getByText("正解", { exact: true })
        .isVisible()) &&
      (await ownBaseStationLesson
        .getByRole("button", { name: "理解済み（解除する）" })
        .isVisible()),
    "GNSS章往復後に第5章の問題・理解状態が保持されません。",
  );

  const desktopMetrics = await getPageMetrics(page);
  assert(
    (await ownBaseStationLesson.isVisible()) &&
      desktopMetrics.scrollWidth <= desktopMetrics.clientWidth,
    `GNSS教材が1366px幅で横方向にはみ出しています: ${JSON.stringify(desktopMetrics)}`,
  );

  if (saveScreenshots) {
    const screenshotStyle = await page.addStyleTag({
      content: ".app-header, .skip-link { visibility: hidden !important; }",
    });
    try {
      await page.screenshot({
        fullPage: true,
        path: "/tmp/gnss-phase5-1366.png",
      });
      await ownBaseCoordinateSourceCard.screenshot({
        path: "/tmp/gnss-phase5-card3-1366.png",
      });
      await ownBaseFinalCheckCard.screenshot({
        path: "/tmp/gnss-phase5-card8-1366.png",
      });
    } finally {
      await screenshotStyle.evaluate((style) => style.remove());
    }
  }

  await page.getByRole("button", { name: "測量の基礎", exact: true }).click();
  assert(
    await page
      .getByRole("heading", { name: /測量は、.*点と点の関係/ })
      .isVisible(),
    "GNSSから測量の基礎へ移動できません。",
  );
  await page.getByRole("button", { name: "多角測量", exact: true }).click();
  assert(
    await page
      .getByRole("heading", {
        name: "閉合トラバース測量シミュレーター",
      })
      .isVisible(),
    "GNSSから閉合トラバースへ移動できません。",
  );
  await page.getByRole("button", { name: "GNSS / Drogger", exact: true }).click();

  assert(
    (await ownBaseStationLesson.isVisible()) &&
      (await page
        .getByTestId(
          `gnss-quiz-question-${ownBaseQuestionIds[7]}`,
        )
        .getByText("正解", { exact: true })
        .isVisible()) &&
      (await ownBaseStationLesson
        .getByRole("button", { name: "理解済み（解除する）" })
        .isVisible()),
    "教材往復後にGNSS第5章の問題・理解状態が保持されません。",
  );
  await chapterTwoNavigationButton.click();
  assert(
    (await observationsLesson.isVisible()) &&
      (await travelTimeSlider.inputValue()) === "85" &&
      (await pseudorangeCard
        .getByRole("button", { name: "現実のGNSS", exact: true })
        .getAttribute("aria-pressed")) === "true" &&
      (await carrierSlider.inputValue()) === "9.5" &&
      (await ambiguityCard
        .locator(".gnss-observations-fix-flow")
        .getByText("FIX", { exact: true })
        .isVisible()) &&
      (await hasIonosphereInfluenceButton.getAttribute("aria-pressed")) ===
        "true" &&
      (await multiGnssCard.getByText("multi GNSS", { exact: true }).isVisible()) &&
      (await page
        .getByTestId(`gnss-quiz-question-${observationQuestionIds[6]}`)
        .getByText("正解", { exact: true })
        .isVisible()) &&
      (await observationsLesson.getByText("5 / 5 章", { exact: true }).isVisible()),
    "教材往復後にGNSS第2章の操作・問題・理解状態が保持されません。",
  );
  await chapterThreeNavigationButton.click();
  assert(
    (await coordinateHeightLesson.isVisible()) &&
      (await datumCard.getByTestId("gnss-datum-result").isVisible()) &&
      (await page
        .getByTestId(
          `gnss-quiz-question-${coordinateHeightQuestionIds[7]}`,
        )
        .getByText("正解", { exact: true })
        .isVisible()),
    "教材往復後にGNSS第3章の状態が保持されません。",
  );
  await chapterFourNavigationButton.click();
  assert(
    (await positioningMethodsLesson.isVisible()) &&
      (await offsetBaseCoordinateButton.getAttribute("aria-pressed")) === "true" &&
      (await candidatePanel.locator('[data-candidate-id="clas"]').isVisible()) &&
      (await page
        .getByTestId(`gnss-quiz-question-${positioningQuestionIds[7]}`)
        .getByText("正解", { exact: true })
        .isVisible()),
    "教材往復後にGNSS第4章の操作・候補・問題状態が保持されません。",
  );
  await chapterFiveNavigationButton.click();
  assert(
    (await ownBaseStationLesson.isVisible()) &&
      (await page
        .getByTestId(`gnss-quiz-question-${ownBaseQuestionIds[7]}`)
        .getByText("正解", { exact: true })
        .isVisible()),
    "教材往復後にGNSS第5章の問題状態が保持されません。",
  );

  const storageKeysAfterGnssOperations = await page.evaluate(() =>
    Object.keys(window.localStorage).sort(),
  );
  assert(
    JSON.stringify(storageKeysAfterGnssOperations) ===
      JSON.stringify(storageKeysBeforeGnssOperations) &&
      storageKeysAfterGnssOperations.every(
        (storageKey) => !storageKey.toLowerCase().includes("gnss"),
      ),
    "GNSS操作によってlocalStorageキーが追加・変更されました。",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.locator(".mobile-section-navigation").isVisible(),
    "390px幅で教材切替が表示されません。",
  );
  assert(
    (await page
      .locator(".mobile-section-navigation")
      .getByRole("button")
      .count()) === 3,
    "390px幅の教材切替が3教材ではありません。",
  );

  assert(
    (await ownBaseStationLesson.isVisible()) &&
      (await page
        .getByTestId(
          `gnss-quiz-question-${ownBaseQuestionIds[7]}`,
        )
        .getByText("正解", { exact: true })
        .isVisible()),
    "390px幅で第5章の確認問題結果を表示できません。",
  );
  await chapterFourNavigationButton.click();
  assert(
    (await positioningMethodsLesson.isVisible()) &&
      (await offsetBaseCoordinateButton.getAttribute("aria-pressed")) === "true" &&
      (await candidatePanel.locator('[data-candidate-id="clas"]').isVisible()),
    "390px幅で第4章の自前RTK・候補選定を表示できません。",
  );
  const mobileCoordinatePanelLayout = await ownBaseResult
    .locator("[data-coordinate-field]")
    .evaluateAll((elements) => {
      const rowCounts = new Map();

      for (const element of elements) {
        const top = Math.round(element.getBoundingClientRect().top);
        rowCounts.set(top, (rowCounts.get(top) ?? 0) + 1);
      }

      return {
        count: elements.length,
        rowItemCounts: [...rowCounts.values()].sort(),
      };
    });
  await chapterFiveNavigationButton.click();
  const mobileOwnBaseTableContainment = await Promise.all(
    [ownBaseCoordinateSourceTable, ownBaseFinalCheckTable].map((tableRegion) =>
      tableRegion.evaluate((element) => {
        const rect = element.getBoundingClientRect();

        return {
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          withinViewport:
            rect.left >= -1 && rect.right <= window.innerWidth + 1,
        };
      }),
    ),
  );
  const mobileMetrics = await getPageMetrics(page);
  const mobileOverflowElements = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".gnss-page, .gnss-page *"))
      .filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          (rect.right > window.innerWidth + 1 || rect.left < -1)
        );
      })
      .slice(0, 20)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return {
          tag: element.tagName.toLowerCase(),
          className: element.className.baseVal ?? element.className,
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          overflowX: style.overflowX,
        };
      }),
  );
  assert(
    mobileCoordinatePanelLayout.count === 4 &&
      JSON.stringify(mobileCoordinatePanelLayout.rowItemCounts) ===
        JSON.stringify([2, 2]) &&
      (await ownBaseStationLesson.isVisible()) &&
      mobileOwnBaseTableContainment.every(
        (table) =>
          table.withinViewport && table.clientWidth <= table.scrollWidth,
      ) &&
      mobileMetrics.scrollWidth <= mobileMetrics.clientWidth,
    `GNSS第4章の2列×2段または第5章の390px表示が正しくありません: ${JSON.stringify({ mobileCoordinatePanelLayout, mobileOwnBaseTableContainment, mobileMetrics, mobileOverflowElements })}`,
  );

  if (saveScreenshots) {
    const screenshotStyle = await page.addStyleTag({
      content: ".app-header, .skip-link { visibility: hidden !important; }",
    });
    try {
      await page.screenshot({
        fullPage: true,
        path: "/tmp/gnss-phase5-390.png",
      });
      await ownBaseCoordinateSourceCard.screenshot({
        path: "/tmp/gnss-phase5-card3-390.png",
      });
      await ownBaseFinalCheckCard.screenshot({
        path: "/tmp/gnss-phase5-card8-390.png",
      });
    } finally {
      await screenshotStyle.evaluate((style) => style.remove());
    }
  }

  await chapterThreeNavigationButton.click();
  assert(
    (await coordinateHeightLesson.isVisible()) &&
      (await heightReferenceCard
        .getByText("P1（位置は固定）", { exact: true })
        .isVisible()) &&
      (await finalReviewTable.locator("tbody tr").count()) === 9,
    "390px幅で第3章の固定P1図または9項目確認表を表示できません。",
  );

  const invalidNumberTokens = await page.evaluate(() =>
    ["NaN", "Infinity", "undefined"].filter((token) =>
      document.body.innerText.includes(token),
    ),
  );
  assert(
    invalidNumberTokens.length === 0,
    `不正な数値文字列が表示されています: ${invalidNumberTokens.join(", ")}`,
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "GNSS / Drogger", exact: true }).click();
  const reloadedOverviewLesson = page.locator(
    '[data-lesson-id="gnss-overview"]',
  );
  assert(
      (await reloadedOverviewLesson.isVisible()) &&
      (await reloadedOverviewLesson
        .getByText("0 / 5 章", { exact: true })
        .isVisible()),
    "再読込み後にGNSS第1章と0 / 5章の初期進捗へ戻りません。",
  );
  await page
    .locator(".gnss-lesson-navigation")
    .getByRole("button", { name: /第2章.*GNSSは何を観測しているのか/ })
    .click();
  const reloadedObservationsLesson = page.locator(
    '[data-lesson-id="gnss-observations"]',
  );
  const reloadedTravelTimeCard = page.getByTestId(
    "gnss-observations-travel-time-card",
  );
  const reloadedPseudorangeCard = page.getByTestId(
    "gnss-observations-pseudorange-card",
  );
  const reloadedCarrierCard = page.getByTestId(
    "gnss-observations-carrier-card",
  );
  const reloadedFrequencyCard = page.getByTestId(
    "gnss-observations-frequency-card",
  );
  const reloadedMultiGnssCard = page.getByTestId(
    "gnss-observations-multi-gnss-card",
  );
  assert(
    (await reloadedObservationsLesson.isVisible()) &&
      (await reloadedTravelTimeCard
        .getByTestId("gnss-travel-time-slider")
        .inputValue()) === "70" &&
      (await reloadedPseudorangeCard
        .getByRole("button", { name: "理想的な場合", exact: true })
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedCarrierCard
        .getByTestId("gnss-carrier-movement-slider")
        .inputValue()) === "5" &&
      (await reloadedFrequencyCard
        .getByRole("button", { name: "影響なし", exact: true })
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedMultiGnssCard.getByLabel(/^GPS/).isChecked()) &&
      !(await reloadedMultiGnssCard.getByLabel(/^GLONASS/).isChecked()) &&
      !(await reloadedMultiGnssCard.getByLabel(/QZSS/).isChecked()) &&
      (await page
        .getByTestId("gnss-observations-quiz-panel")
        .locator(".gnss-quiz-feedback")
        .count()) === 0 &&
      (await reloadedObservationsLesson
        .getByRole("button", { name: "この章を理解できた" })
        .isVisible()),
    "再読込み後にGNSS第2章のReact状態が初期化されません。",
  );

  await page
    .locator(".gnss-lesson-navigation")
    .getByRole("button", { name: /第3章.*GNSSの座標と高さ/ })
    .click();
  const reloadedCoordinateHeightLesson = page.locator(
    '[data-lesson-id="gnss-coordinate-height"]',
  );
  const reloadedFinalCheckCard = page.getByTestId("gnss-final-check-card");
  assert(
    (await reloadedCoordinateHeightLesson.isVisible()) &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-earth-position-japan")
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-representation-earth-centered")
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-plane-system-zone-9")
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-datum-value")
        .getByText("？？？", { exact: true })
        .isVisible()) &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-epoch-unaligned")
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-height-reference-ellipsoid")
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-height-conversion-unapplied")
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-antenna-height-selector")
        .count()) === 0 &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-antenna-static-flow")
        .isVisible()) &&
      (await reloadedFinalCheckCard
        .getByTestId("gnss-final-review-table")
        .locator("tbody tr")
        .count()) === 9 &&
      (await reloadedFinalCheckCard
        .getByTestId("gnss-final-check-all")
        .count()) === 0 &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-coordinate-height-quiz-panel")
        .locator(".gnss-quiz-feedback")
        .count()) === 0 &&
      (await reloadedCoordinateHeightLesson
        .getByRole("button", { name: "この章を理解できた" })
        .isVisible()),
    "再読込み後にGNSS第3章のReact状態が初期化されません。",
  );

  await page
    .locator(".gnss-lesson-navigation")
    .getByRole("button", { name: /第4章.*GNSS測位方式を比較する/ })
    .click();
  const reloadedPositioningMethodsLesson = page.locator(
    '[data-lesson-id="gnss-positioning-methods"]',
  );
  const reloadedOwnBaseCard = page.getByTestId(
    "gnss-positioning-own-base-card",
  );
  const reloadedSelectionCard = page.getByTestId(
    "gnss-positioning-selection-card",
  );
  const reloadedCandidatePanel = reloadedSelectionCard.getByTestId(
    "gnss-positioning-candidates",
  );
  const reloadedOwnBaseResultText = await reloadedOwnBaseCard
    .getByTestId("gnss-own-base-result")
    .innerText();
  assert(
    (await reloadedPositioningMethodsLesson.isVisible()) &&
      (await reloadedOwnBaseCard
        .getByTestId("gnss-own-base-correct")
        .getAttribute("aria-pressed")) === "true" &&
      reloadedOwnBaseResultText.includes("1000.000 m") &&
      reloadedOwnBaseResultText.includes("1012.345 m") &&
      reloadedOwnBaseResultText.includes("FIX") &&
      (await reloadedSelectionCard
        .getByTestId("gnss-positioning-preset-general-good-network")
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedCandidatePanel
        .locator('[data-candidate-id="network-rtk"]')
        .isVisible()) &&
      (await reloadedSelectionCard
        .getByTestId("gnss-positioning-sky-warning")
        .count()) === 0 &&
      (await reloadedPositioningMethodsLesson
        .getByTestId("gnss-positioning-methods-quiz-panel")
        .locator(".gnss-quiz-feedback")
        .count()) === 0 &&
      (await reloadedPositioningMethodsLesson
        .getByRole("button", { name: "この章を理解できた" })
        .isVisible()),
    "再読込み後にGNSS第4章のReact状態が初期化されません。",
  );

  await page
    .locator(".gnss-lesson-navigation")
    .getByRole("button", { name: /第5章.*自前RTK① 基準局をつくる/ })
    .click();
  const reloadedOwnBaseStationLesson = page.locator(
    '[data-lesson-id="gnss-own-base-station"]',
  );
  assert(
    (await reloadedOwnBaseStationLesson.isVisible()) &&
      (await reloadedOwnBaseStationLesson
        .locator("[data-gnss-own-base-card]")
        .count()) === 9 &&
      (await reloadedOwnBaseStationLesson
        .getByTestId("gnss-own-base-station-quiz-panel")
        .locator(".gnss-quiz-feedback")
        .count()) === 0 &&
      (await reloadedOwnBaseStationLesson
        .getByRole("button", { name: "この章を理解できた" })
        .isVisible()),
    "再読込み後にGNSS第5章のReact状態が初期化されません。",
  );

  const storageKeysAfterReload = await page.evaluate(() =>
    Object.keys(window.localStorage).sort(),
  );
  assert(
    JSON.stringify(storageKeysAfterReload) ===
      JSON.stringify(storageKeysBeforeGnssOperations) &&
      storageKeysAfterReload.every(
        (storageKey) => !storageKey.toLowerCase().includes("gnss"),
      ),
    "再読込み後にGNSS用localStorageキーが追加されています。",
  );

  assert(
    consoleErrors.length === 0,
    `コンソールエラー: ${consoleErrors.join(" | ")}`,
  );
  assert(
    pageErrors.length === 0,
    `ページ例外: ${pageErrors.join(" | ")}`,
  );
  assert(
    externalApiRequests.length === 0,
    `実行時に外部API通信があります: ${externalApiRequests.join(" | ")}`,
  );

  console.log(
    JSON.stringify(
      {
        lessonIds: [
          "gnss-overview",
          "gnss-observations",
          "gnss-coordinate-height",
          "gnss-positioning-methods",
          "gnss-own-base-station",
        ],
        representativeCase: "一般の調査・測量",
        workflowSteps: 9,
        methods: 3,
        positioningStates: ["SINGLE", "FLOAT", "FIX"],
        qualityChecks: 8,
        overviewQuizQuestionsAnswered: 3,
        observationsCards: 9,
        observationsQuizQuestionsAnswered: 7,
        coordinateHeightCards: 10,
        coordinateHeightQuizQuestionsAnswered: 8,
        positioningMethodsCards: 9,
        positioningMethodCount: 6,
        positioningMethodsQuizQuestionsAnswered: 8,
        ownBaseStationCards: 9,
        ownBaseStationQuizQuestionsAnswered: 8,
        statePreservedAcrossCourses: true,
        stateResetAfterReload: true,
        keyboardOperation: true,
        visibleFocus: true,
        observationsKeyboardOperation,
        observationsVisibleFocus,
        coordinateHeightKeyboardOperation,
        coordinateHeightVisibleFocus,
        positioningMethodsKeyboardOperation,
        positioningMethodsVisibleFocus,
        ownBaseStationKeyboardOperation,
        ownBaseStationVisibleFocus,
        localStorageKeysUnchanged: true,
        desktopMetrics,
        mobileMetrics,
        consoleErrors,
        pageErrors,
        externalApiRequests,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
