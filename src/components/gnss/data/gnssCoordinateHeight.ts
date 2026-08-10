import { fixedCoordinateSample } from "../../basics/data/coordinateAndHeight";
import { fixedGnssScenario } from "./gnssOverview";
import type {
  GnssQuizAnswerEvaluation,
  GnssQuizQuestion,
} from "../types";

export const GRS80_SEMI_MAJOR_AXIS_METERS = 6_378_137;
export const GRS80_INVERSE_FLATTENING = 298.257222101;

export type GnssEarthPositionPresetId = "japan" | "equator" | "north";
export type GnssCoordinateRepresentationId = "earth-centered" | "geodetic";
export type GnssPlaneSystemViewId = "zone-9" | "other-zone";
export type GnssEpochComparisonId = "unaligned" | "aligned";
export type GnssHeightReferenceViewId = "ellipsoid" | "elevation";
export type GnssHeightConversionStateId = "unapplied" | "applied" | "misused";

export interface GnssEarthCenteredCoordinate {
  readonly xc: number;
  readonly yc: number;
  readonly zc: number;
}

export const gnssCoordinateHeightCards = [
  {
    id: "position-to-result",
    title: "GNSSで求めた位置は、どう成果になる？",
    focus: "3次元位置から測量成果までの見取り図",
  },
  {
    id: "earth-centered-position",
    title: "地球を基準にした3次元位置",
    focus: "地心直交座標Xc・Yc・Zc",
  },
  {
    id: "geodetic-representation",
    title: "同じ位置を緯度・経度・楕円体高で表す",
    focus: "同じ3次元位置の別表現",
  },
  {
    id: "plane-rectangular-coordinate",
    title: "緯度・経度を平面直角座標へ",
    focus: "投影と平面直角座標系の系番号",
  },
  {
    id: "coordinate-datum",
    title: "その座標は何を基準にしている？",
    focus: "JGD2024・ITRF・GRS80・WGS84",
  },
  {
    id: "coordinate-epoch",
    title: "その座標は「いつ」の位置？",
    focus: "元期・今期と地殻変動",
  },
  {
    id: "height-reference",
    title: "GNSSの高さは、なぜ標高ではない？",
    focus: "楕円体高・ジオイド・標高の基準面",
  },
  {
    id: "height-conversion",
    title: "楕円体高から標高へ",
    focus: "H = h - N とジオイド・モデル",
  },
  {
    id: "antenna-and-point",
    title: "アンテナ位置と測点位置",
    focus: "アンテナ高による測点高さへの換算",
  },
  {
    id: "fix-quality-check",
    title: "FIXなのに成果が違う",
    focus: "FIX後の成果条件の総合点検",
  },
] as const;

export const gnssCoordinateHeightConceptFlow = [
  "GNSS観測",
  "3次元位置",
  "座標表現",
  "座標基準",
  "高さ基準",
  "測量成果",
] as const;

export const gnssCoordinateHeightSampleG0 = {
  id: "gnss-coordinate-height-g0",
  name: "日本付近の基準サンプル",
  horizontalPositionBasis: "日本経緯度原点の公表位置",
  latitude: {
    dms: "35°39′29.1572″ N",
    decimalDegrees: fixedCoordinateSample.latitude.decimalDegrees,
    sourceKind: "公式公表値",
  },
  longitude: {
    dms: "139°44′28.8869″ E",
    decimalDegrees: fixedCoordinateSample.longitude.decimalDegrees,
    sourceKind: "公式公表値",
  },
  datum: {
    shortName: "JGD2024",
    name: "日本測地系2024（JGD2024）",
    referenceEllipsoid: "GRS80",
  },
  planeCoordinate: {
    systemName: "第IX系",
    zoneNumber: fixedCoordinateSample.planeCoordinate.zoneNumber,
    originLatitude: "北緯36°00′00″",
    originLongitude: "東経139°50′00″",
    x: fixedCoordinateSample.planeCoordinate.x,
    y: fixedCoordinateSample.planeCoordinate.y,
    sourceKind: "確認済み換算値",
  },
  height: {
    ellipsoidHeight: fixedCoordinateSample.height.ellipsoidHeight,
    geoidHeight: fixedCoordinateSample.height.geoidHeight,
    heightReferenceConversion:
      fixedCoordinateSample.height.heightReferenceConversion,
    elevation: fixedCoordinateSample.height.elevation,
    geoidModel: fixedCoordinateSample.height.geoidModel,
    sourceKind: "教材値",
    note: fixedCoordinateSample.height.learningValueNote,
  },
  earthCenteredCoordinate: {
    xc: -3_959_340.298,
    yc: 3_352_854.354,
    zc: 3_697_471.502,
    sourceKind: "教材派生値",
  },
} as const;

