---
title: "TinyFlow: Breaking the Warping Bottleneck for Edge Optical Flow"
description: "TinyFlow is a 1.26M-parameter warp-free optical flow network that keeps iterative refinement and compiles to a single static INT8 graph for edge accelerators such as the Hailo-8."
image: static/images/social.jpg
keywords: [optical flow, edge AI, Hailo-8, quantization, INT8, tiny robots, TinyFlow]

venue: "IROS 2026 Workshop on Insect-scale Autonomy"

authors:
  - name: "Xiao'ao Song"
    url: "https://scholar.google.com/citations?hl=en&user=88aAUZMAAAAJ"
  - name: Chahat Deep Singh
    url: https://chahatdeep.github.io/
affiliations:
  - Perception, Robotics, AI and Sensing (PRAISe) Lab, University of Colorado Boulder

links:
  - text: Results
    url: "#results"
    icon: fas fa-chart-line

teaser:
  image: static/images/results_plots.png
  alt: "Left: parameters versus Sintel Clean EPE for Float32 and INT8. Right: flow-only visual odometry trajectories on UZH-FPV"
  caption: "**Left:** TinyFlow is the most accurate deployable model at 1.26M parameters and loses only **+0.16 EPE** in INT8. **Right:** flow-only visual odometry on UZH-FPV: **2.04 m** trajectory error for TinyFlow INT8, vs. 2.41 m for EdgeFlowNet and 15.84 m for NanoFlowNet."

math: true

