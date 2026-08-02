export type FieldWorkflowPhaseId = "before" | "during" | "after";

export interface FieldWorkflowPhaseDefinition {
  readonly id: FieldWorkflowPhaseId;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly checkpoint: string;
}

export type FieldWorkflowStepId =
  | "confirm-requirements"
  | "review-control-points"
  | "recon-site"
  | "plan-observation-order"
  | "inspect-equipment"
  | "set-and-protect-points"
  | "complete-precheck"
  | "observe-and-record"
  | "check-in-field"
  | "resolve-findings"
  | "save-raw-data"
  | "calculate-and-inspect"
  | "verify-results";

export interface FieldWorkflowStepDefinition {
  readonly id: FieldWorkflowStepId;
  readonly phase: FieldWorkflowPhaseId;
  readonly label: string;
  readonly summary: string;
  readonly reason: string;
}

export const fieldWorkflowPhases = [
  {
    id: "before",
    label: "現場開始前",
    title: "計画・踏査・準備",
    description:
      "求める成果と適用条件を確認し、既知点、現地条件、観測順序、機器、記録様式を準備します。",
    checkpoint:
      "天候、視通、立入条件、交通・地形などの危険を踏査し、現場ごとの安全計画へ反映します。",
  },
  {
    id: "during",
    label: "観測中",
    title: "観測・記録・現場検算",
    description:
      "点名と設定を照合しながら直接観測値と条件を原記録へ残し、その場で点検できる項目を確認します。",
    checkpoint:
      "異常を見つけたら、原因と影響範囲を確認し、採用・再計算・再測のどれへ進むか判断します。",
  },
  {
    id: "after",
    label: "終了時",
    title: "保存・計算・成果確認",
    description:
      "原記録と生データを保全し、計算と点検を経た値だけを成果として採用して引き継ぎます。",
    checkpoint:
      "点名、座標系、高さの基準、単位、検査結果、ファイルの対応を最終確認します。",
  },
] as const satisfies readonly FieldWorkflowPhaseDefinition[];

export const fieldWorkflowConcepts = [
  {
    id: "plan-recon",
    icon: "計",
    title: "作業計画と踏査",
    description:
      "目的、成果、適用する規程、方法、日程、役割を計画し、現地で天候・視通・立入条件・危険箇所を確認して計画を更新します。",
  },
  {
    id: "control-points",
    icon: "点",
    title: "既知点と測点",
    description:
      "既知点は点名、成果、座標系、高さの基準、現地の保存状態を照合します。使用する測点は設置方法と保護・復元方法を記録します。",
  },
  {
    id: "equipment-sequence",
    icon: "器",
    title: "機器点検と観測順序",
    description:
      "機器本体、付属品、電源、設定、定数、保存領域を確認し、点検観測を含む観測順序と担当を共有します。",
  },
  {
    id: "field-book",
    icon: "帳",
    title: "野帳・観測記録",
    description:
      "点名、日時、観測者、機器、設定、高さ、気象・視通、直接観測値を、その場で追跡できる原記録として残します。",
  },
  {
    id: "field-check",
    icon: "検",
    title: "現場検算と再測判断",
    description:
      "後視、反復、閉合など方法に応じた点検を現場で行い、原因と原記録を確認して採用・再計算・再測を判断します。",
  },
  {
    id: "storage-results",
    icon: "保",
    title: "データ保存と成果確認",
    description:
      "原記録を上書きせず生データと対応付けて保存し、計算・検査・承認を経た成果値と座標系などの条件を成果表へ残します。",
  },
] as const;