export const gnssPlaneCoordinateExplanation = {
  origin:
    "平面直角座標系IX系では、原点（緯度36°、経度139°50′）が X=0 m、Y=0 m です。",
  xAxis: "X軸は北が正、南が負です。",
  yAxis: "Y軸は東が正、西が負です。",
  sample:
    "日本付近の基準サンプルは原点の南西側にあるため、X<0、Y<0になります。",
} as const;

export const gnssEarthCenteredExplanation = {
  origin: "地球の重心（地球中心）",
  zPositiveDirection: "Z軸の正方向が北極方向",
  notation:
    "Xc・Yc・Zcの c は、center（中心）を思い出すための教材上の表記です。唯一の公式な座標記号という意味ではありません。",
} as const;

export function convertGeodeticToGrs80Ecef(
  latitudeDegrees: number,
  longitudeDegrees: number,
  ellipsoidHeightMeters: number,
): GnssEarthCenteredCoordinate | null {
  if (
    !Number.isFinite(latitudeDegrees) ||
    !Number.isFinite(longitudeDegrees) ||
    !Number.isFinite(ellipsoidHeightMeters) ||
    latitudeDegrees < -90 ||
    latitudeDegrees > 90 ||
    longitudeDegrees < -180 ||
    longitudeDegrees > 180
  ) {
    return null;
  }

  const flattening = 1 / GRS80_INVERSE_FLATTENING;
  const eccentricitySquared = flattening * (2 - flattening);
  const latitudeRadians = (latitudeDegrees * Math.PI) / 180;
  const longitudeRadians = (longitudeDegrees * Math.PI) / 180;
  const sinLatitude = Math.sin(latitudeRadians);
  const cosLatitude = Math.cos(latitudeRadians);
  const primeVerticalRadius =
    GRS80_SEMI_MAJOR_AXIS_METERS /
    Math.sqrt(1 - eccentricitySquared * sinLatitude * sinLatitude);

  return {
    xc:
      (primeVerticalRadius + ellipsoidHeightMeters) *
      cosLatitude *
      Math.cos(longitudeRadians),
    yc:
      (primeVerticalRadius + ellipsoidHeightMeters) *
      cosLatitude *
      Math.sin(longitudeRadians),
    zc:
      (primeVerticalRadius * (1 - eccentricitySquared) +
        ellipsoidHeightMeters) *
      sinLatitude,
  };
}

function createEarthPositionPreset(
  id: GnssEarthPositionPresetId,
  label: string,
  locationHint: string,
  latitudeDegrees: number,
  longitudeDegrees: number,
  ellipsoidHeightMeters: number,
  diagramX: number,
  diagramY: number,
) {
  return {
    id,
    label,
    locationHint,
    latitudeDegrees,
    longitudeDegrees,
    ellipsoidHeightMeters,
    diagramX,
    diagramY,
    coordinate:
      convertGeodeticToGrs80Ecef(
        latitudeDegrees,
        longitudeDegrees,
        ellipsoidHeightMeters,
      ) ?? { xc: 0, yc: 0, zc: 0 },
  } as const;
}

export const gnssEarthPositionPresets = [
  createEarthPositionPreset(
    "japan",
    "日本付近の基準サンプル",
    "緯度 約36°N / 経度 約140°E",
    gnssCoordinateHeightSampleG0.latitude.decimalDegrees,
    gnssCoordinateHeightSampleG0.longitude.decimalDegrees,
    gnssCoordinateHeightSampleG0.height.ellipsoidHeight,
    443,
    90,
  ),
  createEarthPositionPreset(
    "equator",
    "赤道付近（模式値）",
    "緯度 約0°",
    0,
    0,
    0,
    480,
    190,
  ),
  createEarthPositionPreset(
    "north",
    "北極寄り（模式値）",
    "緯度 約80°N / 北極は90°N",
    80,
    40,
    0,
    345,
    54,
  ),
] as const;

