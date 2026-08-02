export type CoordinateRepresentationId =
  | "latitude-longitude"
  | "plane-rectangular"
  | "point-information";

export interface CoordinateRepresentation {
  readonly id: CoordinateRepresentationId;
  readonly label: string;
  readonly description: string;
  readonly values: readonly {
    readonly label: string;
    readonly value: string;
    readonly unit: string;
  }[];
  readonly coordinateSystem: string;
  readonly zone: string;
  readonly practicalChecks: readonly string[];
}

export interface FixedCoordinateSample {
  readonly id: string;
  readonly name: string;
  readonly latitude: {
    readonly decimalDegrees: number;
    readonly dms: string;
  };
  readonly longitude: {
    readonly decimalDegrees: number;
    readonly dms: string;
  };
  readonly planeCoordinate: {
    readonly x: number;
    readonly y: number;
    readonly zoneNumber: number;
    readonly systemName: string;
    readonly originLatitude: string;
    readonly originLongitude: string;
  };
  readonly horizontalDatum: string;
  readonly height: {
    readonly elevation: number;
    readonly ellipsoidHeight: number;
    readonly geoidHeight: number;
    readonly geoidModel: string;
    readonly heightReferenceConversion: number;
    readonly isGeoidHeightFixed: true;
    readonly learningValueNote: string;
  };
  readonly verification: {
    readonly checkedOn: string;
    readonly horizontalSource: string;
    readonly forwardResult: string;
    readonly reverseResult: string;
    readonly heightSource: string;
  };
}

/*
 * 固定サンプルの水平位置は、国土地理院公表の日本経緯度原点を使用する。
 * 2026-07-31に国土地理院「測量計算サイト」で次を正逆換算して確認済み。
 *   緯度 35.6580992222° / 経度 139.7413574722°
 *   → 世界測地系・平面直角座標系第IX系
 *   → X=-37928.1965 m / Y=-8327.6987 m
 *   → 緯度 35.65809922° / 経度 139.74135747°
 * 実行時には座標変換APIを呼ばず、この確認済み固定値だけを表示する。
 *
 * ジオイド高36.7053 mは、同地点を「ジオイド2024日本とその周辺」で
 * 計算した固定値。標高26.680 mは国土地理院「位置情報基盤整備ガイドライン」
 * の入力例を教材値として使用し、楕円体高は標高＋ジオイド高で整合させた。
 */
export const fixedCoordinateSample = {
  id: "japan-geodetic-origin",
  name: "日本経緯度原点",
  latitude: {
    decimalDegrees: 35.65809922222222,
    dms: "北緯 35°39′29.1572″",
  },
  longitude: {
    decimalDegrees: 139.74135747222222,
    dms: "東経 139°44′28.8869″",
  },
  planeCoordinate: {
    x: -37928.1965,
    y: -8327.6987,
    zoneNumber: 9,
    systemName: "平面直角座標系 第IX系",
    originLatitude: "北緯 36°00′00″",
    originLongitude: "東経 139°50′00″",
  },
  horizontalDatum: "世界測地系（日本測地系2024）",
  height: {
    elevation: 26.68,
    ellipsoidHeight: 63.3853,
    geoidHeight: 36.7053,
    geoidModel: "ジオイド2024日本とその周辺",
    heightReferenceConversion: 0,
    isGeoidHeightFixed: true,
    learningValueNote:
      "高さは関係式を学ぶための教材値です。日本経緯度原点の測量成果としては使用できません。",
  },
  verification: {
    checkedOn: "2026-07-31",
    horizontalSource:
      "国土地理院「日本経緯度原点」「測量計算サイト」",
    forwardResult:
      "緯度経度から第IX系 X=-37928.1965 m、Y=-8327.6987 m",
    reverseResult:
      "X・Yから緯度35.65809922°、経度139.74135747°へ復元",
    heightSource:
      "国土地理院「ジオイド2024日本とその周辺」と位置情報基盤整備ガイドラインの教材用入力例",
  },
} as const satisfies FixedCoordinateSample;

