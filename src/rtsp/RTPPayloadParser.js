import { MediaAccessunit } from "../MediaAccessunit.js";
import { NALUAsm } from "../parsers/nalu-asm.js";
import { NALUAsmHevc } from "../parsers/nalu-asm-hevc.js";
import { AACAsm } from "../parsers/aac-asm.js";
import { TSParser } from "../parsers/ts.js";
import { PayloadType, StreamType } from "../StreamDefine.js";
import { Log } from "../utils/logger.js";

export class RTPPayloadParser {
  constructor() {
    this.h264parser = new RTPH264Parser();
    this.h265parser = new RTPH265Parser();
    this.aacparser = new RTPAACParser();
    this.g7xxparser = new RTPGXXParser();
    this.tsparser = new TSParser();
    this.ontracks = null;
    this.tsparser.ontracks = (tracks) => {
      this.ontracks(tracks);
    };
  }

  parse(rtp) {
    if (rtp.media.type === "video" && rtp.media.ptype === PayloadType.H264) {
      return this.h264parser.parse(rtp);
    } else if (
      rtp.media.type === "video" &&
      rtp.media.ptype === PayloadType.H265
    ) {
      return this.h265parser.parse(rtp);
    } else if (
      rtp.media.type === "video" &&
      rtp.media.ptype === PayloadType.TS
    ) {
      /** Parse mpeg2ts */
      let data = rtp.getPayload();
      let offset = 0;
      if (data.byteLength % TSParser.PACKET_LENGTH) {
        Log.error(`Invalid rtp ts payload length:${data.ByteLength}`);
        throw new Error(`Invalid rtp ts payload length:${data.ByteLength}`);
      }
      while (offset < data.byteLength) {
        let parsed = this.tsparser.parse(
          data.subarray(offset, offset + TSParser.PACKET_LENGTH)
        );
        offset += TSParser.PACKET_LENGTH;
        if (parsed) {
          return parsed;
        }
      }
    } else if (
      rtp.media.type === "audio" &&
      rtp.media.ptype === PayloadType.AAC
    ) {
      return this.aacparser.parse(rtp);
    } else if (
      rtp.media.type === "audio" &&
      (rtp.media.ptype === PayloadType.G711 ||
        rtp.media.ptype === PayloadType.G722 ||
        rtp.media.ptype === PayloadType.G723 ||
        rtp.media.ptype === PayloadType.G726 ||
        rtp.media.ptype === PayloadType.G729)
    ) {
      return this.g7xxparser.parse(rtp);
    } else {
      return null;
    }
  }
}

class RTPH264Parser {
  constructor() {
    this.naluasm = new NALUAsm();
  }

  parse(rtp) {
    let nalus = this.naluasm.onNALUFragment(rtp.getPayload());
    if (nalus) {
      return new MediaAccessunit(
        rtp.type,
        rtp.getTimestampMS(),
        rtp.getTimestampMS(),
        nalus
      );
    } else {
      return null;
    }
  }
}

class RTPH265Parser {
  constructor() {
    this.naluasm = new NALUAsmHevc();
  }

  parse(rtp) {
    let nalus = this.naluasm.onNALUFragment(rtp.getPayload());
    if (nalus) {
      return new MediaAccessunit(
        rtp.type,
        rtp.getTimestampMS(),
        rtp.getTimestampMS(),
        nalus
      );
    } else {
      return null;
    }
  }
}

class RTPAACParser {
  constructor() {
    this.scale = 1;
    this.asm = new AACAsm();
  }

  setConfig(conf) {
    this.asm.config = conf;
  }

  parse(rtp) {
    let acus = this.asm.onAACFragment(rtp);
    let ts =
      ((Math.round(rtp.getTimestampMS() / 1024) << 10) * 90000) /
      this.config.samplerate;
    return new MediaAccessunit(rtp.type, ts, ts, acus);
  }
}

class RTPGXXParser {
  parse(rtp) {
    return new MediaAccessunit(
      rtp.type,
      rtp.getTimestampMS(),
      rtp.getTimestampMS(),
      rtp.getPayload()
    );
  }
}
