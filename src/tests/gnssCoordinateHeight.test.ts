import { describe, expect, it } from "vitest";
import {
  gnssCoordinateHeightLesson,
  gnssLessons,
  gnssObservationsLesson,
  gnssOverviewLesson,
} from "../components/gnss/gnssCourse";
import {
  calculateGnssElevation,
  calculateGnssPointHeightFromAntenna,
  convertGeodeticToGrs80Ecef,
  evaluateGnssCoordinateHeightQuizAnswer,
  getGnssCoordinateHeightQuizOptionLetter,
  getGnssCoordinateHeightQuizQuestion,
  getGnssEarthPositionPreset,
  gnssAntennaHeightExample,
  gnssCoordinateHeightCards,
  gnssCoordinateHeightQuizQuestions,
  gnssCoordinateHeightSampleG0,
  gnssDatumRelationship,
  gnssEarthPositionPresets,
  gnssEpochReference,
  gnssFieldScenarioP1,
  gnssFinalIssueCases,
  gnssFinalQualityChecks,
  gnssHeightReferenceExplanation,
  gnssVirtualEpochPointT1,
  GRS80_INVERSE_FLATTENING,
  GRS80_SEMI_MAJOR_AXIS_METERS,
} from "../components/gnss/data/gnssCoordinateHeight";