export const fieldWorkflowSteps = [
  {
    id: "confirm-requirements",
    phase: "before",
    label: "目的・成果・適用条件を確認して作業計画を作る",
    summary: "必要な位置・高さ・精度区分・成果形式・適用規程を確認します。",
    reason:
      "求める成果と判定条件が分からなければ、観測方法、必要な点検、記録内容を決められません。",
  },
  {
    id: "review-control-points",
    phase: "before",
    label: "資料を調べ、使用候補の既知点成果を照合する",
    summary: "点名、成果、座標系、高さの基準、点の履歴を事前に確認します。",
    reason:
      "現地で見つけた点と使用予定の成果が同じものか判断できるようにしてから踏査します。",
  },
  {
    id: "recon-site",
    phase: "before",
    label: "踏査して天候・視通・立入条件・危険箇所を確認する",
    summary: "既知点と測点候補の現況、作業動線、周辺条件を現地で確認します。",
    reason:
      "机上計画だけでは分からない障害物、交通、地形、点の損傷などを観測計画と安全計画へ反映します。",
  },
  {
    id: "plan-observation-order",
    phase: "before",
    label: "観測方法・順序・点検方法・担当を確定する",
    summary: "観測網、移動順、点検観測、連絡方法、作業分担を共有します。",
    reason:
      "必要な観測と点検を漏らさず、現場条件の変化へ同じ判断基準で対応できるようにします。",
  },
  {
    id: "inspect-equipment",
    phase: "before",
    label: "機器・付属品・設定・電源・保存準備を点検する",
    summary: "機器の点検状況、組合せ、定数、単位、電源、保存先を確認します。",
    reason:
      "現場で使用できない機器や誤設定に気付く前に測点を設置すると、手戻りや記録不足につながります。",
  },
  {
    id: "set-and-protect-points",
    phase: "before",
    label: "測点を設置・識別し、保護と復元方法を記録する",
    summary: "点名を明示し、作業中の保護、点の記、写真など必要な記録を整えます。",
    reason:
      "点の取り違えや移動を防ぎ、後から同じ点を確認・復元できる状態にします。",
  },
  {
    id: "complete-precheck",
    phase: "before",
    label: "既知点・据付・設定・記録欄を観測直前に照合する",
    summary: "点名、方向、高さ、定数、単位、ジョブ名などを観測前に確認します。",
    reason:
      "事前資料と現在の機器・現場状態が一致していることを、最初の観測値を得る前に確かめます。",
  },
  {
    id: "observe-and-record",
    phase: "during",
    label: "決めた順序で観測し、直接観測値と条件を原記録へ残す",
    summary: "数値だけでなく点名、時刻、機器、設定、気象・視通も対応付けます。",
    reason:
      "後から計算を再現し、異常の原因と影響範囲を追跡できる原記録を作ります。",
  },
  {
    id: "check-in-field",
    phase: "during",
    label: "後視・反復・閉合などを現場で検算する",
    summary: "観測方法に応じた点検値を確認し、原記録へ結果を残します。",
    reason:
      "現場を離れる前なら、据付や視通など同じ条件を確認して必要な再測を行えます。",
  },
  {
    id: "resolve-findings",
    phase: "during",
    label: "異常の原因と影響範囲を確認し、採用・再計算・再測を判断する",
    summary: "観測条件の異常か、転記・計算の誤りか、問題なしなのかを分けます。",
    reason:
      "正しい原観測が残る計算誤りと、観測自体をやり直す必要がある異常では対応が異なります。",
  },
  {
    id: "save-raw-data",
    phase: "after",
    label: "原記録と生データを対応付けて保存・バックアップする",
    summary: "ジョブ名、ファイル名、版、保存先を照合し、原データを保全します。",
    reason:
      "加工後の値だけでなく、再計算と監査に必要な元の情報を失わないようにします。",
  },
  {
    id: "calculate-and-inspect",
    phase: "after",
    label: "原記録から計算し、独立した点検で計算値を確認する",
    summary: "補正、座標・標高計算、閉合、転記を適用条件に従って点検します。",
    reason:
      "計算値は途中結果であり、式、入力、単位、丸め、検査結果を確認してから採用します。",
  },
  {
    id: "verify-results",
    phase: "after",
    label: "成果表と付帯情報を照合し、成果値として確定・引継ぎする",
    summary: "採用値、点名、座標系、高さの基準、単位、検査記録を最終確認します。",
    reason:
      "数値だけを切り離さず、どの基準・条件・検査に基づく成果かを利用者へ伝えます。",
  },
] as const satisfies readonly FieldWorkflowStepDefinition[];

export const initialFieldWorkflowStepOrder: readonly FieldWorkflowStepId[] = [
  "confirm-requirements",
  "review-control-points",
  "recon-site",
  "plan-observation-order",
  "set-and-protect-points",
  "inspect-equipment",
  "complete-precheck",
  "observe-and-record",
  "check-in-field",
  "resolve-findings",
  "save-raw-data",
  "calculate-and-inspect",
  "verify-results",
];

