import { MediaAccessunit } from "../MediaAccessunit.js";
import { NALUAsm } from "../parsers/nalu-asm.js";
import { NALUAsmHevc } from "../parsers/nalu-asm-hevc.js";
import { AACAsm } from "../parsers/aac-asm.js";
import { TSParser } from "../parsers/ts.js";
import { PayloadType } from "../StreamDefine.js";
import { TinyEvents } from "../utils/event.js";
import { ASMediaError } from "../utils/ASMediaError.js";
import { Log } from "../utils/logger.js";

export class RTPPayloadParser extends TinyEvents {
  constructor() {
    super();
    this.h264parser = new RTPH264Parser();
    this.h265parser = new RTPH265Parser();
    this.aacparser = new RTPAACParser();
    this.g7xxparser = new RTPGXXParser();
    this.tsparser = new TSParser();
    this.tsparser.ontracks = (tracks) => {
      this.emit("tracks", tracks);
    };
  }

  reset() {
    this.tsparser.reset();
  }

  parse(rtp) {
    let parsed = null;
    if (rtp.media.type === "video" && rtp.media.ptype === PayloadType.H264) {
      parsed = this.h264parser.parse(rtp);
      if (parsed) {
        this.emit("sample", parsed);
      }
    } else if (
      rtp.media.type === "video" &&
      rtp.media.ptype === PayloadType.H265
    ) {
      parsed = this.h265parser.parse(rtp);
      if (parsed) {
        this.emit("sample", parsed);
      }
    } else if (
      rtp.media.type === "video" &&
      rtp.media.ptype === PayloadType.TS
    ) {
      /** Parse mpeg2ts */
      let data = rtp.getPayload();
      let offset = 0;
      if (data.byteLength % TSParser.PACKET_LENGTH) {
        Log.error(`Invalid rtp ts payload length:${data.ByteLength}`);
        return;
      }

      while (offset < data.byteLength) {
        parsed = this.tsparser.parse(
          data.subarray(offset, offset + TSParser.PACKET_LENGTH)
        );
        offset += TSParser.PACKET_LENGTH;
        if (parsed) {
          this.emit("sample", parsed);
        }
      }
    } else if (
      rtp.media.type === "audio" &&
      rtp.media.ptype === PayloadType.AAC
    ) {
      parsed = this.aacparser.parse(rtp);
      if (parsed) {
        this.emit("sample", parsed);
      }
    } else if (
      rtp.media.type === "audio" &&
      (rtp.media.ptype === PayloadType.G711 ||
        rtp.media.ptype === PayloadType.G722 ||
        rtp.media.ptype === PayloadType.G723 ||
        rtp.media.ptype === PayloadType.G726 ||
        rtp.media.ptype === PayloadType.G729)
    ) {
      parsed = this.g7xxparser.parse(rtp);
      if (parsed) {
        this.emit("sample", parsed);
      }
    } else {
      throw ASMediaError(
        ASMediaError.MEDIA_ERROR_AV,
        `Not support codec:${PayloadType.stringCodec(rtp.media.ptype)}`
      );
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
        rtp.getTimestamp(),
        rtp.getTimestamp(),
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
        rtp.getTimestamp(),
        rtp.getTimestamp(),
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
      ((Math.round(rtp.getTimestamp() / 1024) << 10) * 90000) /
      this.config.samplerate;
    return new MediaAccessunit(rtp.type, ts, ts, acus);
  }
}

class RTPGXXParser {
  parse(rtp) {
    return new MediaAccessunit(
      rtp.type,
      rtp.getTimestamp(),
      rtp.getTimestamp(),
      rtp.getPayload()
    );
  }
}
