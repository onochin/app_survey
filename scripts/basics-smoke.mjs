import { chromium } from "playwright";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const pageErrors = [];

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

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  assert(
    await page.getByText("Phase 4", { exact: true }).isVisible(),
    "初期表示が既存の多角測量ではありません。",
  );

  await page.getByRole("button", { name: "測量の基礎" }).click();
  assert(
    await page.locator(".basics-hero").isVisible(),
    "「測量の基礎」教材が表示されていません。",
  );

  await page.getByRole("button", { name: "P1：新点" }).click();
  assert(
    await page.getByText("測点 P1", { exact: true }).isVisible(),
    "新点P1の座標情報へ切り替わりません。",
  );

  await page.getByRole("button", { name: /距離と方向/ }).click();
  await page.locator("#azimuth-range").evaluate((input) => {
    input.value = "200.5";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert(
    await page
      .locator(".basics-angle-result.is-azimuth strong")
      .filter({ hasText: "200° 30′ 00″" })
      .isVisible(),
    "方位角スライダーの度分秒表示が更新されません。",
  );
  await page.getByRole("button", { name: "+1″", exact: true }).click();
  assert(
    await page
      .locator(".basics-angle-result.is-azimuth strong")
      .filter({ hasText: "200° 30′ 01″" })
      .isVisible(),
    "方位角を1秒単位で調整できません。",
  );

  await page.getByRole("button", { name: /高さを比べる/ }).click();
  const elevationRange = page.locator("#elevation-range");
  await elevationRange.focus();
  await elevationRange.press("Home");
  for (let step = 0; step < 15; step += 1) {
    await elevationRange.press("ArrowRight");
  }
  const heightDifferenceText = await page
    .locator(".basics-height-difference-value")
    .textContent();
  assert(
    heightDifferenceText?.replace(/\s/g, "") === "−1.500m",
    `新点が低い場合の高低差を表示できません: ${
      heightDifferenceText ?? "値なし"
    }`,
  );

  await page.getByRole("button", { name: /観測と機器/ }).click();
  await page
    .getByRole("button", { name: "もう1回観測する" })
    .click();
  await page
    .getByRole("button", { name: "もう1回観測する" })
    .click();
  assert(
    await page
      .locator(".basics-mean-result strong")
      .filter({ hasText: "42.684 m" })
      .isVisible(),
    "3回の反復観測から平均値を表示できません。",
  );

  await page
    .locator(".basics-instrument-selector")
    .getByRole("tab", { name: /レベル/ })
    .click();
  assert(
    await page
      .locator(".basics-instrument-detail")
      .getByText("高低差", { exact: true })
      .isVisible(),
    "レベルで測れる項目が表示されません。",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.locator(".mobile-section-navigation").isVisible(),
    "スマートフォン幅で教材切替が表示されません。",
  );
  const mobileMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(
    mobileMetrics.scrollWidth <= mobileMetrics.clientWidth,
    `390px幅で横方向にはみ出しています: ${JSON.stringify(mobileMetrics)}`,
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
    consoleErrors.length === 0,
    `コンソールエラー: ${consoleErrors.join(" | ")}`,
  );
  assert(
    pageErrors.length === 0,
    `ページ例外: ${pageErrors.join(" | ")}`,
  );

  console.log(
    JSON.stringify(
      {
        initialTraversePreserved: true,
        pointSelection: true,
        azimuthAndDmsOperation: true,
        heightDifferenceOperation: true,
        repeatedObservation: true,
        instrumentSelection: true,
        mobileNavigation: true,
        mobileHorizontalOverflow: false,
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
