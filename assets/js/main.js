function pageRoot() {
  return window.location.pathname.toLowerCase().includes("/pages/") ? "../" : "";
}

async function renderSharedLayout() {
  const root = pageRoot();
  const currentFile = window.location.pathname.split("/").pop().toLowerCase() || "index.html";
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  const components = [
    header && fetch(`${root}includes/header.html`),
    footer && fetch(`${root}includes/footer.html`)
  ].filter(Boolean);
  const responses = await Promise.all(components);

  for (const response of responses) {
    if (!response.ok) {
      throw new Error(`Unable to load shared layout: ${response.url} (${response.status})`);
    }
  }

  const [headerResponse, footerResponse] = await Promise.all(responses.map((response) => response.text()));
  if (header) {
    header.innerHTML = headerResponse.replaceAll("{{root}}", root);
    const activeLink = header.querySelector(`[data-page="${currentFile}"]`);
    activeLink?.classList.add("active");
    activeLink?.setAttribute("aria-current", "page");
  }
  if (footer) {
    footer.innerHTML = footerResponse.replaceAll("{{root}}", root);
    footer.querySelector("[data-current-year]").textContent = new Date().getFullYear();
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("guitarverse-theme", theme);
  const icon = document.getElementById("theme-icon");
  const button = document.getElementById("theme-toggle");
  if (icon) icon.className = `fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`;
  if (button) button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
}

function initSoloFilters() {
  const cards = [...document.querySelectorAll(".solo-item")];
  const controls = [...document.querySelectorAll("[data-filter]")];
  if (!cards.length || !controls.length) return;

  const update = (filter) => {
    let visible = 0;
    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.difficulty === filter;
      card.classList.toggle("d-none", !show);
      if (show) visible += 1;
    });
    controls.forEach((button) => {
      if (!button.classList.contains("filter-button")) return;
      const active = button.dataset.filter === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const count = document.getElementById("solo-count");
    const empty = document.getElementById("solo-empty");
    if (count) count.textContent = `${visible} ${visible === 1 ? "solo" : "solos"} found`;
    if (empty) empty.classList.toggle("d-none", visible !== 0);
  };

  controls.forEach((button) => button.addEventListener("click", () => update(button.dataset.filter)));
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.classList.add("was-validated");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const feedback = document.getElementById("contact-feedback");
    if (feedback) {
      feedback.className = "alert alert-warning";
      feedback.textContent = "Your message is ready, but this static site has no server configured to send or save it. Please email hello@guitarverse.com.";
      feedback.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

renderSharedLayout().then(() => {
  setTheme(localStorage.getItem("guitarverse-theme") || "dark");
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}).catch((error) => {
  console.error(error);
  [document.getElementById("site-header"), document.getElementById("site-footer")]
    .filter(Boolean)
    .forEach((container) => {
      container.textContent = "Shared site layout could not be loaded. Open this site through a web server.";
    });
});
initSoloFilters();
initContactForm();

document.querySelectorAll(".beat-bars").forEach((bars, cardIndex) => {
  for (let index = 0; index < 16; index += 1) {
    const bar = document.createElement("i");
    const height = 25 + ((index * 17 + cardIndex * 13) % 76);
    bar.style.height = `${height}%`;
    bars.append(bar);
  }
});

const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (navbar) navbar.classList.toggle("navbar-scrolled", window.scrollY > 40);
}, { passive: true });

// Guitar
if (document.querySelector(".guitar-demo")) {
  {
    const SHAPES = {
      C: { f: [-1, 3, 2, 0, 1, 0] },
      Dm: { f: [-1, -1, 0, 2, 3, 1] },
      Em: { f: [0, 2, 2, 0, 0, 0] },
      F: { f: [1, 3, 3, 2, 1, 1], barre: [1, 0, 5] },
      G: { f: [3, 2, 0, 0, 0, 3] },
      Am: { f: [-1, 0, 2, 2, 1, 0] },
      Bdim: { f: [-1, 2, 3, 4, 3, -1] },
      D: { f: [-1, -1, 0, 2, 3, 2] },
      "F#m": { f: [2, 4, 4, 2, 2, 2], barre: [2, 0, 5] },
      A: { f: [-1, 0, 2, 2, 2, 0] },
      Bm: { f: [-1, 2, 4, 4, 3, 2], barre: [2, 1, 5] },
      "C#dim": { f: [-1, 4, 2, 0, 2, 0] },
      E: { f: [0, 2, 2, 1, 0, 0] },
      "G#m": { f: [4, 6, 6, 4, 4, 4], barre: [4, 0, 5] },
      B: { f: [-1, 2, 4, 4, 4, 2], barre: [2, 1, 5] },
      "C#m": { f: [-1, 4, 6, 6, 5, 4], barre: [4, 1, 5] },
      "D#dim": { f: [-1, 6, 4, 2, -1, -1] },
      Gm: { f: [3, 5, 5, 3, 3, 3], barre: [3, 0, 5] },
      Bb: { f: [-1, 1, 3, 3, 3, 1], barre: [1, 1, 5] },
      Edim: { f: [-1, -1, 2, 3, -1, 3] },
      "F#dim": { f: [2, 3, 4, 2, -1, -1] },
      "G#dim": { f: [-1, -1, 6, 4, 3, -1] }
    };
    const ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
    const ROLE = ["Home", "Supertonic", "Mediant", "Subdominant", "Dominant", "Relative minor", "Leading tone"];
    const ROLE_COLOR = ["orange", "blue", "blue", "yellow", "green", "blue", "red"];
    const FAMILIES = {
      C: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
      D: ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"],
      E: ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"],
      F: ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
      G: ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
      A: ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"]
    };
    const SVG_NS = "http://www.w3.org/2000/svg";
    const X0 = 30, SX = 20, Y0 = 24, SY = 15, ROWS = 5;
    const STRING_NAMES = ["E", "A", "D", "G", "B", "e"];
    const OPEN_HZ = [82.41, 110, 146.83, 196, 246.94, 329.63];
    const keysEl = document.getElementById("keys");
    const familyEl = document.getElementById("family");
    const familySub = document.getElementById("family-sub");
    let audioContext = null;
    let masterGain = null;
    const bufferCache = {};
    let sequenceTimers = [];

    function svgElement(tag, attributes, text) {
      const element = document.createElementNS(SVG_NS, tag);
      Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
      if (text !== undefined) element.textContent = text;
      return element;
    }

    function drawDiagram(host, name, shape) {
      const fretted = shape.f.filter((fret) => fret > 0);
      const maxFret = Math.max(0, ...fretted);
      const baseFret = maxFret <= ROWS ? 1 : Math.min(...fretted);
      const width = X0 + 5 * SX + 20;
      const height = Y0 + ROWS * SY + 14;
      const svg = svgElement("svg", {
        viewBox: `0 0 ${width} ${height}`,
        role: "img",
        "aria-label": `${name} chord diagram`
      });

      for (let row = 0; row <= ROWS; row += 1) {
        if (row === 0 && baseFret === 1) continue;
        svg.append(svgElement("line", {
          class: "d-fret", x1: X0, x2: X0 + 5 * SX,
          y1: Y0 + row * SY, y2: Y0 + row * SY
        }));
      }
      if (baseFret === 1) {
        svg.append(svgElement("line", {
          class: "d-nut", x1: X0 - 1.5, x2: X0 + 5 * SX + 1.5, y1: Y0, y2: Y0
        }));
      } else {
        svg.append(svgElement("text", {
          class: "d-label", x: X0 - 9, y: Y0 + SY / 2 + 3, "text-anchor": "end"
        }, `${baseFret}fr`));
      }

      STRING_NAMES.forEach((stringName, index) => {
        const x = X0 + index * SX;
        svg.append(svgElement("line", {
          class: "d-string", "data-s": index, x1: x, x2: x, y1: Y0, y2: Y0 + ROWS * SY
        }));
        svg.append(svgElement("text", { class: "d-str", x, y: height - 3 }, stringName));
      });
      if (shape.barre) {
        const [fret, fromString, toString] = shape.barre;
        const y = Y0 + (fret - baseFret + 0.5) * SY;
        svg.append(svgElement("line", {
          class: "d-barre", x1: X0 + fromString * SX, x2: X0 + toString * SX, y1: y, y2: y
        }));
      }
      shape.f.forEach((fret, index) => {
        const x = X0 + index * SX;
        if (fret === -1) {
          const y = Y0 - 9, offset = 3;
          svg.append(svgElement("line", { class: "d-mute", x1: x - offset, x2: x + offset, y1: y - offset, y2: y + offset }));
          svg.append(svgElement("line", { class: "d-mute", x1: x - offset, x2: x + offset, y1: y + offset, y2: y - offset }));
        } else if (fret === 0) {
          svg.append(svgElement("circle", { class: "d-open", cx: x, cy: Y0 - 9, r: 3.5 }));
        } else {
          svg.append(svgElement("circle", {
            class: "d-dot", cx: x, cy: Y0 + (fret - baseFret + 0.5) * SY, r: 5
          }));
        }
      });
      host.append(svg);
    }

    function getAudioContext() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(audioContext.destination);
      }
      if (audioContext.state === "suspended") audioContext.resume();
      return audioContext;
    }

    function getPluckBuffer(frequency) {
      const key = frequency.toFixed(2);
      if (bufferCache[key]) return bufferCache[key];
      const sampleRate = audioContext.sampleRate;
      const length = Math.floor(sampleRate * 2.2);
      const period = Math.max(2, Math.round(sampleRate / frequency));
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < period; index += 1) samples[index] = Math.random() * 2 - 1;
      for (let index = period; index < length; index += 1) {
        samples[index] = 0.4975 * (samples[index - period] + samples[index - period + 1]);
      }
      bufferCache[key] = buffer;
      return buffer;
    }

    function pluck(frequency, when, volume) {
      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      source.buffer = getPluckBuffer(frequency);
      gain.gain.setValueAtTime(volume, when);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 2.1);
      source.connect(gain);
      gain.connect(masterGain);
      source.start(when);
    }

    function playChord(shape, card) {
      getAudioContext();
      const startAt = audioContext.currentTime + 0.02;
      const gap = 0.045;
      let playedStrings = 0;
      shape.f.forEach((fret, index) => {
        if (fret < 0) return;
        pluck(OPEN_HZ[index] * Math.pow(2, fret / 12), startAt + playedStrings * gap, 0.32);
        const string = card.querySelector(`.d-string[data-s="${index}"]`);
        setTimeout(() => {
          if (!string) return;
          string.classList.add("ring");
          setTimeout(() => string.classList.remove("ring"), 140);
        }, playedStrings * gap * 1000);
        playedStrings += 1;
      });
      card.classList.add("playing");
      setTimeout(() => card.classList.remove("playing"), 500 + playedStrings * gap * 1000);
    }

    function renderFamily(key) {
      familySub.textContent = `Key of ${key} major — the seven chords that belong together`;
      keysEl.querySelectorAll(".key-btn[data-key]").forEach((button) => {
        button.classList.toggle("active", button.dataset.key === key);
      });
      familyEl.replaceChildren();
      FAMILIES[key].forEach((name, index) => {
        const shape = SHAPES[name];
        const card = document.createElement("article");
        card.className = `chord-card ${ROLE_COLOR[index]}`;
        card.dataset.id = name;
        card.innerHTML = `
          <div class="card-top"><span class="roman">${ROMAN[index]}</span><span class="tag">${ROLE[index]}</span></div>
          <div class="chord-name">${name.replace("b", "♭")}</div>
          <div class="diagram"></div>
          <div class="card-bottom"><button class="play" type="button">▶ Play</button></div>`;
        drawDiagram(card.querySelector(".diagram"), name, shape);
        const play = () => playChord(shape, card);
        card.querySelector(".play").addEventListener("click", play);
        card.querySelector(".diagram").addEventListener("click", play);
        familyEl.append(card);
      });
    }

    Object.keys(FAMILIES).forEach((key) => {
      const button = document.createElement("button");
      button.className = "key-btn";
      button.dataset.key = key;
      button.type = "button";
      button.textContent = key;
      button.addEventListener("click", () => renderFamily(key));
      keysEl.append(button);
    });

    const playAll = document.createElement("button");
    playAll.className = "key-btn all";
    playAll.type = "button";
    playAll.textContent = "▶ Play family";
    playAll.addEventListener("click", () => {
      sequenceTimers.forEach(clearTimeout);
      sequenceTimers = [];
      familyEl.querySelectorAll(".chord-card").forEach((card, index) => {
        sequenceTimers.push(setTimeout(() => playChord(SHAPES[card.dataset.id], card), index * 1100));
      });
    });
    keysEl.append(playAll);
    renderFamily("C");
  }
}

