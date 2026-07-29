# 測量理解ラボ 引継ぎ資料

最終更新日: 2026-07-27  
作業ディレクトリ: `/home/newono/ai_proj/app_simulation/survey-learning-lab`

## 1. 現在の状態

「測量理解ラボ：閉合多角測量シミュレーター」のPhase 4まで完了し、
要件に記載された初期版の機能を実装済み。

完了済み:

- 既存プロジェクト構成の確認
- 要件整理Markdownの全文確認
- UI参考画像の目視確認
- 技術方針の決定
- npmパッケージの事前安全確認
- TypeScriptの型定義
- 閉合多角測量の計算ロジック
- 計算ロジックの単体テスト
- TypeScript型検査
- 依存関係の脆弱性・署名検証
- React関連パッケージの事前安全確認とローカル導入
- Playwrightの事前安全確認とプロジェクト内へのローカル導入
- Chromium Headless ShellとFFmpegのプロジェクト内への導入
- Headlessブラウザ起動とメモリ上でのPNG生成確認
- Vite / Reactアプリのエントリーポイント
- 上部ヘッダー、左サイドバー、中央画面、右学習パネル
- SVGによる静的な閉合多角形表示
- 表示用サンプルデータ
- 本番ビルドとローカルHTTP起動確認
- 測点ドラッグ
- 観測値編集
- 観測手簿
- 計算ステップの進行・解説
- 計算結果表
- 図上理論値と観測値の分離
- 入力値変更時の計算無効化とリセット
- 日本語入力エラー表示
- PlaywrightによるPhase 2基準画面撮影
- PlaywrightによるPhase 3実操作スモークテスト
- 交差辺の検出、警告、計算停止
- 100倍固定の閉合差ベクトル可視化
- 解説付き確認問題1問
- Phase 4の最終UI調整
- README
- PlaywrightによるPhase 4実操作スモークテストと画面撮影

Phase 3開始前に確定したB点、初期方位角、ドラッグ時の値更新仕様は
実装へ反映済み。Phase 4開始前に推奨案として確認した交差辺と表示倍率の
仕様も実装へ反映した。確定内容と残る注意点は「12. Phase 3で確定・
実装した仕様と残る懸念」および「13. Phase 4で実装した内容」に記載している。

## 2. 要件・参考資料

- 要件:
  `prompt/依頼01_測量理解ラボ_測量シミュレーター初期版の作成.md`
- UI参考画像:
  `prompt/依頼01_測量理解ラボのダッシュボード.png`

参考画像は1672×941pxのデスクトップ向けダッシュボードで、白・薄いグレー・青を基調としている。

## 3. 重要な作業ルール

- 返答は日本語。
- 結論、手順、注意点の順で簡潔に報告する。
- 変更はプロジェクト配下だけに限定する。
- 最小差分とし、無関係な整形やリファクタを混ぜない。
- コマンド前に「目的 / 実行内容 / 期待結果」を説明する。
- パッケージ追加・更新は、対象・目的・影響を説明してユーザー承認を得る。
- npmのグローバルインストールやnpm本体の更新は行わない。
- 不明な仕様を推測で確定しない。
- 削除、上書き、外部送信などは事前確認する。

コマンド実行時、既定のnpmキャッシュ `/home/newono/.npm` は読み取り専用である。npmを使用する場合は、プロジェクト内キャッシュを明示する。

```bash
--cache .npm-cache
```

`.npm-cache/` は `.gitignore` 済み。

## 4. 作業開始時の既存構成

開始時に存在した実ファイルは、要件MarkdownとUI参考画像だけだった。アプリ雛形、`package.json`、ソースコードはなかった。

Gitのルートは本プロジェクトではなく、上位の `/home/newono` になっている。本プロジェクトは上位Gitから見ると未追跡ディレクトリである。上位に存在する無関係な変更やファイルには触れないこと。

## 5. 採用した技術構成

- Node.js 22.17.0
- npm 11.10.0
- TypeScript 6.0.3
- Vite 8.1.5
- Vitest 4.1.10
- React 19.2.8
- React DOM 19.2.8
- @vitejs/plugin-react 6.0.4
- @types/react 19.2.17
- @types/react-dom 19.2.3
- Playwright 1.61.1
- Chromium Headless Shell 149.0.7827.55（Playwright build v1228）
- FFmpeg（Playwright build v1011）
- ESM
- TypeScript strictモード
- React JSX runtime
- SVGとCSSによるUI
- UI非依存の純粋関数による計算層