export function moveFieldWorkflowStep(
  order: readonly FieldWorkflowStepId[],
  stepId: FieldWorkflowStepId,
  direction: "up" | "down",
): readonly FieldWorkflowStepId[] {
  const currentIndex = order.indexOf(stepId);

  if (currentIndex === -1) {
    throw new Error("移動する現場作業手順が現在の並びにありません。");
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= order.length) {
    return order;
  }

  const nextOrder = [...order];
  [nextOrder[currentIndex], nextOrder[targetIndex]] = [
    nextOrder[targetIndex]!,
    nextOrder[currentIndex]!,
  ];
  return nextOrder;
}

export function evaluateFieldWorkflowOrder(
  order: readonly FieldWorkflowStepId[],
): {
  readonly isCorrect: boolean;
  readonly firstMismatchIndex: number | null;
  readonly message: string;
} {
  const correctOrder = fieldWorkflowSteps.map((step) => step.id);
  const hasSameSteps =
    order.length === correctOrder.length &&
    new Set(order).size === correctOrder.length &&
    correctOrder.every((stepId) => order.includes(stepId));

  if (!hasSameSteps) {
    throw new Error("現場作業手順は定義済みの13項目を重複なく指定してください。");
  }

  const firstMismatchIndex = order.findIndex(
    (stepId, index) => stepId !== correctOrder[index],
  );

  if (firstMismatchIndex === -1) {
    return {
      isCorrect: true,
      firstMismatchIndex: null,
      message:
        "教材例の基本順序になりました。実際の現場では踏査や点検結果を受け、前の段階へ戻って計画を更新することもあります。",
    };
  }

  const expectedStep = fieldWorkflowSteps[firstMismatchIndex]!;
  const actualStep = fieldWorkflowSteps.find(
    (step) => step.id === order[firstMismatchIndex],
  )!;

  return {
    isCorrect: false,
    firstMismatchIndex,
    message: `${firstMismatchIndex + 1}番目は「${expectedStep.label}」です。「${actualStep.label}」より先に置く理由：${expectedStep.reason}`,
  };
}

export type PreObservationChecklistGroupId =
  | "plan"
  | "site"
  | "points"
  | "equipment"
  | "records";

export interface PreObservationChecklistGroupDefinition {
  readonly id: PreObservationChecklistGroupId;
  readonly label: string;
}

export const preObservationChecklistGroups = [
  { id: "plan", label: "計画・連絡" },
  { id: "site", label: "現地・安全" },
  { id: "points", label: "既知点・測点" },
  { id: "equipment", label: "機器・設定" },
  { id: "records", label: "記録・保存" },
] as const satisfies readonly PreObservationChecklistGroupDefinition[];

export const preObservationChecklistItems = [
  {
    id: "requirements-confirmed",
    groupId: "plan",
    label: "目的・成果・適用規程・判定方法を確認した",
    detail: "必要な観測、点検、成果形式を作業計画と照合します。",
  },
  {
    id: "roles-contacts-confirmed",
    groupId: "plan",
    label: "観測順序・担当・連絡方法・緊急時対応を共有した",
    detail: "観測者、記録者、誘導・安全確認の役割を現場条件に合わせます。",
  },
  {
    id: "weather-visibility-confirmed",
    groupId: "site",
    label: "天候・視通・周辺環境を確認した",
    detail: "観測品質と作業継続判断へ影響する現在の条件を記録します。",
  },
  {
    id: "access-hazards-confirmed",
    groupId: "site",
    label: "立入条件・交通・地形などの危険と対策を確認した",
    detail: "必要な許可、監視、誘導、保護具、作業区域を現場ごとに決めます。",
  },
  {
    id: "control-results-confirmed",
    groupId: "points",
    label: "既知点の点名・成果・座標系・高さの基準を照合した",
    detail: "資料の値と現地の点が同じであることを履歴・点の記も含めて確認します。",
  },
  {
    id: "control-condition-confirmed",
    groupId: "points",
    label: "既知点の保存状態と使用可否を確認した",
    detail: "損傷や移動の疑いがあれば、勝手に使用せず確認手順へ進みます。",
  },
  {
    id: "point-protection-confirmed",
    groupId: "points",
    label: "測点の識別・設置・保護・復元方法を確認した",
    detail: "点名、位置、標識、写真などを対応付けます。",
  },
  {
    id: "instrument-inspection-confirmed",
    groupId: "equipment",
    label: "機器の点検状態・組合せ・付属品を確認した",
    detail: "点検記録と使用する機器・プリズム・標尺などの組合せを照合します。",
  },
  {
    id: "power-storage-confirmed",
    groupId: "equipment",
    label: "電源・記録媒体・保存領域を確認した",
    detail: "観測途中で記録できなくならないよう予備と保存方法を準備します。",
  },
  {
    id: "settings-confirmed",
    groupId: "equipment",
    label: "単位・観測モード・補正・定数・日時設定を確認した",
    detail: "使用方法と成果条件に対応する設定を機器画面と記録欄で照合します。",
  },
  {
    id: "heights-reference-confirmed",
    groupId: "equipment",
    label: "器械高・プリズム高などの測定基準位置を確認した",
    detail: "どこからどこまで、どの単位で測るかを担当者間で合わせます。",
  },
  {
    id: "inspection-plan-confirmed",
    groupId: "records",
    label: "反復・後視・閉合など現場検算の方法を確認した",
    detail: "適用条件に合う点検と、異常時に確認する範囲を事前に決めます。",
  },
  {
    id: "field-book-ready",
    groupId: "records",
    label: "野帳・観測手簿の必須欄を準備した",
    detail: "点名、日時、観測者、機器、設定、条件、原観測値を残せるようにします。",
  },
  {
    id: "data-naming-backup-ready",
    groupId: "records",
    label: "ジョブ名・ファイル名・保存先・バックアップ方法を確認した",
    detail: "機器データと野帳を同じ作業・点へ追跡できる命名と保存方法にします。",
  },
] as const;

