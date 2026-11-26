---
title: "TinyFlow: Breaking the Warping Bottleneck for Edge Optical Flow"
title_html: '<span class="tf-accent">Tiny</span>Flow: Breaking the Warping Bottleneck for Edge Optical Flow'
description: "TinyFlow is a 1.26M-parameter warp-free optical flow network that keeps iterative coarse-to-fine refinement and compiles as a single static INT8 graph for edge accelerators. Its INT8 model reaches 6.29/7.13 EPE on Sintel Clean/Final with 54% fewer parameters than EdgeFlowNet."
image: static/images/social.jpg
keywords: [optical flow, edge AI, Hailo-8, quantization, INT8, warp-free, iterative refinement, visual odometry, tiny robots, TinyFlow]

venue: "arXiv 2026"
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
  - text: Paper
    url: https://arxiv.org/pdf/2610.33338
    icon: fas fa-file-pdf
  - text: arXiv
    url: https://arxiv.org/abs/2610.33338
    icon: ai ai-arxiv
  - text: Interactive
    url: "#compare"
    icon: fas fa-sliders
  - text: Results
    url: "#results"
    icon: fas fa-chart-line
  - text: Workshop version
    url: /research/TinyFlow-workshop.html
    icon: fas fa-scroll

teaser:
  image: static/images/teaser.jpg
  alt: "Left: an image pair goes through edge-aware training and an edge accelerator, and TinyFlow's flow matches the ground truth. Middle: parameters against Sintel Clean EPE for EdgeFlowNet, NanoFlowNet and TinyFlow in F32 and INT8. Right: visual odometry trajectories on a UZH-FPV flight."
  caption: "**(a)** Our warp-free optical flow network with only **1.26M parameters** uses a pair of input images to predict dense, accurate optical flow on edge AI accelerators. **(b)** Sintel Clean: TinyFlow has the lowest EPE with **54% fewer parameters** than EdgeFlowNet and the smallest quantization gap, 0.16 against 0.29 for EdgeFlowNet and 0.72 for NanoFlowNet, evaluated on 384×512 px images. **(c)** Flow-only monocular VO on the real UZH-FPV dataset (ground truth in black): TinyFlow INT8 reaches **2.04 m** ATE against 2.41 m for EdgeFlowNet and 15.84 m for NanoFlowNet."

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

<div class="stat-strip">
  <div class="stat-card"><span class="stat-value">1.26<small>M</small></span><span class="stat-label">parameters, warp-free, one static INT8 graph</span></div>
  <div class="stat-card"><span class="stat-value">54%</span><span class="stat-label">fewer parameters than EdgeFlowNet, and more accurate on every benchmark</span></div>
  <div class="stat-card"><span class="stat-value">+0.16</span><span class="stat-label">EPE from Float32 to INT8 on Sintel Clean, down from over +1.0</span></div>
  <div class="stat-card"><span class="stat-value">7<small> of </small>11</span><span class="stat-label">visual odometry sequences with the lowest trajectory error</span></div>
</div>

## Abstract

High-performance optical flow networks are difficult to deploy on resource-constrained edge accelerators because their iterative refinement warps features by the current flow, which relies on flow-dependent resampling and data-dependent memory access. We present **TinyFlow**, a 1.26M-parameter warp-free optical flow network that preserves iterative coarse-to-fine refinement by replacing the warp with a fixed-window correlation over constant offsets, so the whole network compiles as a single static INT8 graph.

Quantization-aware fine-tuning, warp-teacher distillation, and model souping reduce the Float32-to-INT8 penalty to **below 0.2 end-point error (EPE)** on MPI-Sintel. TinyFlow outperforms EdgeFlowNet and NanoFlowNet on Sintel Clean, Sintel Final, and FlyingChairs in both Float32 and INT8, while using **54% fewer parameters** than EdgeFlowNet, and our INT8 model achieves **6.29 / 7.13 EPE** on Sintel Clean / Final. In flow-only monocular visual odometry on TartanAir and UZH-FPV, the same INT8 model yields the lowest trajectory error on **seven of eleven** sequences.

## Why warping is the bottleneck

Deployable optical flow has so far meant giving up the mechanism that makes optical flow accurate. Every network that runs on an edge accelerator today, like NanoFlowNet and EdgeFlowNet, is a single feed-forward pass, and every network at the top of the accuracy benchmarks is iterative. Iterative estimators refine their prediction in a loop that **warps** features by the current flow before each correction, usually through `grid_sample`, so that each step only has to resolve the motion that remains.

That warp reads memory at addresses computed from the data at run time, and an accelerator that executes a fixed dataflow graph has no way to perform it. When the operator is not supported, the network either fails to compile or the warp executes on the host CPU and the accelerator's throughput advantage is lost. Deployable networks therefore leave out iterative refinement, and **their lower accuracy follows from that omission rather than from their smaller size.**

<div class="key-idea"><strong>The idea.</strong> TinyFlow keeps the iterative refinement loop and removes the warp. It correlates the two frames over a fixed window of constant offsets, so the flow estimate selects among channel values rather than steering memory addresses. The data dependence that makes warping undeployable does not disappear. It moves into ordinary arithmetic.</div>

## Warp-free matching

TinyFlow correlates the projected features of the two frames directly over a fixed window of offsets,

