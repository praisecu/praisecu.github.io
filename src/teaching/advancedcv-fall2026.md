---
layout: layouts/teaching-course.njk
title: "MCEN 5228: Advanced Computer Vision"
description: Advanced Computer Vision at the University of Colorado Boulder, covering geometric and learning-based methods in computer vision.
permalink: /teaching/advancedcv-fall2026.html
nav: teaching

course_code: MCEN 5228
course_name: Advanced Computer Vision
subtitle: Geometry and Learning-based Methods in Computer Vision
term: Fall 2026

banner: /img/teaching/AdvancedCV-Class-Banner/Slide1.PNG
banner_alt: Advanced Computer Vision course banner

quick_info:
  canvas_url: https://canvas.colorado.edu/courses/139889
  piazza_url: https://piazza.com/colorado/fall2026/mcen5228010
  instructor: Chahat Deep Singh
  class_hours: "Tue/Thu, 3:30 PM–4:45 PM"
  location: "ECCS 1B14"
  office_hours: TBD

# Only the five newest announcements are shown on the page.
# Use type: lecture | assignment | schedule | setup
announcements:

  - date: September 2, 2026
    date_iso: 2026-09-02
    type: assignment
    text: "P1: Panorama! is released and is due Monday, September 21, 2026."

  - date: September 1, 2026
    date_iso: 2026-09-01
    type: lecture
    text: "Lecture 4 (Projections and Transformations) slides and recording are now posted."

  - date: August 27, 2026
    date_iso: 2026-08-27
    type: setup
    text: "A free Google Colab account and its T4 GPU are sufficient for every assignment in this course."

  - date: August 27, 2026
    date_iso: 2026-08-27
    type: lecture
    text: "Lecture 3 (All About Features!) slides and recording are now posted."

  - date: August 26, 2026
    date_iso: 2026-08-26
    type: lecture
    text: "Lecture 2 (Image Formation) slides and recording are now posted."

  - date: August 20, 2026
    date_iso: 2026-08-20
    type: lecture
    text: "Lecture 1 (Introduction) slides and recording are now posted."

  - date: August 20, 2026
    date_iso: 2026-08-20
    type: schedule
    text: "Class location moved to ECCS 1B14 (previously Gold Biosciences Building A2B07)."

course_links:
  - label: Previous year course materials
    url: /teaching/advancedcv-fall2025.html
    external: false

---

