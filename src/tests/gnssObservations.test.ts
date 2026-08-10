import { describe, expect, it } from "vitest";
import {
  gnssLessons,
  gnssObservationsLesson,
  gnssOverviewLesson,
} from "../components/gnss/gnssCourse";
import {
  calculateClockOffsetDistanceMeters,
  calculateSignalDistanceKm,
  calculateWavelengthRatio,
  countGnssFrequencies,
  createCarrierPhaseExample,
  evaluateGnssObservationsQuizAnswer,
  getGnssFrequencyBand,
  getGnssFrequencySelection,
  getGnssObservationsQuizOptionLetter,
  getGnssObservationsQuizQuestion,
  getGnssSystemDefinition,
  GNSS_CLOCK_OFFSET_EXAMPLE_DISTANCE_METERS,
  GNSS_FRACTIONAL_PHASE,
  GNSS_GEOMETRIC_DISTANCE_KM,
  GNSS_L1_WAVELENGTH_CM,
  GNSS_MODELED_INTEGER_WAVELENGTHS,
  GNSS_PSEUDORANGE_EXAMPLE_KM,
  gnssFrequencyBands,
  gnssFrequencyCharacteristics,
  gnssFrequencySelections,
  gnssFourSatelliteClarification,
  gnssGlobalSystemDefinitions,
  gnssIntegerWavelengthCandidates,
  gnssIntegerResolutionFlow,
  gnssNavicNote,
  gnssObservationComparisonRows,
  gnssObservationConceptFlow,
  gnssObservationsQuizQuestions,
  gnssPseudorangeInfluences,
  gnssQzssSystemDefinition,
  gnssSatelliteSignalFlow,
  gnssSystemDefinitions,
  gnssSystemStartYearCaution,
  summarizeGnssSystemSelection,
} from "../components/gnss/data/gnssObservations";

