---
title: "TinyFlow: Breaking the Warping Bottleneck for Edge Optical Flow"
title_html: '<span class="tf-accent">Tiny</span>Flow: Breaking the Warping Bottleneck for Edge Optical Flow'
description: "TinyFlow is a 1.26M-parameter warp-free optical flow network that keeps iterative coarse-to-fine refinement and compiles as a single static INT8 graph for edge accelerators. Its INT8 model reaches 6.29/7.13 EPE on Sintel Clean/Final with 54% fewer parameters than EdgeFlowNet."
image: static/images/social.jpg
keywords: [optical flow, edge AI, Hailo-8, quantization, INT8, warp-free, iterative refinement, visual odometry, tiny robots, TinyFlow]

citation_date: "2026/10"
paper_title: "TinyFlow: Breaking the Warping Bottleneck for Edge Optical Flow"

authors:
  - name: "Xiao'ao Song"
    url: "https://scholar.google.com/citations?hl=en&user=88aAUZMAAAAJ"
  - name: Chahat Deep Singh
    url: https://chahatdeep.github.io/
affiliations:
  - Perception, Robotics, AI and Sensing (PRAISe) Lab, University of Colorado Boulder

links:
  - text: arXiv
    url: https://arxiv.org/abs/2610.33338
    icon: ai ai-arxiv
  - text: Results
    url: "#compare"
    icon: fas fa-chart-line
  - text: Code (Coming Soon)
    url: "#coming-soon"
    icon: fab fa-github
  - text: Video (Coming Soon)
    url: "#coming-soon"
    icon: fab fa-youtube

teaser:
  video: static/videos/teaser.mp4
  poster: static/images/teaser.jpg
  alt: "Video. Two RGB frames of a runner go into TinyFlow, a 1.26M-parameter network that rethinks the warping function, compiles to one static INT8 graph and runs on a Hailo-8 accelerator. Its dense optical flow output closely matches the ground truth."
  caption: "**TinyFlow** predicts dense optical flow from a pair of input images with only **1.26M parameters**. It keeps iterative coarse-to-fine refinement but removes the warp, so the whole network compiles as **a single static INT8 graph** for edge AI accelerators such as the Hailo-8."

math: true

