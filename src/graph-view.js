import { GRAPH, LAYOUT, TYPE_COLOR } from "./data/orbit-graph.js";

export function renderGraph(svg, { selected, seeds = [], path = [] }) {
  const seedSet = new Set(seeds);
  const pathSet = new Set(path);
  const pathEdges = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    pathEdges.add(`${path[i]}|${path[i + 1]}`);
    pathEdges.add(`${path[i + 1]}|${path[i]}`);
  }

  const lines = GRAPH.edges
    .map((e) => {
      const a = LAYOUT[e.from];
      const b = LAYOUT[e.to];
      if (!a || !b) return "";
      const hot = pathEdges.has(`${e.from}|${e.to}`);
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="edge${hot ? " hot" : ""}" />`;
    })
    .join("");

  const nodes = GRAPH.nodes
    .map((n) => {
      const [x, y] = LAYOUT[n.id] || [0, 0];
      const color = TYPE_COLOR[n.type] || "#444";
      const state = [
        n.id === selected ? "sel" : "",
        seedSet.has(n.id) ? "seed" : "",
        pathSet.has(n.id) ? "onpath" : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `
        <g class="node ${state}" data-id="${n.id}" transform="translate(${x} ${y})">
          <circle r="11" fill="${color}"></circle>
          <text y="24">${escapeXml(n.label)}</text>
        </g>`;
    })
    .join("");

  svg.innerHTML = `<g class="edges">${lines}</g><g class="nodes">${nodes}</g>`;
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
