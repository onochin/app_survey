import { describe, expect, it } from "vitest";
import {
  availableBasicsLessons,
  basicsLessons,
} from "../components/basics/basicsCourse";
import {
  angleDefinitions,
  calculateDmsOperation,
  calculateExteriorAngle,
  calculateHorizontalAngle,
  calculateVerticalAngleFromZenith,
  directionOptions,
  dmsExercises,
} from "../components/basics/data/angleAndAzimuth";
import {
  calculateElevation,
  coordinateQuadrants,
  coordinateRepresentations,
  fixedCoordinateSample,
  heightControlPointDefinitions,
} from "../components/basics/data/coordinateAndHeight";
import {
  calculateHorizontalDistance,
  calculateMapDistanceMillimeters,
  calculatePrismConstantResult,
  calculateSlopeDistance,
  distanceMethods,
  distanceObservationSamples,
  prismLearningModel,
  summarizeDistanceObservations,
} from "../components/basics/data/distanceMeasurement";
import {
  calculateForwardCoordinate,
  closureBridgeSample,
  coordinateCalculationConcepts,
  describeSurveyDirection,
  inverseDirectionPresets,
} from "../components/basics/data/coordinateCalculation";
import {
  calculateElevationByHeightDifference,
  calculateElevationByInstrumentHeight,
  calculateInstrumentHeight,
  calculateLevelingClosingError,
  calculateLevelingEndElevation,
  calculateLevelingHeightDifference,
  calculateObservedHeightDifference,
  calculateRoundTripClosingError,
  calculateSequentialLeveling,
  calculateSightDistanceDifference,
  calculateSingleLevelingSetup,
  levelConditions,
  levelingConcepts,
  levelingRouteSamples,
  sightDistanceCases,
  staffConditions,
  summarizeLevelingRun,
  turningPointExamples,
} from "../components/basics/data/levelingBasics";
import {
  accuracyPrecisionPatterns,
  applyGrossError,
  applySystematicBias,
  calculateBiasFromReference,
  calculateHeightInputImpact as calculateObservationHeightInputImpact,
  calculateMean,
  calculateObservationRange,
  calculateObservationStatistics,
  calculateResiduals,
  calculateResidualSquareSum,
  calculateSampleStandardDeviation,
  calculateScatterSummary,
  combineIndependentStandardDeviations,
  errorScenarios,
  evaluateClosingError,
  getRecommendedInspectionDecision,
  heightInputScenarios as observationErrorHeightScenarios,
  inspectionDecisionScenarios,
  observationErrorConcepts,
} from "../components/basics/data/observationError";
import {
  pointComparisons,
  surveyPurposes,
} from "../components/basics/data/surveyOverview";
import {
  backsightLearningSample,
  calculateForesightAzimuth,
  calculateHeightInputImpact,
  calculateSignedDirectionError,
  calculateTsDerivedValues,
  evaluateSetupOrder,
  heightInputLearningModel,
  heightInputScenarios,
  initialSetupStepOrder,
  inspectionScenarios,
  moveSetupStep,
  observationChecklistItems,
  totalStationSetupSteps,
} from "../components/basics/data/totalStationObservation";
import { calculateNextAzimuth } from "../calculations/azimuth";