$$
C^s_0(\mathbf{x}, \boldsymbol{\delta}) \triangleq \left\langle \hat{f}^s_1(\mathbf{x}),\, \hat{f}^s_2(\mathbf{x} + \boldsymbol{\delta}) \right\rangle, \qquad \boldsymbol{\delta} \in \{-r_s,\ldots,r_s\}^2 .
$$

A warped residual cost volume reads the second frame at $$\mathbf{x} + \mathbf{u}^s(\mathbf{x}) + \boldsymbol{\delta}$$ instead. For integer flow it is a shifted read of the fixed one,

$$
C^s_{\mathbf{u}}(\mathbf{x}, \boldsymbol{\delta}) = C^s_0\big(\mathbf{x}, \boldsymbol{\delta} + \mathbf{u}^s(\mathbf{x})\big),
$$

so for the full window, warping adds no matching evidence that the fixed volume does not already contain. Its only effect is to recenter the search window on the current estimate. TinyFlow keeps the window centered at zero and makes the radii large enough that the true displacement does not leave it.

<figure class="tf-widget" id="tf-warp-widget">
<div class="tf-warp">
<div>
<svg class="tf-svg" id="tf-warp-svg" viewBox="0 0 340 340" tabindex="0" role="img" aria-label="Offset grid of the second frame around one pixel. Drag to set the current flow."></svg>
</div>
<div>
<div class="tf-range-row"><label for="tf-warp-r">Window radius r</label><input type="range" id="tf-warp-r" min="1" max="7" value="3"><output id="tf-warp-r-out">3</output></div>
<div class="tf-range-row"><label for="tf-warp-w">Warped window</label><input type="range" id="tf-warp-w" min="0" max="3" value="1"><output id="tf-warp-w-out">1</output></div>
<div class="tf-controls" style="margin:0.6rem 0 0"><div class="tf-group"><span class="tf-group-label">Volume</span><button class="tf-chip" type="button" data-warp-mode="full" aria-pressed="false">Full window</button><button class="tf-chip" type="button" data-warp-mode="marg" aria-pressed="true">Axis marginals</button></div></div>
<div class="tf-readout"><div><b id="tf-warp-u">(2, 1)</b><span>current flow u, in grid px</span></div><div><b id="tf-warp-k">14</b><span>correlation channels per pixel</span></div></div>
<div class="tf-status" id="tf-warp-status"></div>
</div>
</div>
<figcaption><strong>Try it.</strong> Drag in the grid, or focus it and use the arrow keys, to set the current flow <em>u</em>. The orange cells are the fixed window that TinyFlow computes once. The gold outline is the window that a warping network would read around <em>x + u</em>. While the gold window stays inside the orange one, warping only rereads values the fixed volume already holds. TinyFlow computes the two axis marginals of the window, 2(2r+1) channels instead of (2r+1)<sup>2</sup>.</figcaption>
</figure>

## Architecture

{% figure src="static/images/architecture.png", alt="TinyFlow architecture: a shared encoder builds a feature pyramid at 1/4, 1/8 and 1/16; at each scale a feature projector and a separable correlation with radius 3, 6 or 8 feed a flow prediction head, refined coarse to fine with four weight-tied iterations at 1/8 and 1/4", caption="**TinyFlow architecture.** **(a)** A shared encoder builds a multi-scale feature pyramid. Separable correlation matches the features at each scale and the flow is refined coarse-to-fine. **(b)** The backbone encoder is built from lightweight feature-extraction blocks of depth-wise and point-wise convolutions. **(c)** The three flow prediction heads have the same architecture but separate weights." %}

**Feature projector.** Instead of a per-pixel L2 normalization, which needs a channel reduction and a data-dependent division, the features pass through a small learnable projector, $$\hat{\mathbf{f}} = \mathrm{BN}(\mathrm{Conv}_{1\times1}\mathbf{f}) / \sqrt{C}$$. The convolution, the batch normalization and the fixed scale fuse into one integer-legal operation.

**Edge-compilable correlation.** A shift by a constant offset is a convolution with a one-hot kernel, so each marginal becomes three fixed-weight layers. One-hot convolutions produce the shifted copies of the second frame's features in an offset-major layout, an elementwise product multiplies them with the replicated first-frame features, and a grouped 1×1 convolution with unit weights sums the channels of each offset. No weight in the construction is learned and no memory address depends on the input. To the compiler the volume is ordinary `Conv` and `Mul` layers.

## Edge-aware training

Quantizing a trained checkpoint after the fact is not sufficient. Post-training quantization of the base checkpoint raises Sintel Clean EPE from 6.92 in Float32 to 8.09 in INT8, a penalty of 1.17, because weights trained in floating point have never had to tolerate rounding. TinyFlow is therefore fine-tuned under simulated quantization, with fake-quantization nodes at exactly the points where the accelerator compiler will quantize: per-channel symmetric INT8 weights and per-tensor asymmetric UINT8 activations.

- **Warp-teacher distillation.** A warped variant of TinyFlow that performs `grid_sample` warping is more accurate but cannot be deployed. It still guides the quantized network during fine-tuning.
- **INT8-aware model soup.** Float and quantized accuracy do not rank checkpoints the same way, so checkpoints are selected and averaged by their INT8 accuracy.
- **Training mixture and iterations.** FlyingThings3D is mixed into the FlyingChairs fine-tuning data, and the weight-tied update blocks run eight iterations at inference instead of the four used in training.

