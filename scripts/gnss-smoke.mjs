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

  const storageKeysBeforeGnssOperations = await page.evaluate(() =>
    Object.keys(window.localStorage).sort(),
  );
  assert(
    storageKeysBeforeGnssOperations.every(
      (storageKey) => !storageKey.toLowerCase().includes("gnss"),
    ),
    "GNSS教材用localStorageキーが追加されています。",
  );

  const understoodButton = page.getByRole("button", {
    name: "この章を理解できた",
  });
  assert(
    await page.getByText("0 / 1 章", { exact: true }).isVisible(),
    "GNSS第1章の初期進捗が0 / 1章ではありません。",
  );
  await understoodButton.click();
  assert(
    await page.getByText("1 / 1 章", { exact: true }).isVisible(),
    "GNSS第1章の理解済み進捗が1 / 1章になりません。",
  );

  const purposeSelector = page.getByTestId("gnss-purpose-selector");
  const purposeButtons = purposeSelector.getByRole("button");
  assert(
    (await purposeButtons.count()) === 5,
    "GNSSの用途が5件ではありません。",
  );

  await purposeButtons.nth(0).focus();
  await page.keyboard.press("Tab");
  assert(
    await hasVisibleKeyboardFocus(purposeButtons.nth(1)),
    "GNSS用途ボタンのキーボードフォーカスが視認できません。",
  );
  await page.keyboard.press("Enter");
  assert(
    (await purposeButtons.nth(1).getAttribute("aria-pressed")) === "true",
    "GNSS用途をキーボードで切り替えられません。",
  );

  for (let index = 0; index < 5; index += 1) {
    await purposeButtons.nth(index).click();
    assert(
      (await purposeButtons.nth(index).getAttribute("aria-pressed")) === "true",
      `GNSS用途${index + 1}を切り替えられません。`,
    );
  }
  await purposeSelector
    .getByRole("button", { name: "オーリスの探査位置", exact: true })
    .click();
  assert(
    (await page.getByText("探査を実施した位置を座標として記録する", { exact: true }).isVisible()) &&
      (await page.getByText("平面位置 + 高さ", { exact: true }).isVisible()),
    "用途切替に目的と成果が連動しません。",
  );

  const workflowCard = page.getByTestId("gnss-workflow-card");
  const workflowButtons = workflowCard.locator(".gnss-workflow-selector button");
  assert(
    (await workflowButtons.count()) === 9,
    "GNSS現場フローが9工程ではありません。",
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
      (await p1Result.getByText("オーリス探査位置", { exact: true }).isVisible()),
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
  assert(
    (await questionOne.getByText("もう一度確認しましょう", { exact: true }).isVisible()) &&
      (await questionOne.getByText(/絶対座標が正しいことまでは確認しません/).isVisible()),
    "問1の誤答理由が表示されません。",
  );
  await questionOne.getByLabel(/相対関係を高精度に求めても/).check();
  await questionOne
    .getByRole("button", { name: "回答を確認する" })
    .click();
  assert(
    await questionOne.getByText("正解です", { exact: true }).isVisible(),
    "問1の正答理由を表示できません。",
  );

  const questionTwo = page.getByTestId("gnss-quiz-question-gnss-q02-fix-quality");
  await questionTwo.getByLabel(/基準局座標、基準局・移動局のアンテナ高/).check();
  await questionTwo
    .getByRole("button", { name: "回答を確認する" })
    .click();
  assert(
    (await questionTwo.getByText("正解です", { exact: true }).isVisible()) &&
      (await questionTwo.getByText(/FIXは重要な測位状態だが/).isVisible()),
    "問2の正答と正答理由が表示されません。",
  );

  const questionThree = page.getByTestId("gnss-quiz-question-gnss-q03-field-method");
  await questionThree.getByLabel(/CLAS対応受信機による測位を候補/).check();
  await questionThree
    .getByRole("button", { name: "回答を確認する" })
    .click();
  assert(
    (await questionThree.getByText("正解です", { exact: true }).isVisible()) &&
      (await questionThree.getByText(/携帯通信に依存しない高精度GNSS測位/).isVisible()),
    "問3の正答と正答理由が表示されません。",
  );

  const desktopMetrics = await getPageMetrics(page);
  assert(
    desktopMetrics.scrollWidth <= desktopMetrics.clientWidth,
    `GNSS教材が1366px幅で横方向にはみ出しています: ${JSON.stringify(desktopMetrics)}`,
  );

  if (saveScreenshots) {
    await page.screenshot({
      fullPage: true,
      path: "/tmp/gnss-phase1-1366.png",
    });
  }

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
    (await purposeSelector
      .getByRole("button", { name: "オーリスの探査位置", exact: true })
      .getAttribute("aria-pressed")) === "true" &&
      (await workflowButtons.nth(8).getAttribute("aria-current")) === "step" &&
      (await methodSelector
        .getByRole("button", { name: "CLAS", exact: true })
        .getAttribute("aria-pressed")) === "true" &&
      (await p1Result.isVisible()) &&
      (await qualityCard.getByText("P1の成果を使用する準備ができました", { exact: true }).isVisible()) &&
      (await questionThree.getByText("正解です", { exact: true }).isVisible()) &&
      (await page.getByText("1 / 1 章", { exact: true }).isVisible()),
    "教材往復後にGNSS第1章の操作・問題・理解状態が保持されません。",
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
    (await p1Result.isVisible()) &&
      (await questionThree.getByText("正解です", { exact: true }).isVisible()),
    "390px幅でFIX成果または確認問題結果を表示できません。",
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
      path: "/tmp/gnss-phase1-390.png",
    });
  }

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
        lessonId: "gnss-overview",
        purposes: 5,
        workflowSteps: 9,
        methods: 3,
        positioningStates: ["SINGLE", "FLOAT", "FIX"],
        qualityChecks: 8,
        quizQuestionsAnswered: 3,
        statePreservedAcrossCourses: true,
        keyboardOperation: true,
        visibleFocus: true,
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
