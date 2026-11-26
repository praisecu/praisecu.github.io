---
title: "NibbleFlow: Sign-Exponent-Mantissa Refinement for 4-Bit Optical Flow"
description: "SEM replaces the linear output layer of iterative optical flow networks with a floating point step, a sign, an exponent and a mantissa. It removes up to 86% of the error that 4-bit weights add, and NibbleFlow, built around it, runs on a Hailo-8 with 0.51M parameters."
image: static/images/social.jpg
keywords: [optical flow, edge AI, Hailo-8, 4-bit quantization, INT4, iterative refinement, tiny robots, NibbleFlow, SEM]

citation_date: "2026/11"

authors:
  - name: "Xiao'ao Song"
    url: "https://scholar.google.com/citations?hl=en&user=88aAUZMAAAAJ"
  - name: Chahat Deep Singh
    url: https://chahatdeep.github.io/
affiliations:
  - Perception, Robotics, AI and Sensing (PRAISe) Lab, University of Colorado Boulder

links:
  - text: Paper
    url: static/NibbleFlow.pdf
    icon: fas fa-file-pdf
  - text: Interactive
    url: "#compare"
    icon: fas fa-sliders
  - text: Results
    url: "#results"
    icon: fas fa-chart-line

teaser:
  image: static/images/teaser.png
  alt: "Sintel flow from RAFT-small, RAPIDFlow and NibbleFlow in FP32, with 4-bit weights and a linear output layer, and with 4-bit weights and SEM, next to a bar chart of Sintel clean EPE for each network"
  caption: "**One layer decides whether iterative flow survives 4 bits.** With a linear output layer (middle), 4-bit weights wash out the flow of every network. With **SEM** (right), the same networks stay close to floating point. Far right, Sintel clean EPE in FP32, with 4-bit weights and a linear output, and with 4-bit weights and SEM."

math: true

