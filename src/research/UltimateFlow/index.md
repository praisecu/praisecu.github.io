---
title: "UltimateFlow: Frame-Guided Event Optical Flow with Depth Foundation Priors"
title_html: '<span class="uf-accent">UltimateFlow</span>: Frame-Guided Event Optical Flow with Depth Foundation Priors'
description: "UltimateFlow gives a frozen RGB optical flow network to an event-based estimator as a dense input and a starting point, instead of blending the two at the output. It ranks first on the DSEC-Flow benchmark with an endpoint error of 0.554."
image: static/images/social.jpg
keywords: [event camera, optical flow, event-based vision, depth foundation models, sensor fusion, DSEC, MVSEC, UltimateFlow]

citation_date: "2026/11"

authors:
  - name: Chahat Deep Singh
    url: https://chahatdeep.github.io/
affiliations:
  - Perception, Robotics, AI and Sensing (PRAISe) Lab, University of Colorado Boulder

links:
  - text: Video
    url: "#video"
    icon: fas fa-circle-play
  - text: Explore
    url: "#explore"
    icon: fas fa-sliders
  - text: Results
    url: "#results"
    icon: fas fa-chart-line
  - text: BibTeX
    url: "#BibTeX"
    icon: fas fa-quote-right

math: true
extra_css: [static/uflow.css]
extra_js: [static/uflow.js]