describe("GNSS測量 Phase 3 第3章", () => {
  it("第1章・第2章IDと第3章メタデータを維持する", () => {
    expect(gnssOverviewLesson.id).toBe("gnss-overview");
    expect(gnssObservationsLesson.id).toBe("gnss-observations");
    expect(gnssCoordinateHeightLesson).toMatchObject({
      id: "gnss-coordinate-height",
      number: 3,
      title: "GNSSの座標と高さ",
      learningGoal:
        "GNSSで求めた3次元位置が、緯度・経度・楕円体高、平面直角座標、標高へどのようにつながるかを説明し、成果を使用するときに確認すべき測地系・系番号・座標の時点・高さ基準を判断できる。",
    });
    expect(gnssLessons.map((lesson) => lesson.id)).toEqual([
      "gnss-overview",
      "gnss-observations",
      "gnss-coordinate-height",
      "gnss-positioning-methods",
    ]);
    expect(gnssLessons).toHaveLength(4);
    expect(gnssLessons.every((lesson) => lesson.number <= 4)).toBe(true);
  });

  it("10カードを安定IDと指定順で定義する", () => {
    expect(gnssCoordinateHeightCards.map((card) => card.id)).toEqual([
      "position-to-result",
      "earth-centered-position",
      "geodetic-representation",
      "plane-rectangular-coordinate",
      "coordinate-datum",
      "coordinate-epoch",
      "height-reference",
      "height-conversion",
      "antenna-and-point",
      "fix-quality-check",
    ]);
    expect(gnssCoordinateHeightCards.map((card) => card.title)).toEqual([
      "GNSSで求めた位置は、どう成果になる？",
      "地球を基準にした3次元位置",
      "同じ位置を緯度・経度・楕円体高で表す",
      "緯度・経度を平面直角座標へ",
      "その座標は何を基準にしている？",
      "その座標は「いつ」の位置？",
      "GNSSの高さは、なぜ標高ではない？",
      "楕円体高から標高へ",
      "アンテナ位置と測点位置",
      "FIXなのに成果が違う",
    ]);
  });

  it("カード5～10の中心概念をデータで明示する", () => {
    expect(gnssCoordinateHeightCards[4].focus).toContain("JGD2024");
    expect(gnssCoordinateHeightCards[5].focus).toContain("元期・今期");
    expect(gnssCoordinateHeightCards[6].focus).toContain("楕円体高");
    expect(gnssCoordinateHeightCards[7].focus).toContain("ジオイド");
    expect(gnssCoordinateHeightCards[8].focus).toContain("アンテナ高");
    expect(gnssCoordinateHeightCards[9].focus).toContain("FIX後");
  });

  it("基準サンプルG0の水平位置・高さ・出典区分を保持する", () => {
    expect(gnssCoordinateHeightSampleG0).toMatchObject({
      name: "基準サンプル G0",
      latitude: {
        dms: "35°39′29.1572″ N",
        sourceKind: "公式公表値",
      },
      longitude: {
        dms: "139°44′28.8869″ E",
        sourceKind: "公式公表値",
      },
      datum: {
        shortName: "JGD2024",
        referenceEllipsoid: "GRS80",
      },
      planeCoordinate: {
        systemName: "第IX系",
        zoneNumber: 9,
        x: -37928.1965,
        y: -8327.6987,
        sourceKind: "確認済み換算値",
      },
      height: {
        ellipsoidHeight: 63.3853,
        geoidHeight: 36.7053,
        heightReferenceConversion: 0,
        elevation: 26.68,
        geoidModel: "ジオイド2024日本とその周辺",
        sourceKind: "教材値",
      },
    });
    expect(gnssCoordinateHeightSampleG0.latitude.decimalDegrees).toBeCloseTo(
      35.6580992222,
      10,
    );
    expect(gnssCoordinateHeightSampleG0.longitude.decimalDegrees).toBeCloseTo(
      139.7413574722,
      10,
    );
  });

  it("GRS80固定定数でG0を地心直交座標へ変換する", () => {
    expect(GRS80_SEMI_MAJOR_AXIS_METERS).toBe(6_378_137);
    expect(GRS80_INVERSE_FLATTENING).toBe(298.257222101);

    const coordinate = convertGeodeticToGrs80Ecef(
      gnssCoordinateHeightSampleG0.latitude.decimalDegrees,
      gnssCoordinateHeightSampleG0.longitude.decimalDegrees,
      gnssCoordinateHeightSampleG0.height.ellipsoidHeight,
    );

    expect(coordinate?.xc).toBeCloseTo(
      gnssCoordinateHeightSampleG0.earthCenteredCoordinate.xc,
      3,
    );
    expect(coordinate?.yc).toBeCloseTo(
      gnssCoordinateHeightSampleG0.earthCenteredCoordinate.yc,
      3,
    );
    expect(coordinate?.zc).toBeCloseTo(
      gnssCoordinateHeightSampleG0.earthCenteredCoordinate.zc,
      3,
    );
    expect(gnssCoordinateHeightSampleG0.earthCenteredCoordinate.sourceKind).toBe(
      "教材派生値",
    );
  });

  it("地心直交座標変換は非有限値と範囲外角度を安全に拒否する", () => {
    expect(convertGeodeticToGrs80Ecef(Number.NaN, 139, 0)).toBeNull();
    expect(convertGeodeticToGrs80Ecef(35, Number.POSITIVE_INFINITY, 0)).toBeNull();
    expect(convertGeodeticToGrs80Ecef(35, 139, Number.NaN)).toBeNull();
    expect(convertGeodeticToGrs80Ecef(91, 139, 0)).toBeNull();
    expect(convertGeodeticToGrs80Ecef(35, 181, 0)).toBeNull();
  });

  it("日本・赤道・北極寄りの3模式位置を安全に取得する", () => {
    expect(gnssEarthPositionPresets.map((preset) => preset.id)).toEqual([
      "japan",
      "equator",
      "north",
    ]);
    expect(getGnssEarthPositionPreset("japan")?.coordinate).toMatchObject({
      xc: expect.any(Number),
      yc: expect.any(Number),
      zc: expect.any(Number),
    });
    expect(getGnssEarthPositionPreset("unknown")).toBeNull();
  });

  it("JGD2024・GRS80・WGS84の関係を同一視せず説明する", () => {
    expect(gnssDatumRelationship.flow).toEqual([
      "ITRF",
      "JGD2024",
      "GRS80楕円体",
    ]);
    expect(gnssDatumRelationship.jgd2024).toContain("現在の測地系");
    expect(gnssDatumRelationship.succession).toContain("引き継がれている");
    expect(gnssDatumRelationship.wgs84).toContain("名称・役割・定義が同じものではない");
  });

  it("元期・今期の定義、実際の基準日例、T1仮想変位を分離する", () => {
    expect(gnssEpochReference.originalEpochDefinition).toBe(
      "公表成果の基準となる時点",
    );
    expect(gnssEpochReference.currentEpochDefinition).toBe(
      "実際に観測した時点",
    );
    expect(gnssEpochReference.horizontalExample.referenceDate).toBe(
      "2011年5月24日",
    );
    expect(gnssEpochReference.elevationExample.referenceDate).toBe(
      "2024年6月1日",
    );
    expect(gnssEpochReference.jgd2024Caution).toContain("≠");
    expect(gnssVirtualEpochPointT1).toMatchObject({
      originalEpoch: { x: 1000, y: 1000 },
      currentEpoch: { x: 1000.035, y: 999.982 },
      difference: { x: 0.035, y: -0.018 },
      sourceKind: "仮想値",
    });
    expect(gnssVirtualEpochPointT1.note).toContain("実在地点の変動量ではありません");
  });

  it("楕円体高から標高を計算し、不正値を安全に拒否する", () => {
    expect(calculateGnssElevation(63.3853, 36.7053, 0)).toBeCloseTo(
      26.68,
      10,
    );
    expect(calculateGnssElevation(Number.NaN, 36.7053, 0)).toBeNull();
    expect(
      calculateGnssElevation(63.3853, Number.POSITIVE_INFINITY, 0),
    ).toBeNull();
    expect(calculateGnssElevation(63.3853, 36.7053, Number.NaN)).toBeNull();
    expect(gnssHeightReferenceExplanation.geoid).toContain("重力を考慮");
    expect(gnssHeightReferenceExplanation.geoidHeight).toContain(
      "P1の高さそのものではなく",
    );
  });

  it("第1章P1値を維持し、アンテナ高10cm誤入力を高さ差へ反映する", () => {
    expect(gnssFieldScenarioP1).toMatchObject({
      knownPoint: {
        name: "A",
        x: 1000,
        y: 1000,
        elevation: 50,
        antennaHeight: 1.8,
      },
      newPoint: {
        name: "P1",
        x: 1012.345,
        y: 1008.765,
        elevation: 49.832,
        antennaHeight: 2,
      },
    });
    expect(
      calculateGnssPointHeightFromAntenna(
        gnssAntennaHeightExample.antennaPositionHeight,
        2,
      ),
    ).toBeCloseTo(49.832, 12);
    expect(
      calculateGnssPointHeightFromAntenna(
        gnssAntennaHeightExample.antennaPositionHeight,
        2.1,
      ),
    ).toBeCloseTo(49.732, 12);
    expect(
      calculateGnssPointHeightFromAntenna(Number.NaN, 2),
    ).toBeNull();
    expect(
      calculateGnssPointHeightFromAntenna(51.832, Number.POSITIVE_INFINITY),
    ).toBeNull();
  });

  it("FIX後の5ケースと6成果条件を持つ", () => {
    expect(gnssFinalIssueCases.map((issueCase) => issueCase.id)).toEqual([
      "wrong-plane-zone",
      "epoch-unchecked",
      "ellipsoid-as-elevation",
      "geoid-unchecked",
      "wrong-antenna-height",
    ]);
    expect(gnssFinalIssueCases.every((issueCase) => issueCase.message.length > 0)).toBe(
      true,
    );
    expect(gnssFinalQualityChecks.map((check) => check.id)).toEqual([
      "datum",
      "plane-zone",
      "coordinate-epoch",
      "height-type",
      "geoid-model",
      "antenna-height",
    ]);
  });

  it("確認問題8問を安定IDと分散した正答文字で定義する", () => {
    expect(gnssCoordinateHeightQuizQuestions.map((question) => question.id)).toEqual([
      "gnss-coordinate-height-q01-same-position",
      "gnss-coordinate-height-q02-plane-system",
      "gnss-coordinate-height-q03-jgd2024",
      "gnss-coordinate-height-q04-epoch",
      "gnss-coordinate-height-q05-height-conversion",
      "gnss-coordinate-height-q06-height-type",
      "gnss-coordinate-height-q07-antenna-height",
      "gnss-coordinate-height-q08-final-quality-check",
    ]);
    expect(
      gnssCoordinateHeightQuizQuestions.map((question) =>
        getGnssCoordinateHeightQuizOptionLetter(
          question.id,
          question.correctOptionId,
        ),
      ),
    ).toEqual(["B", "C", "A", "D", "B", "C", "A", "D"]);
  });

  it("全問題の選択肢IDを一意にし、全選択肢を個別理由付きで判定する", () => {
    expect(gnssCoordinateHeightQuizQuestions).toHaveLength(8);
    expect(
      new Set(gnssCoordinateHeightQuizQuestions.map((question) => question.id)).size,
    ).toBe(8);

    for (const question of gnssCoordinateHeightQuizQuestions) {
      const optionIds = question.options.map((option) => option.id);

      expect(question.options).toHaveLength(4);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      expect(optionIds).toContain(question.correctOptionId);
      expect(question.correctOptionId).not.toMatch(/^[A-D]$/);
      expect(question.correctReason.trim()).not.toBe("");
      expect(question.fieldCheck.trim()).not.toBe("");

      for (const option of question.options) {
        const evaluation = evaluateGnssCoordinateHeightQuizAnswer(
          question.id,
          option.id,
        );

        expect(evaluation?.correctOptionId).toBe(question.correctOptionId);
        expect(evaluation?.correctReason).toBe(question.correctReason);
        expect(evaluation?.fieldCheck).toBe(question.fieldCheck);

        if (option.id === question.correctOptionId) {
          expect(option.incorrectReason).toBeNull();
          expect(evaluation).toMatchObject({
            isCorrect: true,
            selectedAnswerReason: null,
          });
        } else {
          expect(option.incorrectReason?.trim()).not.toBe("");
          expect(evaluation).toMatchObject({
            isCorrect: false,
            selectedAnswerReason: option.incorrectReason,
          });
        }
      }
    }
  });

  it("未知問題ID・未知選択肢IDを安全に拒否する", () => {
    expect(getGnssCoordinateHeightQuizQuestion("unknown")).toBeNull();
    expect(
      getGnssCoordinateHeightQuizOptionLetter("unknown", "unknown"),
    ).toBeNull();
    expect(
      getGnssCoordinateHeightQuizOptionLetter(
        "gnss-coordinate-height-q01-same-position",
        "unknown",
      ),
    ).toBeNull();
    expect(
      evaluateGnssCoordinateHeightQuizAnswer("unknown", "unknown"),
    ).toBeNull();
    expect(
      evaluateGnssCoordinateHeightQuizAnswer(
        "gnss-coordinate-height-q01-same-position",
        "unknown",
      ),
    ).toBeNull();
  });
});
