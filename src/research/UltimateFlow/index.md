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
affiliations_html: '<a href="/"><b>P</b>erception, <b>R</b>obotics, <b>AI</b> and <b>S</b>ensing (<b>PRAISe</b>) Lab</a><br><a href="https://www.colorado.edu/" target="_blank" rel="noopener">University of Colorado Boulder</a>'

links:
  - text: arXiv (Coming Soon)
    url: "#coming-soon"
    icon: ai ai-arxiv
  - text: Results
    url: "#results"
    icon: fas fa-chart-line
  - text: Code (Coming Soon)
    url: "#coming-soon"
    icon: fab fa-github
  - text: Video
    url: "#video"
    icon: fab fa-youtube
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
<span class="uf-fact-num">1<small>out of 39</small></span>
<span class="uf-fact-viz" aria-hidden="true"><span class="uf-frank"></span></span>
<span class="uf-fact-text">DSEC-Flow benchmark, by endpoint error, as of Nov 10, 2026.</span>
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
<span class="uf-fact-kicker">Visual Odometry</span>
<span class="uf-fact-num">20.5<small>% drift</small></span>
<span class="uf-fact-viz" aria-hidden="true">
<span class="uf-fbar" style="--w: 100%"><span>E-RAFT</span><span>27.9%</span><i></i></span>
<span class="uf-fbar is-ours" style="--w: 73.5%"><span>UltimateFlow</span><span>20.5%</span><i></i></span>
</span>
<span class="uf-fact-text">Translation drift on MVSEC outdoor_day1, against 31.2% for Spike-FlowNet.</span>
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

## Qualitative Comparison

<p class="uf-lead">Drag the slider. The right side is always UltimateFlow (E+I).</p>

<div class="uf-explorer" id="uf-explorer"></div>

<p class="uf-note">Labels give the EPE on the whole test sequence, from the benchmark server. The public baseline checkpoints were trained on the validation sequence. UltimateFlow (E+I) is the 5-model ensemble.</p>

## Dense Guidance Versus Output Fusion

A frozen frame-based flow model, the <span class="uf-frame"><strong>guide</strong></span>, sees the texture that events miss. There are two ways to use it.

<div class="uf-duo">
<div class="uf-duo-card">
<span class="uf-kicker">Baseline</span>
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

<div class="key-idea"><strong>Key insight.</strong> Give the frozen model to the estimator as an input and a starting point, not as a second opinion blended at its output.</div>

## Method

<figure class="media-figure">
<div class="uf-scroll">
<div class="uf-arch" role="img" aria-label="Architecture. Frame branch: two RGB frames go into a frozen, off-the-shelf RGB optical flow model (FlowSeek-T), which gives a guide flow, a gate of trusted pixels and a round-trip residual. Event branch: events go into encoders with a frozen event depth model (Depth AnyEvent), then into trained recurrent refinement, which outputs the optical flow. The guide outputs enter the refinement as inputs and as its starting flow.">
<div class="uf-arch-tile" style="grid-area: 1 / 1"><img src="UltimateFlow/static/images/arch/frames.webp" alt="" loading="lazy"><span><i class="fas fa-camera" aria-hidden="true"></i> RGB Frames</span></div>
<div class="uf-arch-arrow" style="grid-area: 1 / 2"></div>
<div class="uf-arch-box is-frame" style="grid-area: 1 / 3"><span class="uf-arch-kicker"><i class="fas fa-snowflake" aria-hidden="true"></i> Frozen Depth and Flow Prior</span><b>Frame Guide</b><small>An RGB optical flow model (FlowSeek-T), checked forward and backward</small></div>
<div class="uf-arch-arrow" style="grid-area: 1 / 4"></div>
<div class="uf-arch-guide" style="grid-area: 1 / 5">
<div class="uf-arch-tile is-small"><img src="UltimateFlow/static/images/arch/guide.webp" alt="" loading="lazy"><span>Guide Flow</span><em>its motion estimate</em></div>
<div class="uf-arch-tile is-small"><img src="UltimateFlow/static/images/arch/gate.webp" alt="" loading="lazy"><span>Gate</span><em>pixels it trusts</em></div>
<div class="uf-arch-tile is-small"><img src="UltimateFlow/static/images/arch/residual.webp" alt="" loading="lazy"><span>Residual</span><em>round-trip error</em></div>
</div>
<div class="uf-arch-down" style="grid-area: 2 / 5"><span>Inputs and starting flow</span></div>
<div class="uf-arch-tile" style="grid-area: 3 / 1"><img src="UltimateFlow/static/images/arch/events.webp" alt="" loading="lazy"><span><i class="fas fa-bolt" aria-hidden="true"></i> Events</span></div>
<div class="uf-arch-arrow" style="grid-area: 3 / 2"></div>
<div class="uf-arch-box is-event" style="grid-area: 3 / 3"><span class="uf-arch-kicker"><i class="fas fa-snowflake" aria-hidden="true"></i> Frozen Depth Prior</span><b>Event Features</b><small>Encoders with an event depth model (Depth AnyEvent)</small></div>
<div class="uf-arch-arrow" style="grid-area: 3 / 4"></div>
<div class="uf-arch-box is-ours" style="grid-area: 3 / 5"><span class="uf-arch-kicker"><i class="fas fa-graduation-cap" aria-hidden="true"></i> Trained</span><b>Recurrent Refinement</b><small>Refines the flow step by step, deciding per pixel how much to trust the guide</small></div>
<div class="uf-arch-arrow" style="grid-area: 3 / 6"></div>
<div class="uf-arch-tile is-out" style="grid-area: 3 / 7"><img src="UltimateFlow/static/images/arch/ours.webp" alt="" loading="lazy"><span><i class="fas fa-wind" aria-hidden="true"></i> UltimateFlow (E+I)</span></div>
</div>
<figcaption><strong>Architecture.</strong> The frozen guide's flow, gate and residual enter the event-based estimator as inputs and as its starting point.</figcaption>
</figure>