MPI-Sintel is used only for testing, never for training, fine-tuning or calibration.

<figure class="tf-widget" id="tf-train-widget">
<div class="tf-controls"><div class="tf-group"><span class="tf-group-label">Show</span><button class="tf-chip" type="button" data-train="gap" aria-pressed="true">Quantization penalty</button><button class="tf-chip" type="button" data-train="soup" aria-pressed="false">Model soup</button></div><div class="tf-group" id="tf-train-pass" hidden><span class="tf-group-label">Pass</span><button class="tf-chip" type="button" data-pass="0" aria-pressed="true">Sintel Clean</button><button class="tf-chip" type="button" data-pass="1" aria-pressed="false">Sintel Final</button></div></div>
<svg class="tf-svg" id="tf-train-svg" viewBox="0 0 640 230" role="img" aria-label="Training chart"></svg>
<figcaption id="tf-train-cap"></figcaption>
</figure>

<div id="compare"></div>

## See the difference

Pick a scene and two predictions, then drag the slider. These are the nine frame pairs of the paper's qualitative comparison, one from the FlyingChairs validation set and four each from Sintel Clean and Final. Hue encodes flow direction and brightness encodes magnitude, normalized per row to the ground truth's scale, and the number in each panel is its EPE.

<figure class="tf-widget tf-explorer" id="tf-explorer">
<div class="tf-controls">
<div class="tf-group" id="tf-ex-scenes"><span class="tf-group-label">Scene</span></div>
</div>
<div class="tf-controls">
<div class="tf-group"><label class="tf-group-label" for="tf-ex-left">Left</label><select id="tf-ex-left"></select></div>
<div class="tf-group"><label class="tf-group-label" for="tf-ex-right">Right</label><select id="tf-ex-right"></select></div>
</div>
<figure class="media-figure compare-figure"><div class="compare" id="tf-ex-compare"><img class="compare-after" id="tf-ex-after" src="/research/TinyFlow/static/images/qual/r0_tinyflow.jpg" alt="TinyFlow (Ours)"><img class="compare-before" id="tf-ex-before" src="/research/TinyFlow/static/images/qual/r0_gt.jpg" alt="Ground truth"><div class="compare-handle" aria-hidden="true"></div><span class="compare-label compare-label-before" id="tf-ex-lbl-before">Ground truth</span><span class="compare-label compare-label-after" id="tf-ex-lbl-after">TinyFlow (Ours)</span><input class="compare-range" type="range" min="0" max="100" value="50" aria-label="Comparison slider"></div></figure>
<div class="tf-input"><figure><img id="tf-ex-input" src="/research/TinyFlow/static/images/qual/r0_input.jpg" alt="Input frame"><figcaption id="tf-ex-input-cap">Input</figcaption></figure><figure><img id="tf-ex-gt" src="/research/TinyFlow/static/images/qual/r0_gt.jpg" alt="Ground truth flow"><figcaption>Ground truth</figcaption></figure></div>
<div class="tf-readout" id="tf-ex-epe"></div>
<figcaption id="tf-ex-note"></figcaption>
</figure>

{% figure src="static/images/qualitative.jpg", alt="Grid of flow fields: input, ground truth, FlowNetS, NeuFlow v2, EdgeFlowNet, NanoFlowNet and TinyFlow on one FlyingChairs pair and four pairs each from Sintel Clean and Sintel Final, with the EPE in each panel", caption="**Qualitative comparison.** FlowNetS and NeuFlow v2 are reference models outside the deployable comparison. Rows are the lowest-EPE frame of each scene under TinyFlow, chosen among scenes with visible object motion. TinyFlow recovers the cleanest and sharpest motion segments among the deployable models at the smallest parameter count, EdgeFlowNet fragments large motion, and NanoFlowNet produces structured noise." %}

<div id="results"></div>

## Results

All models are trained on FlyingChairs and FlyingThings3D and tested on MPI-Sintel and the FlyingChairs validation set, with EPE in pixels (lower is better). Large reference models are shown for context. They depend on flow-dependent resampling and cannot be deployed on the edge accelerators that the paper targets.

<figure class="tf-widget" id="tf-bench-widget">
<div class="tf-controls">
<div class="tf-group"><span class="tf-group-label">Precision</span><button class="tf-chip" type="button" data-prec="F32" aria-pressed="false">Float32</button><button class="tf-chip" type="button" data-prec="INT8" aria-pressed="true">INT8</button><button class="tf-chip" type="button" data-prec="GAP" aria-pressed="false">F32 → INT8</button></div>
<div class="tf-group"><span class="tf-group-label">Metric</span><button class="tf-chip" type="button" data-metric="0" aria-pressed="true">Sintel Clean</button><button class="tf-chip" type="button" data-metric="1" aria-pressed="false">Sintel Final</button><button class="tf-chip" type="button" data-metric="2" aria-pressed="false">FlyingChairs</button><button class="tf-chip" type="button" data-metric="3" aria-pressed="false">&gt; 3 px (%)</button></div>
</div>
<svg class="tf-svg" id="tf-bench-svg" viewBox="0 0 640 260" role="img" aria-label="Benchmark chart"></svg>
<figcaption id="tf-bench-cap"></figcaption>
</figure>

