/**
 * Generate MP4 Box
 */

export class MP4 {
  static get MOV_TFHD_FLAG_BASE_DATA_OFFSET() {
    return 0x00000001;
  }
  static get MOV_TFHD_FLAG_SAMPLE_DESCRIPTION_INDEX() {
    return 0x00000002;
  }
  static get MOV_TFHD_FLAG_DEFAULT_DURATION() {
    return 0x00000008;
  }
  static get MOV_TFHD_FLAG_DEFAULT_SIZE() {
    return 0x00000010;
  }
  static get MOV_TFHD_FLAG_DEFAULT_FLAGS() {
    return 0x00000020;
  }
  static get MOV_TFHD_FLAG_DURATION_IS_EMPTY() {
    return 0x00010000;
  }
  static get MOV_TFHD_FLAG_DEFAULT_BASE_IS_MOOF() {
    return 0x00020000;
  }
  static get MOV_FRAG_SAMPLE_FLAG_IS_NON_SYNC() {
    return 0x00010000;
  }
  static get MOV_FRAG_SAMPLE_FLAG_DEPENDS_NO() {
    return 0x02000000;
  }
  static get MOV_FRAG_SAMPLE_FLAG_DEPENDS_YES() {
    return 0x01000000;
  }
  static get MOV_SAMPLE_DEPENDENCY_UNKNOWN() {
    return 0x00000000;
  }
  static get MOV_SAMPLE_DEPENDENCY_YES() {
    return 0x00000001;
  }
  static get MOV_SAMPLE_DEPENDENCY_NO() {
    return 0x00000002;
  }

  static get kDataOffsetPresent() {
    return 0x00000001;
  }

  static get kFirstSampleFlagsPresent() {
    return 0x00000004;
  }

  static get kSampleDurationPresent() {
    return 0x00000100;
  }

  static get kSampleSizePresent() {
    return 0x00000200;
  }

  static get kSampleFlagsPresent() {
    return 0x00000400;
  }

  static get kSampleCompositionTimeOffsetPresent() {
    return 0x00000800;
  }