bibtex: |
  @misc{singh2026ultimateflow,
    title  = {UltimateFlow: Frame-Guided Event Optical Flow with Depth Foundation Priors},
    author = {Singh, Chahat Deep},
    year   = {2026},
    url    = {https://www.praisecu.com/research/UltimateFlow.html}
  }
---

<div class="uf-hero" id="uf-hero">
<div class="uf-hero-inputs">
<div class="uf-tile"><canvas data-tile="frame" role="img" aria-label="RGB frames of a drive through a tunnel. The frame is dark inside the tunnel and saturated at its exit."></canvas><span class="uf-tag">RGB Frame</span></div>
<div class="uf-tile"><canvas data-tile="events" role="img" aria-label="Events of the same drive, positive in red and negative in blue"></canvas><span class="uf-tag">Events</span></div>
</div>
<div class="uf-tile uf-hero-out"><canvas data-tile="ours" data-cover="true" role="img" aria-label="Dense optical flow estimated by UltimateFlow for the same drive"></canvas><span class="uf-tag is-ours">UltimateFlow (E+I)</span></div>
</div>
<p class="uf-hero-caption"><strong>UltimateFlow on a DSEC test sequence.</strong> Inside the tunnel the frame is dark, and at the exit it saturates. The events keep firing, and UltimateFlow estimates dense flow throughout, from the events (E) and the RGB frames (I).</p>

<div class="stat-strip">
  <div class="stat-card"><span class="stat-value">1<small>st of 39</small></span><span class="stat-label">on the DSEC-Flow optical flow benchmark, by endpoint error</span></div>
  <div class="stat-card"><span class="stat-value">0.554<small> px</small></span><span class="stat-label">endpoint error, 11% below the best previously published method</span></div>
  <div class="stat-card"><span class="stat-value">53<small>%</small></span><span class="stat-label">of the gap between the best output blend and a per-pixel oracle, closed</span></div>
  <div class="stat-card"><span class="stat-value">+8<small>%</small></span><span class="stat-label">error with 90% of the events removed, against +66% for events alone</span></div>
</div>

## Abstract

Event cameras capture fast motion and extreme lighting where frame cameras fail, making event-based optical flow essential for agile robots and autonomous driving. Since events vanish in static and untextured regions, recent methods fuse them with RGB frames. However, current fusion methods are only marginally better than using events alone. In this paper, we introduce **UltimateFlow**, which rethinks how frames should be used for event-based optical flow. Rather than fusing frame features, we utilize a frozen RGB optical flow network, built on a depth foundation model, to provide an initial flow estimate and a per-pixel reliability map. A recurrent event-based estimator, built on an event depth foundation model, then refines this estimate without requiring additional labels. UltimateFlow achieves state-of-the-art results on the DSEC optical flow benchmark, ranking first of 39 entries with an endpoint error (EPE) of 0.554.

<div id="explore"></div>

## See It Move

Drag the slider. The right side is always UltimateFlow (E+I). The left side can show the inputs, another method, or our event-only model. All flow fields of a clip share one color scale.

<div class="uf-explorer" id="uf-explorer"></div>

<p class="uf-note">Clips from interlaken_00_b (Mountain Road, Tunnel) and zurich_city_12_a of the DSEC test set, and from the held-out validation sequence zurich_city_11_c. The labels give each method's EPE on the whole test sequence from the benchmark server, since the test ground truth is hidden. Baselines run from their public checkpoints, which were trained on the validation sequence. UltimateFlow (E+I) is the 5-model ensemble.</p>

## Guide the Estimator, Do Not Blend Its Output

Most platforms mount a frame camera beside the event sensor, and frames record exactly the texture that events miss. Frame-based flow, trained on far larger datasets, has improved markedly by building on depth foundation models. We call such a frozen frame-based model the <span class="uf-frame"><strong>guide</strong></span>. How should an event-based estimator use it?

<div class="uf-duo">
<div class="uf-duo-card">
<span class="uf-kicker">The Straightforward Way</span>
<h4>Blend at the Output</h4>
<span class="uf-duo-eq">$$f^{\star}=G\,\big[w\,f^{\mathrm{T}}+(1-w)\,\hat f\,\big]+(1-G)\,\hat f$$</span>
<p>Wherever the guide flow $$f^{\mathrm{T}}$$ passes its consistency gate $$G$$, mix it with the event-based estimate $$\hat f$$. One weight $$w$$ serves every pixel, and the estimator never sees the guide.</p>
<div class="uf-duo-score"><b>0.670</b> test EPE with every component tuned</div>
</div>
<div class="uf-duo-card is-ours">
<span class="uf-kicker">UltimateFlow</span>
<h4>Guide at the Input</h4>
<span class="uf-duo-eq">$$f^{0}=G\,f^{\mathrm{T}}+(1-G)\,f^{\text{init}},\quad \mathbf{g}=\big[f^{\mathrm{T}},\,G,\,r\big]$$</span>
<p>The guide flow, its gate and its forward-backward residual $$r$$ enter the estimator as dense inputs $$\mathbf{g}$$, and the refinement starts from the guide wherever the gate accepts it. The estimator decides, per pixel, how much to trust the guide.</p>
<div class="uf-duo-score"><b>0.636</b> test EPE in a single pass</div>
</div>
</div>

Dense guidance replaces the blend rather than supplementing it. Applied on top of the guided model, the blend makes it worse (0.636 to 0.662).

<div class="key-idea"><strong>The takeaway.</strong> A frozen model of another sensor is most useful as an input and a starting point for the estimator, not as a second opinion blended at its output.</div>

## Method

{% figure src="static/images/architecture.webp", alt="Architecture of UltimateFlow. Frame branch: the frozen FlowSeek-T estimates the guide flow, a forward-backward consistency check gives the residual and the gate, and a rotation-only warp brings them into the event view. Event branch: encoders, correlation with Depth AnyEvent features, motion bases from depth, a guidance encoder added to the context, an initial flow from the guide, and iterative ConvNeXt updates.", caption="**Architecture.** Frame branch: the frozen FlowSeek-T estimates the guide flow between the two frames in both directions, a forward-backward consistency check gives the residual and the gate, and a rotation-only warp brings all three into the event view. Event branch: a trained head feeds the Depth AnyEvent features into the correlation, and the predicted depth gives the motion bases. The dense guidance enters the context and sets the initial flow wherever the gate accepts it, and iterative ConvNeXt updates refine the flow." %}

**A guide that certifies itself.** A frozen FlowSeek-T, built on Depth Anything v2 and never trained on DSEC, estimates the flow between the two RGB frames in both directions. Where the frame flow is correct, following it forward and back returns to the start. The round-trip residual flags guide failures and occlusions, and the gate keeps the pixels below 1.5 px:

$$
r(\mathbf{u})=\big\|f^{\mathrm{F}\rightarrow}(\mathbf{u})+f^{\mathrm{F}\leftarrow}\big(\mathbf{u}+f^{\mathrm{F}\rightarrow}(\mathbf{u})\big)\big\|,\qquad G=\mathbb{1}[\,r<\tau\,]
$$

This check uses neither ground truth nor events, so it is available in training and at test time.

**An event estimator with a depth foundation prior.** The event branch builds on recurrent all-pairs correlation. Features of the frozen Depth AnyEvent model enter the correlation volume, and its predicted depth defines eight motion bases. To our knowledge, this is the first event-based flow estimator conditioned on a frozen event depth foundation model, and it is compact enough to train on a single GPU.

**Dense guidance.** On the 1/8 grid of the estimator, the guide flow, the gate and the residual are stacked and added to the context by a small guidance encoder, so every update step sees them. The recurrent refinement then starts from the guide wherever the gate accepts it:

$$
\mathbf{g}=\big[\tfrac{1}{8}\mathcal{P}(f^{\mathrm{T}}),\;\mathcal{P}(G),\;\tanh\!\big(\tfrac{1}{3}\mathcal{P}(r)\big)\big],\qquad
f^{0}=\mathcal{P}(G)\cdot\tfrac{1}{8}\mathcal{P}(f^{\mathrm{T}})+\big(1-\mathcal{P}(G)\big)\cdot f^{\text{init}}
$$

Here $$\mathcal{P}$$ is 8×8 average pooling and $$f^{\text{init}}$$ is the estimator's own first guess.

**No new labels, and no imitation.** The guide is never a training target. LiDAR ground truth covers 18% of a training frame on average, whereas the gate accepts the guide on 66%, so the estimator sees a dense, self-certified estimate on most unsupervised pixels.

<div id="results"></div>

## Results

### DSEC-Flow Benchmark

UltimateFlow ranks first of 39 entries by EPE on the DSEC-Flow test server (November 9, 2026), with 0.554 EPE, 6.01% 1PE, 1.94% 2PE, 1.11% 3PE and 2.08° AE. Even without model averaging, the single model scores 0.583 and leads every published method on all metrics except AE. Hover over a point for its numbers.

<figure class="media-figure">
<div class="uf-chart" id="uf-leaderboard"></div>
<figcaption><strong>DSEC-Flow test server</strong> (416 frames in 7 sequences, hidden ground truth). EPE against 3PE for the published event-based methods. Circles use events, triangles use events and RGB frames. †Pretrained on synthetic event data. Lower left is better.</figcaption>
</figure>

| Method | Input | EPE | 1PE | 2PE | 3PE | AE |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| E-RAFT | E | 0.788 | 12.74 | 4.74 | 2.68 | 2.85 |
| BFlow | E+I | 0.69 | 9.70 | 3.42 | 1.88 | 2.42 |
| EMatch | E | 0.640 | 7.86 | 2.83 | 1.69 | 2.46 |
| STFlow† | E+I | 0.630 | 7.93 | 2.61 | 1.45 | 2.29 |
| EDCPT† | E+I | 0.625 | 6.87 | 2.35 | 1.52 | 2.17 |
| E-WAVE† | E+I | 0.623 | 7.26 | 2.54 | 1.56 | 2.24 |
| **UltimateFlow† (E+I), single model** | E+I | 0.583 | 6.31 | 2.06 | 1.18 | 2.21 |
| **UltimateFlow† (E+I), 5-model ensemble** | E+I | **0.554** | **6.01** | **1.94** | **1.11** | **2.08** |

<p class="table-note">A selection of the methods in the chart, sorted by EPE (lower is better). 1PE to 3PE in percent, AE in degrees. Both UltimateFlow rows use the test-time steps of the paper, with the guide and depth models frozen and pretrained on other data.</p>

### From 0.759 to 0.554

Every step below is a separate evaluation on the test server. The left block builds the strongest output-level fusion we could find. The right block replaces it with dense guidance, which alone gains more (0.759 to 0.636) than the whole left block (0.759 to 0.670).

<figure class="media-figure">
<div class="uf-chart" id="uf-stack"></div>
<figcaption><strong>Ablation on the DSEC test set</strong>, from UltimateFlow (E) to the 5-model ensemble. Each step adds one change. Select a step to see what it adds.</figcaption>
</figure>

### Why Guidance Beats a Blend

On the held-out validation split, the best output rule stays far from a per-pixel oracle that picks the better source at every pixel, because one weight serves every pixel and the rejected pixels fall back to the event estimate. Dense guidance, with no parameter fitted at inference, closes 53% of this gap.

<figure class="media-figure">
<div class="uf-panel uf-gap" role="img" aria-label="Validation EPE. Event-only model 0.546, best output blend 0.487, dense guidance 0.435, per-pixel oracle 0.388.">
<div class="uf-gap-track">
<div class="uf-gap-fill" style="--a:37.3%;--b:70.3%"></div>
<div class="uf-gap-mark is-up" style="--x:0%"><span><b>0.546</b>Events Only</span></div>
<div class="uf-gap-mark is-down" style="--x:37.3%"><span><b>0.487</b>Best Output Blend</span></div>
<div class="uf-gap-mark is-ours is-up" style="--x:70.3%"><span><b>0.435</b>Dense Guidance</span></div>
<div class="uf-gap-mark is-oracle is-down" style="--x:100%"><span><b>0.388</b>Per-Pixel Oracle</span></div>
</div>
</div>
<figcaption><strong>Output-level fusion against dense guidance</strong> on held-out validation (1,448 frames, single pass). The oracle uses the ground truth. The frames alone do not explain the result: RAFT, FlowSeek-T and MEMFOF, run on frames only with the same registration, score 0.527 to 0.538 on this split, close to the event-only model.</figcaption>
</figure>

### Which Guidance Inputs Matter

We remove the guidance inputs one at a time, feeding zeros instead, on a matched schedule. The guide flow alone closes most of the gap to the full model, and starting the refinement from the guide accounts for the rest.

<figure class="media-figure">
<div class="uf-abl" role="table" aria-label="Guidance-input ablation, validation EPE">
<div class="uf-abl-row uf-abl-head" role="row"><div>Variant</div><div class="uf-abl-in"><span>Flow</span><span>Gate</span><span>Resid.</span><span>Init</span></div><div>Validation EPE (px)</div></div>
<div class="uf-abl-row" role="row"><div class="uf-abl-name">None (Events Only)</div><div class="uf-abl-in"><span>Flow</span><span>Gate</span><span>Resid.</span><span>Init</span></div><div class="uf-abl-bar" style="--w:91.8%"><i></i><b>0.569</b></div></div>
<div class="uf-abl-row" role="row"><div class="uf-abl-name">Guide Flow Only</div><div class="uf-abl-in"><span class="on">Flow</span><span>Gate</span><span>Resid.</span><span>Init</span></div><div class="uf-abl-bar" style="--w:75.5%"><i></i><b>0.468</b></div></div>
<div class="uf-abl-row" role="row"><div class="uf-abl-name">Full, No Guide Init</div><div class="uf-abl-in"><span class="on">Flow</span><span class="on">Gate</span><span class="on">Resid.</span><span>Init</span></div><div class="uf-abl-bar" style="--w:75.3%"><i></i><b>0.467</b></div></div>
<div class="uf-abl-row is-init" role="row"><div class="uf-abl-name">Residual, No Gate</div><div class="uf-abl-in"><span class="on">Flow</span><span>Gate</span><span class="on">Resid.</span><span class="on is-init">Init</span></div><div class="uf-abl-bar" style="--w:70.5%"><i></i><b>0.437</b></div></div>
<div class="uf-abl-row is-init" role="row"><div class="uf-abl-name">Gate, No Residual</div><div class="uf-abl-in"><span class="on">Flow</span><span class="on">Gate</span><span>Resid.</span><span class="on is-init">Init</span></div><div class="uf-abl-bar" style="--w:70.0%"><i></i><b>0.434</b></div></div>
<div class="uf-abl-row is-init is-full" role="row"><div class="uf-abl-name">Full</div><div class="uf-abl-in"><span class="on">Flow</span><span class="on">Gate</span><span class="on">Resid.</span><span class="on is-init">Init</span></div><div class="uf-abl-bar" style="--w:70.0%"><i></i><b>0.434</b></div></div>
</div>
<figcaption><strong>Guidance-input ablation</strong> on held-out validation (every fourth frame), best EPE of matched 40k-step runs. Flow, Gate, Resid.: warped guide flow, gate and residual as context inputs. Init: the flow starts from the guide where the gate accepts. These are separate runs, so absolute values differ from the deployed models.</figcaption>
</figure>

The start matters because the refinement is local. The trained event-only estimator removes a wrong start of up to 16 px within six updates, but not larger ones. On 300 ms windows of the held-out sequences, the guided model reaches 0.842 px against 1.174 for the event-only model, and switching off its initialization at inference raises it to 2.254.

<div id="robust"></div>

## Robustness to Sensor Degradation

What happens when one sensor fails? Pick a degradation. The tiles show one validation frame, and the bars show the EPE over the validation set.

<div class="uf-robust" id="uf-robust"></div>

<p class="uf-note">One validation frame of zurich_city_11_c, single pass, against BFlow (E+I), which was trained on this sequence. Events are removed uniformly at random, and darkened frames are rescaled for display. With 95% of the events removed, BFlow is ahead on this frame, whereas UltimateFlow is ahead on average. Bars: every fourth validation frame, with the change from each method's own reference.</p>

Removing 90% of the events raises the EPE of the guided model by 8% and of the event-only model by 66%, and a tenfold darker frame raises it by 6%. The failure mode is frame noise that collapses the gate.

## Beyond DSEC

### Fine-Tuned Evaluation on MVSEC

MVSEC records frames and events on one pixel array, and its indoor sequences are hexacopter flights, far from the driving domain of DSEC. Under the standard protocol, UltimateFlow has the lowest EPE of the methods below on all three indoor sequences, and it trails the best EPE by 0.04 px on the outdoor sequence.

| Method | indoor_flying1 | indoor_flying2 | indoor_flying3 | outdoor_day1 |
|---|:---:|:---:|:---:|:---:|
| EV-FlowNet | 1.03 | 1.72 | 1.53 | 0.49 |
| E-RAFT | 1.10 | 1.94 | 1.66 | 0.24 |
| TMA | 1.06 | 1.81 | 1.58 | 0.25 |
| EDCFlow | 0.97 | 1.49 | 1.38 | **0.23** |
| **UltimateFlow (E+I)** | **0.84** | **1.47** | **1.27** | 0.27 |

<p class="table-note">EPE over one frame interval on pixels with ground truth and events (lower is better). Training on outdoor_day2, testing on the rest. Baselines as published. Self-supervised, model-based and event-plus-frame methods outside this table report lower indoor EPE.</p>

### Camera Motion from Flow

{% figure src="static/images/trajectories.webp", alt="Three top-view trajectories on MVSEC outdoor_day1 for the ground truth, UltimateFlow, E-RAFT and Spike-FlowNet, with the absolute trajectory error of each method", caption="**Trajectories from flow** on MVSEC outdoor_day1: the three non-overlapping 40 s windows with the largest heading change, each aligned by one similarity transform. ATE of each method in its color, best in bold." %}

To test flow on a downstream task, we fit an essential matrix to each method's flow on every consecutive-frame interval of MVSEC outdoor_day1 and chain the resulting poses. Under the KITTI protocol, UltimateFlow has the lowest translation drift (20.5% against 27.9% for E-RAFT and 31.2% for Spike-FlowNet), and the lowest absolute trajectory error in 66% of all 20 s windows. Indoors, however, UltimateFlow trails Spike-FlowNet on the translation direction.

<div id="video"></div>

## Video

{% figure src="static/videos/results.mp4", poster="static/images/results_poster.jpg", controls=true, autoplay=false %}

## Limitations

The guided model depends on its guide. Without it, or when frame noise collapses the gate, it falls below the event-only model. The guide reads the frame at the end of the interval and dominates the runtime, so the method is neither causal nor low latency, and it needs calibrated extrinsics. A causal guide that reads only past frames, and a lighter one, are the natural next steps.

As frame-based foundation models keep improving, event cameras can now inherit that progress without new labels, and see in the fast and dark scenes where frames alone fail. Code and checkpoints will be released.

## Acknowledgments

This work was supported by a Google Cloud Research Credits award from Google.

Contact: [chahat.singh@colorado.edu](mailto:chahat.singh@colorado.edu)