<div id="results"></div>

## DSEC-Flow Benchmark

1 out of 39 entries by EPE on the DSEC-Flow test server, as of Nov 10, 2026.

<figure class="media-figure">
<div class="uf-chart" id="uf-leaderboard"></div>
<figcaption><strong>DSEC-Flow test server.</strong> EPE against 3PE of the published event-based methods. Circles use events, triangles use events and frames. †Pretrained on synthetic event data.</figcaption>
</figure>

### Test-Set Ablation

Each step is one evaluation on the test server. Output-level fusion stops at 0.670. Dense guidance alone reaches 0.636.

<figure class="media-figure">
<div class="uf-chart" id="uf-stack"></div>
<figcaption><strong>Ablation on the DSEC test set.</strong> Select a step to see what it adds.</figcaption>
</figure>

### Guidance-Input Ablation

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

## Generalization Beyond DSEC

### MVSEC Benchmark

Fine-tuned on MVSEC, UltimateFlow has a lower EPE than EV-FlowNet, E-RAFT, TMA and EDCFlow on all three indoor sequences, and trails EDCFlow by 0.04 px outdoors.

### Visual Odometry

{% figure src="static/videos/vo_trajectories.mp4", poster="static/videos/vo_trajectories.jpg", alt="Animation of the visual odometry trajectories of UltimateFlow, E-RAFT and Spike-FlowNet drawn against the ground truth on three 40 s windows of MVSEC outdoor_day1, with the camera frame of each moment", caption="**Trajectories from flow** on MVSEC outdoor_day1, drawn as the drive progresses, against the ground truth (dashed). ATE per method, best in bold." %}

Poses chained from an essential matrix fitted to each flow. UltimateFlow has the lowest translation drift (20.5%, against 27.9% for E-RAFT and 31.2% for Spike-FlowNet). Indoors it trails Spike-FlowNet on the translation direction.

<div id="video"></div>

## DSEC-Flow Results

{% figure src="static/videos/results.mp4", poster="static/images/results_poster.jpg", controls=true, autoplay=false %}

## Acknowledgments

<div class="uf-sponsor">
<img src="/img/logo/gcp.png" alt="Google Cloud" width="56" height="56" loading="lazy">
<p>This work was supported by a <strong>Google Cloud Research Credits</strong> award from Google.</p>
</div>

<p class="uf-lead">Contact: <a href="mailto:chahat.singh@colorado.edu">chahat.singh@colorado.edu</a></p>
