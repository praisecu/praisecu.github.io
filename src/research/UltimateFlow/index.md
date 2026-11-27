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
<p class="uf-hero-caption"><strong>A tunnel in the DSEC test set.</strong> The frame goes dark, then saturates at the exit. The flow stays dense.</p>

<div class="uf-facts">
<div class="uf-fact">
<span class="uf-fact-kicker">Benchmark Rank</span>
<span class="uf-fact-num">1<small>st of 39</small></span>
<span class="uf-fact-viz" aria-hidden="true"><span class="uf-frank"></span></span>
<span class="uf-fact-text">DSEC-Flow benchmark, by endpoint error.</span>
</div>
<div class="uf-fact">
<span class="uf-fact-kicker">Endpoint Error</span>
<span class="uf-fact-num">0.554<small>px</small></span>
<span class="uf-fact-viz" aria-hidden="true">
<span class="uf-fbar" style="--w: 100%"><span>Best Prior</span><span>0.623</span><i></i></span>
<span class="uf-fbar is-ours" style="--w: 88.9%"><span>UltimateFlow</span><span>0.554</span><i></i></span>
</span>
<span class="uf-fact-text">11% below the best published method.</span>
</div>
<div class="uf-fact">
<span class="uf-fact-kicker">Oracle Gap Closed</span>
<span class="uf-fact-num">53<small>%</small></span>
<span class="uf-fact-viz" aria-hidden="true">
<span class="uf-fgap" style="--w: 52.5%"><i></i></span>
<span class="uf-fends"><span>Blend 0.487</span><span>Oracle 0.388</span></span>
</span>
<span class="uf-fact-text">From the best output blend to a per-pixel oracle.</span>
</div>
<div class="uf-fact">
<span class="uf-fact-kicker">90% Fewer Events</span>
<span class="uf-fact-num">+8<small>% error</small></span>
<span class="uf-fact-viz" aria-hidden="true">
<span class="uf-fbar" style="--w: 100%"><span>Events Only</span><span>+66%</span><i></i></span>
<span class="uf-fbar is-ours" style="--w: 12.1%"><span>UltimateFlow</span><span>+8%</span><i></i></span>
</span>
<span class="uf-fact-text">Against +66% for events alone.</span>
</div>
</div>

## Abstract

Event cameras capture fast motion and extreme lighting where frame cameras fail, making event-based optical flow essential for agile robots and autonomous driving. Since events vanish in static and untextured regions, recent methods fuse them with RGB frames. However, current fusion methods are only marginally better than using events alone. In this paper, we introduce **UltimateFlow**, which rethinks how frames should be used for event-based optical flow. Rather than fusing frame features, we utilize a frozen RGB optical flow network, built on a depth foundation model, to provide an initial flow estimate and a per-pixel reliability map. A recurrent event-based estimator, built on an event depth foundation model, then refines this estimate without requiring additional labels. UltimateFlow achieves state-of-the-art results on the DSEC optical flow benchmark, ranking first of 39 entries with an endpoint error (EPE) of 0.554.

<div id="explore"></div>

## See It Move

Drag the slider. The right side is always UltimateFlow (E+I).

<div class="uf-explorer" id="uf-explorer"></div>

<p class="uf-note">Labels give the EPE on the whole test sequence, from the benchmark server. The public baseline checkpoints were trained on the validation sequence. UltimateFlow (E+I) is the 5-model ensemble.</p>

## Guide the Estimator, Do Not Blend Its Output

A frozen frame-based flow model, the <span class="uf-frame"><strong>guide</strong></span>, sees the texture that events miss. There are two ways to use it.

<div class="uf-duo">
<div class="uf-duo-card">
<span class="uf-kicker">The Straightforward Way</span>
<h4>Blend at the Output</h4>
<span class="uf-duo-eq">$$f^{\star}=G\,\big[w\,f^{\mathrm{T}}+(1-w)\,\hat f\,\big]+(1-G)\,\hat f$$</span>
<p>One weight $$w$$ serves every pixel inside the gate $$G$$. The estimator never sees the guide.</p>
<div class="uf-duo-score"><b>0.670</b> test EPE with every component tuned</div>
</div>
<div class="uf-duo-card is-ours">
<span class="uf-kicker">UltimateFlow</span>
<h4>Guide at the Input</h4>
<span class="uf-duo-eq">$$f^{0}=G\,f^{\mathrm{T}}+(1-G)\,f^{\text{init}},\quad \mathbf{g}=\big[f^{\mathrm{T}},\,G,\,r\big]$$</span>
<p>Guide flow, gate and residual $$r$$ are inputs, and the refinement starts from the guide. The estimator decides per pixel.</p>
<div class="uf-duo-score"><b>0.636</b> test EPE in a single pass</div>
</div>
</div>

<div class="key-idea"><strong>The takeaway.</strong> Give the frozen model to the estimator as an input and a starting point, not as a second opinion blended at its output.</div>

## Method

{% figure src="static/images/architecture.webp", alt="Architecture of UltimateFlow. Frame branch: the frozen FlowSeek-T estimates the guide flow, a forward-backward consistency check gives the residual and the gate, and a rotation-only warp brings them into the event view. Event branch: encoders, correlation with Depth AnyEvent features, motion bases from depth, a guidance encoder added to the context, an initial flow from the guide, and iterative ConvNeXt updates.", caption="**Architecture.** A frozen frame-based guide gives a flow, a gate and a residual. They enter the event-based estimator as inputs and as its starting point." %}

