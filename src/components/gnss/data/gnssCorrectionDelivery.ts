import type {
  GnssCorrectionDiagnosticCaseId,
  GnssCorrectionFreshnessId,
  GnssQuizAnswerEvaluation,
  GnssQuizQuestion,
} from "../types";

export const gnssCorrectionDeliveryCards = [
  {
    id: "after-base-station",
    title: "基準局をつくった。その次は？",
    focus: "第5章で準備した基準局から、情報を届ける工程へ進む",
  },
  {
    id: "base-station-information",
    title: "基準局は何を移動局へ送る？",
    focus: "基準局位置と基準局側のGNSS観測を区別する",
  },
  {
    id: "rtcm-standard",
    title: "RTCMとは？",
    focus: "複数メッセージが継続して流れるデータ形式を理解する",
  },
  {
    id: "ntrip-streaming",
    title: "Ntripとは？",
    focus: "RTCMの中身とIPネットワーク上の届け方を区別する",
  },
  {
    id: "caster-mountpoint",
    title: "Casterは何をしている？／Mountpoint",
    focus: "配信所とストリーム識別名の役割を整理する",
  },
  {
    id: "own-rtk-route",
    title: "自前RTKの情報経路を追う",
    focus: "Ntrip Serverから移動局P1までの経路と要求方向を追う",
  },
  {
    id: "delivery-without-ntrip",
    title: "RTCMの届け方はNtripだけ？",
    focus: "Ntrip経路とNtripを使わない直接伝送を比較する",
  },
  {
    id: "rtcm-freshness",
    title: "届いていても「古い」ことがある",
    focus: "接続状態とRTCM更新状態を3つの模式状態で区別する",
  },
  {
    id: "route-diagnosis",
    title: "どこで止まっている？",
    focus: "情報経路を上流から順番に切り分ける",
  },
] as const;

export const gnssCorrectionDeliveryMapSteps = [
  {
    id: "satellites",
    numberLabel: "起点",
    label: "GNSS衛星",
    detail: "基準局と移動局が衛星信号を受信",
  },
  {
    id: "base-observation",
    numberLabel: "①",
    label: "基準局AでGNSS観測",
    detail: "基準局位置と基準局側の観測を用意",
  },
  {
    id: "rtcm-output",
    numberLabel: "②",
    label: "RTCMとして出力",
    detail: "GNSS情報を共通の形式で表現",
  },
  {
    id: "ntrip-server",
    numberLabel: "③",
    label: "Ntrip Server",
    detail: "基準局側ストリームをCasterへ送る役割",
  },
  {
    id: "upstream-network",
    numberLabel: "④",
    label: "IPネットワーク",
    detail: "Casterまで運ぶ経路",
  },
  {
    id: "caster",
    numberLabel: "⑤",
    label: "Ntrip Caster",
    detail: "Mountpoint：BASE_Aを識別して配信",
  },
  {
    id: "downstream-network",
    numberLabel: "⑥",
    label: "IPネットワーク",
    detail: "Clientまで運ぶ経路",
  },
  {
    id: "ntrip-client",
    numberLabel: "⑦",
    label: "Ntrip Client",
    detail: "BASE_Aを指定して受信する役割",
  },
  {
    id: "rover-receive",
    numberLabel: "⑧",
    label: "移動局P1へRTCMが届く",
    detail: "ここまでが第6章の主対象",
  },
] as const;

export const gnssCorrectionBaseInformation = [
  {
    id: "base-position",
    numberLabel: "①",
    question: "基準局はどこにいる？",
    answer: "基準局・基準局ARPの位置に関する情報",
  },
  {
    id: "base-observations",
    numberLabel: "②",
    question: "基準局では衛星をどう観測した？",
    answer: "基準局側のGNSS観測情報",
  },
] as const;

