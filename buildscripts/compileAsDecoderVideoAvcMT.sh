#!/bin/bash

. ./buildscripts/compile-options.sh

# compile wrapper around libvpx
emcc \
  $EMCC_COMMON_OPTIONS \
  $EMCC_WASM_OPTIONS \
  $EMCC_THREADED_OPTIONS \
  -s EXPORT_NAME="'ASDecoderVideoAvcMTW'" \
  -s EXPORTED_FUNCTIONS="`< src/js/modules/as-decoder-video-exports.json`" \
  -Isrc/c/include \
  --js-library src/js/modules/as-decoder-video-callbacks.js \
  --pre-js src/js/modules/as-module-pre.js \
  --post-js src/js/modules/as-decoder-video.js \
  src/c/as-decoder-video-avc.c \
  src/c/log.c \
  -Lsrc/c/libs \
  -lavcdec-mt \
  -o build/as-decoder-video-avc-mt-wasm.js