| Model | Params | Precision | Sintel Clean | Sintel Final | Chairs | >3 px (%) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| *FlowNetS (reference)* | 38.7M | F32 | 4.86 | 6.38 | 1.85 | 22.9 |
| *NeuFlow v2 (reference)* | 9.03M | F32 | 1.59 | 2.91 | 1.27 | 6.4 |
| EdgeFlowNet | 2.75M | F32 | 6.17 | 7.30 | 3.59 | 21.2 |
| | | INT8 | 6.46 | 7.62 | 3.91 | 22.1 |
| NanoFlowNet† | 0.17M | F32 | 7.71 | 8.76 | 6.02 | 38.8 |
| | | INT8 | 7.99 | 8.68 | 6.28 | 40.7 |
| **TinyFlow (Ours)** | **1.26M** | F32 | **6.13** | **6.95** | **2.66** | **20.6** |
| | | INT8 | **6.29** | **7.13** | **2.71** | **21.1** |

<p class="table-note">Bold marks the best deployable result. All models are evaluated on 384×512 px images except NanoFlowNet (†), which is evaluated at its native resolution of 112×160 px.</p>

TinyFlow outperforms EdgeFlowNet on every benchmark in both precisions while using **54% fewer parameters** (1.26M against 2.75M). Under INT8 it reaches 6.29 / 7.13 EPE on Sintel Clean and Final against 6.46 / 7.62 for EdgeFlowNet, and its FlyingChairs EPE is **31% lower** (2.71 against 3.91). FlowNetS is more accurate on the mean but uses about 30× more parameters, and NeuFlow v2 is more accurate still but depends on flow-dependent resampling. Among the deployable models, TinyFlow offers the best trade-off between accuracy and size.

### Error by motion magnitude

The first two bins, below 10 px and 10 to 40 px, hold roughly 90% of Sintel pixels. On Sintel Clean under INT8, TinyFlow leads every deployable model on both, and it edges the 30× larger FlowNetS between 10 and 40 px. On Sintel Final its advantage at large motion is even more pronounced: beyond 128 px the margin over EdgeFlowNet reaches 14.4 EPE in both precisions.

<figure class="tf-widget" id="tf-bins-widget">
<div class="tf-controls">
<div class="tf-group"><span class="tf-group-label">Pass</span><button class="tf-chip" type="button" data-bpass="clean" aria-pressed="true">Sintel Clean</button><button class="tf-chip" type="button" data-bpass="final" aria-pressed="false">Sintel Final</button></div>
<div class="tf-group"><span class="tf-group-label">Precision</span><button class="tf-chip" type="button" data-bprec="F32" aria-pressed="false">Float32</button><button class="tf-chip" type="button" data-bprec="INT8" aria-pressed="true">INT8</button></div>
<div class="tf-group"><span class="tf-group-label">Scale</span><button class="tf-chip" type="button" data-bscale="log" aria-pressed="false">Log</button><button class="tf-chip" type="button" data-bscale="rel" aria-pressed="true">Relative to TinyFlow</button></div>
</div>
<svg class="tf-svg" id="tf-bins-svg" viewBox="0 0 640 300" role="img" aria-label="EPE by motion magnitude"></svg>
<div class="tf-legend" id="tf-bins-legend"></div>
<figcaption>EPE by ground-truth motion magnitude, from Table II of the paper. Reference models are drawn dashed and exist only in Float32. In the relative view, values above 1 mean more error than TinyFlow in that bin.</figcaption>
</figure>

### On the Hailo-8

The models are deployed on a Raspberry Pi 5 with a Hailo-8 AI accelerator, measured on the same chip and the same 100-pair Sintel Clean sample. Iterative refinement improves accuracy at the cost of latency, while the parameter count stays below that of EdgeFlowNet.

<figure class="tf-widget" id="tf-hailo-widget">
<svg class="tf-svg" id="tf-hailo-svg" viewBox="0 0 640 260" role="img" aria-label="Frames per second against EPE on the Hailo-8"></svg>
<figcaption>Throughput against accuracy on a Raspberry Pi 5 with a Hailo-8, on a 100-pair Sintel Clean sample. Hover a point for its numbers. Up and to the right is better.</figcaption>
</figure>

## Visual odometry

Dense flow on a small robot is rarely the end product, so the paper tests whether the ranking survives a downstream task. Every deployable model runs at INT8 and feeds the same five-point RANSAC pose estimator. No depth is used and the translation scale is taken from the ground truth, so the metrics measure only how well the flow constrains the camera rotation and the direction of travel. Over all eleven sequences TinyFlow has the lowest ATE on **seven**, EdgeFlowNet on four and NanoFlowNet on none.

<figure class="tf-widget" id="tf-vo-widget">
<div class="tf-controls">
<div class="tf-group"><span class="tf-group-label">Metric</span><button class="tf-chip" type="button" data-vo="0" aria-pressed="true">ATE (m)</button><button class="tf-chip" type="button" data-vo="1" aria-pressed="false">Rotation (°)</button><button class="tf-chip" type="button" data-vo="2" aria-pressed="false">Direction (°)</button></div>
<div class="tf-group"><span class="tf-group-label">Data</span><button class="tf-chip" type="button" data-vod="tartan" aria-pressed="true">TartanAir</button><button class="tf-chip" type="button" data-vod="uzh" aria-pressed="false">UZH-FPV</button></div>
</div>
<svg class="tf-svg" id="tf-vo-svg" viewBox="0 0 640 420" role="img" aria-label="Visual odometry errors per sequence"></svg>
<div class="tf-legend"><span style="--sw:var(--tf-orange)">TinyFlow (Ours)</span><span style="--sw:var(--tf-blue)">EdgeFlowNet</span><span style="--sw:var(--tf-purple)">NanoFlowNet</span><span id="tf-vo-gt-key" style="--sw:var(--pp-ink)">Ground-truth flow (ATE)</span></div>
<div class="tf-readout" id="tf-vo-readout"></div>
<figcaption>Flow-only monocular visual odometry with the INT8 models. ATE is the position RMSE in metres after SE(3) alignment, Rotation the median per-frame rotation error and Direction the mean per-frame translation direction error. The ground-truth flow through the same estimator gives a 0.26 m mean ATE on TartanAir, an order of magnitude below every learned model, so the remaining error lies in the flow rather than in the estimator.</figcaption>
</figure>

