# 測量理解ラボ 引継ぎ資料

最終更新日: 2026-07-27  
作業ディレクトリ: `/home/newono/ai_proj/app_simulation/survey-learning-lab`

## 1. 現在の状態

「測量理解ラボ：閉合多角測量シミュレーター」のPhase 2まで完了している。

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
- Vite / Reactアプリのエントリーポイント
- 上部ヘッダー、左サイドバー、中央画面、右学習パネル
- SVGによる静的な閉合多角形表示
- 表示用サンプルデータ
- 本番ビルドとローカルHTTP起動確認

未着手:

- 測点ドラッグ
- 観測値編集
- 観測手簿
- 計算ステップの進行・解説
- 計算結果表
- 閉合差の可視化
- 確認問題
- README

Phase 3以降の操作・計算UIには進んでいない。Phase 2画面に表示している
計算ステップと操作ボタンは、学習の流れを示す静的表示である。

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
- ESM
- TypeScript strictモード
- React JSX runtime
- SVGとCSSによるUI
- UI非依存の純粋関数による計算層

UIライブラリ、アイコンライブラリ、外部フォントは追加していない。
アイコンと測量図はインラインSVGで実装している。

TypeScript 7.0.2も正規パッケージだったが、複数のプラットフォーム別バイナリ依存を持つため、Phase 1では依存の少ない安定版6.0.3を固定採用した。

## 6. npm依存関係の安全確認

直接依存は次の8つだけで、すべて完全固定している。

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
    "typescript": "6.0.3",
    "vite": "8.1.5",
    "vitest": "4.1.10"
  }
}
```

確認結果:

- npm registry: `https://registry.npmjs.org/`
- lockfileVersion: 3
- lockfile上のパッケージ数: 83
- Linux上に展開されたパッケージ数: 54
- Git依存: なし
- ローカルファイル依存: なし
- 任意URL依存: なし
- 全配布物にintegrityあり
- `npm audit`: 脆弱性0件
- npm registry署名: 54件すべて検証成功
- attestation: 26件検証成功

実行したインストール:

```bash
npm ci --ignore-scripts --no-audit --no-fund --cache .npm-cache
```

install scriptはすべて無効化している。

lockfile上で `hasInstallScript` が付いていたのは `fsevents@2.3.3` だけだった。これはViteのmacOS専用任意依存で、`os: ["darwin"]` のためLinuxには展開されていない。

展開後のパッケージメタデータでは、`csstype@3.2.3`の`prepublish`、
`lightningcss@1.33.0`と`tinyexec@1.2.4`の`prepare`も確認した。
これらも`--ignore-scripts`により実行していない。

npm 11.18.0への更新通知が表示されたが、更新していない。

## 7. 作成したファイル