export function getGnssEarthPositionPreset(
  presetId: string,
): (typeof gnssEarthPositionPresets)[number] | null {
  return (
    gnssEarthPositionPresets.find((preset) => preset.id === presetId) ?? null
  );
}

export const gnssDatumRelationship = {
  flow: ["ITRF（世界規模の基準枠）", "JGD2024（日本の測地基準）", "測量成果"],
  itrf: "世界規模で位置を表すための基準枠（地心座標系）",
  jgd2024:
    "日本で測量成果を扱う現在の測地基準。ITRFに基づき、GRS80楕円体を採用する。",
  grs80:
    "緯度・経度・楕円体高を表すときに基準とする地球の形（準拠楕円体）。ITRFやJGD2024とは役割が異なる。",
  conceptNote:
    "ITRFは世界規模の基準枠、JGD2024は日本の測地基準、GRS80は地球の形を近似する準拠楕円体です。同じ概念の別名ではありません。",
  succession:
    "JGD2011からJGD2024への名称変更は測地系の定義自体を変更したものではなく、水平位置の緯度・経度と平面直角座標成果は引き継がれている。",
  wgs84:
    "WGS84はGPSで使用される座標系。JGD2024と名称・役割・定義が同じ測地系ではないが、GNSSの多くの座標系はITRFと整合するよう維持され、実用上非常に近い関係にある。",
} as const;

export const gnssEpochReference = {
  originalEpochDefinition: "成果基準時点（公表成果の基準となる時点）",
  currentEpochDefinition: "観測時点（実際に観測した時点）",
  horizontalExample: {
    area: "東京都本土等の水平位置成果",
    referenceDate: "2011年5月24日",
  },
  elevationExample: {
    area: "JGD2024の標高成果",
    referenceDate: "2024年6月1日",
  },
  jgd2024Caution:
    "測地系と時点は別の情報です。JGD2011が元期、JGD2024が今期という意味ではありません。",
  alignmentPurpose:
    "地面は実際に動くため、元期へそろえる操作は『元期の値が常に真値』だからではなく、国家座標や既知の測量成果と同じ基準時点で比較するために行います。",
  applicabilityNote:
    "セミ・ダイナミック補正を行うかどうかは、測量の種類、作業規程、使用する成果などの条件で判断します。常に同じ補正を行うわけではありません。",
  movementAndCorrectionNote:
    "元期から今期への移動量と、今期から元期へ戻す補正量は向きが逆なので、符号も逆になります。",
  semiDynamicNote:
    "セミ・ダイナミック補正は、異なる時点の高精度座標を同じ時点へそろえるための仕組みです。",
} as const;

export const gnssVirtualEpochPointT1 = {
  id: "gnss-coordinate-height-t1",
  name: "仮想基準点 T1",
  originalEpoch: { x: 1000.0, y: 1000.0 },
  currentEpoch: { x: 1000.035, y: 999.982 },
  difference: { x: 0.035, y: -0.018 },
  correctionToOriginal: { x: -0.035, y: 0.018 },
  sourceKind: "仮想値",
  note:
    "地殻変動を視覚的に理解するための仮想値であり、実在地点の変動量ではありません。",
} as const;

export function calculateGnssElevation(
  ellipsoidHeight: number,
  geoidHeight: number,
  heightReferenceConversion = 0,
): number | null {
  if (
    !Number.isFinite(ellipsoidHeight) ||
    !Number.isFinite(geoidHeight) ||
    !Number.isFinite(heightReferenceConversion)
  ) {
    return null;
  }

  return ellipsoidHeight - geoidHeight - heightReferenceConversion;
}

export const gnssHeightReferenceExplanation = {
  ellipsoidHeight:
    "GRS80楕円体面からP1までを測る高さ。GNSSが扱う3次元座標の高さ成分です。",
  geoid:
    "平均海面と整合する、重力を考慮した高さの基準面。日本の標高は東京湾平均海面を基準とします。",
  elevation:
    "ジオイド面を高さの基準としてP1までを表す値。楕円体高とは基準面が異なります。",
  geoidHeight:
    "ジオイド高36.7053 mはP1の高さそのものではなく、その地点における楕円体面とジオイド面の間の高さです。",
  islandNote:
    "一部離島等では基準面補正量を考慮する場合があります。この章の中心計算はH = h - Nです。",
} as const;