{% figure src="static/images/vo_traj.jpg", alt="Estimated visual odometry trajectories of TinyFlow, EdgeFlowNet and NanoFlowNet against the ground truth on one UZH-FPV flight and three TartanAir trajectories", caption="**Flow-only visual odometry trajectories at INT8.** TinyFlow (orange), EdgeFlowNet (blue) and NanoFlowNet (purple) against the ground truth (black) for one UZH-FPV flight (a) and three TartanAir trajectories (b to d). TinyFlow stays on the ground-truth path through loops and sharp turns, EdgeFlowNet drifts on the return legs, and NanoFlowNet leaves the path." %}

## Robustness to illumination change

Benchmarks render both frames under identical lighting, whereas auto-exposure on a moving robot changes the brightness of the second frame relative to the first. The paper applies gamma, brightness scaling and an additive offset to the second frame of a fixed 209-pair Sintel Clean subset and leaves the ground truth untouched. TinyFlow stays within **5.92 to 8.99 EPE** across all eight conditions, while EdgeFlowNet rises to 27 to 61 and NanoFlowNet to 18 to 90. The paper attributes this to the tanh-bounded update heads, which limit the flow TinyFlow can emit regardless of how far the features shift.

<figure class="tf-widget" id="tf-illum-widget">
<div class="tf-controls"><div class="tf-group" id="tf-illum-chips"><span class="tf-group-label">Second frame</span></div></div>
<svg class="tf-svg" id="tf-illum-svg" viewBox="0 0 640 170" role="img" aria-label="EPE under illumination change"></svg>
<figcaption>EPE of the INT8 models under the selected change, applied to the second frame only. NanoFlowNet runs at its native 112×160.</figcaption>
</figure>

{% figure src="static/images/illumination.jpg", alt="One Sintel Clean pair, unchanged and with gamma 1.5, brightness 0.8 and offset +20 applied to the second frame, with the flow of TinyFlow, EdgeFlowNet and NanoFlowNet", caption="One Sintel Clean pair, unchanged and with gamma 1.5, brightness scaling by 0.8 and an offset of +20 applied to the second frame. The first column shows the second frame each model receives. TinyFlow moves from 0.90 to at most 1.12 EPE under the three changes, while EdgeFlowNet predicts flow up to four times the true magnitude. All models run INT8." %}

## Conclusion

