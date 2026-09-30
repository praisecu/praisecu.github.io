---
title: "Fold-to-Fit: Propeller Interaction and Control of a Coaxial-Bicopter Quadrotor"
description: "TinyMorph is a 250 g quadrotor that folds in flight into a coaxial bicopter, 2.2× narrower. An online propeller interaction model restores accurate control in the folded state, cutting Figure-8 tracking error by 40.9%."
image: static/images/social.jpg
keywords: [morphing drone, quadrotor, coaxial bicopter, propeller interaction, gap traversal, TinyMorph]

venue: "IROS 2026 Workshop on Insect-scale Autonomy"

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
  image: static/images/teaser.jpg
  alt: "TinyMorph unfolded as an X quadrotor, 165 mm wide, and folded into a coaxial bicopter, 75 mm wide"
  caption: "**TinyMorph** folds in flight from an X quadrotor into a coaxial bicopter: **2.2× narrower**, with roll authority kept and **40.9% less tracking error**."

math: true

bibtex: |
  @inproceedings{vadapalli2026foldtofit,
    title     = {Fold-to-Fit: Propeller Interaction and Control of a Coaxial-Bicopter Quadrotor},
    author    = {Vadapalli, Pravesh Rana and Singh, Chahat Deep},
    booktitle = {IROS 2026 Workshop on Insect-scale Autonomy},
    address   = {Pittsburgh, PA, USA},
    year      = {2026}
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

Folding shrinks the lateral thrust moment arm of each rotor to $$L_i \sin\alpha$$, so conventional differential-thrust roll control fades as the vehicle folds and is gone at $$\alpha = 0$$. TinyMorph's motors are instead tilted inward by a fixed dihedral $$\delta = 30^\circ$$. The propeller reaction moment $$Q_i$$ then gains a component in the plane of the arm, which in the fully folded state is the roll plane:

$$
\bar{\tau}_{R,i} = Q_i \sin\delta, \qquad \bar{\tau}_{P,i} = L_i T_i \cos\delta, \qquad \bar{\tau}_{Y,i} = Q_i \cos\delta
$$

Here $$T_i$$ and $$Q_i$$ are the thrust and reaction moment of rotor $$i$$, $$L_i$$ is its arm length, and $$\bar{\tau}_R, \bar{\tau}_P, \bar{\tau}_Y$$ are the roll, pitch and yaw moments. Roll in the folded state therefore depends entirely on rotor torque, which is exactly what the coaxial wake degrades.

## Propeller interaction-aware control

Each lower rotor flies in the wake of the upper rotor above it. Using only the speed telemetry from the electronic speed controllers, a relative speed state for each coaxial pair $$p \in \{F, B\}$$ says how hard the upper rotor is blowing, and derates the lower rotor's thrust and torque effectiveness:

$$
\chi_p = \frac{\Omega_{U,p}^2}{\Omega_{U,p}^2 + \Omega_{L,p}^2}, \qquad \eta_{T,p} = 1 - \sigma C_T \chi_p, \qquad \eta_{Q,p} = 1 - \sigma C_Q \chi_p
$$

$$\Omega_{U,p}$$ and $$\Omega_{L,p}$$ are the upper and lower rotor speeds, $$\sigma = 1$$ when fully folded, and the loss coefficients $$C_T = 0.40$$ and $$C_Q = 0.12$$ come from bench tests. Thrust and torque are linear in the motor effort $$\mathbf{u}$$, so the derating enters the control wrench map directly:

$$
\mathbf{v} = \begin{bmatrix} F_z & \tau_R & \tau_P & \tau_Y \end{bmatrix}^T = \mathcal{B}(\eta)\, \mathbf{u}
$$

For the baseline command $$\mathbf{u}_0$$, the command that delivers the same wrench through the derated mixer is

$$
\mathcal{B}(\eta)\, \mathbf{u}^\star = \mathcal{B}_0\, \mathbf{u}_0 \quad \Longrightarrow \quad \mathbf{u}^\star = \mathcal{B}(\eta)^{-1} \mathcal{B}_0\, \mathbf{u}_0
$$

That is one 4×4 solve per control loop at 400 Hz, inside a geometric attitude controller on SO(3). It needs no closed-loop RPM control and no high-fidelity aerodynamic model.

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

The dihedral approach to roll in the bicopter configuration follows MorphoCopter (Modi et al., IEEE/ASME Transactions on Mechatronics, 2026). Other morphing drones squeeze through gaps with folding arms (Falanga et al., RA-L 2019), sprung passive hinges (Bucki and Mueller, ICRA 2019) and elastic frames. Choosing where and how to pass through an opening with onboard vision is the subject of [GapFlyt](https://prg.cs.umd.edu/GapFlyt) (Sanket, Singh et al., RA-L 2018). The attitude controller is the geometric SO(3) controller of Lee, Leok and McClamroch (CDC 2010).

Contact: [pravesh.vadapalli@colorado.edu](mailto:pravesh.vadapalli@colorado.edu), [chahat.singh@colorado.edu](mailto:chahat.singh@colorado.edu)