export type PreObservationChecklistItemId =
  (typeof preObservationChecklistItems)[number]["id"];

export function summarizePreObservationChecklist(
  checkedItemIds: readonly PreObservationChecklistItemId[],
): {
  readonly totalCount: number;
  readonly checkedCount: number;
  readonly remainingCount: number;
  readonly remainingItemIds: readonly PreObservationChecklistItemId[];
  readonly completeGroupIds: readonly PreObservationChecklistGroupId[];
  readonly isComplete: boolean;
} {
  const knownIds = new Set(
    preObservationChecklistItems.map((item) => item.id),
  );

  for (const checkedId of checkedItemIds) {
    if (!knownIds.has(checkedId)) {
      throw new Error("観測前チェックリストに未定義の項目があります。");
    }
  }

  const uniqueCheckedIds = new Set(checkedItemIds);
  const remainingItemIds = preObservationChecklistItems
    .filter((item) => !uniqueCheckedIds.has(item.id))
    .map((item) => item.id);
  const completeGroupIds = preObservationChecklistGroups
    .filter((group) =>
      preObservationChecklistItems
        .filter((item) => item.groupId === group.id)
        .every((item) => uniqueCheckedIds.has(item.id)),
    )
    .map((group) => group.id);

  return {
    totalCount: preObservationChecklistItems.length,
    checkedCount: uniqueCheckedIds.size,
    remainingCount: remainingItemIds.length,
    remainingItemIds,
    completeGroupIds,
    isComplete: remainingItemIds.length === 0,
  };
}

export type ObservationRecordFieldId =
  | "project-name"
  | "date-time"
  | "observer"
  | "weather"
  | "instrument-id"
  | "station-point"
  | "coordinate-reference"
  | "backsight-point"
  | "target-point"
  | "instrument-height"
  | "target-height"
  | "prism-constant"
  | "horizontal-angle"
  | "vertical-angle"
  | "slope-distance"
  | "inspection-result"
  | "raw-data-file";

export interface ObservationRecordFieldDefinition {
  readonly id: ObservationRecordFieldId;
  readonly label: string;
  readonly group: string;
  readonly risk: string;
  readonly action: string;
}