TinyFlow is an edge-deployable 1.26M-parameter optical flow network that retains iterative refinement and removes warping. Its fixed-window correlation carries the data dependence of warping in channel values rather than in memory addresses. TinyFlow outperforms EdgeFlowNet on Sintel Clean, Sintel Final and FlyingChairs in both precisions with 54% fewer parameters, and leads NanoFlowNet by a wide margin at every motion magnitude. The ranking carries over to flow-only visual odometry, where TinyFlow has the lowest ATE on seven of the eleven TartanAir and UZH-FPV sequences.

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
    var W = vw(svg), L = W < 600 ? 112 : (opt.left || 150), R = W < 600 ? 52 : 70, top = 8, bh = opt.barH || 26, gap = opt.gap || 12;
    var H = top + rows.length * (bh + gap) + 24;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var vmax = opt.max || Math.max.apply(null, rows.map(function (r) { return r.value; })) * 1.04;
    var step = niceStep(vmax, opt.ticks || 5), max = Math.ceil(vmax / step) * step;
    var sx = function (v) { return L + (W - L - R) * v / max; };
    for (var tv = 0; tv <= max + 1e-9; tv += step) {
      var x = sx(tv);
      el("line", { x1: x, x2: x, y1: top - 4, y2: H - 22, class: "tf-gridline" }, svg);
      el("text", { x: x, y: H - 6, "text-anchor": "middle", "font-size": 11, class: "tf-muted" }, svg, tickLabel(tv, step));
    }
    rows.forEach(function (r, i) {
      var y = top + i * (bh + gap);
      el("text", { x: L - 10, y: y + bh / 2 + 4.5, "text-anchor": "end", "font-size": 13, class: r.key === "tinyflow" ? "tf-strong" : "" }, svg, r.label);
      if (r.sub) el("text", { x: L - 10, y: y + bh / 2 + 17, "text-anchor": "end", "font-size": 10, class: "tf-muted" }, svg, r.sub);
      var bar = el("rect", { x: L, y: y, height: bh, width: Math.max(1, sx(r.value) - L), rx: 4, fill: r.color, opacity: r.ref ? 0.75 : 1, class: "tf-anim" }, svg);
      if (r.ref) bar.setAttribute("stroke-dasharray", "4 3"), bar.setAttribute("stroke", "var(--pp-muted)"), bar.setAttribute("fill-opacity", "0.55");
      tip(bar, r.label + ": " + fmt(r.value));
      el("text", { x: sx(r.value) + 6, y: y + bh / 2 + 4.5, "font-size": 12.5, class: r.key === "tinyflow" ? "tf-strong" : "" }, svg, fmt(r.value) + (opt.unit || ""));
    });
  }

  /* ---------------- Warp versus fixed window ---------------- */
  (function () {
    var root = document.getElementById("tf-warp-widget"); if (!root) return;
    var svg = document.getElementById("tf-warp-svg");
    var rIn = document.getElementById("tf-warp-r"), wIn = document.getElementById("tf-warp-w");
    var N = 17, C = 8, cell = 20, pad = 0;
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
      document.getElementById("tf-warp-u").textContent = "(" + st.ux + ", " + st.uy + ")";
      document.getElementById("tf-warp-k").textContent = st.mode === "full" ? String(full) : marg + " (vs " + full + ")";
      document.getElementById("tf-warp-r-out").textContent = r;
      document.getElementById("tf-warp-w-out").textContent = w;
      var s = document.getElementById("tf-warp-status");
      s.classList.toggle("tf-bad", !covered);
      var inside = st.mode === "full"
        ? "<strong>Inside the window.</strong> Every value the warped window reads, C<sub>u</sub>(x, δ) = C<sub>0</sub>(x, δ + u), is already in the fixed volume, so warping only recenters the search."
        : "<strong>Inside the reach of both marginals.</strong> For the axis marginals the same identity holds along each axis when the orthogonal part of the residual is small relative to the smoothness of the features, which the coarse-to-fine schedule is designed to keep true.";
      s.innerHTML = covered ? inside
        : "<strong>Outside the window.</strong> The warp would read offsets the fixed volume does not hold. TinyFlow avoids this by refining coarse to fine, so each scale only has to capture the residual left by the coarser estimate, and by using large radii at the coarse scales.";
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
    function draw() {
      passG.hidden = st.view !== "soup";
      if (st.view === "gap") {
        hbars(svg, [
          { key: "ptq", label: "Post-training", sub: "6.92 → 8.09", value: 1.17, color: "var(--tf-ref)" },
          { key: "tinyflow", label: "TinyFlow recipe", sub: "6.13 → 6.29", value: 0.16, color: "var(--tf-orange)" }
        ], { left: 150, max: 1.3, barH: 34, gap: 22, ticks: 4 });
        cap.innerHTML = "Increase in Sintel Clean EPE from Float32 to INT8. Post-training quantization of the base checkpoint costs 1.17 EPE. Quantization-aware fine-tuning with warp-teacher distillation and an INT8-aware model soup costs 0.16 on Clean (6.13 to 6.29) and 0.18 on Final (6.95 to 7.13).";
      } else {
        var v = st.pass === 0 ? [6.27, 6.37, 6.21, 6.13] : [7.21, 7.06, 7.12, 6.95];
        hbars(svg, [
          { key: "e1", label: "Epoch A", value: v[0], color: "var(--tf-ref-2)" },
          { key: "e2", label: "Epoch B", value: v[1], color: "var(--tf-ref-2)" },
          { key: "e3", label: "Epoch C", value: v[2], color: "var(--tf-ref-2)" },
          { key: "tinyflow", label: "Soup (average)", value: v[3], color: "var(--tf-orange)" }
        ], { left: 150, max: 8, barH: 26, gap: 12, ticks: 4 });
        cap.innerHTML = "Sintel " + (st.pass === 0 ? "Clean" : "Final") + " EPE of the three best fine-tuning epochs and of their weight average. The soup outperforms each of its ingredients on both passes.";
      }
    }
    chipGroup(root, "data-train", function (v) { st.view = v; draw(); });
    chipGroup(root, "data-pass", function (v) { st.pass = +v; draw(); });
    draw(); redraws.push(draw);
  })();

  /* ---------------- Flow explorer ---------------- */
  (function () {
    var root = document.getElementById("tf-explorer"); if (!root) return;
    var SC = [
      { label: "FlyingChairs", set: "FlyingChairs validation", e: [0.49, 0.37, 2.77, 3.15, 0.71] },
      { label: "cave_2", set: "Sintel Clean", e: [1.62, 0.53, 1.49, 3.01, 1.55] },
      { label: "bandage_1", set: "Sintel Clean", e: [2.76, 0.94, 2.21, 3.05, 1.88] },
      { label: "cave_4", set: "Sintel Clean", e: [2.62, 1.25, 2.64, 3.83, 2.36] },
      { label: "market_6", set: "Sintel Clean", e: [3.55, 1.25, 6.79, 5.93, 2.68] },
      { label: "mountain_1", set: "Sintel Final", e: [2.12, 0.45, 2.49, 3.82, 1.68] },
      { label: "ambush_5", set: "Sintel Final", e: [2.80, 1.21, 2.82, 5.34, 2.29] },
      { label: "cave_4", set: "Sintel Final", e: [2.46, 1.15, 3.40, 4.00, 2.51] },
      { label: "bandage_1", set: "Sintel Final", e: [3.93, 1.04, 3.05, 5.02, 2.72] }
    ];
    var MK = ["flownets", "neuflow", "edgeflownet", "nanoflownet", "tinyflow"];
    var st = { row: 0, left: "gt", right: "tinyflow" };
    var scenes = document.getElementById("tf-ex-scenes");
    var btns = SC.map(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "tf-chip"; b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.innerHTML = (i === 0 ? "" : "<small style=\"opacity:.7\">" + (s.set === "Sintel Clean" ? "Clean · " : "Final · ") + "</small>") + s.label;
      b.addEventListener("click", function () { press(btns, b); st.row = i; draw(); });
      scenes.appendChild(b); return b;
    });
    var selL = document.getElementById("tf-ex-left"), selR = document.getElementById("tf-ex-right");
    function fill(sel, withGt) {
      (withGt ? ["gt"] : []).concat(["tinyflow", "edgeflownet", "nanoflownet", "flownets", "neuflow"]).forEach(function (k) {
        var o = document.createElement("option"); o.value = k;
        o.textContent = NAME[k] + (PARAMS[k] ? " (" + PARAMS[k] + ")" : "") + (REF[k] ? ", reference" : "");
        sel.appendChild(o);
      });
    }
    fill(selL, true); fill(selR, true); selL.value = "gt"; selR.value = "tinyflow";
    selL.addEventListener("change", function () { st.left = selL.value; draw(); });
    selR.addEventListener("change", function () { st.right = selR.value; draw(); });
    function epe(k) { var i = MK.indexOf(k); return i < 0 ? null : SC[st.row].e[i]; }
    function lbl(k) { var e = epe(k); return NAME[k] + (e === null ? "" : " · " + e.toFixed(2) + " EPE"); }
    function draw() {
      var r = "r" + st.row + "_";
      var before = document.getElementById("tf-ex-before"), after = document.getElementById("tf-ex-after");
      before.src = BASE + r + st.left + ".jpg"; before.alt = NAME[st.left];
      after.src = BASE + r + st.right + ".jpg"; after.alt = NAME[st.right];
      document.getElementById("tf-ex-lbl-before").textContent = lbl(st.left);
      document.getElementById("tf-ex-lbl-after").textContent = lbl(st.right);
      document.getElementById("tf-ex-input").src = BASE + r + "input.jpg";
      document.getElementById("tf-ex-gt").src = BASE + r + "gt.jpg";
      document.getElementById("tf-ex-input-cap").textContent = "Input, " + SC[st.row].set + (st.row ? ", " + SC[st.row].label : "");
      var e = SC[st.row].e, ro = document.getElementById("tf-ex-epe");
      ro.innerHTML = MK.slice().reverse().map(function (k) {
        var v = epe(k), best = !REF[k] && v === Math.min(e[2], e[3], e[4]);
        return "<div style=\"border-color:" + (best ? "var(--tf-orange)" : "var(--pp-border)") + "\"><b style=\"color:" + (k === "tinyflow" ? "var(--tf-orange-text)" : "var(--pp-ink)") + "\">" + v.toFixed(2) + "</b><span>" + NAME[k] + (REF[k] ? " (reference)" : "") + "</span></div>";
      }).join("");
      var ratioE = (e[2] / e[4]).toFixed(1), ratioN = (e[3] / e[4]).toFixed(1);
      document.getElementById("tf-ex-note").innerHTML = (e[4] <= e[2]
        ? "On this pair TinyFlow's error is " + ratioE + "× lower than EdgeFlowNet's and " + ratioN + "× lower than NanoFlowNet's."
        : "On this pair EdgeFlowNet is slightly lower than TinyFlow, and TinyFlow's error is " + ratioN + "× lower than NanoFlowNet's.") +
        " The orange outline marks the best deployable model. EPE values are those printed in the paper's figure.";
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
      hbars(svg, rows, { left: 150, unit: st.m === 3 ? "%" : "", barH: 26, gap: 14 });
      var t = T[st.prec].tinyflow[st.m], e = T[st.prec].edgeflownet[st.m];
      cap.innerHTML = (st.prec === "F32" ? "Float32" : "INT8") + " " + MET[st.m] + ". TinyFlow is " + (100 * (e - t) / e).toFixed(0) + "% lower than EdgeFlowNet here" +
        (st.prec === "F32" ? ". Dashed bars are reference models, which rely on flow-dependent resampling and are not edge-deployable." : ". Reference models are not shown in INT8 because they cannot be deployed.");
    }
    function drawGap() {
      clear(svg);
      var keys = ["tinyflow", "edgeflownet", "nanoflownet"], W = vw(svg), L = W < 600 ? 112 : 150, R = W < 600 ? 50 : 60, top = 18, rowH = 54;
      var H = top + keys.length * rowH + 30; svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      var vals = []; keys.forEach(function (k) { vals.push(T.F32[k][st.m], T.INT8[k][st.m]); });
      var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), span = hi - lo;
      var step = niceStep(span * 1.5, 5), a = Math.floor((lo - span * 0.2) / step) * step, b = Math.ceil((hi + span * 0.2) / step) * step;
      var sx = function (v) { return L + (W - L - R) * (v - a) / (b - a); };
      for (var tv = a; tv <= b + 1e-9; tv += step) {
        el("line", { x1: sx(tv), x2: sx(tv), y1: top - 8, y2: H - 24, class: "tf-gridline" }, svg);
        el("text", { x: sx(tv), y: H - 8, "text-anchor": "middle", "font-size": 11, class: "tf-muted" }, svg, tickLabel(tv, step));
      }
      keys.forEach(function (k, i) {
        var y = top + i * rowH + 14, f = T.F32[k][st.m], q = T.INT8[k][st.m];
        el("text", { x: L - 10, y: y + 4.5, "text-anchor": "end", "font-size": 13, class: k === "tinyflow" ? "tf-strong" : "" }, svg, NAME[k]);
        el("line", { x1: sx(f), x2: sx(q), y1: y, y2: y, stroke: COL[k], "stroke-width": 4, "stroke-linecap": "round" }, svg);
        var c1 = el("circle", { cx: sx(f), cy: y, r: 7, fill: COL[k] }, svg); tip(c1, NAME[k] + " Float32: " + f);
        var c2 = el("circle", { cx: sx(q), cy: y, r: 7, fill: "var(--pp-surface)", stroke: COL[k], "stroke-width": 3 }, svg); tip(c2, NAME[k] + " INT8: " + q);
        var d = q - f;
        el("text", { x: Math.max(sx(f), sx(q)) + 12, y: y + 4.5, "font-size": 12.5, class: k === "tinyflow" ? "tf-strong" : "" }, svg, (d >= 0 ? "+" : "") + d.toFixed(2));
      });
      cap.innerHTML = "Change in " + MET[st.m] + " from Float32 (filled) to INT8 (open), as in Table I, where NanoFlowNet runs at its native 112×160. On Sintel Clean TinyFlow's quantization gap is 0.16, against 0.29 for EdgeFlowNet.";
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
      var W = vw(svg), H = W < 600 ? 280 : 300, L = 52, R = 12, T = 14, Bt = 40;
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
        el("text", { x: L - 8, y: sy(t) + 4, "text-anchor": "end", "font-size": 11, class: "tf-muted" }, svg, String(t));
      });
      el("text", { x: 14, y: T + (H - T - Bt) / 2, transform: "rotate(-90 14 " + (T + (H - T - Bt) / 2) + ")", "text-anchor": "middle", "font-size": 11, class: "tf-muted" }, svg, lab);
      B.forEach(function (b, i) { el("text", { x: sx(i), y: H - Bt + 20, "text-anchor": "middle", "font-size": W < 600 ? 10.5 : 12 }, svg, W < 600 ? b.replace(" px", "") : b); });
      el("text", { x: (L + W - R) / 2, y: H - 4, "text-anchor": "middle", "font-size": 11, class: "tf-muted" }, svg, "ground-truth motion magnitude");
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
    var W = vw(svg), H = 260, L = 56, R = 16, T = 18, Bt = 44;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var sx = function (f) { return L + (W - L - R) * (Math.log10(f) - Math.log10(5)) / (Math.log10(400) - Math.log10(5)); };
    var sy = function (e) { return T + (H - T - Bt) * (e - 5.4) / (7.9 - 5.4); };
    [5, 10, 20, 50, 100, 200, 400].forEach(function (f) {
      el("line", { x1: sx(f), x2: sx(f), y1: T, y2: H - Bt, class: "tf-gridline" }, svg);
      el("text", { x: sx(f), y: H - Bt + 18, "text-anchor": "middle", "font-size": 11, class: "tf-muted" }, svg, String(f));
    });
    [5.5, 6, 6.5, 7, 7.5].forEach(function (e) {
      el("line", { x1: L, x2: W - R, y1: sy(e), y2: sy(e), class: "tf-gridline" }, svg);
      el("text", { x: L - 8, y: sy(e) + 4, "text-anchor": "end", "font-size": 11, class: "tf-muted" }, svg, e.toFixed(1));
    });
    el("text", { x: (L + W - R) / 2, y: H - 6, "text-anchor": "middle", "font-size": 11, class: "tf-muted" }, svg, "frames per second on the Hailo-8 (log scale)");
    el("text", { x: 14, y: T + (H - T - Bt) / 2, transform: "rotate(-90 14 " + (T + (H - T - Bt) / 2) + ")", "text-anchor": "middle", "font-size": 11, class: "tf-muted" }, svg, "Sintel Clean EPE");
    P.forEach(function (p) {
      var g = el("g", {}, svg);
      el("circle", { cx: sx(p.fps), cy: sy(p.epe), r: p.k === "tinyflow" ? 10 : 8, fill: COL[p.k], stroke: "var(--pp-surface)", "stroke-width": 2 }, g);
      var right = sx(p.fps) > W * 0.62, lx = right ? sx(p.fps) - 14 : sx(p.fps) + 14, an = right ? "end" : "start";
      el("text", { x: lx, y: sy(p.epe) - 4, "text-anchor": an, "font-size": 13, class: p.k === "tinyflow" ? "tf-strong" : "" }, g, NAME[p.k] + " (" + PARAMS[p.k] + ")");
      el("text", { x: lx, y: sy(p.epe) + 12, "text-anchor": an, "font-size": 11.5, class: "tf-muted" }, g, p.fps + " FPS, " + p.epe.toFixed(2) + " EPE");
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
    function draw() {
      hbars(svg, ["tinyflow", "edgeflownet", "nanoflownet"].map(function (k) {
        return { key: k, label: NAME[k], value: E[k][cur], color: COL[k] };
      }), { left: 150, max: 95, barH: 26, gap: 14 });
    }
    draw(); redraws.push(draw);
  })();
})();
</script>