UIライブラリ、アイコンライブラリ、外部フォントは追加していない。
アイコンと測量図はインラインSVGで実装している。

TypeScript 7.0.2も正規パッケージだったが、複数のプラットフォーム別バイナリ依存を持つため、Phase 1では依存の少ない安定版6.0.3を固定採用した。

Playwrightのブラウザはhermetic構成とし、次へ保存している。

```text
node_modules/playwright-core/.local-browsers/
```

実行時は `PLAYWRIGHT_BROWSERS_PATH=0` を指定する。`node_modules/` は
Git管理外なので、削除または `npm ci` 後はブラウザの再取得が必要。

## 6. npm依存関係の安全確認

直接依存は次の9つだけで、すべて完全固定している。

```json
{
  "dependencies": {
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.4",
    "playwright": "1.61.1",
    "typescript": "6.0.3",
    "vite": "8.1.5",
    "vitest": "4.1.10"
  }
}
```

確認結果:

- npm registry: `https://registry.npmjs.org/`
- lockfileVersion: 3
- lockfile上のパッケージ数: 86
- Linux上に展開されたパッケージ数: 56
- Git依存: なし
- ローカルファイル依存: なし
- 任意URL依存: なし
- 全配布物にintegrityあり
- `npm audit`: 脆弱性0件
- npm registry署名: 56件すべて検証成功
- attestation: 28件検証成功

実行したインストール:

```bash
npm ci --ignore-scripts --no-audit --no-fund --cache .npm-cache
```

install scriptはすべて無効化している。

Playwright追加時は、実体の展開前にlockのみを更新して監査した。

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund --cache .npm-cache
npm install --ignore-scripts --no-audit --no-fund --cache .npm-cache
```

lockfile上で `hasInstallScript` が付いているのは `fsevents@2.3.3` と
Playwrightの任意依存 `fsevents@2.3.2` だけである。どちらもmacOS専用で、
`os: ["darwin"]` のためLinuxには展開されていない。

展開後のパッケージメタデータでは、`csstype@3.2.3`の`prepublish`、
`lightningcss@1.33.0`と`tinyexec@1.2.4`の`prepare`も確認した。
これらも`--ignore-scripts`により実行していない。

npm 11.18.0への更新通知が表示されたが、更新していない。

### 6.1 Playwrightとブラウザの確認結果

- 正規パッケージ `playwright@1.61.1` を完全固定
- 直接依存は完全一致の `playwright-core@1.61.1`
- npm公式registry以外の取得元なし
- npmライフサイクルスクリプトは実行していない
- `npm audit`: 脆弱性0件
- `npm audit signatures`: 署名56件、attestation 28件を検証
- `fsevents` はLinux上に未展開
- dry-runで取得元と保存先を確認してからブラウザを取得
- Chromium Headless ShellとFFmpegの取得元はPlaywright公式CDN
- `sudo`、`apt`、`snap`、`npm -g`、`--with-deps`は不使用
- フルChromium、Firefox、WebKitは未導入
- ローカルブラウザの実容量は約267MB

## 7. 作成したファイル

```text
.
├── .gitignore
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── scripts/
│   ├── phase3-smoke.mjs
│   └── phase4-smoke.mjs
├── tsconfig.json
├── vite.config.ts
├── doc/
│   ├── HANDOFF.md
│   └── screenshots/
│       ├── phase2-baseline-1366.png
│       ├── phase3-initial-1366.png
│       ├── phase3-complete-1366.png
│       ├── phase4-closure-1366.png
│       └── phase4-complete-1366.png
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── styles.css
    ├── vite-env.d.ts
    ├── calculations/
    │   ├── adjustment.ts
    │   ├── angle.ts
    │   ├── azimuth.ts
    │   ├── closure.ts
    │   ├── coordinate.ts
    │   ├── geometry.ts
    │   └── traverse.ts
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   └── Sidebar.tsx
    │   └── traverse/
    │       ├── CalculationBook.tsx
    │       ├── CalculationDetail.tsx
    │       ├── CalculationSteps.tsx
    │       ├── ClosureVector.tsx
    │       ├── ObservationTable.tsx
    │       ├── QuizCard.tsx
    │       ├── ResultTable.tsx
    │       ├── TraverseSimulator.tsx
    │       ├── TraverseWorkspace.tsx
    │       └── TraverseSvg.tsx
    ├── data/
    │   └── traverseSample.ts
    ├── tests/
    │   ├── adjustment.test.ts
    │   ├── angle.test.ts
    │   ├── azimuth.test.ts
    │   ├── coordinate.test.ts
    │   ├── geometry.test.ts
    │   ├── observationInput.test.ts
    │   └── traverse.test.ts
    ├── types/
    │   └── traverse.ts
    └── utils/
        ├── calculationSteps.ts
        ├── closureVector.ts
        ├── formatAngle.ts
        └── observationInput.ts