export const observationRecordFields = [
  {
    id: "project-name",
    label: "作業名・ジョブ名",
    group: "基本情報",
    risk: "どの作業の観測か追跡できません。",
    action: "作業計画と機器内ジョブ名を照合します。",
  },
  {
    id: "date-time",
    label: "観測日時",
    group: "基本情報",
    risk: "観測順序や条件変化との対応を追えません。",
    action: "機器日時も確認し、観測した時点を記録します。",
  },
  {
    id: "observer",
    label: "観測者・記録者",
    group: "基本情報",
    risk: "確認事項や記録の経緯を担当者へ照会できません。",
    action: "役割と担当者を記録します。",
  },
  {
    id: "weather",
    label: "天候・視通・現場条件",
    group: "基本情報",
    risk: "観測品質や異常の原因となる条件を後から検討できません。",
    action: "観測時の実際の条件を原記録へ残します。",
  },
  {
    id: "instrument-id",
    label: "機器名・識別番号",
    group: "機器・設定",
    risk: "機器仕様、点検履歴、データファイルと対応付けできません。",
    action: "使用した機器を一意に追跡できる情報を記録します。",
  },
  {
    id: "station-point",
    label: "器械点名",
    group: "点名・基準",
    risk: "どの点から観測した値か確定できません。",
    action: "現地標識と作業計画の点名を照合します。",
  },
  {
    id: "coordinate-reference",
    label: "座標系・系番号・高さの基準",
    group: "点名・基準",
    risk: "数値を正しい位置・高さの基準へ結び付けられません。",
    action: "既知点成果と作業条件に記載された基準を記録します。",
  },
  {
    id: "backsight-point",
    label: "後視点名・方向設定",
    group: "点名・基準",
    risk: "観測方向の基準が正しいか再現・点検できません。",
    action: "後視点名、成果、設定した方向を照合して記録します。",
  },
  {
    id: "target-point",
    label: "前視点名",
    group: "点名・基準",
    risk: "観測値を求める点へ正しく割り当てられません。",
    action: "プリズム側との点名確認を含めて記録します。",
  },
  {
    id: "instrument-height",
    label: "器械高",
    group: "機器・設定",
    risk: "高さ計算を再現できず、誤入力の影響を点検できません。",
    action: "測定基準位置と単位を確認して現地測定値を記録します。",
  },
  {
    id: "target-height",
    label: "プリズム高",
    group: "機器・設定",
    risk: "測点間高低差を正しく再計算できません。",
    action: "プリズム中心までの高さと単位を記録します。",
  },
  {
    id: "prism-constant",
    label: "プリズム定数",
    group: "機器・設定",
    risk: "使用した組合せと距離補正設定を確認できません。",
    action: "プリズムと機器設定を照合して記録します。",
  },
  {
    id: "horizontal-angle",
    label: "水平角の原観測値",
    group: "直接観測値",
    risk: "方向計算の元になる値がありません。",
    action: "表示・保存された直接観測値を改変せず残します。",
  },
  {
    id: "vertical-angle",
    label: "鉛直角の原観測値",
    group: "直接観測値",
    risk: "水平距離や高低差への変換を再現できません。",
    action: "角度の基準方向とともに原観測値を残します。",
  },
  {
    id: "slope-distance",
    label: "斜距離の原観測値",
    group: "直接観測値",
    risk: "水平距離や座標増分の計算元がありません。",
    action: "単位と観測モードを確認して原観測値を残します。",
  },
  {
    id: "inspection-result",
    label: "現場検算・点検結果",
    group: "点検・保存",
    risk: "どの確認を経て観測を採用したか判断できません。",
    action: "後視、反復、閉合など実施した点検と判断を記録します。",
  },
  {
    id: "raw-data-file",
    label: "生データのファイル名・保存先",
    group: "点検・保存",
    risk: "野帳と機器データを対応付けて再計算できません。",
    action: "ジョブ名、ファイル名、保存先、版を照合します。",
  },
] as const satisfies readonly ObservationRecordFieldDefinition[];

export type ObservationRecord = Readonly<
  Record<ObservationRecordFieldId, string | null>
>;

const completeObservationRecord = {
  "project-name": "教材用 基準点確認 / JOB-FIELD-01",
  "date-time": "現場で確認した観測日時",
  observer: "観測者A・記録者B",
  weather: "天候・視通・周辺条件を記録",
  "instrument-id": "TS-01・識別番号を記録",
  "station-point": "T1",
  "coordinate-reference": "使用する座標系・系番号・高さ基準を記録",
  "backsight-point": "K1・設定方向を記録",
  "target-point": "P1",
  "instrument-height": "現地測定値・基準位置・単位を記録",
  "target-height": "現地測定値・基準位置・単位を記録",
  "prism-constant": "使用プリズムと機器設定を照合",
  "horizontal-angle": "水平角の原観測値",
  "vertical-angle": "鉛直角の原観測値",
  "slope-distance": "斜距離の原観測値",
  "inspection-result": "後視・反復・現場検算の結果を記録",
  "raw-data-file": "機器ジョブ名・ファイル名・保存先を記録",
} as const satisfies ObservationRecord;