  static init(hasavc = true, hashvc = false) {
    MP4.types = {
      avc1: [], // codingname
      avcC: [],
      btrt: [],
      dinf: [],
      dref: [],
      esds: [],
      ftyp: [],
      hdlr: [],
      hvc1: [],
      hvcC: [],
      mdat: [],
      mdhd: [],
      mdia: [],
      mfhd: [],
      minf: [],
      moof: [],
      moov: [],
      mp4a: [],
      mvex: [],
      mvhd: [],
      sdtp: [],
      sidx: [],
      stbl: [],
      stco: [],
      stsc: [],
      stsd: [],
      stsz: [],
      stts: [],
      tfdt: [],
      tfhd: [],
      traf: [],
      trak: [],
      trun: [],
      trex: [],
      tkhd: [],
      vmhd: [],
      smhd: [],
    };

    var i;
    for (i in MP4.types) {
      if (MP4.types.hasOwnProperty(i)) {
        MP4.types[i] = [
          i.charCodeAt(0),
          i.charCodeAt(1),
          i.charCodeAt(2),
          i.charCodeAt(3),
        ];
      }
    }

    var videoHdlr = new Uint8Array([
      0x00, // version 0
      0x00,
      0x00,
      0x00, // flags
      0x00,
      0x00,
      0x00,
      0x00, // pre_defined
      0x76,
      0x69,
      0x64,
      0x65, // handler_type: 'vide'
      0x00,
      0x00,
      0x00,
      0x00, // reserved
      0x00,
      0x00,
      0x00,
      0x00, // reserved
      0x00,
      0x00,
      0x00,
      0x00, // reserved
      0x56,
      0x69,
      0x64,
      0x65,
      0x6f,
      0x48,
      0x61,
      0x6e,
      0x64,
      0x6c,
      0x65,
      0x72,
      0x00, // name: 'VideoHandler'
    ]);

    var audioHdlr = new Uint8Array([
      0x00, // version 0
      0x00,
      0x00,
      0x00, // flags
      0x00,
      0x00,
      0x00,
      0x00, // pre_defined
      0x73,
      0x6f,
      0x75,
      0x6e, // handler_type: 'soun'
      0x00,
      0x00,
      0x00,
      0x00, // reserved
      0x00,
      0x00,
      0x00,
      0x00, // reserved
      0x00,
      0x00,
      0x00,
      0x00, // reserved
      0x53,
      0x6f,
      0x75,
      0x6e,
      0x64,
      0x48,
      0x61,
      0x6e,
      0x64,
      0x6c,
      0x65,
      0x72,
      0x00, // name: 'SoundHandler'
    ]);

    MP4.HDLR_TYPES = {
      video: videoHdlr,
      audio: audioHdlr,
    };

    var dref = new Uint8Array([
      0x00, // version 0
      0x00,
      0x00,
      0x00, // flags
      0x00,
      0x00,
      0x00,
      0x01, // entry_count
      0x00,
      0x00,
      0x00,
      0x0c, // entry_size
      0x75,
      0x72,
      0x6c,
      0x20, // 'url' type
      0x00, // version 0
      0x00,
      0x00,
      0x01, // entry_flags
    ]);

    var stco = new Uint8Array([
      0x00, // version
      0x00,
      0x00,
      0x00, // flags
      0x00,
      0x00,
      0x00,
      0x00, // entry_count
    ]);

    MP4.STTS = MP4.STSC = MP4.STCO = stco;

    MP4.STSZ = new Uint8Array([
      0x00, // version
      0x00,
      0x00,
      0x00, // flags
      0x00,
      0x00,
      0x00,
      0x00, // sample_size
      0x00,
      0x00,
      0x00,
      0x00, // sample_count
    ]);
    MP4.VMHD = new Uint8Array([
      0x00, // version
      0x00,
      0x00,
      0x01, // flags
      0x00,
      0x00, // graphicsmode
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00, // opcolor
    ]);
    MP4.SMHD = new Uint8Array([
      0x00, // version
      0x00,
      0x00,
      0x00, // flags
      0x00,
      0x00, // balance
      0x00,
      0x00, // reserved
    ]);

    MP4.STSD = new Uint8Array([
      0x00, // version 0
      0x00,
      0x00,
      0x00, // flags
      0x00,
      0x00,
      0x00,
      0x01,
    ]); // entry_count

    var majorBrand = new Uint8Array([105, 115, 111, 54]); // iso6
    var iso4Brand = new Uint8Array([105, 115, 111, 52]); // iso4
    var iso5Brand = new Uint8Array([105, 115, 111, 53]); // iso5
    var avc1Brand = new Uint8Array([97, 118, 99, 49]); // avc1
    var hvc1Brand = new Uint8Array([104, 118, 99, 49]); // hvc1
    var minorVersion = new Uint8Array([0, 0, 0, 1]);
    var dashBrand = new Uint8Array([100, 97, 115, 104]); // dash
    if (hasavc)
      MP4.FTYP = MP4.box(
        MP4.types.ftyp,
        majorBrand,
        minorVersion,
        iso4Brand,
        avc1Brand,
        majorBrand,
        iso5Brand,
        dashBrand
      );
    else
      MP4.FTYP = MP4.box(
        MP4.types.ftyp,
        majorBrand,
        minorVersion,
        iso4Brand,
        hvc1Brand,
        majorBrand,
        iso5Brand,
        dashBrand
      );
    MP4.DINF = MP4.box(MP4.types.dinf, MP4.box(MP4.types.dref, dref));
  }

  static box(type, ...payload) {
    var size = 8,
      i = payload.length,
      len = i,
      result;
    // calculate the total size we need to allocate
    while (i--) {
      size += payload[i].byteLength;
    }
    result = new Uint8Array(size);
    result[0] = (size >> 24) & 0xff;
    result[1] = (size >> 16) & 0xff;
    result[2] = (size >> 8) & 0xff;
    result[3] = size & 0xff;
    result.set(type, 4);
    // copy the payload into the result
    for (i = 0, size = 8; i < len; ++i) {
      // copy payload[i] array @ offset size
      result.set(payload[i], size);
      size += payload[i].byteLength;
    }
    return result;
  }

  static hdlr(type) {
    return MP4.box(MP4.types.hdlr, MP4.HDLR_TYPES[type]);
  }

  static mdat(data) {
    return MP4.box(MP4.types.mdat, data);
  }

  static mdhd(timescale, duration) {
    return MP4.box(
      MP4.types.mdhd,
      new Uint8Array([
        0x00, // version 0
        0x00,
        0x00,
        0x00, // flags
        0x00,
        0x00,
        0x00,
        0x02, // creation_time
        0x00,
        0x00,
        0x00,
        0x03, // modification_time
        (timescale >> 24) & 0xff,
        (timescale >> 16) & 0xff,
        (timescale >> 8) & 0xff,
        timescale & 0xff, // timescale
        duration >> 24,
        (duration >> 16) & 0xff,
        (duration >> 8) & 0xff,
        duration & 0xff, // duration
        0x55,
        0xc4, // 'und' language (undetermined)
        0x00,
        0x00,
      ])
    );
  }

