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

  await page.getByRole("button", { name: "測量の基礎", exact: true }).click();
  assert(
    await page
      .getByRole("heading", { name: /測量は、.*点と点の関係/ })
      .isVisible(),
    "測量の基礎を開けません。",
  );

  await page.getByRole("button", { name: "GNSS / Drogger", exact: true }).click();
  assert(
    (await page.getByRole("heading", { name: "GNSS測量", exact: true }).isVisible()) &&
      (await page
        .getByRole("heading", { name: "GNSS測量の全体像", exact: true })
        .isVisible()),
    "GNSS教材または第1章を開けません。",
  );
  assert(
    (await page.locator('[data-lesson-id="gnss-overview"]').count()) === 1,
    "安定した章ID gnss-overview が画面へ反映されていません。",
  );
  const overviewLesson = page.locator('[data-lesson-id="gnss-overview"]');
  const lessonNavigation = page.locator(".gnss-lesson-navigation");
  assert(
    (await lessonNavigation.getByRole("button").count()) === 3,
    "GNSS教材の利用可能な章が3章ではありません。",
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
    await overviewLesson.getByText("0 / 3 章", { exact: true }).isVisible(),
    "GNSS教材の初期進捗が0 / 3章ではありません。",
  );
  await understoodButton.click();
  assert(
    await overviewLesson.getByText("1 / 3 章", { exact: true }).isVisible(),
    "GNSS第1章の理解済み進捗が1 / 3章になりません。",
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
      (await page.getByText("DG-RPO1RWS + u-blox ANN-MB-00", { exact: true }).isVisible()),
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
    await observationsLesson.getByText("2 / 3 章", { exact: true }).isVisible(),
    "GNSS第2章の理解済み操作で進捗が2 / 3章になりません。",
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
    await coordinateHeightLesson.getByText("3 / 3 章", { exact: true }).isVisible(),
    "GNSS第3章の理解済み操作で進捗が3 / 3章になりません。",
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
      "Xc",
      "Yc",
      "Zc",
      "-3959340.298 m",
      "3352854.354 m",
      "3697471.502 m",
      "教材派生値",
      "地心直交座標Xc・Yc・Zcと、日本の平面直角座標X・Yは別の座標です。",
    ].every((expectedText) => earthCenteredCardText.includes(expectedText)),
    "カード2のG0地心直交座標、出典区分、平面直角座標との区別が不足しています。",
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
        "数値の表し方が変わっただけで、G0が別の地点へ移動したわけではありません。",
      ].every((expectedText) => geodeticCardText.includes(expectedText)),
    "カード3の座標表現切替または可視フォーカス付きキーボード操作が正しくありません。",
  );

  const planeCoordinateCard = page.getByTestId("gnss-plane-coordinate-card");
  const planeZoneNineText = await planeCoordinateCard
    .getByTestId("gnss-plane-zone-9-result")
    .innerText();
  assert(
    planeZoneNineText.includes("X = -37928.1965 m") &&
      planeZoneNineText.includes("Y = -8327.6987 m") &&
      planeZoneNineText.includes("確認済み換算値") &&
      planeZoneNineText.includes("X：北方向が正、Y：東方向が正"),
    "カード4に第IX系の確認済みX・Yまたは方向規約が表示されません。",
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
      "ITRF",
      "GRS80楕円体",
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
      "公表成果の基準となる時点",
      "実際に観測した時点",
      "JGD2024 ≠ すべての座標の元期が2024年",
      "2011年5月24日",
      "2024年6月1日",
      "1000.035 m",
      "999.982 m",
      "+0.035 m",
      "-0.018 m",
      "実在地点の変動量ではありません",
    ].every((expectedText) => epochCardText.includes(expectedText)),
    "カード6の元期・今期、実際の基準日例、T1仮想変位が不足しています。",
  );
  await epochCard.getByTestId("gnss-epoch-aligned").click();
  assert(
    await epochCard.getByText("✓ 同じ基準時点で比較", { exact: true }).isVisible(),
    "カード6で元期へそろえた状態に切り替えられません。",
  );

  const heightReferenceCard = page.getByTestId("gnss-height-reference-card");
  await heightReferenceCard.getByTestId("gnss-height-reference-elevation").click();
  assert(
    (await heightReferenceCard
      .getByText("標高 26.6800 m", { exact: true })
      .isVisible()) &&
      (await heightReferenceCard
        .getByText(/平均海面と整合する、重力を考慮した高さの基準面/)
        .isVisible()) &&
      (await heightReferenceCard
        .getByText(/楕円体高と標高は、同じG0までの高さでも基準面が異なります/)
        .isVisible()),
    "カード7で高さ基準面を標高へ切り替えられません。",
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
        .isVisible()),
    "カード8でジオイド適用後の標高とモデルを確認できません。",
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
  await antennaCard.getByTestId("gnss-antenna-height-2-1").click();
  const antennaResultText = await antennaCard
    .getByTestId("gnss-antenna-result")
    .innerText();
  assert(
    antennaResultText.includes("2.100 m") &&
      antennaResultText.includes("49.732 m") &&
      antennaResultText.includes("-0.100 m") &&
      antennaResultText.includes("10 cm低いP1標高") &&
      (await antennaCard
        .getByText(/アンテナ基準位置・位相中心補正等も関係/)
        .isVisible()),
    "カード9で2.100m誤入力と10cmの高さ影響を表示できません。",
  );

  const finalCheckCard = page.getByTestId("gnss-final-check-card");
  await finalCheckCard
    .getByTestId("gnss-final-issue-wrong-antenna-height")
    .click();
  assert(
    (await finalCheckCard
      .getByTestId("gnss-final-issue-result")
      .getByText("測位状態はFIXのままです。", { exact: true })
      .isVisible()) &&
      (await finalCheckCard
        .getByTestId("gnss-final-issue-result")
        .getByText("入力値 2.100 m ×", { exact: true })
        .isVisible()),
    "カード10でFIXのままアンテナ高誤入力を表示できません。",
  );
  await finalCheckCard.getByTestId("gnss-final-check-all").click();
  assert(
    (await finalCheckCard
      .getByText("✓ FIXと6つの成果条件を確認しました。", { exact: true })
      .isVisible()) &&
      (await finalCheckCard.locator('.gnss-coordinate-quality-grid [aria-pressed="true"]').count()) ===
        6,
    "カード10で全成果条件を正しい状態へできません。",
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
  const coordinateHeightCorrectOptionIndexes = [1, 2, 0, 3, 1, 2, 0, 3];
  const coordinateHeightCorrectOptionLetters = ["B", "C", "A", "D", "B", "C", "A", "D"];
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
        .getByText("正解：B", { exact: true })
        .isVisible()) &&
      (await coordinateHeightQuestionOneFeedback
        .getByRole("heading", { name: "Aを選んだ場合の解説", exact: true })
        .isVisible()) &&
      (await coordinateHeightQuestionOneFeedback
        .getByText(/座標表現を切り替えても対象地点P1は同じ/)
        .isVisible()),
    "第3章問1の誤答固有理由と正解文字が表示されません。",
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
      (await overviewLesson.getByText("3 / 3 章", { exact: true }).isVisible()),
    "第3章から戻ったときにGNSS第1章の状態が保持されません。",
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
      (await antennaCard
        .getByTestId("gnss-antenna-height-2-1")
        .getAttribute("aria-pressed")) === "true" &&
      (await finalCheckCard
        .getByTestId("gnss-final-quality-status")
        .getByText("✓ FIXと6つの成果条件を確認しました。", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId(
          `gnss-quiz-question-${coordinateHeightQuestionIds[7]}`,
        )
        .getByText("正解", { exact: true })
        .isVisible()),
    "GNSS章往復後に第3章の操作・問題状態が保持されません。",
  );

  const desktopMetrics = await getPageMetrics(page);
  assert(
    desktopMetrics.scrollWidth <= desktopMetrics.clientWidth,
    `GNSS教材が1366px幅で横方向にはみ出しています: ${JSON.stringify(desktopMetrics)}`,
  );

  if (saveScreenshots) {
    await page.screenshot({
      fullPage: true,
      path: "/tmp/gnss-phase3-1366.png",
    });
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
    (await coordinateHeightLesson.isVisible()) &&
      (await datumCard.getByTestId("gnss-datum-result").isVisible()) &&
      (await epochCard.getByTestId("gnss-epoch-aligned").getAttribute("aria-pressed")) ===
        "true" &&
      (await antennaCard
        .getByTestId("gnss-antenna-height-2-1")
        .getAttribute("aria-pressed")) === "true" &&
      (await page
        .getByTestId(
          `gnss-quiz-question-${coordinateHeightQuestionIds[7]}`,
        )
        .getByText("正解", { exact: true })
        .isVisible()) &&
      (await coordinateHeightLesson
        .getByRole("button", { name: "理解済み（解除する）" })
        .isVisible()),
    "教材往復後にGNSS第3章の操作・問題・理解状態が保持されません。",
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
      (await observationsLesson.getByText("3 / 3 章", { exact: true }).isVisible()),
    "教材往復後にGNSS第2章の操作・問題・理解状態が保持されません。",
  );
  await chapterThreeNavigationButton.click();

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
    mobileMetrics.scrollWidth <= mobileMetrics.clientWidth,
    `GNSS教材が390px幅で横方向にはみ出しています: ${JSON.stringify({ mobileMetrics, mobileOverflowElements })}`,
  );
  assert(
    (await coordinateHeightLesson.isVisible()) &&
      (await geodeticRepresentationButton.getAttribute("aria-pressed")) ===
        "true" &&
      (await epochCard.getByTestId("gnss-epoch-aligned").getAttribute("aria-pressed")) ===
        "true" &&
      (await antennaCard
        .getByTestId("gnss-antenna-height-2-1")
        .getAttribute("aria-pressed")) === "true" &&
      (await page
        .getByTestId(
          `gnss-quiz-question-${coordinateHeightQuestionIds[7]}`,
        )
        .getByText("正解", { exact: true })
        .isVisible()),
    "390px幅で第3章の座標・時点・アンテナ高または確認問題結果を表示できません。",
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

  if (saveScreenshots) {
    await page.screenshot({
      fullPage: true,
      path: "/tmp/gnss-phase3-390.png",
    });
  }

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "GNSS / Drogger", exact: true }).click();
  const reloadedOverviewLesson = page.locator(
    '[data-lesson-id="gnss-overview"]',
  );
  assert(
      (await reloadedOverviewLesson.isVisible()) &&
      (await reloadedOverviewLesson
        .getByText("0 / 3 章", { exact: true })
        .isVisible()),
    "再読込み後にGNSS第1章と0 / 3章の初期進捗へ戻りません。",
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
        .getByTestId("gnss-antenna-height-2-0")
        .getAttribute("aria-pressed")) === "true" &&
      (await reloadedFinalCheckCard
        .getByText("要確認：成果条件 0 / 6", { exact: true })
        .isVisible()) &&
      (await reloadedCoordinateHeightLesson
        .getByTestId("gnss-coordinate-height-quiz-panel")
        .locator(".gnss-quiz-feedback")
        .count()) === 0 &&
      (await reloadedCoordinateHeightLesson
        .getByRole("button", { name: "この章を理解できた" })
        .isVisible()),
    "再読込み後にGNSS第3章のReact状態が初期化されません。",
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
        statePreservedAcrossCourses: true,
        stateResetAfterReload: true,
        keyboardOperation: true,
        visibleFocus: true,
        observationsKeyboardOperation,
        observationsVisibleFocus,
        coordinateHeightKeyboardOperation,
        coordinateHeightVisibleFocus,
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
