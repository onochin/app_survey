import { chromium } from "playwright";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

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

  await page.goto("http://127.0.0.1:4173/", {
    waitUntil: "networkidle",
  });
  assert(
    await page.getByText("Phase 4", { exact: true }).isVisible(),
    "Phase 4バッジが表示されていません。",
  );
  await page.screenshot({
    path: "doc/screenshots/phase3-compat-initial-1366.png",
    fullPage: true,
  });

  const distanceInput = page.locator(
    'input[aria-label="aからp1の観測距離"]',
  );
  const observedBefore = await distanceInput.inputValue();
  const theoreticalBefore = await page
    .locator("svg .distance-label text")
    .first()
    .textContent();
  const p1 = page.locator(
    'svg .survey-point[aria-label^="P1（"]',
  );
  const p1Ring = p1.locator(".point-ring");
  const p1InitialPosition = {
    x: await p1Ring.getAttribute("cx"),
    y: await p1Ring.getAttribute("cy"),
  };
  const p1Box = await p1Ring.boundingBox();
  assert(p1Box !== null, "P1の画面位置を取得できません。");

  await page.mouse.move(
    p1Box.x + p1Box.width / 2,
    p1Box.y + p1Box.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    p1Box.x + p1Box.width / 2 + 45,
    p1Box.y + p1Box.height / 2 + 20,
    { steps: 6 },
  );
  await page.mouse.up();

  const observedAfter = await distanceInput.inputValue();
  const theoreticalAfter = await page
    .locator("svg .distance-label text")
    .first()
    .textContent();
  assert(
    observedAfter === observedBefore,
    "ドラッグにより観測距離が変更されました。",
  );
  assert(
    theoreticalAfter !== theoreticalBefore,
    "ドラッグ後も図上の理論距離が変化していません。",
  );
  assert(
    (await page
      .locator("svg .selected-point-label")
      .textContent()) === "選択中",
    "選択中ラベルが表示されていません。",
  );

  await page.getByRole("button", { name: "リセット" }).click();
  assert(
    (await p1Ring.getAttribute("cx")) === p1InitialPosition.x &&
      (await p1Ring.getAttribute("cy")) === p1InitialPosition.y,
    "リセット後にP1が初期位置へ戻りませんでした。",
  );

  const bRing = page
    .locator('svg .survey-point[aria-label^="B（"]')
    .locator(".point-ring");
  const bPosition = {
    x: await bRing.getAttribute("cx"),
    y: await bRing.getAttribute("cy"),
  };
  const bBox = await bRing.boundingBox();
  assert(bBox !== null, "Bの画面位置を取得できません。");
  await page.mouse.move(
    bBox.x + bBox.width / 2,
    bBox.y + bBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bBox.x + bBox.width / 2 + 40,
    bBox.y + bBox.height / 2 - 30,
  );
  await page.mouse.up();
  assert(
    (await bRing.getAttribute("cx")) === bPosition.x &&
      (await bRing.getAttribute("cy")) === bPosition.y,
    "固定点Bがドラッグで移動しました。",
  );
  await page.getByRole("button", { name: "リセット" }).click();

  await page
    .getByRole("button", { name: "次へ：ステップ2" })
    .click();
  assert(
    (await page
      .locator(
        '.calculation-steps li[aria-current="step"] .step-title',
      )
      .textContent()) === "角度閉合差",
    "ステップ2へ進みませんでした。",
  );

  await page
    .getByRole("tab", { name: "観測手簿", exact: true })
    .click();
  await distanceInput.fill("142");
  assert(
    (await page
      .locator(
        '.calculation-steps li[aria-current="step"] .step-title',
      )
      .textContent()) === "観測角",
    "観測値編集後にステップ1へ戻りませんでした。",
  );
  await distanceInput.fill("0");
  assert(
    await page
      .getByText("観測距離は0より大きい値で入力してください。")
      .isVisible(),
    "日本語の距離エラーが表示されていません。",
  );
  assert(
    await page
      .getByRole("button", { name: "入力値を修正してください" })
      .isDisabled(),
    "入力エラー時に次へボタンが無効化されていません。",
  );

  await page.getByRole("button", { name: "リセット" }).click();
  for (let nextStep = 2; nextStep <= 8; nextStep += 1) {
    await page
      .getByRole("button", {
        name: `次へ：ステップ${nextStep}`,
      })
      .click();
  }

  assert(
    await page
      .getByRole("button", { name: "全8ステップ完了" })
      .isDisabled(),
    "ステップ8まで到達していません。",
  );
  const resultRows = await page
    .locator(".result-table tbody tr")
    .count();
  assert(
    resultRows === 6,
    `結果表は6行を期待しましたが、${resultRows}行でした。`,
  );
  assert(
    await page
      .getByText("合成閉合差 f", { exact: true })
      .isVisible(),
    "閉合差の計算結果が表示されていません。",
  );

  await page.locator(".result-card").scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  await page.screenshot({
    path: "doc/screenshots/phase3-compat-complete-1366.png",
    fullPage: false,
  });

  const metrics = await page.evaluate(() => {
    const documentElement = document.documentElement;

    return {
      viewport: { width: innerWidth, height: innerHeight },
      document: {
        scrollWidth: documentElement.scrollWidth,
        scrollHeight: documentElement.scrollHeight,
        clientWidth: documentElement.clientWidth,
      },
      horizontalOverflow:
        documentElement.scrollWidth > documentElement.clientWidth,
    };
  });

  assert(
    !metrics.horizontalOverflow,
    "1366px幅でページ全体に横方向のはみ出しがあります。",
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
        theoreticalDistanceChanged:
          theoreticalAfter !== theoreticalBefore,
        observedDistanceStayedSeparate:
          observedAfter === observedBefore,
        resetRestoredP1: true,
        fixedPointBStayedFixed: true,
        calculationCompleted: true,
        resultRows,
        consoleErrors,
        pageErrors,
        metrics,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