bibtex: |
  @inproceedings{song2026tinyflow,
    title     = {TinyFlow: Breaking the Warping Bottleneck for Edge Optical Flow},
    author    = {Song, Xiao'ao and Singh, Chahat Deep},
    booktitle = {IROS 2026 Workshop on Insect-scale Autonomy},
    address   = {Pittsburgh, PA, USA},
    year      = {2026}
  }
---

## Abstract

High-performance optical flow networks are difficult to deploy on resource-constrained edge accelerators, because warping relies on flow-dependent resampling and data-dependent memory access. We present **TinyFlow**, a 1.26M-parameter warp-free optical flow network that preserves iterative coarse-to-fine refinement using fixed-window correlation, and compiles as a single static INT8 graph.

Quantization-aware fine-tuning, warp-teacher distillation and model souping reduce the Float32-to-INT8 penalty to **below 0.2 EPE** on MPI-Sintel. TinyFlow outperforms EdgeFlowNet and NanoFlowNet on Sintel Clean, Sintel Final and FlyingChairs in both Float32 and INT8, while using **54% fewer parameters** than EdgeFlowNet. In INT8, TinyFlow reaches **6.29 / 7.13 EPE** on Sintel Clean / Final.

## Motivation

{% figure src="static/images/motivation.jpg", alt="A small drone flying past a brick wall, with its path drawn as a colored trail", caption="Tiny robots need to know what is moving around them, at every pixel, using only onboard compute." %}

Dense optical flow tells a robot what is moving at every pixel, but accurate flow networks run on desktop GPUs, while a tiny drone can only carry an edge accelerator drawing about a watt.

{% figure src="static/images/pipeline.png", alt="An image pair goes through edge-aware network training; TinyFlow's predicted optical flow closely matches the ground truth", caption="TinyFlow predicts dense optical flow with only 1.26M parameters, entirely on an edge AI accelerator." %}

The most accurate networks are **iterative**: each refinement step **warps** the second frame's features by the current flow, reading memory at addresses computed at run time. Edge accelerators run fixed dataflow graphs and cannot do this, so today's deployable networks drop iterative refinement, and the accuracy that comes with it.

## Warp-free iterative refinement

{% figure src="static/images/warp_vs_warpfree.png", alt="Left: warp-based refinement, which re-matches warped features on every loop. Right: TinyFlow, which matches features once and reuses the fixed result in every loop.", caption="**Left:** warp-based refinement re-matches warped features in every iteration, which is dynamic and data-dependent. **Right:** TinyFlow matches the two frames once and reuses that fixed result in every iteration." %}

TinyFlow keeps the refinement loop and removes the warp. Instead of warping by the current flow, it correlates the two frames' projected features $$\hat{f}_1^s, \hat{f}_2^s$$ at scale $$s$$ over a **fixed window** of offsets:

$$
C_0^s(\mathbf{x}, \boldsymbol{\delta}) = \left\langle \hat{f}_1^s(\mathbf{x}),\, \hat{f}_2^s(\mathbf{x} + \boldsymbol{\delta}) \right\rangle, \qquad \boldsymbol{\delta} \in \{-r_s, \dots, r_s\}^2
$$

Every offset is a constant known at compile time, so the volume is plain shifted inner products with no data-dependent addressing. For integer flow, the warped cost volume that iterative methods compute is just a shifted read of this fixed one:

$$
C_u^s(\mathbf{x}, \boldsymbol{\delta}) = C_0^s\big(\mathbf{x}, \boldsymbol{\delta} + \mathbf{u}^s(\mathbf{x})\big)
$$

Warping therefore adds no matching evidence the fixed volume does not already contain; it only recenters the search window. TinyFlow keeps the window centered and makes it wide enough instead. The current flow enters the update block as an input channel, so **the data dependence that warping puts in memory addresses moves into ordinary arithmetic**, and the whole network exports, quantizes and compiles for the accelerator.

## Architecture

{% figure src="static/images/architecture.png", alt="TinyFlow architecture: a shared encoder builds two feature pyramids, a local separable correlation matches them, then coarse estimation at 1/16 and shared refinement cells at 1/8 and 1/4 produce the final flow", caption="A shared encoder, one fixed matching step, then coarse-to-fine refinement with weight-tied cells. No warping anywhere." %}

## Edge-aware training

{% figure src="static/images/training.png", alt="Three steps: train on FlyingChairs and FlyingThings3D, quantization-aware fine-tuning, deploy on Hailo-8", caption="Train on synthetic data, fine-tune under simulated INT8 quantization, then deploy on the Hailo-8." %}

Quantizing after training is not enough: weights trained in floating point have never had to tolerate rounding. TinyFlow is fine-tuned with fake-quantization nodes placed exactly where the accelerator compiler will quantize (per-channel symmetric INT8 weights, per-tensor UINT8 activations). Two more measures act on the same stage:

- **Warp-teacher distillation.** A warping variant of TinyFlow is more accurate but cannot compile. It still teaches the deployable network during fine-tuning.
- **INT8-aware model soup.** Checkpoints are selected by their quantized accuracy and averaged in weight space.

Together these cut the Float32 → INT8 penalty from over +1.0 to **below +0.2 EPE**: Sintel Clean 6.13 → 6.29 and Final 6.95 → 7.13. MPI-Sintel is used only for testing, never for training, fine-tuning or calibration.

<div id="results"></div>

## Results

All models are trained on FlyingChairs and FlyingThings3D and evaluated at 384×512 (end-point error in pixels, lower is better).

| Model | Params | Precision | Sintel Clean | Sintel Final | Chairs | >3 px (%) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| *FlowNetS (reference)* | 38.7M | F32 | 4.86 | 6.38 | 1.85 | 22.9 |
| *NeuFlow v2 (reference)* | 9.03M | F32 | 1.59 | 2.91 | 1.27 | 6.4 |
| EdgeFlowNet | 2.75M | F32 | 6.17 | 7.30 | 3.59 | 21.2 |
| | | INT8 | 6.46 | 7.62 | 3.91 | 22.1 |
| NanoFlowNet† | 0.17M | F32 | 7.71 | 8.76 | 6.02 | 38.8 |
| | | INT8 | 7.99 | 8.68 | 6.28 | 40.7 |
| **TinyFlow (ours)** | **1.26M** | F32 | **6.13** | **6.95** | **2.66** | **20.6** |
| | | INT8 | **6.29** | **7.13** | **2.71** | **21.1** |

<p class="table-note">Reference models rely on flow-dependent resampling and are not edge-deployable. Bold marks the best deployable result. †Evaluated at its native 112×160; at 384×512 it collapses to 20.7 / 22.5 EPE.</p>

TinyFlow beats EdgeFlowNet on every benchmark in both precisions with 54% fewer parameters, and its FlyingChairs EPE in INT8 is 31% lower (2.71 vs. 3.91). It reaches a lower error than FlowNetS on four of the five qualitative scenes below, with 30× fewer parameters.

{% figure src="static/images/qualitative.jpg", alt="Qualitative optical flow comparison across FlyingChairs, Sintel Clean, Sintel Final, Middlebury and a planar simulation scene", caption="Hue encodes flow direction and brightness its magnitude; numbers are per-frame EPE. TinyFlow recovers the cleanest motion boundaries among the deployable models, EdgeFlowNet fragments large motion, and NanoFlowNet produces structured noise." %}

**On the Hailo-8.** On a Raspberry Pi 5 with a Hailo-8 accelerator, measured on the same chip and a 100-pair Sintel Clean sample, TinyFlow runs at 10.5 FPS with 5.76 EPE. On the same setup, EdgeFlowNet runs at 64 FPS with 6.38 EPE, and NanoFlowNet at 190 FPS with 7.50 EPE. Iterative refinement buys accuracy at the cost of latency, while the parameter count stays below EdgeFlowNet's.

Contact: [xiaoao.song@colorado.edu](mailto:xiaoao.song@colorado.edu), [chahat.singh@colorado.edu](mailto:chahat.singh@colorado.edu)
