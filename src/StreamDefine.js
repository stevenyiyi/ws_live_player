export class StreamType {
  static get VIDEO() {
    return 1;
  }
  static get AUDIO() {
    return 2;
  }
  static get CONTAINER() {
    return 3;
  }

  static get map() {
    return {
      [StreamType.VIDEO]: "video",
      [StreamType.AUDIO]: "audio",
      [StreamType.CONTAINER]: "container"
    };
  }
}

export class PayloadType {
  static get H264() {
    return 1;
  }
  static get H265() {
    return 2;
  }
  static get AV1() {
    return 3;
  }
  static get VP9() {
    return 4;
  }
  static get AAC() {
    return 5;
  }
  static get ALAW() {
    return 6;
  }
  static get ULAW() {
    return 7;
  }
  static get OPUS() {
    return 8;
  }
  static get G722() {
    return 9;
  }
  static get G723() {
    return 10;
  }
  static get G726() {
    return 11;
  }
  static get G729() {
    return 12;
  }
  static get TS() {
    return 13;
  }
  static get PS() {
    return 14;
  }

  static get map() {
    return {
      [PayloadType.H264]: "video",
      [PayloadType.H265]: "video",
      [PayloadType.AV1]: "video",
      [PayloadType.VP9]: "video",
      [PayloadType.AAC]: "audio",
      [PayloadType.ALAW]: "audio",
      [PayloadType.ULAW]: "audio",
      [PayloadType.OPUS]: "audio",
      [PayloadType.G722]: "audio",
      [PayloadType.G723]: "audio",
      [PayloadType.G726]: "audio",
      [PayloadType.G729]: "audio",
      [PayloadType.TS]: "container",
      [PayloadType.PS]: "container"
    };
  }

  static get string_map() {
    return {
      H264: PayloadType.H264,
      H265: PayloadType.H265,
      AV1: PayloadType.AV1,
      VP9: PayloadType.VP9,
      AAC: PayloadType.AAC,
      "MP4A-LATM": PayloadType.AAC,
      "MPEG4-GENERIC": PayloadType.AAC,
      PCMA: PayloadType.ALAW,
      PCMU: PayloadType.ULAW,
      opus: PayloadType.OPUS,
      G722: PayloadType.G722,
      G723: PayloadType.G723,
      G726: PayloadType.G726,
      G729: PayloadType.G729,
      M2TS: PayloadType.TS,
      PS: PayloadType.PS
    };
  }

  static stringCodec(codecid) {
    const scodecs = [
      "unknown",
      "h264",
      "h265",
      "av1",
      "vp9",
      "aac",
      "alaw",
      "ulaw",
      "opus",
      "g722",
      "g723",
      "g726",
      "g729",
      "ts",
      "ps"
    ];
    return scodecs[codecid];
  }
}
