import { describe, expect, it } from "vitest";
import {
  gnssCoordinateHeightLesson,
  gnssLessons,
  gnssObservationsLesson,
  gnssOverviewLesson,
  gnssPositioningMethodsLesson,
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
  gnssAntennaPointRelationship,
  gnssCoordinateHeightCards,
  gnssCoordinateHeightQuizQuestions,
  gnssCoordinateHeightSampleG0,
  gnssDatumRelationship,
  gnssEarthCenteredExplanation,
  gnssEarthPositionPresets,
  gnssEpochReference,
  gnssFieldScenarioP1,
  gnssFinalReviewRows,
  gnssHeightReferenceExplanation,
  gnssPlaneCoordinateExplanation,
  gnssVirtualEpochPointT1,
  GRS80_INVERSE_FLATTENING,
  GRS80_SEMI_MAJOR_AXIS_METERS,
} from "../components/gnss/data/gnssCoordinateHeight";

describe("GNSS測量 Phase 3 第3章", () => {
  it("第1章・第2章IDと第3章メタデータを維持する", () => {
    expect(gnssOverviewLesson.id).toBe("gnss-overview");
    expect(gnssObservationsLesson.id).toBe("gnss-observations");
    expect(gnssPositioningMethodsLesson.id).toBe("gnss-positioning-methods");
    expect(gnssCoordinateHeightLesson).toMatchObject({
      id: "gnss-coordinate-height",
      number: 3,
      title: "GNSSの座標と高さ",
      learningGoal:
        "GNSSで求めた3次元位置が、緯度・経度・楕円体高、平面直角座標、標高へどのようにつながるかを説明し、成果を使用するときに確認すべき測地系・系番号・座標の時点・高さ基準を判断できる。",
    });
    expect(gnssLessons.slice(0, 4).map((lesson) => lesson.id)).toEqual([
      "gnss-overview",
      "gnss-observations",
      "gnss-coordinate-height",
      "gnss-positioning-methods",
    ]);
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

  it("日本付近の基準サンプルの水平位置・高さ・出典区分を保持する", () => {
    expect(gnssCoordinateHeightSampleG0).toMatchObject({
      name: "日本付近の基準サンプル",
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

  it("日本・赤道・北極寄りの3模式位置と地心原点の説明を定義する", () => {
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
    expect(getGnssEarthPositionPreset("japan")?.label).not.toContain("G0");
    expect(getGnssEarthPositionPreset("japan")?.locationHint).toBe(
      "緯度 約36°N / 経度 約140°E",
    );
    expect(getGnssEarthPositionPreset("equator")?.locationHint).toBe(
      "緯度 約0°",
    );
    expect(getGnssEarthPositionPreset("north")).toMatchObject({
      latitudeDegrees: 80,
      locationHint: "緯度 約80°N / 北極は90°N",
    });
    expect(gnssEarthCenteredExplanation).toMatchObject({
      origin: "地球の重心（地球中心）",
      zPositiveDirection: "Z軸の正方向が北極方向",
    });
    expect(gnssEarthCenteredExplanation.notation).toContain("教材上の表記");
    expect(gnssEarthCenteredExplanation.notation).toContain("唯一の公式");
    expect(getGnssEarthPositionPreset("unknown")).toBeNull();
  });

  it("IX系の原点・軸方向と南西側の固定座標を明示する", () => {
    expect(gnssPlaneCoordinateExplanation.origin).toContain(
      "緯度36°、経度139°50′",
    );
    expect(gnssPlaneCoordinateExplanation.origin).toContain("X=0 m、Y=0 m");
    expect(gnssPlaneCoordinateExplanation.xAxis).toBe(
      "X軸は北が正、南が負です。",
    );
    expect(gnssPlaneCoordinateExplanation.yAxis).toBe(
      "Y軸は東が正、西が負です。",
    );
    expect(gnssPlaneCoordinateExplanation.sample).toContain("X<0、Y<0");
    expect(gnssCoordinateHeightSampleG0.planeCoordinate).toMatchObject({
      x: -37928.1965,
      y: -8327.6987,
    });
  });

  it("JGD2024・GRS80・WGS84の関係を同一視せず説明する", () => {
    expect(gnssDatumRelationship.flow).toEqual([
      "ITRF（世界規模の基準枠）",
      "JGD2024（日本の測地基準）",
      "測量成果",
    ]);
    expect(gnssDatumRelationship.itrf).toContain("基準枠");
    expect(gnssDatumRelationship.jgd2024).toContain("測地基準");
    expect(gnssDatumRelationship.grs80).toContain("準拠楕円体");
    expect(gnssDatumRelationship.conceptNote).toContain("同じ概念の別名ではありません");
    expect(gnssDatumRelationship.succession).toContain("引き継がれている");
    expect(gnssDatumRelationship.wgs84).toContain("同じ測地系ではない");
  });

  it("元期・今期の定義、実際の基準日例、T1仮想変位を分離する", () => {
    expect(gnssEpochReference.originalEpochDefinition).toBe(
      "成果基準時点（公表成果の基準となる時点）",
    );
    expect(gnssEpochReference.currentEpochDefinition).toBe(
      "観測時点（実際に観測した時点）",
    );
    expect(gnssEpochReference.horizontalExample.referenceDate).toBe(
      "2011年5月24日",
    );
    expect(gnssEpochReference.elevationExample.referenceDate).toBe(
      "2024年6月1日",
    );
    expect(gnssEpochReference.jgd2024Caution).toContain(
      "JGD2011が元期、JGD2024が今期という意味ではありません",
    );
    expect(gnssEpochReference.alignmentPurpose).toContain("地面は実際に動く");
    expect(gnssEpochReference.alignmentPurpose).toContain("国家座標");
    expect(gnssEpochReference.applicabilityNote).toContain("常に同じ補正");
    expect(gnssEpochReference.movementAndCorrectionNote).toContain("符号も逆");
    expect(gnssVirtualEpochPointT1).toMatchObject({
      originalEpoch: { x: 1000, y: 1000 },
      currentEpoch: { x: 1000.035, y: 999.982 },
      difference: { x: 0.035, y: -0.018 },
      correctionToOriginal: { x: -0.035, y: 0.018 },
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
    expect(gnssAntennaPointRelationship.map((step) => step.label)).toEqual([
      "アンテナ基準点の位置",
      "アンテナ高 2.000 m",
      "地上の測点 P1",
    ]);
  });

  it("FIX後に確認する9項目を静的な表データで持つ", () => {
    expect(gnssFinalReviewRows.map((row) => row.id)).toEqual([
      "datum",
      "plane-zone",
      "coordinate-epoch",
      "height-type",
      "height-basis",
      "antenna-height",
      "base-coordinate",
      "known-point",
      "environment",
    ]);
    expect(gnssFinalReviewRows).toHaveLength(9);
    expect(gnssFinalReviewRows[2]?.label).toBe("座標の時点");
    expect(gnssFinalReviewRows.every((row) => row.check.length > 0)).toBe(true);
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
    ).toEqual(["C", "D", "A", "D", "B", "C", "A", "D"]);

    expect(gnssCoordinateHeightQuizQuestions[0]).toMatchObject({
      id: "gnss-coordinate-height-q01-same-position",
      correctOptionId: "earth-center-origin",
      options: [
        {
          label: "北極",
          incorrectReason: expect.stringContaining("原点ではありません"),
        },
        { label: "日本経緯度原点" },
        { label: "地球の重心（地球中心）", incorrectReason: null },
        { label: "赤道と日本の経度が交わる地点" },
      ],
    });
    expect(gnssCoordinateHeightQuizQuestions[1]).toMatchObject({
      id: "gnss-coordinate-height-q02-plane-system",
      correctOptionId: "south-west-negative",
      correctReason: expect.stringContaining("X軸は北が正、Y軸は東が正"),
      options: [
        { label: "X>0、Y>0" },
        { label: "X>0、Y<0" },
        { label: "X<0、Y>0" },
        { label: "X<0、Y<0" },
      ],
    });
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