export const gnssCorrectionRtcmMessages = [
  {
    id: "rtcm-1005",
    number: "1005",
    meaning: "基準局ARPの位置",
    category: "基準局位置",
  },
  {
    id: "rtcm-1077",
    number: "1077",
    meaning: "GPSの観測情報",
    category: "GNSS観測",
  },
  {
    id: "rtcm-1087",
    number: "1087",
    meaning: "GLONASSの観測情報",
    category: "GNSS観測",
  },
  {
    id: "rtcm-1097",
    number: "1097",
    meaning: "Galileoの観測情報",
    category: "GNSS観測",
  },
  {
    id: "rtcm-1127",
    number: "1127",
    meaning: "BeiDouの観測情報",
    category: "GNSS観測",
  },
] as const;

export const gnssCorrectionRtcmStream = [
  { id: "stream-1005-01", messageNumber: "1005", timing: "基準情報" },
  { id: "stream-1077-01", messageNumber: "1077", timing: "観測時刻 1" },
  { id: "stream-1097-01", messageNumber: "1097", timing: "観測時刻 1" },
  { id: "stream-1127-01", messageNumber: "1127", timing: "観測時刻 1" },
  { id: "stream-1077-02", messageNumber: "1077", timing: "次の観測時刻" },
  { id: "stream-1087-01", messageNumber: "1087", timing: "別の観測時刻" },
  { id: "stream-1097-02", messageNumber: "1097", timing: "次の観測時刻" },
] as const;

export const gnssCorrectionConcepts = [
  {
    id: "rtcm",
    label: "RTCM",
    shortMeaning: "届ける情報の中身・形式",
    meaning:
      "基準局の位置やGNSS観測などを、機器どうしで共通して扱うためのデータ形式・メッセージ規格",
  },
  {
    id: "ntrip",
    label: "Ntrip",
    shortMeaning: "IPネットワーク上で届ける仕組み",
    meaning:
      "GNSSデータをIPネットワーク経由でストリーミングする仕組み",
  },
] as const;

export const gnssCorrectionNtripRoles = [
  {
    id: "server",
    label: "Ntrip Server",
    role: "基準局側のRTCMストリームをCasterへ送る通信上の役割",
  },
  {
    id: "caster",
    label: "Ntrip Caster",
    role: "ストリームを受け取り、識別し、Ntrip Clientへ配信する役割",
  },
  {
    id: "client",
    label: "Ntrip Client",
    role: "必要なMountpointを指定し、RTCMストリームを受信する通信上の役割",
  },
] as const;

export const gnssCorrectionMountpoints = [
  {
    id: "base-a",
    name: "BASE_A",
    description: "基準局AのRTCMストリーム",
    messageNumbers: ["1005", "1077", "1087", "1097", "1127"],
  },
  {
    id: "base-b",
    name: "BASE_B",
    description: "基準局BのRTCMストリーム",
    messageNumbers: ["複数のRTCMメッセージ"],
  },
  {
    id: "base-c",
    name: "BASE_C",
    description: "基準局CのRTCMストリーム",
    messageNumbers: ["複数のRTCMメッセージ"],
  },
] as const;

export const gnssCorrectionConnectionSettings = [
  {
    id: "host",
    label: "Host",
    value: "ntrip.example.jp",
    meaning: "どのCasterへ接続するか",
  },
  {
    id: "port",
    label: "Port",
    value: "2101",
    meaning: "どの通信口を使用するか",
  },
  {
    id: "mountpoint",
    label: "Mountpoint",
    value: "BASE_A",
    meaning: "どのGNSSデータストリームを受信するか",
  },
] as const;

export const gnssCorrectionRequestResponse = [
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
] as const;

export const gnssCorrectionDeliveryMethods = [
  {
    id: "ntrip",
    title: "Ntripを使用",
    path: [
      "基準局",
      "RTCM",
      "Ntrip Server",
      "IPネットワーク",
      "Caster",
      "Mountpoint",
      "Ntrip Client",
      "移動局",
    ],
    notRequired: [] as readonly string[],
  },
  {
    id: "direct",
    title: "Ntripを使用しない直接伝送",
    path: ["基準局", "RTCM", "無線・シリアル等", "移動局"],
    notRequired: ["Caster", "Mountpoint", "Ntrip Server / Client"],
  },
] as const;