export const gnssFieldScenarioP1 = {
  id: "gnss-coordinate-height-p1",
  sourceKind: "第1章から続く仮想現場",
  knownPoint: {
    name: fixedGnssScenario.knownPoint.name,
    x: fixedGnssScenario.knownPoint.x,
    y: fixedGnssScenario.knownPoint.y,
    elevation: fixedGnssScenario.knownPoint.elevation,
    antennaHeight: fixedGnssScenario.baseStation.antennaHeight,
  },
  newPoint: {
    name: fixedGnssScenario.newPoint.name,
    x: fixedGnssScenario.newPoint.x,
    y: fixedGnssScenario.newPoint.y,
    elevation: fixedGnssScenario.newPoint.elevation,
    antennaHeight: fixedGnssScenario.rover.antennaHeight,
  },
} as const;

export const gnssAntennaHeightExample = {
  pointName: gnssFieldScenarioP1.newPoint.name,
  correctAntennaHeight: gnssFieldScenarioP1.newPoint.antennaHeight,
  incorrectAntennaHeight: 2.1,
  correctPointHeight: gnssFieldScenarioP1.newPoint.elevation,
  antennaPositionHeight:
    gnssFieldScenarioP1.newPoint.elevation +
    gnssFieldScenarioP1.newPoint.antennaHeight,
  sourceKind: "仮想値・鉛直の単純モデル",
  caution:
    "アンテナを鉛直に設置した場合の理解用単純モデルです。実際の高精度GNSSではアンテナ基準位置・位相中心補正等も関係します。",
} as const;

export const gnssAntennaPointRelationship = [
  {
    id: "antenna-reference-position",
    label: "アンテナ基準点の位置",
    note: "GNSSで求める位置",
  },
  {
    id: "antenna-height",
    label: "アンテナ高 2.000 m",
    note: "正確に記録・設定する",
  },
  {
    id: "ground-point-p1",
    label: "地上の測点 P1",
    note: "アンテナ高を用いて対応づける",
  },
] as const;

export function calculateGnssPointHeightFromAntenna(
  antennaPositionHeight: number,
  inputAntennaHeight: number,
): number | null {
  if (
    !Number.isFinite(antennaPositionHeight) ||
    !Number.isFinite(inputAntennaHeight)
  ) {
    return null;
  }

  return antennaPositionHeight - inputAntennaHeight;
}

export const gnssFinalReviewRows = [
  {
    id: "datum",
    label: "測地系",
    check: "基準局・既知点・成果で同じ測地系を使っているか",
  },
  {
    id: "plane-zone",
    label: "平面直角座標系",
    check: "成果と同じ系番号を選んでいるか",
  },
  {
    id: "coordinate-epoch",
    label: "座標の時点",
    check: "元期と今期を取り違えていないか",
  },
  {
    id: "height-type",
    label: "高さの種類",
    check: "楕円体高 h と標高 H を混同していないか",
  },
  {
    id: "height-basis",
    label: "高さの基準・ジオイド",
    check: "使用する標高体系とジオイド・モデルが適切か",
  },
  {
    id: "antenna-height",
    label: "アンテナ高",
    check: "測定方法、入力値、単位が正しいか",
  },
  {
    id: "base-coordinate",
    label: "基準局座標",
    check: "基準局に正しい座標を設定しているか",
  },
  {
    id: "known-point",
    label: "既知点・再観測",
    check: "既知点や再観測で成果との整合を確かめたか",
  },
  {
    id: "environment",
    label: "観測環境",
    check: "上空視界、反射源、通信、固定状態に問題がないか",
  },
] as const;