describe("GNSS測量 Phase 2 第2章", () => {
  it("第1章と第2章のID・メタデータを維持する", () => {
    expect(gnssOverviewLesson.id).toBe("gnss-overview");
    expect(gnssObservationsLesson).toMatchObject({
      id: "gnss-observations",
      number: 2,
      title: "GNSSは何を観測しているのか",
      learningGoal:
        "GNSS受信機が衛星から座標そのものを受け取るのではなく、電波を観測して衛星までの距離に関係する情報を求め、その観測から位置を計算していることを説明できる。",
    });
    expect(gnssLessons.slice(0, 4).map((lesson) => lesson.id)).toEqual([
      "gnss-overview",
      "gnss-observations",
      "gnss-coordinate-height",
      "gnss-positioning-methods",
    ]);
  });

  it("衛星から位置計算までの7段階を指定順で持つ", () => {
    expect(gnssObservationConceptFlow).toEqual([
      "衛星",
      "信号",
      "コード観測・搬送波観測",
      "擬似距離・搬送波位相",
      "複数周波数",
      "複数GNSS",
      "位置計算",
    ]);
  });

  it("衛星から受信機への一方向の測位信号を4段階で整理する", () => {
    expect(gnssSatelliteSignalFlow).toEqual([
      "GNSS衛星",
      "測位用の信号を継続的に送信",
      "GNSS受信機",
      "受信した信号を観測して位置を計算",
    ]);
  });

  it("70msを約21,000km、1msを約300kmへ換算する", () => {
    expect(calculateSignalDistanceKm(70)).toBeCloseTo(21_000, 9);
    expect(calculateSignalDistanceKm(1)).toBeCloseTo(300, 9);
    expect(calculateSignalDistanceKm(65)).toBeCloseTo(19_500, 9);
    expect(calculateSignalDistanceKm(85)).toBeCloseTo(25_500, 9);
  });

  it("1μsの時計ずれを約300mへ換算する", () => {
    expect(calculateClockOffsetDistanceMeters(0)).toBe(0);
    expect(calculateClockOffsetDistanceMeters(1)).toBe(300);
  });

  it("21,000.300km全体を時計ずれ等の影響を含む擬似距離例とする", () => {
    expect(GNSS_GEOMETRIC_DISTANCE_KM).toBe(21_000);
    expect(GNSS_CLOCK_OFFSET_EXAMPLE_DISTANCE_METERS).toBe(300);
    expect(GNSS_PSEUDORANGE_EXAMPLE_KM).toBeCloseTo(21_000.3, 9);
    expect(GNSS_PSEUDORANGE_EXAMPLE_KM - GNSS_GEOMETRIC_DISTANCE_KM).toBeCloseTo(
      0.3,
      9,
    );
  });

  it("約5cmをL1約19cmの約0.26波長として計算する", () => {
    expect(GNSS_L1_WAVELENGTH_CM).toBe(19);
    expect(calculateWavelengthRatio(5)).toBeCloseTo(0.26, 2);
    expect(calculateWavelengthRatio(9.5)).toBeCloseTo(0.5, 12);
    expect(calculateWavelengthRatio(19)).toBe(1);
  });

  it("整数部分を変えても小数位相0.35を維持する", () => {
    const examples = gnssIntegerWavelengthCandidates.map((integerValue) =>
      createCarrierPhaseExample(integerValue),
    );

    expect(examples.map((example) => example?.integerWavelengths)).toEqual([
      10, 11, 12, 13,
    ]);
    expect(examples.map((example) => example?.fractionalWavelengths)).toEqual([
      GNSS_FRACTIONAL_PHASE,
      GNSS_FRACTIONAL_PHASE,
      GNSS_FRACTIONAL_PHASE,
      GNSS_FRACTIONAL_PHASE,
    ]);
    expect(examples.map((example) => example?.totalWavelengths)).toEqual([
      10.35, 11.35, 12.35, 13.35,
    ]);
  });

  it("整数候補を解析してFLOATからFIXへ進む流れと4衛星の役割を区別する", () => {
    expect(GNSS_MODELED_INTEGER_WAVELENGTHS).toBe(12);
    expect(gnssIntegerResolutionFlow.map((step) => step.label)).toEqual([
      "複数衛星を観測",
      "擬似距離などから概略位置を求める",
      "搬送波位相を比較・解析",
      "整数波長数の候補を絞る",
      "FLOAT",
      "複数の観測結果の整合性を確認",
      "FIX",
    ]);
    expect(
      gnssIntegerResolutionFlow.find((step) => step.id === "float")
        ?.description,
    ).toBe("整数アンビギュイティを整数としてまだ確定できていない状態");
    expect(
      gnssIntegerResolutionFlow.find((step) => step.id === "fix")
        ?.description,
    ).toBe("整数アンビギュイティを整数値として固定解にできた状態");
    expect(gnssFourSatelliteClarification.reason).toContain(
      "X・Y・Zと受信機時計ずれの4未知量",
    );
    expect(gnssFourSatelliteClarification.notMeaning).toContain(
      "4機あれば整数アンビギュイティが決定できる",
    );
  });

  it("指定した組合せを1周波・2周波・3周波として判定する", () => {
    const frequencyCounts = Object.fromEntries(
      gnssFrequencySelections.map((selection) => [
        selection.id,
        countGnssFrequencies(selection.frequencyIds),
      ]),
    );

    expect(frequencyCounts).toEqual({
      "l1-only": 1,
      "l1-l2": 2,
      "l1-l5": 2,
      "l1-l2-l5": 3,
    });
  });

  it("L1・L2・L5の補助周波数値とコード・搬送波の両観測を保持する", () => {
    expect(gnssFrequencyBands).toEqual([
      { id: "l1", label: "L1", megahertz: 1575.42 },
      { id: "l2", label: "L2", megahertz: 1227.6 },
      { id: "l5", label: "L5", megahertz: 1176.45 },
    ]);
    expect(gnssObservationComparisonRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          item: "観測",
          code: "コードの到達タイミング",
          carrier: "搬送波の位相",
        }),
      ]),
    );
    expect(gnssFrequencyCharacteristics).toEqual([
      expect.objectContaining({
        id: "l2",
        description: expect.stringContaining("従来から高精度な2周波GNSS"),
      }),
      expect.objectContaining({
        id: "l5",
        description: expect.stringContaining("高い送信電力と広い帯域"),
      }),
    ]);
  });

  it("GPSのみをsingle GNSS、GPSとQZSS等をmulti GNSSと判定する", () => {
    expect(summarizeGnssSystemSelection(["gps"], "open")).toEqual({
      systemCount: 1,
      satelliteCount: 6,
      mode: "single GNSS",
    });
    expect(
      summarizeGnssSystemSelection(["gps", "qzss"], "open"),
    ).toEqual({
      systemCount: 2,
      satelliteCount: 8,
      mode: "multi GNSS",
    });
  });

  it("山地・森林では同じ選択でも利用可能候補が減る固定教材例を持つ", () => {
    expect(
      summarizeGnssSystemSelection(
        ["gps", "glonass", "galileo", "beidou", "qzss"],
        "open",
      )?.satelliteCount,
    ).toBe(22);
    expect(
      summarizeGnssSystemSelection(
        ["gps", "glonass", "galileo", "beidou", "qzss"],
        "mountain-forest",
      )?.satelliteCount,
    ).toBe(10);
    expect(gnssSystemDefinitions.map((system) => system.id)).toEqual([
      "gps",
      "glonass",
      "galileo",
      "beidou",
      "qzss",
    ]);
  });

  it("全球型4システムとQZSS・NavICを具体的な地域と開始年で整理する", () => {
    expect(
      gnssGlobalSystemDefinitions.map((system) => ({
        id: system.id,
        region: system.countryOrRegion,
        start: system.serviceStartLabel,
      })),
    ).toEqual([
      { id: "gps", region: "アメリカ", start: "1993年" },
      { id: "glonass", region: "ロシア", start: "1995年" },
      { id: "galileo", region: "EU", start: "2016年" },
      { id: "beidou", region: "中国", start: "2020年（BDS-3）" },
    ]);
    expect(
      gnssGlobalSystemDefinitions.every(
        (system) =>
          system.coverage === "global" &&
          system.description === "全球衛星測位システム",
      ),
    ).toBe(true);
    expect(gnssQzssSystemDefinition).toMatchObject({
      id: "qzss",
      coverage: "regional",
      countryOrRegion: "日本",
      serviceStartLabel: "2018年",
    });
    expect(gnssNavicNote).toContain("インドとその周辺地域");
    expect(gnssSystemStartYearCaution).toContain("目安");
  });

  it("擬似距離へ影響する7要因を固定m値なしで定義する", () => {
    expect(gnssPseudorangeInfluences.map((influence) => influence.label)).toEqual([
      "受信機時計のずれ",
      "衛星時計に関する誤差・補正",
      "電離層",
      "対流圏",
      "衛星軌道に関する誤差",
      "マルチパス",
      "観測ノイズ",
    ]);
    for (const influence of gnssPseudorangeInfluences) {
      expect(influence.description).not.toMatch(/常に.*m/);
    }
  });

  it("第2章確認問題7問を安定IDと指定正答で定義する", () => {
    expect(gnssObservationsQuizQuestions.map((question) => question.id)).toEqual([
      "gnss-observations-q01-receiver-observation",
      "gnss-observations-q02-pseudorange",
      "gnss-observations-q03-carrier-phase",
      "gnss-observations-q04-integer-ambiguity",
      "gnss-observations-q05-multi-frequency",
      "gnss-observations-q06-multi-gnss",
      "gnss-observations-q07-signal-combination",
    ]);
    expect(
      gnssObservationsQuizQuestions.map((question) => question.correctOptionId),
    ).toEqual([
      "observe-radio-and-compute-position",
      "includes-clock-atmosphere-effects",
      "position-within-carrier-cycle",
      "integer-wavelength-count-unknown",
      "dual-frequency",
      "multi-gnss-single-frequency",
      "multi-gnss-dual-frequency-observables",
    ]);
    expect(
      gnssObservationsQuizQuestions.map((question) =>
        getGnssObservationsQuizOptionLetter(
          question.id,
          question.correctOptionId,
        ),
      ),
    ).toEqual(["B", "C", "A", "D", "B", "C", "A"]);
  });

  it("全問題で選択肢IDを一意にし、全誤答へ固有理由を持つ", () => {
    expect(gnssObservationsQuizQuestions).toHaveLength(7);

    for (const question of gnssObservationsQuizQuestions) {
      const optionIds = question.options.map((option) => option.id);

      expect(question.options).toHaveLength(4);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      expect(optionIds).toContain(question.correctOptionId);
      expect(question.correctReason.trim()).not.toBe("");
      expect(question.fieldCheck.trim()).not.toBe("");

      for (const option of question.options) {
        const evaluation = evaluateGnssObservationsQuizAnswer(
          question.id,
          option.id,
        );

        expect(evaluation?.correctOptionId).toBe(question.correctOptionId);
        expect(evaluation?.correctReason).toBe(question.correctReason);

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

  it("正答と誤答をUI非依存で個別理由付き判定する", () => {
    expect(
      evaluateGnssObservationsQuizAnswer(
        "gnss-observations-q04-integer-ambiguity",
        "integer-wavelength-count-unknown",
      ),
    ).toMatchObject({
      isCorrect: true,
      selectedAnswerReason: null,
      correctOptionId: "integer-wavelength-count-unknown",
    });

    const incorrectEvaluation = evaluateGnssObservationsQuizAnswer(
      "gnss-observations-q04-integer-ambiguity",
      "satellite-count-unknown",
    );
    expect(incorrectEvaluation).toMatchObject({
      isCorrect: false,
      correctOptionId: "integer-wavelength-count-unknown",
    });
    expect(incorrectEvaluation?.selectedAnswerReason).toContain(
      "整数波長数",
    );
  });

  it("不正値・未知IDで異常値を返さない", () => {
    expect(calculateSignalDistanceKm(Number.NaN)).toBeNull();
    expect(calculateSignalDistanceKm(-1)).toBeNull();
    expect(calculateClockOffsetDistanceMeters(Number.POSITIVE_INFINITY)).toBeNull();
    expect(calculateWavelengthRatio(-1)).toBeNull();
    expect(calculateWavelengthRatio(5, 0)).toBeNull();
    expect(createCarrierPhaseExample(10.5)).toBeNull();
    expect(createCarrierPhaseExample(10, 1)).toBeNull();
    expect(countGnssFrequencies([])).toBeNull();
    expect(countGnssFrequencies(["l1", "unknown"])).toBeNull();
    expect(getGnssFrequencySelection("unknown")).toBeNull();
    expect(getGnssFrequencyBand("unknown")).toBeNull();
    expect(getGnssSystemDefinition("unknown")).toBeNull();
    expect(summarizeGnssSystemSelection(["unknown"], "open")).toBeNull();
    expect(getGnssObservationsQuizQuestion("unknown")).toBeNull();
    expect(
      getGnssObservationsQuizOptionLetter("unknown", "unknown"),
    ).toBeNull();
    expect(
      getGnssObservationsQuizOptionLetter(
        "gnss-observations-q01-receiver-observation",
        "unknown",
      ),
    ).toBeNull();
    expect(
      evaluateGnssObservationsQuizAnswer("unknown", "unknown"),
    ).toBeNull();
    expect(
      evaluateGnssObservationsQuizAnswer(
        "gnss-observations-q01-receiver-observation",
        "unknown",
      ),
    ).toBeNull();
  });
});