```text
.
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── doc/
│   └── HANDOFF.md
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
    │   └── coordinate.ts
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   └── Sidebar.tsx
    │   └── traverse/
    │       ├── CalculationSteps.tsx
    │       ├── TraverseSimulator.tsx
    │       └── TraverseSvg.tsx
    ├── data/
    │   └── traverseSample.ts
    ├── tests/
    │   ├── adjustment.test.ts
    │   ├── angle.test.ts
    │   ├── azimuth.test.ts
    │   └── coordinate.test.ts
    ├── types/
    │   └── traverse.ts
    └── utils/
        └── formatAngle.ts
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

Phase 2ではイベントハンドラを追加していない。ドラッグ、入力、
計算進行、リセットは表示上も無効で、Phase 3以降の対象である。

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

最後の規約は要件で対象辺が明記されていないため、確定仕様ではなく現在の関数上の前提である。サンプルデータ作成前に確認が必要。

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

既定の「ほぼ閉合」判定値は `1e-10`。閉合差がこの値以下なら `closureRatio` を `null` とし、ゼロ除算を避ける。UIではPhase 3以降に「完全閉合に近い」と表示する予定。

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

画面向けの日本語エラーメッセージ変換は未実装。Phase 3で計算例外を利用者向け表示へ変換する。

## 11. テスト結果

実行コマンド:

```bash
npm run typecheck -- --pretty false
npm test -- --reporter=verbose
npm run build
```

結果:

- TypeScript型検査: 成功、エラー0件
- Test Files: 4 passed
- Tests: 19 passed
- 失敗: 0
- Vitest実行時間: 約372ms
- Vite本番ビルド: 成功、24 modules transformed
- JS成果物: 約210.70 kB、gzip約66.78 kB
- CSS成果物: 約15.27 kB、gzip約4.01 kB
- 開発サーバー: `127.0.0.1:4173`で起動成功
- ローカルHTTP確認: 200 OK

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

## 12. 残っている疑問・懸念

### 12.1 参考画像の内角

参考画像に表示された6つの角度を合計すると640度になる。

六角形の理論内角和は720度なので、80度の差があり、「小さな観測誤差」という要件とは一致しない。画像の数値は見た目の参考値と判断し、Phase 2のサンプル値には使用していない。

Phase 2では、幾何的に整合する別の六角形へ合計`+12″`の観測角誤差と
センチメートル級の距離差を加えた表示用データを作成した。

### 12.2 B点の扱い

操作仕様ではAとBを固定点としている。一方、座標計算仕様は「既知点Aから補正後成分を加算する閉合多角測量」になっている。

未確定:

- Bも既知座標を持つ拘束点なのか
- BはSVG上で移動できないだけの点なのか
- B座標との既知点閉合差を別途考慮するのか

Phase 2ではBを`isFixed: true`として描画するだけに留め、既知座標拘束としては
扱っていない。Phase 3の計算・編集実装前に確認した方がよい。

### 12.3 初期方位角の対象辺

現在は巡回順の最初の辺を対象としているが、要件に具体的な辺名は書かれていない。

想定:

```text
A → P1 の方位角
```

Phase 2の表示用サンプルには初期方位角を含めていない。
Phase 3の計算状態へ組み込む前に確認する。

### 12.4 秒残差の配分順

均等補正で割り切れない秒残差を、現在は観測順の先頭から配分している。要件は「適切に配分」とだけ指定している。

別の規則が必要なら、次の候補から仕様を決める。

- 観測順
- 絶対値の大きい角から
- 点名順
- UI上で配分先を表示

### 12.5 ブラウザ画像の最終確認

ローカルのFirefoxコマンドはsnap導入案内用スタブで、ブラウザ実体はなかった。
追加パッケージは導入せず、画面キャプチャは実施していない。
型検査、本番ビルド、開発サーバー起動、HTTP 200応答までは確認済み。

## 13. Phase 3で実施する内容

要件上のPhase 3:

- P1～P4の測点ドラッグ
- 観測値編集
- 計算ステップの段階進行と学習解説
- 観測手簿と結果表

開始時の推奨手順:

1. B点の座標拘束と初期方位角の対象辺を確認する。
2. `TraverseObservation`を使う画面状態と表示用データの責務を整理する。
3. 測量座標とSVG座標の相互変換を切り出し、変換失敗を処理する。
4. P1～P4だけをドラッグ可能にし、AとBを固定する。
5. ドラッグ範囲をSVG内へ制限し、選択状態を色以外でも示す。
6. 観測内角、距離、初期方位角の編集と日本語エラー表示を実装する。
7. 観測手簿を実装する。
8. 「次へ」による計算進行、式、代入値、理由、よくある間違いを表示する。
9. 計算結果表と補正後座標を表示する。
10. UI状態と変換処理のテストを追加し、型検査・既存テスト・ビルドを確認する。

Phase 3では実施しない:

- 閉合差ベクトル
- 確認問題
- 最終UI調整
- README更新

これらはPhase 4の対象。

## 14. 再開時チェックリスト

```bash
npm run typecheck
npm test
npm run build
npm audit --audit-level=low --cache .npm-cache
```

期待結果:

```text
TypeScript errors: 0
Test Files: 4 passed
Tests: 19 passed
Vite build: success
Vulnerabilities: 0
```

確認後、未確定仕様を確認してから要件MarkdownのPhase 3だけに進むこと。
