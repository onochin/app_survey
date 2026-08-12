import { describe, expect, it } from "vitest";
import {
  gnssCoordinateHeightLesson,
  gnssCorrectionDeliveryLesson,
  gnssLessons,
  gnssObservationsLesson,
  gnssOverviewLesson,
  gnssOwnBaseStationLesson,
  gnssPositioningMethodsLesson,
} from "../components/gnss/gnssCourse";
import { gnssCoordinateHeightQuizQuestions } from "../components/gnss/data/gnssCoordinateHeight";
import {
  evaluateGnssCorrectionDeliveryQuizAnswer,
  getGnssCorrectionDeliveryQuizOptionLetter,
  getGnssCorrectionDeliveryQuizQuestion,
  getGnssCorrectionDiagnosticCase,
  getGnssCorrectionFreshnessState,
  gnssCorrectionBaseInformation,
  gnssCorrectionConcepts,
  gnssCorrectionConnectionSettings,
  gnssCorrectionDeliveryCards,
  gnssCorrectionDeliveryMapSteps,
  gnssCorrectionDeliveryMethods,
  gnssCorrectionDeliveryQuizQuestions,
  gnssCorrectionDiagnosticCases,
  gnssCorrectionDiagnosticOrder,
  gnssCorrectionFreshnessChecks,
  gnssCorrectionFreshnessStates,
  gnssCorrectionMountpoints,
  gnssCorrectionNtripRoles,
  gnssCorrectionRequestResponse,
  gnssCorrectionRtcmMessages,
  gnssCorrectionRtcmStream,
} from "../components/gnss/data/gnssCorrectionDelivery";
import { gnssObservationsQuizQuestions } from "../components/gnss/data/gnssObservations";
import { gnssQuizQuestions } from "../components/gnss/data/gnssOverview";
import { gnssOwnBaseStationQuizQuestions } from "../components/gnss/data/gnssOwnBaseStation";
import { gnssPositioningMethodsQuizQuestions } from "../components/gnss/data/gnssPositioningMethods";

