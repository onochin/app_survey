export type SurveyPurposeId =
  | "create-control-point"
  | "survey-current-conditions"
  | "determine-elevation";

export interface SurveyPurpose {
  readonly id: SurveyPurposeId;
  readonly label: string;
  readonly surveyType: string;
  readonly observationTargets: readonly string[];
  readonly expectedResults: readonly string[];
  readonly summary: string;
}

export const surveyPurposes = [
  {
    id: "create-control-point",
    label: "基準点を作る",
    surveyType: "基準点測量",
    observationTargets: [
      "利用する既知点と新点の位置関係",
      "新点どうしの距離・方向・高さ",
    ],
    expectedResults: [
      "新しい基準点の座標・標高",
      "点の記、観測記録、点検結果",
    ],
    summary:
      "後の測量で位置や高さのよりどころにできる点を、必要な精度で設けます。",
  },
  {
    id: "survey-current-conditions",
    label: "現況を測る",
    surveyType: "地形測量",
    observationTargets: [
      "地物の位置、形状、境界となる点",
      "地盤の起伏や高さが変わる点",
    ],
    expectedResults: [
      "現況平面図や地形図のデータ",
      "地物・地形を表す点、線、高さ",
    ],
    summary:
      "土地の起伏や建物・道路など、現地にあるものの位置と形を記録します。",
  },
  {
    id: "determine-elevation",
    label: "高さを求める",
    surveyType: "水準測量",
    observationTargets: [
      "標高が分かっている点と求めたい点",
      "2点間の高低差",
    ],
    expectedResults: [
      "新点の標高や点間の高低差",
      "観測記録と高さの点検結果",
    ],
    summary:
      "既知の高さを出発点にして、高低差から新しい点の標高を求めます。",
  },
] as const satisfies readonly SurveyPurpose[];

export type PointComparisonId = "known" | "new";

export interface PointComparison {
  readonly id: PointComparisonId;
  readonly name: string;
  readonly kind: string;
  readonly summary: string;
  readonly currentInformation: string;
  readonly role: string;
  readonly fieldCheck: string;
  readonly afterSurvey: string;
  readonly coordinateReadout: {
    readonly x: string;
    readonly y: string;
    readonly elevation: string;
  };
}

export const pointComparisons: Record<
  PointComparisonId,
  PointComparison
> = {
  known: {
    id: "known",
    name: "A",
    kind: "既知点",
    summary:
      "この測量で必要な位置や高さが、観測を始める前から分かっている点です。",
    currentInformation:
      "採用する座標系でのX・Y座標や、採用する高さの基準での標高など、今回使う値が分かっています。",
    role:
      "新点の位置や高さを求める出発点、方向付け、計算後の点検に使います。",
    fieldCheck:
      "点名、標識、点の記、座標系・標高基準、移動や破損がないことを照合します。",
    afterSurvey:
      "既知値は勝手に作り直さず、観測結果の計算と点検の基準として記録に残します。",
    coordinateReadout: {
      x: "100.000 m",
      y: "100.000 m",
      elevation: "32.415 m",
    },
  },
  new: {
    id: "new",
    name: "P1",
    kind: "新点",
    summary:
      "現地で位置は示せても、必要な座標や標高をこれから求める点です。",
    currentInformation:
      "点名や設置場所は決まっていますが、今回の成果に必要なX・Y座標や標高は未定です。",
    role:
      "既知点からの観測と計算によって、新しい位置や高さを与える対象になります。",
    fieldCheck:
      "点が安定していること、視通、観測しやすさ、点名、保護や再確認の方法を確認します。",
    afterSurvey:
      "観測、計算、点検を経て座標や標高が成果になります。後の作業では既知情報として使えます。",
    coordinateReadout: {
      x: "観測前は未定",
      y: "観測前は未定",
      elevation: "観測前は未定",
    },
  },
};

export const surveyWorkflow = [
  {
    number: "1",
    title: "現地観測",
    description:
      "計画した測点で、目的に必要な距離・角度・高低差などを記録します。",
  },
  {
    number: "2",
    title: "計算",
    description:
      "観測値を座標、標高、形状など、求める成果の値へ変換します。",
  },
  {
    number: "3",
    title: "点検",
    description:
      "再観測値、既知値、閉合差や許容値と比べ、誤りや精度を確認します。",
  },
  {
    number: "4",
    title: "成果作成",
    description:
      "点検を通った値から、座標簿、図面、点の記、観測手簿などを整えます。",
  },
] as const;