interface GnssCorrectionFreshnessState {
  readonly id: GnssCorrectionFreshnessId;
  readonly label: "正常" | "遅延" | "停止";
  readonly connectionLabel: string;
  readonly updateLabel: string;
  readonly summary: string;
  readonly timeline: readonly boolean[];
}

export const gnssCorrectionFreshnessStates = [
  {
    id: "fresh",
    label: "正常",
    connectionLabel: "通信接続：接続中",
    updateLabel: "RTCM更新：継続",
    summary: "新しいRTCMが継続して到着しています。",
    timeline: [true, true, true, true, true, true, true, true],
  },
  {
    id: "delayed",
    label: "遅延",
    connectionLabel: "通信接続：接続中",
    updateLabel: "RTCM更新：間隔が不安定",
    summary: "接続は残っていますが、RTCMの更新間隔が不安定です。",
    timeline: [true, true, false, false, true, false, false, true],
  },
  {
    id: "stopped",
    label: "停止",
    connectionLabel: "通信接続：接続中の場合もある",
    updateLabel: "RTCM更新：停止",
    summary: "過去のRTCMはありますが、新しいRTCMが来ていません。",
    timeline: [true, true, true, false, false, false, false, false],
  },
] as const satisfies readonly GnssCorrectionFreshnessState[];

export const gnssCorrectionFreshnessChecks = [
  "RTCMの最後の更新からの時間",
  "Caster側の最終受信時刻",
  "データ量が更新されているか",
  "移動局側で新しいRTCMが届いているか",
] as const;

export function getGnssCorrectionFreshnessState(
  stateId: string,
): GnssCorrectionFreshnessState | null {
  return (
    gnssCorrectionFreshnessStates.find((state) => state.id === stateId) ?? null
  );
}

export const gnssCorrectionDiagnosticOrder = [
  "基準局でGNSS観測",
  "RTCM出力",
  "送信経路",
  "Caster / Mountpoint（Ntrip使用時）",
  "受信経路",
  "移動局でRTCM更新",
] as const;

interface GnssCorrectionDiagnosticStatus {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tone: "normal" | "attention" | "failure" | "outside";
}

interface GnssCorrectionDiagnosticCase {
  readonly id: GnssCorrectionDiagnosticCaseId;
  readonly caseLabel: string;
  readonly title: string;
  readonly statuses: readonly GnssCorrectionDiagnosticStatus[];
  readonly correctCheck: string;
  readonly reason: string;
  readonly nextQuestion: string | null;
}

