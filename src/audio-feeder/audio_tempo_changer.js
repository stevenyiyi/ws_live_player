/*
 * Phase Vocoder for changing tempo of audio without affecting pitch
 * Originally cross-compiled from HaXe
 *
 * Copyright (c) 2015-2019 Margus Niitsoo
 */

import { VH } from "./vector_helper.js";
import { FFT } from "./fft.js";

const AudioTempoChanger = function (opts) {
  /**************************
   * Fill in sensible defaults
   **************************/

  opts = opts || {};
  var sampleRate = opts.sampleRate || 44100;
  var wsizeLog = opts.wsizeLog || 11; // 2048 - good for 44100
  var chosen_tempo = opts.tempo || 1.0;
  var numChannels = opts.numChannels || 2;

  /**************************
   * Initialize variables
   **************************/

  // Some constants
  const GAIN_DEAMPLIFY = 0.9; // Slightly lower the volume to avoid volume overflow-compression
  const MAX_PEAK_RATIO = 1e-8; // Do not find peaks below this level: 80dB from max
  const MAX_PEAK_JUMP = Math.pow(2.0, 50 / 1200.0) - 1.0; // Rel distance (in freq) to look for matches
  const MATCH_MAG_THRESH = 0.1; // New if mag_prev < MATCH_MAG_THRESH * mag_new

  const windowSize = 1 << wsizeLog;
  const fft = FFT(wsizeLog);

  // Caluclate max step size for both ana and syn windows
  // Has to be < 1/4 of window length or audible artifacts occur
  var max_step_len = 1 << (wsizeLog - 2); // 1/4 of window_size
  max_step_len -= max_step_len % 100; // Change to a multiple of 100 as tempo is often changed in percents

  //console.log("MAX STEP",max_step_len,windowSize);
  var in_buffer = VH.float_array(windowSize + max_step_len + 5);
  var out_buffer = VH.float_array(windowSize + max_step_len + 5);
  var ana_len = max_step_len,
    syn_len = max_step_len;

  // Hanning window
  var win = VH.float_array(windowSize);
  for (let i = 0; i < windowSize; i++)
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / windowSize));

  var hWS = (windowSize >> 1) + 1;
  var re1 = VH.float_array(hWS),
    im1 = VH.float_array(hWS);
  var re2 = VH.float_array(hWS),
    im2 = VH.float_array(hWS);
  var pre2 = VH.float_array(hWS),
    pim2 = VH.float_array(hWS);

  var qWS = (hWS >> 1) + 1;
  var b_npeaks = [0, 0],
    b_peaks = [],
    b_in_angs = [],
    b_peak_adeltas = [];
  var b_mags = [];
  for (let i = 0; i < 2; i++) {
    // Double buffering
    b_peaks.push(VH.float_array(qWS));
    b_in_angs.push(VH.float_array(qWS));
    b_peak_adeltas.push(VH.float_array(qWS));
    b_mags.push(VH.float_array(hWS));
  }

  var peaks_re = VH.float_array(qWS),
    peaks_im = VH.float_array(qWS);

  // Keep track of time (in samples) in both input and output streams
  var in_time = 0.0,
    out_time = 0.0;

  // Track the changes for mapOutputToInputTime
  var changes = [
    {
      in_time: 0.0,
      out_time: 0.0,
      tempo: chosen_tempo
    }
  ];

  var f_ind = 0,
    prev_out_len = 0,
    gain_comp = 1.0;
  var syn_drift = 0.0,
    syn_drift_per_step = 0.0;

  // Two variables used for "process"
  var inbuffer_contains = 0,
    unused_in_outbuf = 0;

  var obj = {};

  // Should map time in output to time in input
  obj["mapOutputToInputTime"] = function (given_out_time) {
    let ci = changes.length - 1;
    while (given_out_time < changes[ci].out_time && ci > 0) ci--;
    let cc = changes[ci];
    return cc.in_time + cc.tempo * (given_out_time - cc.out_time);
  };

  obj["flush"] = function (discard_output_seconds) {
    syn_drift = 0.0;
    b_npeaks = [0, 0];
    prev_out_len = 0;
    unused_in_outbuf = 0;
    inbuffer_contains = 0;

    for (let i = 0; i < 2; i++)
      for (var k = 0; k < hWS; k++) b_mags[i][k] = 0.0;

    for (let i = 0; i < in_buffer.length; i++) in_buffer[i] = 0.0;
    for (let i = 0; i < out_buffer.length; i++) out_buffer[i] = 0.0;

    // Scroll time cursor back by discard_output_seconds
    if (discard_output_seconds) {
      // Scroll back time in both coordinates
      out_time = Math.max(0, out_time - discard_output_seconds);
      in_time = obj["mapOutputToInputTime"](out_time);

      // Clear the now-made-future tempo changes (if any)
      let ci = changes.length - 1;
      while (ci > 0 && out_time <= changes[ci].out_time) {
        changes.pop();
        ci--;
      }

      // Add a tempo change reflecting current state
      changes.push({
        in_time: in_time,
        out_time: out_time,
        tempo: chosen_tempo
      });
    }
  };

  // Small utility function to calculate gain compensation
  const compute_gain_comp = function (win, syn_len) {
    let n = (win.length / syn_len) | 0,
      sum = 0.0;
    for (let i = 0; i < n; i++) sum += win[i * syn_len];
    return GAIN_DEAMPLIFY / sum;
  };

  obj["getTempo"] = function () {
    return chosen_tempo;
  };
  obj["setTempo"] = function (tempo_ratio) {
    ana_len = syn_len = max_step_len;
    if (tempo_ratio >= 1.0) {
      syn_len = Math.round(ana_len / tempo_ratio);
    } else {
      ana_len = Math.round(syn_len * tempo_ratio);
    }
    syn_drift_per_step =
      (1.0 / tempo_ratio - (1.0 * syn_len) / ana_len) * ana_len;
    gain_comp = compute_gain_comp(win, syn_len);
    chosen_tempo = tempo_ratio;
    //console.log("TEMPO CHANGE",tempo_ratio,"LENS",ana_len,syn_len,"GAIN",gain_comp);

    // Handle book-keeping for time map
    var lc = changes[changes.length - 1];
    if (lc.out_time === out_time)
      // no samples since last change
      lc.tempo = tempo_ratio;
    // Just replace last change event
    //add new entry
    else
      changes.push({
        in_time: in_time,
        out_time: out_time,
        tempo: tempo_ratio
      });
  };

  obj["flush"](0);
  obj["setTempo"](chosen_tempo);

  /**************************
   * Small utility functions
   **************************/

  // Estimate the phase at (fractional) fft bin ind
  const interpolate_phase = function (re, im, ind) {
    let i = Math.floor(ind);
    let sgn = i % 2 === 1 ? -1.0 : 1.0;
    return Math.atan2(sgn * (im[i] - im[i + 1]), sgn * (re[i] - re[i + 1]));
  };

  // Get ang between -PI and PI
  const unwrap = function (ang) {
    return ang - 2 * Math.PI * Math.round(ang / (2 * Math.PI));
  };

  // Try to estimate the phase change if window lengths differ by ratio
  const estimate_phase_change = function (ang, k, pang, pk, ratio) {
    let pred = ((2 * Math.PI) / windowSize) * 0.5 * (pk + k) * ana_len;
    let ywang = unwrap(ang - pang - pred);

    return (ywang + pred) * ratio;
  };

  /**************************
   * Find peaks of spectrum
   **************************/

  const find_rpeaks = function (mags, res) {
    let max = 0;
    for (let i = 0; i < mags.length; i++) if (mags[i] > max) max = mags[i];
    let thresh = MAX_PEAK_RATIO * max;

    let n_peaks = 1,
      prev_pi = 1;
    res[0] = 1.0;
    for (let i = 2; i < mags.length; i++) {
      let f_delta = i * MAX_PEAK_JUMP;
      if (mags[i] > thresh && mags[i] > mags[i - 1] && mags[i] >= mags[i + 1]) {
        // Is local peak

        // Use quadratic interpolation to fine-tune the peak location
        let ppos =
          i +
          (mags[i - 1] - mags[i + 1]) /
            (2 * (mags[i - 1] - 2 * mags[i] + mags[i + 1]));

        // If far enough from previous peak, add to list
        if (ppos - res[n_peaks - 1] > f_delta) {
          res[n_peaks++] = ppos;
          prev_pi = i;
        }
        // Else, if not far enough, but higher than previous, just replace prev
        else if (mags[i] > mags[prev_pi]) {
          res[n_peaks - 1] = ppos;
          prev_pi = i;
        }
      }
    }
    return n_peaks;
  };

  /**************************
   * Rigid phase shift
   **************************/

  const pshift_rigid = function (frame_ind, re, im, p_re, p_im, ratio) {
    let CUR = frame_ind % 2,
      PREV = 1 - CUR;

    let prev_mags = b_mags[PREV];

    let prev_np = b_npeaks[PREV],
      prpeaks = b_peaks[PREV];
    var prev_in_angs = b_in_angs[PREV],
      prev_peak_adeltas = b_peak_adeltas[PREV];

    // Calc new mags
    let mags = b_mags[CUR];
    for (let i = 1; i < mags.length; i++)
      mags[i] = re[i] * re[i] + im[i] * im[i];

    // Find new peaks
    let peaks = b_peaks[CUR];
    let cur_np = (b_npeaks[CUR] = find_rpeaks(mags, peaks));

    // Start adjusting angles
    let cur_in_angs = b_in_angs[CUR],
      cur_peak_adeltas = b_peak_adeltas[CUR];

    if (frame_ind === 0 || cur_np === 0) {
      // If first frame (or no peaks)

      // Set out_ang = in_ang for all peaks
      for (let ci = 0; ci < cur_np; ci++) {
        let pci = peaks[ci];
        prev_in_angs[ci] = prev_peak_adeltas[ci] = interpolate_phase(
          re,
          im,
          pci
        );
      }
    }

    /*********************************************************
     * Match old peaks with new ones
     * Also find where pmag*mag is max for next step
     *********************************************************/

    let pi = 0;
    for (let ci = 0; ci < cur_np; ci++) {
      var pci = peaks[ci];

      // Scroll so peaks[ci] is between prpeaks[pi] and prpeaks[pi+1]
      while (peaks[ci] > prpeaks[pi] && pi !== prev_np) ++pi;

      let cpi = pi;
      if (pi > 0 && pci - prpeaks[pi - 1] < prpeaks[pi] - pci) cpi = pi - 1;

      let peak_delta = pci * MAX_PEAK_JUMP;
      if (
        Math.abs(prpeaks[cpi] - pci) < peak_delta &&
        prev_mags[Math.round(prpeaks[cpi])] >
          MATCH_MAG_THRESH * mags[Math.round(pci)]
      ) {
        // Found a matching peak in previous frame, so predict based on the diff
        let in_angle = interpolate_phase(re, im, pci);
        let out_angle =
          prev_in_angs[cpi] +
          prev_peak_adeltas[cpi] +
          estimate_phase_change(
            in_angle,
            pci,
            prev_in_angs[cpi],
            prpeaks[cpi],
            ratio
          );

        let delta = out_angle - in_angle;
        cur_in_angs[ci] = in_angle;
        cur_peak_adeltas[ci] = delta;
        peaks_re[ci] = Math.cos(delta);
        peaks_im[ci] = Math.sin(delta);
      } else {
        // Not matched - use the same phase as input
        cur_in_angs[ci] = interpolate_phase(re, im, pci);
        cur_peak_adeltas[ci] = 0;
        peaks_re[ci] = 1.0;
        peaks_im[ci] = 0.0;
      }
    }

    /********************************************************
     * Adjust phase of all bins based on closest peak
     *********************************************************/

    // Add a "dummy" peak at the end of array
    peaks[cur_np] = 2 * windowSize;

    let cpi = 0,
      cp = peaks[cpi],
      cnp = peaks[cpi + 1];
    let cre = peaks_re[cpi],
      cim = peaks_im[cpi];

    for (let i = 1; i < re.length - 1; i++) {
      if (i >= cp && i - cp > cnp - i) {
        ++cpi;
        cp = peaks[cpi];
        cnp = peaks[cpi + 1];
        cre = peaks_re[cpi];
        cim = peaks_im[cpi];
      }

      let nre = re[i] * cre - im[i] * cim;
      let nim = re[i] * cim + im[i] * cre;
      re[i] = nre;
      im[i] = nim;
    }
  };

  /***********************************
   * Perform two syn/ana steps
   *	(using the two-for-one fft trick)
   * Takes windowSize + ana_len samples from in_buffer
   *   and shifts in_buffer back by 2*ana_len
   * Outputs <retval> samples to out_buffer
   ***********************************/

  const two_steps = function () {
    // To better match the given ratio,
    // occasionally tweak syn_len by 1 or 2
    syn_drift += 2 * syn_drift_per_step;
    let sdelta = syn_drift | 0;
    syn_drift -= sdelta;

    // Pack two steps into fft object
    for (let i = 0; i < windowSize; i++) {
      fft.m_re[i] = win[i] * in_buffer[i];
      fft.m_im[i] = win[i] * in_buffer[ana_len + i];
    }

    // Shift in_buffer back by 2*ana_len
    VH.blit(in_buffer, 2 * ana_len, in_buffer, 0, windowSize - ana_len);

    // Run the fft
    fft.inplace(false);
    fft.unpack(re1, im1, re2, im2);

    // Step 1 - move by syn_len
    let ratio1 = (1.0 * syn_len) / ana_len;
    pshift_rigid(f_ind, re1, im1, pre2, pim2, ratio1);

    // Step 2 - move by syn_len+sdelta
    let ratio2 = (1.0 * (syn_len + sdelta)) / ana_len;
    pshift_rigid(f_ind + 1, re2, im2, re1, im1, ratio2);

    // Save (modified) re and im
    VH.blit(re2, 0, pre2, 0, hWS);
    VH.blit(im2, 0, pim2, 0, hWS);

    // Run ifft
    fft.repack(re1, im1, re2, im2);
    fft.inplace(true);

    // Shift out_buffer back by previous out_len;
    let oblen = out_buffer.length;
    VH.blit(out_buffer, prev_out_len, out_buffer, 0, oblen - prev_out_len);

    // And shift in zeros at the end
    for (let i = oblen - prev_out_len; i < oblen; i++) out_buffer[i] = 0.0;

    // Value overflow protection - scale the packet if max above a threshold
    // The distortion this creates is insignificant compared to phase issues
    let max = 0.0,
      gc = gain_comp;
    for (let i = 0; i < syn_len; i++)
      if (Math.abs(2 * fft.m_re[i]) > max) max = Math.abs(2 * fft.m_re[i]);
    for (let i = 0; i < windowSize - syn_len; i++)
      if (Math.abs(fft.m_re[i + syn_len + sdelta] + fft.m_im[i]) > max)
        max = Math.abs(fft.m_re[i + syn_len + sdelta] + fft.m_im[i]);

    for (let i = windowSize - syn_len; i < windowSize; i++)
      if (Math.abs(2 * fft.m_im[i]) > max) max = Math.abs(2 * fft.m_im[i]);

    // Find allowed ceiling of a two-step sum and lower gain if needed
    let ceiling = 1.0 / Math.floor((1.0 * windowSize) / (2 * syn_len));
    if (gc * max > ceiling) {
      //console.log("Gain overflow, lowering volume: ",ceiling / max,gc,max);
      gc = ceiling / max;
    }

    // Write results to out_buffer
    for (let i = 0; i < windowSize; i++) {
      out_buffer[i] += gc * fft.m_re[i];
      out_buffer[i + syn_len + sdelta] += gc * fft.m_im[i];
    }

    f_ind += 2;
    prev_out_len = 2 * syn_len + sdelta;

    return prev_out_len;
  };

  // input: array of channels, each a float_array with unbounded amount of samples
  // output: same format
  obj["process"] = function (in_ar) {
    let in_len = in_ar[0].length;

    // Mix channels together (if needed)
    let mix = in_ar[0];
    if (in_ar.length > 1) {
      mix = VH.float_array(in_ar[0].length);
      let mult = 1.0 / in_ar.length;
      for (let c = 0; c < in_ar.length; c++)
        for (let i = 0; i < in_len; i++) mix[i] += mult * in_ar[c][i];
    }

    // Handle the special case of no tempo change
    if (chosen_tempo === 1.0) {
      // Empty out_buffer followed by in_buffer, if they are not empty
      if (unused_in_outbuf + inbuffer_contains > 0) {
        let n_len = unused_in_outbuf + inbuffer_contains + in_len;
        let n_ar = [];
        for (let c = 0; c < in_ar.length; c++) {
          let buf = VH.float_array(n_len);
          VH.blit(out_buffer, 0, buf, 0, unused_in_outbuf);
          VH.blit(in_buffer, 0, buf, unused_in_outbuf, inbuffer_contains);
          VH.blit(
            in_ar[c],
            0,
            buf,
            unused_in_outbuf + inbuffer_contains,
            in_len
          );
          n_ar.push(buf);
        }
        obj["flush"](0);
        in_len = n_len;
        in_ar = n_ar;
      }

      // Move time pointers
      in_time += in_len / sampleRate;
      out_time += in_len / sampleRate;

      // Just return the same samples as were given as input
      return in_ar;
    }

    // Calculate output length
    // Should underestimate, and by no more than 4, which can easily fit in the unused_in_outbuf
    let consumable_samples =
      inbuffer_contains + in_len - (windowSize - ana_len);
    let n_steps =
      2 * Math.floor(Math.max(0, consumable_samples) / (2 * ana_len));
    let out_len =
      unused_in_outbuf +
      syn_len * n_steps +
      Math.floor(syn_drift + syn_drift_per_step * n_steps);

    if (unused_in_outbuf > out_len) out_len = unused_in_outbuf;

    // Allocate output
    let outp = VH.float_array(out_len);

    // Copy previously unused but ready values to output
    VH.blit(out_buffer, 0, outp, 0, unused_in_outbuf);
    let ii = 0,
      oi = unused_in_outbuf;

    let left_over = 0,
      res_len = 0;
    while (true) {
      // Calculate how many new samples we need to call two_steps
      let n_needed = windowSize + ana_len - inbuffer_contains;

      if (ii + n_needed > in_len) {
        // Not enough samples for next step
        // Copy whats left to inbuffer and break out of the loop
        VH.blit(mix, ii, in_buffer, inbuffer_contains, in_len - ii);
        inbuffer_contains += in_len - ii;
        ii = in_len;
        break;
      } else if (n_needed <= 0)
        // Already enough - can happen if tempo changed
        inbuffer_contains -= 2 * ana_len;
      else {
        // Main case - we have enough
        // Copy over this many samples from input
        VH.blit(mix, ii, in_buffer, inbuffer_contains, n_needed);
        ii += n_needed;
        inbuffer_contains = windowSize - ana_len;
      }

      // Invariant: left_over should be 0 here as it should break!

      // Run the vocoder
      res_len = two_steps();

      // Move time pointers
      in_time += (2 * ana_len) / sampleRate;
      out_time += res_len / sampleRate;

      // Calculate how many samples are left over (usually 0)
      left_over = oi + res_len - out_len;
      if (left_over < 0) left_over = 0;

      // Copy fully ready samples out
      VH.blit(out_buffer, 0, outp, oi, res_len - left_over);

      oi += res_len;
    }

    // Copy left over samples to the beginning of out_buffer
    VH.blit(out_buffer, res_len - left_over, out_buffer, 0, left_over);
    unused_in_outbuf = left_over;

    //////////////////////// DONE

    // Clone the result to match the number of input channels
    let out_ar = [];
    for (let c = 0; c < in_ar.length; c++) out_ar.push(outp);

    return out_ar;
  };

  return obj;
};

/** @export */
export { AudioTempoChanger };
