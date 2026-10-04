---
title: "Fold-to-Fit: Propeller Interaction and Control of a Coaxial-Bicopter Quadrotor"
description: "TinyMorph is a 250 g quadrotor that folds in flight into a coaxial bicopter, 2.2× narrower. An online propeller interaction model restores accurate control in the folded state, cutting Figure-8 tracking error by 40.9%."
image: static/images/social.jpg
keywords: [morphing drone, quadrotor, coaxial bicopter, propeller interaction, gap traversal, TinyMorph]

venue: "IROS 2026 Workshop on Insect-scale Autonomy"
citation_date: "2026/10"

authors:
  - name: Pravesh Rana Vadapalli
    url: /team.html
  - name: Chahat Deep Singh
    url: https://chahatdeep.github.io/
affiliations:
  - Perception, Robotics, AI and Sensing (PRAISe) Lab, University of Colorado Boulder

links:
  - text: Paper
    url: static/fold-to-fit.pdf
    icon: fas fa-file-pdf
  - text: Video
    url: "#results"
    icon: fas fa-video

teaser:
  image: static/images/banner.jpg
  alt: "(A) A bogong moth, 50 mm in flight, folded to 10 mm. (B) TinyMorph, 165 mm as an X quadrotor, folded to 75 mm. (C) Figure-8 tracking in the folded configuration."
  caption: "**Fold to fit.** (A) A bogong moth folds its wings from about 50 mm to 10 mm. (B) **TinyMorph** does the same in flight, from 165 mm to 75 mm (**2.2× narrower**). (C) Closed-loop Figure-8 tracking while fully folded, using our propeller interaction model."

math: true