export const gnssCorrectionDiagnosticCases = [
  {
    id: "no-rtcm-output",
    caseLabel: "ケースA",
    title: "RTCMが出ていない",
    statuses: [
      {
        id: "base-observation",
        label: "基準局GNSS観測",
        value: "正常",
        tone: "normal",
      },
      {
        id: "rtcm-output",
        label: "RTCM出力",
        value: "異常",
        tone: "failure",
      },
    ],
    correctCheck: "基準局側のRTCM出力",
    reason: "上流のGNSS観測は正常で、その直後のRTCM出力で止まっています。",
    nextQuestion: null,
  },
  {
    id: "wrong-mountpoint",
    caseLabel: "ケースB",
    title: "Mountpoint違い",
    statuses: [
      {
        id: "base-station",
        label: "基準局",
        value: "正常",
        tone: "normal",
      },
      {
        id: "rtcm-output",
        label: "RTCM出力",
        value: "正常",
        tone: "normal",
      },
      {
        id: "caster-connection",
        label: "Caster接続",
        value: "正常",
        tone: "normal",
      },
      {
        id: "base-a",
        label: "BASE_A",
        value: "Active",
        tone: "normal",
      },
      {
        id: "rover-setting",
        label: "移動局設定",
        value: "Mountpoint = BASE_B",
        tone: "failure",
      },
    ],
    correctCheck: "移動局が指定しているMountpoint",
    reason:
      "必要なのはBASE_Aです。Casterに接続できたことと、正しいRTCMストリームを受信していることは別です。",
    nextQuestion: null,
  },
  {
    id: "stale-rtcm",
    caseLabel: "ケースC",
    title: "接続中だがRTCM更新停止",
    statuses: [
      {
        id: "caster-connection",
        label: "Caster接続",
        value: "正常",
        tone: "normal",
      },
      {
        id: "mountpoint",
        label: "Mountpoint",
        value: "BASE_A",
        tone: "normal",
      },
      {
        id: "client-connection",
        label: "Client接続",
        value: "正常",
        tone: "normal",
      },
      {
        id: "rtcm-update",
        label: "新しいRTCM更新",
        value: "停止",
        tone: "failure",
      },
    ],
    correctCheck: "RTCMが継続更新されているか",
    reason:
      "接続状態だけでは判断せず、最後の更新やデータ量などから情報の鮮度を確認します。",
    nextQuestion: null,
  },
  {
    id: "direct-link-receive-failure",
    caseLabel: "ケースD",
    title: "Ntripを使用しない無線経路",
    statuses: [
      {
        id: "rtcm-output",
        label: "基準局RTCM出力",
        value: "正常",
        tone: "normal",
      },
      {
        id: "radio-transmit",
        label: "無線送信",
        value: "正常",
        tone: "normal",
      },
      {
        id: "radio-receive",
        label: "無線受信",
        value: "異常",
        tone: "failure",
      },
      {
        id: "rover-rtcm",
        label: "移動局RTCM",
        value: "受信なし",
        tone: "failure",
      },
    ],
    correctCheck: "Casterではなく、無線の直接通信経路",
    reason:
      "Ntripを使用していないため、CasterやMountpointではなく送受信する無線経路を確認します。",
    nextQuestion: null,
  },
  {
    id: "rtcm-ok-float",
    caseLabel: "ケースE",
    title: "RTCM正常だがFLOAT",
    statuses: [
      {
        id: "base-observation",
        label: "基準局観測",
        value: "正常",
        tone: "normal",
      },
      {
        id: "rtcm-output",
        label: "RTCM出力",
        value: "正常",
        tone: "normal",
      },
      {
        id: "delivery-path",
        label: "送信経路",
        value: "正常",
        tone: "normal",
      },
      {
        id: "mountpoint",
        label: "Mountpoint BASE_A",
        value: "正常",
        tone: "normal",
      },
      {
        id: "rover-update",
        label: "移動局RTCM更新",
        value: "正常",
        tone: "normal",
      },
      {
        id: "positioning-state",
        label: "測位状態",
        value: "FLOAT",
        tone: "attention",
      },
    ],
    correctCheck: "第6章の通信経路は、RTCM受信まで正常",
    reason:
      "RTCMが届いたこととFIXしたことは同じではありません。FLOAT / FIXの成立は第7章で扱います。",
    nextQuestion: "では、なぜFLOATのままなのか？",
  },
] as const satisfies readonly GnssCorrectionDiagnosticCase[];

export function getGnssCorrectionDiagnosticCase(
  caseId: string,
): GnssCorrectionDiagnosticCase | null {
  return (
    gnssCorrectionDiagnosticCases.find((diagnostic) => diagnostic.id === caseId) ??
    null
  );
}

