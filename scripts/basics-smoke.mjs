import { chromium } from "playwright";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function setRangeValue(locator, value) {
  await locator.evaluate((input, nextValue) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, String(value));
}

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173/";
const baseOrigin = new URL(baseUrl).origin;
const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const pageErrors = [];
const coordinateApiRequests = [];
const externalApiRequests = [];

try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(8_000);
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

    if (
      request.url().includes("vldb.gsi.go.jp") ||
      request.url().includes("surveycalc")
    ) {
      coordinateApiRequests.push(request.url());
    }
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  assert(
    await page.getByText("Phase 4", { exact: true }).isVisible(),
    "初期表示が既存の多角測量ではありません。",
  );
  const preservedTraverseDistanceInput = page.getByLabel(
    "aからp1の観測距離",
  );
  await preservedTraverseDistanceInput.fill("142.000");
  assert(
    (await preservedTraverseDistanceInput.inputValue()) === "142.000",
    "閉合トラバースの状態保持確認用入力を設定できません。",
  );

  await page.getByRole("button", { name: "測量の基礎" }).click();
  assert(
    await page.locator(".basics-hero").isVisible(),
    "「測量の基礎」教材が表示されていません。",
  );
  const lessonNavigationButtons = page.locator(
    ".basics-lesson-navigation > button",
  );
  const comingSoonLessonButtons = lessonNavigationButtons.filter({
    has: page.getByText("準備中", { exact: true }),
  });
  assert(
    (await lessonNavigationButtons.count()) === 9,
    "9章分の教材登録枠が表示されていません。",
  );
  assert(
    (await comingSoonLessonButtons.count()) === 0,
    "第1章～第9章のいずれかが「準備中」のままです。",
  );
  assert(
    await page.getByText("0 / 9 章", { exact: true }).isVisible(),
    "進捗の分母が実装済み9章になっていません。",
  );
  assert(
    (await page
      .getByRole("heading", {
        name: "測量の全体像と測点",
        exact: true,
      })
      .isVisible()) &&
      (await page
        .getByText(
          "何を求めるために、どの測量を行うのか説明できる。",
          { exact: true },
        )
        .isVisible()),
    "第1章のタイトルまたは到達目標が表示されていません。",
  );

  const purposePanel = page.locator("#survey-purpose-panel");
  assert(
    await purposePanel
      .getByText("基準点測量", { exact: true })
      .isVisible(),
    "「基準点を作る」の測量種類が表示されていません。",
  );
  await page.getByRole("tab", { name: "現況を測る" }).click();
  assert(
    (await purposePanel
      .getByText("地形測量", { exact: true })
      .isVisible()) &&
      (await purposePanel
        .getByText("現況平面図や地形図のデータ", { exact: true })
        .isVisible()),
    "「現況を測る」の観測内容または成果へ切り替わりません。",
  );
  await page.getByRole("tab", { name: "高さを求める" }).click();
  assert(
    (await purposePanel
      .getByText("水準測量", { exact: true })
      .isVisible()) &&
      (await purposePanel
        .getByText("新点の標高や点間の高低差", { exact: true })
        .isVisible()),
    "「高さを求める」の観測内容または成果へ切り替わりません。",
  );
  await page.getByRole("tab", { name: "現況を測る" }).click();

  assert(
    await page.getByText("測点 A", { exact: true }).isVisible(),
    "既知点Aの比較情報が初期表示されていません。",
  );

  await page.getByRole("button", { name: "P1：新点" }).click();
  assert(
    (await page.getByText("測点 P1", { exact: true }).isVisible()) &&
      (await page
        .locator(".basics-point-role-comparison")
        .getByText("現在分かっている情報", { exact: true })
        .isVisible()) &&
      (await page
        .locator(".basics-point-role-comparison")
        .getByText("測量での役割", { exact: true })
        .isVisible()) &&
      (await page
        .locator(".basics-point-role-comparison")
        .getByText("現地で確認すること", { exact: true })
        .isVisible()) &&
      (await page
        .locator(".basics-point-role-comparison")
        .getByText("測量後の状態", { exact: true })
        .isVisible()),
    "新点P1の4項目比較へ切り替わりません。",
  );

  const chapterOneDesktopMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterOneDesktopMetrics.scrollWidth <=
      chapterOneDesktopMetrics.clientWidth,
    `第1章が1366px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterOneDesktopMetrics,
    )}`,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const chapterOneMobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterOneMobileMetrics.scrollWidth <= chapterOneMobileMetrics.clientWidth,
    `第1章が390px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterOneMobileMetrics,
    )}`,
  );
  await page.setViewportSize({ width: 1366, height: 768 });

  await page.getByRole("button", { name: "多角測量" }).click();
  await page.getByRole("button", { name: "測量の基礎" }).click();
  assert(
    (await page.getByText("測点 P1", { exact: true }).isVisible()) &&
      (await page
        .getByRole("tab", { name: "現況を測る" })
        .getAttribute("aria-selected")) ===
        "true",
    "教材を往復すると第1章の目的または測点の選択状態が失われます。",
  );

  await page
    .getByRole("button", { name: "理解した・次の章へ" })
    .click();
  assert(
    await page.getByText("1 / 9 章", { exact: true }).isVisible() &&
      (await page
        .getByRole("heading", {
          name: "座標・標高・高さの基準",
          exact: true,
        })
        .isVisible()),
    "章の完了数または次章への進行が更新されません。",
  );

  assert(
    await page
      .getByText(
        "座標値だけでなく、座標系と高さの基準を確認する必要性を説明できる。",
        { exact: true },
      )
      .isVisible(),
    "第2章の到達目標が表示されていません。",
  );

  const coordinatePanel = page.locator("#coordinate-representation-panel");
  assert(
    (await coordinatePanel
      .getByText("北緯 35°39′29.1572″", { exact: true })
      .isVisible()) &&
      (await coordinatePanel
        .getByText("東経 139°44′28.8869″", { exact: true })
        .isVisible()),
    "固定サンプルの緯度・経度が表示されていません。",
  );

  await page
    .locator(".basics-coordinate-representation-selector")
    .getByRole("tab", { name: "平面直角座標", exact: true })
    .click();
  assert(
    (await coordinatePanel
      .getByText("-37928.1965", { exact: true })
      .isVisible()) &&
      (await coordinatePanel
        .getByText("-8327.6987", { exact: true })
        .isVisible()) &&
      (await coordinatePanel
        .getByText("第IX系（9系）", { exact: true })
        .isVisible()) &&
      (await coordinatePanel
        .getByText(/世界測地系（日本測地系2024）・平面直角座標系 第IX系/)
        .isVisible()),
    "固定サンプルの第IX系座標、座標系、系番号が表示されていません。",
  );

  await page
    .locator(".basics-coordinate-representation-selector")
    .getByRole("tab", { name: "標高を含む地点情報", exact: true })
    .click();
  const coordinateValues = coordinatePanel.locator(
    ".basics-coordinate-value-grid",
  );
  assert(
    (await coordinateValues
      .getByText("日本経緯度原点", { exact: true })
      .isVisible()) &&
      (await coordinateValues
        .getByText("26.680", { exact: true })
        .isVisible()),
    "同じ固定地点の標高を含む情報へ切り替わりません。",
  );

  const quadrantCases = [
    ["北東側", "X 正 ／ Y 正"],
    ["北西側", "X 正 ／ Y 負"],
    ["南東側", "X 負 ／ Y 正"],
    ["南西側", "X 負 ／ Y 負"],
  ];
  const quadrantSelector = page.locator(
    ".basics-coordinate-quadrant-selector",
  );
  const quadrantResult = page.locator(".basics-coordinate-quadrant-result");

  for (const [label, expected] of quadrantCases) {
    await quadrantSelector
      .getByRole("button", { name: new RegExp(`^${label}`) })
      .click();
    assert(
      await quadrantResult.getByText(expected, { exact: true }).isVisible(),
      `${label}で${expected}へ切り替わりません。`,
    );
  }

  const geoidHeight = page.locator(
    ".basics-height-live-values > .is-fixed dd",
  );
  const geoidHeightBefore = await geoidHeight.textContent();
  await page.locator("#ellipsoid-height-range").evaluate((input) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(input, "68.7053");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const elevationResult = page.locator(
    ".basics-height-live-values > .is-result dd",
  );
  const elevationResultText = await elevationResult.textContent();
  assert(
    elevationResultText?.replace(/\s/g, "") === "32.0000m",
    `楕円体高の操作から標高を更新できません: ${
      elevationResultText ?? "値なし"
    }`,
  );
  assert(
    geoidHeightBefore === (await geoidHeight.textContent()) &&
      geoidHeightBefore?.replace(/\s/g, "") === "36.7053m",
    "同一地点の操作中にジオイド高が変わりました。",
  );
  assert(
    await page
      .locator(".basics-height-relation-equation")
      .getByText("68.7053 − 36.7053 ＝ 32.0000 m", { exact: true })
      .isVisible(),
    "標高＝楕円体高−ジオイド高の計算過程が更新されません。",
  );

  const heightReferenceSelector = page.locator(
    ".basics-height-reference-selector",
  );
  await heightReferenceSelector
    .getByRole("tab", { name: "標高", exact: true })
    .click();
  const heightReferencePanel = page.locator("#height-reference-panel");
  assert(
    (await heightReferencePanel
      .getByText("32.0000 m", { exact: true })
      .isVisible()) &&
      (await heightReferencePanel
        .getByText(/ジオイド面を基準とする一般的な土地の高さ/)
        .isVisible()),
    "高さの基準を標高へ切り替えて用途を比較できません。",
  );

  const heightPointTitles = await page
    .locator(".basics-height-point-grid h3")
    .allTextContents();
  assert(
    JSON.stringify(heightPointTitles) ===
      JSON.stringify(["BM（Benchmark、水準点）", "基準点"]) &&
      (await page
        .getByText(/BMと水準点を別種類の点として扱わず/)
        .isVisible()),
    `BMと水準点が同一の用語として説明されていません: ${JSON.stringify(
      heightPointTitles,
    )}`,
  );

  const chapterTwoDesktopMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterTwoDesktopMetrics.scrollWidth <=
      chapterTwoDesktopMetrics.clientWidth,
    `第2章が1366px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterTwoDesktopMetrics,
    )}`,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const chapterTwoMobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterTwoMobileMetrics.scrollWidth <= chapterTwoMobileMetrics.clientWidth,
    `第2章が390px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterTwoMobileMetrics,
    )}`,
  );
  await page.setViewportSize({ width: 1366, height: 768 });

  await page.getByRole("button", { name: "多角測量" }).click();
  await page.getByRole("button", { name: "測量の基礎" }).click();
  assert(
    (await page
      .locator(".basics-coordinate-representation-selector")
      .getByRole("tab", {
        name: "標高を含む地点情報",
        exact: true,
      })
      .getAttribute("aria-selected")) ===
      "true" &&
      (await quadrantSelector
        .getByRole("button", { name: /^南西側/ })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await heightReferenceSelector
        .getByRole("tab", { name: "標高", exact: true })
        .getAttribute("aria-selected")) ===
        "true" &&
      (await page.locator("#ellipsoid-height-range").inputValue()) ===
        "68.7053",
    "教材を往復すると第2章の操作状態が失われます。",
  );

  await page.getByRole("button", { name: /距離測量/ }).click();
  assert(
    (await page
      .getByRole("heading", { name: "距離測量", exact: true })
      .isVisible()) &&
      (await page
        .getByText(
          "機器が直接測る距離と、成果で使用する距離を区別できる。",
          { exact: true },
        )
        .isVisible()),
    "第3章のタイトルまたは到達目標が表示されていません。",
  );

  const slopeDistanceRange = page.locator("#distance-slope-range");
  await slopeDistanceRange.evaluate((input) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(input, "65");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const heightDifferenceRange = page.locator("#distance-height-range");
  await heightDifferenceRange.evaluate((input) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(input, "25");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const distanceLiveValues = page.locator(
    ".basics-distance-live-values",
  );
  assert(
    (await distanceLiveValues
      .locator(".is-slope dd")
      .getByText("65.000 m", { exact: true })
      .isVisible()) &&
      (await distanceLiveValues
        .locator(".is-height dd")
        .getByText("+25.000 m", { exact: true })
        .isVisible()) &&
      (await distanceLiveValues
        .locator(".is-horizontal dd")
        .getByText("60.000 m", { exact: true })
        .isVisible()) &&
      (await page
        .locator(".basics-distance-equation")
        .getByText(
          "√(65.000² − 25.000²) ＝ 60.000 m",
          { exact: true },
        )
        .isVisible()),
    "斜距離・水平距離・高低差が直角三角形として連動しません。",
  );

  const distanceMethodSelector = page.locator(
    ".basics-distance-method-selector",
  );
  const distanceMethodPanel = page.locator("#distance-method-panel");
  await distanceMethodSelector
    .getByRole("tab", { name: /レーザー距離計/ })
    .click();
  assert(
    (await distanceMethodPanel
      .getByText("照射点までの直線距離", { exact: true })
      .isVisible()) &&
      (await distanceMethodPanel
        .getByText("用途と表示モードを確認した距離", { exact: true })
        .isVisible()),
    "レーザー距離計の直接値と成果距離へ切り替わりません。",
  );
  await distanceMethodSelector
    .getByRole("tab", { name: /^TS/ })
    .click();
  assert(
    (await distanceMethodPanel
      .getByText("プリズムまでの斜距離", { exact: true })
      .isVisible()) &&
      (await distanceMethodPanel
        .getByText("計算・補正後の水平距離と高低差", { exact: true })
        .isVisible()),
    "TSの直接値と成果距離へ切り替わりません。",
  );

  const prismModel = page.locator(".basics-distance-prism-model");
  await prismModel
    .getByRole("button", { name: "+30 mm", exact: true })
    .click();
  assert(
    (await prismModel
      .locator(".basics-distance-prism-values > .is-error dd")
      .getByText("+60 mm", { exact: true })
      .isVisible()) &&
      (await prismModel
        .locator(".basics-distance-prism-values > .is-result dd")
        .getByText("50.060 m", { exact: true })
        .isVisible()) &&
      (await prismModel
        .getByText("30 − (−30) ＝ +60 mm", { exact: true })
        .isVisible()) &&
      (await prismModel
        .getByText(/実務では符号規約を一般化せず/)
        .isVisible()),
    "プリズム定数の設定誤りを教材用簡略モデルで表示できません。",
  );

  const repeatCard = page.locator(".basics-distance-repeat-card");
  await repeatCard
    .getByRole("button", { name: "観測を1回追加", exact: true })
    .click();
  const repeatSummary = repeatCard.locator(
    ".basics-distance-repeat-summary",
  );
  assert(
    (await repeatSummary
      .getByText("4 回", { exact: true })
      .isVisible()) &&
      (await repeatSummary
        .getByText("50.0013 m", { exact: true })
        .isVisible()) &&
      (await repeatSummary
        .getByText("50.0040 m", { exact: true })
        .isVisible()) &&
      (await repeatSummary
        .getByText("49.9980 m", { exact: true })
        .isVisible()) &&
      (await repeatSummary
        .getByText("0.0060 m", { exact: true })
        .isVisible()),
    "反復観測の平均・最大・最小・最大最小差を集計できません。",
  );

  const scaleCard = page.locator(".basics-distance-scale-card");
  await scaleCard
    .getByRole("button", { name: "1:2500", exact: true })
    .click();
  assert(
    (await scaleCard
      .locator(".basics-distance-scale-result output")
      .getByText("10.00 mm", { exact: true })
      .isVisible()) &&
      (await scaleCard
        .getByText(
          "25.000 × 1000 ÷ 2500 ＝ 10.00 mm",
          { exact: true },
        )
        .isVisible()),
    "同じ現地距離を1:2500の図上距離へ切り替えられません。",
  );

  const chapterThreeDesktopMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterThreeDesktopMetrics.scrollWidth <=
      chapterThreeDesktopMetrics.clientWidth,
    `第3章が1366px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterThreeDesktopMetrics,
    )}`,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const chapterThreeMobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterThreeMobileMetrics.scrollWidth <=
      chapterThreeMobileMetrics.clientWidth,
    `第3章が390px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterThreeMobileMetrics,
    )}`,
  );
  await page.setViewportSize({ width: 1366, height: 768 });

  await page.getByRole("button", { name: "多角測量" }).click();
  await page.getByRole("button", { name: "測量の基礎" }).click();
  assert(
    (await page
      .getByRole("heading", { name: "距離測量", exact: true })
      .isVisible()) &&
      (await slopeDistanceRange.inputValue()) === "65" &&
      (await heightDifferenceRange.inputValue()) === "25" &&
      (await distanceMethodSelector
        .getByRole("tab", { name: /^TS/ })
        .getAttribute("aria-selected")) ===
        "true" &&
      (await prismModel
        .getByRole("button", { name: "+30 mm", exact: true })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await repeatSummary
        .getByText("4 回", { exact: true })
        .isVisible()) &&
      (await scaleCard
        .getByRole("button", { name: "1:2500", exact: true })
        .getAttribute("aria-pressed")) ===
        "true",
    "教材を往復すると第3章の操作状態が失われます。",
  );

  await page
    .getByRole("button", { name: /角度・方位角・度分秒/ })
    .click();
  assert(
    (await page
      .getByRole("heading", {
        name: "角度・方位角・度分秒",
        exact: true,
      })
      .isVisible()) &&
      (await page
        .getByText(
          "北を0度とした方位角と、2方向間の水平角の違いを説明できる。",
          { exact: true },
        )
        .isVisible()) &&
      (await page
        .getByRole("heading", {
          name: "北を0°として、時計回りに方向を表す",
          exact: true,
        })
        .isVisible()),
    "第4章のタイトル、到達目標、教材内容が表示されていません。",
  );

  const azimuthRange = page.getByRole("slider", {
    name: "方位角を連続操作",
  });
  await azimuthRange.evaluate((input) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(input, "123.5");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  assert(
    (await page
      .getByTestId("azimuth-decimal")
      .getByText("123.500000°", { exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("azimuth-dms")
        .getByText("123°30′00″", { exact: true })
        .isVisible()),
    "方位角スライダーで十進度と度分秒が連動しません。",
  );

  const azimuthLab = page.locator(".basics-angle-lab");
  await azimuthLab
    .getByRole("button", { name: "359°59′50″", exact: true })
    .click();
  await azimuthLab
    .getByRole("button", { name: "方位角を1分増やす", exact: true })
    .click();
  assert(
    await page
      .getByTestId("azimuth-dms")
      .getByText("0°00′50″", { exact: true })
      .isVisible(),
    "359度付近からの加算を0～360度へ正規化できません。",
  );
  await azimuthLab
    .getByRole("button", { name: "0°00′10″", exact: true })
    .click();
  await azimuthLab
    .getByRole("button", { name: "方位角を1分減らす", exact: true })
    .click();
  assert(
    await page
      .getByTestId("azimuth-dms")
      .getByText("359°59′10″", { exact: true })
      .isVisible(),
    "0度付近からの減算を0～360度へ正規化できません。",
  );

  const horizontalSection = page
    .getByRole("heading", {
      name: "基準方向を決めてから、観測方向までの角を測る",
      exact: true,
    })
    .locator("xpath=ancestor::section");
  const backSightSelect = horizontalSection.getByRole("combobox", {
    name: "後視方向を選択",
  });
  const foreSightSelect = horizontalSection.getByRole("combobox", {
    name: "前視方向を選択",
  });
  const horizontalAngleResult = horizontalSection.getByTestId(
    "horizontal-angle-result",
  );
  assert(
    await horizontalAngleResult.getByText(/80\.000°/).isVisible(),
    "初期の後視320度・前視40度から右回り水平角80度を求められません。",
  );
  await horizontalSection
    .getByRole("button", { name: "左回り（反時計回り）", exact: true })
    .click();
  assert(
    await horizontalAngleResult.getByText(/280\.000°/).isVisible(),
    "同じ2方向の左回り水平角280度へ切り替わりません。",
  );
  await backSightSelect.selectOption("southeast");
  await foreSightSelect.selectOption("southwest");
  await horizontalSection
    .getByRole("button", { name: "右回り（時計回り）", exact: true })
    .click();
  assert(
    (await horizontalAngleResult.getByText(/90\.000°/).isVisible()) &&
      (await horizontalSection
        .getByText("135°", { exact: true })
        .isVisible()) &&
      (await horizontalSection
        .getByText("225°", { exact: true })
        .isVisible()),
    "後視・前視方向の選択から右回り水平角を更新できません。",
  );
  await horizontalSection
    .getByRole("button", { name: "左回り（反時計回り）", exact: true })
    .click();
  assert(
    await horizontalAngleResult.getByText(/270\.000°/).isVisible(),
    "選択した同じ2方向で左回り水平角を求められません。",
  );

  const interiorSection = page
    .getByRole("heading", {
      name: "同じ2辺でも、内側と外側では選ぶ角が違う",
      exact: true,
    })
    .locator("xpath=ancestor::section");
  const interiorRange = interiorSection.getByRole("slider", {
    name: "内角を操作",
  });
  const previousAzimuthRange = interiorSection.getByRole("slider", {
    name: "前辺方位角を操作",
  });
  await interiorRange.evaluate((input) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(input, "120");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await previousAzimuthRange.evaluate((input) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(input, "350");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await interiorSection
    .getByRole("button", { name: "外角", exact: true })
    .click();
  assert(
    (await interiorSection
      .locator(".basics-interior-result")
      .getByText("240°", { exact: true })
      .isVisible()) &&
      (await interiorSection
        .getByTestId("next-azimuth-result")
        .getByText("50°", { exact: true })
        .isVisible()) &&
      (await interiorSection
        .getByRole("button", { name: "外角", exact: true })
        .getAttribute("aria-pressed")) ===
        "true",
    "内角・外角の切替または次辺方位角の正規化が正しくありません。",
  );

  const dmsSection = page.locator(".basics-dms-operation-section");
  assert(
    await dmsSection
      .getByTestId("dms-raw-result")
      .getByText("18°01′15″", { exact: true })
      .isVisible(),
    "度分秒の加算で秒・分を繰り上げられません。",
  );
  await dmsSection
    .getByRole("tab", { name: "減算：秒と分の繰下げ", exact: true })
    .click();
  assert(
    await dmsSection
      .getByTestId("dms-raw-result")
      .getByText("23°24′25″", { exact: true })
      .isVisible(),
    "度分秒の減算で秒・分を繰り下げられません。",
  );
  await dmsSection
    .getByRole("tab", { name: "境界：360°以上を正規化", exact: true })
    .click();
  assert(
    (await dmsSection
      .getByTestId("dms-raw-result")
      .getByText("360°00′10″", { exact: true })
      .isVisible()) &&
      (await dmsSection
        .getByTestId("dms-normalized-result")
        .getByText(/0°00′10″/)
        .isVisible()),
    "360度以上の度分秒計算結果を正規化できません。",
  );
  await dmsSection
    .getByRole("tab", { name: "境界：負の角度を正規化", exact: true })
    .click();
  assert(
    (await dmsSection
      .getByTestId("dms-raw-result")
      .getByText("−0°00′10″", { exact: true })
      .isVisible()) &&
      (await dmsSection
        .getByTestId("dms-normalized-result")
        .getByText(/359°59′50″/)
        .isVisible()),
    "負の度分秒計算結果を正規化できません。",
  );

  const verticalSection = page
    .getByRole("heading", {
      name: "同じ視準線でも、水平線と天頂では0°の方向が違う",
      exact: true,
    })
    .locator("xpath=ancestor::section");
  await verticalSection
    .getByRole("button", { name: "天頂角", exact: true })
    .click();
  const zenithRange = verticalSection.getByRole("slider", {
    name: "視準線の天頂角を操作",
  });
  await zenithRange.evaluate((input) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    valueSetter?.call(input, "115");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  assert(
    (await verticalSection
      .getByTestId("vertical-angle-result")
      .getByText(/-25°/)
      .isVisible()) &&
      (await verticalSection
        .getByTestId("zenith-angle-result")
        .getByText(/115°/)
        .isVisible()) &&
      (await verticalSection
        .getByText("下向き", { exact: true })
        .isVisible()),
    "同じ下向き視準線の鉛直角と天頂角を比較できません。",
  );

  const chapterFourDesktopMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterFourDesktopMetrics.scrollWidth <=
      chapterFourDesktopMetrics.clientWidth,
    `第4章が1366px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterFourDesktopMetrics,
    )}`,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.locator(".mobile-section-navigation").isVisible(),
    "スマートフォン幅で教材切替が表示されません。",
  );
  const chapterFourMobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterFourMobileMetrics.scrollWidth <=
      chapterFourMobileMetrics.clientWidth,
    `第4章が390px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterFourMobileMetrics,
    )}`,
  );

  await page
    .locator(".mobile-section-navigation")
    .getByRole("button", { name: "多角測量" })
    .click();
  assert(
    await page.getByText("Phase 4", { exact: true }).isVisible(),
    "スマートフォン幅で多角測量へ戻れません。",
  );
  await page
    .locator(".mobile-section-navigation")
    .getByRole("button", { name: "測量の基礎" })
    .click();
  assert(
    await page.locator(".basics-hero").isVisible(),
    "スマートフォン幅で基礎教材を再表示できません。",
  );
  assert(
    await page
      .getByRole("heading", {
        name: "角度・方位角・度分秒",
        exact: true,
      })
      .isVisible() &&
      (await page.getByTestId("azimuth-dms").textContent()) ===
        "359°59′10″" &&
      (await backSightSelect.inputValue()) === "southeast" &&
      (await foreSightSelect.inputValue()) === "southwest" &&
      (await horizontalSection
        .getByRole("button", {
          name: "左回り（反時計回り）",
          exact: true,
        })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await interiorSection
        .getByRole("button", { name: "外角", exact: true })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await dmsSection
        .getByRole("tab", {
          name: "境界：負の角度を正規化",
          exact: true,
        })
        .getAttribute("aria-selected")) ===
        "true" &&
      (await verticalSection
        .getByRole("button", { name: "天頂角", exact: true })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await zenithRange.inputValue()) === "115",
    "教材を往復すると第4章の操作状態が失われます。",
  );

  await page.setViewportSize({ width: 1366, height: 768 });
  await page
    .getByRole("button", { name: /TSの据付と観測/ })
    .click();
  assert(
    (await page
      .getByRole("heading", { name: "TSの据付と観測", exact: true })
      .isVisible()) &&
      (await page
        .getByText(
          "TSを据え付けて方向付けし、角度と距離を観測する基本手順を説明できる。",
          { exact: true },
        )
        .isVisible()) &&
      (await page
        .getByText(
          "求心と整準は相互に影響するため、調整後に両方を再確認します。",
          { exact: true },
        )
        .isVisible()) &&
      (await page.getByText("1 / 9 章", { exact: true }).isVisible()),
    "第5章のタイトル、到達目標、注意事項、進捗分母が表示されていません。",
  );

  const setupOrderCard = page.locator(".basics-ts-order-card");
  await setupOrderCard
    .getByRole("button", { name: "順序を確認", exact: true })
    .click();
  assert(
    await setupOrderCard
      .getByTestId("setup-order-feedback")
      .getByText(/4番目は「精密求心」/)
      .isVisible(),
    "誤った据付順序の位置と理由を表示できません。",
  );
  await setupOrderCard
    .getByRole("button", { name: "精密求心を上へ", exact: true })
    .click();
  await setupOrderCard
    .getByRole("button", { name: "順序を確認", exact: true })
    .click();
  assert(
    await setupOrderCard
      .getByTestId("setup-order-feedback")
      .getByText(/正しい順序です/)
      .isVisible(),
    "上下ボタンで据付手順を正しい順序へ並べ替えられません。",
  );

  const setupConditionSelector = page.locator(
    ".basics-ts-condition-selector",
  );
  const setupConditionPanel = page.locator("#ts-condition-panel");
  await setupConditionSelector
    .getByRole("button", { name: "求心ずれ", exact: true })
    .click();
  assert(
    (await setupConditionPanel
      .getByText(/TSの鉛直軸が器械点の中心を通っていません/)
      .isVisible()) &&
      (await setupConditionPanel
        .getByText(/影響量は測線条件で変わるため、この教材では数値化しません/)
        .isVisible()),
    "求心ずれの状態・定性的影響・再観測判断を表示できません。",
  );
  await setupConditionSelector
    .getByRole("button", { name: "整準不良", exact: true })
    .click();
  assert(
    await setupConditionPanel
      .getByText(/水平角や鉛直角の基準が正しく保てないおそれ/)
      .isVisible(),
    "整準不良の影響を表示できません。",
  );
  await setupConditionSelector
    .getByRole("button", { name: "器械高の入力ミス", exact: true })
    .click();
  assert(
    await setupConditionPanel
      .getByText(/器械高を高く入力した分だけ測点間高低差が大きく/)
      .isVisible(),
    "器械高入力ミスの影響を表示できません。",
  );
  await setupConditionSelector
    .getByRole("button", { name: "プリズム高の入力ミス", exact: true })
    .click();
  assert(
    await setupConditionPanel
      .getByText(/プリズム高を高く入力した分だけ測点間高低差が小さく/)
      .isVisible(),
    "プリズム高入力ミスの影響を表示できません。",
  );
  await setupConditionSelector
    .getByRole("button", { name: "視差あり", exact: true })
    .click();
  assert(
    await setupConditionPanel
      .getByText(/目を動かすと、十字線と目標が相対的に動いて見えます/)
      .isVisible(),
    "視差の状態と除去方法を表示できません。",
  );

  const orientationSelector = page.locator(
    ".basics-ts-orientation-selector",
  );
  const orientationResult = page.locator("#ts-orientation-result");
  assert(
    (await orientationResult
      .getByTestId("foresight-azimuth-result")
      .getByText("35.000°", { exact: true })
      .isVisible()) &&
      (await orientationResult.getByText("正しい", { exact: true }).isVisible()),
    "正しい後視点から前視方位角35度を求められません。",
  );
  await orientationSelector
    .getByRole("button", { name: "誤った後視点 B2", exact: true })
    .click();
  assert(
    (await orientationResult
      .getByTestId("foresight-azimuth-result")
      .getByText("15.000°", { exact: true })
      .isVisible()) &&
      (await orientationResult
        .getByText("方向誤差 −20.000°", { exact: true })
        .isVisible()),
    "誤った後視点の20度差を前視方位角へ反映できません。",
  );
  await orientationSelector
    .getByRole("button", { name: "後視点を設定していない", exact: true })
    .click();
  assert(
    (await orientationResult
      .getByTestId("foresight-azimuth-result")
      .getByText("未計算", { exact: true })
      .isVisible()) &&
      (await orientationResult
        .getByText("基準方向なし", { exact: true })
        .isVisible()),
    "後視点未設定時に前視方位角を未計算として扱えません。",
  );
  await orientationSelector
    .getByRole("button", { name: "誤った後視点 B2", exact: true })
    .click();

  const horizontalAngleRange = page.getByRole("slider", {
    name: "水平角を操作",
  });
  const verticalAngleRange = page.getByRole("slider", {
    name: "鉛直角を操作",
  });
  const tsSlopeDistanceRange = page.getByRole("slider", {
    name: "斜距離を操作",
  });
  const instrumentHeightRange = page.getByRole("slider", {
    name: "器械高を操作",
  });
  const prismHeightRange = page.getByRole("slider", {
    name: "プリズム高を操作",
  });
  await setRangeValue(horizontalAngleRange, 120);
  await setRangeValue(verticalAngleRange, 30);
  await setRangeValue(tsSlopeDistanceRange, 100);
  await setRangeValue(instrumentHeightRange, 1.5);
  await setRangeValue(prismHeightRange, 1.8);
  assert(
    (await page
      .getByTestId("ts-horizontal-distance")
      .getByText("86.6025 m", { exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("ts-line-height-difference")
        .getByText("+50.0000 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("ts-point-height-difference")
        .getByText("+49.7000 m", { exact: true })
        .isVisible()) &&
      (await page
        .locator(".basics-ts-direct-values")
        .getByText("120.000°", { exact: true })
        .isVisible()),
    "水平角・鉛直角・斜距離・高さからTSの計算値を更新できません。",
  );

  const heightScenarioSelector = page.locator(
    ".basics-ts-height-scenario-selector",
  );
  const heightImpactPanel = page.locator("#ts-height-impact-panel");
  await heightScenarioSelector
    .getByRole("button", { name: "器械高を高く入力", exact: true })
    .click();
  assert(
    await heightImpactPanel
      .getByTestId("height-input-error-result")
      .getByText("+0.150 m", { exact: true })
      .isVisible(),
    "器械高の過大入力を測点間高低差の正方向へ反映できません。",
  );
  await heightScenarioSelector
    .getByRole("button", { name: "プリズム高を高く入力", exact: true })
    .click();
  assert(
    await heightImpactPanel
      .getByTestId("height-input-error-result")
      .getByText("−0.150 m", { exact: true })
      .isVisible(),
    "プリズム高の過大入力を測点間高低差の負方向へ反映できません。",
  );

  const checklistSection = page.locator(".basics-ts-checklist-section");
  assert(
    (await checklistSection
      .getByTestId("ts-checklist-progress")
      .getByText("0 / 11 項目確認", { exact: true })
      .isVisible()) &&
      (await checklistSection
        .getByText("未確認 11項目", { exact: true })
        .isVisible()),
    "観測開始前チェックリストの未確認項目を表示できません。",
  );
  await checklistSection
    .getByRole("button", { name: "すべて確認", exact: true })
    .click();
  assert(
    (await checklistSection
      .getByTestId("ts-checklist-progress")
      .getByText("11 / 11 項目確認", { exact: true })
      .isVisible()) &&
      (await checklistSection
        .getByText(
          "全項目を確認しました。観測開始前に現況と記録を最終照合します。",
          { exact: true },
        )
        .isVisible()),
    "チェックリストを全項目確認済みへ切り替えられません。",
  );

  const inspectionSelector = page.locator(
    ".basics-ts-inspection-selector",
  );
  const inspectionResult = page.locator("#ts-inspection-result");
  assert(
    await inspectionResult
      .getByText("そのまま採用", { exact: true })
      .isVisible(),
    "後視点検で問題がないシナリオを採用判断へ結び付けられません。",
  );
  await inspectionSelector
    .getByRole("button", {
      name: "後視方向が初期値からずれた",
      exact: true,
    })
    .click();
  assert(
    await inspectionResult
      .getByText("条件を修正して再観測", { exact: true })
      .isVisible(),
    "後視方向ずれを再観測判断へ結び付けられません。",
  );
  await inspectionSelector
    .getByRole("button", {
      name: "器械高の記録違いを発見した",
      exact: true,
    })
    .click();
  assert(
    await inspectionResult
      .getByText("観測記録を訂正して再計算", { exact: true })
      .isVisible(),
    "器械高の記録違いを訂正・再計算へ結び付けられません。",
  );
  await inspectionSelector
    .getByRole("button", {
      name: "観測値が他の反復値から大きく外れた",
      exact: true,
    })
    .click();
  assert(
    (await inspectionResult
      .getByText("原因確認が必要", { exact: true })
      .isVisible()) &&
      (await page
        .getByText(/根拠のない固定許容値を設定せず/)
        .isVisible()),
    "外れた反復値を固定許容値で決めず原因確認へ結び付けられません。",
  );

  const chapterFiveDesktopMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterFiveDesktopMetrics.scrollWidth <=
      chapterFiveDesktopMetrics.clientWidth,
    `第5章が1366px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterFiveDesktopMetrics,
    )}`,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const chapterFiveMobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterFiveMobileMetrics.scrollWidth <= chapterFiveMobileMetrics.clientWidth,
    `第5章が390px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterFiveMobileMetrics,
    )}`,
  );

  await page
    .locator(".mobile-section-navigation")
    .getByRole("button", { name: "多角測量" })
    .click();
  await page
    .locator(".mobile-section-navigation")
    .getByRole("button", { name: "測量の基礎" })
    .click();
  assert(
    (await page
      .getByRole("heading", { name: "TSの据付と観測", exact: true })
      .isVisible()) &&
      (await setupOrderCard
        .getByTestId("setup-order-feedback")
        .getByText(/正しい順序です/)
        .isVisible()) &&
      (await setupConditionSelector
        .getByRole("button", { name: "視差あり", exact: true })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await orientationSelector
        .getByRole("button", { name: "誤った後視点 B2", exact: true })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await horizontalAngleRange.inputValue()) === "120" &&
      (await verticalAngleRange.inputValue()) === "30" &&
      (await tsSlopeDistanceRange.inputValue()) === "100" &&
      (await heightScenarioSelector
        .getByRole("button", { name: "プリズム高を高く入力", exact: true })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await checklistSection
        .getByTestId("ts-checklist-progress")
        .getByText("11 / 11 項目確認", { exact: true })
        .isVisible()) &&
      (await inspectionSelector
        .getByRole("button", {
          name: "観測値が他の反復値から大きく外れた",
          exact: true,
        })
        .getAttribute("aria-pressed")) ===
        "true",
    "教材を往復すると第5章の操作状態が失われます。",
  );

  await page.setViewportSize({ width: 1366, height: 768 });
  await page
    .getByRole("button", { name: /レベルと水準測量/ })
    .click();
  assert(
    (await page
      .getByRole("heading", { name: "レベルと水準測量", exact: true })
      .isVisible()) &&
      (await page
        .getByText(
          "既知標高から後視・前視を使って新点標高を求める流れを説明できる。",
          { exact: true },
        )
        .isVisible()) &&
      (await page
        .getByText(
          "後視と前視は、標尺を置く位置の前後ではなく標高計算上の役割で区別します。",
          { exact: true },
        )
        .isVisible()) &&
      (await page.getByText("1 / 9 章", { exact: true }).isVisible()),
    "第6章のタイトル、到達目標、注意事項、進捗分母が表示されていません。",
  );
  assert(
    (await page
      .getByRole("img", {
        name: /BM、レベル、標尺、新点による水準測量の模式図/,
      })
      .isVisible()) &&
      (await page
        .getByText(
          "BM（Benchmark、水準点）",
          { exact: true },
        )
        .first()
        .isVisible()) &&
      (await page
        .getByText(/地面の高さを直接読むのではなく/)
        .isVisible()),
    "BM、レベル、標尺、新点と水平な視準線の模式図が表示されていません。",
  );

  const benchmarkElevationRange = page.getByRole("slider", {
    name: "BM標高を操作",
  });
  const levelingBacksightRange = page.getByRole("slider", {
    name: "後視を操作",
  });
  const levelingForesightRange = page.getByRole("slider", {
    name: "前視を操作",
  });
  await setRangeValue(benchmarkElevationRange, 102.5);
  await setRangeValue(levelingBacksightRange, 1.35);
  await setRangeValue(levelingForesightRange, 0.95);
  assert(
    (await page
      .getByTestId("level-instrument-height")
      .getByText("103.850 m", { exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("level-height-difference")
        .getByText("+0.400 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("level-new-point-elevation")
        .getByText("102.900 m", { exact: true })
        .isVisible()),
    "BM標高、後視、前視から器械高・高低差・新点標高が連動しません。",
  );

  const levelingMethodSelector = page.locator(
    ".basics-level-method-selector",
  );
  await levelingMethodSelector
    .getByRole("button", { name: "高低差方式", exact: true })
    .click();
  const levelingMethodPanel = page.locator("#leveling-method-panel");
  assert(
    (await levelingMethodPanel
      .getByText("1.350 − 0.950 ＝ +0.400 m", { exact: true })
      .isVisible()) &&
      (await levelingMethodPanel
        .getByText("102.500 ＋ +0.400 ＝ 102.900 m", { exact: true })
        .isVisible()) &&
      (await page
        .locator(".basics-level-method-match")
        .getByText(/102\.900 m/)
        .isVisible()),
    "器械高方式と高低差方式を切り替えて同じ新点標高を確認できません。",
  );

  const turningPointSelector = page.locator(
    ".basics-level-turning-selector",
  );
  await turningPointSelector
    .getByRole("button", {
      name: "転点あり：BM → TP1 → 新点",
      exact: true,
    })
    .click();
  assert(
    (await page
      .getByTestId("turning-elevation-TP1")
      .getByText("100.330 m", { exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("turning-elevation-新点P")
        .getByText("100.680 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByText("標尺をTP1に保持してレベルを移動する", { exact: true })
        .isVisible()),
    "TP1を介した2回の据付で標高を順次引き継げません。",
  );

  const routeSelector = page.locator(".basics-level-route-selector");
  await routeSelector
    .getByRole("button", {
      name: "小さな閉合差を含む観測例",
      exact: true,
    })
    .click();
  assert(
    (await page
      .getByTestId("outbound-observed-difference")
      .getByText("+1.254 m", { exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("outbound-calculated-end")
        .getByText("101.254 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("outbound-closing-error")
        .getByText("+0.004 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("return-observed-difference")
        .getByText("−1.252 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("return-calculated-end")
        .getByText("99.998 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("return-closing-error")
        .getByText("−0.002 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("round-trip-closing-error")
        .getByText("+0.002 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByText(/補正量の配分や本格的な路線調整は実装していません/)
        .isVisible()),
    "往路・復路の終点計算標高、閉合差、往復閉合差を整合して表示できません。",
  );

  const staffSelector = page.locator(".basics-level-staff-selector");
  const staffConditionPanel = page.locator("#level-staff-condition-panel");
  await staffSelector
    .getByRole("button", { name: "標尺が傾いている", exact: true })
    .click();
  assert(
    (await staffConditionPanel
      .getByText(/読みが大きくなる方向の誤差が生じやすく/)
      .isVisible()) &&
      (await staffConditionPanel
        .getByText(/影響量は傾き方向・角度・視準条件で変わるため数値化しません/)
        .isVisible()),
    "標尺の鉛直・傾きと定性的な読定影響を切り替えられません。",
  );

  const sightDistanceSelector = page.locator(
    ".basics-level-distance-selector",
  );
  const sightDistanceResult = page.locator("#level-distance-result");
  await sightDistanceSelector
    .getByRole("button", { name: "距離差が大きい状態", exact: true })
    .click();
  assert(
    (await sightDistanceResult
      .getByText("18.0 m", { exact: true })
      .isVisible()) &&
      (await sightDistanceResult
        .getByText("55.0 m", { exact: true })
        .isVisible()) &&
      (await sightDistanceResult
        .getByTestId("sight-distance-difference")
        .getByText("37.0 m", { exact: true })
        .isVisible()) &&
      (await sightDistanceResult
        .getByText(/標高誤差を推測計算しません/)
        .isVisible()),
    "後視距離・前視距離の偏りと定性的なリスクを表示できません。",
  );

  const levelConditionSelector = page.locator(
    ".basics-level-condition-selector",
  );
  const levelConditionPanel = page.locator("#level-condition-panel");
  await levelConditionSelector
    .getByRole("button", { name: "気泡ずれ・補正範囲外", exact: true })
    .click();
  assert(
    await levelConditionPanel
      .getByText(/補正範囲は機種で異なるため固定値を示しません/)
      .isVisible(),
    "気泡ずれ・自動補正範囲外の状態と再整準判断を表示できません。",
  );
  await levelConditionSelector
    .getByRole("button", { name: "自動補正が不安定", exact: true })
    .click();
  assert(
    await levelConditionPanel
      .getByText(/自動補正機構が安定していません/)
      .isVisible(),
    "自動補正が不安定な状態と確認方法を表示できません。",
  );
  await levelConditionSelector
    .getByRole("button", { name: "視差が残っている", exact: true })
    .click();
  assert(
    (await levelConditionPanel
      .getByText(/目を動かすと、十字線と標尺像が相対的にずれて見えます/)
      .isVisible()) &&
      (await page
        .locator(".basics-level-focus-note")
        .getByText(/視度調整.*十字線.*合焦.*標尺像/)
        .isVisible()),
    "視度調整・合焦・視差除去の違いを表示できません。",
  );

  const chapterSixDesktopMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterSixDesktopMetrics.scrollWidth <= chapterSixDesktopMetrics.clientWidth,
    `第6章が1366px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterSixDesktopMetrics,
    )}`,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const chapterSixMobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterSixMobileMetrics.scrollWidth <= chapterSixMobileMetrics.clientWidth,
    `第6章が390px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterSixMobileMetrics,
    )}`,
  );

  await page
    .locator(".mobile-section-navigation")
    .getByRole("button", { name: "多角測量" })
    .click();
  await page
    .locator(".mobile-section-navigation")
    .getByRole("button", { name: "測量の基礎" })
    .click();
  assert(
    (await page
      .getByRole("heading", { name: "レベルと水準測量", exact: true })
      .isVisible()) &&
      (await benchmarkElevationRange.inputValue()) === "102.5" &&
      (await levelingBacksightRange.inputValue()) === "1.35" &&
      (await levelingForesightRange.inputValue()) === "0.95" &&
      (await levelingMethodSelector
        .getByRole("button", { name: "高低差方式", exact: true })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await turningPointSelector
        .getByRole("button", {
          name: "転点あり：BM → TP1 → 新点",
          exact: true,
        })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await routeSelector
        .getByRole("button", {
          name: "小さな閉合差を含む観測例",
          exact: true,
        })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await staffSelector
        .getByRole("button", { name: "標尺が傾いている", exact: true })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await sightDistanceSelector
        .getByRole("button", { name: "距離差が大きい状態", exact: true })
        .getAttribute("aria-pressed")) ===
        "true" &&
      (await levelConditionSelector
        .getByRole("button", { name: "視差が残っている", exact: true })
        .getAttribute("aria-pressed")) ===
        "true",
    "教材を往復すると第6章の操作状態が失われます。",
  );

  await page.setViewportSize({ width: 1366, height: 768 });
  await page
    .getByRole("button", { name: /観測誤差・精度・検査/ })
    .click();
  assert(
    (await page
      .getByRole("heading", { name: "観測誤差・精度・検査", exact: true })
      .isVisible()) &&
      (await page
        .getByText(
          "数値が表示されたことと、正しい成果であることは同じではないと説明できる。",
          { exact: true },
        )
        .isVisible()) &&
      (await page
        .getByText(
          "標準偏差が小さいだけで、正確な観測とは判断しません。",
          { exact: true },
        )
        .isVisible()) &&
      (await page.getByText("標本標準偏差", { exact: true }).first().isVisible()) &&
      (await page.getByText("1 / 9 章", { exact: true }).isVisible()),
    "第7章のタイトル、到達目標、用語、注意事項、進捗分母が表示されていません。",
  );

  const accuracySelector = page.locator(".basics-error-accuracy-selector");
  const accuracyPatternPanel = page.locator("#accuracy-pattern-panel");
  assert(
    (await page
      .getByRole("img", { name: /正確で精密の散布図/ })
      .isVisible()) &&
      (await accuracyPatternPanel
        .getByText("教材用基準位置", { exact: false })
        .isVisible()) &&
      (await page.locator(".basics-error-observation-point").count()) === 6,
    "正確さ・精密さの散布図に基準位置と複数の観測点が表示されていません。",
  );
  for (const patternLabel of [
    "正確で精密",
    "正確だが不精密",
    "精密だが不正確",
    "不正確で不精密",
  ]) {
    await accuracySelector
      .getByRole("button", { name: patternLabel, exact: true })
      .click();
    assert(
      (await accuracySelector
        .getByRole("button", { name: patternLabel, exact: true })
        .getAttribute("aria-pressed")) === "true" &&
        (await accuracyPatternPanel
          .getByRole("heading", { name: patternLabel, exact: true })
          .isVisible()),
      `${patternLabel}の固定散布図へ切り替わりません。`,
    );
  }
  await accuracySelector
    .getByRole("button", { name: "精密だが不正確", exact: true })
    .click();
  assert(
    (await accuracyPatternPanel
      .getByText(/小さな標準偏差だけでは正しさを保証できません/)
      .isVisible()) &&
      (await page.getByTestId("accuracy-pattern-bias").isVisible()) &&
      (await page.getByTestId("accuracy-pattern-spread").isVisible()),
    "精密だが不正確な状態の偏り・広がり・原因を表示できません。",
  );

  const repeatCountRange = page.getByRole("slider", {
    name: "反復観測回数",
  });
  await setRangeValue(repeatCountRange, 8);
  assert(
    (await page
      .getByTestId("error-repeat-mean")
      .getByText("50.0015 m", { exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("error-repeat-range")
        .getByText("0.0090 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("error-repeat-standard-deviation")
        .getByText("0.00334 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("repeat-residual-1")
        .getByText("+0.00250 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByText(/Σvi ＝ .*丸め前ではほぼ0/)
        .isVisible()) &&
      (await page
        .getByTestId("systematic-bias-after-average")
        .getByText("+0.0215 m", { exact: true })
        .isVisible()),
    "反復観測回数に連動して平均・残差・最大最小差・標本標準偏差が更新されません。",
  );

  const errorTypeSelector = page.locator(".basics-error-type-selector");
  const errorTypePanel = page.locator("#error-type-panel");
  await errorTypeSelector
    .getByRole("button", { name: "系統誤差", exact: true })
    .click();
  assert(
    (await errorTypePanel
      .getByTestId("error-scenario-mean")
      .getByText("100.0200 m", { exact: true })
      .isVisible()) &&
      (await errorTypePanel
        .getByTestId("error-scenario-bias")
        .getByText("+0.0200 m", { exact: true })
        .isVisible()) &&
      (await errorTypePanel
        .getByText(/観測回数を増やして平均しても、一定方向の偏りは残ります/)
        .isVisible()),
    "系統誤差で平均後も教材用基準値との差が残ることを表示できません。",
  );
  await errorTypeSelector
    .getByRole("button", { name: "粗大誤差", exact: true })
    .click();
  assert(
    (await errorTypePanel.getByText(/4: 100\.052 m/).isVisible()) &&
      (await errorTypePanel
        .getByText(/平均へ吸収するのではなく/)
        .isVisible()) &&
      (await errorTypePanel.getByText(/点の取り違え/).isVisible()),
    "粗大誤差の異常値、原因、対応を表示できません。",
  );
  await errorTypeSelector
    .getByRole("button", { name: "系統誤差", exact: true })
    .click();

  const heightErrorSelector = page.locator(".basics-error-height-selector");
  const heightInputPanel = page.locator("#height-input-panel");
  await heightErrorSelector
    .getByRole("button", {
      name: "GNSSアンテナ高を高く入力",
      exact: true,
    })
    .click();
  assert(
    await heightInputPanel
      .getByTestId("height-input-result-difference")
      .getByText("−0.150 m（負方向）", { exact: true })
      .isVisible(),
    "GNSSアンテナ高の過大入力が成果高を負方向へずらす表示になりません。",
  );
  await heightErrorSelector
    .getByRole("button", {
      name: "GNSSアンテナ高を低く入力",
      exact: true,
    })
    .click();
  assert(
    await heightInputPanel
      .getByTestId("height-input-result-difference")
      .getByText("+0.150 m（正方向）", { exact: true })
      .isVisible(),
    "GNSSアンテナ高の過小入力が成果高を正方向へずらす表示になりません。",
  );
  await heightErrorSelector
    .getByRole("button", { name: "TS器械高を高く入力", exact: true })
    .click();
  assert(
    await heightInputPanel
      .getByTestId("height-input-result-difference")
      .getByText("+0.150 m（正方向）", { exact: true })
      .isVisible(),
    "TS器械高の過大入力が高低差を正方向へずらす表示になりません。",
  );
  await heightErrorSelector
    .getByRole("button", { name: "プリズム高を高く入力", exact: true })
    .click();
  assert(
    (await heightInputPanel
      .getByTestId("height-input-result-difference")
      .getByText("−0.150 m（負方向）", { exact: true })
      .isVisible()) &&
      (await page
        .getByText(/本格的なGNSS処理は実装していません/)
        .isVisible()),
    "プリズム高の過大入力またはGNSS簡略モデルの注意が表示されません。",
  );

  const standardDeviationARange = page.getByRole("slider", {
    name: "観測量Aの標準偏差",
  });
  const standardDeviationBRange = page.getByRole("slider", {
    name: "観測量Bの標準偏差",
  });
  await setRangeValue(standardDeviationARange, 6);
  await setRangeValue(standardDeviationBRange, 8);
  assert(
    (await page
      .getByTestId("combined-standard-deviation")
      .getByText("10.000 mm", { exact: true })
      .isVisible()) &&
      (await page.getByText("6.0² ＝ 36.00 mm²", { exact: true }).isVisible()) &&
      (await page.getByText("8.0² ＝ 64.00 mm²", { exact: true }).isVisible()) &&
      (await page.getByText("100.00 mm²", { exact: true }).isVisible()) &&
      (await page.getByText(/独立・無相関/).isVisible()),
    "独立2量の標準偏差を二乗・二乗和・平方根で合成できません。",
  );

  const differenceGrid = page.locator(".basics-error-difference-grid");
  assert(
    (await differenceGrid
      .getByRole("heading", { name: "誤差", exact: true })
      .isVisible()) &&
      (await differenceGrid
        .getByRole("heading", { name: "残差", exact: true })
        .isVisible()) &&
      (await differenceGrid
        .getByRole("heading", { name: "閉合差", exact: true })
        .isVisible()) &&
      (await page
        .getByText(/1つの指標だけで成果の正しさを決めず/)
        .isVisible()),
    "誤差・残差・閉合差の比較と複数指標による点検が表示されません。",
  );

  const decisionScenarioSelector = page.locator(
    ".basics-error-decision-scenarios",
  );
  const decisionPanel = page.locator("#inspection-decision-panel");
  await decisionScenarioSelector
    .getByRole("button", {
      name: "閉合差が教材用許容値を超える",
      exact: true,
    })
    .click();
  assert(
    (await decisionPanel
      .getByTestId("closing-tolerance-evaluation")
      .getByText(/＞ 0\.010 m.*仮定値超過/)
      .isVisible()) &&
      (await page
        .getByText(/ここで使う許容値は、判断手順を学ぶための教材用の仮定値です/)
        .isVisible()),
    "閉合差の絶対値と教材用許容値の比較が表示されません。",
  );
  await decisionPanel
    .getByRole("button", { name: "採用候補とする", exact: true })
    .click();
  assert(
    await decisionPanel
      .getByTestId("inspection-decision-feedback")
      .getByText("もう一度、異常の種類を確認", { exact: true })
      .isVisible(),
    "不適切な判断を選んだときの見直し案内が表示されません。",
  );
  await decisionPanel
    .getByRole("button", {
      name: "原因を確認して再観測する",
      exact: true,
    })
    .click();
  assert(
    (await decisionPanel
      .getByTestId("inspection-decision-feedback")
      .getByText("推奨判断と一致", { exact: true })
      .isVisible()) &&
      (await decisionPanel
        .getByText(/原記録と計算を点検し、原因と影響範囲を確認/)
        .isVisible()),
    "許容値超過シナリオの推奨判断と理由が表示されません。",
  );
  await decisionScenarioSelector
    .getByRole("button", {
      name: "許容値以内だが大きな残差が1つある",
      exact: true,
    })
    .click();
  assert(
    (await decisionPanel
      .getByTestId("closing-tolerance-evaluation")
      .getByText(/≦ 0\.010 m.*仮定値以内/)
      .isVisible()) &&
      (await decisionPanel.getByText(/粗大誤差の可能性/).isVisible()),
    "許容値以内でも大きな残差を点検するシナリオが表示されません。",
  );
  await decisionScenarioSelector
    .getByRole("button", {
      name: "閉合差が教材用許容値を超える",
      exact: true,
    })
    .click();
  await decisionPanel
    .getByRole("button", {
      name: "原因を確認して再観測する",
      exact: true,
    })
    .click();

  const chapterSevenDesktopMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterSevenDesktopMetrics.scrollWidth <=
      chapterSevenDesktopMetrics.clientWidth,
    `第7章が1366px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterSevenDesktopMetrics,
    )}`,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const chapterSevenMobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterSevenMobileMetrics.scrollWidth <=
      chapterSevenMobileMetrics.clientWidth,
    `第7章が390px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterSevenMobileMetrics,
    )}`,
  );

  await page
    .locator(".mobile-section-navigation")
    .getByRole("button", { name: "多角測量" })
    .click();
  await page
    .locator(".mobile-section-navigation")
    .getByRole("button", { name: "測量の基礎" })
    .click();
  assert(
    (await page
      .getByRole("heading", {
        name: "観測誤差・精度・検査",
        exact: true,
      })
      .isVisible()) &&
      (await accuracySelector
        .getByRole("button", { name: "精密だが不正確", exact: true })
        .getAttribute("aria-pressed")) === "true" &&
      (await repeatCountRange.inputValue()) === "8" &&
      (await errorTypeSelector
        .getByRole("button", { name: "系統誤差", exact: true })
        .getAttribute("aria-pressed")) === "true" &&
      (await heightErrorSelector
        .getByRole("button", { name: "プリズム高を高く入力", exact: true })
        .getAttribute("aria-pressed")) === "true" &&
      (await standardDeviationARange.inputValue()) === "6" &&
      (await standardDeviationBRange.inputValue()) === "8" &&
      (await decisionScenarioSelector
        .getByRole("button", {
          name: "閉合差が教材用許容値を超える",
          exact: true,
        })
        .getAttribute("aria-pressed")) === "true" &&
      (await decisionPanel
        .getByRole("button", {
          name: "原因を確認して再観測する",
          exact: true,
        })
        .getAttribute("aria-pressed")) === "true",
    "教材を往復すると第7章の操作状態が失われます。",
  );

  await page.setViewportSize({ width: 1366, height: 768 });
  await page
    .getByRole("button", {
      name: /座標計算と閉合トラバースへの橋渡し/,
    })
    .click();
  assert(
    (await page
      .getByRole("heading", {
        name: "座標計算と閉合トラバースへの橋渡し",
        exact: true,
      })
      .isVisible()) &&
      (await page
        .getByText(
          "距離と方位角が、X・Y座標の変化へ分解されることを説明できる。",
          { exact: true },
        )
        .isVisible()) &&
      (await page
        .getByText(
          "同一点では距離は0ですが、方位角を一意に定義できません。",
          { exact: true },
        )
        .isVisible()) &&
      (await page.getByText("緯距", { exact: true }).first().isVisible()) &&
      (await page.getByText("1 / 9 章", { exact: true }).isVisible()),
    "第8章のタイトル、到達目標、用語、注意事項、進捗分母が表示されていません。",
  );

  const forwardStartXRange = page.getByRole("slider", {
    name: "正計算 既知点AのX座標",
  });
  const forwardStartYRange = page.getByRole("slider", {
    name: "正計算 既知点AのY座標",
  });
  const forwardDistanceRange = page.getByRole("slider", {
    name: "正計算 距離",
  });
  const forwardAzimuthRange = page.getByRole("slider", {
    name: "正計算 方位角",
  });
  await setRangeValue(forwardStartXRange, 1010);
  await setRangeValue(forwardStartYRange, 520);
  await setRangeValue(forwardDistanceRange, 60);
  await setRangeValue(forwardAzimuthRange, 90);
  assert(
    (await page
      .getByTestId("forward-delta-x")
      .getByText("0.000 m", { exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("forward-delta-y")
        .getByText("+60.000 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("forward-point-x")
        .getByText("1010.000 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("forward-point-y")
        .getByText("580.000 m", { exact: true })
        .isVisible()) &&
      (await page.getByText(/60\.000 × cos 90\.0°/).isVisible()) &&
      (await page.getByText(/60\.000 × sin 90\.0°/).isVisible()) &&
      (await page
        .getByRole("img", { name: "正計算の座標増分図" })
        .isVisible()),
    "正計算の入力、ΔX・ΔY、新点座標、図、式が連動しません。",
  );

  const inverseDirectionSelector = page.locator(
    ".basics-coordinate-direction-selector",
  );
  const inverseDirectionCases = [
    { label: "北", azimuth: "0.000°" },
    { label: "北東", azimuth: "53.130°" },
    { label: "東", azimuth: "90.000°" },
    { label: "南東", azimuth: "126.870°" },
    { label: "南", azimuth: "180.000°" },
    { label: "南西", azimuth: "233.130°" },
    { label: "西", azimuth: "270.000°" },
    { label: "北西", azimuth: "306.870°" },
  ];
  for (const directionCase of inverseDirectionCases) {
    await inverseDirectionSelector
      .getByRole("button", { name: directionCase.label, exact: true })
      .click();
    assert(
      (await page
        .getByTestId("inverse-direction")
        .getByText(directionCase.label, { exact: true })
        .isVisible()) &&
        (await page
          .getByTestId("inverse-azimuth")
          .getByText(directionCase.azimuth, { exact: true })
          .isVisible()),
      `${directionCase.label}方向の逆計算方位角が正しく表示されません。`,
    );
  }
  await inverseDirectionSelector
    .getByRole("button", { name: "同一点", exact: true })
    .click();
  assert(
    (await page
      .getByTestId("inverse-distance")
      .getByText("0.000 m", { exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("inverse-azimuth")
        .getByText("定義できません（同一点）", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("inverse-direction")
        .getByText("同一点（方向なし）", { exact: true })
        .isVisible()),
    "同一点の距離と方位角を安全に表示できません。",
  );
  await inverseDirectionSelector
    .getByRole("button", { name: "北東", exact: true })
    .click();

  const comparisonModeSelector = page.locator(
    ".basics-coordinate-mode-selector",
  );
  assert(
    (await page
      .getByTestId("comparison-inputs")
      .getByRole("heading", {
        name: "既知点A・距離・方位角",
        exact: true,
      })
      .isVisible()) &&
      (await page
        .getByTestId("comparison-results")
        .getByText(/B（1030\.000, 540\.000）m/)
        .isVisible()),
    "固定サンプルの正計算比較を表示できません。",
  );
  await comparisonModeSelector
    .getByRole("button", { name: "逆計算", exact: true })
    .click();
  assert(
    (await page
      .getByTestId("comparison-inputs")
      .getByRole("heading", { name: "点A・点Bの座標", exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("comparison-results")
        .getByText(/S＝50\.000 m ／ α＝53\.130°/)
        .isVisible()),
    "固定サンプルを逆計算へ切り替えて入力値と求める値を比較できません。",
  );

  assert(
    (await page
      .getByTestId("closure-fx")
      .getByText("+0.200 m", { exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("closure-fy")
        .getByText("+0.400 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByTestId("closure-linear")
        .getByText("0.447 m", { exact: true })
        .isVisible()) &&
      (await page
        .getByRole("img", { name: "複数辺の座標増分と閉合差の概念図" })
        .isVisible()) &&
      (await page
        .getByText(/角度補正・コンパス法・閉合比は、既存の閉合トラバースで確認/)
        .isVisible()),
    "複数辺の座標累積、fx・fy、閉合差、既存教材への役割分担を表示できません。",
  );

  const chapterEightDesktopMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterEightDesktopMetrics.scrollWidth <=
      chapterEightDesktopMetrics.clientWidth,
    `第8章が1366px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterEightDesktopMetrics,
    )}`,
  );

  await page.getByTestId("open-traverse-course").click();
  assert(
    (await page
      .getByRole("heading", {
        name: "閉合トラバース測量シミュレーター",
      })
      .isVisible()) &&
      (await preservedTraverseDistanceInput.inputValue()) === "142.000",
    "第8章の導線で閉合トラバースを開けないか、既存入力状態が失われます。",
  );
  await page.getByRole("button", { name: "測量の基礎" }).click();
  assert(
    (await page
      .getByRole("heading", {
        name: "座標計算と閉合トラバースへの橋渡し",
        exact: true,
      })
      .isVisible()) &&
      (await forwardStartXRange.inputValue()) === "1010" &&
      (await forwardStartYRange.inputValue()) === "520" &&
      (await forwardDistanceRange.inputValue()) === "60" &&
      (await forwardAzimuthRange.inputValue()) === "90" &&
      (await inverseDirectionSelector
        .getByRole("button", { name: "北東", exact: true })
        .getAttribute("aria-pressed")) === "true" &&
      (await comparisonModeSelector
        .getByRole("button", { name: "逆計算", exact: true })
        .getAttribute("aria-pressed")) === "true",
    "教材を往復すると第8章の正計算・逆計算・比較状態が失われます。",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const chapterEightMobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterEightMobileMetrics.scrollWidth <=
      chapterEightMobileMetrics.clientWidth,
    `第8章が390px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterEightMobileMetrics,
    )}`,
  );
  assert(
    await page.getByTestId("open-traverse-course").isVisible(),
    "390px幅で閉合トラバースへの導線を操作できません。",
  );

  await page.setViewportSize({ width: 1366, height: 768 });
  await page
    .getByRole("button", { name: /現場計画・記録・機器管理/ })
    .click();
  assert(
    (await page
      .getByRole("heading", {
        name: "現場計画・記録・機器管理",
        exact: true,
      })
      .isVisible()) &&
      (await page
        .getByText(
          "現場開始前、観測中、終了時に確認すべき項目を説明できる。",
          { exact: true },
        )
        .isVisible()) &&
      (await page.getByText("作業計画", { exact: true }).first().isVisible()) &&
      (await page
        .getByText(
          "許容値や安全上の作業継続条件は、適用規程、精度区分、現場、機器に応じて確認します。",
          { exact: true },
        )
        .isVisible()) &&
      (await page.getByText("1 / 9 章", { exact: true }).isVisible()),
    "第9章のタイトル、到達目標、用語、注意事項、進捗分母が表示されていません。",
  );

  const fieldOrderCard = page.locator(".basics-field-order-card");
  await fieldOrderCard.getByRole("button", { name: "順序を確認" }).click();
  assert(
    (await fieldOrderCard.getByTestId("field-order-feedback").textContent())
      ?.includes("5番目は「機器・付属品・設定・電源・保存準備を点検する」"),
    "現場作業手順の初期誤りを判定できません。",
  );
  await fieldOrderCard
    .getByRole("button", {
      name: "機器・付属品・設定・電源・保存準備を点検するを上へ",
    })
    .click();
  await fieldOrderCard.getByRole("button", { name: "順序を確認" }).click();
  assert(
    (await fieldOrderCard.getByTestId("field-order-feedback").textContent())
      ?.includes("教材例の基本順序になりました"),
    "現場作業手順を正しい順序へ並べ替えられません。",
  );

  const fieldChecklistSection = page.locator(
    ".basics-field-checklist-section",
  );
  assert(
    (await fieldChecklistSection
      .getByTestId("field-checklist-progress")
      .textContent())
      ?.includes("0 / 14 項目確認"),
    "第9章の観測前チェックリスト初期集計が正しくありません。",
  );
  await fieldChecklistSection
    .getByRole("button", { name: "すべて確認" })
    .click();
  assert(
    (await fieldChecklistSection
      .getByTestId("field-checklist-progress")
      .textContent())
      ?.includes("14 / 14 項目確認") &&
      (await fieldChecklistSection
        .getByTestId("field-checklist-status")
        .getByText(/14項目を確認しました/)
        .isVisible()),
    "第9章の観測前チェックリストを集計できません。",
  );

  const fieldRecordSection = page.locator(".basics-field-record-section");
  await fieldRecordSection.getByTestId("record-field-instrument-height").click();
  await fieldRecordSection.getByTestId("record-field-target-height").click();
  await fieldRecordSection.getByTestId("record-field-prism-constant").click();
  await fieldRecordSection
    .getByRole("button", { name: "選択した項目を判定" })
    .click();
  assert(
    await fieldRecordSection
      .getByTestId("field-record-feedback")
      .getByText("不足3項目をすべて特定しました。", { exact: true })
      .isVisible(),
    "不足項目を含む観測記録から問題点を特定できません。",
  );

  const fieldDecisionSection = page.locator(
    ".basics-field-decision-section",
  );
  await fieldDecisionSection
    .getByRole("button", { name: /採用する/ })
    .click();
  assert(
    await fieldDecisionSection
      .getByTestId("field-decision-feedback")
      .getByText("この固定シナリオの推奨判断と一致します。", {
        exact: true,
      })
      .isVisible(),
    "異常なしシナリオで採用判断を確認できません。",
  );
  await fieldDecisionSection
    .getByRole("button", {
      name: "原記録は有効だが転記・計算に誤り",
      exact: true,
    })
    .click();
  await fieldDecisionSection
    .getByRole("button", { name: /再計算する/ })
    .click();
  assert(
    await fieldDecisionSection
      .getByTestId("field-decision-feedback")
      .getByText("この固定シナリオの推奨判断と一致します。", {
        exact: true,
      })
      .isVisible(),
    "転記・計算誤りシナリオで再計算判断を確認できません。",
  );
  await fieldDecisionSection
    .getByRole("button", { name: "後視点の取り違えを発見", exact: true })
    .click();
  await fieldDecisionSection
    .getByRole("button", { name: /再測する/ })
    .click();
  assert(
    await fieldDecisionSection
      .getByTestId("field-decision-feedback")
      .getByText("この固定シナリオの推奨判断と一致します。", {
        exact: true,
      })
      .isVisible(),
    "後視点取り違えシナリオで再測判断を確認できません。",
  );
  await fieldDecisionSection
    .getByRole("button", {
      name: "原記録は有効だが転記・計算に誤り",
      exact: true,
    })
    .click();
  await fieldDecisionSection
    .getByRole("button", { name: /再計算する/ })
    .click();

  const fieldValueSelector = page.locator(".basics-field-value-selector");
  await fieldValueSelector.getByRole("button", { name: /成果値/ }).click();
  assert(
    (await page
      .getByTestId("field-value-detail")
      .getByRole("heading", { name: "成果値", exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("field-value-detail")
        .getByText(/計算値が自動的に成果値になるわけではありません/)
        .isVisible()),
    "観測値・計算値・成果値の違いを切り替えて確認できません。",
  );

  const fieldResultFlow = page.locator(".basics-field-result-flow");
  await fieldResultFlow.getByRole("button", { name: /成果表/ }).click();
  assert(
    (await page
      .getByTestId("field-flow-detail")
      .getByRole("heading", { name: "成果表", exact: true })
      .isVisible()) &&
      (await page
        .getByTestId("field-flow-detail")
        .getByText(/採用した値と、その値を正しく使うための付帯情報を整理する/)
        .isVisible()),
    "観測手簿から成果表までの流れを追跡できません。",
  );

  const chapterNineDesktopMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterNineDesktopMetrics.scrollWidth <= chapterNineDesktopMetrics.clientWidth,
    `第9章が1366px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterNineDesktopMetrics,
    )}`,
  );

  await page.getByRole("button", { name: "多角測量" }).click();
  assert(
    (await page
      .getByRole("heading", { name: "閉合トラバース測量シミュレーター" })
      .isVisible()) &&
      (await preservedTraverseDistanceInput.inputValue()) === "142.000",
    "第9章から教材を切り替えると閉合トラバースの状態が失われます。",
  );
  await page.getByRole("button", { name: "測量の基礎" }).click();
  assert(
    (await page
      .getByRole("heading", {
        name: "現場計画・記録・機器管理",
        exact: true,
      })
      .isVisible()) &&
      (await fieldOrderCard.getByTestId("field-order-feedback").textContent())
        ?.includes("教材例の基本順序になりました") &&
      (await fieldChecklistSection
        .getByTestId("field-checklist-progress")
        .textContent())
        ?.includes("14 / 14 項目確認") &&
      (await fieldRecordSection
        .getByTestId("record-field-instrument-height")
        .getAttribute("aria-pressed")) === "true" &&
      (await fieldRecordSection
        .getByTestId("field-record-feedback")
        .getByText("不足3項目をすべて特定しました。", { exact: true })
        .isVisible()) &&
      (await fieldDecisionSection
        .getByRole("button", {
          name: "原記録は有効だが転記・計算に誤り",
          exact: true,
        })
        .getAttribute("aria-pressed")) === "true" &&
      (await fieldDecisionSection
        .getByRole("button", { name: /再計算する/ })
        .getAttribute("aria-pressed")) === "true" &&
      (await fieldValueSelector
        .getByRole("button", { name: /成果値/ })
        .getAttribute("aria-pressed")) === "true" &&
      (await fieldResultFlow
        .getByRole("button", { name: /成果表/ })
        .getAttribute("aria-pressed")) === "true",
    "教材を往復すると第9章の主要操作状態が失われます。",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const chapterNineMobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    chapterNineMobileMetrics.scrollWidth <= chapterNineMobileMetrics.clientWidth,
    `第9章が390px幅で横方向にはみ出しています: ${JSON.stringify(
      chapterNineMobileMetrics,
    )}`,
  );
  assert(
    (await fieldOrderCard.getByRole("button", { name: "順序を確認" }).isVisible()) &&
      (await fieldRecordSection
        .getByRole("button", { name: "選択した項目を判定" })
        .isVisible()) &&
      (await fieldDecisionSection
        .getByRole("button", { name: /再計算する/ })
        .isVisible()),
    "390px幅で第9章の主要操作を利用できません。",
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
    coordinateApiRequests.length === 0,
    `実行時に外部座標APIへ接続しました: ${coordinateApiRequests.join(
      " | ",
    )}`,
  );
  assert(
    externalApiRequests.length === 0,
    `実行時に外部APIへ接続しました: ${externalApiRequests.join(" | ")}`,
  );

  console.log(
    JSON.stringify(
      {
        initialTraversePreserved: true,
        lessonRegistrySlots: 9,
        comingSoonLessons: 0,
        surveyPurposeSelection: true,
        pointSelection: true,
        courseSwitchStatePreserved: true,
        lessonProgress: true,
        fixedCoordinateRepresentation: true,
        coordinateSystemAndZone: true,
        coordinateQuadrantSigns: true,
        fixedGeoidHeight: true,
        elevationCalculation: true,
        heightReferenceComparison: true,
        benchmarkTerminology: true,
        chapterTwoStatePreserved: true,
        distanceTriangleOperation: true,
        distanceMethodSelection: true,
        prismConstantLearningModel: true,
        distanceRepeatedObservation: true,
        distanceScaleComparison: true,
        chapterThreeStatePreserved: true,
        azimuthSliderAndDmsNudges: true,
        azimuthBoundaryNormalization: true,
        horizontalSightSelection: true,
        clockwiseCounterclockwiseAngles: true,
        interiorExteriorComparison: true,
        nextAzimuthCalculation: true,
        dmsCarryAndBorrow: true,
        dmsBoundaryNormalization: true,
        verticalZenithComparison: true,
        chapterFourStatePreserved: true,
        totalStationSetupOrder: true,
        totalStationConditionSelection: true,
        totalStationBacksightOrientation: true,
        totalStationDerivedValues: true,
        totalStationHeightInputImpact: true,
        totalStationChecklist: true,
        totalStationInspectionDecision: true,
        chapterFiveStatePreserved: true,
        levelingLiveCalculation: true,
        levelingMethodComparison: true,
        levelingTurningPoint: true,
        levelingRouteClosure: true,
        levelingStaffVerticality: true,
        levelingSightDistanceBalance: true,
        levelingInstrumentCondition: true,
        chapterSixStatePreserved: true,
        accuracyPrecisionPatterns: true,
        repeatedObservationStatistics: true,
        observationErrorTypeComparison: true,
        heightInputErrorDirection: true,
        independentErrorPropagation: true,
        errorResidualClosureComparison: true,
        inspectionDecisionPractice: true,
        chapterSevenStatePreserved: true,
        coordinateForwardCalculation: true,
        coordinateInverseCalculation: true,
        coordinateInverseCardinalAndQuadrants: true,
        coordinateCoincidentPointSafety: true,
        coordinateForwardInverseComparison: true,
        coordinateClosureBridge: true,
        traverseCourseLink: true,
        traverseInputStatePreserved: true,
        chapterEightStatePreserved: true,
        fieldWorkflowOrder: true,
        fieldPreObservationChecklist: true,
        fieldObservationRecordIssues: true,
        fieldAdoptRecalculateRemeasureDecision: true,
        fieldObservedCalculatedResultValues: true,
        fieldBookToResultTableFlow: true,
        chapterNineStatePreserved: true,
        chapterOneDesktopHorizontalOverflow: false,
        chapterOneMobileHorizontalOverflow: false,
        chapterTwoDesktopHorizontalOverflow: false,
        chapterTwoMobileHorizontalOverflow: false,
        chapterThreeDesktopHorizontalOverflow: false,
        chapterThreeMobileHorizontalOverflow: false,
        chapterFourDesktopHorizontalOverflow: false,
        chapterFourMobileHorizontalOverflow: false,
        chapterFiveDesktopHorizontalOverflow: false,
        chapterFiveMobileHorizontalOverflow: false,
        chapterSixDesktopHorizontalOverflow: false,
        chapterSixMobileHorizontalOverflow: false,
        chapterSevenDesktopHorizontalOverflow: false,
        chapterSevenMobileHorizontalOverflow: false,
        chapterEightDesktopHorizontalOverflow: false,
        chapterEightMobileHorizontalOverflow: false,
        chapterNineDesktopHorizontalOverflow: false,
        chapterNineMobileHorizontalOverflow: false,
        mobileNavigation: true,
        coordinateApiRequests,
        externalApiRequests,
        consoleErrors,
        pageErrors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