> Sign up for [Piazza](https://piazza.com/colorado/fall2026/mcen5228010) using your `colorado.edu` ID. Piazza is the primary communication channel for this course.

<h2 id="advancedcv-description">Course Description</h2>

Welcome to **MCEN 5228-010: Advanced Computer Vision**, taught by Prof. Chahat Deep Singh at the University of Colorado Boulder. This advanced graduate course covers classical, geometric, and deep learning methods in computer vision. The course begins with the mathematical foundations of computer vision and progresses to recent deep-learning advances. Its objective is to introduce formal perception tools for students interested in robot autonomy and 3D perception.

Topics include camera sensors and calibration, image formation, single-view geometry, projective transformations, multi-view geometry, structure from motion, optical flow, computational imaging, radiance fields, volumetric rendering, and deep-learning-based depth and reconstruction methods.

**Prerequisites:** Linear algebra and proficiency with Python or another scripting language. Prior computer vision experience is **not required**.

<h2 id="advancedcv-logistics">Course Logistics</h2>

All course announcements will be made through [Piazza](https://piazza.com/colorado/fall2026/mcen5228010), which is the main mode of communication during the course.

Please do not contact the instructor or teaching assistant by email unless the matter is an emergency. Do not contact the instructional staff through social-media platforms regarding course content. **Canvas** will be used only for grading and assignment submissions.

<h2 id="advancedcv-software">Software Environment</h2>

We will use Python 3 throughout the course, together with OpenCV, PyTorch, NumPy, scikit-learn, and Matplotlib. Assignments will use [Google Colab](https://colab.research.google.com/); you may also work on your own machine.

A GPU is only required for **P2 Part 2** and **P3 Part 2**. The **free** Colab tier gives you an NVIDIA T4 GPU (16 GB), which is enough for both — **you do not need to pay for anything in this course**. Enable it with **Runtime → Change runtime type → T4 GPU**. Colab Pro (about $10 per month) is entirely optional and only makes training faster.

<h3 id="advancedcv-training-time">Training time</h3>

Rough estimates. Free-tier sessions disconnect, but the starter notebooks checkpoint each epoch to Google Drive and resume automatically. Start early regardless.

|Assignment|Free tier (T4)|Colab Pro (A100)|
|-|:-:|:-:|
|P2: Coded Deep Depth — Part 2|2–4 hours|45–75 minutes|
|P3: Blob the Builder — Part 2|3–5 hours|1–1.5 hours|


<h2 id="advancedcv-lectures">Lectures</h2>

|No.|Topic|Slides|Video<sup>&dagger;</sup>|
|-:|-|:-:|:-:|
|1|Introduction|[Link](https://o365coloradoedu-my.sharepoint.com/:b:/g/personal/chsi1006_colorado_edu/IQA1JR_VlGPfRbEvoeiTAesEATJyOoyeANFJeXDpsK7_krM?e=Sw5VOl)|[Link](https://cuboulder.zoom.us/rec/share/RwdF-3iL-q8V5VRzjIn7rkmaZG5SYNO2MS_tGlQFZWlkqYkKouyVCH7eTjkMdfvi.QOz13hJMGttfW3uh)|
|2|Image Formation|[Link](https://o365coloradoedu-my.sharepoint.com/:b:/g/personal/chsi1006_colorado_edu/IQCaScbo8z1QRIhUeQcFBLBzAZA39DBZOrQLjJCezMmvvic?e=uO9suE)|[Link](https://cuboulder.zoom.us/rec/share/7mNdUWT42jYLS5cgfJugH3qOjy7QGTP3NwStvVeFFteh9Jc8UzF87rMLitQPCaQI.kYcyJV-nFMrp2MOx)|
|3|All About Features!|[Link](https://o365coloradoedu-my.sharepoint.com/:b:/g/personal/chsi1006_colorado_edu/IQDbDEJTPiKLQLN18CUeZwtpAeMK_Y92W8-P82j4suh_h1M?e=B5Gm3D)|[Link](https://cuboulder.zoom.us/rec/share/TtlpkWWAcN4uIyvvi7pP6zf51SMjDu0FzEaTyiYiCLErIuHy_0eo0pF80QGaF5Nr.KH59IV_jb0--kf9_)|
|4|Projections and Transformations|[Link](https://o365coloradoedu-my.sharepoint.com/:b:/g/personal/chsi1006_colorado_edu/IQD0DxA0k4JFRaJsXJklDLhuAYCvNRGa4O0Ll0Do9qZuyHg?e=hSerlP)|[Link](https://cuboulder.zoom.us/rec/share/i42D0EW1S_FMl_FWSYZKVy77_b7nVDnGNChEKRy4Susg6XJuhFPhLSMv5lQ9CJt-.svAUfILTsJurxKMG)|
|5|Non-Rigid Transformation and Camera Models|—|—|
|6|Camera Calibration and Introduction to Computer Graphics|—|—|
|7|Curves and Rendering|—|—|
|8|Single View Geometry|—|—|
|9|Introduction to Computational Imaging|—|—|
|10|Coded Deep Depth|—|—|
|10b|Coded Deep Depth — 2|—|—|
|11|Two-View Geometry and Stereopsis|—|—|
|12|Structure from Motion — 1|—|—|
|13|Structure from Motion — 2|—|—|
|14|Volumetric Rendering|—|—|
|15|Neural Radiance Fields|—|—|
|16|More NeRFs|—|—|
|17|3D Gaussian Splatting|—|—|
|18|Motion Fields and Optical Flow|—|—|

<p class="course-table-note"><span class="course-table-note__marker">&dagger;</span> Lecture videos are available only to CU Boulder members signed in with a <code>colorado.edu</code> account.</p>

<h2 id="advancedcv-assignments">Assignments</h2>

This course consists of four assignments completed in groups of **two**, one in-class midterm examination, and one homework completed **individually**.

Students may discuss concepts with team members and other class members, but may not copy another student's work. Refer to the Collaboration Policy and Honor Code below for details.

|No.|Assignment|Release Date|Due Date|
|-:|-|:-:|:-:|
| 0. | [Python Tutorial](https://colab.research.google.com/github/cs231n/cs231n.github.io/blob/master/python-colab.ipynb#scrollTo=qVrTo-LhL9eS) \| [OpenCV Tutorial](https://colab.research.google.com/drive/1b-LlTfcJR9lGzilay8z7NHqyD4ItnDsB?usp=sharing) | — | — |
|1|[P1: Panorama!](https://colab.research.google.com/drive/1bU_OAJUjFJ54Qqh-tCoWJRwQBe2T6Vn-?usp=sharing)|Sep 2, 2026|Sep 21, 2026|
|2|Homework: Calibrate My Camera|—|—|
|3|P2: Coded Deep Depth — Part 1 / Part 2|—|—|
|4|P3: Blob the Builder — Part 1 / Part 2|—|—|
|5|Midterm — In Class|—|—|
|6|P4: Monocular Visual Odometry|—|—|

<h2 id="advancedcv-late-policy">Late Policy</h2>

This course is fast-paced, with concepts building upon each other, so staying current is important. Late assignments incur a **20% penalty per day**.

Students have a total of **six late days** that may be used across assignments, except the final project. Late days must be used as full days. For example, receiving full credit on an assignment submitted two days late requires using two late days.

When using late days:

1. Include **“USING X LATE DAY(S)”** in the submission title.
2. Add a Canvas comment identifying the late-day usage.
3. Track the number of late days remaining.

A late penalty will be applied when late-day usage is not identified in the Canvas submission.

<h2 id="advancedcv-honor-code">Collaboration Policy and Honor Code</h2>

Collaboration is encouraged, but students must understand the distinction between collaboration and cheating. Cheating is strictly prohibited and may include using unauthorized assistance, materials, or study aids; collaborating when collaboration is not permitted; copying homework; submitting another person's work; or plagiarism.

Students may collaborate through Piazza and in person, but submitted work must reflect each student's own understanding.

The following limits apply:

- Clearly cite collaborators by name at the top of the report, including relevant Piazza posts.
- Do not share or copy code.
- Discussion of concepts and how code works is permitted.
- Free and publicly available books, journal articles, conference papers, and webpages may be used as research materials.
- Paid solution services may not be used.
- Clearly and explicitly cite all outside sources and materials.

Uncited use of external sources is treated as presenting another person's work as your own and violates university academic-integrity policy. Unless otherwise specified, the [CU Boulder Code of Academic Integrity](https://catalog.colorado.edu/graduate/academic-integrity/) applies.