// Piano
if (document.querySelector(".piano-demo")) {
  {
    const KEY_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9 };
    const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
    const QUALITY = ["maj", "min", "min", "maj", "maj", "min", "dim"];
    const TRIAD = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6] };
    const SUFFIX = { maj: "", min: "m", dim: "dim" };
    const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const FLAT = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
    const ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
    const ROLE = ["Home", "Supertonic", "Mediant", "Subdominant", "Dominant", "Relative minor", "Leading tone"];
    const ROLE_COLOR = ["orange", "blue", "blue", "yellow", "green", "blue", "red"];
    const SVG_NS = "http://www.w3.org/2000/svg";
    const WK = 10, WH = 56, BW = 6, BH = 34;
    const WHITE_IDX = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
    const BLACK_PREV = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 };
    const keysEl = document.getElementById("keys");
    const familyEl = document.getElementById("family");
    const familySub = document.getElementById("family-sub");
    let audioContext = null;
    let masterGain = null;
    let family = [];
    let sequenceTimers = [];

    function buildFamily(key) {
      const names = key === "F" ? FLAT : SHARP;
      return QUALITY.map((quality, index) => {
        const root = 60 + ((KEY_PC[key] + MAJOR_STEPS[index]) % 12);
        const midi = TRIAD[quality].map((step) => root + step);
        return {
          label: names[root % 12] + SUFFIX[quality],
          midi,
          noteNames: midi.map((note) => names[note % 12])
        };
      });
    }

    function svgElement(tag, attributes, text) {
      const element = document.createElementNS(SVG_NS, tag);
      Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
      if (text !== undefined) element.textContent = text;
      return element;
    }

    function drawKeyboard(host, chord) {
      const svg = svgElement("svg", {
        viewBox: `0 0 ${14 * WK} ${WH + 1}`,
        role: "img",
        "aria-label": `${chord.label} on piano`
      });
      const pressed = new Set(chord.midi);
      for (let note = 0; note < 24; note += 1) {
        const pitch = note % 12;
        const octave = Math.floor(note / 12);
        if (!(pitch in WHITE_IDX)) continue;
        const x = (octave * 7 + WHITE_IDX[pitch]) * WK;
        const midi = 60 + note;
        svg.append(svgElement("rect", {
          class: `w${pressed.has(midi) ? " on" : ""}`,
          "data-m": midi, x, y: 0, width: WK, height: WH, rx: 1.2
        }));
        if (pitch === 0) {
          svg.append(svgElement("text", { class: "c-label", x: x + WK / 2, y: WH - 4 }, `C${4 + octave}`));
        }
      }
      for (let note = 0; note < 24; note += 1) {
        const pitch = note % 12;
        const octave = Math.floor(note / 12);
        if (!(pitch in BLACK_PREV)) continue;
        const x = (octave * 7 + BLACK_PREV[pitch] + 1) * WK - BW / 2;
        const midi = 60 + note;
        svg.append(svgElement("rect", {
          class: `b${pressed.has(midi) ? " on" : ""}`,
          "data-m": midi, x, y: 0, width: BW, height: BH, rx: 1
        }));
      }
      host.append(svg);
    }

    function getAudioContext() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 3800;
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.35;
        masterGain.connect(filter);
        filter.connect(audioContext.destination);
      }
      if (audioContext.state === "suspended") audioContext.resume();
      return audioContext;
    }

    function playNote(midi, when) {
      const frequency = 440 * Math.pow(2, (midi - 69) / 12);
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(0.5, when + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.18, when + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 2.4);
      gain.connect(masterGain);
      [[1, 1], [2, 0.45], [3, 0.22], [4, 0.1]].forEach(([multiple, volume]) => {
        const oscillator = audioContext.createOscillator();
        const harmonicGain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency * multiple;
        harmonicGain.gain.value = volume;
        oscillator.connect(harmonicGain);
        harmonicGain.connect(gain);
        oscillator.start(when);
        oscillator.stop(when + 2.5);
      });
    }

    function playChord(chord, card) {
      getAudioContext();
      const startAt = audioContext.currentTime + 0.02;
      chord.midi.forEach((note, index) => playNote(note, startAt + index * 0.025));
      card.querySelectorAll(".on").forEach((key) => {
        key.classList.add("hit");
        setTimeout(() => key.classList.remove("hit"), 220);
      });
      card.classList.add("playing");
      setTimeout(() => card.classList.remove("playing"), 700);
    }

    function renderFamily(key) {
      familySub.textContent = `Key of ${key} major — the seven chords that belong together`;
      keysEl.querySelectorAll(".key-btn[data-key]").forEach((button) => {
        button.classList.toggle("active", button.dataset.key === key);
      });
      familyEl.replaceChildren();
      family = buildFamily(key);
      family.forEach((chord, index) => {
        const card = document.createElement("article");
        card.className = `chord-card ${ROLE_COLOR[index]}`;
        card.innerHTML = `
          <div class="card-top"><span class="roman">${ROMAN[index]}</span><span class="tag">${ROLE[index]}</span></div>
          <div class="chord-name">${chord.label}</div>
          <div class="diagram"></div>
          <div class="card-bottom"><span class="notes">${chord.noteNames.join(" · ")}</span><button class="play" type="button">▶ Play</button></div>`;
        drawKeyboard(card.querySelector(".diagram"), chord);
        const play = () => playChord(chord, card);
        card.querySelector(".play").addEventListener("click", play);
        card.querySelector(".diagram").addEventListener("click", play);
        familyEl.append(card);
      });
    }

    Object.keys(KEY_PC).forEach((key) => {
      const button = document.createElement("button");
      button.className = "key-btn";
      button.dataset.key = key;
      button.type = "button";
      button.textContent = key;
      button.addEventListener("click", () => renderFamily(key));
      keysEl.append(button);
    });

    const playAll = document.createElement("button");
    playAll.className = "key-btn all";
    playAll.type = "button";
    playAll.textContent = "▶ Play family";
    playAll.addEventListener("click", () => {
      sequenceTimers.forEach(clearTimeout);
      sequenceTimers = [];
      familyEl.querySelectorAll(".chord-card").forEach((card, index) => {
        sequenceTimers.push(setTimeout(() => playChord(family[index], card), index * 1000));
      });
    });
    keysEl.append(playAll);
    renderFamily("C");
  }
}