export const observationRecordSamples = [
  {
    id: "height-settings-missing",
    label: "高さ・定数の記録不足",
    description:
      "点名と直接観測値はありますが、高さ計算と距離設定を再現する情報に不足があります。",
    record: {
      ...completeObservationRecord,
      "instrument-height": null,
      "target-height": null,
      "prism-constant": null,
    },
  },
  {
    id: "point-reference-missing",
    label: "点名・基準の記録不足",
    description:
      "数値は残っていますが、どの器械点と後視方向・座標基準を使ったか追跡できません。",
    record: {
      ...completeObservationRecord,
      "station-point": null,
      "coordinate-reference": null,
      "backsight-point": null,
    },
  },
  {
    id: "inspection-storage-missing",
    label: "条件・点検・保存の記録不足",
    description:
      "観測値はありますが、現場条件、採用根拠、生データとの対応が不足しています。",
    record: {
      ...completeObservationRecord,
      weather: null,
      "inspection-result": null,
      "raw-data-file": null,
    },
  },
  {
    id: "complete-reference",
    label: "比較用：必須欄に不足なし",
    description:
      "この固定TS教材例で確認する欄に空欄はありません。内容の正しさは原資料と別途照合します。",
    record: completeObservationRecord,
  },
] as const;

export type ObservationRecordSampleId =
  (typeof observationRecordSamples)[number]["id"];

export interface ObservationRecordIssue {
  readonly fieldId: ObservationRecordFieldId;
  readonly label: string;
  readonly risk: string;
  readonly action: string;
}

const recordValueIsMissing = (value: string | null): boolean =>
  value === null || value.trim() === "";

export function findObservationRecordIssues(
  record: ObservationRecord,
): readonly ObservationRecordIssue[] {
  return observationRecordFields
    .filter((field) => recordValueIsMissing(record[field.id]))
    .map((field) => ({
      fieldId: field.id,
      label: field.label,
      risk: field.risk,
      action: field.action,
    }));
}

export function evaluateObservationRecordIssueSelection(
  record: ObservationRecord,
  selectedFieldIds: readonly ObservationRecordFieldId[],
): {
  readonly isCorrect: boolean;
  readonly issueCount: number;
  readonly missedFieldIds: readonly ObservationRecordFieldId[];
  readonly extraFieldIds: readonly ObservationRecordFieldId[];
} {
  const knownIds = new Set(observationRecordFields.map((field) => field.id));
  for (const selectedFieldId of selectedFieldIds) {
    if (!knownIds.has(selectedFieldId)) {
      throw new Error("観測記録に未定義の項目が選択されています。");
    }
  }

  const issueFieldIds = findObservationRecordIssues(record).map(
    (issue) => issue.fieldId,
  );
  const issueSet = new Set(issueFieldIds);
  const selectedSet = new Set(selectedFieldIds);
  const missedFieldIds = issueFieldIds.filter(
    (fieldId) => !selectedSet.has(fieldId),
  );
  const extraFieldIds = [...selectedSet].filter(
    (fieldId) => !issueSet.has(fieldId),
  );

  return {
    isCorrect: missedFieldIds.length === 0 && extraFieldIds.length === 0,
    issueCount: issueFieldIds.length,
    missedFieldIds,
    extraFieldIds,
  };
}

export type FieldDecisionId = "adopt" | "recalculate" | "remeasure";

export interface FieldDecisionOptionDefinition {
  readonly id: FieldDecisionId;
  readonly label: string;
  readonly description: string;
}

export const fieldDecisionOptions = [
  {
    id: "adopt",
    label: "採用する",
    description: "原観測、計算、点検、記録に未解決の異常がない場合の判断です。",
  },
  {
    id: "recalculate",
    label: "再計算する",
    description: "正しい原記録が残り、転記・設定入力・計算だけを直せる場合の判断です。",
  },
  {
    id: "remeasure",
    label: "再測する",
    description: "観測条件や点の同一性に問題があり、原観測を信頼できない場合の判断です。",
  },
] as const satisfies readonly FieldDecisionOptionDefinition[];

export interface FieldDecisionScenarioDefinition {
  readonly id: string;
  readonly label: string;
  readonly finding: string;
  readonly availableEvidence: string;
  readonly recommendedDecisionId: FieldDecisionId;
  readonly reason: string;
  readonly nextAction: string;
}

