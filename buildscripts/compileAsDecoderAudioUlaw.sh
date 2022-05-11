#!/bin/bash

. ./buildscripts/compile-options.sh

# compile wrapper around libogg + libopus
emcc \
  $EMCC_COMMON_OPTIONS \
  $EMCC_WASM_OPTIONS \
  $EMCC_NOTHREAD_OPTIONS \
  -s EXPORT_NAME="'ASDecoderAudioUlawW'" \
  -s EXPORTED_FUNCTIONS="`< src/js/modules/as-decoder-audio-exports.json`" \
  -Isrc/c/include \
  --js-library src/js/modules/as-decoder-audio-callbacks.js \
  --pre-js src/js/modules/as-module-pre.js \
  --post-js src/js/modules/as-decoder-audio.js \
  src/c/as-decoder-audio-ulaw.c \
  -Lsrc/c/libs \
  -lg711 \
  -o build/as-decoder-audio-ulaw-wasm.js \
