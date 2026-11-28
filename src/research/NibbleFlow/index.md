---
title: "NibbleFlow: Sign-Exponent-Mantissa Refinement for 4-Bit Optical Flow"
# Optional: the same title with markup for the page heading only (tab title and metadata use title).
title_html: '<span class="title-accent">Nibble</span>Flow: <span class="sem">S</span>ign-<span class="sem">E</span>xponent-<span class="sem">M</span>antissa Refinement for 4-Bit Optical Flow'
description: "SEM replaces the linear output layer of iterative optical flow networks with a floating point step, a sign, an exponent and a mantissa. It removes up to 86% of the error that 4-bit weights add, and NibbleFlow, built around it, runs on a Hailo-8 with 0.51M parameters."
image: static/images/social-card.jpg
keywords: [optical flow, edge AI, Hailo-8, 4-bit quantization, INT4, iterative refinement, tiny robots, NibbleFlow, SEM]

citation_date: "2026/11"

authors:
  - name: "Xiao'ao Song"
    url: "https://scholar.google.com/citations?hl=en&user=Nvmjf1gAAAAJ"
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
  caption: "**Sign-Exponent-Mantissa refinement for 4-bit optical flow.** Each network is shown in FP32 and with 4-bit weights, with its linear output layer or with **SEM**. The 4-bit results use post-training quantization to 4-bit weights and 8-bit activations, except NibbleFlow with SEM, which runs as INT4 on the Hailo-8. Left, one Sintel clean pair (ambush_7) with the EPE and parameter count in each panel; the FP32 panels of RAFT-small and RAPIDFlow use SEM. Right, Sintel clean EPE. **SEM significantly reduces the 4-bit error of every network.**"

math: true

