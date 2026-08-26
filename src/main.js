import "./styles.css";
import { GRAPH, TYPE_COLOR } from "./data/orbit-graph.js";
import { LESSONS, lessonText } from "./lessons.js";
import {
  indexGraph,
  neighborsOf,
  graphWalk,
  vectorSearch,
  formatAnswer,
} from "./graph-engine.js";
import { renderGraph } from "./graph-view.js";
import { createTutor, webgpuOk } from "./tutor.js";

const idx = indexGraph(GRAPH);
const tutor = createTutor();

const state = {
  lesson: 0,
  selected: "rfc12",
  mode: "graph",
  seeds: [],
  path: [],
  lastRetrieve: "",
};

const $ = (id) => document.getElementById(id);

function renderNav() {
  $("nav").innerHTML = LESSONS.map(
    (l, i) =>
      `<button type="button" data-i="${i}" class="${i === state.lesson ? "active" : ""}">
        <span class="num">${l.num}</span>${l.title}
      </button>`
  ).join("");
  $("nav").onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    state.lesson = Number(btn.dataset.i);
    renderLesson();
    renderNav();
  };
}

function renderLesson() {
  const l = LESSONS[state.lesson];
  $("title").textContent = l.title;
  $("mins").textContent = `${l.minutes} min · lesson ${l.num} / 05`;
  $("body").innerHTML = l.body;
  $("chips").innerHTML = l.prompts
    .map((p) => `<button type="button">${p}</button>`)
    .join("");
}

function renderLegend() {
  $("legend").innerHTML = Object.entries(TYPE_COLOR)
    .map(
      ([k, v]) =>
        `<span><i class="swatch" style="background:${v}"></i>${k}</span>`
    )
    .join("");
}

function paintGraph() {
  renderGraph($("svg"), {
    selected: state.selected,
    seeds: state.seeds,
    path: state.path,
  });
  $("svg").onclick = (e) => {
    const g = e.target.closest(".node");
    if (!g) return;
    state.selected = g.dataset.id;
    paintGraph();
    paintInspect();
  };
}

function paintInspect() {
  const node = idx.nodes.get(state.selected);
  if (!node) {
    $("inspect").textContent = "Click a node.";
    return;
  }
  const rels = neighborsOf(idx, node.id);
  const items = rels
    .map((r) => {
      const arrow = r.dir === "out" ? "→" : "←";
      const who = r.other?.label || "?";
      return `<li><code>${r.rel}</code> ${arrow} ${who} <span class="type">${r.year}</span></li>`;
    })
    .join("");
  $("inspect").innerHTML = `
    <div class="type">${node.type} · ${node.id}</div>
    <div class="label">${node.label}</div>
    <p>${node.text}</p>
    <ul class="edges-list">${items}</ul>
  `;
}

function runRetrieve() {
  const q = $("q").value.trim();
  if (!q) return;
  if (state.mode === "graph") {
    const walk = graphWalk(idx, q, 2, 8);
    state.seeds = walk.seeds;
    state.path = walk.hits[0]?.path || [];
    state.lastRetrieve = `GRAPH WALK\nQ: ${q}\n${formatAnswer(walk)}`;
  } else {
    const vec = vectorSearch(idx, q, 6);
    state.seeds = vec.hits.map((h) => h.node.id);
    state.path = [];
    const lines = vec.hits
      .map((h, i) => `${i + 1}. ${h.node.label} — ${h.why}`)
      .join("\n");
    state.lastRetrieve = `VECTOR-ISH\nQ: ${q}\n${lines || "no keyword hits"}`;
  }
  $("out").textContent = state.lastRetrieve;
  paintGraph();
}

function bindRetrieve() {
  $("run").onclick = runRetrieve;
  $("q").addEventListener("keydown", (e) => {
    if (e.key === "Enter") runRetrieve();
  });
  $("mode-graph").onclick = () => {
    state.mode = "graph";
    $("mode-graph").classList.add("on");
    $("mode-vec").classList.remove("on");
  };
  $("mode-vec").onclick = () => {
    state.mode = "vec";
    $("mode-vec").classList.add("on");
    $("mode-graph").classList.remove("on");
  };
}

function bindTutor() {
  const status = $("tutor-status");
  const send = $("send");
  const load = $("load");

  if (!webgpuOk()) {
    status.textContent =
      "No WebGPU here. Lessons and the graph still work. Open Chrome or Edge to load the tutor.";
    load.disabled = true;
  }

  load.onclick = async () => {
    load.disabled = true;
    status.textContent = "Starting download…";
    try {
      await tutor.load(({ pct, text }) => {
        status.textContent = text || `Loading ${pct}%`;
      });
      status.textContent = `Ready · ${tutor.model}`;
      send.disabled = false;
      load.textContent = "Loaded";
    } catch (err) {
      status.textContent = err.message || String(err);
      load.disabled = false;
    }
  };

  const ask = async (question) => {
    if (!question) return;
    if (!tutor.ready) {
      $("answer").textContent = "Load the tutor first.";
      return;
    }
    $("answer").textContent = "…";
    send.disabled = true;
    try {
      await tutor.ask({
        lesson: lessonText(LESSONS[state.lesson]),
        retrieveNote: state.lastRetrieve,
        question,
        onDelta: (full) => {
          $("answer").textContent = full;
        },
      });
    } catch (err) {
      $("answer").textContent = err.message || String(err);
    } finally {
      send.disabled = false;
    }
  };

  send.onclick = () => ask($("ask").value.trim());
  $("ask").addEventListener("keydown", (e) => {
    if (e.key === "Enter") ask($("ask").value.trim());
  });
  $("chips").onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    $("ask").value = btn.textContent;
    ask(btn.textContent);
  };
}

renderNav();
renderLesson();
renderLegend();
paintGraph();
paintInspect();
bindRetrieve();
bindTutor();
runRetrieve();