bibtex: |
  @article{song2026tinyflow,
    title   = {TinyFlow: Breaking the Warping Bottleneck for Edge Optical Flow},
    author  = {Song, Xiao'ao and Singh, Chahat Deep},
    journal = {arXiv preprint arXiv:2610.33338},
    year    = {2026},
    url     = {https://arxiv.org/abs/2610.33338}
  }
---

<div class="stat-strip tf-stats">
  <div class="stat-card"><span class="stat-value">1.26<small>M</small></span><span class="stat-label">parameters, warp-free, one static INT8 graph</span></div>
  <div class="stat-card"><span class="stat-value">54%</span><span class="stat-label">fewer parameters than EdgeFlowNet, and more accurate on every benchmark</span></div>
  <div class="stat-card"><span class="stat-value">+0.16</span><span class="stat-label">EPE from Float32 to INT8 on Sintel Clean, down from over +1.0</span></div>
  <div class="stat-card"><span class="stat-value">85%</span><span class="stat-label">lower error than existing deployable models under illumination change, averaged over eight lighting conditions</span></div>
</div>

## Abstract

High-performance optical flow networks are difficult to deploy on resource-constrained edge accelerators because their iterative refinement warps features by the current flow, which relies on flow-dependent resampling and data-dependent memory access. We present **TinyFlow**, a 1.26M-parameter warp-free optical flow network that preserves iterative coarse-to-fine refinement by replacing the warp with a fixed-window correlation over constant offsets, so the whole network compiles as a single static INT8 graph.

Quantization-aware fine-tuning, warp-teacher distillation, and model souping reduce the Float32-to-INT8 penalty to **below 0.2 end-point error (EPE)** on MPI-Sintel. TinyFlow outperforms EdgeFlowNet and NanoFlowNet on Sintel Clean, Sintel Final, and FlyingChairs in both Float32 and INT8, while using **54% fewer parameters** than EdgeFlowNet, and our INT8 model achieves **6.29 / 7.13 EPE** on Sintel Clean / Final. In flow-only monocular visual odometry on TartanAir and UZH-FPV, the same INT8 model yields the lowest trajectory error on **seven of eleven** sequences.

## Warp-free matching

Iterative networks warp features with `grid_sample`, a run-time memory lookup that edge accelerators cannot execute. TinyFlow instead correlates the two frames over a fixed window $$C^s_0$$ that it computes once. For integer flow the warped volume $$C^s_{\mathbf{u}}$$ is just a shifted read of it, so warping only recenters the window, and TinyFlow keeps the window centered and wide enough:

$$
C^s_0(\mathbf{x}, \boldsymbol{\delta}) = \left\langle \hat{f}^s_1(\mathbf{x}),\, \hat{f}^s_2(\mathbf{x} + \boldsymbol{\delta}) \right\rangle,\ \ \boldsymbol{\delta} \in \{-r_s,\ldots,r_s\}^2 \quad{\small\Rightarrow}\quad C^s_{\mathbf{u}}(\mathbf{x}, \boldsymbol{\delta}) = C^s_0\big(\mathbf{x}, \boldsymbol{\delta} + \mathbf{u}^s(\mathbf{x})\big).
$$

<figure class="tf-widget" id="tf-warp-widget">
<div class="tf-warp">
<div>
<svg class="tf-svg" id="tf-warp-svg" viewBox="0 0 220 220" tabindex="0" role="img" aria-label="Offset grid of the second frame around one pixel. Drag to set the current flow."></svg>
</div>
<div>
<div class="tf-range-row"><label for="tf-warp-r">Radius r</label><input type="range" id="tf-warp-r" min="1" max="5" value="3"><output id="tf-warp-r-out">3</output></div>
<div class="tf-range-row"><label for="tf-warp-w">Warp window</label><input type="range" id="tf-warp-w" min="0" max="3" value="1"><output id="tf-warp-w-out">1</output></div>
<div class="tf-controls" style="margin:0.6rem 0 0"><div class="tf-group"><span class="tf-group-label">Volume</span><button class="tf-chip" type="button" data-warp-mode="full" aria-pressed="false">Full</button><button class="tf-chip" type="button" data-warp-mode="marg" aria-pressed="true">Marginals</button></div></div>
<p class="tf-warp-line" id="tf-warp-line"></p>
<div class="tf-status" id="tf-warp-status"></div>
</div>
</div>
<figcaption>Drag to set the flow <em>u</em>. Orange: the fixed window. Gold: what a warp would read.</figcaption>
</figure>

## Edge-aware training

Post-training quantization costs 1.17 EPE. Quantization-aware fine-tuning with **warp-teacher distillation** and an **INT8-aware model soup** cuts it to 0.16. Sintel is never used for training.

<figure class="tf-widget" id="tf-train-widget">
<div class="tf-controls"><div class="tf-group"><span class="tf-group-label">Show</span><button class="tf-chip" type="button" data-train="gap" aria-pressed="true">Float32 → INT8</button><button class="tf-chip" type="button" data-train="soup" aria-pressed="false">Model soup</button></div><div class="tf-group" id="tf-train-pass" hidden><span class="tf-group-label">Pass</span><button class="tf-chip" type="button" data-pass="0" aria-pressed="true">Sintel Clean</button><button class="tf-chip" type="button" data-pass="1" aria-pressed="false">Sintel Final</button></div></div>
<svg class="tf-svg" id="tf-train-svg" viewBox="0 0 640 230" role="img" aria-label="Training chart"></svg>
<figcaption id="tf-train-cap"></figcaption>
</figure>

<div id="compare"></div>

## Qualitative Results

Drag the slider. Selected Sintel Clean, Sintel Final and FlyingChairs pairs, all models in INT8.

<figure class="tf-widget tf-explorer" id="tf-explorer">
<div class="tf-controls">
<div class="tf-group" id="tf-ex-scenes"><span class="tf-group-label">Scene</span></div>
</div>
<div class="tf-controls">
<div class="tf-group"><label class="tf-group-label" for="tf-ex-left">Left</label><select id="tf-ex-left"></select></div>
<div class="tf-group"><label class="tf-group-label" for="tf-ex-right">Right</label><select id="tf-ex-right"></select></div>
</div>
<div class="tf-ex-pair"><figure class="media-figure compare-figure"><div class="compare" id="tf-ex-compare"><img class="compare-after" id="tf-ex-after" src="/research/TinyFlow/static/images/explorer/clean_ambush_7_gt.jpg" alt="Ground truth"><img class="compare-before" id="tf-ex-before" src="/research/TinyFlow/static/images/explorer/clean_ambush_7_tinyflow.jpg" alt="TinyFlow (Ours)"><div class="compare-handle" aria-hidden="true"></div><span class="compare-label compare-label-before" id="tf-ex-lbl-before">TinyFlow (Ours)</span><span class="compare-label compare-label-after" id="tf-ex-lbl-after">Ground truth</span><input class="compare-range" type="range" min="0" max="100" value="50" aria-label="Comparison slider"></div></figure><figure class="tf-ex-in"><img id="tf-ex-input" src="/research/TinyFlow/static/images/explorer/clean_ambush_7_input.jpg" alt="Input frame"><figcaption id="tf-ex-input-cap">Input</figcaption></figure></div>
<div class="tf-readout" id="tf-ex-epe"></div>
<figcaption id="tf-ex-note"></figcaption>
</figure>

<div id="results"></div>

## Quantitative Results

End-point error in pixels, lower is better. Dashed reference models cannot be deployed.

<figure class="tf-widget" id="tf-bench-widget">
<div class="tf-controls">
<div class="tf-group"><span class="tf-group-label">Precision</span><button class="tf-chip" type="button" data-prec="F32" aria-pressed="false">Float32</button><button class="tf-chip" type="button" data-prec="INT8" aria-pressed="true">INT8</button><button class="tf-chip" type="button" data-prec="GAP" aria-pressed="false">F32 → INT8</button></div>
<div class="tf-group"><span class="tf-group-label">Metric</span><button class="tf-chip" type="button" data-metric="0" aria-pressed="true">Sintel Clean</button><button class="tf-chip" type="button" data-metric="1" aria-pressed="false">Sintel Final</button><button class="tf-chip" type="button" data-metric="2" aria-pressed="false">FlyingChairs</button><button class="tf-chip" type="button" data-metric="3" aria-pressed="false">&gt; 3 px (%)</button></div>
</div>
<svg class="tf-svg" id="tf-bench-svg" viewBox="0 0 640 260" role="img" aria-label="Benchmark chart"></svg>
<figcaption id="tf-bench-cap"></figcaption>
</figure>

<div class="tf-pair">
<div>
<h3>Error by motion magnitude</h3>
<figure class="tf-widget" id="tf-bins-widget">
<div class="tf-controls">
<div class="tf-group"><span class="tf-group-label">Pass</span><button class="tf-chip" type="button" data-bpass="clean" aria-pressed="true">Sintel Clean</button><button class="tf-chip" type="button" data-bpass="final" aria-pressed="false">Sintel Final</button></div>
<div class="tf-group"><span class="tf-group-label">Precision</span><button class="tf-chip" type="button" data-bprec="F32" aria-pressed="false">Float32</button><button class="tf-chip" type="button" data-bprec="INT8" aria-pressed="true">INT8</button></div>
<div class="tf-group"><span class="tf-group-label">Scale</span><button class="tf-chip" type="button" data-bscale="log" aria-pressed="false">Log</button><button class="tf-chip" type="button" data-bscale="rel" aria-pressed="true">Relative to TinyFlow</button></div>
</div>
<svg class="tf-svg" id="tf-bins-svg" viewBox="0 0 640 300" role="img" aria-label="EPE by motion magnitude"></svg>
<div class="tf-legend" id="tf-bins-legend"></div>
<figcaption>Above 1 means more error than TinyFlow in that motion range.</figcaption>
</figure>
</div>
<div>
<h3>On the Hailo-8</h3>
<figure class="tf-widget" id="tf-hailo-widget">
<svg class="tf-svg" id="tf-hailo-svg" viewBox="0 0 640 260" role="img" aria-label="Frames per second against EPE on the Hailo-8"></svg>
<figcaption>Raspberry Pi 5 with a Hailo-8, 100-pair Sintel Clean sample. Up and to the right is better.</figcaption>
</figure>
</div>
</div>

## Visual odometry

INT8 flow into the same pose estimator, no depth. TinyFlow has the lowest ATE on **7 of 11** sequences.

{% figure src="static/videos/vo_trajectories.mp4", poster="static/videos/vo_trajectories.jpg", alt="Animation of the estimated visual odometry trajectories of TinyFlow, EdgeFlowNet and NanoFlowNet being drawn against the ground truth on one UZH-FPV flight and three TartanAir trajectories", caption="Trajectories drawn frame by frame against the ground truth (dashed)." %}

{# VO per-sequence chart, hidden for now. Remove this comment wrapper to show it again.
<figure class="tf-widget" id="tf-vo-widget">
<div class="tf-controls">
<div class="tf-group"><span class="tf-group-label">Metric</span><button class="tf-chip" type="button" data-vo="0" aria-pressed="true">ATE (m)</button><button class="tf-chip" type="button" data-vo="1" aria-pressed="false">Rotation (°)</button><button class="tf-chip" type="button" data-vo="2" aria-pressed="false">Direction (°)</button></div>
<div class="tf-group"><span class="tf-group-label">Data</span><button class="tf-chip" type="button" data-vod="tartan" aria-pressed="true">TartanAir</button><button class="tf-chip" type="button" data-vod="uzh" aria-pressed="false">UZH-FPV</button></div>
</div>
<svg class="tf-svg" id="tf-vo-svg" viewBox="0 0 640 420" role="img" aria-label="Visual odometry errors per sequence"></svg>
<div class="tf-legend"><span style="--sw:var(--tf-orange)">TinyFlow (Ours)</span><span style="--sw:var(--tf-blue)">EdgeFlowNet</span><span style="--sw:var(--tf-purple)">NanoFlowNet</span><span id="tf-vo-gt-key" style="--sw:var(--pp-ink)">Ground-truth flow (ATE)</span></div>
<div class="tf-readout" id="tf-vo-readout"></div>
<figcaption>ATE after SE(3) alignment. The tick marks the ground-truth flow through the same estimator.</figcaption>
</figure>
#}

## Robustness to illumination change

Gamma, brightness and offset changes on the second frame. TinyFlow stays within **5.92 to 8.99 EPE**, while EdgeFlowNet rises to 27 to 61 and NanoFlowNet to 18 to 90.

<figure class="tf-widget" id="tf-illum-widget">
<div class="tf-controls"><div class="tf-group" id="tf-illum-scenes"><span class="tf-group-label">Pair</span><button class="tf-chip" type="button" data-illum-scene="runner_" aria-pressed="true">Synthetic · runner</button><button class="tf-chip" type="button" data-illum-scene="ambush7_" aria-pressed="false">Clean · ambush_7</button><button class="tf-chip" type="button" data-illum-scene="" aria-pressed="false">Clean · alley_2</button></div></div>
<div class="tf-controls"><div class="tf-group" id="tf-illum-chips"><span class="tf-group-label">Second frame</span></div></div>
<svg class="tf-svg" id="tf-illum-svg" viewBox="0 0 640 170" role="img" aria-label="EPE under illumination change"></svg>
<div class="tf-illum-grid" id="tf-illum-grid"></div>
<figcaption>Top, mean over 209 Sintel Clean pairs. Bottom, the selected pair.</figcaption>
</figure>

Contact: [xiaoao.song@colorado.edu](mailto:xiaoao.song@colorado.edu), [chahat.singh@colorado.edu](mailto:chahat.singh@colorado.edu)

<script>
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var BASE = "/research/TinyFlow/static/images/qual/";
  var COL = { tinyflow: "var(--tf-orange)", edgeflownet: "var(--tf-blue)", nanoflownet: "var(--tf-purple)", flownets: "var(--tf-ref)", neuflow: "var(--tf-ref-2)" };
  var NAME = { tinyflow: "TinyFlow (Ours)", edgeflownet: "EdgeFlowNet", nanoflownet: "NanoFlowNet", flownets: "FlowNetS", neuflow: "NeuFlow v2", gt: "Ground truth" };
  var PARAMS = { tinyflow: "1.26M", edgeflownet: "2.75M", nanoflownet: "0.17M", flownets: "38.7M", neuflow: "9.03M" };
  var REF = { flownets: true, neuflow: true };

  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  var redraws = [];
  function vw(svg) { return (svg.clientWidth || svg.parentNode.clientWidth || 640) < 520 ? 380 : 640; }
  window.addEventListener("resize", (function () {
    var t, last = window.innerWidth < 600;
    return function () {
      clearTimeout(t);
      t = setTimeout(function () { var now = window.innerWidth < 600; if (now !== last) { last = now; redraws.forEach(function (f) { f(); }); } }, 150);
    };
  })());
  function clear(svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); }
  function tip(node, text) { el("title", {}, node, text); }
  function niceStep(span, n) {
    var raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  function tickLabel(v, step) { return Number.isInteger(step) ? v.toFixed(0) : step >= 0.1 ? v.toFixed(1) : v.toFixed(2); }
  function fmt(v) { return v >= 100 ? v.toFixed(1) : v.toFixed(2); }
  function press(buttons, active) {
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === active ? "true" : "false"); });
  }
  function chipGroup(root, attr, onPick) {
    var bs = Array.prototype.slice.call(root.querySelectorAll("[" + attr + "]"));
    bs.forEach(function (b) {
      b.addEventListener("click", function () { press(bs, b); onPick(b.getAttribute(attr)); });
    });
  }

  /* Horizontal bar chart. rows: [{key, label, value, color, ref, sub}] */
  function hbars(svg, rows, opt) {
    clear(svg);
    var fs = opt.fs || 1;                       // text scale
    var W = vw(svg), L = W < 600 ? 112 * fs : (opt.left || 150), R = (W < 600 ? 52 : 70) * fs, top = 8, bh = opt.barH || 26, gap = opt.gap || 12;
    var H = top + rows.length * (bh + gap) + 24 * fs;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var vmax = opt.max || Math.max.apply(null, rows.map(function (r) { return r.value; })) * 1.04;
    var step = niceStep(vmax, opt.ticks || 5), max = Math.ceil(vmax / step) * step;
    var sx = function (v) { return L + (W - L - R) * v / max; };
    for (var tv = 0; tv <= max + 1e-9; tv += step) {
      var x = sx(tv);
      el("line", { x1: x, x2: x, y1: top - 4, y2: H - 22 * fs, class: "tf-gridline" }, svg);
      el("text", { x: x, y: H - 6, "text-anchor": "middle", "font-size": 11 * fs, class: "tf-muted" }, svg, tickLabel(tv, step));
    }
    rows.forEach(function (r, i) {
      var y = top + i * (bh + gap);
      el("text", { x: L - 10, y: y + bh / 2 + 4.5, "text-anchor": "end", "font-size": 13 * fs, class: r.key === "tinyflow" ? "tf-strong" : "" }, svg, r.label);
      if (r.sub) el("text", { x: L - 10, y: y + bh / 2 + 4.5 + 13 * fs, "text-anchor": "end", "font-size": 10.5 * fs, class: "tf-muted" }, svg, r.sub);
      var bar = el("rect", { x: L, y: y, height: bh, width: Math.max(1, sx(r.value) - L), rx: 4, fill: r.color, opacity: r.ref ? 0.75 : 1, class: "tf-anim" }, svg);
      if (r.ref) bar.setAttribute("stroke-dasharray", "4 3"), bar.setAttribute("stroke", "var(--pp-muted)"), bar.setAttribute("fill-opacity", "0.55");
      tip(bar, r.label + ": " + fmt(r.value));
      el("text", { x: sx(r.value) + 6, y: y + bh / 2 + 4.5, "font-size": 12.5 * fs, class: r.key === "tinyflow" ? "tf-strong" : "" }, svg, fmt(r.value) + (opt.unit || ""));
    });
  }

  /* ---------------- Warp versus fixed window ---------------- */
  (function () {
    var root = document.getElementById("tf-warp-widget"); if (!root) return;
    var svg = document.getElementById("tf-warp-svg");
    var rIn = document.getElementById("tf-warp-r"), wIn = document.getElementById("tf-warp-w");
    var N = 11, C = 5, cell = 20, pad = 0;
    var st = { r: 3, w: 1, ux: 2, uy: 1, mode: "marg" };
    function draw() {
      clear(svg);
      var r = st.r, w = st.w;
      for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
        var dx = i - C, dy = j - C, inBox = Math.abs(dx) <= r && Math.abs(dy) <= r;
        var inSet = inBox && (st.mode === "full" || dx === 0 || dy === 0);
        el("rect", { x: pad + i * cell + 1, y: pad + j * cell + 1, width: cell - 2, height: cell - 2, rx: 3,
          fill: inSet ? "var(--tf-orange)" : "var(--tf-grid)", opacity: inSet ? (st.mode === "full" ? 0.55 : 0.8) : 1 }, svg);
      }
      if (st.mode === "marg") {
        for (var k = -r; k <= r; k++) {
          [[k, 0], [0, k]].forEach(function (p) {
            el("rect", { x: (C + p[0]) * cell + 1, y: (C + p[1]) * cell + 1, width: cell - 2, height: cell - 2, rx: 3, fill: "none", stroke: "var(--tf-orange)", "stroke-width": 1 }, svg);
          });
        }
      }
      el("circle", { cx: C * cell + cell / 2, cy: C * cell + cell / 2, r: 4.5, fill: "var(--pp-ink)" }, svg);
      el("text", { x: C * cell - 4, y: C * cell - 3, "text-anchor": "end", "font-size": 12, class: "tf-strong" }, svg, "x");
      var tx = (C + st.ux) * cell + cell / 2, ty = (C + st.uy) * cell + cell / 2;
      el("line", { x1: C * cell + cell / 2, y1: C * cell + cell / 2, x2: tx, y2: ty, stroke: "var(--pp-ink)", "stroke-width": 2.2 }, svg);
      el("circle", { cx: tx, cy: ty, r: 6, fill: "var(--pp-gold)", stroke: "var(--pp-ink)", "stroke-width": 1.5 }, svg);
      el("rect", { x: (C + st.ux - w) * cell, y: (C + st.uy - w) * cell, width: (2 * w + 1) * cell, height: (2 * w + 1) * cell,
        fill: "none", stroke: "var(--pp-gold)", "stroke-width": 3, rx: 4 }, svg);
      el("text", { x: tx + 9, y: ty + 16, "font-size": 12, class: "tf-strong" }, svg, "x + u");
      var covered = Math.max(Math.abs(st.ux), Math.abs(st.uy)) + w <= r;
      var full = (2 * r + 1) * (2 * r + 1), marg = 2 * (2 * r + 1);
      document.getElementById("tf-warp-line").innerHTML = "u = (" + st.ux + ", " + st.uy + ") · <b>" + (st.mode === "full" ? full : marg) +
        "</b> channels" + (st.mode === "full" ? "" : " (full window " + full + ")");
      document.getElementById("tf-warp-r-out").textContent = r;
      document.getElementById("tf-warp-w-out").textContent = w;
      var s = document.getElementById("tf-warp-status");
      s.classList.toggle("tf-bad", !covered);
      s.innerHTML = covered ? "<strong>Inside.</strong> Warping would only reread values the fixed window already holds."
        : "<strong>Outside.</strong> Coarse-to-fine refinement keeps the residual inside the window.";
    }
    function setFromEvent(ev) {
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var p = pt.matrixTransform(svg.getScreenCTM().inverse());
      st.ux = Math.max(-C, Math.min(C, Math.floor(p.x / cell) - C));
      st.uy = Math.max(-C, Math.min(C, Math.floor(p.y / cell) - C));
      draw();
    }
    var dragging = false;
    svg.addEventListener("pointerdown", function (e) { dragging = true; svg.setPointerCapture(e.pointerId); setFromEvent(e); });
    svg.addEventListener("pointermove", function (e) { if (dragging) setFromEvent(e); });
    svg.addEventListener("pointerup", function () { dragging = false; });
    svg.addEventListener("keydown", function (e) {
      var m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!m) return; e.preventDefault();
      st.ux = Math.max(-C, Math.min(C, st.ux + m[0])); st.uy = Math.max(-C, Math.min(C, st.uy + m[1])); draw();
    });
    rIn.addEventListener("input", function () { st.r = +rIn.value; draw(); });
    wIn.addEventListener("input", function () { st.w = +wIn.value; draw(); });
    chipGroup(root, "data-warp-mode", function (v) { st.mode = v; draw(); });
    draw();
  })();

  /* ---------------- Training: quantization penalty and soup ---------------- */
  (function () {
    var root = document.getElementById("tf-train-widget"); if (!root) return;
    var svg = document.getElementById("tf-train-svg"), cap = document.getElementById("tf-train-cap"), passG = document.getElementById("tf-train-pass");
    var st = { view: "gap", pass: 0 };
    /* Float32 (filled) to INT8 (open) on one EPE axis, one row per method */
    function quantGap() {
      clear(svg);
      var rows = [
        { label: "Quantize after training", sub: "post-training INT8", f: 6.92, q: 8.09, col: "var(--tf-ref)" },
        { label: "TinyFlow", sub: "quantization-aware fine-tuning", f: 6.13, q: 6.29, col: "var(--tf-orange)", ours: true }
      ];
      var W = vw(svg), narrow = W < 600, L = narrow ? 150 : 250, R = 30, top = 44, rowH = 70, H = top + rows.length * rowH + 52;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      var a = 5.7, b = 8.4, sx = function (v) { return L + (W - L - R) * (v - a) / (b - a); };
      for (var t = 6; t <= 8; t += 0.5) {
        el("line", { x1: sx(t), x2: sx(t), y1: top - 14, y2: H - 46, class: "tf-gridline" }, svg);
        el("text", { x: sx(t), y: H - 28, "text-anchor": "middle", "font-size": 14, class: "tf-muted" }, svg, t.toFixed(1));
      }
      el("text", { x: (L + W - R) / 2, y: H - 6, "text-anchor": "middle", "font-size": 15 }, svg, "Sintel Clean EPE (lower is better)");
      // legend
      el("circle", { cx: L + 8, cy: 14, r: 7, fill: "var(--pp-ink)" }, svg);
      el("text", { x: L + 22, y: 19, "font-size": 15 }, svg, "Float32");
      el("circle", { cx: L + 112, cy: 14, r: 7, fill: "var(--pp-surface)", stroke: "var(--pp-ink)", "stroke-width": 2.5 }, svg);
      el("text", { x: L + 126, y: 19, "font-size": 15 }, svg, "INT8");
      rows.forEach(function (r, i) {
        var y = top + i * rowH + rowH / 2 - 6;
        el("text", { x: L - 16, y: y + 1, "text-anchor": "end", "font-size": narrow ? 15 : 17, class: r.ours ? "tf-strong" : "" }, svg, r.label);
        el("text", { x: L - 16, y: y + 20, "text-anchor": "end", "font-size": narrow ? 12 : 13.5, class: "tf-muted" }, svg, r.sub);
        el("line", { x1: sx(r.f), x2: sx(r.q), y1: y - 4, y2: y - 4, stroke: r.col, "stroke-width": 5, "stroke-linecap": "round" }, svg);
        var c1 = el("circle", { cx: sx(r.f), cy: y - 4, r: 9, fill: r.col }, svg); tip(c1, "Float32 " + r.f);
        var c2 = el("circle", { cx: sx(r.q), cy: y - 4, r: 9, fill: "var(--pp-surface)", stroke: r.col, "stroke-width": 3.5 }, svg); tip(c2, "INT8 " + r.q);
        el("text", { x: (sx(r.f) + sx(r.q)) / 2, y: y - 18, "text-anchor": "middle", "font-size": 16, class: r.ours ? "tf-strong" : "" }, svg, "+" + (r.q - r.f).toFixed(2));
        el("text", { x: sx(r.f) - 14, y: y + 1, "text-anchor": "end", "font-size": 14, class: "tf-muted" }, svg, r.f.toFixed(2));
        el("text", { x: sx(r.q) + 14, y: y + 1, "text-anchor": "start", "font-size": 14, class: "tf-muted" }, svg, r.q.toFixed(2));
      });
    }
    function draw() {
      passG.hidden = st.view !== "soup";
      if (st.view === "gap") {
        quantGap();
        cap.innerHTML = "Sintel Clean EPE of the same network before (Float32) and after (INT8) conversion. The number is the error the conversion adds.";
      } else {
        var v = st.pass === 0 ? [6.27, 6.37, 6.21, 6.13] : [7.21, 7.06, 7.12, 6.95];
        hbars(svg, [
          { key: "e1", label: "Epoch A", value: v[0], color: "var(--tf-ref-2)" },
          { key: "e2", label: "Epoch B", value: v[1], color: "var(--tf-ref-2)" },
          { key: "e3", label: "Epoch C", value: v[2], color: "var(--tf-ref-2)" },
          { key: "tinyflow", label: "Soup (average)", value: v[3], color: "var(--tf-orange)" }
        ], { left: 200, max: 8, barH: 24, gap: 12, ticks: 4, fs: 1.35 });
        cap.innerHTML = "The averaged weights beat every ingredient.";
      }
    }
    chipGroup(root, "data-train", function (v) { st.view = v; draw(); });
    chipGroup(root, "data-pass", function (v) { st.pass = +v; draw(); });
    draw(); redraws.push(draw);
  })();

  /* ---------------- Flow explorer ---------------- */
  (function () {
    var root = document.getElementById("tf-explorer"); if (!root) return;
    var DIR = "/research/TinyFlow/static/images/explorer/";
    var SC = [
      { key: "clean_ambush_7", label: "ambush_7", set: "Sintel Clean", e: { tinyflow: 1.83, edgeflownet: 3.30, nanoflownet: 9.37 } },
      { key: "clean_bandage_1", label: "bandage_1", set: "Sintel Clean", e: { tinyflow: 1.62, edgeflownet: 4.37, nanoflownet: 2.84 } },
      { key: "final_cave_2", label: "cave_2", set: "Sintel Final", e: { tinyflow: 1.66, edgeflownet: 1.97, nanoflownet: 3.31 } },
      { key: "final_ambush_5", label: "ambush_5", set: "Sintel Final", e: { tinyflow: 1.80, edgeflownet: 2.38, nanoflownet: 3.96 } },
      { key: "chairs_21803", label: "21803", set: "FlyingChairs", e: { tinyflow: 0.69, edgeflownet: 2.77, nanoflownet: 4.34 } },
      { key: "chairs_05449", label: "05449", set: "FlyingChairs", e: { tinyflow: 0.71, edgeflownet: 1.64, nanoflownet: 1.77 } }
    ];
    var MK = ["tinyflow", "edgeflownet", "nanoflownet"];
    var st = { row: 0, left: "tinyflow", right: "gt" };
    var scenes = document.getElementById("tf-ex-scenes");
    var btns = SC.map(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "tf-chip"; b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.innerHTML = "<small style=\"opacity:.7\">" + (s.set === "FlyingChairs" ? "Chairs" : s.set.replace("Sintel ", "")) + " · </small>" + s.label;
      b.addEventListener("click", function () { press(btns, b); st.row = i; draw(); });
      scenes.appendChild(b); return b;
    });
    var selL = document.getElementById("tf-ex-left"), selR = document.getElementById("tf-ex-right");
    [selL, selR].forEach(function (sel) {
      ["gt"].concat(MK).forEach(function (k) {
        var o = document.createElement("option"); o.value = k;
        o.textContent = NAME[k] + (PARAMS[k] ? " (" + PARAMS[k] + ")" : "");
        sel.appendChild(o);
      });
    });
    selL.value = st.left; selR.value = st.right;
    selL.addEventListener("change", function () { st.left = selL.value; draw(); });
    selR.addEventListener("change", function () { st.right = selR.value; draw(); });
    function lbl(k) { var e = SC[st.row].e[k]; return NAME[k] + (e === undefined ? "" : " · " + e.toFixed(2) + " EPE"); }
    function draw() {
      var s = SC[st.row], f = DIR + s.key + "_";
      var before = document.getElementById("tf-ex-before"), after = document.getElementById("tf-ex-after");
      before.src = f + st.left + ".jpg"; before.alt = NAME[st.left];
      after.src = f + st.right + ".jpg"; after.alt = NAME[st.right];
      document.getElementById("tf-ex-lbl-before").textContent = lbl(st.left);
      document.getElementById("tf-ex-lbl-after").textContent = lbl(st.right);
      document.getElementById("tf-ex-input").src = f + "input.jpg";
      document.getElementById("tf-ex-input-cap").textContent = "Input, " + s.set + " " + s.label;
      document.getElementById("tf-ex-epe").innerHTML = MK.map(function (k) {
        return "<div style=\"border-color:" + (k === "tinyflow" ? "var(--tf-orange)" : "var(--pp-border)") + "\"><b style=\"color:" +
          (k === "tinyflow" ? "var(--tf-orange-text)" : "var(--pp-ink)") + "\">" + s.e[k].toFixed(2) + "</b><span>" + NAME[k] + " EPE</span></div>";
      }).join("");
      document.getElementById("tf-ex-note").innerHTML = "On this pair TinyFlow's error is " + (s.e.edgeflownet / s.e.tinyflow).toFixed(1) +
        "× lower than EdgeFlowNet's and " + (s.e.nanoflownet / s.e.tinyflow).toFixed(1) + "× lower than NanoFlowNet's.";
    }
    draw();
  })();

  /* ---------------- Benchmark explorer ---------------- */
  (function () {
    var root = document.getElementById("tf-bench-widget"); if (!root) return;
    var svg = document.getElementById("tf-bench-svg"), cap = document.getElementById("tf-bench-cap");
    var T = {
      F32: { flownets: [4.86, 6.38, 1.85, 22.9], neuflow: [1.59, 2.91, 1.27, 6.4], edgeflownet: [6.17, 7.30, 3.59, 21.2], nanoflownet: [7.71, 8.76, 6.02, 38.8], tinyflow: [6.13, 6.95, 2.66, 20.6] },
      INT8: { edgeflownet: [6.46, 7.62, 3.91, 22.1], nanoflownet: [7.99, 8.68, 6.28, 40.7], tinyflow: [6.29, 7.13, 2.71, 21.1] }
    };
    var MET = ["Sintel Clean EPE", "Sintel Final EPE", "FlyingChairs EPE", "pixels with EPE above 3 px (%)"];
    var st = { prec: "INT8", m: 0 };
    function draw() {
      if (st.prec === "GAP") return drawGap();
      var keys = st.prec === "F32" ? ["tinyflow", "edgeflownet", "nanoflownet", "flownets", "neuflow"] : ["tinyflow", "edgeflownet", "nanoflownet"];
      var rows = keys.map(function (k) {
        return { key: k, label: NAME[k], sub: PARAMS[k] + (REF[k] ? ", reference" : (k === "nanoflownet" ? ", at 112×160" : "")), value: T[st.prec][k][st.m], color: COL[k], ref: REF[k] };
      });
      hbars(svg, rows, { left: 150, unit: st.m === 3 ? "%" : "", barH: 17, gap: 15 });
      var t = T[st.prec].tinyflow[st.m], e = T[st.prec].edgeflownet[st.m];
      cap.innerHTML = "TinyFlow is " + (100 * (e - t) / e).toFixed(0) + "% lower than EdgeFlowNet.";
    }
    function drawGap() {
      clear(svg);
      var keys = ["tinyflow", "edgeflownet", "nanoflownet"], W = vw(svg), L = W < 600 ? 112 : 150, R = W < 600 ? 50 : 60, top = 12, rowH = 32;
      var H = top + keys.length * rowH + 26; svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      var vals = []; keys.forEach(function (k) { vals.push(T.F32[k][st.m], T.INT8[k][st.m]); });
      var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), span = hi - lo;
      var step = niceStep(span * 1.5, 5), a = Math.floor((lo - span * 0.2) / step) * step, b = Math.ceil((hi + span * 0.2) / step) * step;
      var sx = function (v) { return L + (W - L - R) * (v - a) / (b - a); };
      for (var tv = a; tv <= b + 1e-9; tv += step) {
        el("line", { x1: sx(tv), x2: sx(tv), y1: top - 8, y2: H - 24, class: "tf-gridline" }, svg);
        el("text", { x: sx(tv), y: H - 8, "text-anchor": "middle", "font-size": 11, class: "tf-muted" }, svg, tickLabel(tv, step));
      }
      keys.forEach(function (k, i) {
        var y = top + i * rowH + 10, f = T.F32[k][st.m], q = T.INT8[k][st.m];
        el("text", { x: L - 10, y: y + 4.5, "text-anchor": "end", "font-size": 13, class: k === "tinyflow" ? "tf-strong" : "" }, svg, NAME[k]);
        el("line", { x1: sx(f), x2: sx(q), y1: y, y2: y, stroke: COL[k], "stroke-width": 4, "stroke-linecap": "round" }, svg);
        var c1 = el("circle", { cx: sx(f), cy: y, r: 6, fill: COL[k] }, svg); tip(c1, NAME[k] + " Float32: " + f);
        var c2 = el("circle", { cx: sx(q), cy: y, r: 6, fill: "var(--pp-surface)", stroke: COL[k], "stroke-width": 2.5 }, svg); tip(c2, NAME[k] + " INT8: " + q);
        var d = q - f;
        el("text", { x: Math.max(sx(f), sx(q)) + 12, y: y + 4.5, "font-size": 12.5, class: k === "tinyflow" ? "tf-strong" : "" }, svg, (d >= 0 ? "+" : "") + d.toFixed(2));
      });
      cap.innerHTML = "Float32 (filled) to INT8 (open).";
    }
    chipGroup(root, "data-prec", function (v) { st.prec = v; draw(); });
    chipGroup(root, "data-metric", function (v) { st.m = +v; draw(); });
    draw(); redraws.push(draw);
  })();

  /* ---------------- EPE by motion magnitude ---------------- */
  (function () {
    var root = document.getElementById("tf-bins-widget"); if (!root) return;
    var svg = document.getElementById("tf-bins-svg");
    var B = ["0-10 px", "10-40 px", "40-80 px", "80-128 px", "128+ px"];
    var D = {
      clean: {
        F32: { flownets: [1.30, 6.35, 16.45, 30.67, 98.69], neuflow: [0.45, 2.01, 4.79, 8.67, 40.97], edgeflownet: [1.11, 7.10, 21.42, 53.56, 146.6], nanoflownet: [1.20, 9.82, 40.11, 71.18, 154.2], tinyflow: [1.24, 6.06, 21.86, 51.99, 137.2] },
        INT8: { edgeflownet: [1.39, 7.43, 21.67, 53.88, 147.2], nanoflownet: [1.54, 11.25, 42.19, 72.97, 154.0], tinyflow: [1.32, 6.20, 22.18, 53.30, 137.6] }
      },
      final: {
        F32: { flownets: [1.78, 9.27, 21.77, 35.37, 111.2], neuflow: [0.64, 3.41, 10.56, 16.88, 78.71], edgeflownet: [1.47, 9.23, 26.17, 58.15, 147.2], nanoflownet: [1.74, 11.31, 38.30, 72.42, 155.5], tinyflow: [1.70, 8.95, 25.19, 51.78, 132.8] },
        INT8: { edgeflownet: [1.73, 9.71, 26.27, 59.12, 147.9], nanoflownet: [2.04, 12.55, 42.19, 75.07, 154.3], tinyflow: [1.80, 8.91, 25.23, 54.94, 133.5] }
      }
    };
    var st = { pass: "clean", prec: "INT8", scale: "rel" };
    function draw() {
      clear(svg);
      var W = vw(svg), H = W < 600 ? 280 : 300, L = 56, R = 12, T = 14, Bt = 42;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      var set = D[st.pass][st.prec], keys = Object.keys(set).sort(function (a, b) { return (REF[a] ? 1 : 0) - (REF[b] ? 1 : 0); });
      var sx = function (i) { return L + (W - L - R) * (i + 0.5) / B.length; };
      var sy, ticks, lab;
      if (st.scale === "log") {
        var lo = 0.3, hi = 200, ll = Math.log10(lo), lh = Math.log10(hi);
        sy = function (v) { return T + (H - T - Bt) * (1 - (Math.log10(v) - ll) / (lh - ll)); };
        ticks = [0.5, 1, 2, 5, 10, 20, 50, 100]; lab = "EPE (px, log scale)";
      } else {
        var vals = []; keys.forEach(function (k) { set[k].forEach(function (v, i) { vals.push(v / set.tinyflow[i]); }); });
        var mx = Math.max(2, Math.ceil(Math.max.apply(null, vals) * 2) / 2), mn = Math.min(0.25, Math.floor(Math.min.apply(null, vals) * 4) / 4);
        sy = function (v) { return T + (H - T - Bt) * (1 - (v - mn) / (mx - mn)); };
        ticks = []; for (var t = Math.ceil(mn * 4) / 4; t <= mx + 1e-9; t += (mx - mn) > 2 ? 0.5 : 0.25) ticks.push(+t.toFixed(2)); lab = "EPE relative to TinyFlow";
      }
      ticks.forEach(function (t) {
        el("line", { x1: L, x2: W - R, y1: sy(t), y2: sy(t), class: "tf-gridline", "stroke-width": st.scale === "rel" && t === 1 ? 2 : 1 }, svg);
        el("text", { x: L - 8, y: sy(t) + 4, "text-anchor": "end", "font-size": 12, class: "tf-muted" }, svg, String(t));
      });
      el("text", { x: 15, y: T + (H - T - Bt) / 2, transform: "rotate(-90 15 " + (T + (H - T - Bt) / 2) + ")", "text-anchor": "middle", "font-size": 13.5 }, svg, lab);
      B.forEach(function (b, i) { el("text", { x: sx(i), y: H - Bt + 20, "text-anchor": "middle", "font-size": W < 600 ? 10.5 : 12 }, svg, W < 600 ? b.replace(" px", "") : b); });
      el("text", { x: (L + W - R) / 2, y: H - 3, "text-anchor": "middle", "font-size": 13.5 }, svg, "ground-truth motion magnitude");
      keys.forEach(function (k) {
        var v = set[k].map(function (x, i) { return st.scale === "log" ? x : x / set.tinyflow[i]; });
        var d = v.map(function (x, i) { return (i ? "L" : "M") + sx(i).toFixed(1) + " " + sy(x).toFixed(1); }).join(" ");
        el("path", { d: d, fill: "none", stroke: COL[k], "stroke-width": k === "tinyflow" ? 3.2 : 2.2, "stroke-dasharray": REF[k] ? "6 4" : "none" }, svg);
        v.forEach(function (x, i) {
          var c = el("circle", { cx: sx(i), cy: sy(x), r: k === "tinyflow" ? 5.5 : 4.5, fill: REF[k] ? "var(--pp-surface)" : COL[k], stroke: COL[k], "stroke-width": 2 }, svg);
          tip(c, NAME[k] + ", " + B[i] + ": " + fmt(set[k][i]) + " EPE");
        });
      });
      document.getElementById("tf-bins-legend").innerHTML = keys.map(function (k) { return "<span style=\"--sw:" + COL[k] + "\">" + NAME[k] + (REF[k] ? " (reference)" : "") + "</span>"; }).join("");
    }
    chipGroup(root, "data-bpass", function (v) { st.pass = v; draw(); });
    chipGroup(root, "data-bprec", function (v) { st.prec = v; draw(); });
    chipGroup(root, "data-bscale", function (v) { st.scale = v; draw(); });
    draw(); redraws.push(draw);
  })();

  /* ---------------- Hailo-8 ---------------- */
  (function () {
    var svg = document.getElementById("tf-hailo-svg"); if (!svg) return;
    var P = [{ k: "tinyflow", fps: 10.5, epe: 5.76 }, { k: "edgeflownet", fps: 64, epe: 6.38 }, { k: "nanoflownet", fps: 190, epe: 7.50 }];
    function drawH() {
    clear(svg);
    var W = vw(svg), H = W < 600 ? 345 : 260, L = 60, R = 16, T = 18, Bt = 46;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var sx = function (f) { return L + (W - L - R) * (Math.log10(f) - Math.log10(5)) / (Math.log10(400) - Math.log10(5)); };
    var sy = function (e) { return T + (H - T - Bt) * (e - 5.2) / (7.8 - 5.2); };
    [5, 10, 20, 50, 100, 200, 400].forEach(function (f) {
      el("line", { x1: sx(f), x2: sx(f), y1: T, y2: H - Bt, class: "tf-gridline" }, svg);
      el("text", { x: sx(f), y: H - Bt + 18, "text-anchor": "middle", "font-size": 12, class: "tf-muted" }, svg, String(f));
    });
    [5.5, 6, 6.5, 7, 7.5].forEach(function (e) {
      el("line", { x1: L, x2: W - R, y1: sy(e), y2: sy(e), class: "tf-gridline" }, svg);
      el("text", { x: L - 8, y: sy(e) + 4, "text-anchor": "end", "font-size": 12, class: "tf-muted" }, svg, e.toFixed(1));
    });
    el("text", { x: (L + W - R) / 2, y: H - 5, "text-anchor": "middle", "font-size": 13.5 }, svg, "frames per second on the Hailo-8 (log scale)");
    el("text", { x: 15, y: T + (H - T - Bt) / 2, transform: "rotate(-90 15 " + (T + (H - T - Bt) / 2) + ")", "text-anchor": "middle", "font-size": 13.5 }, svg, "Sintel Clean EPE");
    P.forEach(function (p) {
      var g = el("g", {}, svg);
      el("circle", { cx: sx(p.fps), cy: sy(p.epe), r: p.k === "tinyflow" ? 10 : 8, fill: COL[p.k], stroke: "var(--pp-surface)", "stroke-width": 2 }, g);
      // label centred above the dot, kept inside the chart
      var half = p.k === "tinyflow" ? 82 : 70, lx = Math.max(half + 4, Math.min(W - half - 4, sx(p.fps))), ly = sy(p.epe);
      el("text", { x: lx, y: ly - 30, "text-anchor": "middle", "font-size": 13, class: p.k === "tinyflow" ? "tf-strong" : "" }, g, NAME[p.k] + " (" + PARAMS[p.k] + ")");
      el("text", { x: lx, y: ly - 15, "text-anchor": "middle", "font-size": 11.5, class: "tf-muted" }, g, p.fps + " FPS, " + p.epe.toFixed(2) + " EPE");
      tip(g, NAME[p.k] + ": " + p.fps + " FPS, " + p.epe + " EPE");
    });
    }
    drawH(); redraws.push(drawH);
  })();

  /* ---------------- Visual odometry ---------------- */
  (function () {
    var root = document.getElementById("tf-vo-widget"); if (!root) return;
    var svg = document.getElementById("tf-vo-svg");
    var V = {
      tartan: [
        ["factory", "abandonedfactory P001", [5.20, 0.31, 28.4], [3.49, 0.37, 29.6], [9.36, 0.99, 56.8], 0.80],
        ["amusement", "amusement P007", [2.23, 0.21, 25.7], [3.87, 0.21, 28.8], [8.88, 0.56, 47.2], 0.62],
        ["gascola", "gascola P001", [1.72, 0.21, 31.9], [1.88, 0.21, 37.3], [3.86, 0.46, 54.5], 0.09],
        ["alley", "japanesealley P005", [0.59, 0.27, 14.5], [1.05, 0.29, 19.2], [4.53, 0.98, 44.3], 0.07],
        ["neighborhood", "neighborhood P002", [4.88, 0.30, 34.2], [5.37, 0.28, 33.0], [11.72, 0.95, 62.7], 0.27],
        ["oldtown", "oldtown P004", [1.71, 0.26, 22.5], [2.12, 0.30, 25.8], [6.06, 0.78, 48.9], 0.13],
        ["forest", "seasonsforest P003", [0.72, 0.26, 14.5], [0.73, 0.24, 13.0], [3.13, 0.66, 33.8], 0.04],
        ["soulcity", "soulcity P003", [2.60, 0.44, 19.8], [1.99, 0.40, 21.9], [5.68, 1.10, 44.6], 0.04]
      ],
      uzh: [
        ["indoor_45_2", "indoor_45_2", [9.37, 0.60, 22.9], [8.21, 0.60, 25.0], [10.86, 3.00, 42.3], null],
        ["indoor_forward_3", "indoor_forward_3", [4.53, 0.33, 9.2], [2.14, 0.34, 6.7], [9.24, 0.78, 32.3], null],
        ["outdoor_forward_1", "outdoor_forward_1", [2.04, 0.16, 4.5], [2.41, 0.17, 4.8], [15.84, 0.44, 25.9], null]
      ]
    };
    var MEAN = { tartan: [[2.46, 0.28, 23.9], [2.56, 0.29, 26.1], [6.65, 0.81, 49.1]], uzh: [[5.32, 0.37, 12.2], [4.25, 0.37, 12.2], [11.98, 1.41, 33.5]] };
    var KEYS = ["tinyflow", "edgeflownet", "nanoflownet"], UNIT = [" m", "°", "°"];
    var st = { m: 0, d: "tartan" };
    function draw() {
      clear(svg);
      var rows = V[st.d], W = vw(svg), L = W < 600 ? 104 : 132, R = W < 600 ? 70 : 64, top = 6, bh = 9, grp = 3 * bh + 14;
      var H = top + rows.length * grp + 26; svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      var mx = 0; rows.forEach(function (r) { for (var i = 2; i < 5; i++) mx = Math.max(mx, r[i][st.m]); }); mx *= 1.05;
      var sx = function (v) { return L + (W - L - R) * v / mx; };
      var step = niceStep(mx, 5); mx = Math.ceil(mx / step) * step;
      for (var tv = 0; tv <= mx + 1e-9; tv += step) {
        el("line", { x1: sx(tv), x2: sx(tv), y1: top, y2: H - 22, class: "tf-gridline" }, svg);
        el("text", { x: sx(tv), y: H - 6, "text-anchor": "middle", "font-size": 11, class: "tf-muted" }, svg, tickLabel(tv, step));
      }
      var wins = { tinyflow: 0, edgeflownet: 0, nanoflownet: 0 };
      rows.forEach(function (r, i) {
        var y0 = top + i * grp, best = Math.min(r[2][st.m], r[3][st.m], r[4][st.m]);
        var g = el("g", {}, svg);
        el("text", { x: L - 10, y: y0 + 1.5 * bh + 4, "text-anchor": "end", "font-size": 12.5 }, g, r[0]);
        tip(g, r[1]);
        KEYS.forEach(function (k, j) {
          var v = r[2 + j][st.m], y = y0 + j * bh;
          var b = el("rect", { x: L, y: y, width: Math.max(1, sx(v) - L), height: bh - 1.5, rx: 2, fill: COL[k], class: "tf-anim" }, svg);
          tip(b, NAME[k] + ", " + r[1] + ": " + v + UNIT[st.m]);
          if (v === best) el("text", { x: sx(v) + 5, y: y + bh - 1.5, "font-size": 10.5, class: k === "tinyflow" ? "tf-strong" : "tf-muted" }, svg, v + UNIT[st.m] + " best");
        });
        if (st.m === 0 && r[5] !== null) {
          var gx = sx(r[5]);
          var gt = el("line", { x1: gx, x2: gx, y1: y0 - 2, y2: y0 + 3 * bh + 1, stroke: "var(--pp-ink)", "stroke-width": 2.5 }, svg);
          tip(gt, "Ground-truth flow, " + r[1] + ": " + r[5] + " m");
        }
        var bv = Math.min(r[2][0], r[3][0], r[4][0]); KEYS.forEach(function (k, j) { if (r[2 + j][0] === bv) wins[k]++; });
      });
      document.getElementById("tf-vo-gt-key").style.display = st.m === 0 && st.d === "tartan" ? "" : "none";
      var mean = MEAN[st.d];
      document.getElementById("tf-vo-readout").innerHTML = KEYS.map(function (k, j) {
        return "<div><b style=\"color:" + (k === "tinyflow" ? "var(--tf-orange-text)" : "var(--pp-ink)") + "\">" + mean[j][st.m] + UNIT[st.m] + "</b><span>" + NAME[k] + ", mean " + ["ATE", "rotation error", "direction error"][st.m] + "</span></div>";
      }).join("") + "<div><b>" + wins.tinyflow + " of " + rows.length + "</b><span>sequences where TinyFlow has the lowest ATE</span></div>";
    }
    chipGroup(root, "data-vo", function (v) { st.m = +v; draw(); });
    chipGroup(root, "data-vod", function (v) { st.d = v; draw(); });
    draw(); redraws.push(draw);
  })();

  /* ---------------- Illumination ---------------- */
  (function () {
    var root = document.getElementById("tf-illum-widget"); if (!root) return;
    var svg = document.getElementById("tf-illum-svg"), chips = document.getElementById("tf-illum-chips");
    var CND = ["Unchanged", "Gamma 0.70", "Gamma 0.85", "Gamma 1.20", "Gamma 1.50", "Brightness ×0.80", "Brightness ×1.25", "Offset +20", "Offset −20"];
    var E = {
      edgeflownet: [6.02, 60.92, 29.00, 41.94, 60.05, 40.38, 26.99, 52.05, 50.55],
      nanoflownet: [7.73, 90.12, 17.78, 23.17, 61.68, 21.16, 20.24, 75.15, 41.38],
      tinyflow: [5.65, 6.78, 5.92, 6.08, 6.67, 6.29, 8.99, 6.29, 6.57]
    };
    var cur = 4;
    var bs = CND.map(function (c, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "tf-chip"; b.textContent = c;
      b.setAttribute("aria-pressed", i === cur ? "true" : "false");
      b.addEventListener("click", function () { press(bs, b); cur = i; draw(); });
      chips.appendChild(b); return b;
    });
    var PAIRS = {
      "": { tinyflow: [0.90, 1.08, 0.98, 0.95, 1.06, 1.05, 3.19, 1.12, 0.99],
            edgeflownet: [0.92, 30.18, 11.76, 23.34, 38.43, 36.46, 19.54, 22.10, 32.46],
            nanoflownet: [2.35, 30.22, 5.90, 7.25, 11.39, 11.00, 6.79, 8.92, 9.37] },
      "ambush7_": { tinyflow: [1.66, 2.18, 1.74, 2.00, 2.10, 1.91, 1.88, 1.86, 1.84],
            edgeflownet: [3.30, 83.06, 53.32, 55.18, 74.24, 53.45, 49.18, 71.83, 69.01],
            nanoflownet: [9.37, 86.00, 41.43, 46.03, 154.63, 49.19, 43.35, 144.38, 111.23] },
      "runner_": { tinyflow: [0.55, 0.59, 0.56, 0.58, 0.67, 0.61, 0.57, 0.55, 0.61],
            edgeflownet: [0.79, 49.01, 39.03, 43.62, 38.90, 42.06, 46.41, 45.50, 43.68],
            nanoflownet: [3.39, 98.18, 52.73, 78.49, 89.59, 79.45, 83.73, 99.19, 90.56] }
    };
    var pair = "runner_";
    chipGroup(root, "data-illum-scene", function (v) { pair = v; draw(); });
    var grid = document.getElementById("tf-illum-grid"), DIR = "/research/TinyFlow/static/images/illum/";
    function draw() {
      hbars(svg, ["tinyflow", "edgeflownet", "nanoflownet"].map(function (k) {
        return { key: k, label: NAME[k], value: E[k][cur], color: COL[k] };
      }), { left: 150, max: 95, barH: 15, gap: 7 });
      var P = PAIRS[pair];
      var cells = [["Second frame, " + CND[cur].toLowerCase(), pair + "c" + cur + "_second", null], ["Ground truth", pair + "gt", null]]
        .concat(["tinyflow", "edgeflownet", "nanoflownet"].map(function (k) { return [NAME[k], pair + "c" + cur + "_" + k, k]; }));
      grid.innerHTML = cells.map(function (c) {
        var e = c[2] ? "<b style=\"color:" + (c[2] === "tinyflow" ? "var(--tf-orange-text)" : "var(--pp-ink)") + "\">" + P[c[2]][cur].toFixed(2) + " EPE</b>" : "";
        return "<figure><img src=\"" + DIR + c[1] + ".jpg\" alt=\"" + c[0] + "\" loading=\"lazy\"><figcaption><span>" + c[0] + "</span>" + e + "</figcaption></figure>";
      }).join("");
    }
    draw(); redraws.push(draw);
  })();
})();
</script>
