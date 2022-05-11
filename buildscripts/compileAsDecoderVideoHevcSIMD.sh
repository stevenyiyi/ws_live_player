#!/bin/bash

. ./buildscripts/compile-options.sh

# compile wrapper around libhevcdec
emcc \
  $EMCC_COMMON_OPTIONS \
  $EMCC_WASM_OPTIONS \
  $EMCC_NOTHREAD_OPTIONS \
  -msimd128 \
  -s EXPORT_NAME="'ASDecoderVideoHevcSIMDW'" \
  -s EXPORTED_FUNCTIONS="`< src/js/modules/as-decoder-video-exports.json`" \
  -Isrc/c/include \
  --js-library src/js/modules/as-decoder-video-callbacks.js \
  --pre-js src/js/modules/as-module-pre.js \
  --post-js src/js/modules/as-decoder-video.js \
  src/c/as-decoder-video-hevc.c \
  src/c/log.c \
  -Lsrc/c/libs \
  -lhevcdec-simd \
  -o build/as-decoder-video-hevc-simd-wasm.js