**Guide.** A frozen FlowSeek-T estimates the frame flow in both directions. Its round-trip residual gates out the pixels above 1.5 px, with no ground truth and no events.

$$
r(\mathbf{u})=\big\|f^{\mathrm{F}\rightarrow}(\mathbf{u})+f^{\mathrm{F}\leftarrow}\big(\mathbf{u}+f^{\mathrm{F}\rightarrow}(\mathbf{u})\big)\big\|,\qquad G=\mathbb{1}[\,r<\tau\,]
$$

**Estimator.** A recurrent event-based estimator, with frozen Depth AnyEvent features in its correlation and motion bases from the predicted depth.

**Dense guidance.** Guide flow, gate and residual join the context, and the refinement starts from the guide wherever the gate accepts it.

**No new labels.** The guide is never a training target. The gate accepts it on 66% of a frame, where LiDAR ground truth covers 18%.

<div id="results"></div>

## Results

### DSEC-Flow Benchmark

First of 39 entries by EPE on the test server (November 9, 2026). The single model, at 0.583, leads every published method on all metrics except AE.

<figure class="media-figure">
<div class="uf-chart" id="uf-leaderboard"></div>
<figcaption><strong>DSEC-Flow test server.</strong> EPE against 3PE of the published event-based methods. Circles use events, triangles use events and frames. †Pretrained on synthetic event data.</figcaption>
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

<p class="table-note">Lower is better. 1PE to 3PE in percent, AE in degrees. Both UltimateFlow rows include the test-time steps shown below.</p>

### From 0.759 to 0.554

Each step is one evaluation on the test server. Output-level fusion stops at 0.670. Dense guidance alone reaches 0.636.

<figure class="media-figure">
<div class="uf-chart" id="uf-stack"></div>
<figcaption><strong>Ablation on the DSEC test set.</strong> Select a step to see what it adds.</figcaption>
</figure>

### Why Guidance Beats a Blend

Dense guidance closes 53% of the gap between the best output blend and a per-pixel oracle, with no parameter fitted at inference.

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
<figcaption><strong>Held-out validation EPE</strong> (1,448 frames, single pass). The oracle uses the ground truth.</figcaption>
</figure>

### Which Guidance Inputs Matter

One guidance input removed at a time. The guide flow closes most of the gap, and starting from the guide closes the rest.

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
<figcaption><strong>Validation EPE</strong> of matched 40k-step runs, which differ from the deployed models. Init: the refinement starts from the guide.</figcaption>
</figure>

<div id="robust"></div>

## Robustness to Sensor Degradation

Pick a degradation. The tiles show one validation frame, and the bars the whole validation set.

<div class="uf-robust" id="uf-robust"></div>

<p class="uf-note">BFlow (E+I) was trained on this sequence. With 95% of the events removed it is ahead on this frame, but not on average. Dark frames are brightened for display.</p>

## Beyond DSEC

### Fine-Tuned Evaluation on MVSEC

Fine-tuned on MVSEC, UltimateFlow has the lowest EPE of these methods on the three indoor sequences, and trails by 0.04 px outdoors.

| Method | indoor_flying1 | indoor_flying2 | indoor_flying3 | outdoor_day1 |
|---|:---:|:---:|:---:|:---:|
| EV-FlowNet | 1.03 | 1.72 | 1.53 | 0.49 |
| E-RAFT | 1.10 | 1.94 | 1.66 | 0.24 |
| TMA | 1.06 | 1.81 | 1.58 | 0.25 |
| EDCFlow | 0.97 | 1.49 | 1.38 | **0.23** |
| **UltimateFlow (E+I)** | **0.84** | **1.47** | **1.27** | 0.27 |

<p class="table-note">EPE in px, standard protocol, baselines as published. Self-supervised, model-based and event-plus-frame methods outside this table report lower indoor EPE.</p>

### Camera Motion from Flow

{% figure src="static/images/trajectories.webp", alt="Three top-view trajectories on MVSEC outdoor_day1 for the ground truth, UltimateFlow, E-RAFT and Spike-FlowNet, with the absolute trajectory error of each method", caption="**Trajectories from flow** on MVSEC outdoor_day1, three 40 s windows. ATE in each method's color, best in bold." %}

Poses chained from an essential matrix fitted to each flow. UltimateFlow has the lowest translation drift (20.5%, against 27.9% for E-RAFT and 31.2% for Spike-FlowNet). Indoors it trails Spike-FlowNet on the translation direction.

<div id="video"></div>

## Video

{% figure src="static/videos/results.mp4", poster="static/images/results_poster.jpg", controls=true, autoplay=false %}

## Limitations

Without its guide, or when frame noise collapses the gate, the model falls below the event-only one. The guide reads the frame at the end of the interval and dominates the runtime, so the method is neither causal nor low latency.

Code and checkpoints will be released.

## Acknowledgments

This work was supported by a Google Cloud Research Credits award from Google.

Contact: [chahat.singh@colorado.edu](mailto:chahat.singh@colorado.edu)