```

### 7.1 Phase 2のUI実装

- `Header.tsx`: アプリ名、サブタイトル、表示モード
- `Sidebar.tsx`: 教材メニュー、多角測量の選択状態、学習進捗42%
- `TraverseSimulator.tsx`: 仮想現場図カードとPhase 3操作の無効表示
- `TraverseSvg.tsx`: 測量座標からSVG座標への等縮尺変換と静的描画
- `CalculationSteps.tsx`: 8段階の学習順序を静的に案内
- `styles.css`: 参考画像に合わせた白・薄灰・青基調のデスクトップUI

SVGにはA、P1、P2、P3、P4、B、観測辺、距離、内角、北方向、縮尺、
凡例、等高線風背景、トータルステーション簡易アイコンを表示している。

`src/data/traverseSample.ts`の表示用サンプルは、六角形の幾何に基づく
自然な点配置へ小さな観測誤差を加えている。観測内角和は
`720°00′12″`で、理論内角和に対する閉合差は`+12″`。

Phase 2時点ではイベントハンドラを追加しておらず、ドラッグ、入力、
計算進行、リセットは表示上も無効だった。これらはPhase 3で実装済み。

### 7.2 Phase 3の操作・計算UI

- `TraverseWorkspace.tsx`: 測点、観測入力、選択、タブ、計算ステップを統合管理
- `TraverseSvg.tsx`: P1～P4のポインタードラッグ、A/B固定、範囲制限、選択表示
- `geometry.ts`: 理論距離、時計回り内角、測量座標とSVG座標の相互変換
- `ObservationTable.tsx`: 十進度・距離・初期方位角の編集、DMS表示、日本語エラー
- `CalculationSteps.tsx` / `CalculationDetail.tsx`: 8段階の進行、式、代入値、結果、理由、注意
- `CalculationBook.tsx`: 方位角、緯距・経距、補正量、補正後成分の段階表示
- `ResultTable.tsx`: 数値の閉合差、閉合比、補正後座標
- `traverse.ts`: 既存の純粋関数を順番に呼ぶ閉合トラバース一括計算
- `phase3-smoke.mjs`: 1366px幅でドラッグ、固定点、入力、リセット、計算完了を自動確認

ドラッグ時に更新するのは測点の図上座標と、そこから求める理論距離・
理論内角だけである。観測値は別状態のまま保持し、どちらかを変更すると
計算ステップを1へ戻す。

### 7.3 Phase 4の可視化・確認問題

- `ClosureVector.tsx`: 本来の閉合点、計算上の閉合点、fx・fy・fをSVG表示
- `closureVector.ts`: X北・Y東をSVG座標へ変換し、100倍表示用の点を生成
- `QuizCard.tsx`: 四択1問、誤答案内、正答理由を表示
- `geometry.ts`: 隣接しない観測辺の交差判定
- `TraverseWorkspace.tsx`: 可視化・問題タブ、交差中の計算停止、問題状態のリセット
- `phase4-smoke.mjs`: 交差、計算、可視化、誤答・正答、画面幅を自動確認
- `README.md`: 目的、実装範囲、導入・起動・テスト、座標規約、注意事項

閉合差の実際の値と100倍した図を別領域に表示する。通常サンプルでは
100倍したベクトルをそのまま描き、極端な入力だけ図枠へ自動フィットする
旨を画面に表示する。

## 8. 型定義

`src/types/traverse.ts` に以下を定義している。

要件で指定された型:

- `SurveyPoint`
- `TraverseLeg`
- `AngleObservation`
- `TraverseObservation`
- `CoordinateIncrement`
- `ClosureResult`
- `AdjustedCoordinate`
- `CalculationStep`

補助型:

- `SurveyCoordinate`
- `DmsAngle`
- `AngularClosureResult`
- `AngleAdjustmentResult`
- `AdjustedCoordinateIncrement`
- `CalculationStepStatus`

`TraverseObservation` の配列規約:

- `points`、`legs`、`angles` は閉合多角形をたどる順序
- `angles[i]` は `points[i]` の内角
- 初期方位角は最初の辺 `points[0] → points[1]` の方位角として扱う

初期方位角の対象はユーザー確認済みの `A → P1` であり、
`traverseSample` に45°の初期値を設定している。

## 9. 計算ロジック

### 9.1 角度

ファイル: `src/calculations/angle.ts`

実装済み:

- 度からラジアンへの変換
- 十進度から度分秒への変換
- 度分秒から十進度への変換
- 角度の0度以上360度未満への正規化
- 理論内角和
- 角度閉合差
- 丸めなしの角度均等補正
- 秒精度を指定した角度均等補正
- 秒単位で割り切れない残差の配分

式:

```text
理論内角和 = (n - 2) × 180°
fβ = Σβi - (n - 2) × 180°
vβ = -fβ / n
β'i = βi + vβ
rad = degree × π / 180
```

秒残差は観測順の先頭から1単位ずつ配分する。合計が理論内角和に一致するよう、浮動小数点だけに由来する最終残差を最後の角で調整する。

### 9.2 方位角

ファイル: `src/calculations/azimuth.ts`

式:

```text
次辺の方位角 = 前辺の方位角 + 180° - 補正内角
```

結果は0度以上360度未満に正規化する。

時計回りの巡回を前提としており、最初の辺が点0→点1の場合、点1の内角から2本目の方位角を求める。点0の内角は最終辺から最初の辺へ戻る閉合確認に使用する。

### 9.3 緯距・経距

ファイル: `src/calculations/coordinate.ts`

座標系:

- X: 北方向
- Y: 東方向
- 方位角: 北を0度として時計回り

式:

```text
ΔX = S × cos α
ΔY = S × sin α
```

角度はラジアンへ変換して三角関数へ渡す。

補正後成分を既知点座標へ順次加算する座標累積処理も実装済み。

### 9.4 座標閉合差

ファイル: `src/calculations/closure.ts`

式:

```text
fx = ΣΔX
fy = ΣΔY
f = √(fx² + fy²)
閉合比 = ΣS / f
```

既定の「ほぼ閉合」判定値は `1e-10`。閉合差がこの値以下なら
`closureRatio` を `null` としてゼロ除算を避け、UIでは
「完全閉合に近い」と表示する。

### 9.5 コンパス法

ファイル: `src/calculations/adjustment.ts`

式:

```text
cXi = -fx × Si / ΣS
cYi = -fy × Si / ΣS
ΔX'i = ΔXi + cXi
ΔY'i = ΔYi + cYi
```

浮動小数点演算だけに由来する最終残差は最後の辺に加え、補正後成分の合計を許容誤差内で0にする。

## 10. バリデーション

計算層で実装済み:

- 非有限数の拒否
- 測点数3未満の拒否
- 内角0度以下または360度以上の拒否
- 距離0以下の拒否
- 辺数と方位角数の不一致拒否
- 非連続な辺順序の拒否
- DMSの分・秒範囲確認
- 無効な秒精度の拒否
- 閉合比のゼロ除算回避
- 隣接しない観測辺の交差検出

Phase 3では各入力欄へ日本語メッセージを表示し、計算層の英語例外を
そのまま画面へ出さない変換も実装した。Phase 4では交差形状を日本語で
警告し、単純な閉合多角形へ戻るまで計算ステップを進めない。

## 11. テスト結果

実行コマンド:

```bash
npm run typecheck -- --pretty false
npm test -- --reporter=verbose
npm run build
```

結果:

- TypeScript型検査: 成功、エラー0件
- Test Files: 7 passed
- Tests: 35 passed
- 失敗: 0
- Vitest実行時間: 約461ms
- Vite本番ビルド: 成功、40 modules transformed
- JS成果物: 約251.11 kB、gzip約78.38 kB
- CSS成果物: 約30.55 kB、gzip約6.67 kB
- 開発サーバー: `127.0.0.1:4173`で起動成功
- ローカルHTTP確認: 200 OK
- Playwright 1.61.1のCLI登録確認
- Chromium Headless Shell 149.0.7827.55の起動成功
- Headlessブラウザでメモリ上のPNG生成成功（3,192 bytes）
- Playwright導入後もTests 19件とVite本番ビルドが成功
- Phase 2画面を1366×768のviewport・全ページで自動撮影
- Phase 3の初期画面と計算完了画面を自動撮影
- P1ドラッグで理論距離が変わり、観測距離は変わらないことを確認
- リセットでP1が初期位置へ戻ることを確認
- 固定点Bがドラッグで移動しないことを確認
- 観測値編集でステップ1へ戻ることを確認
- 距離0で日本語エラーと次へボタン無効化を確認
- ステップ8完了と結果表6行を確認
- P1を交差形状へ動かすと日本語警告が出て計算が停止することを確認
- ステップ6より前は閉合差図が未表示であることを確認
- ステップ6以降に本来の閉合点、計算上の閉合点、fx・fy・fが出ることを確認
- 閉合差ベクトルの表示倍率100倍が明記されることを確認
- 確認問題の誤答案内と正答理由を確認
- 計算完了と正答後に学習の流れ3項目が完了表示になることを確認
- Phase 4の閉合差図と正答後画面を1366×768で自動撮影
- 1366px幅でページ全体の横方向はみ出しなし
- ブラウザのコンソールエラー0件、ページ例外0件

検証項目:

- 度分秒と十進度の相互変換
- 負角のDMS往復
- 角度正規化
- 度からラジアンへの変換
- 理論内角和
- 角度閉合差
- 丸めなしの均等補正
- 秒残差配分
- 時計回り方位角
- 方位角閉合
- 緯距・経距
- 完全閉合時のゼロ除算回避
- `fx`、`fy`、合成閉合差、閉合比
- コンパス法による補正
- 補正後閉合
- 既知点からの座標累積
- 不正な測点数・距離
- 時計回りの図上内角と理論距離
- 測量座標とSVG座標の往復
- SVG表示範囲への座標制限
- 隣接しない辺の交差判定
- 閉合差のX北・Y東から100倍SVGベクトルへの変換
- 極端に大きい閉合差図の自動フィット
- 観測入力の日本語バリデーション
- Phase 3の一連の閉合計算
- 秒精度で表現できない角度の十進度補正
- 不正な辺順序の拒否

## 12. Phase 3で確定・実装した仕様と残る懸念

### 12.1 参考画像の内角（残る注意点）

参考画像に表示された6つの角度を合計すると640度になる。

六角形の理論内角和は720度なので、80度の差があり、「小さな観測誤差」という要件とは一致しない。画像の数値は見た目の参考値と判断し、Phase 2のサンプル値には使用していない。

Phase 2では、幾何的に整合する別の六角形へ合計`+12″`の観測角誤差と
センチメートル級の距離差を加えた表示用データを作成した。

### 12.2 B点の扱い（確定）

操作仕様ではAとBを固定点としている。一方、座標計算仕様は「既知点Aから補正後成分を加算する閉合多角測量」になっている。

参考画像ではAとBの両方が既知点に見えるが、本文の計算仕様と既存ロジックを
優先し、2026-07-27にユーザーが次の推奨仕様を承認した。

- Aは既知座標を持つ固定点
- BはSVG上でドラッグできない新点
- Bの表示用座標は既知座標拘束に使用しない
- B座標との既知点閉合差は追加しない
- 巡回順は `A → P1 → P2 → P3 → P4 → B → A`
- 通常の閉合多角測量として既存のコンパス法を使用する

現在のサンプルにあるBの `kind: "new"`、`isFixed: true` はこの確定仕様と一致する。

### 12.3 初期方位角の対象辺（確定）

初期方位角は次の辺を対象とする。

```text
A → P1 の方位角
```

これは既存の `calculateClosedTraverseAzimuths` が置いている前提と一致する。
Phase 3で `TraverseObservation` へ統合済み。

### 12.4 秒残差の配分順（確定）

均等補正で割り切れない秒残差は、次の観測順で先頭から配分する。

```text
A → P1 → P2 → P3 → P4 → B
```

UIでは補正量を各点の行へ表示し、合計が理論内角和と一致することを示す。

### 12.5 ブラウザ画像の最終確認

PlaywrightとChromium Headless Shellはプロジェクト内へ導入済みで、
Headless起動とメモリ上のPNG生成には成功している。

Phase 3のUI変更前に、Phase 2画面を1366px幅で撮影した。

```text
doc/screenshots/phase2-baseline-1366.png
```

DOM計測ではページ全体の横方向はみ出しはなく、主要領域の欠落、
文字切れも目視で確認されなかった。全高は1050pxで、右下カードは
縦スクロール後に表示される。

Phase 4完了時にPhase 3互換スモークも再実行したため、既存の
`phase3-initial-1366.png`と`phase3-complete-1366.png`は現在の
Phase 4最終UIで再撮影されている。今後は履歴名を上書きしないよう、
`phase3-smoke.mjs`の出力先を`phase3-compat-*`へ変更済み。

### 12.6 ドラッグと観測値の関係（確定）

- P1～P4のドラッグは測点座標、理論距離、理論内角を更新する
- ドラッグによって観測距離・観測内角を勝手に上書きしない
- 理論値と誤差を含む観測値は画面状態で分離する
- 観測値または測点座標の変更時は計算済み結果を無効化し、ステップ1へ戻す
- リセット時は測点、観測値、選択状態、計算状態を初期サンプルへ戻す

上記はすべてPhase 3へ実装済み。測点が重なると内角と方位を定義できないため、
ドラッグ時は他点から5m未満の位置を拒否し、日本語メッセージを表示する。

### 12.7 角度の入力と表示（確定）

- 入力は十進度
- 内部計算も丸めない十進度
- 画面表示は度分秒
- 不正入力は開発者向け例外を直接表示せず、日本語メッセージへ変換する

上記はすべてPhase 3へ実装済み。観測角が1秒単位で表現できる場合は
観測順で秒残差を配分し、それ以外は入力した十進度を丸めず均等補正する。

### 12.8 残る懸念

- 観測手簿と計算簿は1366px幅でカード内の横スクロールを使用する
- 辺が交差する位置へのドラッグ自体は許可し、警告と計算停止で対応している
- 閉合差ベクトルは初期版の推奨仕様として100倍固定で、倍率選択機能はない
- 極端に大きい閉合差は、100倍した値を図枠へ収めるため表示図のみ自動調整する
- ユーザー指定により、次回の実装時に「閉合多角測量」を
  「閉合トラバース測量」へ変更する。今回は現行アプリの表記を変更していない。
  画面・関連文書の変更対象範囲は、次回着手時に確認してから最小差分で対応する

## 13. Phase 4で実装した内容

実装済み:

- 本来の閉合点と計算上の閉合点
- X方向の`fx`、Y方向の`fy`、合成閉合差`f`の矢印
- 実数値と100倍表示の明確な区別
- 閉合比と補正後座標を含む既存結果との併用
- 四択確認問題1問、誤答案内、正答理由
- 交差辺の警告と計算停止
- Phase 4バッジ、完了状態、タブ表示の最終調整
- README
- Phase 4専用Playwrightスモークテスト
- 1366×768のスクリーンショット2枚

確定して実装した推奨仕様:

- 辺が交差するドラッグは表示上許可する
- 交差中は日本語警告を常時表示し、計算を進めない
- 閉合差ベクトルは初期版では100倍固定
- 実際の座標値、`fx`、`fy`、`f`は拡大せず別欄に表示する

Phase 4完了時に`package.json`と`package-lock.json`の差分がないことを
確認済み。新規依存は追加していない。

## 14. 再開時チェックリスト

```bash
npm run typecheck
npm test
npm run build
npm audit --audit-level=low --cache .npm-cache
env PLAYWRIGHT_BROWSERS_PATH=0 ./node_modules/.bin/playwright install --list
```

期待結果:

```text
TypeScript errors: 0
Test Files: 7 passed
Tests: 35 passed
Vite build: success
Vulnerabilities: 0
Playwright: 1.61.1
Chromium Headless Shell: 149.0.7827.55
```

ブラウザが一覧に出ない場合は、パッケージを追加せず次だけを再実行する。

```bash
env PLAYWRIGHT_BROWSERS_PATH=0 ./node_modules/.bin/playwright install --only-shell chromium
```

Phase 4の実ブラウザ確認:

```bash
npm run dev -- --host 127.0.0.1 --port 4173
env PLAYWRIGHT_BROWSERS_PATH=0 node scripts/phase4-smoke.mjs
```

期待結果:

- 交差中の計算停止
- 100倍閉合差ベクトル
- 誤答・正答理由
- 学習フロー完了
- コンソールエラー0件
- ページ例外0件
- 1366px幅のページ全体横方向はみ出しなし

Phase 4まで完了しているため、要件追加がない限り初期版の実装を
これ以上広げないこと。

## 15. 「測量の基礎」教材の追加（2026-07-29）

追加要件により、サイドバーの「測量の基礎」を実装した。

実装範囲:

- 初期表示は従来どおり「多角測量」
- 「測量の基礎」と「多角測量」の画面切替
- スマートフォン幅で使用する2教材の切替
- 「測点と位置」「距離と方向」「高さを比べる」「観測と機器」の4章
- 測点、既知点・新点、距離、水平角、高低差、座標、標高、方位角、
  度分秒、観測誤差、主要な測量機器の図解
- 測点選択、方位角と度分秒、高低差、反復観測、機器選択のミニ操作
- 4章の理解済み進捗（画面状態のみ。永続化なし）

閉合多角測量への影響を避けるため、計算層、型、サンプル観測データ、
`src/components/traverse/`は変更していない。教材切替時も
`TraverseWorkspace`をマウントしたままにし、入力途中の画面状態を保持する。
12章と13章に記載した確定仕様も変更していない。

追加ファイル:

- `src/components/basics/SurveyBasics.tsx`
- `scripts/basics-smoke.mjs`
- `doc/screenshots/basics-course-1366.png`

主な変更ファイル:

- `src/App.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/styles.css`
- `README.md`
- `scripts/phase4-smoke.mjs`

`phase4-smoke.mjs`は、`SKIP_SCREENSHOTS=1`のときだけ既存画像への撮影を
省略できる。環境変数を付けない従来の実行方法は変更していない。

検証結果:

- TypeScript型検査: 成功、エラー0件
- Test Files: 7 passed
- Tests: 35 passed
- Vite本番ビルド: 成功、41 modules transformed
- 基礎教材スモーク: 4章の主要操作、教材往復、390px幅を確認
- Phase 4スモーク: 既存全項目成功
- 1366px幅と390px幅でページ全体の横方向はみ出しなし
- コンソールエラー0件、ページ例外0件
- `package.json`と`package-lock.json`の変更なし

### 15.1 教材ナビゲーションの補助文字（確定）

教材ナビゲーション内の補助文字は`12px`とする。CSSでは次の共通変数を
使用し、値を個別に重複定義しない。

```css
--font-size-learning-nav-detail: 12px;
```

現在は「測量の基礎」の各章にある用語一覧と、多角測量の学習ステージへ
適用している。今後追加する教材でも、同じ役割のナビゲーション補助文字は
この変数を再利用する。

### 15.2 教材本文の可読性調整（確定）

「測量の基礎」の説明文は、見出しや図とのバランスを保ちながら次のように
1段階拡大した。

- 「測点と位置」の用語・解説カード本文: `12px`から`13px`
- 全4章に共通する下部補助文: `11px`から`12px`
- 他章の同じ役割の説明文: 情報量とカード幅に応じて`12px`または`13px`
- 見出し、数値、図内の主要ラベルはこの調整の対象外

今後追加する教材でも、通常の説明文は`13px`、情報量の多い複数列カードの
補助説明と章末の補助文は`12px`を基準とする。