  static mdia(track) {
    return MP4.box(
      MP4.types.mdia,
      MP4.mdhd(track.timescale, track.duration),
      MP4.hdlr(track.type),
      MP4.minf(track)
    );
  }

  static mfhd(sequenceNumber) {
    return MP4.box(
      MP4.types.mfhd,
      new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x00, // flags
        sequenceNumber >> 24,
        (sequenceNumber >> 16) & 0xff,
        (sequenceNumber >> 8) & 0xff,
        sequenceNumber & 0xff, // sequence_number
      ])
    );
  }

  static minf(track) {
    if (track.type === "audio") {
      return MP4.box(
        MP4.types.minf,
        MP4.box(MP4.types.smhd, MP4.SMHD),
        MP4.DINF,
        MP4.stbl(track)
      );
    } else {
      return MP4.box(
        MP4.types.minf,
        MP4.box(MP4.types.vmhd, MP4.VMHD),
        MP4.DINF,
        MP4.stbl(track)
      );
    }
  }

  static sidx(basePresentTime, track, referenced_size) {
    let startWithSAP = track.samples[0].flags.isNonSync ? false : true;
    return MP4.box(
      MP4.types.sidx,
      new Uint8Array([
        0x00,
        0x00,
        0x00,
        0x00, /// version and flags
        0x00,
        0x00,
        0x00,
        0x01, /// reference_ID muset be 1
        (track.timescale >> 24) & 0xff,
        (track.timescale >> 16) & 0xff,
        (track.timescale >> 8) & 0xff,
        track.timescale & 0xff, /// timescale
        (basePresentTime >> 24) & 0xff,
        (basePresentTime >> 16) & 0xff,
        (basePresentTime >> 8) & 0xff,
        basePresentTime & 0xff, /// earliest_presentation_time
        0x00,
        0x00,
        0x00,
        0x00, ///  first_offset
        0x00,
        0x00, /// reserved
        0x00,
        0x01, /// reference_count
        (referenced_size >> 24) & 0xff,
        (referenced_size >> 16) & 0xff,
        (referenced_size >> 8) & 0xff,
        referenced_size & 0xff, /// referenced_size
        (track.segmentDuration >> 24) & 0xff,
        (track.segmentDuration >> 16) & 0xff,
        (track.segmentDuration >> 8) & 0xff,
        track.segmentDuration & 0xff, /// subsegment_duration
        startWithSAP ? 0x80 : 0x00, /// startsWithSAP
        0x00,
        0x00,
        0x00,
      ])
    );
  }

  static moof(sn, baseMediaDecodeTime, track) {
    return MP4.box(
      MP4.types.moof,
      MP4.mfhd(sn),
      MP4.traf(track, baseMediaDecodeTime)
    );
  }
  /**
   * @param tracks... (optional) {array} the tracks associated with this movie
   */
  static moov(tracks, duration, timescale) {
    var i = tracks.length,
      boxes = [];

    while (i--) {
      boxes[i] = MP4.trak(tracks[i]);
    }

    return MP4.box.apply(
      null,
      [MP4.types.moov, MP4.mvhd(timescale, duration)]
        .concat(boxes)
        .concat(MP4.mvex(tracks))
    );
  }

  static mvex(tracks) {
    var i = tracks.length,
      boxes = [];

    while (i--) {
      boxes[i] = MP4.trex(tracks[i]);
    }
    return MP4.box.apply(null, [MP4.types.mvex].concat(boxes));
  }

  static mvhd(timescale, duration) {
    var bytes = new Uint8Array([
      0x00, // version 0
      0x00,
      0x00,
      0x00, // flags
      0x00,
      0x00,
      0x00,
      0x01, // creation_time
      0x00,
      0x00,
      0x00,
      0x02, // modification_time
      (timescale >> 24) & 0xff,
      (timescale >> 16) & 0xff,
      (timescale >> 8) & 0xff,
      timescale & 0xff, // timescale
      (duration >> 24) & 0xff,
      (duration >> 16) & 0xff,
      (duration >> 8) & 0xff,
      duration & 0xff, // duration
      0x00,
      0x01,
      0x00,
      0x00, // 1.0 rate
      0x01,
      0x00, // 1.0 volume
      0x00,
      0x00, // reserved
      0x00,
      0x00,
      0x00,
      0x00, // reserved
      0x00,
      0x00,
      0x00,
      0x00, // reserved
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x40,
      0x00,
      0x00,
      0x00, // transformation: unity matrix
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00, // pre_defined
      0xff,
      0xff,
      0xff,
      0xff, // next_track_ID
    ]);
    return MP4.box(MP4.types.mvhd, bytes);
  }

  static sdtp(track) {
    var samples = track.samples || [],
      bytes = new Uint8Array(4 + samples.length),
      flags,
      i;
    // leave the full box header (4 bytes) all zero
    // write the sample table
    for (i = 0; i < samples.length; i++) {
      flags = samples[i].flags;
      bytes[i + 4] =
        (flags.dependsOn << 4) |
        (flags.isDependedOn << 2) |
        flags.hasRedundancy;
    }

    return MP4.box(MP4.types.sdtp, bytes);
  }

  static stbl(track) {
    return MP4.box(
      MP4.types.stbl,
      MP4.stsd(track),
      MP4.box(MP4.types.stts, MP4.STTS),
      MP4.box(MP4.types.stsc, MP4.STSC),
      MP4.box(MP4.types.stsz, MP4.STSZ),
      MP4.box(MP4.types.stco, MP4.STCO)
    );
  }

  static avc1(track) {
    var sps = [],
      pps = [],
      i,
      data,
      len;
    // assemble the SPSs

    for (i = 0; i < track.sps.length; i++) {
      data = track.sps[i];
      len = data.byteLength;
      sps.push((len >>> 8) & 0xff);
      sps.push(len & 0xff);
      sps = sps.concat(Array.prototype.slice.call(data)); // SPS
    }

    // assemble the PPSs
    for (i = 0; i < track.pps.length; i++) {
      data = track.pps[i];
      len = data.byteLength;
      pps.push((len >>> 8) & 0xff);
      pps.push(len & 0xff);
      pps = pps.concat(Array.prototype.slice.call(data));
    }

    var avcc = MP4.box(
        MP4.types.avcC,
        new Uint8Array(
          [
            0x01, // version
            sps[3], // profile
            sps[4], // profile compat
            sps[5], // level
            0xfc | 3, // lengthSizeMinusOne, hard-coded to 4 bytes
            0xe0 | track.sps.length, // 3bit reserved (111) + numOfSequenceParameterSets
          ]
            .concat(sps)
            .concat([
              track.pps.length, // numOfPictureParameterSets
            ])
            .concat(pps)
        )
      ), // "PPS"
      width = track.width,
      height = track.height;
    //console.log('avcc:' + Hex.hexDump(avcc));
    return MP4.box(
      MP4.types.avc1,
      new Uint8Array([
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        0x01, // data_reference_index
        0x00,
        0x00, // pre_defined
        0x00,
        0x00, // reserved
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00, // pre_defined
        (width >> 8) & 0xff,
        width & 0xff, // width
        (height >> 8) & 0xff,
        height & 0xff, // height
        0x00,
        0x48,
        0x00,
        0x00, // horizresolution
        0x00,
        0x48,
        0x00,
        0x00, // vertresolution
        0x00,
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        0x01, // frame_count
        0x12,
        0x62,
        0x69,
        0x6e,
        0x65, //binelpro.ru
        0x6c,
        0x70,
        0x72,
        0x6f,
        0x2e,
        0x72,
        0x75,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00, // compressorname
        0x00,
        0x18, // depth = 24
        0x11,
        0x11,
      ]), // pre_defined = -1
      avcc,
      MP4.box(
        MP4.types.btrt,
        new Uint8Array([
          0x00,
          0x1c,
          0x9c,
          0x80, // bufferSizeDB
          0x00,
          0x2d,
          0xc6,
          0xc0, // maxBitrate
          0x00,
          0x2d,
          0xc6,
          0xc0,
        ])
      ) // avgBitrate
    );
  }

  static esds(track) {
    var configlen = track.config.byteLength;
    let data = new Uint8Array(26 + configlen + 3);
    data.set([
      0x00, // version 0
      0x00,
      0x00,
      0x00, // flags

      0x03, // descriptor_type
      0x17 + configlen, // length
      0x00,
      0x01, //es_id
      0x00, // stream_priority

      0x04, // descriptor_type
      0x0f + configlen, // length
      0x40, //codec : mpeg4_audio
      0x15, // stream_type
      0x00,
      0x00,
      0x00, // buffer_size
      0x00,
      0x00,
      0x00,
      0x00, // maxBitrate
      0x00,
      0x00,
      0x00,
      0x00, // avgBitrate

      0x05, // descriptor_type
      configlen,
    ]);
    data.set(track.config, 26);
    data.set([0x06, 0x01, 0x02], 26 + configlen);
    // return new Uint8Array([
    //     0x00, // version 0
    //     0x00, 0x00, 0x00, // flags
    //
    //     0x03, // descriptor_type
    //     0x17+configlen, // length
    //     0x00, 0x01, //es_id
    //     0x00, // stream_priority
    //
    //     0x04, // descriptor_type
    //     0x0f+configlen, // length
    //     0x40, //codec : mpeg4_audio
    //     0x15, // stream_type
    //     0x00, 0x00, 0x00, // buffer_size
    //     0x00, 0x00, 0x00, 0x00, // maxBitrate
    //     0x00, 0x00, 0x00, 0x00, // avgBitrate
    //
    //     0x05 // descriptor_type
    // ].concat([configlen]).concat(track.config).concat([0x06, 0x01, 0x02])); // GASpecificConfig)); // length + audio config descriptor
    return data;
  }

  static hvc1(track) {
    var vps = [],
      sps = [],
      pps = [],
      i,
      data,
      len;

    // assemble the VPSs/SPSs/PPSs
    let numNalus = track.vps.length;
    // nalu type of vps
    vps.push(32 | 0x80);

    vps.push((numNalus >>> 8) & 0xff);
    vps.push(numNalus & 0xff);

    for (i = 0; i < numNalus; i++) {
      data = track.vps[i];
      len = data.byteLength;
      vps.push((len >>> 8) & 0xff);
      vps.push(len & 0xff);
      vps = vps.concat(Array.prototype.slice.call(data)); // VPS
    }

    numNalus = track.sps.length;
    // nalu type of sps
    sps.push(33 | 0x80);
    sps.push((numNalus >>> 8) & 0xff);
    sps.push(numNalus & 0xff);

    for (i = 0; i < numNalus; i++) {
      data = track.sps[i];
      len = data.byteLength;
      sps.push((len >>> 8) & 0xff);
      sps.push(len & 0xff);
      sps = sps.concat(Array.prototype.slice.call(data)); // VPS
    }

    numNalus = track.pps.length;
    // nalu type of sps
    pps.push(34 | 0x80);
    pps.push((numNalus >>> 8) & 0xff);
    pps.push(numNalus & 0xff);

    for (i = 0; i < numNalus; i++) {
      data = track.pps[i];
      len = data.byteLength;
      pps.push((len >>> 8) & 0xff);
      pps.push(len & 0xff);
      pps = pps.concat(Array.prototype.slice.call(data)); // VPS
    }

    let hvcc = MP4.box(
      MP4.types.hvcC,
      new Uint8Array(
        [
          0x01, // version
          (track.vpsconfig.GeneralProfileSpace << 6) |
            (track.vpsconfig.GeneralTierFlag << 5) |
            track.vpsconfig.GeneralProfileIdc,
          (track.vpsconfig.CompatibilityFlags >> 24) & 0xff,
          (track.vpsconfig.CompatibilityFlags >> 16) & 0xff,
          (track.vpsconfig.CompatibilityFlags >> 8) & 0xff,
          track.vpsconfig.CompatibilityFlags & 0xff,
          (track.vpsconfig.ConstraintIdcFlags >> 40) & 0xff,
          (track.vpsconfig.ConstraintIdcFlags >> 32) & 0xff,
          (track.vpsconfig.ConstraintIdcFlags >> 24) & 0xff,
          (track.vpsconfig.ConstraintIdcFlags >> 16) & 0xff,
          (track.vpsconfig.ConstraintIdcFlags >> 8) & 0xff,
          track.vpsconfig.ConstraintIdcFlags & 0xff,
          track.vpsconfig.GeneralLevelIdc,
          0xf0,
          0x0,
          0xfc,
          0xfc | track.vpsconfig.ChromaFormatIdc,
          0xf8 | track.vpsconfig.BitDepthLumaMinus8,
          0xf8 | track.vpsconfig.BitDepthChromaMinus8,
          0x0,
          0x0,
          0x3,
          0x3,
        ]
          .concat(vps)
          .concat(sps)
          .concat(pps)
      )
    );

    let width = track.width;
    let height = track.height;
    //console.log('avcc:' + Hex.hexDump(avcc));
    return MP4.box(
      MP4.types.hvc1,
      new Uint8Array([
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        0x01, // data_reference_index
        0x00,
        0x00, // pre_defined
        0x00,
        0x00, // reserved
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00, // pre_defined
        (width >> 8) & 0xff,
        width & 0xff, // width
        (height >> 8) & 0xff,
        height & 0xff, // height
        0x00,
        0x48,
        0x00,
        0x00, // horizresolution
        0x00,
        0x48,
        0x00,
        0x00, // vertresolution
        0x00,
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        0x01, // frame_count
        0x12,
        0x62,
        0x69,
        0x6e,
        0x65, //binelpro.ru
        0x6c,
        0x70,
        0x72,
        0x6f,
        0x2e,
        0x72,
        0x75,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00, // compressorname
        0x00,
        0x18, // depth = 24
        0x11,
        0x11,
      ]), // pre_defined = -1
      hvcc,
      MP4.box(
        MP4.types.btrt,
        new Uint8Array([
          0x00,
          0x1c,
          0x9c,
          0x80, // bufferSizeDB
          0x00,
          0x2d,
          0xc6,
          0xc0, // maxBitrate
          0x00,
          0x2d,
          0xc6,
          0xc0,
        ])
      ) // avgBitrate
    );
  }

  static mp4a(track) {
    var audiosamplerate = track.audiosamplerate;
    return MP4.box(
      MP4.types.mp4a,
      new Uint8Array([
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        0x01, // data_reference_index
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        track.channelCount, // channelcount
        0x00,
        0x10, // sampleSize:16bits
        0x00,
        0x00, // pre_defined
        0x00,
        0x00, // reserved2
        (audiosamplerate >> 8) & 0xff,
        audiosamplerate & 0xff, //
        0x00,
        0x00,
      ]),
      MP4.box(MP4.types.esds, MP4.esds(track))
    );
  }

  static stsd(track) {
    if (track.type === "audio") {
      return MP4.box(MP4.types.stsd, MP4.STSD, MP4.mp4a(track));
    } else {
      if (track.vps) {
        return MP4.box(MP4.types.stsd, MP4.STSD, MP4.hvc1(track));
      } else {
        return MP4.box(MP4.types.stsd, MP4.STSD, MP4.avc1(track));
      }
    }
  }

  static tkhd(track) {
    var id = track.id,
      duration = track.duration,
      width = track.width,
      height = track.height,
      volume = track.volume;
    return MP4.box(
      MP4.types.tkhd,
      new Uint8Array([
        0x00, // version 0
        0x00,
        0x00,
        0x07, // flags
        0x00,
        0x00,
        0x00,
        0x00, // creation_time
        0x00,
        0x00,
        0x00,
        0x00, // modification_time
        (id >> 24) & 0xff,
        (id >> 16) & 0xff,
        (id >> 8) & 0xff,
        id & 0xff, // track_ID
        0x00,
        0x00,
        0x00,
        0x00, // reserved
        duration >> 24,
        (duration >> 16) & 0xff,
        (duration >> 8) & 0xff,
        duration & 0xff, // duration
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00, // reserved
        0x00,
        0x00, // layer
        0x00,
        0x00, // alternate_group
        (volume >> 0) & 0xff,
        (((volume % 1) * 10) >> 0) & 0xff, // track volume // FIXME
        0x00,
        0x00, // reserved
        0x00,
        0x01,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x01,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x40,
        0x00,
        0x00,
        0x00, // transformation: unity matrix
        (width >> 8) & 0xff,
        width & 0xff,
        0x00,
        0x00, // width
        (height >> 8) & 0xff,
        height & 0xff,
        0x00,
        0x00, // height
      ])
    );
  }

  static getSampleFlags(track, i) {
    let flags = 0;
    if (track.samples[i].flags.isNonSync === 0) {
      flags = MP4.MOV_FRAG_SAMPLE_FLAG_DEPENDS_NO;
    } else {
      flags =
        MP4.MOV_FRAG_SAMPLE_FLAG_DEPENDS_YES |
        MP4.MOV_FRAG_SAMPLE_FLAG_IS_NON_SYNC;
    }
    return flags;
  }

  static tfhd(track) {
    let id = track.id;
    let flags =
      MP4.MOV_TFHD_FLAG_DEFAULT_FLAGS |
      MP4.MOV_TFHD_FLAG_SAMPLE_DESCRIPTION_INDEX |
      MP4.MOV_TFHD_FLAG_DEFAULT_BASE_IS_MOOF;

    if (track.samples.length > 0) {
      flags |= MP4.MOV_TFHD_FLAG_DEFAULT_DURATION;
      flags |= MP4.MOV_TFHD_FLAG_DEFAULT_SIZE;
      track.defaultSampleDuration = track.samples[0].duration;
      track.defaultSampleSize = track.samples[0].size;
    } else {
      flags |= MP4.MOV_TFHD_FLAG_DURATION_IS_EMPTY;
    }

    let len = 12;
    if (track.samples.length) {
      len += 8;
    }
    len += 4;
    let buf = new Uint8Array(len);
    let i = 0;
    buf[i++] = (flags >> 24) & 0xff;
    buf[i++] = (flags >> 16) & 0xff;
    buf[i++] = (flags >> 8) & 0xff;
    buf[i++] = flags & 0xff; /// flags
    buf[i++] = (id >> 24) & 0xff;
    buf[i++] = (id >> 16) & 0xff;
    buf[i++] = (id >> 8) & 0xff;
    buf[i++] = id & 0xff; // track_ID

    buf[i++] = 0x00;
    buf[i++] = 0x00;
    buf[i++] = 0x00;
    buf[i++] = 0x01; ///sample_description_index, CMAF must

    if (track.samples.length) {
      buf[i++] = (track.defaultSampleDuration >> 24) & 0xff;
      buf[i++] = (track.defaultSampleDuration >> 16) & 0xff;
      buf[i++] = (track.defaultSampleDuration >> 8) & 0xff;
      buf[i++] = track.defaultSampleDuration & 0xff;
      buf[i++] = (track.defaultSampleSize >> 24) & 0xff;
      buf[i++] = (track.defaultSampleSize >> 16) & 0xff;
      buf[i++] = (track.defaultSampleSize >> 8) & 0xff;
      buf[i++] = track.defaultSampleSize & 0xff;
    }
    /* Set the default flags based on the second sample, if available.
     * If the first sample is different, that can be signaled via a separate field. */
    track.defaultSampleFlags = 0;
    if (track.samples.length > 1) {
      track.defaultSampleFlags = MP4.getSampleFlags(track, 1);
    } else {
      track.defaultSampleFlags =
        track.type === "video"
          ? MP4.MOV_FRAG_SAMPLE_FLAG_DEPENDS_YES |
            MP4.MOV_FRAG_SAMPLE_FLAG_IS_NON_SYNC
          : MP4.MOV_FRAG_SAMPLE_FLAG_DEPENDS_NO;
    }

    buf[i++] = (track.defaultSampleFlags >> 24) & 0xff;
    buf[i++] = (track.defaultSampleFlags >> 16) & 0xff;
    buf[i++] = (track.defaultSampleFlags >> 8) & 0xff;
    buf[i++] = track.defaultSampleFlags & 0xff;

    return buf;
  }

  static traf(track, baseMediaDecodeTime) {
    let sampleDependencyTable = MP4.sdtp(track);
    let bufTfhd = MP4.tfhd(track);

    return MP4.box(
      MP4.types.traf,
      MP4.box(MP4.types.tfhd, bufTfhd),
      MP4.box(
        MP4.types.tfdt,
        new Uint8Array([
          0x00, // version 0
          0x00,
          0x00,
          baseMediaDecodeTime > 2147483647 ? 0x01 : 0x00, // flags
          baseMediaDecodeTime >> 24,
          (baseMediaDecodeTime >> 16) & 0xff,
          (baseMediaDecodeTime >> 8) & 0xff,
          baseMediaDecodeTime & 0xff, // baseMediaDecodeTime
        ])
      ),
      MP4.trun(
        track,
        sampleDependencyTable.length + //sdtp
          bufTfhd.length +
          8 + // tfhd
          16 + // tfdt
          8 + // traf header
          16 + // mfhd
          8 + // moof header
          8
      ), // mdat header
      sampleDependencyTable
    );
  }

  /**
   * Generate a track box.
   * @param track {object} a track definition
   * @return {Uint8Array} the track box
   */
  static trak(track) {
    track.duration = track.duration || 0xffffffff;
    return MP4.box(MP4.types.trak, MP4.tkhd(track), MP4.mdia(track));
  }

  static trex(track) {
    var id = track.id;
    return MP4.box(
      MP4.types.trex,
      new Uint8Array([
        0x00, // version 0
        0x00,
        0x00,
        0x00, // flags
        id >> 24,
        (id >> 16) & 0xff,
        (id >> 8) & 0xff,
        id & 0xff, // track_ID
        0x00,
        0x00,
        0x00,
        0x01, // default_sample_description_index
        0x00,
        0x00,
        0x00,
        0x00, // default_sample_duration
        0x00,
        0x00,
        0x00,
        0x00, // default_sample_size
        0x00,
        0x00,
        0x00,
        0x00, // default_sample_flags
      ])
    );
  }

  static trun(track, offset) {
    let ver = 0;
    let len = 12;
    let samples = track.samples || [];
    let sampleCount = samples.length;
    let trFlags = MP4.kDataOffsetPresent;
    for (let i = 0; i < sampleCount; i++) {
      if (samples[i].duration !== track.defaultSampleDuration) {
        trFlags |= MP4.kSampleDurationPresent;
        len += 4 * sampleCount;
      }
      if (samples[i].size !== track.defaultSampleSize) {
        trFlags |= MP4.kSampleSizePresent;
        len += 4 * sampleCount;
      }
      if (i > 0 && MP4.getSampleFlags(track, i) !== track.defaultSampleFlags) {
        trFlags |= MP4.kSampleFlagsPresent;
        len += 4 * sampleCount;
      }
      if (samples[i].cts !== 0) {
        trFlags |= MP4.kSampleCompositionTimeOffsetPresent;
        len += 4 * sampleCount;
        if (track.sample[i].cts < 0) {
          ver = 1;
        }
      }
    }
    if (
      !(trFlags & MP4.kSampleFlagsPresent) &&
      sampleCount > 0 &&
      MP4.getSampleFlags(track, 0) !== track.defaultSampleFlags
    ) {
      trFlags |= MP4.kFirstSampleFlagsPresent;
      len += 4;
    }
    offset += len + 8;
    let buf = new Uint8Array(len);
    let n = 0;
    buf[n++] = ver; /// version
    buf[n++] = (trFlags >> 16) & 0xff;
    buf[n++] = (trFlags >> 8) & 0xff;
    buf[n++] = trFlags & 0xff; /// flags

    buf[n++] = (sampleCount >> 24) & 0xff;
    buf[n++] = (sampleCount >> 16) & 0xff;
    buf[n++] = (sampleCount >> 8) & 0xff;
    buf[n++] = sampleCount & 0xff; /// Sample Count

    buf[n++] = (offset >> 24) & 0xff;
    buf[n++] = (offset >> 16) & 0xff;
    buf[n++] = (offset >> 8) & 0xff;
    buf[n++] = offset & 0xff;

    if (trFlags & MP4.kFirstSampleFlagsPresent) {
      let firtSampleFlags = MP4.getSampleFlags(track, 0);
      buf[n++] = (firtSampleFlags >> 24) & 0xff;
      buf[n++] = (firtSampleFlags >> 16) & 0xff;
      buf[n++] = (firtSampleFlags >> 8) & 0xff;
      buf[n++] = firtSampleFlags & 0xff;
    }

    for (let i = 0; i < sampleCount; i++) {
      if (trFlags & MP4.kSampleDurationPresent) {
        let duration = samples[i].duration;
        buf[n++] = (duration >> 24) & 0xff;
        buf[n++] = (duration >> 16) & 0xff;
        buf[n++] = (duration >> 8) & 0xff;
        buf[n++] = duration & 0xff;
      }

      if (trFlags & MP4.kSampleSizePresent) {
        let size = samples[i].size;
        buf[n++] = (size >> 24) & 0xff;
        buf[n++] = (size >> 16) & 0xff;
        buf[n++] = (size >> 8) & 0xff;
        buf[n++] = size & 0xff;
      }

      if (trFlags & MP4.kSampleFlagsPresent) {
        let flags = MP4.getSampleFlags(track, i);
        buf[n++] = (flags >> 24) & 0xff;
        buf[n++] = (flags >> 16) & 0xff;
        buf[n++] = (flags >> 8) & 0xff;
        buf[n++] = flags & 0xff;
      }

      if (trFlags & MP4.kSampleCompositionTimeOffsetPresent) {
        let cts = samples[i].cts;
        buf[n++] = (cts >> 24) & 0xff;
        buf[n++] = (cts >> 16) & 0xff;
        buf[n++] = (cts >> 8) & 0xff;
        buf[n++] = cts & 0xff;
      }
    }
    return MP4.box(MP4.types.trun, buf);
  }

  static initSegment(hasavc, tracks, duration, timescale) {
    if (!MP4.types) {
      MP4.init(hasavc);
    }
    console.log(
      `initSegment, duration:${duration},timescale:${timescale},mp4track duration:${tracks[0].duration},mp4track timescale:${tracks[0].timescale}`
    );
    var movie = MP4.moov(tracks, duration, timescale),
      result;
    result = new Uint8Array(MP4.FTYP.byteLength + movie.byteLength);
    result.set(MP4.FTYP);
    result.set(movie, MP4.FTYP.byteLength);
    return result;
  }
}