export const gnssCoordinateHeightQuizQuestions = [
  {
    id: "gnss-coordinate-height-q01-same-position",
    questionType: "仕組み理解",
    prompt: "地心直交座標 Xc・Yc・Zc の原点はどこですか。",
    options: [
      {
        id: "north-pole-origin",
        label: "北極",
        incorrectReason:
          "北極はZ軸の正方向を示しますが、座標の原点ではありません。",
      },
      {
        id: "japanese-origin",
        label: "日本経緯度原点",
        incorrectReason:
          "日本経緯度原点は日本の測量で重要な原点ですが、地心直交座標の原点ではありません。",
      },
      {
        id: "earth-center-origin",
        label: "地球の重心（地球中心）",
        incorrectReason: null,
      },
      {
        id: "equator-japan-longitude-intersection",
        label: "赤道と日本の経度が交わる地点",
        incorrectReason:
          "赤道上の地点はX軸やY軸の方向を考える手掛かりになりますが、原点ではありません。",
      },
    ],
    correctOptionId: "earth-center-origin",
    correctReason:
      "地心直交座標は、地球の重心（地球中心）を原点にします。北極はZ軸の正方向です。",
    fieldCheck:
      "地心直交座標と平面直角座標では、原点と軸の向きが異なることを確認します。",
  },
  {
    id: "gnss-coordinate-height-q02-plane-system",
    questionType: "品質管理",
    prompt:
      "平面直角座標系IX系の原点（緯度36°、経度139°50′）から見て南西側にある地点のX・Yの符号はどれですか。",
    options: [
      {
        id: "north-east-positive",
        label: "X>0、Y>0",
        incorrectReason:
          "X>0は北側、Y>0は東側を表すため、北東側の符号です。",
      },
      {
        id: "north-west-signs",
        label: "X>0、Y<0",
        incorrectReason:
          "X>0は北側、Y<0は西側を表すため、北西側の符号です。",
      },
      {
        id: "south-east-signs",
        label: "X<0、Y>0",
        incorrectReason:
          "X<0は南側、Y>0は東側を表すため、南東側の符号です。",
      },
      {
        id: "south-west-negative",
        label: "X<0、Y<0",
        incorrectReason: null,
      },
    ],
    correctOptionId: "south-west-negative",
    correctReason:
      "X軸は北が正、Y軸は東が正なので、原点の南西側ではXとYがともに負になります。日本付近の基準サンプルはX=-37928.1965 m、Y=-8327.6987 mです。",
    fieldCheck:
      "成果地域に適した系番号に加え、原点とX・Y軸の向きを確認します。",
  },
  {
    id: "gnss-coordinate-height-q03-jgd2024",
    questionType: "用語整理",
    prompt: "日本測地系2024（JGD2024）の説明として最も適切なのはどれか。",
    options: [
      {
        id: "current-japanese-geodetic-datum",
        label: "日本で位置を共通の基準で表すための現在の測地系。",
        incorrectReason: null,
      },
      {
        id: "receiver-positioning-mode",
        label: "GNSS受信機の測位モード。",
        incorrectReason:
          "JGD2024はSINGLE・FLOAT・FIXのような受信機の測位モードではありません。",
      },
      {
        id: "plane-zone-collective-name",
        label: "平面直角座標I～XIXの総称。",
        incorrectReason:
          "JGD2024は測地系であり、平面直角座標の系番号の総称ではありません。",
      },
      {
        id: "only-for-2024-observations",
        label: "2024年に観測した座標だけに使用できる座標系。",
        incorrectReason:
          "名称の2024は観測年の利用制限を意味しません。座標の時点は別に確認します。",
      },
    ],
    correctOptionId: "current-japanese-geodetic-datum",
    correctReason:
      "JGD2024は、ITRFに基づきGRS80楕円体を採用する、日本で測量成果を扱う現在の測地系です。",
    fieldCheck: "座標値とともに、成果が準拠する測地系を確認します。",
  },
  {
    id: "gnss-coordinate-height-q04-epoch",
    questionType: "品質管理",
    prompt:
      "公表された基準点成果と、現地でGNSS観測した位置を比較する。元期・今期の説明として最も適切なのはどれか。",
    options: [
      {
        id: "observation-start-and-fix-time",
        label: "元期はGNSS観測開始時刻、今期はFIXした時刻。",
        incorrectReason:
          "元期・今期は1回の観測内の開始時刻とFIX時刻を表す用語ではありません。",
      },
      {
        id: "both-always-2024",
        label: "JGD2024では元期・今期とも必ず2024年。",
        incorrectReason:
          "JGD2024という名称だけで座標の時点は決まりません。水平成果と標高成果でも基準日の例が異なります。",
      },
      {
        id: "height-only-concept",
        label: "高さだけに関係し、水平位置には関係しない。",
        incorrectReason:
          "地殻変動の影響を受ける高精度な水平位置を比較するときにも座標の時点が重要です。",
      },
      {
        id: "reference-and-observation-epoch",
        label: "元期は測量成果の基準となる時点、今期は実際に観測した時点。",
        incorrectReason: null,
      },
    ],
    correctOptionId: "reference-and-observation-epoch",
    correctReason:
      "元期は公表成果の基準時点、今期は実際の観測時点です。どちらも間違いではなく、『いつの位置か』が異なります。",
    fieldCheck: "既知点成果と観測座標を比較する前に、両方の座標の時点を確認します。",
  },
  {
    id: "gnss-coordinate-height-q05-height-conversion",
    questionType: "仕組み理解",
    prompt:
      "楕円体高h=63.3853 m、ジオイド高N=36.7053 m、基準面補正量0.0000 mの教材条件における標高として適切なのはどれか。",
    options: [
      {
        id: "sum-height-and-geoid",
        label: "100.0906 m",
        incorrectReason:
          "楕円体高とジオイド高を加えています。基本関係はH = h - Nです。",
      },
      {
        id: "subtract-geoid-height",
        label: "26.6800 m",
        incorrectReason: null,
      },
      {
        id: "use-ellipsoid-height",
        label: "63.3853 m",
        incorrectReason:
          "これは楕円体高です。ジオイド高を差し引いて標高へ換算します。",
      },
      {
        id: "use-geoid-height",
        label: "36.7053 m",
        incorrectReason:
          "これは楕円体面とジオイド面の間の高さで、P1の標高ではありません。",
      },
    ],
    correctOptionId: "subtract-geoid-height",
    correctReason:
      "H = h - Nより、63.3853 - 36.7053 = 26.6800 mです。基準面補正量はこの教材条件では0.0000 mです。",
    fieldCheck: "高さの種類と、使用したジオイド・モデルを記録します。",
  },
  {
    id: "gnss-coordinate-height-q06-height-type",
    questionType: "品質管理",
    prompt:
      "GNSS観測でFIXし、成果表示に『高さ 63.3853 m』と表示された。道路現況図等へ標高として記載する前の対応として最も適切なのはどれか。",
    options: [
      {
        id: "use-as-elevation-because-fix",
        label: "FIXなので、そのまま標高として使う。",
        incorrectReason:
          "FIXは高さの種類を保証しません。楕円体高を標高として使うと大きな差になります。",
      },
      {
        id: "ignore-geoid-after-fix",
        label: "FIX後はジオイドを確認する必要がない。",
        incorrectReason:
          "標高へ換算する場合は、高さ基準とジオイド・モデルの確認が必要です。",
      },
      {
        id: "verify-height-type-and-model",
        label: "楕円体高か標高か、高さ基準とジオイド・モデルを確認する。",
        incorrectReason: null,
      },
      {
        id: "subtract-antenna-height-only",
        label: "アンテナ高だけを差し引けば必ず標高になる。",
        incorrectReason:
          "アンテナ高はアンテナ位置と測点位置を結ぶ量です。楕円体高と標高の基準面変換とは別の確認です。",
      },
    ],
    correctOptionId: "verify-height-type-and-model",
    correctReason:
      "FIXしていても、高さが楕円体高か標高かは別に確認し、標高なら使用した高さ基準とジオイド・モデルを確認します。",
    fieldCheck: "機器・ソフトの出力項目名と高さ設定を確認し、『高さ』だけで記録しません。",
  },
  {
    id: "gnss-coordinate-height-q07-antenna-height",
    questionType: "品質管理",
    prompt:
      "正しい移動局アンテナ高は2.000 mだが2.100 mと入力した。アンテナ位置そのものは同じとする教材上の単純モデルで、測点の高さ成果への影響として最も適切なのはどれか。",
    options: [
      {
        id: "point-height-ten-centimeters-lower",
        label: "約10 cm低くなる。",
        incorrectReason: null,
      },
      {
        id: "point-height-ten-centimeters-higher",
        label: "約10 cm高くなる。",
        incorrectReason:
          "入力アンテナ高を10 cm大きくすると、固定したアンテナ位置から差し引く量が10 cm増え、測点高さは低くなります。",
      },
      {
        id: "fix-removes-antenna-error",
        label: "FIXしていれば影響しない。",
        incorrectReason:
          "FIXはアンテナ高の入力誤りを自動的に検出・修正する表示ではありません。",
      },
      {
        id: "only-horizontal-changes",
        label: "X・Yだけが変わり、高さには影響しない。",
        incorrectReason:
          "この鉛直の単純モデルでは、アンテナ高の誤入力が測点の高さ成果へ同じ量だけ影響します。",
      },
    ],
    correctOptionId: "point-height-ten-centimeters-lower",
    correctReason:
      "アンテナ位置を固定した単純モデルでは、入力アンテナ高を2.000 mから2.100 mへ増やすと、測点高さは0.100 m低くなります。",
    fieldCheck: "移動局・基準局それぞれのアンテナ高、測定位置、単位、入力値を照合します。",
  },
  {
    id: "gnss-coordinate-height-q08-final-quality-check",
    questionType: "総合問題",
    prompt:
      "測位状態はFIX、測地系はJGD2024、第IX系のX・Yを取得済みだが、座標の元期・今期と『高さ63.3853 m』の種類が未確認である。最も適切な判断はどれか。",
    options: [
      {
        id: "use-result-because-fix",
        label: "FIXなので、そのまま成果として使用する。",
        incorrectReason:
          "FIXだけでは座標の時点や高さの種類・基準の正しさまで保証されません。",
      },
      {
        id: "datum-and-zone-are-enough",
        label: "JGD2024と第IX系が合っているので、時点・高さは確認不要。",
        incorrectReason:
          "測地系と系番号が正しくても、比較時点と高さ基準が未確認なら成果条件はそろっていません。",
      },
      {
        id: "xy-completes-gnss-survey",
        label: "X・Yさえ取得できればGNSS測量は完了。",
        incorrectReason:
          "用途に必要な高さと付帯条件も含め、成果として使えるかを確認する必要があります。",
      },
      {
        id: "verify-epoch-and-height-basis",
        label: "座標の時点と高さの種類・基準を確認してから成果として使用する。",
        incorrectReason: null,
      },
    ],
    correctOptionId: "verify-epoch-and-height-basis",
    correctReason:
      "FIXは重要な測位状態ですが、測地系・系番号・座標の時点・高さ基準・アンテナ高を確認して初めて成果条件を判断できます。",
    fieldCheck:
      "FIXに加え、測地系、系番号、座標の時点、高さの種類とジオイド、アンテナ高を順に照合します。",
  },
] as const satisfies readonly GnssQuizQuestion[];

