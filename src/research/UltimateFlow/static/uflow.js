/*
 * UltimateFlow project page (src/research/UltimateFlow): the teaser, the
 * video comparison explorer, the two charts and the robustness explorer.
 * Loaded after js/research-project/project.js through `extra_js`.
 *
 * Every clip is ONE video that holds a 4x2 grid of 640x460 tiles (frame,
 * events and one flow field per method, see tools/make_website_assets.py
 * in the paper repository). The page draws two tiles of the same video
 * frame on a canvas, so the two sides of the slider are always in sync.
 */
(function () {
  "use strict";

  var script = document.currentScript;
  var base = script ? script.src.replace(/[^/]*$/, "") : "static/";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var TILE_W = 640, TILE_H = 460, COLS = 4, FPS = 10;
  var TILE = { frame: 0, events: 1, eraft: 2, idnet: 3, bflow: 4, evo: 5, ours: 6, gt: 7 };
  var NAME = {
    frame: "RGB Frame",
    events: "Events",
    eraft: "E-RAFT (E)",
    idnet: "IDNet (E)",
    bflow: "BFlow (E+I)",
    evo: "UltimateFlow (E)",
    ours: "UltimateFlow (E+I)",
    gt: "Ground Truth"
  };

  /* Sequence EPE on the DSEC-Flow benchmark server (per-sequence table of the
     supplement). The validation scene has ground truth instead. */
  var SCENES = [
    { id: "mountain", title: "Mountain Road", sub: "Test, Fast Motion", frames: 160,
      left: ["frame", "events", "eraft", "idnet", "bflow", "evo"],
      epe: { eraft: 1.39, idnet: 1.25, bflow: 1.11, evo: 1.36, ours: 0.91 } },
    { id: "tunnel", title: "Tunnel", sub: "Test, Dark Frames", frames: 112,
      left: ["frame", "events", "eraft", "idnet", "bflow", "evo"],
      epe: { eraft: 1.39, idnet: 1.25, bflow: 1.11, evo: 1.36, ours: 0.91 } },
    { id: "night", title: "City at Night", sub: "Test, Low Light", frames: 160,
      left: ["frame", "events", "eraft", "idnet", "bflow", "evo"],
      epe: { eraft: 0.61, idnet: 0.60, bflow: 0.54, evo: 0.57, ours: 0.48 } },
    { id: "street", title: "Residential Street", sub: "Validation, With GT", frames: 100,
      left: ["frame", "events", "eraft", "idnet", "bflow", "evo", "gt"],
      epe: {} }
  ];

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else if (key === "text") node.textContent = attrs[key];
      else if (key === "html") node.innerHTML = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  function svg(tag, attrs, children) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  /* Add .uf-in the first time an element scrolls into view (bars grow once). */
  function onceVisible(node, callback) {
    if (!("IntersectionObserver" in window)) { callback(); return; }
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        observer.disconnect();
        callback();
      }
    }, { threshold: 0.25 });
    observer.observe(node);
  }
  document.querySelectorAll(".uf-gap, .uf-abl").forEach(function (node) {
    onceVisible(node, function () { node.classList.add("uf-in"); });
  });

  /* ---- Grid player -----------------------------------------------------
   * One hidden <video> per clip plus its poster (the first frame of the
   * grid), so something can be drawn before the video has buffered. */
  function GridPlayer(onFrame) {
    var self = this;
    this.onFrame = onFrame;
    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.loop = true;
    this.video.playsInline = true;
    this.video.setAttribute("playsinline", "");
    this.video.setAttribute("muted", "");
    this.video.preload = "auto";
    this.poster = new Image();
    this.ready = false;
    this.visible = false;
    this.wantPlay = !reduceMotion;
    this.lastTime = -1;
    this.raf = 0;

    this.poster.addEventListener("load", function () { if (!self.ready) self.onFrame(); });
    this.video.addEventListener("loadeddata", function () {
      self.ready = true;
      self.onFrame();
      self.sync();
    });
    this.video.addEventListener("seeked", function () { self.onFrame(); });
    this.loop = function () {
      self.raf = 0;
      if (self.video.currentTime !== self.lastTime) {
        self.lastTime = self.video.currentTime;
        self.onFrame();
      }
      if (!self.video.paused) self.raf = requestAnimationFrame(self.loop);
    };
    this.video.addEventListener("play", function () { if (!self.raf) self.raf = requestAnimationFrame(self.loop); });
  }
  GridPlayer.prototype.load = function (scene) {
    this.scene = scene;
    this.ready = false;
    this.lastTime = -1;
    this.poster.src = base + "images/" + scene.id + "_poster.jpg";
    this.video.src = base + "videos/" + scene.id + ".mp4";
    this.video.load();
  };
  GridPlayer.prototype.source = function () {
    if (this.ready && this.video.readyState >= 2) return this.video;
    return this.poster.complete && this.poster.naturalWidth ? this.poster : null;
  };
  /* Play only while on screen and wanted. */
  GridPlayer.prototype.sync = function () {
    if (!this.ready) return;
    if (this.visible && this.wantPlay) {
      var promise = this.video.play();
      if (promise && promise.catch) promise.catch(function () {});
    } else {
      this.video.pause();
    }
  };
  GridPlayer.prototype.watch = function (node) {
    var self = this;
    if (!("IntersectionObserver" in window)) { this.visible = true; return; }
    new IntersectionObserver(function (entries) {
      self.visible = entries[entries.length - 1].isIntersecting;
      self.sync();
    }, { threshold: 0.1 }).observe(node);
  };
  GridPlayer.prototype.frame = function () {
    return Math.min(this.scene.frames - 1, Math.floor(this.video.currentTime * FPS + 1e-3));
  };

  /* Draw the horizontal slice [u0, u1] of one tile into the same slice of
     the canvas. `cover` crops the tile to the canvas shape. The source
     rectangle stays one pixel inside the tile, because the video's chroma
     bleeds across tile borders. */
  function drawTile(ctx, src, tile, u0, u1, cover) {
    var cw = ctx.canvas.width, ch = ctx.canvas.height;
    var tx = (tile % COLS) * TILE_W + 1, ty = Math.floor(tile / COLS) * TILE_H + 1;
    var tw = TILE_W - 2, th = TILE_H - 2;
    if (cover) {
      var want = cw / ch;
      if (want > tw / th) { var nh = tw / want; ty += (th - nh) / 2; th = nh; }
      else { var nw = th * want; tx += (tw - nw) / 2; tw = nw; }
    }
    if (u1 <= u0) return;
    ctx.drawImage(src, tx + u0 * tw, ty, (u1 - u0) * tw, th, u0 * cw, 0, (u1 - u0) * cw, ch);
  }

  /* Keep a canvas's pixel size in step with its box, at most 2x. */
  function fitCanvas(canvas, redraw) {
    function fit() {
      var rect = canvas.getBoundingClientRect();
      var scale = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(2, Math.round(rect.width * scale));
      var h = Math.max(2, Math.round(rect.height * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        redraw();
      }
    }
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(canvas);
    else window.addEventListener("resize", fit);
    fit();
  }

  /* ---- Teaser ---------------------------------------------------------- */
  (function () {
    var root = document.getElementById("uf-hero");
    if (!root) return;
    var views = [];
    root.querySelectorAll("canvas[data-tile]").forEach(function (canvas) {
      views.push({ canvas: canvas, ctx: canvas.getContext("2d"), tile: TILE[canvas.dataset.tile], cover: canvas.dataset.cover === "true" });
    });
    function draw() {
      var src = player.source();
      if (!src) return;
      views.forEach(function (view) { drawTile(view.ctx, src, view.tile, 0, 1, view.cover); });
    }
    var player = new GridPlayer(draw);
    views.forEach(function (view) { fitCanvas(view.canvas, draw); });
    player.load(SCENES.filter(function (item) { return item.id === "tunnel"; })[0]);
    player.watch(root);
  })();

  /* ---- Video comparison explorer --------------------------------------- */
  (function () {
    var root = document.getElementById("uf-explorer");
    if (!root) return;

    var scene = SCENES[0], left = "bflow", pos = 0.5;
    var canvas = el("canvas", { "aria-hidden": "true" });
    var ctx = canvas.getContext("2d");
    var labelLeft = el("span", { class: "compare-label compare-label-before" });
    var labelRight = el("span", { class: "compare-label compare-label-after" });
    var range = el("input", { class: "compare-range", type: "range", min: "0", max: "100", value: "50", "aria-label": "Comparison slider" });
    var stage = el("div", { class: "compare uf-stage is-loading" }, [
      canvas, el("div", { class: "compare-handle", "aria-hidden": "true" }), labelLeft, labelRight, range
    ]);

    var playIcon = el("i", { class: "fas fa-pause", "aria-hidden": "true" });
    var playButton = el("button", { class: "uf-icon-btn", type: "button", "aria-label": "Pause" }, [playIcon]);
    var scrub = el("input", { class: "uf-scrub", type: "range", min: "0", max: "159", value: "0", step: "1", "aria-label": "Time" });
    var time = el("span", { class: "uf-time", text: "0.0 s" });

    var sceneBar = el("div", { class: "uf-scenes", role: "tablist", "aria-label": "Scene" });
    var chipBar = el("div", { class: "uf-chips", role: "group", "aria-label": "Left side of the slider" });

    function draw() {
      var src = player.source();
      if (!src) return;
      drawTile(ctx, src, TILE[left], 0, pos, false);
      drawTile(ctx, src, TILE.ours, pos, 1, false);
      if (player.ready) {
        var k = player.frame();
        scrub.value = k;
        scrub.style.setProperty("--fill", (100 * k / (scene.frames - 1)) + "%");
        time.textContent = (k / FPS).toFixed(1) + " s";
      }
    }
    var player = new GridPlayer(draw);
    player.video.addEventListener("loadeddata", function () { stage.classList.remove("is-loading"); });

    function label(key) {
      var text = NAME[key];
      var epe = scene.epe[key];
      return epe ? text + "<small>" + epe.toFixed(2) + " EPE</small>" : text;
    }
    function setLabels() {
      labelLeft.innerHTML = label(left);
      labelRight.innerHTML = label("ours");
      /* a label under the slider line would describe the wrong side */
      labelLeft.style.opacity = pos < 0.2 ? 0 : 1;
      labelRight.style.opacity = pos > 0.8 ? 0 : 1;
    }
    function setPlaying(playing) {
      player.wantPlay = playing;
      playIcon.className = playing ? "fas fa-pause" : "fas fa-play";
      playButton.setAttribute("aria-label", playing ? "Pause" : "Play");
      player.sync();
    }

    function buildChips() {
      chipBar.innerHTML = "";
      if (scene.left.indexOf(left) < 0) left = "bflow";
      scene.left.forEach(function (key) {
        var chip = el("button", { class: "uf-chip", type: "button", "aria-pressed": String(key === left), text: NAME[key] });
        chip.addEventListener("click", function () {
          left = key;
          chipBar.querySelectorAll(".uf-chip").forEach(function (other) { other.setAttribute("aria-pressed", String(other === chip)); });
          setLabels();
          draw();
        });
        chipBar.appendChild(chip);
      });
    }
    function selectScene(next) {
      scene = next;
      sceneBar.querySelectorAll(".uf-scene").forEach(function (button) {
        button.setAttribute("aria-selected", String(button.dataset.scene === scene.id));
      });
      scrub.max = scene.frames - 1;
      stage.classList.add("is-loading");
      buildChips();
      setLabels();
      player.load(scene);
    }

    SCENES.forEach(function (item) {
      var button = el("button", { class: "uf-scene", type: "button", role: "tab", "data-scene": item.id, "aria-selected": "false" }, [
        el("img", { src: base + "images/" + item.id + "_thumb.jpg", alt: "", loading: "lazy" }),
        el("span", {}, [el("b", { text: item.title }), el("small", { text: item.sub })])
      ]);
      button.addEventListener("click", function () { if (scene !== item) selectScene(item); });
      sceneBar.appendChild(button);
    });

    range.addEventListener("input", function () {
      pos = range.value / 100;
      stage.style.setProperty("--pos", range.value + "%");
      setLabels();
      draw();
    });
    playButton.addEventListener("click", function () { setPlaying(!player.wantPlay); });
    scrub.addEventListener("input", function () {
      setPlaying(false);
      if (player.ready) player.video.currentTime = (Number(scrub.value) + 0.5) / FPS;
    });

    root.appendChild(sceneBar);
    root.appendChild(stage);
    root.appendChild(el("div", { class: "uf-controls" }, [playButton, scrub, time]));
    root.appendChild(el("div", { class: "uf-versus" }, [el("span", { class: "uf-kicker", text: "Left side" }), chipBar]));

    fitCanvas(canvas, draw);
    if (reduceMotion) setPlaying(false);
    selectScene(scene);
    player.watch(stage);
  })();

  /* ---- Tooltip shared by the charts ------------------------------------ */
  function tooltip(host) {
    var tip = el("div", { class: "uf-tip", role: "status" });
    host.appendChild(tip);
    return {
      show: function (html, x, y) {
        tip.innerHTML = html;
        tip.classList.add("is-on");
        var hostRect = host.getBoundingClientRect();
        var w = tip.offsetWidth, h = tip.offsetHeight;
        var px = Math.min(Math.max(4, x - hostRect.left + 14), hostRect.width - w - 4);
        var py = y - hostRect.top - h - 12;
        if (py < 0) py = y - hostRect.top + 16;
        tip.style.left = px + "px";
        tip.style.top = py + "px";
      },
      hide: function () { tip.classList.remove("is-on"); }
    };
  }

  /* ---- DSEC-Flow leaderboard: EPE against 3PE --------------------------- */
  (function () {
    var root = document.getElementById("uf-leaderboard");
    if (!root) return;

    /* name, input, EPE, 1PE, 2PE, 3PE, AE, label offset (dx, dy) or null */
    var rows = [
      ["E-RAFT", "E", 0.788, 12.74, 4.74, 2.68, 2.85, [-10, 5, "end"]],
      ["UltimateFlow (E)", "E", 0.759, 11.20, 4.02, 2.44, 2.60, [10, -8, "start"]],
      ["TMA", "E", 0.743, 10.86, 3.97, 2.30, 2.68, null],
      ["EDCFlow", "E", 0.72, 10.0, 3.6, 2.1, 2.65, null],
      ["IDNet", "E", 0.719, 10.07, 3.50, 2.04, 2.72, [10, 14, "start"]],
      ["ECDDP†", "E", 0.697, 8.89, 3.20, 1.96, 2.58, null],
      ["BFlow", "E+I", 0.69, 9.70, 3.42, 1.88, 2.42, [0, 24, "middle"]],
      ["P-SSE", "E", 0.680, 9.14, 3.23, 1.82, 2.56, null],
      ["STSC-Flow", "E", 0.663, 7.94, 2.67, 1.60, 2.53, null],
      ["STFlow", "E+I", 0.66, 8.58, 2.93, 1.68, 2.37, null],
      ["BAT", "E", 0.650, 7.54, 2.84, 1.74, 2.43, null],
      ["EMatch", "E", 0.640, 7.86, 2.83, 1.69, 2.46, [-10, -8, "end"]],
      ["STFlow†", "E+I", 0.630, 7.93, 2.61, 1.45, 2.29, [10, 14, "start"]],
      ["EDCPT†", "E+I", 0.625, 6.87, 2.35, 1.52, 2.17, [-11, 13, "end"]],
      ["E-WAVE†", "E+I", 0.623, 7.26, 2.54, 1.56, 2.24, [-11, -5, "end"]],
      ["UltimateFlow† (E+I), single model", "E+I", 0.583, 6.31, 2.06, 1.18, 2.21, [13, -9, "start", "Single Model"]],
      ["UltimateFlow† (E+I), 5-model ensemble", "E+I", 0.554, 6.01, 1.94, 1.11, 2.08, [14, 18, "start", "UltimateFlow (E+I)"]]
    ];

    var W = 720, H = 430, m = { l: 58, r: 20, t: 16, b: 50 };
    var x0 = 0.52, x1 = 0.82, y0 = 0.9, y1 = 2.9;
    function sx(v) { return m.l + (v - x0) / (x1 - x0) * (W - m.l - m.r); }
    function sy(v) { return H - m.b - (v - y0) / (y1 - y0) * (H - m.t - m.b); }

    var chart = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img",
      "aria-label": "DSEC-Flow test server: endpoint error against 3-pixel error for every published method. UltimateFlow is at the lower left with 0.554 EPE and 1.11 percent 3PE." });
    var v;
    for (v = 0.55; v < x1 + 1e-6; v += 0.05) {
      chart.appendChild(svg("line", { class: "uf-grid", x1: sx(v), x2: sx(v), y1: sy(y0), y2: sy(y1) }));
      chart.appendChild(svg("text", { class: "uf-tick", x: sx(v), y: sy(y0) + 18, "text-anchor": "middle", text: v.toFixed(2) }));
    }
    for (v = 1.0; v < y1 + 1e-6; v += 0.5) {
      chart.appendChild(svg("line", { class: "uf-grid", x1: sx(x0), x2: sx(x1), y1: sy(v), y2: sy(v) }));
      chart.appendChild(svg("text", { class: "uf-tick", x: sx(x0) - 9, y: sy(v) + 4, "text-anchor": "end", text: v.toFixed(1) }));
    }
    chart.appendChild(svg("text", { class: "uf-axis-title", x: (sx(x0) + sx(x1)) / 2, y: H - 8, "text-anchor": "middle", text: "Endpoint Error, EPE (px)" }));
    chart.appendChild(svg("text", { class: "uf-axis-title", x: 15, y: (sy(y0) + sy(y1)) / 2, "text-anchor": "middle",
      transform: "rotate(-90 15 " + (sy(y0) + sy(y1)) / 2 + ")", text: "3-Pixel Error, 3PE (%)" }));
    chart.appendChild(svg("path", { class: "uf-better-line", d: "M" + (sx(0.60)) + " " + sy(2.62) + " L" + sx(0.555) + " " + sy(2.62) + " m6 -4 l-6 4 l6 4" }));
    chart.appendChild(svg("text", { class: "uf-better", x: sx(0.605), y: sy(2.62) + 4, text: "Better" }));

    var tip = tooltip(root);
    var points = [];
    rows.forEach(function (row) {
      var cx = sx(row[2]), cy = sy(row[5]);
      var ours = row[0].indexOf("UltimateFlow") === 0 && row[1] === "E+I";
      var kind = row[1] === "E" ? "is-e" : "is-ei";
      var mark = row[1] === "E"
        ? svg("circle", { class: "uf-mark", cx: cx, cy: cy, r: ours ? 8 : 5.5 })
        : svg("path", { class: "uf-mark", d: tri(cx, cy, ours ? 10 : 7) });
      var group = svg("g", { class: "uf-pt " + kind + (ours ? " is-ours" : ""), tabindex: "0", role: "img",
        "aria-label": row[0] + ", input " + row[1] + ", EPE " + row[2] + ", 3PE " + row[5] }, [mark]);
      if (row[7]) {
        group.appendChild(svg("text", { class: "uf-pt-label", x: cx + row[7][0], y: cy + row[7][1], "text-anchor": row[7][2], text: row[7][3] || row[0] }));
      }
      var html = "<b>" + row[0] + "</b><i>" + (row[1] === "E" ? "Events" : "Events and RGB frames") + "</i><dl>" +
        "<dt>EPE</dt><dd>" + row[2] + "</dd><dt>1PE</dt><dd>" + row[3] + "%</dd><dt>2PE</dt><dd>" + row[4] +
        "%</dd><dt>3PE</dt><dd>" + row[5] + "%</dd><dt>AE</dt><dd>" + row[6] + "°</dd></dl>";
      function show() {
        var rect = mark.getBoundingClientRect();
        tip.show(html, rect.left + rect.width / 2, rect.top);
      }
      group.addEventListener("pointerenter", show);
      group.addEventListener("focus", show);
      group.addEventListener("pointerleave", tip.hide);
      group.addEventListener("blur", tip.hide);
      chart.appendChild(group);
      points.push({ node: group, input: row[1] });
    });
    function tri(cx, cy, r) {
      return "M" + cx + " " + (cy - r) + " L" + (cx + r * 0.9) + " " + (cy + r * 0.7) + " L" + (cx - r * 0.9) + " " + (cy + r * 0.7) + " Z";
    }

    /* Legend chips double as a filter. */
    var filter = "all";
    var legend = el("div", { class: "uf-legend", role: "group", "aria-label": "Filter by input" });
    [["all", "All Methods", ""],
     ["E", "Events", '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>'],
     ["E+I", "Events + Frames", '<svg viewBox="0 0 12 12"><path d="M6 1 L11 10.5 L1 10.5 Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>']
    ].forEach(function (item) {
      var chip = el("button", { class: "uf-chip", type: "button", "aria-pressed": String(item[0] === filter), html: item[2] + "<span>" + item[1] + "</span>" });
      chip.addEventListener("click", function () {
        filter = item[0];
        legend.querySelectorAll(".uf-chip").forEach(function (other) { other.setAttribute("aria-pressed", String(other === chip)); });
        points.forEach(function (point) { point.node.classList.toggle("is-dim", filter !== "all" && point.input !== filter); });
      });
      legend.appendChild(chip);
    });

    root.appendChild(el("div", { class: "uf-scroll" }, [chart]));
    root.appendChild(legend);
  })();

  /* ---- From 0.759 to 0.554, one server evaluation per step --------------- */
  (function () {
    var root = document.getElementById("uf-stack");
    if (!root) return;

    var steps = [
      [0.759, "UltimateFlow (E)", "The event-only estimator with the event depth foundation prior. No frames."],
      [0.706, "Gated output blend", "Blend the guide flow with the event estimate wherever the gate accepts, with one weight (0.85) and a guide at two-thirds resolution."],
      [0.689, "Full-resolution guide", "Run the guide at full resolution, with 12 instead of 4 iterations."],
      [0.681, "Blend weight at its plateau", "Set the weight to 0.70, in the flat optimum measured on the server."],
      [0.678, "Mirror averaging", "Average each branch with its prediction on the mirrored input."],
      [0.670, "Multi-scale averaging", "Average the event branch over multiple scales. This is the strongest output-level fusion we could build."],
      [0.636, "Dense guidance replaces the blend", "The guide flow, its gate and its residual become inputs of the estimator, and the refinement starts from the guide. One pass, step 35k."],
      [0.612, "Symmetric ensemble", "Average the original, the mirrored and two downscaled inputs, with the guide inputs transformed alike."],
      [0.607, "Single model", "The checkpoint with the lowest validation error, at step 115k."],
      [0.587, "Four update iterations", "Run four refinement iterations at inference instead of the six used in training."],
      [0.583, "Epipolar projection", "Project every flow vector onto its epipolar line under an essential matrix fitted to the prediction."],
      [0.564, "Two large-motion models", "Average two models that are also trained on intervals of 200 and 300 ms."],
      [0.554, "5-model ensemble", "Average five models that use three sets of guide inputs. First of 39 entries on the benchmark."]
    ];
    var SPLIT = 6;                       /* first dense-guidance step */
    var current = steps.length - 1;
    var pinned = current;                /* hovering previews a step, leaving the chart returns here */

    var W = 720, H = 330, m = { l: 50, r: 24, t: 34, b: 30 };
    var y0 = 0.53, y1 = 0.78;
    function sx(i) { return m.l + 16 + i * (W - m.l - m.r - 32) / (steps.length - 1); }
    function sy(v) { return H - m.b - (v - y0) / (y1 - y0) * (H - m.t - m.b); }

    var chart = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "group",
      "aria-label": "Test-server EPE after each change, from 0.759 for the event-only model to 0.554 for the 5-model ensemble." });
    var mid = (sx(SPLIT - 1) + sx(SPLIT)) / 2;
    chart.appendChild(svg("rect", { class: "uf-band-a", x: m.l, y: m.t - 22, width: mid - m.l - 3, height: H - m.b - m.t + 22, rx: 12 }));
    chart.appendChild(svg("rect", { class: "uf-band-b", x: mid + 3, y: m.t - 22, width: W - m.r - mid - 3, height: H - m.b - m.t + 22, rx: 12 }));
    chart.appendChild(svg("text", { class: "uf-band-title is-a", x: m.l + 14, y: m.t - 3, text: "Output-Level Fusion" }));
    chart.appendChild(svg("text", { class: "uf-band-title is-b", x: W - m.r - 14, y: m.t - 3, "text-anchor": "end", text: "Dense Guidance" }));
    var v;
    for (v = 0.55; v < y1 + 1e-6; v += 0.05) {
      chart.appendChild(svg("line", { class: "uf-grid", x1: m.l, x2: W - m.r, y1: sy(v), y2: sy(v) }));
      chart.appendChild(svg("text", { class: "uf-tick", x: m.l - 8, y: sy(v) + 4, "text-anchor": "end", text: v.toFixed(2) }));
    }
    chart.appendChild(svg("text", { class: "uf-axis-title", x: 13, y: (sy(y0) + sy(y1)) / 2, "text-anchor": "middle",
      transform: "rotate(-90 13 " + (sy(y0) + sy(y1)) / 2 + ")", text: "Test EPE (px)" }));

    function path(from, to) {
      var d = "";
      for (var i = from; i <= to; i++) d += (i === from ? "M" : "L") + sx(i) + " " + sy(steps[i][0]);
      return d;
    }
    chart.appendChild(svg("path", { class: "uf-stair is-ghost", d: path(0, steps.length - 1) }));
    var lineA = svg("path", { class: "uf-stair is-a" });
    var lineB = svg("path", { class: "uf-stair is-b" });
    chart.appendChild(lineA);
    chart.appendChild(lineB);

    /* The blend applied on top of the guided model makes it worse. */
    var bx = sx(SPLIT) + 26, by = sy(0.662);
    var branch = svg("g", {}, [
      svg("path", { class: "uf-branch", d: "M" + sx(SPLIT) + " " + sy(0.636) + " L" + bx + " " + by }),
      svg("circle", { class: "uf-branch-dot", cx: bx, cy: by, r: 4.5 }),
      svg("text", { class: "uf-branch-label", x: bx + 9, y: by - 5, text: "Blend on top: 0.662" })
    ]);
    chart.appendChild(branch);

    var dots = steps.map(function (step, i) {
      var cx = sx(i), cy = sy(step[0]);
      var up = i > SPLIT;
      var group = svg("g", { class: "uf-step " + (i < SPLIT ? "is-a" : "is-b"), tabindex: "0", role: "button",
        "aria-label": "Step " + (i + 1) + ": " + step[1] + ", EPE " + step[0].toFixed(3) }, [
        svg("circle", { cx: cx, cy: cy, r: 6 }),
        i === 0
          ? svg("text", { x: cx + 14, y: cy + 4, "text-anchor": "start", text: step[0].toFixed(3) })
          : svg("text", { x: cx, y: cy + (up ? -13 : 22), "text-anchor": "middle", text: step[0].toFixed(3) })
      ]);
      group.addEventListener("click", function () { pinned = i; select(i); });
      group.addEventListener("pointerenter", function () { select(i); });
      group.addEventListener("focus", function () { pinned = i; select(i); });
      group.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          var next = Math.max(0, Math.min(steps.length - 1, i + (event.key === "ArrowRight" ? 1 : -1)));
          dots[next].focus();
        }
      });
      chart.appendChild(group);
      return group;
    });

    var score = el("b");
    var delta = el("span");
    var kicker = el("span", { class: "uf-kicker" });
    var title = el("b");
    var text = el("span");
    var prev = el("button", { class: "uf-icon-btn", type: "button", "aria-label": "Previous step", html: '<i class="fas fa-arrow-left" aria-hidden="true"></i>' });
    var next = el("button", { class: "uf-icon-btn", type: "button", "aria-label": "Next step", html: '<i class="fas fa-arrow-right" aria-hidden="true"></i>' });
    var card = el("div", { class: "uf-stepcard", "aria-live": "polite" }, [
      el("div", { class: "uf-stepcard-score" }, [score, delta]),
      el("div", { class: "uf-stepcard-text" }, [kicker, el("p", {}, [title, el("br"), text])]),
      el("div", { class: "uf-steps" }, [prev, next])
    ]);

    function select(i) {
      current = i;
      dots.forEach(function (dot, j) {
        dot.classList.toggle("is-active", j === i);
        dot.classList.toggle("is-future", j > i);
        dot.querySelector("circle").setAttribute("r", j === i ? 8.5 : 6);
      });
      lineA.setAttribute("d", path(0, Math.min(i, SPLIT - 1)));
      lineB.setAttribute("d", i >= SPLIT ? path(SPLIT - 1, i) : "");
      branch.style.opacity = i >= SPLIT ? 1 : 0.6;
      score.textContent = steps[i][0].toFixed(3);
      delta.textContent = i === 0 ? "start" : ((steps[i][0] / steps[0][0] - 1) * 100).toFixed(0) + "% from start";
      kicker.textContent = "Step " + (i + 1) + " of " + steps.length + (i < SPLIT ? (i === 0 ? ", events only" : ", output-level fusion") : ", dense guidance");
      title.textContent = steps[i][1];
      text.textContent = steps[i][2];
      prev.disabled = i === 0;
      next.disabled = i === steps.length - 1;
    }
    prev.addEventListener("click", function () { pinned = Math.max(0, current - 1); select(pinned); });
    next.addEventListener("click", function () { pinned = Math.min(steps.length - 1, current + 1); select(pinned); });
    chart.addEventListener("pointerleave", function () { if (current !== pinned) select(pinned); });

    root.appendChild(el("div", { class: "uf-scroll" }, [chart]));
    root.appendChild(card);
    select(current);

    /* Walk down the staircase once, the first time it is seen. */
    if (!reduceMotion) {
      onceVisible(root, function () {
        var i = 0;
        select(0);
        var timer = setInterval(function () {
          i += 1;
          select(i);
          if (i >= steps.length - 1) clearInterval(timer);
        }, 380);
        ["pointerdown", "keydown"].forEach(function (type) {
          root.addEventListener(type, function () { clearInterval(timer); }, { once: true });
        });
      });
    }
  })();

  /* ---- Robustness explorer ---------------------------------------------- */
  (function () {
    var root = document.getElementById("uf-robust");
    if (!root) return;

    /* frame: this validation frame (Fig. S4 of the supplement); set: every
       fourth validation frame (the robustness table). EPE in px. */
    var conds = [
      { key: "ref_0p0", name: "Reference", events: "675k", frame: [0.40, 0.28], set: [0.547, 0.490, 0.441], change: [null, null, null] },
      { key: "ref_0p9", name: "Events −90%", events: "68k", frame: [0.43, 0.32], set: [0.907, 0.538, 0.476], change: [66, 10, 8] },
      { key: "ref_0p95", name: "Events −95%", events: "34k", frame: [0.40, 0.52], set: [1.227, 0.564, 0.515], change: [124, 15, 17] },
      { key: "scale0p05_0p0", name: "Light ×0.05", events: "675k", frame: [1.98, 0.52], set: [null, 0.672, 0.518], change: [null, 37, 18] },
      { key: "scale0p05_0p9", name: "Light ×0.05, Events −90%", events: "68k", frame: [2.86, 0.54], set: [null, 0.803, 0.603], change: [null, 64, 37] }
    ];
    var cond = conds[0], view = "flow";
    var dir = base + "images/robust/";

    function tile(tag, ours) {
      var img = el("img", { alt: tag, loading: "lazy", width: "640", height: "480" });
      var badge = el("span", { class: "uf-tag is-right is-bottom" });
      var node = el("div", { class: "uf-tile" + (ours ? " is-ours" : "") }, [img, el("span", { class: "uf-tag" + (ours ? " is-ours" : ""), text: tag }), badge]);
      return { node: node, img: img, badge: badge };
    }
    var tFrame = tile("RGB Frame"), tEvents = tile("Events"), tGt = tile("Ground Truth");
    var tBflow = tile("BFlow (E+I)"), tOurs = tile("UltimateFlow (E+I)", true);
    tFrame.badge.remove();
    tGt.badge.remove();
    tGt.img.src = dir + "gt.webp";

    function bar(name, ours) {
      var value = el("b"), fill = el("i");
      var node = el("div", { class: "uf-rbar" + (ours ? " is-ours" : "") }, [el("span", { text: name }), value, fill]);
      return { node: node, value: value, fill: fill };
    }
    var bars = [bar("UltimateFlow (E)"), bar("BFlow (E+I)"), bar("UltimateFlow (E+I)", true)];
    var stats = el("div", { class: "uf-robust-stats" }, [
      el("span", { class: "uf-kicker", text: "Validation set, EPE (px)" }), bars[0].node, bars[1].node, bars[2].node
    ]);

    function update() {
      var suffix = view === "flow" ? "_" : "_err_";
      tFrame.img.src = dir + cond.key + "_frame.webp";
      tEvents.img.src = dir + cond.key + "_events.webp";
      tBflow.img.src = dir + cond.key + suffix + "bflow.webp";
      tOurs.img.src = dir + cond.key + suffix + "ours.webp";
      tEvents.badge.textContent = cond.events + " events";
      tBflow.badge.textContent = "EPE " + cond.frame[0].toFixed(2);
      tOurs.badge.textContent = "EPE " + cond.frame[1].toFixed(2);
      bars.forEach(function (item, i) {
        var value = cond.set[i];
        item.node.classList.toggle("is-na", value === null);
        if (value === null) {
          item.value.textContent = "reads no frames";
          item.fill.style.setProperty("--w", "0%");
        } else {
          item.value.innerHTML = value.toFixed(3) + (cond.change[i] === null ? "" : "<small>+" + cond.change[i] + "%</small>");
          item.fill.style.setProperty("--w", (100 * value / 1.25) + "%");
        }
      });
    }

    function group(items, selected, onPick, labelText) {
      var node = el("div", { class: "uf-chips", role: "group", "aria-label": labelText });
      items.forEach(function (item) {
        var chip = el("button", { class: "uf-chip", type: "button", "aria-pressed": String(item.value === selected), text: item.name });
        chip.addEventListener("click", function () {
          node.querySelectorAll(".uf-chip").forEach(function (other) { other.setAttribute("aria-pressed", String(other === chip)); });
          onPick(item.value);
          update();
        });
        node.appendChild(chip);
      });
      return node;
    }
    var condBar = group(conds.map(function (item) { return { name: item.name, value: item }; }), cond, function (value) { cond = value; }, "Degradation");
    var viewBar = group([{ name: "Flow", value: "flow" }, { name: "Error", value: "err" }], view, function (value) { view = value; }, "View");

    root.appendChild(el("div", { class: "uf-robust-bar" }, [condBar, viewBar]));
    root.appendChild(el("div", { class: "uf-robust-grid" }, [tFrame.node, tEvents.node, tGt.node, tBflow.node, tOurs.node, stats]));
    update();

    /* Fetch the other conditions once the explorer is near, so switching is instant. */
    onceVisible(root, function () {
      conds.forEach(function (item) {
        ["_frame", "_events", "_bflow", "_ours", "_err_bflow", "_err_ours"].forEach(function (part) {
          new Image().src = dir + item.key + part + ".webp";
        });
      });
    });
  })();
})();