export const gnssCorrectionDeliveryQuizQuestions = [
  {
    id: "rtcm-role",
    questionType: "仕組み理解",
    prompt: "自前RTKで使うRTCMについて、最も適切な説明はどれですか？",
    options: [
      {
        id: "q01-internet-connection-method",
        label: "基準局から移動局へインターネット接続するための通信方式",
        incorrectReason:
          "IPネットワーク上でGNSSデータを運ぶ仕組みはNtripです。RTCMは通信経路そのものではありません。",
      },
      {
        id: "q01-common-message-standard",
        label:
          "基準局の位置やGNSS観測などを、機器間で共通に扱うためのデータ形式・メッセージ規格",
        incorrectReason: null,
      },
      {
        id: "q01-finished-p1-coordinate",
        label: "基準局で計算したP1の完成座標",
        incorrectReason:
          "基準局がP1の完成座標を計算して送っているわけではありません。",
      },
      {
        id: "q01-caster-fix-result",
        label: "CasterがRTK解析して作成したFIX結果",
        incorrectReason:
          "Casterの基本役割はストリームの受け取り・識別・配信であり、P1のFLOAT / FIX解析を行う場所ではありません。",
      },
    ],
    correctOptionId: "q01-common-message-standard",
    correctReason:
      "RTCMは、基準局位置やGNSS観測などを表す標準的なデータ形式・メッセージ規格です。複数種類のRTCMメッセージが継続してストリームとして流れます。",
    fieldCheck: "基準局側で出力するRTCMメッセージと更新状況を確認する。",
  },
  {
    id: "rtcm-vs-ntrip",
    questionType: "用語整理",
    prompt: "RTCMとNtripの関係として最も適切なのはどれですか？",
    options: [
      {
        id: "q02-same-thing",
        label: "RTCMとNtripは名称が違うだけで同じもの",
        incorrectReason: "RTCMとNtripは役割が異なります。",
      },
      {
        id: "q02-roles-reversed",
        label: "RTCMが通信経路で、NtripがGNSS観測データの形式",
        incorrectReason: "関係が逆です。",
      },
      {
        id: "q02-content-and-streaming",
        label:
          "RTCMは情報の中身・形式、NtripはGNSSデータをIPネットワーク経由でストリーミングする仕組み",
        incorrectReason: null,
      },
      {
        id: "q02-float-fix-analysis",
        label: "Ntripは移動局内部でFLOATからFIXへ変換する解析方法",
        incorrectReason:
          "FLOAT / FIXはRTK解析側の話であり、Ntripは通信・配信の仕組みです。",
      },
    ],
    correctOptionId: "q02-content-and-streaming",
    correctReason:
      "RTCMは届けるGNSS情報の中身・形式、NtripはそのGNSSデータをIPネットワーク経由でストリーミングする仕組みです。",
    fieldCheck: "RTCM出力設定とNtrip接続設定を別の項目として確認する。",
  },
  {
    id: "mountpoint-role",
    questionType: "用語整理",
    prompt:
      "CasterにあるMountpoint `BASE_A`について、最も適切な説明はどれですか？",
    options: [
      {
        id: "q03-stream-name",
        label:
          "複数種類のRTCMメッセージが流れる、1本のGNSSデータストリームを識別する名前",
        incorrectReason: null,
      },
      {
        id: "q03-message-name",
        label: "RTCM 1005や1077など、各メッセージ1個ずつにつける名前",
        incorrectReason:
          "1005や1077はRTCMメッセージの種類であり、Mountpointではありません。",
      },
      {
        id: "q03-physical-coordinate",
        label: "基準局Aの物理的な設置座標",
        incorrectReason: "Mountpointは基準局の座標そのものではありません。",
      },
      {
        id: "q03-fix-state",
        label: "移動局がFIXしたことを示す状態名",
        incorrectReason:
          "FIX / FLOATは測位解の状態であり、Mountpointとは別です。",
      },
    ],
    correctOptionId: "q03-stream-name",
    correctReason:
      "Mountpointは、複数のRTCMメッセージが継続して流れる1本のGNSSデータストリームを識別する名前です。",
    fieldCheck: "利用する基準局に対応するMountpoint名を確認する。",
  },
  {
    id: "ntrip-stream-request",
    questionType: "仕組み理解",
    prompt:
      "移動局がCasterから`BASE_A`のRTCMを受信するときの説明として最も適切なのはどれですか？",
    options: [
      {
        id: "q04-caster-pushes-nearest",
        label:
          "Casterが移動局を探し、自動的に最寄りのMountpointを送りつける",
        incorrectReason: "Client側が必要なストリームを指定します。",
      },
      {
        id: "q04-server-selects-rover",
        label: "Ntrip Serverが移動局へ直接BASE_Aを指定する",
        incorrectReason:
          "Ntrip Serverは基準局側のストリームをCasterへ送る役割です。",
      },
      {
        id: "q04-manual-message-request",
        label: "移動局がRTCM 1005、1077、1097を1つずつ手作業で要求する",
        incorrectReason:
          "利用者がRTCM番号を1つずつ手動要求する仕組みではありません。",
      },
      {
        id: "q04-client-requests-stream",
        label:
          "Ntrip ClientがCasterへBASE_Aを指定し、CasterからBASE_AのRTCMストリームを受け取る",
        incorrectReason: null,
      },
    ],
    correctOptionId: "q04-client-requests-stream",
    correctReason:
      "Ntrip Clientが必要なMountpointを指定してCasterへ接続し、Casterから該当するRTCMストリームを受け取ります。",
    fieldCheck: "ClientのHost・Port・Mountpoint設定をそれぞれ照合する。",
  },
  {
    id: "offline-rtcm-delivery",
    questionType: "方式選択",
    prompt:
      "現場が携帯通信圏外でした。自前RTKについて最も適切な判断はどれですか？",
    options: [
      {
        id: "q05-impossible-without-ntrip",
        label: "Ntripが使えないので、自前RTKは必ず不可能",
        incorrectReason: "Ntrip以外の通信経路も構成候補になります。",
      },
      {
        id: "q05-consider-other-paths",
        label:
          "基準局のRTCMを必要な鮮度で届けられるなら、無線・シリアル等の別経路やローカルIPネットワークも検討できる",
        incorrectReason: null,
      },
      {
        id: "q05-caster-always-required",
        label: "携帯圏外でもCasterとMountpointは必ず必要",
        incorrectReason:
          "Ntripを使わない直接伝送ではCasterやMountpointは不要です。",
      },
      {
        id: "q05-rinex-replacement",
        label: "RTCMの代わりにRINEXをリアルタイム送信すれば必ずRTKできる",
        incorrectReason:
          "RTCMとRINEXは単純に置き換える関係ではありません。",
      },
    ],
    correctOptionId: "q05-consider-other-paths",
    correctReason:
      "RTKにNtripそのものが必須なわけではありません。必要なのは、基準局側のRTCMを必要な鮮度で継続して移動局へ届けられる通信経路です。",
    fieldCheck: "現場で継続利用できる通信経路があるかを確認する。",
  },
  {
    id: "rtcm-freshness",
    questionType: "品質管理",
    prompt:
      "移動局では「接続中」と表示されています。しかし、最後に新しいRTCMを受信してからの時間が増え続けています。最も適切な判断はどれですか？",
    options: [
      {
        id: "q06-connected-means-normal",
        label: "接続中なのでRTCMも正常であり、確認は不要",
        incorrectReason: "ConnectedだけではRTCM更新が正常とは判断できません。",
      },
      {
        id: "q06-universal-five-seconds",
        label: "5秒を超えた時点ですべてのGNSS受信機で異常と判断する",
        incorrectReason:
          "特定の秒数をすべての機器に共通する異常判定値にはできません。",
      },
      {
        id: "q06-check-freshness",
        label:
          "通信接続は残っていてもRTCM更新が遅延・停止している可能性があるため、情報の鮮度を確認する",
        incorrectReason: null,
      },
      {
        id: "q06-rename-mountpoint",
        label: "Mountpointの名前を変更すれば必ず解決する",
        incorrectReason:
          "原因を確認せずMountpointを変更する判断は適切ではありません。",
      },
    ],
    correctOptionId: "q06-check-freshness",
    correctReason:
      "通信接続状態と、新しいRTCMが継続して届いている状態は別です。最後に新しい情報が届いた時刻などを確認する必要があります。",
    fieldCheck: "機器ごとの表示名を確認し、最終更新やデータ量の変化を見る。",
  },
  {
    id: "wrong-mountpoint-diagnosis",
    questionType: "品質管理",
    prompt:
      "基準局GNSS観測・RTCM出力・Caster接続・BASE_Aは正常です。移動局のMountpointがBASE_Bの場合、基準局Aを利用するため最初に修正すべきものはどれですか？",
    options: [
      {
        id: "q07-rover-mountpoint",
        label: "移動局が指定しているMountpoint",
        incorrectReason: null,
      },
      {
        id: "q07-base-antenna-height",
        label: "基準局Aのアンテナ高",
        incorrectReason:
          "今回示された通信経路上の異常はMountpoint設定です。",
      },
      {
        id: "q07-satellite-frequency",
        label: "GNSS衛星の周波数",
        incorrectReason: "GNSS周波数を変更する問題ではありません。",
      },
      {
        id: "q07-p1-coordinate-system",
        label: "P1の座標系",
        incorrectReason:
          "座標系確認は成果利用で重要ですが、今回示されたRTCM受信経路の原因ではありません。",
      },
    ],
    correctOptionId: "q07-rover-mountpoint",
    correctReason:
      "今回必要なのはBASE_Aですが、移動局はBASE_Bを指定しています。Casterへ接続できたことと、正しいRTCMストリームを受信していることは別です。",
    fieldCheck: "必要な基準局と移動局設定のMountpoint名を照合する。",
  },
  {
    id: "rtcm-ok-still-float",
    questionType: "総合問題",
    prompt:
      "基準局観測・RTCM出力・送信経路・Mountpoint BASE_A・移動局のRTCM更新は正常ですが、測位状態はFLOATです。第6章での判断として最も適切なのはどれですか？",
    options: [
      {
        id: "q08-caster-analysis-failed",
        label: "FLOATなのでCasterがRTK解析に失敗している",
        incorrectReason:
          "Casterは移動局のFLOAT / FIX解析を行う装置ではありません。",
      },
      {
        id: "q08-mountpoint-always-wrong",
        label: "RTCMが届いていてもFLOATなら、Mountpointは必ず間違っている",
        incorrectReason:
          "RTCM更新まで正常なら、Mountpoint間違いと断定できません。",
      },
      {
        id: "q08-fix-must-follow",
        label: "第6章の通信経路が正常でもFIXしないことはあり得ない",
        incorrectReason:
          "通信経路が正常でも、RTK解析側の条件によってFLOATのままの場合があります。",
      },
      {
        id: "q08-next-chapter-analysis",
        label:
          "RTCMが正しく継続して届くところまでは確認できた。次はRTK解析やFLOAT / FIXの成立を第7章で考える",
        incorrectReason: null,
      },
    ],
    correctOptionId: "q08-next-chapter-analysis",
    correctReason:
      "第6章の役割は、基準局側情報が移動局へ正しく継続して届くところまでです。RTCM受信とFIX成立は同じではありません。FLOAT / FIXの成立条件は第7章で扱います。",
    fieldCheck: "RTCM更新までを確認し、解析側の原因と混同せず次の確認へ進む。",
  },
] as const satisfies readonly GnssQuizQuestion[];

export function getGnssCorrectionDeliveryQuizQuestion(
  questionId: string,
): GnssQuizQuestion | null {
  return (
    gnssCorrectionDeliveryQuizQuestions.find(
      (question) => question.id === questionId,
    ) ?? null
  );
}

export function getGnssCorrectionDeliveryQuizOptionLetter(
  questionId: string,
  optionId: string,
): string | null {
  const question = getGnssCorrectionDeliveryQuizQuestion(questionId);
  const optionIndex = question?.options.findIndex(
    (option) => option.id === optionId,
  );

  if (optionIndex === undefined || optionIndex < 0) {
    return null;
  }

  return String.fromCharCode(65 + optionIndex);
}

export function evaluateGnssCorrectionDeliveryQuizAnswer(
  questionId: string,
  optionId: string,
): GnssQuizAnswerEvaluation | null {
  const question = getGnssCorrectionDeliveryQuizQuestion(questionId);
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