bibtex: |
  @misc{song2026nibbleflow,
    title  = {NibbleFlow: Sign-Exponent-Mantissa Refinement for 4-Bit Optical Flow},
    author = {Song, Xiao'ao and Singh, Chahat Deep},
    year   = {2026},
    url    = {https://www.praisecu.com/research/NibbleFlow}
  }
---

<div class="stat-strip">
  <div class="stat-card"><span class="stat-value"><small>up to </small>86%</span><span class="stat-label">of the error that 4-bit weights add, removed by SEM</span></div>
  <div class="stat-card"><span class="stat-value">0.51<small>M</small></span><span class="stat-label">parameters, with 86% of the weights in 4 bits</span></div>
  <div class="stat-card"><span class="stat-value"><small>up to </small>45%</span><span class="stat-label">lower Sintel error than the best deployable baseline</span></div>
  <div class="stat-card"><span class="stat-value">&lt;1<small> px</small></span><span class="stat-label">of EPE lost to the FP32 version on Sintel</span></div>
</div>

## Abstract

Accurate optical flow relies on iterative refinement, yet the edge accelerators that small robots and other devices on batteries carry execute only static integer graphs and often leave just 4 bits per weight. Under this constraint, iterative networks lose much of their accuracy, and the networks designed for these chips are far less accurate to begin with.

We trace this loss to a single layer, the linear output of the update block. Refinement needs steps whose sizes differ by more than a factor of one hundred, but a linear output represents them like a fixed point number. The rounding error of its weights therefore adds the same error to every update, however small, and this error accumulates over the iterations.

We introduce <strong class="sem">SEM</strong>, an output layer that instead predicts each flow update as a floating point number with a <strong class="sem">S</strong>ign, an <strong class="sem">E</strong>xponent and a <strong class="sem">M</strong>antissa. A rounding error then perturbs each update only in proportion to its size, while every output remains bounded and easy to quantize. Replacing only the output layer of existing networks such as RAFT-small and RAPIDFlow preserves their floating point accuracy and removes **up to 86%** of the error that 4-bit weights add. Built around SEM, **NibbleFlow** has only **0.51M parameters** and runs on a Hailo-8 with most of its weights in 4 bits. It loses less than one pixel of EPE to its floating point version and cuts the Sintel error of the best deployable baseline by **up to 45%**, with **5.4× fewer parameters**.

## Motivation

Optical flow underpins visual odometry, tracking and navigation, and its accuracy today comes from iterative refinement. Small robots, however, run on edge AI accelerators such as the Hailo-8, which execute only a static integer graph. These chips keep all weights in their limited on-chip memory, so the weights often have to be quantized to **4 bits**. At 4 bits, iterative flow networks lose much of their accuracy, while the networks designed for these chips are far less accurate to begin with. **Our goal is a refinement method that is robust to 4-bit quantization, so that accurate and efficient iterative flow networks can be deployed on these chips.**

{# Previous text, hidden for now. Remove this comment wrapper to show it again.
Optical flow underpins visual odometry, structure from motion, tracking and navigation, and its accuracy today is driven by iterative refinement, in which an update block repeatedly corrects the current estimate. These methods run in floating point on desktop GPUs, whereas small robots and other battery-powered devices rely on edge AI accelerators such as the Hailo-8 and the Coral Edge TPU, which deliver several TOPS within a few watts.

This efficiency comes at a price, since these accelerators execute only a **static graph with integer weights** and keep all weights in the memory on the chip, which often leaves **only 4 bits per weight**. Under such quantization, iterative flow networks lose much of their accuracy, while the networks that were designed for these chips are far less accurate to begin with. As a result, accurate optical flow has remained out of reach on the very hardware that needs it.
#}

## The problem lives in one layer

Refinement asks one output layer for steps of very different sizes. The first iterations must cover most of the motion, while the last ones only polish it. At the first step of our coarsest level alone, the needed steps span **seven octaves**, from $$2^{-6}$$ to $$2^{1}$$ pixels.

A standard linear output head represents a step the way a **fixed point** number represents a value. Its error is absolute, so this error decides the smallest step the head can take accurately, while the largest value of the last layer decides the largest one. The window of accurate steps therefore has a fixed width.

<figure class="media-figure range-figure">
<div class="range-bars" role="img" aria-label="Measured range of one step. Linear update, 0.013 to 0.66 pixels, a 49 times range. SEM, 0.008 to 1.07 pixels, a 128 times range.">
<div class="rb-name">Linear</div>
<div class="rb-track rb-linear" style="--lo:-6.3;--hi:-0.6"><span class="rb-end rb-end-a">0.013 px</span><div class="rb-bar"><span>49× Range</span></div><span class="rb-end rb-end-b">0.66 px</span></div>
<div class="rb-name rb-name-sem">SEM (Ours)</div>
<div class="rb-track rb-sem" style="--lo:-6.9;--hi:0.1"><span class="rb-end rb-end-a">0.008 px</span><div class="rb-bar"><span>128× Range</span></div><span class="rb-end rb-end-b">1.07 px</span></div>
</div>
<figcaption><strong>Measured dynamic range of one step.</strong> At the first step of the 1/32 level, the linear update saturates below one pixel and covers only 5.6 octaves, a 49× range of step sizes, whereas SEM follows the needed step from 2<sup>−6.9</sup> to 2<sup>0.1</sup> pixels, 7.0 octaves or a 128× range, which matches the span of its exponents.</figcaption>
</figure>

## <span class="sem">SEM</span>: a floating point step

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

{% figure src="static/images/architecture.png", alt="NibbleFlow architecture: features at 1/8, 1/16 and 1/32 are correlated along fixed directions without warping, and one shared SEM update block refines the flow coarse to fine", caption="**(a)** No warp: each level correlates along fixed directions, and the flow is refined coarse to fine from zero. **(b)** One SEM update block, shared across the levels except its first layer." %}

NibbleFlow compiles to **a single static graph** and runs on a Hailo-8 with **0.51M parameters** and **86% of its weights in 4 bits**. It is quantized with the Hailo compiler and its quantization-aware fine-tuning, which uses no Sintel data.

{# Previous caption and text, hidden for now. Remove this comment wrapper to show them again.
{% figure src="static/images/architecture.png", alt="NibbleFlow architecture: features at 1/8, 1/16 and 1/32 are correlated along fixed directions without warping, and one shared SEM update block refines the flow coarse to fine", caption="**(a)** Features at 1/8, 1/16 and 1/32 are correlated along fixed directions, so nothing is warped, and the flow is refined coarse to fine from zero. **(b)** The SEM update block predicts each step as the product of a sign, an exponent and a mantissa." %}

We build a network around SEM that an edge accelerator can run as **a single static graph**. Without a warp, each level correlates the two frames only along a few directions through each pixel, eight directions at 1/32, six at 1/16 and four at 1/8, and all three levels use **a single SEM update block** of width 96. NibbleFlow has **0.51M parameters** and runs on a Hailo-8 with **86% of its weights in 4 bits**. It is quantized with the Hailo compiler and its quantization-aware fine-tuning, which uses no Sintel data.
#}

<div id="compare"></div>

## See the difference

Drag the slider. Both sides are the same network in INT4, with its linear output layer or with SEM, on one Sintel clean pair from Fig. 3 of the paper, with the EPE of the pair.

{% grid items="static/images/panel_input.jpg, static/images/panel_gt.jpg", captions="Input frame (Sintel clean) | Ground truth flow", columns=2 %}

### RAPIDFlow with 4-bit weights

{% compare before="static/images/panel_rapid_linear.jpg", after="static/images/panel_rapid_sem.jpg", before_label="Linear · 3.65 EPE", after_label="SEM · 1.24 EPE" %}

### NibbleFlow with 4-bit weights

{% compare before="static/images/panel_nibble_linear.jpg", after="static/images/panel_nibble_sem.jpg", before_label="Linear · 6.51 EPE", after_label="SEM · 1.41 EPE" %}

{% figure src="static/images/qualitative.jpg", alt="Grid of flow fields from RAPIDFlow, RAFT-small, IRR-PWC and NibbleFlow on Sintel clean, Sintel final and FlyingChairs, each in FP32, linear INT4 and SEM INT4", caption="**The linear output layer and SEM in four iterative flow networks.** Each network is shown in FP32 and in INT4, with its linear output layer or with SEM, and the EPE of the pair is given in each panel. With the linear layer, every network loses much of the flow in INT4, whereas with SEM the flow stays close to FP32." %}

<div id="results"></div>

## Results

### SEM in existing networks

We replace only the output layer of three iterative networks with SEM and train both versions identically on FlyingChairs. In floating point, RAFT-small and RAPIDFlow lose no accuracy; with 4-bit weights, SEM loses far less.

{# Previous text, hidden for now. Remove this comment wrapper to show it again.
RAFT-small iterates a GRU at a single scale, RAPIDFlow refines from coarse to fine with a shared block, and IRR-PWC refines a feature pyramid with shared weights. In each network, we replace the convolution that regresses the update by the SEM head, with the same exponents for all networks and no tuning, and change nothing else. Both versions are trained from scratch on FlyingChairs with the official settings and the same seed. Replacing the output layer costs no accuracy in RAFT-small and RAPIDFlow in floating point. **The picture changes completely once the weights are quantized to 4 bits.**
#}

| Network | FP32 | INT4, linear | INT4, SEM |
|---|:---:|:---:|:---:|
| RAFT-small | 2.84 | 17.83 | **8.79** |
| RAPIDFlow-it12 | 2.57 | 4.85 | **3.27** |
| RAPIDFlow-it1 | 5.32 | 9.73 | **5.84** |
| IRR-PWC | 2.94 | 5.72 | **4.43** |

<p class="table-note">Sintel clean EPE (lower is better). FP32 is the linear version. INT4 is 4-bit weights with 8-bit activations, simulated with the same quantizer for both versions. Only in IRR-PWC are two layers kept in 8 bits in both versions. With one iteration of RAPIDFlow, 4-bit weights add 4.41 EPE to the linear version and only 0.61 to SEM, which removes 86% of the added error.</p>

<div class="key-idea"><strong>Where the error comes from.</strong> In RAPIDFlow, the 4-bit weights of the last convolution, the layer that SEM replaces, account for nearly all of the loss of the linear version. SEM lets this layer use 4-bit weights like every other layer.</div>

{# Previous text, hidden for now. Remove this comment wrapper to show it again.
**Attribution of the quantization error.** Quantizing one part of the network at a time locates this loss in a single layer. In RAPIDFlow, the 4-bit weights of the last convolution alone, which is the layer that SEM replaces, account for **nearly all of the loss of the linear version**. Keeping this one layer in 8 bits also rescues the linear version, which then matches SEM. The value of SEM is that its output layer tolerates 4-bit weights like every other layer, so no layer needs special treatment.
#}

### Comparison with edge optical flow networks

| Network | Params | GMACs | Sintel clean | Sintel final | Chairs | Hailo-8 FPS |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| NanoFlowNet | 0.17M | 0.93 | 14.14 | 14.31 | 10.39 | 120.55 |
| EdgeFlowNet | 2.75M | 19.98 | 8.65 | 9.22 | 5.50 | 76.30 |
| **NibbleFlow (ours)** | **0.51M** | 6.97 | **4.76** | **5.68** | **3.14** | 15.19 |

<p class="table-note">EPE of the INT4 networks quantized for the Hailo-8 (lower is better), on all 1041 Sintel pairs and 640 FlyingChairs validation pairs. In FP32, NibbleFlow reaches 3.88 / 4.76 on Sintel clean / final. No network is trained or calibrated on Sintel.</p>

With 86% of its weights in 4 bits, NibbleFlow loses less than one pixel of EPE and reaches 4.76 and 5.68, which cuts the error of EdgeFlowNet, the best deployable baseline, by **up to 45%**, with **5.4× fewer parameters**. NanoFlowNet is smaller and faster, but its INT4 error is more than twice as high.

### A controlled test of the update alone

| Update | Sintel clean | Sintel final | Clean, last 50 epochs | Final, last 50 epochs | Range (octaves) | Largest step |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Linear | 4.89 | 6.10 | 5.04 ± 0.07 | 6.23 ± 0.07 | 5.6 | 2<sup>−0.6</sup> px |
| **SEM** | **4.85** | **5.84** | **4.95 ± 0.06** | **5.99 ± 0.06** | **7.0** | **2<sup>0.1</sup> px** |

<p class="table-note">The same network, trained on FlyingChairs only with the same seed, changing only the output of the update block. The range and the largest step are measured at the first update of the 1/32 level.</p>

## Downstream: visual odometry

INT4 flow into the same pose estimator, no depth. NibbleFlow has the lowest ATE on **7 of 11** sequences.

{% figure src="static/videos/vo_trajectories.mp4", poster="static/videos/vo_trajectories.jpg", alt="Animation of the estimated visual odometry trajectories of NibbleFlow, EdgeFlowNet and NanoFlowNet being drawn against the ground truth on two UZH-FPV flights and two TartanAir trajectories, next to the input frames", caption="Trajectories drawn frame by frame against the ground truth (black)." %}

{# Static trajectory figure, hidden for now. Remove this comment wrapper to show it again.
{% figure src="static/images/vo_traj.png", alt="Estimated trajectories of NibbleFlow, EdgeFlowNet and NanoFlowNet against the ground truth on two UZH-FPV flights and two TartanAir trajectories", caption="**Visual odometry trajectories from optical flow alone with the INT4 models.** Estimated paths of NibbleFlow (orange), EdgeFlowNet (blue) and NanoFlowNet (purple) against the ground truth (black) for two UZH-FPV flights (a, b) and two TartanAir trajectories (c, d). NibbleFlow has the lowest ATE on all four and keeps the shape of the loops and of the turns, EdgeFlowNet keeps the shape but drifts further from the ground truth path, and the path of NanoFlowNet jitters and leaves it." %}
#}

{# Longer text, hidden for now. Remove this comment wrapper to show it again.
Dense flow on a small robot is rarely the end product, so we test whether the ranking survives a downstream task. The three deployable networks run in INT4 and feed the same pose estimator, the five point algorithm inside RANSAC. No depth is used and the translation scale is taken from the ground truth, so the metrics measure only how well the flow constrains the camera rotation and the direction of travel.
#}

| Mean ATE (m) | NibbleFlow | EdgeFlowNet | NanoFlowNet | Ground truth flow |
|---|:---:|:---:|:---:|:---:|
| TartanAir, 8 synthetic trajectories | **4.95** | 6.70 | 10.64 | 0.26 |
| UZH-FPV, 3 real drone flights | **5.46** | 8.89 | 18.76 | n/a |

<p class="table-note">ATE after SE(3) alignment, mean over the sequences.</p>

{# Longer table note, hidden for now.
<p class="table-note">Absolute trajectory error after SE(3) alignment, unweighted mean over the sequences. NibbleFlow has the lowest ATE on seven of the eleven sequences, EdgeFlowNet on four and NanoFlowNet on none.</p>
#}

## Beyond optical flow

We believe that the same principle applies to **any iterative regressor that must run in fixed point arithmetic**, such as depth or disparity refinement. We will release our code and trained checkpoints upon acceptance.

Contact: [xiaoao.song@colorado.edu](mailto:xiaoao.song@colorado.edu), [chahat.singh@colorado.edu](mailto:chahat.singh@colorado.edu)
