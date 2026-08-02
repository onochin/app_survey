import { chromium } from "playwright";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const pageErrors = [];
const skipScreenshots = process.env.SKIP_SCREENSHOTS === "1";

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
  assert(
    await page
      .getByRole("heading", {
        name: "閉合トラバース測量シミュレーター",
      })
      .isVisible(),
    "現行のシミュレーター名が表示されていません。",
  );

  await page.getByRole("tab", { name: /誤差の見える化/ }).click();
  assert(
    await page
      .getByText("閉合差ベクトルはステップ6で表示します")
      .isVisible(),
    "計算前の閉合差案内が表示されていません。",
  );
  await page.getByRole("tab", { name: "観測手簿", exact: true }).click();

  const traverseSvg = page.locator(".traverse-svg");
  await traverseSvg.scrollIntoViewIfNeeded();
  const p1Ring = page
    .locator('svg .survey-point[aria-label^="P1（"]')
    .locator(".point-ring");
  const p1Box = await p1Ring.boundingBox();
  const svgBox = await traverseSvg.boundingBox();
  assert(
    p1Box !== null && svgBox !== null,
    "交差テスト用の画面位置を取得できません。",
  );

  const crossedTarget = {
    x: svgBox.x + (158 / 900) * svgBox.width,
    y: svgBox.y + (369 / 500) * svgBox.height,
  };
  await page.mouse.move(
    p1Box.x + p1Box.width / 2,
    p1Box.y + p1Box.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(crossedTarget.x, crossedTarget.y, {
    steps: 8,
  });
  await page.mouse.up();

  const crossedWarningVisible = await page
    .getByText(/観測辺が交差しています。/)
    .isVisible();
  const p1PositionAfterDrag = {
    cx: await p1Ring.getAttribute("cx"),
    cy: await p1Ring.getAttribute("cy"),
  };
  const visibleMessage = await page
    .locator(".simulation-message")
    .textContent()
    .catch(() => null);
  assert(
    crossedWarningVisible,
    `辺交差時の日本語警告が表示されていません。P1=${JSON.stringify(
      p1PositionAfterDrag,
    )} message=${visibleMessage ?? "なし"}`,
  );
  assert(
    await page
      .getByRole("button", { name: "辺の交差を解消してください" })
      .isDisabled(),
    "辺交差中も計算ボタンが有効です。",
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

  await page.getByRole("tab", { name: /誤差の見える化/ }).click();
  assert(
    await page
      .getByText(/誤差ベクトル表示倍率：100倍/)
      .isVisible(),
    "100倍の表示倍率が明記されていません。",
  );
  assert(
    (await page.locator(".closure-target-point").count()) === 1 &&
      (await page.locator(".closure-calculated-point").count()) === 1,
    "本来の閉合点または計算上の閉合点がありません。",
  );
  assert(
    (await page.locator(".closure-resultant-arrow").count()) === 1,
    "合成閉合差fの矢印がありません。",
  );

  await page.locator(".closure-visualization").scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  if (!skipScreenshots) {
    await page.screenshot({
      path: "doc/screenshots/phase4-closure-1366.png",
      fullPage: false,
    });
  }

  await page.getByRole("tab", { name: /確認問題/ }).click();
  await page.getByLabel("器械の整準不良").check();
  await page
    .getByRole("button", { name: "回答を確認する" })
    .click();
  assert(
    await page
      .getByText("もう一度考えてみましょう")
      .isVisible(),
    "誤答時の理由が表示されていません。",
  );

  await page.getByLabel("上記すべて").check();
  await page
    .getByRole("button", { name: "回答を確認する" })
    .click();
  assert(
    await page.getByText("正解です", { exact: true }).isVisible(),
    "正答時の解説が表示されていません。",
  );
  assert(
    (await page.locator(".learning-stages li.is-completed").count()) ===
      3,
    "計算と確認問題の完了後も学習の流れが完了表示になりません。",
  );

  await page.locator(".quiz-card").scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  if (!skipScreenshots) {
    await page.screenshot({
      path: "doc/screenshots/phase4-complete-1366.png",
      fullPage: false,
    });
  }

  await page.getByRole("tab", { name: /学習メモ/ }).click();
  assert(
    await page
      .getByText("閉合差が大きくなる原因", { exact: true })
      .isVisible(),
    "確認問題の学習記録が一覧にありません。",
  );
  assert(
    await page.getByText("要復習", { exact: true }).isVisible(),
    "誤答した確認問題が復習対象になっていません。",
  );
  assert(
    await page.getByText("学習回数：2回", { exact: true }).isVisible(),
    "確認問題の回答回数が記録されていません。",
  );

  await page.getByRole("tab", { name: "計算簿", exact: true }).click();
  await page.getByLabel("理解できた").check();
  await page.getByLabel("あとで復習").check();
  await page
    .getByPlaceholder(
      "分からなかった点、覚え方、次回確認することを入力",
    )
    .fill("補正後の成分を座標へ加算する順番を復習する");
  await page
    .getByRole("button", { name: "今回の学習を記録" })
    .click();

  await page.getByRole("tab", { name: /学習メモ/ }).click();
  assert(
    await page
      .locator(".learning-review-list")
      .getByRole("heading", { name: "新点座標", exact: true })
      .isVisible(),
    "計算ステップの学習記録が一覧にありません。",
  );
  assert(
    await page
      .locator(".learning-review-note")
      .getByText(
        "補正後の成分を座標へ加算する順番を復習する",
        { exact: true },
      )
      .isVisible(),
    "入力した学習メモが一覧に反映されていません。",
  );
  assert(
    (await page.locator(".learning-review-list > li").count()) === 2,
    "記録済み項目の件数が正しくありません。",
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("tab", { name: /学習メモ/ }).click();
  assert(
    (await page.locator(".learning-review-list > li").count()) === 2,
    "再読み込み後に学習記録を復元できません。",
  );
  assert(
    await page
      .locator(".learning-review-note")
      .getByText(
        "補正後の成分を座標へ加算する順番を復習する",
        { exact: true },
      )
      .isVisible(),
    "再読み込み後に学習メモを復元できません。",
  );

  await page
    .locator(".learning-review-list > li")
    .filter({ hasText: "新点座標" })
    .getByRole("button", { name: "この項目を開く" })
    .click();
  assert(
    await page
      .locator(".calculation-detail")
      .getByRole("heading", { name: "新点座標", exact: true })
      .isVisible(),
    "再読み込み後の復習一覧から記録済みステップを開けません。",
  );

  await page.getByRole("button", { name: "リセット" }).click();
  await page.getByRole("tab", { name: /学習メモ/ }).click();
  assert(
    (await page.locator(".learning-review-list > li").count()) === 2,
    "リセット操作で学習記録が消えました。",
  );

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
        crossedEdgesBlockedCalculation: true,
        closureVectorRevealedAtStep6: true,
        displayMultiplier: 100,
        incorrectAnswerExplained: true,
        correctAnswerExplained: true,
        learningFlowCompleted: true,
        incorrectQuizAddedToReview: true,
        learningRecordPersistedAfterReload: true,
        learningRecordPreservedAfterReset: true,
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
