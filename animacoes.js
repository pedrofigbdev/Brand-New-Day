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
  }

  function preloadFrames() {
    let loaded = 0;
    return new Promise((resolve) => {
      frameFiles.forEach((src, idx) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = function () {
          loaded++;
          if (loaded === 1 && fallback) {
            fallback.style.opacity = 0;
          }
          if (loaded === frameFiles.length) {
            canvasReady = true;
            renderFrame(0);
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

  function randomOrder(length) {
    const arr = [];
    for (let i = 0; i < length; i++) arr.push(i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildSynopsisTl(charsOut, charsIn, duration, startOffset, endOffset) {
    const tl = gsap.timeline();
    const outOrder = randomOrder(charsOut.length);
    const inOrder = randomOrder(charsIn.length);

    const stepOut = duration / Math.max(1, charsOut.length);
    outOrder.forEach((idx, k) => {
      const delay = stepOut * k;
      tl.to(
        charsOut[idx],
        {
          opacity: 0,
          y: -6,
          ease: "power1.in",
          duration: 0.22,
        },
        startOffset + delay
      );
    });

    gsap.set(charsIn, { opacity: 0, y: 6 });
    const stepIn = duration / Math.max(1, charsIn.length);
    inOrder.forEach((idx, k) => {
      const delay = stepIn * k;
      tl.to(
        charsIn[idx],
        {
          opacity: 1,
          y: 0,
          ease: "power1.out",
          duration: 0.22,
        },
        endOffset + delay
      );
    });

    return tl;
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

    // Enable visibility for containers now that SplitText has processed them
    gsap.set([s1, s2, s3], { opacity: 1 });

    // Initial character opacities
    gsap.set(split1.chars, { opacity: 1 });
    gsap.set(split2.chars, { opacity: 0 });
    gsap.set(split3.chars, { opacity: 0 });

    const hero = document.querySelector(".hero");

    const master = gsap.timeline();

    // 1. Text 1 loses opacity letter by letter (random order)
    master.to(
      split1.chars,
      {
        opacity: 0,
        ease: "power1.inOut",
        duration: 0.1,
        stagger: { amount: 0.22, from: "random" },
      },
      0.05
    );

    // 2. Text 2 gains opacity letter by letter (random order)
    master.to(
      split2.chars,
      {
        opacity: 1,
        ease: "power1.inOut",
        duration: 0.1,
        stagger: { amount: 0.22, from: "random" },
      },
      0.22
    );

    // 3. Text 2 loses opacity letter by letter (random order)
    master.to(
      split2.chars,
      {
        opacity: 0,
        ease: "power1.inOut",
        duration: 0.1,
        stagger: { amount: 0.22, from: "random" },
      },
      0.52
    );

    // 4. Text 3 gains opacity letter by letter (random order)
    master.to(
      split3.chars,
      {
        opacity: 1,
        ease: "power1.inOut",
        duration: 0.1,
        stagger: { amount: 0.22, from: "random" },
      },
      0.70
    );

    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "+=300%",
      pin: true,
      anticipatePin: 1,
      scrub: 0.6,
      animation: master,
      onUpdate: (self) => {
        const p = self.progress;
        const frameIndex = gsap.utils.clamp(
          0,
          frameCount - 1,
          p * (frameCount - 1)
        );
        progressState.frame = frameIndex;
        if (canvasReady) renderFrame(frameIndex);
      },
    });

    ScrollTrigger.refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      preloadFrames().finally(initAnimations);
    });
  } else {
    preloadFrames().finally(initAnimations);
  }
})();