export function getGnssCoordinateHeightQuizQuestion(
  questionId: string,
): GnssQuizQuestion | null {
  return (
    gnssCoordinateHeightQuizQuestions.find(
      (question) => question.id === questionId,
    ) ?? null
  );
}

export function getGnssCoordinateHeightQuizOptionLetter(
  questionId: string,
  optionId: string,
): string | null {
  const question = getGnssCoordinateHeightQuizQuestion(questionId);
  const optionIndex = question?.options.findIndex(
    (option) => option.id === optionId,
  );

  if (optionIndex === undefined || optionIndex < 0) {
    return null;
  }

  return String.fromCharCode(65 + optionIndex);
}

export function evaluateGnssCoordinateHeightQuizAnswer(
  questionId: string,
  optionId: string,
): GnssQuizAnswerEvaluation | null {
  const question = getGnssCoordinateHeightQuizQuestion(questionId);
  const selectedOption = question?.options.find(
    (option) => option.id === optionId,
  );
  const correctOption = question?.options.find(
    (option) => option.id === question.correctOptionId,
  );

  if (!question || !selectedOption || !correctOption) {
    return null;
  }

  return {
    questionId,
    selectedOptionId: selectedOption.id,
    selectedOptionLabel: selectedOption.label,
    correctOptionId: correctOption.id,
    correctOptionLabel: correctOption.label,
    isCorrect: selectedOption.id === correctOption.id,
    selectedAnswerReason: selectedOption.incorrectReason,
    correctReason: question.correctReason,
    fieldCheck: question.fieldCheck,
  };
}