export const fieldDecisionScenarios = [
  {
    id: "checks-complete",
    label: "原記録・計算・点検に未解決の異常なし",
    finding:
      "点名、設定、原観測、計算過程、適用条件に基づく点検結果を照合し、未解決の異常は見つかりませんでした。",
    availableEvidence: "原記録、生データ、計算簿、点検記録が対応しています。",
    recommendedDecisionId: "adopt",
    reason:
      "必要な追跡情報と点検結果を確認でき、現在確認できる範囲に未解決事項がないためです。",
    nextAction: "採用した値と条件を成果表へ記載し、承認・引継ぎへ進みます。",
  },
  {
    id: "transcription-error",
    label: "原記録は有効だが転記・計算に誤り",
    finding:
      "観測手簿と機器の生データは一致していますが、計算簿への転記または計算式に誤りが見つかりました。",
    availableEvidence: "正しい原観測値と条件を原記録から確認できます。",
    recommendedDecisionId: "recalculate",
    reason:
      "観測自体をやり直す理由はなく、正しい原記録から計算過程を修正して再現できるためです。",
    nextAction: "誤りを訂正し、影響する計算と成果を再計算・再点検します。",
  },
  {
    id: "height-entry-error",
    label: "高さの実測記録はあるが入力値が違う",
    finding:
      "現地で測った器械高・プリズム高の原記録と、計算へ入力した値が一致しません。",
    availableEvidence: "測定位置と単位を含む現地の実測記録を確認できます。",
    recommendedDecisionId: "recalculate",
    reason:
      "正しい実測記録が残り、入力誤りの影響範囲を特定して計算し直せるためです。",
    nextAction: "入力値を訂正し、高さに関係する計算と点検をやり直します。",
  },
  {
    id: "wrong-backsight",
    label: "後視点の取り違えを発見",
    finding:
      "観測に使用した後視点が作業計画と異なり、正しい基準方向を設定できていませんでした。",
    availableEvidence: "既存の原観測は誤った方向基準で取得されています。",
    recommendedDecisionId: "remeasure",
    reason:
      "方向付けの前提が観測時点で成立しておらず、計算だけでは正しい観測へ置き換えられないためです。",
    nextAction: "点名と成果を照合し、正しく方向付けして影響範囲を再測します。",
  },
  {
    id: "setup-shifted",
    label: "観測後の点検で据付状態の変化を発見",
    finding:
      "終了時の点検で求心・整準・後視方向のいずれかが維持されていないことが分かりました。",
    availableEvidence: "どの観測時点から影響したか原記録だけでは確定できません。",
    recommendedDecisionId: "remeasure",
    reason:
      "観測条件が成立していた範囲を確定できず、影響する原観測をそのまま採用できないためです。",
    nextAction: "据付と方向付けをやり直し、影響範囲を確認して再測します。",
  },
  {
    id: "essential-record-missing",
    label: "必要な原記録がなく観測条件を復元できない",
    finding:
      "点名、設定、高さなど成果へ影響する情報が欠け、信頼できる別記録からも復元できません。",
    availableEvidence: "数値だけはありますが、観測条件と点の対応を確認できません。",
    recommendedDecisionId: "remeasure",
    reason:
      "不足情報を推測で補って再計算または採用することはできないためです。",
    nextAction: "必要な記録欄を整え、点と条件を照合して再測します。",
  },
] as const satisfies readonly FieldDecisionScenarioDefinition[];

export function evaluateFieldDecision(
  scenarioId: string,
  selectedDecisionId: FieldDecisionId,
): {
  readonly isRecommended: boolean;
  readonly recommendedDecisionId: FieldDecisionId;
  readonly reason: string;
  readonly nextAction: string;
} {
  const scenario = fieldDecisionScenarios.find(
    (candidate) => candidate.id === scenarioId,
  );
  const decisionExists = fieldDecisionOptions.some(
    (option) => option.id === selectedDecisionId,
  );

  if (!scenario) {
    throw new Error("未定義の現場判断シナリオです。");
  }

  if (!decisionExists) {
    throw new Error("未定義の現場判断です。");
  }

  return {
    isRecommended: selectedDecisionId === scenario.recommendedDecisionId,
    recommendedDecisionId: scenario.recommendedDecisionId,
    reason: scenario.reason,
    nextAction: scenario.nextAction,
  };
}

export type FieldValueKindId = "observed" | "calculated" | "result";