bibtex: |
  @misc{vadapalli2026foldtofit,
    title        = {Fold-to-Fit: Propeller Interaction and Control of a Coaxial-Bicopter Quadrotor},
    author       = {Vadapalli, Pravesh Rana and Singh, Chahat Deep},
    howpublished = {IROS 2026 Workshop on Insect-scale Autonomy, Pittsburgh, PA, USA},
    month        = oct,
    year         = {2026},
    url          = {https://www.praisecu.com/research/fold-to-fit.html}
  }
---

## Abstract

A traditional fixed quadrotor cannot traverse a gap narrower than its own lateral footprint. Getting through a narrower gap requires the quadrotor to reconfigure its airframe on the fly, until its width is limited only by its propeller diameter. We introduce **TinyMorph**, a 250 g quadrotor that folds in flight into a longitudinal coaxial bicopter, reducing its lateral footprint by 2.2× to match its propeller diameter.

Conventional roll control uses the lateral thrust moment arm, which vanishes in the bicopter configuration. A fixed inward motor tilt, or dihedral, instead projects the propeller reaction moment onto the roll axis, preserving some roll control. Folding also places each lower rotor in the airflow of an upper rotor, reducing its thrust and torque effectiveness and changing the motor commands needed for a desired control wrench. We develop an online propeller interaction model that estimates these effects, and a closed-form allocation correction that makes the new motor commands deliver the desired forces and moments. In Figure-8 flights, the interaction-aware controller has a **40.9% lower** root mean square (RMS) tracking error.

## Fold to fit

{% columns %}
{% column %}
Insects treat their cross section as a variable. A bogong moth spans about 50 mm in flight and folds its wings flat to about 10 mm to slip into the rock crevices where it spends the summer.

TinyMorph does the same in flight. Its four arms are mechanically coupled and driven by a single servo. As the morphing angle $$\alpha$$ goes from 45° (X configuration) to 0°, the front and rear arm pairs fold toward the centerline until the rotors form two coaxial pairs, one upper and one lower. The lateral footprint drops from **165 mm to 75 mm**.
{% endcolumn %}
{% column %}
{% figure src="static/videos/folding.mp4", poster="static/images/folding.jpg", width="300px", caption="TinyMorph folding into the coaxial bicopter configuration." %}
{% endcolumn %}
{% endcolumns %}

## Recovering roll authority with a motor dihedral

A quadrotor normally rolls by spinning its left rotors faster than its right ones. Folding moves the rotors onto the centerline, so that lever arm shrinks and disappears once the drone is fully folded.

{% figure src="static/images/dihedral.png", width="560px", alt="A rotor tilted inward by the dihedral angle delta: its reaction moment Q splits into a yaw part Q cos delta and a roll part Q sin delta", caption="Tilting each motor inward by a fixed dihedral δ = 30° splits the propeller's reaction moment into a yaw part and a roll part." %}

TinyMorph's motors are tilted inward by a fixed 30° dihedral. Every spinning propeller pushes back on the frame with a reaction moment; tilting the motor points part of that moment along the arm. Once folded, that part acts on the roll axis, so the drone can still roll. The catch is that roll now depends entirely on rotor torque, which is exactly what the coaxial wake weakens.

## Propeller interaction-aware control

Folded, each lower rotor flies in the wake of the upper rotor above it and produces less thrust and torque than the controller expects. TinyMorph estimates that loss online from the motor speeds its speed controllers already report: the harder the upper rotor spins relative to the lower one, the more the lower rotor is derated. The loss coefficients come from bench tests.

The controller then asks the derated rotors for exactly what the baseline mixer would have asked of ideal ones, correcting the motor commands in closed form:

$$
\mathbf{u}^\star = \mathcal{B}(\eta)^{-1}\, \mathcal{B}_0\, \mathbf{u}_0
$$

Here $$\mathbf{u}_0$$ is the baseline motor command, $$\mathcal{B}_0$$ the ideal mixer and $$\mathcal{B}(\eta)$$ the derated one. That is one small 4×4 solve per control loop, running at 400 Hz. It needs no RPM feedback loop and no aerodynamic simulation.

<div id="results"></div>

## Results

We flew TinyMorph fully folded along Figure-8 and Straight-Line trajectories, with the interaction model disabled and then enabled. The vehicle, gains, folded state and trajectory controller were the same in every run; only the model changed. Both clips below show one synchronized lap, recorded top-down and rectified to the same axes, with the commanded path dashed.

{% grid items="static/images/figure8_vicon.png, static/videos/figure8_interaction_off.mp4, static/videos/figure8_interaction_on.mp4", captions="Vicon tracks: desired (dashed), interaction **off** (red), interaction **on** (green) | Interaction model **off** | Interaction model **on**", columns=3 %}

| Trajectory | Method | RMS<sub>z</sub> | RMS<sub>2D</sub> | RMS<sub>3D</sub> | Reduction |
|---|---|:---:|:---:|:---:|:---:|
| Figure-8 | Baseline | 0.0106 | 0.3151 | 0.3153 | |
| Figure-8 | **Interaction** | 0.0083 | 0.1863 | 0.1864 | **40.9%** |
| Straight-Line | Baseline | 0.0060 | 0.1338 | 0.1339 | |
| Straight-Line | **Interaction** | 0.0055 | 0.1092 | 0.1093 | **18.4%** |

<p class="table-note">Tracking error in meters, measured by Vicon. RMS<sub>z</sub>: vertical; RMS<sub>2D</sub>: horizontal; RMS<sub>3D</sub>: total.</p>

The vertical error stays at about 1 cm or less in every run, so the gain is in horizontal tracking, that is, in attitude rather than lift. The pitch-dominated Straight-Line, a roughly 2.9 m diagonal flown in 5 s legs, improves by 18.4%. The roll-heavy Figure-8, which needs repeated left and right roll, improves by 40.9%. **The more a trajectory demands roll, the more the interaction model helps**, consistent with roll in the folded state depending entirely on rotor torque.

## Hardware

- **Flight controller:** MicoAir H743 V2 AIO 45A, running a custom controller in the ArduPilot framework (ArduCopter 4.7.0)
- **Motors and propellers:** T-Motor F1404 4600KV with Gemfan 3020 three-blade propellers
- **Morphing:** one NSDRC RS-100 servo drives all four arms through a coupled linkage
- **Control:** geometric attitude controller and interaction-aware allocation at 400 Hz; ArduPilot position control
- **Sensing:** Vicon motion capture, sent over MAVLink at 30 Hz and fused with onboard inertial measurements

## Related work

The dihedral approach to roll in the bicopter configuration follows MorphoCopter (Modi et al., IEEE/ASME Transactions on Mechatronics, 2026). Other morphing drones squeeze through gaps with folding arms (Falanga et al., RA-L 2019), sprung passive hinges (Bucki and Mueller, ICRA 2019) and elastic frames. The attitude controller is the geometric SO(3) controller of Lee, Leok and McClamroch (CDC 2010).

Contact: [pravesh.vadapalli@colorado.edu](mailto:pravesh.vadapalli@colorado.edu)