describe("測量の基礎 教材レジストリ", () => {
  it("9章分を安定した一意のIDで登録する", () => {
    const lessonIds = basicsLessons.map((lesson) => lesson.id);

    expect(lessonIds).toHaveLength(9);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
  });

  it("第1章から第8章を実装済みとして進捗対象にする", () => {
    expect(availableBasicsLessons.map((lesson) => lesson.id)).toEqual([
      "point-and-position",
      "distance-and-direction",
      "height-difference",
      "error-and-equipment",
      "total-station-observation",
      "leveling-basics",
      "observation-error",
      "coordinate-calculation",
    ]);
    expect(
      basicsLessons.filter((lesson) => lesson.status === "coming-soon"),
    ).toHaveLength(1);
  });

  it("次章導線は登録済みの章IDだけを参照する", () => {
    const registeredLessonIds = new Set(
      basicsLessons.map((lesson) => lesson.id),
    );

    for (const lesson of basicsLessons) {
      if (lesson.nextLessonId !== null) {
        expect(registeredLessonIds.has(lesson.nextLessonId)).toBe(true);
      }
    }
  });

  it("第1章はPhase 3-1のメタデータを持つ", () => {
    const firstLesson = basicsLessons.find(
      (lesson) => lesson.id === "point-and-position",
    );

    expect(firstLesson).toMatchObject({
      id: "point-and-position",
      title: "測量の全体像と測点",
      learningGoal:
        "何を求めるために、どの測量を行うのか説明できる。",
      nextLessonId: "distance-and-direction",
      status: "available",
    });
    expect(firstLesson?.terms).toEqual(
      expect.arrayContaining([
        "測量",
        "測点",
        "基準点",
        "既知点",
        "新点",
        "基準点測量",
        "地形測量",
        "応用測量",
      ]),
    );
    expect(firstLesson?.cautions).toHaveLength(2);
  });

  it("第1章の3つの測量目的に観測対象と成果を定義する", () => {
    expect(
      surveyPurposes.map((purpose) => [
        purpose.label,
        purpose.surveyType,
      ]),
    ).toEqual([
      ["基準点を作る", "基準点測量"],
      ["現況を測る", "地形測量"],
      ["高さを求める", "水準測量"],
    ]);

    for (const purpose of surveyPurposes) {
      expect(purpose.observationTargets.length).toBeGreaterThan(0);
      expect(purpose.expectedResults.length).toBeGreaterThan(0);
    }
  });

  it("既知点と新点を4つの視点で比較できるデータを持つ", () => {
    expect(Object.keys(pointComparisons)).toEqual(["known", "new"]);

    for (const point of Object.values(pointComparisons)) {
      expect(point.currentInformation).not.toBe("");
      expect(point.role).not.toBe("");
      expect(point.fieldCheck).not.toBe("");
      expect(point.afterSurvey).not.toBe("");
    }
  });

  it("第2章はPhase 3-2の安定ID・メタデータ・次章IDを持つ", () => {
    const secondLesson = basicsLessons.find(
      (lesson) => lesson.id === "distance-and-direction",
    );

    expect(secondLesson).toMatchObject({
      id: "distance-and-direction",
      title: "座標・標高・高さの基準",
      learningGoal:
        "座標値だけでなく、座標系と高さの基準を確認する必要性を説明できる。",
      nextLessonId: "height-difference",
      status: "available",
    });
    expect(secondLesson?.terms).toEqual(
      expect.arrayContaining([
        "緯度",
        "経度",
        "平面直角座標",
        "座標系",
        "原点",
        "系番号",
        "楕円体高",
        "ジオイド高",
        "標高",
        "BM（Benchmark、水準点）",
        "基準点",
      ]),
    );
    expect(secondLesson?.cautions).toHaveLength(5);
  });

  it("BMをBenchmark（水準点）として1つの用語定義で扱う", () => {
    const benchmarkDefinitions = heightControlPointDefinitions.filter(
      (definition) =>
        definition.title.includes("BM") ||
        definition.title.includes("水準点"),
    );
    const secondLesson = basicsLessons.find(
      (lesson) => lesson.id === "distance-and-direction",
    );

    expect(benchmarkDefinitions).toHaveLength(1);
    expect(benchmarkDefinitions[0]).toMatchObject({
      id: "benchmark",
      title: "BM（Benchmark、水準点）",
    });
    expect(benchmarkDefinitions[0]?.description).toContain(
      "BMと水準点を別種類の点として扱わず",
    );
    expect(secondLesson?.terms).not.toContain("BM");
    expect(secondLesson?.terms).not.toContain("水準点");
  });

  it("事前確認済み固定座標サンプルに必須データと根拠を保持する", () => {
    expect(fixedCoordinateSample).toMatchObject({
      id: "japan-geodetic-origin",
      name: "日本経緯度原点",
      latitude: {
        decimalDegrees: 35.65809922222222,
      },
      longitude: {
        decimalDegrees: 139.74135747222222,
      },
      planeCoordinate: {
        x: -37928.1965,
        y: -8327.6987,
        zoneNumber: 9,
        systemName: "平面直角座標系 第IX系",
      },
      horizontalDatum: "世界測地系（日本測地系2024）",
      height: {
        elevation: 26.68,
        ellipsoidHeight: 63.3853,
        geoidHeight: 36.7053,
      },
      verification: {
        checkedOn: "2026-07-31",
      },
    });
    expect(fixedCoordinateSample.verification.forwardResult).toContain(
      "X=-37928.1965 m、Y=-8327.6987 m",
    );
    expect(fixedCoordinateSample.verification.reverseResult).toContain(
      "緯度35.65809922°、経度139.74135747°",
    );
  });

  it("同一地点を3つの固定表現で切り替えるデータを持つ", () => {
    expect(
      coordinateRepresentations.map((representation) => representation.id),
    ).toEqual([
      "latitude-longitude",
      "plane-rectangular",
      "point-information",
    ]);

    for (const representation of coordinateRepresentations) {
      expect(representation.values.length).toBeGreaterThan(0);
      expect(representation.coordinateSystem).not.toBe("");
      expect(representation.zone).not.toBe("");
      expect(representation.practicalChecks.length).toBeGreaterThan(0);
    }
  });

  it("平面直角座標の4象限でX・Yの符号を正しく定義する", () => {
    expect(
      coordinateQuadrants.map((quadrant) => [
        quadrant.label,
        quadrant.xSign,
        quadrant.ySign,
      ]),
    ).toEqual([
      ["北東側", "正", "正"],
      ["北西側", "正", "負"],
      ["南東側", "負", "正"],
      ["南西側", "負", "負"],
    ]);
  });

  it("地点固有のジオイド高を固定し、標高を差し引きで求める", () => {
    expect(fixedCoordinateSample.height.isGeoidHeightFixed).toBe(true);
    expect(
      calculateElevation(
        fixedCoordinateSample.height.ellipsoidHeight,
        fixedCoordinateSample.height.geoidHeight,
      ),
    ).toBe(26.68);
    expect(
      calculateElevation(
        68.7053,
        fixedCoordinateSample.height.geoidHeight,
      ),
    ).toBe(32);
  });

  it("第3章はPhase 3-3の安定ID・メタデータ・次章IDを持つ", () => {
    const thirdLesson = basicsLessons.find(
      (lesson) => lesson.id === "height-difference",
    );

    expect(thirdLesson).toMatchObject({
      id: "height-difference",
      title: "距離測量",
      learningGoal:
        "機器が直接測る距離と、成果で使用する距離を区別できる。",
      nextLessonId: "error-and-equipment",
      status: "available",
    });
    expect(thirdLesson?.terms).toEqual(
      expect.arrayContaining([
        "水平距離",
        "斜距離",
        "高低差",
        "縮尺",
        "巻尺",
        "レーザー距離計",
        "TS",
        "プリズム",
        "プリズム定数",
        "観測値",
        "補正値",
        "反復観測",
      ]),
    );
    expect(thirdLesson?.cautions).toHaveLength(5);
  });

  it("斜距離・水平距離・高低差を直角三角形として計算する", () => {
    expect(calculateSlopeDistance(40, 30)).toBe(50);
    expect(calculateHorizontalDistance(50, 30)).toBe(40);
    expect(calculateHorizontalDistance(50, -30)).toBe(40);
  });

  it("高低差が斜距離と等しい境界でも平方根を不正にしない", () => {
    const boundaryResult = calculateHorizontalDistance(50, 50);

    expect(boundaryResult).toBe(0);
    expect(Number.isFinite(boundaryResult)).toBe(true);
    expect(() => calculateHorizontalDistance(50, 50.001)).toThrow(
      "高低差の絶対値は斜距離以下",
    );
    expect(() => calculateHorizontalDistance(0, 0)).toThrow(
      "斜距離は0より大きい値",
    );
  });

  it("3つの観測方法に直接値・条件・補正・成果距離を定義する", () => {
    expect(distanceMethods.map((method) => method.id)).toEqual([
      "tape",
      "laser",
      "total-station",
    ]);

    for (const method of distanceMethods) {
      expect(method.directValue).not.toBe("");
      expect(method.bestFor).not.toBe("");
      expect(method.fieldChecks.length).toBeGreaterThan(0);
      expect(method.corrections.length).toBeGreaterThan(0);
      expect(method.resultDistance).not.toBe("");
      expect(method.conversionNeed).not.toBe("");
    }
  });

  it("プリズム定数の教材用簡略モデルで設定誤差を距離へ加える", () => {
    expect(
      calculatePrismConstantResult(
        prismLearningModel.trueDistance,
        prismLearningModel.correctConstant,
        0,
      ),
    ).toEqual({
      settingError: 30,
      displayedDistance: 50.03,
    });
    expect(
      calculatePrismConstantResult(
        prismLearningModel.trueDistance,
        prismLearningModel.correctConstant,
        prismLearningModel.correctConstant,
      ),
    ).toEqual({
      settingError: 0,
      displayedDistance: 50,
    });
  });

  it("反復距離観測の平均・最大・最小・最大最小差を集計する", () => {
    expect(
      summarizeDistanceObservations(
        distanceObservationSamples.slice(0, 4),
      ),
    ).toEqual({
      count: 4,
      mean: 50.0013,
      maximum: 50.004,
      minimum: 49.998,
      range: 0.006,
    });
  });

  it("現地距離と縮尺から図上距離をmmで求める", () => {
    expect(calculateMapDistanceMillimeters(25, 500)).toBe(50);
    expect(calculateMapDistanceMillimeters(25, 1000)).toBe(25);
    expect(calculateMapDistanceMillimeters(25, 2500)).toBe(10);
  });

  it("第4章はPhase 3-4の安定ID・メタデータ・次章IDを持つ", () => {
    const fourthLesson = basicsLessons.find(
      (lesson) => lesson.id === "error-and-equipment",
    );

    expect(fourthLesson).toMatchObject({
      id: "error-and-equipment",
      title: "角度・方位角・度分秒",
      learningGoal:
        "北を0度とした方位角と、2方向間の水平角の違いを説明できる。",
      nextLessonId: "total-station-observation",
      status: "available",
    });
    expect(fourthLesson?.terms).toEqual(
      expect.arrayContaining([
        "水平角",
        "方位角",
        "内角",
        "外角",
        "右回り角",
        "左回り角",
        "後視",
        "前視",
        "鉛直角",
        "天頂角",
        "度分秒",
        "十進度",
        "正規化",
      ]),
    );
    expect(fourthLesson?.cautions).toHaveLength(6);
  });

  it("角度の種類と後視・前視の固定方向を教材データに持つ", () => {
    expect(angleDefinitions.map((definition) => definition.title)).toEqual([
      "方位角",
      "水平角",
      "内角",
      "外角",
      "右回り角・左回り角",
      "後視・前視",
      "鉛直角",
      "天頂角",
    ]);
    expect(
      directionOptions.map((direction) => direction.azimuthDegrees),
    ).toEqual([320, 40, 135, 225]);
  });

  it("同じ後視・前視から右回りと左回りの水平角を求める", () => {
    expect(calculateHorizontalAngle(320, 40, "clockwise")).toBe(80);
    expect(calculateHorizontalAngle(320, 40, "counterclockwise")).toBe(280);
    expect(calculateHorizontalAngle(40, 320, "clockwise")).toBe(280);
  });

  it("内角・外角と時計回り規約の次辺方位角を求める", () => {
    expect(calculateExteriorAngle(110)).toBe(250);
    expect(calculateNextAzimuth(35, 110)).toBe(105);
    expect(calculateNextAzimuth(350, 100)).toBe(70);
  });

  it("度分秒の加算で秒と分を繰り上げる", () => {
    const exercise = dmsExercises[0];
    const result = calculateDmsOperation(
      exercise.left,
      exercise.right,
      exercise.operation,
    );

    expect(result.rawDms).toEqual({
      sign: 1,
      degrees: 18,
      minutes: 1,
      seconds: 15,
    });
    expect(result.rawDecimalDegrees).toBeCloseTo(
      18 + 1 / 60 + 15 / 3_600,
      12,
    );
  });

  it("度分秒の減算で秒と分を繰り下げる", () => {
    const exercise = dmsExercises[1];
    const result = calculateDmsOperation(
      exercise.left,
      exercise.right,
      exercise.operation,
    );

    expect(result.rawDms).toEqual({
      sign: 1,
      degrees: 23,
      minutes: 24,
      seconds: 25,
    });
  });

  it("360度以上と負の度分秒演算結果を0度以上360度未満へ正規化する", () => {
    const positiveWrap = calculateDmsOperation(
      dmsExercises[2].left,
      dmsExercises[2].right,
      dmsExercises[2].operation,
    );
    const negativeWrap = calculateDmsOperation(
      dmsExercises[3].left,
      dmsExercises[3].right,
      dmsExercises[3].operation,
    );

    expect(positiveWrap.normalizedDms).toEqual({
      sign: 1,
      degrees: 0,
      minutes: 0,
      seconds: 10,
    });
    expect(negativeWrap.normalizedDms).toEqual({
      sign: 1,
      degrees: 359,
      minutes: 59,
      seconds: 50,
    });
  });

  it("同じ視準線の天頂角から上向き・水平・下向きの鉛直角を求める", () => {
    expect(calculateVerticalAngleFromZenith(65)).toBe(25);
    expect(calculateVerticalAngleFromZenith(90)).toBe(0);
    expect(calculateVerticalAngleFromZenith(115)).toBe(-25);
  });

  it("第5章はPhase 4-1の安定ID・メタデータ・次章IDを持つ", () => {
    const fifthLesson = basicsLessons.find(
      (lesson) => lesson.id === "total-station-observation",
    );

    expect(fifthLesson).toMatchObject({
      id: "total-station-observation",
      title: "TSの据付と観測",
      learningGoal:
        "TSを据え付けて方向付けし、角度と距離を観測する基本手順を説明できる。",
      nextLessonId: "leveling-basics",
      status: "available",
    });
    expect(fifthLesson?.terms).toEqual(
      expect.arrayContaining([
        "TS",
        "三脚",
        "求心",
        "整準",
        "視度調整",
        "視差",
        "器械高",
        "プリズム高",
        "後視点",
        "前視点",
        "方向付け",
        "水平角",
        "鉛直角",
        "斜距離",
        "点検観測",
        "再観測",
      ]),
    );
    expect(fifthLesson?.cautions).toHaveLength(6);
  });

  it("正しい後視と誤った後視から前視方位角を求めて正規化する", () => {
    const correctBacksight = backsightLearningSample.selections[0];
    const wrongBacksight = backsightLearningSample.selections[1];
    const correctForesightAzimuth = calculateForesightAzimuth(
      correctBacksight.knownAzimuthDegrees!,
      backsightLearningSample.observedHorizontalAngleDegrees,
    );
    const wrongForesightAzimuth = calculateForesightAzimuth(
      wrongBacksight.knownAzimuthDegrees!,
      backsightLearningSample.observedHorizontalAngleDegrees,
    );

    expect(correctForesightAzimuth).toBe(35);
    expect(wrongForesightAzimuth).toBe(15);
    expect(
      calculateSignedDirectionError(
        wrongForesightAzimuth,
        backsightLearningSample.correctForesightAzimuthDegrees,
      ),
    ).toBe(-20);
    expect(calculateForesightAzimuth(350, 30)).toBe(20);
  });

  it("斜距離と鉛直角から水平距離・視準線上高低差・測点間高低差を求める", () => {
    expect(calculateTsDerivedValues(100, 30, 1.5, 1.8)).toEqual({
      horizontalDistance: 86.6025,
      lineOfSightHeightDifference: 50,
      pointHeightDifference: 49.7,
    });
    expect(calculateTsDerivedValues(100, -30, 1.5, 1.8)).toEqual({
      horizontalDistance: 86.6025,
      lineOfSightHeightDifference: -50,
      pointHeightDifference: -50.3,
    });
  });

  it("器械高・プリズム高の入力ミスを測点間高低差へ反映する", () => {
    const impacts = heightInputScenarios.map((scenario) =>
      calculateHeightInputImpact(
        heightInputLearningModel.lineOfSightHeightDifference,
        heightInputLearningModel.correctInstrumentHeight,
        heightInputLearningModel.correctPrismHeight,
        scenario.inputInstrumentHeight,
        scenario.inputPrismHeight,
      ),
    );

    expect(impacts.map((impact) => impact.difference)).toEqual([
      0,
      0.15,
      -0.15,
      -0.15,
      0.15,
    ]);
    expect(impacts[0]).toMatchObject({
      correctPointHeightDifference: 1.7,
      inputPointHeightDifference: 1.7,
    });
  });

  it("TS観測計算へ不正値・非有限値・極端な鉛直角を取り込まない", () => {
    expect(() => calculateTsDerivedValues(0, 0, 1.5, 1.8)).toThrow(
      "斜距離は0より大きい値",
    );
    expect(() => calculateTsDerivedValues(50, 46, 1.5, 1.8)).toThrow(
      "鉛直角は学習用範囲",
    );
    expect(() => calculateTsDerivedValues(50, 0, 0, 1.8)).toThrow(
      "器械高とプリズム高",
    );
    expect(() => calculateTsDerivedValues(Number.NaN, 0, 1.5, 1.8)).toThrow(
      "斜距離は有限の数値",
    );
    expect(() =>
      calculateTsDerivedValues(50, Number.POSITIVE_INFINITY, 1.5, 1.8),
    ).toThrow("鉛直角は有限の数値");
    expect(() => calculateForesightAzimuth(320, 360)).toThrow(
      "右回り水平角は0度以上360度未満",
    );
  });

  it("据付10項目の正解順序と並べ替え判定を定義する", () => {
    const correctOrder = totalStationSetupSteps.map((step) => step.id);
    const initialEvaluation = evaluateSetupOrder(initialSetupStepOrder);
    const correctedOrder = moveSetupStep(
      initialSetupStepOrder,
      "precise-centering",
      "up",
    );

    expect(correctOrder).toEqual([
      "stabilize-tripod",
      "rough-centering",
      "mount-instrument",
      "precise-centering",
      "level-instrument",
      "recheck-centering",
      "adjust-diopter",
      "remove-parallax",
      "record-instrument-height",
      "orient-with-backsight",
    ]);
    expect(initialEvaluation).toMatchObject({
      isCorrect: false,
      firstMismatchIndex: 3,
    });
    expect(evaluateSetupOrder(correctedOrder)).toMatchObject({
      isCorrect: true,
      firstMismatchIndex: null,
    });
  });

  it("観測開始前11項目と点検6シナリオの必須データを持つ", () => {
    expect(observationChecklistItems).toHaveLength(11);
    expect(observationChecklistItems.map((item) => item.label)).toEqual(
      expect.arrayContaining([
        "三脚が安定している",
        "プリズム定数を確認した",
        "後視点名と座標を確認した",
        "気象条件や観測条件を記録した",
      ]),
    );
    expect(inspectionScenarios).toHaveLength(6);
    expect(new Set(inspectionScenarios.map((scenario) => scenario.decision))).toEqual(
      new Set([
        "そのまま採用",
        "条件を修正して再観測",
        "観測記録を訂正して再計算",
        "原因確認が必要",
      ]),
    );
    for (const scenario of inspectionScenarios) {
      expect(scenario.finding).not.toBe("");
      expect(scenario.reason).not.toBe("");
      expect(scenario.fieldAction).not.toBe("");
    }
  });

  it("第6章はPhase 4-2の安定ID・メタデータ・次章IDを持つ", () => {
    const sixthLesson = basicsLessons.find(
      (lesson) => lesson.id === "leveling-basics",
    );

    expect(sixthLesson).toMatchObject({
      id: "leveling-basics",
      title: "レベルと水準測量",
      learningGoal:
        "既知標高から後視・前視を使って新点標高を求める流れを説明できる。",
      nextLessonId: "observation-error",
      status: "available",
    });
    expect(sixthLesson?.terms).toEqual(
      expect.arrayContaining([
        "レベル",
        "標尺",
        "BM（Benchmark、水準点）",
        "後視",
        "前視",
        "器械高",
        "高低差",
        "転点",
        "TP",
        "往路",
        "復路",
        "閉合",
        "閉合差",
        "視準距離",
        "標尺の鉛直",
        "気泡",
        "自動補正",
        "視差",
      ]),
    );
    expect(sixthLesson?.cautions).toHaveLength(8);
  });

  it("器械高方式で器械高と新点標高を求める", () => {
    const instrumentHeight = calculateInstrumentHeight(100, 1.25);

    expect(instrumentHeight).toBe(101.25);
    expect(calculateElevationByInstrumentHeight(instrumentHeight, 0.875)).toBe(
      100.375,
    );
  });

  it("高低差方式で高低差と新点標高を求める", () => {
    const heightDifference = calculateLevelingHeightDifference(1.25, 0.875);

    expect(heightDifference).toBe(0.375);
    expect(calculateElevationByHeightDifference(100, heightDifference)).toBe(
      100.375,
    );
  });

  it("同じ後視・前視では器械高方式と高低差方式の新点標高が一致する", () => {
    const result = calculateSingleLevelingSetup(100, 1.25, 0.875);

    expect(result).toEqual({
      instrumentHeight: 101.25,
      heightDifference: 0.375,
      elevationByInstrumentHeight: 100.375,
      elevationByHeightDifference: 100.375,
    });
  });

  it("転点TP1を介して複数据付の標高を順次計算する", () => {
    const results = calculateSequentialLeveling(
      turningPointExamples.startElevation,
      turningPointExamples.withTurningPoint,
    );

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      backsightPoint: "BM",
      foresightPoint: "TP1",
      backsightPointElevation: 100,
      instrumentHeight: 101.345,
      foresightPointElevation: 100.33,
    });
    expect(results[1]).toMatchObject({
      backsightPoint: "TP1",
      foresightPoint: "新点P",
      backsightPointElevation: 100.33,
      instrumentHeight: 101.61,
      foresightPointElevation: 100.68,
    });
  });

  it("後視合計・前視合計から観測高低差と終点標高を求める", () => {
    const sample = levelingRouteSamples[0];
    const totals = calculateObservedHeightDifference(
      sample.outbound.map((setup) => setup.backsight),
      sample.outbound.map((setup) => setup.foresight),
    );
    const endElevation = calculateLevelingEndElevation(
      sample.knownStartElevation,
      totals.observedHeightDifference,
    );

    expect(totals).toEqual({
      backsightTotal: 2.627,
      foresightTotal: 1.377,
      observedHeightDifference: 1.25,
    });
    expect(endElevation).toBe(101.25);
    expect(
      calculateLevelingClosingError(endElevation, sample.knownEndElevation),
    ).toBe(0);
  });

  it("往路・復路の固定例から閉合差と往復閉合差を整合して求める", () => {
    const consistentSample = levelingRouteSamples[0];
    const consistentOutbound = summarizeLevelingRun(
      consistentSample.knownStartElevation,
      consistentSample.knownEndElevation,
      consistentSample.outbound,
    );
    const consistentReturn = summarizeLevelingRun(
      consistentSample.knownEndElevation,
      consistentSample.knownStartElevation,
      consistentSample.return,
    );
    const misclosureSample = levelingRouteSamples[1];
    const misclosureOutbound = summarizeLevelingRun(
      misclosureSample.knownStartElevation,
      misclosureSample.knownEndElevation,
      misclosureSample.outbound,
    );
    const misclosureReturn = summarizeLevelingRun(
      misclosureSample.knownEndElevation,
      misclosureSample.knownStartElevation,
      misclosureSample.return,
    );

    expect(consistentOutbound).toMatchObject({
      observedHeightDifference: 1.25,
      calculatedEndElevation: 101.25,
      closingError: 0,
    });
    expect(consistentReturn).toMatchObject({
      observedHeightDifference: -1.25,
      calculatedEndElevation: 100,
      closingError: 0,
    });
    expect(
      calculateRoundTripClosingError(
        consistentOutbound.observedHeightDifference,
        consistentReturn.observedHeightDifference,
      ),
    ).toBe(0);
    expect(misclosureOutbound).toMatchObject({
      observedHeightDifference: 1.254,
      calculatedEndElevation: 101.254,
      closingError: 0.004,
    });
    expect(misclosureReturn).toMatchObject({
      observedHeightDifference: -1.252,
      calculatedEndElevation: 99.998,
      closingError: -0.002,
    });
    expect(
      calculateRoundTripClosingError(
        misclosureOutbound.observedHeightDifference,
        misclosureReturn.observedHeightDifference,
      ),
    ).toBe(0.002);
  });

  it("固定往復サンプルの各据付・合計・既知終点が内部整合する", () => {
    for (const sample of levelingRouteSamples) {
      const outbound = summarizeLevelingRun(
        sample.knownStartElevation,
        sample.knownEndElevation,
        sample.outbound,
      );
      const returnRun = summarizeLevelingRun(
        sample.knownEndElevation,
        sample.knownStartElevation,
        sample.return,
      );

      expect(outbound.setups.at(-1)?.foresightPointElevation).toBe(
        outbound.calculatedEndElevation,
      );
      expect(returnRun.setups.at(-1)?.foresightPointElevation).toBe(
        returnRun.calculatedEndElevation,
      );
      expect(
        outbound.calculatedEndElevation - sample.knownEndElevation,
      ).toBeCloseTo(outbound.closingError, 9);
      expect(
        returnRun.calculatedEndElevation - sample.knownStartElevation,
      ).toBeCloseTo(returnRun.closingError, 9);
    }
  });

  it("標尺読定値0以下・非有限値・不整合な観測組を拒否する", () => {
    expect(() => calculateInstrumentHeight(100, 0)).toThrow(
      "後視は0より大きい標尺読定値",
    );
    expect(() => calculateElevationByInstrumentHeight(101, -0.1)).toThrow(
      "前視は0より大きい標尺読定値",
    );
    expect(() => calculateLevelingHeightDifference(Number.NaN, 1)).toThrow(
      "後視は有限の数値",
    );
    expect(() => calculateObservedHeightDifference([1], [1, 2])).toThrow(
      "同じ据付数",
    );
    expect(() => calculateSequentialLeveling(100, [])).toThrow(
      "1つ以上の据付",
    );
    expect(() => calculateSightDistanceDifference(0, 20)).toThrow(
      "0より大きい値",
    );
    expect(() =>
      calculateLevelingClosingError(Number.POSITIVE_INFINITY, 100),
    ).toThrow("終点計算標高は有限の数値");
  });

  it("第6章の用語説明・固定例・状態比較に必須データを持つ", () => {
    expect(levelingConcepts.map((concept) => concept.title)).toEqual([
      "レベルと標尺",
      "BM（Benchmark、水準点）",
      "後視と前視",
      "器械高と高低差",
      "転点（TP）",
      "往路・復路と閉合",
    ]);
    expect(levelingRouteSamples).toHaveLength(2);
    expect(staffConditions.map((condition) => condition.id)).toEqual([
      "vertical",
      "tilted",
    ]);
    expect(sightDistanceCases.map((item) => item.id)).toEqual([
      "balanced",
      "biased",
    ]);
    expect(levelConditions.map((condition) => condition.id)).toEqual([
      "normal",
      "bubble-out",
      "compensator-unstable",
      "parallax",
    ]);
    expect(levelingConcepts[1]?.description).toContain(
      "BMと水準点は別種類ではなく",
    );
    expect(staffConditions[1]?.impact).toContain("数値化しません");
    expect(sightDistanceCases[1]?.explanation).toContain(
      "標高誤差を推測計算しません",
    );
  });

  it("第7章はPhase 4-3の安定ID・メタデータ・次章IDを持つ", () => {
    const seventhLesson = basicsLessons.find(
      (lesson) => lesson.id === "observation-error",
    );

    expect(seventhLesson).toMatchObject({
      id: "observation-error",
      title: "観測誤差・精度・検査",
      learningGoal:
        "数値が表示されたことと、正しい成果であることは同じではないと説明できる。",
      nextLessonId: "coordinate-calculation",
      status: "available",
    });
    expect(seventhLesson?.terms).toEqual(
      expect.arrayContaining([
        "真値",
        "基準値",
        "観測値",
        "誤差",
        "正確さ",
        "精密さ",
        "偶然誤差",
        "系統誤差",
        "粗大誤差",
        "残差",
        "平均値",
        "最大最小差",
        "標本標準偏差",
        "誤差伝播",
        "閉合差",
        "許容値",
        "点検",
        "再観測",
      ]),
    );
    expect(seventhLesson?.cautions).toHaveLength(9);
  });

  it("正確さ・精密さの4パターンを内部整合する固定散布図で定義する", () => {
    expect(accuracyPrecisionPatterns.map((pattern) => pattern.id)).toEqual([
      "accurate-precise",
      "accurate-imprecise",
      "precise-inaccurate",
      "inaccurate-imprecise",
    ]);

    const summaries = accuracyPrecisionPatterns.map((pattern) =>
      calculateScatterSummary(
        pattern.observations,
        pattern.referencePosition,
      ),
    );

    expect(summaries[0]?.biasFromReference).toBeLessThan(
      summaries[2]?.biasFromReference ?? 0,
    );
    expect(summaries[0]?.rootMeanSquareSpread).toBeLessThan(
      summaries[1]?.rootMeanSquareSpread ?? 0,
    );
    for (const pattern of accuracyPrecisionPatterns) {
      expect(pattern.observations).toHaveLength(6);
      expect(pattern.explanation).not.toBe("");
      expect(pattern.likelyCause).not.toBe("");
      expect(
        pattern.observations.every(
          (point) => Math.abs(point.x) <= 10 && Math.abs(point.y) <= 10,
        ),
      ).toBe(true);
    }
  });

  it("平均・残差・最大最小差・残差平方和・標本標準偏差を丸めず求める", () => {
    const observations = [1, 2, 3];
    const statistics = calculateObservationStatistics(observations);

    expect(calculateMean(observations)).toBe(2);
    expect(calculateResiduals(observations)).toEqual([-1, 0, 1]);
    expect(calculateObservationRange(observations)).toEqual({
      maximum: 3,
      minimum: 1,
      range: 2,
    });
    expect(calculateResidualSquareSum(observations)).toBe(2);
    expect(calculateSampleStandardDeviation(observations)).toBe(1);
    expect(statistics.residuals.reduce((sum, value) => sum + value, 0)).toBeCloseTo(
      0,
      12,
    );
    expect(statistics.residualSquareSum).toBe(2);
  });

  it("標本標準偏差は1観測で計算せず、空配列と非有限値を拒否する", () => {
    expect(calculateSampleStandardDeviation([10])).toBeNull();
    expect(() => calculateMean([])).toThrow("1回以上の観測値");
    expect(() => calculateObservationStatistics([])).toThrow(
      "1回以上の観測値",
    );
    expect(() => calculateResiduals([1, Number.NaN])).toThrow(
      "観測値は有限の数値",
    );
    expect(() =>
      calculateSampleStandardDeviation([1, Number.POSITIVE_INFINITY]),
    ).toThrow("観測値は有限の数値");
  });

  it("偶然・系統・粗大誤差の固定例と適用関数を整合して持つ", () => {
    expect(errorScenarios.map((scenario) => scenario.id)).toEqual([
      "near-zero",
      "random",
      "systematic",
      "gross",
      "systematic-random",
    ]);
    const systematicScenario = errorScenarios.find(
      (scenario) => scenario.id === "systematic",
    )!;
    const grossScenario = errorScenarios.find(
      (scenario) => scenario.id === "gross",
    )!;

    expect(
      calculateBiasFromReference(
        systematicScenario.observations,
        systematicScenario.referenceValue,
      ),
    ).toBeCloseTo(0.02, 12);
    expect(
      calculateBiasFromReference(
        applySystematicBias([100, 100, 100], 0.02),
        100,
      ),
    ).toBeCloseTo(0.02, 12);
    expect(applyGrossError([100, 100, 100], 1, 0.05)).toEqual([
      100,
      100.05,
      100,
    ]);
    expect(Math.max(...grossScenario.observations)).toBe(100.052);
    expect(systematicScenario.repetitionEffect).toContain("偏りは残ります");
    expect(grossScenario.response).toContain("再観測");
  });

  it("GNSSアンテナ高の過大・過小入力で成果高が逆方向へずれる", () => {
    const highScenario = observationErrorHeightScenarios.find(
      (scenario) => scenario.id === "gnss-high",
    )!;
    const lowScenario = observationErrorHeightScenarios.find(
      (scenario) => scenario.id === "gnss-low",
    )!;
    const highImpact = calculateObservationHeightInputImpact(highScenario);
    const lowImpact = calculateObservationHeightInputImpact(lowScenario);

    expect(highImpact.resultDifference).toBeCloseTo(-0.15, 12);
    expect(highImpact.direction).toBe("負方向");
    expect(lowImpact.resultDifference).toBeCloseTo(0.15, 12);
    expect(lowImpact.direction).toBe("正方向");
  });

  it("TS器械高・プリズム高ミスを第5章と同じ符号規約で成果へ反映する", () => {
    const impactById = new Map(
      observationErrorHeightScenarios
        .filter((scenario) => scenario.model === "ts")
        .map((scenario) => [
          scenario.id,
          calculateObservationHeightInputImpact(scenario).resultDifference,
        ]),
    );

    expect(impactById.get("instrument-high")).toBeCloseTo(0.15, 12);
    expect(impactById.get("instrument-low")).toBeCloseTo(-0.15, 12);
    expect(impactById.get("prism-high")).toBeCloseTo(-0.15, 12);
    expect(impactById.get("prism-low")).toBeCloseTo(0.15, 12);
    expect(
      observationErrorHeightScenarios.find(
        (scenario) => scenario.id === "one-time-error",
      )?.classification,
    ).toBe("単発の粗大誤差");
  });

  it("独立2量の標準偏差を二乗和平方根で合成し境界値を扱う", () => {
    expect(combineIndependentStandardDeviations(3, 4)).toBe(5);
    expect(combineIndependentStandardDeviations(0, 0)).toBe(0);
    expect(combineIndependentStandardDeviations(0, 4)).toBe(4);
    expect(() => combineIndependentStandardDeviations(-1, 2)).toThrow(
      "標準偏差は0以上",
    );
    expect(() =>
      combineIndependentStandardDeviations(Number.NaN, 2),
    ).toThrow("観測量Aの標準偏差は有限の数値");
  });

  it("閉合差の絶対値を教材用許容値と等号を含めて比較する", () => {
    expect(evaluateClosingError(0.009, 0.01)).toMatchObject({
      absoluteClosingError: 0.009,
      withinTolerance: true,
    });
    expect(evaluateClosingError(-0.01, 0.01)).toMatchObject({
      absoluteClosingError: 0.01,
      withinTolerance: true,
    });
    expect(evaluateClosingError(-0.011, 0.01).withinTolerance).toBe(false);
    expect(() => evaluateClosingError(0.001, -0.01)).toThrow(
      "許容値は0以上",
    );
  });

  it("許容範囲内の異常と範囲外の再観測を含む判断シナリオを持つ", () => {
    expect(inspectionDecisionScenarios).toHaveLength(6);
    expect(
      inspectionDecisionScenarios.every(
        (scenario) => scenario.isEducationalTolerance,
      ),
    ).toBe(true);

    const residualScenario = inspectionDecisionScenarios.find(
      (scenario) => scenario.id === "within-large-residual",
    )!;
    const outsideScenario = inspectionDecisionScenarios.find(
      (scenario) => scenario.id === "outside-tolerance",
    )!;

    expect(
      evaluateClosingError(
        residualScenario.closingError,
        residualScenario.educationalTolerance,
      ).withinTolerance,
    ).toBe(true);
    expect(residualScenario.warningSigns.join(" ")).toContain("粗大誤差");
    expect(getRecommendedInspectionDecision(outsideScenario.id)).toMatchObject({
      decision: "原因を確認して再観測する",
    });
    for (const scenario of inspectionDecisionScenarios) {
      expect(scenario.finding).not.toBe("");
      expect(scenario.warningSigns.length).toBeGreaterThan(0);
      expect(scenario.reason).not.toBe("");
    }
  });

  it("第7章の用語説明データで真値と基準値、残差と閉合差を区別する", () => {
    expect(observationErrorConcepts).toHaveLength(6);
    expect(observationErrorConcepts[0]?.description).toContain(
      "真値は理論上の正しい値",
    );
    expect(observationErrorConcepts[0]?.description).toContain("基準値");
    expect(observationErrorConcepts[1]?.description).toContain("残差");
    expect(observationErrorConcepts[5]?.description).toContain("閉合差");
  });

  it("第8章はPhase 5-1の安定ID・メタデータ・次章IDを持つ", () => {
    const eighthLesson = basicsLessons.find(
      (lesson) => lesson.id === "coordinate-calculation",
    );

    expect(eighthLesson).toMatchObject({
      id: "coordinate-calculation",
      title: "座標計算と閉合トラバースへの橋渡し",
      learningGoal:
        "距離と方位角が、X・Y座標の変化へ分解されることを説明できる。",
      nextLessonId: "field-workflow",
      status: "available",
    });
    expect(eighthLesson?.terms).toEqual(
      expect.arrayContaining([
        "座標差",
        "距離",
        "方位角",
        "座標増分",
        "緯距",
        "経距",
        "正計算",
        "逆計算",
        "既知点",
        "新点",
        "閉合差",
        "閉合トラバース",
      ]),
    );
    expect(eighthLesson?.cautions).toHaveLength(7);
  });

  it("既知点・距離・方位角から座標増分と新点座標を正計算する", () => {
    const result = calculateForwardCoordinate(
      { x: 1_000, y: 500 },
      50,
      53.13010235415598,
    );

    expect(result.deltaX).toBeCloseTo(30, 12);
    expect(result.deltaY).toBeCloseTo(40, 12);
    expect(result.newPoint.x).toBeCloseTo(1_030, 12);
    expect(result.newPoint.y).toBeCloseTo(540, 12);
    expect(result.azimuthDegrees).toBeGreaterThanOrEqual(0);
    expect(result.azimuthDegrees).toBeLessThan(360);
    expect(() =>
      calculateForwardCoordinate({ x: 0, y: 0 }, -1, 45),
    ).toThrow(RangeError);
    expect(() =>
      calculateForwardCoordinate(
        { x: Number.NaN, y: 0 },
        10,
        45,
      ),
    ).toThrow(TypeError);
  });

  it("北・東・南・西と各象限、同一点の方向表示を定義する", () => {
    expect(inverseDirectionPresets.map((preset) => preset.label)).toEqual([
      "北",
      "北東",
      "東",
      "南東",
      "南",
      "南西",
      "西",
      "北西",
      "同一点",
    ]);
    expect(describeSurveyDirection(0)).toBe("北");
    expect(describeSurveyDirection(45)).toBe("北東");
    expect(describeSurveyDirection(90)).toBe("東");
    expect(describeSurveyDirection(135)).toBe("南東");
    expect(describeSurveyDirection(180)).toBe("南");
    expect(describeSurveyDirection(225)).toBe("南西");
    expect(describeSurveyDirection(270)).toBe("西");
    expect(describeSurveyDirection(315)).toBe("北西");
    expect(describeSurveyDirection(null)).toBe("同一点（方向なし）");
  });

  it("複数辺の座標増分を累積し、fx・fyと計算終点を整合して持つ", () => {
    const lastCoordinate = closureBridgeSample.coordinates.at(-1)!;

    expect(closureBridgeSample.legs).toHaveLength(4);
    expect(closureBridgeSample.coordinates).toHaveLength(5);
    expect(closureBridgeSample.closure.fx).toBeCloseTo(0.2, 12);
    expect(closureBridgeSample.closure.fy).toBeCloseTo(0.4, 12);
    expect(closureBridgeSample.closure.linearClosure).toBeCloseTo(
      Math.hypot(0.2, 0.4),
      12,
    );
    expect(lastCoordinate.x).toBeCloseTo(
      closureBridgeSample.startPoint.x + closureBridgeSample.closure.fx,
      12,
    );
    expect(lastCoordinate.y).toBeCloseTo(
      closureBridgeSample.startPoint.y + closureBridgeSample.closure.fy,
      12,
    );
    expect(coordinateCalculationConcepts.at(-1)?.description).toContain(
      "閉合差",
    );
  });

  it("第9章だけを準備中のまま維持する", () => {
    expect(
      basicsLessons
        .filter((lesson) => lesson.status === "coming-soon")
        .map((lesson) => lesson.id),
    ).toEqual(["field-workflow"]);
  });
});