export const coordinateRepresentations = [
  {
    id: "latitude-longitude",
    label: "緯度・経度",
    description:
      "地球上の位置を、赤道と本初子午線からの角度で表します。同じ数値でも測地系が違えば位置がずれるため、座標系を一緒に確認します。",
    values: [
      {
        label: "緯度",
        value: fixedCoordinateSample.latitude.dms,
        unit: "度・分・秒",
      },
      {
        label: "経度",
        value: fixedCoordinateSample.longitude.dms,
        unit: "度・分・秒",
      },
    ],
    coordinateSystem: fixedCoordinateSample.horizontalDatum,
    zone: "第IX系（平面直角座標で表す場合）",
    practicalChecks: [
      "測地系・測地成果",
      "緯度と経度の並び",
      "度分秒か十進度か",
    ],
  },
  {
    id: "plane-rectangular",
    label: "平面直角座標",
    description:
      "限られた地域を平面へ投影し、原点から北方向をX、東方向をYとしてメートルで表します。系番号が違うと原点も数値も変わります。",
    values: [
      {
        label: "X座標",
        value: fixedCoordinateSample.planeCoordinate.x.toFixed(4),
        unit: "m（北方向）",
      },
      {
        label: "Y座標",
        value: fixedCoordinateSample.planeCoordinate.y.toFixed(4),
        unit: "m（東方向）",
      },
    ],
    coordinateSystem: `${fixedCoordinateSample.horizontalDatum}・${fixedCoordinateSample.planeCoordinate.systemName}`,
    zone: `第IX系（${fixedCoordinateSample.planeCoordinate.zoneNumber}系）`,
    practicalChecks: [
      "座標系と系番号",
      "Xは北・Yは東",
      "単位、符号、小数点",
    ],
  },
  {
    id: "point-information",
    label: "標高を含む地点情報",
    description:
      "水平位置に高さの種類と基準を加えた表示です。標高と楕円体高は同じ値ではないため、単に「高さ」とだけ記録しません。",
    values: [
      {
        label: "地点",
        value: fixedCoordinateSample.name,
        unit: "固定サンプル",
      },
      {
        label: "水平位置",
        value: `${fixedCoordinateSample.latitude.dms} / ${fixedCoordinateSample.longitude.dms}`,
        unit: "度・分・秒",
      },
      {
        label: "標高",
        value: fixedCoordinateSample.height.elevation.toFixed(3),
        unit: "m（教材値）",
      },
    ],
    coordinateSystem: `${fixedCoordinateSample.horizontalDatum}／高さ：${fixedCoordinateSample.height.geoidModel}`,
    zone: `第IX系（${fixedCoordinateSample.planeCoordinate.zoneNumber}系）`,
    practicalChecks: [
      "水平位置の座標系",
      "高さが標高か楕円体高か",
      "使用したジオイド・モデル",
    ],
  },
] as const satisfies readonly CoordinateRepresentation[];

export type CoordinateQuadrantId =
  | "north-east"
  | "north-west"
  | "south-east"
  | "south-west";

export interface CoordinateQuadrant {
  readonly id: CoordinateQuadrantId;
  readonly label: string;
  readonly xSign: "正" | "負";
  readonly ySign: "正" | "負";
  readonly position: string;
  readonly diagramX: number;
  readonly diagramY: number;
}

export const coordinateQuadrants = [
  {
    id: "north-east",
    label: "北東側",
    xSign: "正",
    ySign: "正",
    position: "原点より北、かつ東",
    diagramX: 326,
    diagramY: 78,
  },
  {
    id: "north-west",
    label: "北西側",
    xSign: "正",
    ySign: "負",
    position: "原点より北、かつ西",
    diagramX: 114,
    diagramY: 78,
  },
  {
    id: "south-east",
    label: "南東側",
    xSign: "負",
    ySign: "正",
    position: "原点より南、かつ東",
    diagramX: 326,
    diagramY: 282,
  },
  {
    id: "south-west",
    label: "南西側",
    xSign: "負",
    ySign: "負",
    position: "原点より南、かつ西",
    diagramX: 114,
    diagramY: 282,
  },
] as const satisfies readonly CoordinateQuadrant[];

export type HeightReferenceId = "ellipsoid-height" | "elevation";

export interface HeightReference {
  readonly id: HeightReferenceId;
  readonly label: string;
  readonly basis: string;
  readonly purpose: string;
  readonly fieldCheck: string;
}

export const heightReferences = [
  {
    id: "ellipsoid-height",
    label: "楕円体高",
    basis: "基準楕円体から観測点までの幾何学的な高さ",
    purpose:
      "GNSSの三次元位置で扱う高さです。一般に使う標高へはジオイド高を使って結び付けます。",
    fieldCheck:
      "成果や受信機の表示が楕円体高なのか、標高へ変換済みなのか確認します。",
  },
  {
    id: "elevation",
    label: "標高",
    basis: "ジオイド面を基準とする一般的な土地の高さ",
    purpose:
      "地形図、設計、施工などで一般に使う高さです。採用する標高体系も確認します。",
    fieldCheck:
      "高さの基準、測地成果、使用したジオイド・モデルを確認します。",
  },
] as const satisfies readonly HeightReference[];

export const heightControlPointDefinitions = [
  {
    id: "benchmark",
    icon: "BM",
    title: "BM（Benchmark、水準点）",
    description:
      "標高が既知で、高さの基準として使用する点です。BMと水準点を別種類の点として扱わず、点名、成果の標高、高さの基準、現地での保存状態を確認します。",
  },
  {
    id: "control-point",
    icon: "基",
    title: "基準点",
    description:
      "平面位置または高さの基準として利用される点の概略的な呼び方です。何の値が既知で、どの成果と座標系に基づくかを確認します。",
  },
] as const;

export const ellipsoidHeightRange = {
  min: fixedCoordinateSample.height.geoidHeight + 20,
  max: fixedCoordinateSample.height.geoidHeight + 40,
  step: 0.01,
} as const;

export function calculateElevation(
  ellipsoidHeight: number,
  geoidHeight: number,
): number {
  return Number((ellipsoidHeight - geoidHeight).toFixed(4));
}