// Drum
if (document.querySelector(".drum-demo")) {
  {
    const PATTERNS = [
      { n: "I", t: "GROOVE", name: "Basic Rock", c: "#d9784a", HH: "x.x.x.x.x.x.x.x.", SD: "....x.......x...", TM: "................", BD: "x.......x.......", d: "Kick 1 & 3, snare 2 & 4" },
      { n: "II", t: "DISCO", name: "Four on the Floor", c: "#6f9fd8", HH: "..x...x...x...x.", SD: "....x.......x...", TM: "................", BD: "x...x...x...x...", d: "Kick every beat, off-beat hats" },
      { n: "III", t: "HALF-TIME", name: "Half-Time", c: "#6f9fd8", HH: "x.x.x.x.x.x.x.x.", SD: "........x.......", TM: "................", BD: "x.........x.....", d: "Snare only on beat 3" },
      { n: "IV", t: "DRIVING", name: "16th Hats", c: "#d6b655", HH: "xxxxxxxxxxxxxxxx", SD: "....x.......x...", TM: "................", BD: "x.....x...x.....", d: "Busy hats, syncopated kick" },
      { n: "V", t: "FUNK", name: "Funk Groove", c: "#7fc58a", HH: "xxxxxxxxxxxxxxxx", SD: "....x..x.x..x...", TM: "................", BD: "x..x..x...x..x..", d: "Ghost notes & syncopation" },
      { n: "VI", t: "HIP-HOP", name: "Boom Bap", c: "#6f9fd8", HH: "x.x.x.x.x.x.x.x.", SD: "....x.......x...", TM: "................", BD: "x.....x.x.......", d: "Laid-back kick pattern" },
      { n: "VII", t: "FILL", name: "Tom Fill", c: "#d96f6f", HH: "................", SD: "x.x.x.x.........", TM: "........xx.xx.xx", BD: "x...............", d: "Turnaround for the last bar" }
    ];
    const ROWS = [["HH", "HH"], ["SD", "SD"], ["TM", "TOM"], ["BD", "BD"]];
    const grid = document.getElementById("grid");
    const tempoButtons = document.getElementById("bpms");
    const subtitle = document.getElementById("sub");
    let bpm = 120;
    let audioContext = null;
    let timer = null;
    let playback = null;

    PATTERNS.forEach((pattern, patternIndex) => {
      const card = document.createElement("article");
      card.className = "card";
      card.style.setProperty("--c", pattern.c);
      let content = `<div class="top"><span class="num">${pattern.n}</span><span class="tag">${pattern.t}</span></div><div class="name">${pattern.name}</div><div class="seq">`;
      ROWS.forEach(([key, label]) => {
        content += `<div class="row"><span class="l">${label}</span>`;
        for (let step = 0; step < 16; step += 1) {
          const active = pattern[key][step] === "x";
          const beat = step % 4 === 0;
          content += `<div class="s${active ? " on" : beat ? " b4" : ""}" data-i="${patternIndex}" data-s="${step}"></div>`;
        }
        content += "</div>";
      });
      content += `</div><div class="foot"><small>${pattern.d}</small><button class="play" type="button" data-p="${patternIndex}">▶ PLAY</button></div>`;
      card.innerHTML = content;
      grid.append(card);
      pattern.element = card;
    });

    [80, 100, 120, 140, 160].forEach((tempo) => {
      const button = document.createElement("button");
      button.className = `chip${tempo === bpm ? " on" : ""}`;
      button.type = "button";
      button.textContent = tempo;
      button.addEventListener("click", () => {
        bpm = tempo;
        tempoButtons.querySelectorAll(".chip").forEach((item) => item.classList.toggle("on", item === button));
        subtitle.textContent = `${tempo} BPM — the seven grooves every drummer should know`;
      });
      tempoButtons.append(button);
    });

    function drumHit(kind, when) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      function noise(duration, highpass, volume) {
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1;
        const source = audioContext.createBufferSource();
        const filter = audioContext.createBiquadFilter();
        const noiseGain = audioContext.createGain();
        source.buffer = buffer;
        filter.type = "highpass";
        filter.frequency.value = highpass;
        noiseGain.gain.setValueAtTime(volume, when);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, when + duration);
        source.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        source.start(when);
      }

      if (kind === "BD") {
        oscillator.frequency.setValueAtTime(150, when);
        oscillator.frequency.exponentialRampToValueAtTime(40, when + 0.12);
        gain.gain.setValueAtTime(1, when);
        gain.gain.exponentialRampToValueAtTime(0.001, when + 0.3);
        oscillator.start(when);
        oscillator.stop(when + 0.3);
      } else if (kind === "TM") {
        oscillator.frequency.setValueAtTime(220, when);
        oscillator.frequency.exponentialRampToValueAtTime(110, when + 0.15);
        gain.gain.setValueAtTime(0.8, when);
        gain.gain.exponentialRampToValueAtTime(0.001, when + 0.25);
        oscillator.start(when);
        oscillator.stop(when + 0.25);
      } else if (kind === "SD") {
        oscillator.type = "triangle";
        oscillator.frequency.value = 190;
        gain.gain.setValueAtTime(0.5, when);
        gain.gain.exponentialRampToValueAtTime(0.001, when + 0.12);
        oscillator.start(when);
        oscillator.stop(when + 0.12);
        noise(0.18, 1500, 0.6);
      } else {
        noise(0.05, 7000, 0.35);
      }
    }

    function stopPlayback() {
      clearInterval(timer);
      playback = null;
      grid.querySelectorAll(".cur").forEach((cell) => cell.classList.remove("cur"));
      PATTERNS.forEach((pattern) => pattern.element.classList.remove("act"));
    }

    function startPlayback(patternIndexes) {
      if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      if (playback) {
        const samePattern = patternIndexes.length === 1 && playback.list.length === 1 && playback.list[0] === patternIndexes[0];
        stopPlayback();
        if (samePattern) return;
      }
      const sequence = patternIndexes.flatMap((index) => [index, index]);
      playback = { list: patternIndexes, sequence, step: 0, next: audioContext.currentTime + 0.08 };
      const currentPlayback = playback;
      timer = setInterval(() => {
        while (currentPlayback.next < audioContext.currentTime + 0.12) {
          const bar = Math.floor(currentPlayback.step / 16);
          const step = currentPlayback.step % 16;
          if (bar >= sequence.length) {
            if (currentPlayback.next < audioContext.currentTime) stopPlayback();
            return;
          }
          const patternIndex = sequence[bar];
          const pattern = PATTERNS[patternIndex];
          const when = currentPlayback.next;
          ROWS.forEach(([key]) => {
            if (pattern[key][step] === "x") drumHit(key, when);
          });
          const delay = Math.max(0, (when - audioContext.currentTime) * 1000);
          setTimeout(() => {
            if (playback !== currentPlayback) return;
            grid.querySelectorAll(".cur").forEach((cell) => cell.classList.remove("cur"));
            PATTERNS.forEach((item, index) => item.element.classList.toggle("act", index === patternIndex));
            grid.querySelectorAll(`[data-i="${patternIndex}"][data-s="${step}"]`).forEach((cell) => cell.classList.add("cur"));
          }, delay);
          currentPlayback.next += 60 / bpm / 4;
          currentPlayback.step += 1;
        }
      }, 25);
    }

    const playAll = document.createElement("button");
    playAll.className = "fam";
    playAll.type = "button";
    playAll.textContent = "▶ Play family";
    playAll.addEventListener("click", () => startPlayback([0, 1, 2, 3, 4, 5, 6]));
    tempoButtons.append(playAll);
    grid.addEventListener("click", (event) => {
      const button = event.target.closest(".play");
      if (button) startPlayback([Number(button.dataset.p)]);
    });
  }
}