describe("GNSS測量 Phase 6 第6章", () => {
  it("第1章～第5章を維持し、第6章だけを利用可能な章へ追加する", () => {
    expect([
      gnssOverviewLesson,
      gnssObservationsLesson,
      gnssCoordinateHeightLesson,
      gnssPositioningMethodsLesson,
      gnssOwnBaseStationLesson,
    ]).toMatchObject([
      { id: "gnss-overview", number: 1, title: "GNSS測量の全体像" },
      {
        id: "gnss-observations",
        number: 2,
        title: "GNSSは何を観測しているのか",
      },
      {
        id: "gnss-coordinate-height",
        number: 3,
        title: "GNSSの座標と高さ",
      },
      {
        id: "gnss-positioning-methods",
        number: 4,
        title: "GNSS測位方式を比較する",
      },
      {
        id: "gnss-own-base-station",
        number: 5,
        title: "自前RTK① 基準局をつくる",
      },
    ]);
    expect(gnssCorrectionDeliveryLesson).toMatchObject({
      id: "gnss-correction-delivery",
      number: 6,
      title: "自前RTK② 補正情報を届ける",
      learningGoal:
        "自前RTKで、基準局側の情報がRTCMとしてどのように表され、Ntripやその他の通信経路を通って移動局へ届くかを説明し、RTCM・Ntrip・Caster・Mountpointの役割を区別できる。また、RTCMが正常に届かない場合に、情報経路を順番に確認できる。",
    });
    expect(gnssLessons.slice(0, 6).map((lesson) => lesson.id)).toEqual([
      "gnss-overview",
      "gnss-observations",
      "gnss-coordinate-height",
      "gnss-positioning-methods",
      "gnss-own-base-station",
      "gnss-correction-delivery",
    ]);
    expect(gnssLessons).toHaveLength(7);
    expect(gnssQuizQuestions).toHaveLength(3);
    expect(gnssObservationsQuizQuestions).toHaveLength(7);
    expect(gnssCoordinateHeightQuizQuestions).toHaveLength(8);
    expect(gnssPositioningMethodsQuizQuestions).toHaveLength(8);
    expect(gnssOwnBaseStationQuizQuestions).toHaveLength(8);
  });

  it("9カードを安定IDと指定順で定義する", () => {
    expect(gnssCorrectionDeliveryCards.map((card) => card.id)).toEqual([
      "after-base-station",
      "base-station-information",
      "rtcm-standard",
      "ntrip-streaming",
      "caster-mountpoint",
      "own-rtk-route",
      "delivery-without-ntrip",
      "rtcm-freshness",
      "route-diagnosis",
    ]);
    expect(gnssCorrectionDeliveryCards.map((card) => card.title)).toEqual([
      "基準局をつくった。その次は？",
      "基準局は何を移動局へ送る？",
      "RTCMとは？",
      "Ntripとは？",
      "Casterは何をしている？／Mountpoint",
      "自前RTKの情報経路を追う",
      "RTCMの届け方はNtripだけ？",
      "届いていても「古い」ことがある",
      "どこで止まっている？",
    ]);
    expect(gnssCorrectionDeliveryCards).toHaveLength(9);
  });

  it("章全体図をNtrip Server・Caster・Client・移動局まで定義する", () => {
    expect(gnssCorrectionDeliveryMapSteps.map((step) => step.id)).toEqual([
      "satellites",
      "base-observation",
      "rtcm-output",
      "ntrip-server",
      "upstream-network",
      "caster",
      "downstream-network",
      "ntrip-client",
      "rover-receive",
    ]);
    expect(gnssCorrectionDeliveryMapSteps.map((step) => step.label)).toContain(
      "移動局P1へRTCMが届く",
    );
    expect(gnssCorrectionDeliveryMapSteps.at(-1)?.detail).toContain(
      "第6章の主対象",
    );
  });

  it("基準局位置とGNSS観測をRTCM例へ結び付ける", () => {
    expect(gnssCorrectionBaseInformation.map((item) => item.id)).toEqual([
      "base-position",
      "base-observations",
    ]);
    expect(
      Object.fromEntries(
        gnssCorrectionRtcmMessages.map((message) => [
          message.number,
          message.meaning,
        ]),
      ),
    ).toMatchObject({
      "1005": "基準局ARPの位置",
      "1077": "GPSの観測情報",
      "1097": "Galileoの観測情報",
      "1127": "BeiDouの観測情報",
    });
    expect(
      gnssCorrectionRtcmMessages.find((message) => message.number === "1005")
        ?.meaning,
    ).not.toContain("平面直角座標");
  });

  it("RTCMを複数メッセージが継続するストリームとして定義する", () => {
    expect(gnssCorrectionRtcmStream).toHaveLength(7);
    expect(
      gnssCorrectionRtcmStream.filter(
        (streamItem) => streamItem.messageNumber === "1077",
      ),
    ).toHaveLength(2);
    expect(new Set(gnssCorrectionRtcmStream.map((item) => item.timing)).size).toBe(
      4,
    );
  });

  it("RTCMとNtripを中身・形式とIPストリーミングに区別する", () => {
    expect(gnssCorrectionConcepts).toMatchObject([
      {
        id: "rtcm",
        shortMeaning: "届ける情報の中身・形式",
      },
      {
        id: "ntrip",
        shortMeaning: "IPネットワーク上で届ける仕組み",
      },
    ]);
    expect(gnssCorrectionConcepts[1].meaning).toContain("IPネットワーク");
    expect(gnssCorrectionConcepts[1].meaning).not.toContain("公衆インターネット必須");
  });

  it("Caster・MountpointとHost・Portを別の役割として定義する", () => {
    expect(gnssCorrectionNtripRoles.map((role) => role.id)).toEqual([
      "server",
      "caster",
      "client",
    ]);
    expect(
      gnssCorrectionNtripRoles.find((role) => role.id === "caster")?.role,
    ).toContain("識別");
    expect(gnssCorrectionMountpoints[0]).toMatchObject({
      id: "base-a",
      name: "BASE_A",
      description: "基準局AのRTCMストリーム",
      messageNumbers: ["1005", "1077", "1087", "1097", "1127"],
    });
    expect(gnssCorrectionConnectionSettings).toMatchObject([
      { id: "host", value: "ntrip.example.jp" },
      { id: "port", value: "2101" },
      { id: "mountpoint", value: "BASE_A" },
    ]);
  });

  it("ClientからのBASE_A指定とCasterからの配信方向を区別する", () => {
    expect(gnssCorrectionRequestResponse).toEqual([
      {
        id: "client-request",
        from: "Ntrip Client",
        to: "Ntrip Caster",
        payload: "「BASE_Aを受信したい」",
      },
      {
        id: "caster-delivery",
        from: "Ntrip Caster",
        to: "Ntrip Client",
        payload: "BASE_AのRTCMストリーム",
      },
    ]);
  });

  it("Ntrip経路とNtripを使わないRTCM伝送を比較する", () => {
    const directMethod = gnssCorrectionDeliveryMethods.find(
      (method) => method.id === "direct",
    );
    expect(gnssCorrectionDeliveryMethods.map((method) => method.id)).toEqual([
      "ntrip",
      "direct",
    ]);
    expect(directMethod?.path).toEqual([
      "基準局",
      "RTCM",
      "無線・シリアル等",
      "移動局",
    ]);
    expect(directMethod?.notRequired).toEqual([
      "Caster",
      "Mountpoint",
      "Ntrip Server / Client",
    ]);
  });

  it("RTCM鮮度の3状態と未知状態の安全処理を定義する", () => {
    expect(gnssCorrectionFreshnessStates.map((state) => state.id)).toEqual([
      "fresh",
      "delayed",
      "stopped",
    ]);
    expect(gnssCorrectionFreshnessStates.map((state) => state.label)).toEqual([
      "正常",
      "遅延",
      "停止",
    ]);
    expect(gnssCorrectionFreshnessStates[1].connectionLabel).toContain("接続中");
    expect(gnssCorrectionFreshnessStates[1].updateLabel).toContain("不安定");
    expect(gnssCorrectionFreshnessChecks).toHaveLength(4);
    expect(getGnssCorrectionFreshnessState("fresh")?.id).toBe("fresh");
    expect(getGnssCorrectionFreshnessState("unknown")).toBeNull();
  });

  it("上流からの確認順と5つの診断ケースを定義する", () => {
    expect(gnssCorrectionDiagnosticOrder).toEqual([
      "基準局でGNSS観測",
      "RTCM出力",
      "送信経路",
      "Caster / Mountpoint（Ntrip使用時）",
      "受信経路",
      "移動局でRTCM更新",
    ]);
    expect(gnssCorrectionDiagnosticCases.map((item) => item.id)).toEqual([
      "no-rtcm-output",
      "wrong-mountpoint",
      "stale-rtcm",
      "direct-link-receive-failure",
      "rtcm-ok-float",
    ]);
    expect(gnssCorrectionDiagnosticCases[0].correctCheck).toBe(
      "基準局側のRTCM出力",
    );
    expect(gnssCorrectionDiagnosticCases[1].correctCheck).toContain(
      "Mountpoint",
    );
    expect(gnssCorrectionDiagnosticCases[2].correctCheck).toContain("継続更新");
    expect(gnssCorrectionDiagnosticCases[3].statuses.map((item) => item.label)).not.toContain(
      "Caster",
    );
    expect(gnssCorrectionDiagnosticCases[4].reason).toContain("第7章");
    expect(getGnssCorrectionDiagnosticCase("rtcm-ok-float")?.nextQuestion).toBe(
      "では、なぜFLOATのままなのか？",
    );
    expect(getGnssCorrectionDiagnosticCase("unknown")).toBeNull();
  });

  it("確認問題8問を安定IDとB/C/A/D/B/C/A/Dの正答位置で定義する", () => {
    expect(gnssCorrectionDeliveryQuizQuestions.map((question) => question.id)).toEqual([
      "rtcm-role",
      "rtcm-vs-ntrip",
      "mountpoint-role",
      "ntrip-stream-request",
      "offline-rtcm-delivery",
      "rtcm-freshness",
      "wrong-mountpoint-diagnosis",
      "rtcm-ok-still-float",
    ]);
    const correctLetters = gnssCorrectionDeliveryQuizQuestions.map((question) =>
      getGnssCorrectionDeliveryQuizOptionLetter(
        question.id,
        question.correctOptionId,
      ),
    );
    expect(correctLetters).toEqual(["B", "C", "A", "D", "B", "C", "A", "D"]);
    expect(
      Object.fromEntries(
        ["A", "B", "C", "D"].map((letter) => [
          letter,
          correctLetters.filter((current) => current === letter).length,
        ]),
      ),
    ).toEqual({ A: 2, B: 2, C: 2, D: 2 });
  });

  it("全32選択肢を評価し、全誤答へ固有理由を持たせる", () => {
    expect(gnssCorrectionDeliveryQuizQuestions).toHaveLength(8);
    const allOptionIds = gnssCorrectionDeliveryQuizQuestions.flatMap(
      (question) => question.options.map((option) => option.id),
    );
    expect(new Set(allOptionIds).size).toBe(32);

    for (const question of gnssCorrectionDeliveryQuizQuestions) {
      expect(question.options).toHaveLength(4);
      expect(question.correctOptionId).not.toMatch(/^[A-D]$/);
      expect(question.correctReason.trim()).not.toBe("");
      expect(question.fieldCheck.trim()).not.toBe("");

      for (const option of question.options) {
        const evaluation = evaluateGnssCorrectionDeliveryQuizAnswer(
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

  it("未知問題ID・未知選択肢IDを異常表示へ送らず拒否する", () => {
    expect(getGnssCorrectionDeliveryQuizQuestion("unknown")).toBeNull();
    expect(
      getGnssCorrectionDeliveryQuizOptionLetter("unknown", "unknown"),
    ).toBeNull();
    expect(
      getGnssCorrectionDeliveryQuizOptionLetter("rtcm-role", "unknown"),
    ).toBeNull();
    expect(
      evaluateGnssCorrectionDeliveryQuizAnswer("unknown", "unknown"),
    ).toBeNull();
    expect(
      evaluateGnssCorrectionDeliveryQuizAnswer("rtcm-role", "unknown"),
    ).toBeNull();
  });
});
