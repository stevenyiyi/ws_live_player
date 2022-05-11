#!/bin/bash

. ./buildscripts/compile-options.sh

# compile wrapper around libavcdec
emcc \
  $EMCC_COMMON_OPTIONS \
  $EMCC_WASM_OPTIONS \
  $EMCC_NOTHREAD_OPTIONS \
  -s EXPORT_NAME="'ASDecoderVideoAvcW'" \
  -s EXPORTED_FUNCTIONS="`< src/js/modules/as-decoder-video-exports.json`" \
  -Isrc/c/include \
  --js-library src/js/modules/as-decoder-video-callbacks.js \
  --pre-js src/js/modules/as-module-pre.js \
  --post-js src/js/modules/as-decoder-video.js \
  src/c/as-decoder-video-avc.c \
  src/c/log.c \
  -Lsrc/c/libs \
  -lavcdec \
  -o build/as-decoder-video-avc-wasm.js