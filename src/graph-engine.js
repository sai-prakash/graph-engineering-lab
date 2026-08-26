export function indexGraph(graph) {
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  const out = new Map();
  const incoming = new Map();
  for (const n of graph.nodes) {
    out.set(n.id, []);
    incoming.set(n.id, []);
  }
  for (const e of graph.edges) {
    out.get(e.from)?.push(e);
    incoming.get(e.to)?.push(e);
  }
  return { nodes, out, incoming };
}

export function tokenize(q) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

const STOP = new Set([
  "the", "and", "for", "that", "with", "this", "from", "who", "what",
  "which", "how", "does", "did", "are", "was", "were", "should", "about",
  "into", "using", "used", "than", "then", "have", "has", "our", "their",
]);

export function seedNodes(idx, question) {
  const terms = tokenize(question);
  const scored = [];
  for (const node of idx.nodes.values()) {
    const hay = `${node.id} ${node.label} ${node.text} ${node.type}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (hay.includes(t)) score += t.length > 5 ? 2 : 1;
    }
    if (score) scored.push({ id: node.id, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return { terms, seeds: scored.slice(0, 4).map((s) => s.id) };
}

/** Vector-ish: rank nodes by bag-of-words overlap only. No edges. */
export function vectorSearch(idx, question, k = 5) {
  const { terms } = seedNodes(idx, question);
  const hits = [];
  for (const node of idx.nodes.values()) {
    const hay = `${node.label} ${node.text}`.toLowerCase();
    let score = 0;
    for (const t of terms) if (hay.includes(t)) score += 1;
    if (score) hits.push({ node, score, why: "keyword overlap in this node only" });
  }
  hits.sort((a, b) => b.score - a.score);
  return { terms, hits: hits.slice(0, k) };
}

/** Graph walk: start from seed nodes, expand hops, keep path. */
export function graphWalk(idx, question, hops = 2, k = 8) {
  const { terms, seeds } = seedNodes(idx, question);
  if (!seeds.length) return { terms, seeds, hits: [] };

  const best = new Map();
  const queue = seeds.map((id) => ({ id, hop: 0, path: [id], score: 6 }));

  while (queue.length) {
    const cur = queue.shift();
    const node = idx.nodes.get(cur.id);
    if (!node) continue;
    const prev = best.get(cur.id);
    if (!prev || cur.score > prev.score) {
      best.set(cur.id, {
        node,
        score: cur.score,
        hop: cur.hop,
        path: cur.path,
        why: pathLabel(idx, cur.path),
      });
    }
    if (cur.hop >= hops) continue;
    const edges = [...(idx.out.get(cur.id) || []), ...(idx.incoming.get(cur.id) || [])];
    for (const e of edges) {
      const next = e.from === cur.id ? e.to : e.from;
      if (cur.path.includes(next)) continue;
      queue.push({
        id: next,
        hop: cur.hop + 1,
        path: [...cur.path, next],
        score: cur.score - 1 + relBonus(e.rel, terms),
      });
    }
  }

  const hits = [...best.values()]
    .sort((a, b) => b.score - a.score || a.hop - b.hop)
    .slice(0, k);
  return { terms, seeds, hits };
}

function relBonus(rel, terms) {
  const r = rel.replace("_", " ");
  return terms.some((t) => r.includes(t) || t.includes(r.split(" ")[0])) ? 1 : 0;
}

function pathLabel(idx, path) {
  if (path.length === 1) return "seed match";
  const names = path.map((id) => idx.nodes.get(id)?.label || id);
  return names.join(" → ");
}

export function neighborsOf(idx, id) {
  const out = (idx.out.get(id) || []).map((e) => ({
    dir: "out",
    rel: e.rel,
    year: e.year,
    other: idx.nodes.get(e.to),
  }));
  const incoming = (idx.incoming.get(id) || []).map((e) => ({
    dir: "in",
    rel: e.rel,
    year: e.year,
    other: idx.nodes.get(e.from),
  }));
  return [...out, ...incoming];
}

export function formatAnswer(walk) {
  if (!walk.hits.length) {
    return "No path found. Try naming a person, project, or concept that exists in the graph.";
  }
  const lines = walk.hits.slice(0, 5).map((h, i) => {
    return `${i + 1}. ${h.node.label} (${h.node.type}) — ${h.why}`;
  });
  return `Seeds: ${walk.seeds.join(", ") || "none"}\n` + lines.join("\n");
}