bibtex: |
  @misc{song2026nibbleflow,
    title  = {NibbleFlow: Sign-Exponent-Mantissa Refinement for 4-Bit Optical Flow},
    author = {Song, Xiao'ao and Singh, Chahat Deep},
    year   = {2026},
    url    = {https://www.praisecu.com/research/NibbleFlow.html}
  }
---

<div class="stat-strip">
  <div class="stat-card"><span class="stat-value">86%</span><span class="stat-label">of the 4-bit error removed by changing one layer</span></div>
  <div class="stat-card"><span class="stat-value">0.51<small>M</small></span><span class="stat-label">parameters, with 86% of the weights in 4 bits</span></div>
  <div class="stat-card"><span class="stat-value">45%</span><span class="stat-label">lower Sintel error than the best deployable baseline</span></div>
  <div class="stat-card"><span class="stat-value">&lt;1<small> px</small></span><span class="stat-label">of EPE lost from FP32 to INT4 for the Hailo-8</span></div>
</div>

## Abstract

Accurate optical flow relies on iterative refinement, yet the edge accelerators that small robots and other devices on batteries carry execute only static integer graphs and often leave just 4 bits per weight. Under this constraint, iterative networks lose much of their accuracy, and the networks designed for these chips are far less accurate to begin with.

We trace this loss to a single layer, the linear output of the update block. Refinement needs steps whose sizes differ by more than a factor of one hundred, but a linear output represents them like a fixed point number. The rounding error of its weights therefore adds the same error to every update, however small, and this error accumulates over the iterations.

We introduce **SEM**, an output layer that instead predicts each flow update as a floating point number with a **S**ign, an **E**xponent and a **M**antissa. A rounding error then perturbs each update only in proportion to its size, while every output remains bounded and easy to quantize. Replacing only the output layer of existing networks such as RAFT-small and RAPIDFlow preserves their floating point accuracy and removes **up to 86%** of the error that 4-bit weights add. Built around SEM, **NibbleFlow** has only **0.51M parameters** and runs on a Hailo-8 with most of its weights in 4 bits. It loses less than one pixel of EPE to its floating point version and cuts the Sintel error of the best deployable baseline by **up to 45%**, with **5.4× fewer parameters**.

## Motivation

{% figure src="static/images/motivation.jpg", alt="A small drone flying past a brick wall, with its path drawn as a colored trail", caption="Tiny robots need dense motion at every pixel, computed by an accelerator that draws about a watt." %}

The most accurate flow networks refine their estimate over many iterations, and an update block decides each correction. Edge accelerators such as the Hailo-8 can run such a loop once the warp is removed, but they also store weights in as little as **4 bits**. At that precision, iterative networks fall apart. We asked which part of the network breaks, and the answer turned out to be a single layer.

## The problem lives in one layer

Refinement asks one output layer for steps of very different sizes. The first iterations must cover most of the motion, while the last ones only polish it. At the first step of our coarsest level alone, the needed steps span **seven octaves**, from $$2^{-6}$$ to $$2^{1}$$ pixels.

A linear output represents a step the way a **fixed point** number represents a value. Its error is absolute, so the same rounding error that is negligible for a large step swamps a small one. The window of steps it can take accurately therefore has a fixed width.

{% figure src="static/images/range.png", width="760px", alt="Bar chart of the measured range of steps one update takes: the linear update covers 5.6 octaves and stops below one pixel, while SEM covers 7.0 octaves and spans the whole needed range", caption="**Measured on trained networks.** At the first update of the 1/32 level, the linear update covers only 5.6 octaves and saturates below one pixel. SEM covers 7.0 octaves, wider at both ends, matching the span of its exponents." %}

## SEM: a floating point step

A floating point number escapes this limit because it stores the order of magnitude separately from the significant digits. SEM lets the update block do the same. For each flow component, it predicts a sign logit $$a$$, exponent logits $$\boldsymbol{\ell}$$ over powers of two, and a mantissa logit $$b$$, and the step is their product:

$$
\begin{gathered}
\Delta = \tanh(a)\cdot E \cdot 2\sigma(b), \\
E = \sum_{k=k_{\min}}^{k_{\max}} \pi_k\, 2^{k}, \qquad \boldsymbol{\pi} = \mathrm{softmax}(\boldsymbol{\ell})
\end{gathered}
$$

Taking the logarithm turns the product into a sum, so the network's outputs set the **logarithm** of the step. An error in them becomes a **relative** error of the step, and a step of $$2^{-6}$$ pixels and a step of $$2^{2}$$ pixels are taken with the same relative precision.

<div class="key-idea"><strong>Why it suits integer hardware.</strong> Every predicted quantity lies in a fixed interval, $$\tanh(a)\in(-1,1)$$, $$\boldsymbol{\pi}\in[0,1]^K$$ and $$2\sigma(b)\in(0,2)$$, so each quantizes to 8 bits with a static scale. Decoding needs only a softmax, a fixed 1×1 convolution with weights $$2^k$$ and two elementwise products, all of which edge accelerators support.</div>

Because only the output layer changes, SEM drops into **any network that refines its flow by increments**, with the same exponents and no tuning.

## NibbleFlow

{% figure src="static/images/architecture.png", alt="NibbleFlow architecture: features at 1/8, 1/16 and 1/32 are correlated along fixed directions without warping, and one shared SEM update block refines the flow coarse to fine", caption="**(a)** Features at 1/8, 1/16 and 1/32 are correlated along fixed directions, so nothing is warped, and the flow is refined coarse to fine from zero. **(b)** The SEM update block predicts each step as the product of a sign, an exponent and a mantissa." %}

NibbleFlow is built around SEM to run as **one static graph** on an edge accelerator. It refines without a warp by correlating features along fixed directions, eight at 1/32, six at 1/16 and four at 1/8, and it shares a single SEM update block of width 96 across all three levels. The result has **0.51M parameters**, compiles for a Hailo-8 with **86% of its weights in 4 bits**, and is quantized with the Hailo compiler's quantization-aware fine-tuning without any Sintel data.

<div id="compare"></div>

## See the difference

Drag the slider. Both sides come from **the same network with 4-bit weights**; only the output layer differs. The numbers are the end-point error of this Sintel clean frame, from Fig. 3 of the paper.

{% grid items="static/images/panel_input.jpg, static/images/panel_gt.jpg", captions="Input frame (Sintel clean) | Ground truth flow", columns=2 %}

### RAFT-small with 4-bit weights

{% compare before="static/images/panel_raft_linear.jpg", after="static/images/panel_raft_sem.jpg", before_label="Linear · 15.05 EPE", after_label="SEM · 3.50 EPE" %}

### NibbleFlow with 4-bit weights

{% compare before="static/images/panel_nibble_linear.jpg", after="static/images/panel_nibble_sem.jpg", before_label="Linear · 6.51 EPE", after_label="SEM · 1.41 EPE" %}

{% figure src="static/images/qualitative.jpg", alt="Grid of flow fields from RAPIDFlow, RAFT-small, IRR-PWC and NibbleFlow on Sintel clean, Sintel final and FlyingChairs, each in FP32, linear INT4 and SEM INT4", caption="Four iterative networks on Sintel clean, Sintel final and FlyingChairs, each in FP32, with a linear output in INT4, and with SEM in INT4. With the linear layer, every network loses much of the flow in INT4, which becomes washed out, noisy or dominated by a spurious motion. With SEM, the flow stays close to FP32." %}

<div id="results"></div>

## Results

### SEM in existing networks

We replace only the convolution that regresses the update in three networks that refine very differently: RAFT-small (a GRU at one scale), RAPIDFlow (coarse to fine with a shared block) and IRR-PWC (a pyramid with shared weights). Both versions are trained identically on FlyingChairs only. In floating point, SEM costs no accuracy in RAFT-small and RAPIDFlow. With 4-bit weights, it changes everything.

| Network | FP32 | INT4, linear | INT4, SEM |
|---|:---:|:---:|:---:|
| RAFT-small | 2.84 | 17.83 | **8.79** |
| RAPIDFlow, 12 iterations | 2.57 | 4.85 | **3.27** |
| RAPIDFlow, 1 iteration | 5.32 | 9.73 | **5.84** |
| IRR-PWC | 2.94 | 5.72 | **4.43** |

<p class="table-note">Sintel clean EPE (lower is better). FP32 is the linear version. INT4 is 4-bit weights with 8-bit activations, simulated with the same quantizer for both versions. With one iteration of RAPIDFlow, 4-bit weights add 4.41 EPE to the linear version and only 0.61 to SEM, which removes 86% of the added error.</p>

**Where the error comes from.** Quantizing one part of RAPIDFlow at a time, the 4-bit weights of the last convolution alone, the layer that SEM replaces, cost the linear version **4.98 of the 5.00 EPE** that quantizing every layer costs. With SEM, the same weights cost only **0.10**. Keeping that one layer in 8 bits also rescues the linear version; SEM simply makes the output layer tolerate 4 bits like every other layer.

### Comparison with edge optical flow networks

| Network | Params | GMACs | Sintel clean | Sintel final | Chairs | Hailo-8 FPS |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| NanoFlowNet | 0.17M | 0.93 | 14.14 | 14.31 | 10.39 | 120.55 |
| EdgeFlowNet | 2.75M | 19.98 | 8.65 | 9.22 | 5.50 | 76.30 |
| **NibbleFlow (ours)** | **0.51M** | 6.97 | **4.76** | **5.68** | **3.14** | 15.19 |

<p class="table-note">EPE of the INT4 networks quantized for the Hailo-8 (lower is better), on all 1041 Sintel pairs and 640 FlyingChairs validation pairs. In FP32, NibbleFlow reaches 3.88 / 4.76 on Sintel clean / final. No network is trained or calibrated on Sintel.</p>

NibbleFlow loses less than one pixel to its floating point version and cuts the Sintel clean error of EdgeFlowNet by **45%** with **5.4× fewer parameters**. NanoFlowNet is smaller and faster, but its INT4 error is more than twice as high. Iterative refinement buys this accuracy at a lower frame rate than the single-pass baselines.

### A controlled test of the update alone

| Update | Sintel clean | Sintel final | Clean, last 50 epochs | Final, last 50 epochs | Range (octaves) | Largest step |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Linear | 4.89 | 6.10 | 5.04 ± 0.07 | 6.23 ± 0.07 | 5.6 | 2<sup>−0.6</sup> px |
| **SEM** | **4.85** | **5.84** | **4.95 ± 0.06** | **5.99 ± 0.06** | **7.0** | **2<sup>0.1</sup> px** |

<p class="table-note">The same network, trained on FlyingChairs only with the same seed, changing only the output of the update block. The range and the largest step are measured at the first update of the 1/32 level.</p>

## Downstream: visual odometry

{% figure src="static/images/vo_traj.png", alt="Estimated trajectories of NibbleFlow, EdgeFlowNet and NanoFlowNet against the ground truth on two UZH-FPV flights and two TartanAir trajectories", caption="Monocular visual odometry from optical flow alone, with every network in INT4. NibbleFlow (orange) keeps the loops and turns closest to the ground truth (black), EdgeFlowNet (blue) keeps the shape but drifts, and NanoFlowNet (purple) jitters and leaves the path." %}

Dense flow on a small robot is rarely the end product, so we feed each INT4 network into the same pose estimator, the five point algorithm inside RANSAC, with no depth and the scale taken from the ground truth.

| Mean ATE (m) | NibbleFlow | EdgeFlowNet | NanoFlowNet | Ground truth flow |
|---|:---:|:---:|:---:|:---:|
| TartanAir, 8 synthetic trajectories | **4.95** | 6.70 | 10.64 | 0.26 |
| UZH-FPV, 3 real drone flights | **5.46** | 8.89 | 18.76 | n/a |

<p class="table-note">Absolute trajectory error after SE(3) alignment, unweighted mean over the sequences. NibbleFlow has the lowest ATE on seven of the eleven sequences, EdgeFlowNet on four and NanoFlowNet on none.</p>

## Beyond optical flow

SEM changes nothing but the representation of the step, so the same principle applies to **any iterative regressor that must run in fixed point arithmetic**, such as depth or disparity refinement. NibbleFlow builds on the warp-free refinement scheme of [TinyFlow](/research/TinyFlow-workshop.html).

Contact: [xiaoao.song@colorado.edu](mailto:xiaoao.song@colorado.edu), [chahat.singh@colorado.edu](mailto:chahat.singh@colorado.edu)