export interface FieldValueKindDefinition {
  readonly id: FieldValueKindId;
  readonly label: string;
  readonly shortLabel: string;
  readonly definition: string;
  readonly examples: readonly string[];
  readonly handling: string;
}

export const fieldValueKinds = [
  {
    id: "observed",
    label: "観測値",
    shortLabel: "機器・観測者が直接得た値",
    definition:
      "現場で機器や観測者が直接読み取り、原記録へ残す値です。計算の都合で上書きせず、条件と対応付けて保全します。",
    examples: ["水平角・鉛直角", "斜距離", "後視・前視の標尺読定値"],
    handling: "点名、日時、機器、設定、高さ、気象・視通と一緒に原記録へ残します。",
  },
  {
    id: "calculated",
    label: "計算値",
    shortLabel: "観測値と条件から求めた途中・点検値",
    definition:
      "観測値へ補正や式を適用して求める値です。水平距離、座標増分、閉合差、補正後座標などを含みます。",
    examples: ["水平距離・高低差", "座標増分・閉合差", "補正量・補正後座標"],
    handling: "使用した原観測、定数、式、単位、丸め、版を追跡できるようにします。",
  },
  {
    id: "result",
    label: "成果値",
    shortLabel: "点検・採用を経て成果表へ載せる値",
    definition:
      "計算値を点検し、適用条件に照らして採用した最終的な位置・高さなどの値です。計算値が自動的に成果値になるわけではありません。",
    examples: ["採用した点の座標", "採用した標高", "点名と基準を伴う成果表の値"],
    handling: "点名、座標系、系番号、高さの基準、単位、検査・承認情報と一緒に示します。",
  },
] as const satisfies readonly FieldValueKindDefinition[];

export type RecordToResultStageId =
  | "field-book"
  | "calculation-book"
  | "inspection"
  | "result-table"
  | "archive";

export interface RecordToResultStageDefinition {
  readonly id: RecordToResultStageId;
  readonly number: string;
  readonly title: string;
  readonly valueKindIds: readonly FieldValueKindId[];
  readonly input: string;
  readonly action: string;
  readonly output: string;
  readonly checkpoint: string;
}

export const recordToResultStages = [
  {
    id: "field-book",
    number: "1",
    title: "観測手簿・野帳",
    valueKindIds: ["observed"],
    input: "点名、現場条件、機器設定、直接観測値、生データ",
    action: "観測時の事実を改変せず、値と条件を対応付けて記録する",
    output: "追跡できる原記録",
    checkpoint: "空欄、点名、単位、高さ、定数、ファイル名を現場で照合します。",
  },
  {
    id: "calculation-book",
    number: "2",
    title: "計算簿",
    valueKindIds: ["observed", "calculated"],
    input: "原観測値、既知点成果、補正条件、計算規約",
    action: "補正、距離・角度・座標・標高などを丸め前の値で計算する",
    output: "計算過程と計算値",
    checkpoint: "入力、式、単位、符号、転記、丸め、版を確認します。",
  },
  {
    id: "inspection",
    number: "3",
    title: "検算・検査",
    valueKindIds: ["observed", "calculated"],
    input: "原記録、計算簿、閉合・反復・独立点検などの結果",
    action: "適用条件に従い、異常、整合性、再現性、影響範囲を確認する",
    output: "採用・再計算・再測の判断と記録",
    checkpoint: "小さな閉合差など一つの指標だけで全体を正しいと判断しません。",
  },
  {
    id: "result-table",
    number: "4",
    title: "成果表",
    valueKindIds: ["result"],
    input: "点検済みの計算値、点名、座標系、高さ基準、検査情報",
    action: "採用した値と、その値を正しく使うための付帯情報を整理する",
    output: "利用者へ引き継ぐ成果値",
    checkpoint: "原記録や未点検の計算値を、そのまま成果値として転記しません。",
  },
  {
    id: "archive",
    number: "5",
    title: "保存・引継ぎ",
    valueKindIds: ["observed", "calculated", "result"],
    input: "生データ、原記録、計算簿、検査記録、成果表",
    action: "相互の対応、版、保存先、権限を確認して組織の規則に従い保全する",
    output: "再計算・点検・利用ができる一式",
    checkpoint: "原データを成果値で上書きせず、必要な情報を対応付けて保存します。",
  },
] as const satisfies readonly RecordToResultStageDefinition[];
