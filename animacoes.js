/* eslint-disable */
(function () {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  const smoother = ScrollSmoother.create({
    smooth: 1.1,
    effects: true,
    smoothTouch: 0.1,
    normalizeScroll: true,
  });

  const frameCount = 59;
  const frameFiles = [];
  for (let i = 1; i <= frameCount; i++) {
    const n = String(i).padStart(3, "0");
    frameFiles.push(`./assets/frames/ezgif-frame-${n}.jpg`);
  }

  const canvas = document.getElementById("stageCanvas");
  const fallback = document.querySelector(".spiderman-bg-fallback");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const images = [];
  let canvasReady = false;
  const progressState = { frame: 0 };

  function setCanvasSize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }
  }

  function renderFrame(index) {
    if (!ctx || !canvas || images.length === 0) return;
    const i = Math.max(0, Math.min(images.length - 1, Math.round(index)));
    const img = images[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
    if (fallback && cw > 0 && ch > 0) fallback.style.opacity = 0;
  }

  function preloadFrames() {
    let loaded = 0;
    return new Promise((resolve) => {
      frameFiles.forEach((src, idx) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = function () {
          loaded++;
          if (loaded === frameFiles.length) {
            canvasReady = true;
            resolve();
          }
        };
        img.onerror = function () {
          loaded++;
          if (loaded === frameFiles.length) {
            canvasReady = true;
            resolve();
          }
        };
        img.src = src;
        images[idx] = img;
      });
    });
  }

  function setupTrailerPlayer() {
    const video = document.getElementById("trailerVideo");
    const playBtn = document.getElementById("trailerPlayBtn");
    const player = document.getElementById("trailerPlayer");
    const playPause = document.getElementById("playerPlayPause");
    const muteBtn = document.getElementById("playerMute");
    const fullBtn = document.getElementById("playerFull");
    const seekTrack = document.querySelector(".player-seek-track");
    const seekProgress = document.getElementById("playerSeekProgress");
    const seekThumb = document.getElementById("playerSeekThumb");
    const timeLabel = document.getElementById("playerTime");
    const reveal = document.getElementById("trailerReveal");
    const overlay = document.querySelector(".trailer-overlay");
    if (!video) return;
    let available = false;
    let watching = false;
    player.inert = true;
    playBtn.disabled = true;

    function updateAvailability(ready, inView = true) {
      available = ready && inView;
      if (!available && watching) {
        watching = false;
        video.muted = true;
        video.loop = true;
        overlay.style.opacity = "";
      }
      reveal.classList.toggle("is-active", available);
      reveal.classList.toggle("is-playing", watching);
      playBtn.classList.toggle("is-visible", available && !watching);
      playBtn.disabled = !available || watching;
      player.classList.toggle("is-visible", available && watching);
      player.inert = !available || !watching;
      player.setAttribute("aria-hidden", String(player.inert));
      if (!inView) video.pause();
      else if (!watching && video.paused) video.play().catch(() => {});
    }

    function fmt(sec) {
      if (!isFinite(sec) || sec < 0) sec = 0;
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    function setPlayPauseIcon(playing) {
      if (!playPause) return;
      if (playing) {
        playPause.setAttribute("aria-label", "Pausar");
        playPause.innerHTML =
          '<svg viewBox="0 0 24 24" class="player-icon"><rect x="6" y="5" width="4" height="14" fill="#fff"/><rect x="14" y="5" width="4" height="14" fill="#fff"/></svg>';
      } else {
        playPause.setAttribute("aria-label", "Reproduzir");
        playPause.innerHTML =
          '<svg viewBox="0 0 24 24" class="player-icon"><polygon points="6,4 20,12 6,20" fill="#fff"/></svg>';
      }
    }

    function setMuteIcon(muted) {
      if (!muteBtn) return;
      if (muted) {
        muteBtn.setAttribute("aria-label", "Ativar som");
        muteBtn.innerHTML =
          '<svg viewBox="0 0 24 24" class="player-icon"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z" fill="#fff"/></svg>';
      } else {
        muteBtn.setAttribute("aria-label", "Silenciar");
        muteBtn.innerHTML =
          '<svg viewBox="0 0 24 24" class="player-icon"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23zM19 12a6.98 6.98 0 0 0-.57-2.7L20.5 7.23A8.97 8.97 0 0 1 21 12c0 2.12-.74 4.07-2 5.65l-1.93-1.93A6.98 6.98 0 0 0 19 12z" fill="#fff"/><path d="M17 12a4.9 4.9 0 0 0-.41-1.94L18.1 8.55A7 7 0 0 1 19 12c0 1.6-.57 3.07-1.5 4.25L15.6 14.1A4.9 4.9 0 0 0 17 12z" fill="#fff" opacity="0"/></svg>';
      }
    }

    function updateSeekUI() {
      if (
        !video ||
        !isFinite(video.duration) ||
        !seekProgress ||
        !seekThumb ||
        !timeLabel
      )
        return;
      const p = Math.max(
        0,
        Math.min(1, video.currentTime / video.duration || 0),
      );
      seekProgress.style.width = `${p * 100}%`;
      seekThumb.style.left = `${p * 100}%`;
      timeLabel.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
      seekTrack.setAttribute("aria-valuenow", String(Math.round(p * 100)));
      seekTrack.setAttribute("aria-valuetext", timeLabel.textContent);
    }

    try {
      const autoplay = video.play();
      if (autoplay && typeof autoplay.catch === "function") {
        autoplay.catch(() => {
          /* ignore - will play via user interaction */
        });
      }
    } catch (e) {
      /* noop */
    }

    setPlayPauseIcon(!video.paused);
    setMuteIcon(Boolean(video.muted));

    video.addEventListener("loadedmetadata", updateSeekUI);
    video.addEventListener("timeupdate", updateSeekUI);
    video.addEventListener("play", () => setPlayPauseIcon(true));
    video.addEventListener("pause", () => setPlayPauseIcon(false));
    video.addEventListener("volumechange", () =>
      setMuteIcon(video.muted || video.volume === 0),
    );

    if (playBtn) {
      playBtn.addEventListener("click", async () => {
        if (!available) return;
        watching = true;
        video.loop = false;
        video.muted = false;
        video.currentTime = 0;
        if (video.volume === 0) video.volume = 0.8;
        updateAvailability(true);
        try {
          await video.play();
          if (watching && available) {
            overlay.style.opacity = 0;
            playPause.focus({ preventScroll: true });
          }
        } catch (error) {
          watching = false;
          video.muted = true;
          video.loop = true;
          updateAvailability(available);
        }
      });
    }

    if (playPause) {
      playPause.addEventListener("click", () => {
        if (video.paused) {
          const p = video.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } else {
          video.pause();
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        video.muted = !video.muted;
        if (!video.muted && video.volume === 0) video.volume = 0.8;
      });
    }

    if (fullBtn) {
      fullBtn.addEventListener("click", () => {
        if (!reveal) return;
        if (!document.fullscreenElement) {
          const req =
            reveal.requestFullscreen || reveal.webkitRequestFullscreen;
          if (req) {
            const r = req.call(reveal);
            if (r && typeof r.catch === "function") r.catch(() => {});
          }
        } else {
          const exit = document.exitFullscreen || document.webkitExitFullscreen;
          if (exit) {
            const r = exit.call(document);
            if (r && typeof r.catch === "function") r.catch(() => {});
          }
        }
      });
    }

    function seekFromEvent(evt) {
      if (!seekTrack || !video || !isFinite(video.duration)) return;
      const rect = seekTrack.getBoundingClientRect();
      let x = 0;
      if (evt.touches && evt.touches.length)
        x = evt.touches[0].clientX - rect.left;
      else x = (evt.clientX || rect.left) - rect.left;
      const ratio = gsap.utils.clamp(0, 1, x / rect.width);
      video.currentTime = ratio * video.duration;
      updateSeekUI();
    }

    if (seekTrack) {
      seekTrack.setAttribute("role", "slider");
      seekTrack.setAttribute("aria-label", "Posicao do trailer");
      seekTrack.setAttribute("aria-valuemin", "0");
      seekTrack.setAttribute("aria-valuemax", "100");
      seekTrack.setAttribute("aria-valuenow", "0");
      seekTrack.tabIndex = 0;
      seekTrack.addEventListener("keydown", (event) => {
        if (!Number.isFinite(video.duration)) return;
        const times = {
          ArrowLeft: video.currentTime - 5,
          ArrowRight: video.currentTime + 5,
          Home: 0,
          End: video.duration,
        };
        if (!(event.key in times)) return;
        event.preventDefault();
        video.currentTime = gsap.utils.clamp(
          0,
          video.duration,
          times[event.key],
        );
        updateSeekUI();
      });
      let dragging = false;
      seekTrack.addEventListener("mousedown", (e) => {
        dragging = true;
        seekFromEvent(e);
      });
      seekTrack.addEventListener(
        "touchstart",
        (e) => {
          dragging = true;
          seekFromEvent(e);
        },
        { passive: true },
      );
      window.addEventListener("mousemove", (e) => {
        if (dragging) seekFromEvent(e);
      });
      window.addEventListener(
        "touchmove",
        (e) => {
          if (dragging) seekFromEvent(e);
        },
        { passive: true },
      );
      window.addEventListener("mouseup", () => {
        dragging = false;
      });
      window.addEventListener("touchend", () => {
        dragging = false;
      });
    }
    return updateAvailability;
  }

  function initCastAnimations() {
    const section = document.querySelector("#elenco");
    const slides = gsap.utils.toArray(".cast__slide", section);
    if (!section || slides.length === 0) return;

    const media = section.querySelector(".cast__media");
    const person = section.querySelector(".cast__person");
    const picker = section.querySelector(".cast__picker");
    const options = section.querySelector(".cast__options");
    const rail = section.querySelector(".cast__rail");
    const fill = section.querySelector(".cast__progress");
    const spider = section.querySelector(".cast__spider");
    const state = { actor: 0 };
    const people = [];
    const buttons = [];
    const stops = [];
    let selected = -1;
    let travel = 0;
    let castTrigger;
    const revealDuration = 1.2;
    const holdSeconds = 0.3;
    const forwardStops = [];
    const backwardStops = [];
    let lastTime = 0;
    let holding = false;
    let holdTimer;
    let navigationUntil = 0;

    function releaseHold() {
      if (holdTimer) holdTimer.kill();
      holdTimer = null;
      if (!holding) return;
      holding = false;
      smoother.paused(false);
    }

    function holdAt(time) {
      if (holding || smoother.paused()) return;
      holding = true;
      lastTime = time;
      const position =
        castTrigger.start +
        ((castTrigger.end - castTrigger.start) * time) / timeline.duration();
      // Discard excess wheel momentum at a fully revealed image.
      smoother.scrollTop(position);
      castTrigger.getTween()?.pause();
      timeline.time(time, true);
      renderCast();
      smoother.paused(true);
      holdTimer = gsap.delayedCall(holdSeconds, releaseHold);
    }

    function updateCast() {
      if (!holding && castTrigger) {
        const time = timeline.time();
        if (performance.now() >= navigationUntil) {
          const forward = time > lastTime;
          const boundary = (forward ? forwardStops : backwardStops).find(
            (stop) =>
              forward
                ? stop > lastTime + 0.001 && stop <= time
                : stop < lastTime - 0.001 && stop >= time,
          );
          if (boundary !== undefined) {
            holdAt(boundary);
            return;
          }
        }
        lastTime = time;
      }
      renderCast();
    }

    person.replaceChildren();
    slides.forEach((slide, index) => {
      const item = document.createElement("div");
      item.className = "cast__person-item";
      const name = document.createElement("h3");
      name.textContent = slide.dataset.name;
      const role = document.createElement("p");
      role.textContent = slide.dataset.role;
      item.append(name, role);
      person.append(item);
      people.push(item);
      slide.querySelector("img").alt = slide.dataset.name;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "cast__option";
      button.textContent = slide.dataset.name;
      button.addEventListener("click", () => {
        releaseHold();
        // Direct selection should not stop at every intermediate actor.
        navigationUntil = performance.now() + 2500;
        const progress = stops[index] / timeline.duration();
        smoother.scrollTo(
          castTrigger.start + (castTrigger.end - castTrigger.start) * progress,
          true,
        );
      });
      options.append(button);
      buttons.push(button);
    });

    function renderCast() {
      const progress =
        slides.length > 1 ? state.actor / (slides.length - 1) : 0;
      gsap.set(fill, { scaleY: progress });
      gsap.set(spider, { y: progress * travel });
      const current = Math.round(state.actor);
      if (current === selected) return;
      selected = current;
      slides.forEach((slide, index) => {
        const active = index === current;
        slide.setAttribute("aria-hidden", String(!active));
        people[index].setAttribute("aria-hidden", String(!active));
        buttons[index].classList.toggle("is-active", active);
        if (active) buttons[index].setAttribute("aria-current", "true");
        else buttons[index].removeAttribute("aria-current");
      });
    }

    function measureCast() {
      // Images keep a fixed full-stage height while their wrappers reveal them.
      media.style.setProperty("--cast-image-height", `${media.clientHeight}px`);
      const box = picker.getBoundingClientRect();
      const first = buttons[0].getBoundingClientRect();
      const last = buttons[buttons.length - 1].getBoundingClientRect();
      travel = last.top + last.height / 2 - first.top - first.height / 2;
      rail.style.setProperty(
        "--cast-rail-top",
        `${first.top + first.height / 2 - box.top}px`,
      );
      rail.style.setProperty("--cast-rail-height", `${travel}px`);
      renderCast();
    }

    gsap.set(people.slice(1), { autoAlpha: 0 });
    const timeline = gsap.timeline({ paused: true, onUpdate: updateCast });
    stops.push(0.2);
    slides.slice(1).forEach((slide, offset) => {
      const index = offset + 1;
      const start = 0.6 + offset * (revealDuration + 0.55);
      forwardStops.push(start + revealDuration);
      backwardStops.unshift(start);
      timeline.to(
        slide,
        { height: "100%", duration: revealDuration, ease: "none" },
        start,
      );
      timeline.to(
        state,
        { actor: index, duration: revealDuration, ease: "none" },
        start,
      );
      timeline.to(
        people[index - 1],
        { autoAlpha: 0, duration: 0.25 },
        start + 0.35,
      );
      timeline.to(people[index], { autoAlpha: 1, duration: 0.25 }, start + 0.6);
      stops.push(start + revealDuration + 0.2);
    });
    timeline.to({}, { duration: 0.55 });
    measureCast();

    // Created after the hero trigger so its pin spacing is included in start.
    castTrigger = ScrollTrigger.create({
      id: "cast-story",
      trigger: section,
      start: "top top",
      end: () =>
        `+=${window.innerHeight * Math.max(1, slides.length - 1) * 1.5}`,
      pin: true,
      anticipatePin: 1,
      scrub: 0.55,
      animation: timeline,
      onRefreshInit: releaseHold,
      onRefresh: measureCast,
    });

    document
      .querySelector('.header-right a[href="#elenco"]')
      .addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        smoother.scrollTo(castTrigger.start + 1, true);
      });
  }

  function initAnimations() {
    if (canvas) {
      setCanvasSize();
      window.addEventListener("resize", () => {
        setCanvasSize();
        renderFrame(progressState.frame);
      });
    }

    const s1 = document.querySelector(".synopsis--1");
    const s2 = document.querySelector(".synopsis--2");
    const s3 = document.querySelector(".synopsis--3");
    const split1 = new SplitText(s1, { type: "chars", charsClass: "synchar" });
    const split2 = new SplitText(s2, { type: "chars", charsClass: "synchar" });
    const split3 = new SplitText(s3, { type: "chars", charsClass: "synchar" });

    gsap.set([s1, s2, s3], { opacity: 1 });
    gsap.set(split1.chars, { opacity: 1 });
    gsap.set(split2.chars, { opacity: 0 });
    gsap.set(split3.chars, { opacity: 0 });

    const hero = document.querySelector(".hero");
    const reveal = document.getElementById("trailerReveal");
    const movie = document.querySelector(".movie");
    const movieImg = document.querySelector(".movie-left");
    const movieTxt = document.querySelector(".movie-right");
    const updatePlayer = setupTrailerPlayer();
    const opening = { width: 0, height: 0 };
    const bounds = {};
    const pushLeft = gsap.quickSetter(movieImg, "x", "px");
    const pushRight = gsap.quickSetter(movieTxt, "x", "px");
    let trigger;
    let lastFrame = -1;
    let lastPlayerState = "";

    function measure() {
      const rect = hero.getBoundingClientRect();
      const left = movieImg.getBoundingClientRect();
      const right = movieTxt.getBoundingClientRect();
      bounds.width = rect.width;
      bounds.height = Math.min(rect.height, window.innerHeight);
      // Remove only the animated translation, retaining the responsive layout.
      bounds.leftEdge =
        left.right - rect.left - Number(gsap.getProperty(movieImg, "x"));
      bounds.rightEdge =
        right.left - rect.left - Number(gsap.getProperty(movieTxt, "x"));
      hero.style.setProperty("--trailer-width", `${bounds.width}px`);
      hero.style.setProperty("--trailer-height", `${bounds.height}px`);
      reveal.style.top = `${bounds.height / 2}px`;
      movie.style.top = `${bounds.height / 2}px`;
    }

    function render() {
      const width = opening.width * bounds.width;
      reveal.style.width = `${width}px`;
      reveal.style.height = `${opening.height * bounds.height}px`;
      // Each panel follows the mask edge only after contact; no early fade-out.
      const edgeLeft = (bounds.width - width) / 2;
      const edgeRight = (bounds.width + width) / 2;
      pushLeft(
        opening.width > 0 ? -Math.max(0, bounds.leftEdge - edgeLeft) : 0,
      );
      pushRight(
        opening.width > 0 ? Math.max(0, edgeRight - bounds.rightEdge) : 0,
      );
      const frame = Math.round(progressState.frame);
      if (canvasReady && frame !== lastFrame) {
        renderFrame(frame);
        lastFrame = frame;
      }
      const ready = opening.width >= 0.9999 && opening.height >= 0.9999;
      const inView = !trigger || trigger.scroll() < trigger.end;
      const state = `${ready}:${inView}`;
      if (state !== lastPlayerState) {
        updatePlayer(ready, inView);
        lastPlayerState = state;
      }
    }

    gsap.set([movieImg, movieTxt], { x: 0 });
    measure();
    const master = gsap.timeline({ paused: true, onUpdate: render });
    const fade = (opacity) => ({
      opacity,
      duration: 0.25,
      stagger: { amount: 0.6, from: "random" },
      ease: "power1.inOut",
    });

    // Frames and letters share the same scrubbed timeline, including reverse.
    master.to(
      progressState,
      { frame: frameCount - 1, duration: 3, ease: "none" },
      0,
    );
    master.to(split1.chars, fade(0), 0);
    master.to(split2.chars, fade(1), 0.8);
    master.to(split2.chars, fade(0), 1.7);
    master.to(split3.chars, fade(1), 2.15);
    master.to(
      ".logo-section, .synopsis-wrap, .header, .release-date, .scroll-circle, .side-icon",
      { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" },
      3.15,
    );
    master.to(
      movie,
      { autoAlpha: 1, duration: 0.35, ease: "power1.inOut" },
      3.3,
    );
    master.to(opening, { width: 1, duration: 2.2, ease: "power2.inOut" }, 3.8);
    master.to(opening, { height: 1, duration: 2.2, ease: "power2.out" }, 3.8);
    // Keep the hero pinned briefly after the mask opens so play is reachable.
    master.to({}, { duration: 0.65 }, 6);
    master.addLabel("trailerReady", 6.25);

    trigger = ScrollTrigger.create({
      id: "hero-story",
      trigger: hero,
      start: "top top",
      end: () => `+=${window.innerHeight * 6.65}`,
      pin: true,
      anticipatePin: 1,
      scrub: 0.55,
      animation: master,
      onRefresh: () => {
        measure();
        setCanvasSize();
        lastFrame = -1;
        render();
      },
      onUpdate: render,
    });

    document
      .querySelector(".header-right .trailer-text")
      .addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        const progress = master.labels.trailerReady / master.duration();
        const destination =
          trigger.start + (trigger.end - trigger.start) * progress;
        smoother.scrollTo(destination, true);
      });

    initCastAnimations();
    ScrollTrigger.refresh();
  }

  function start() {
    Promise.all([preloadFrames(), document.fonts.ready]).then(initAnimations);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
