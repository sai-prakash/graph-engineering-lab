# Graph Engineering Lab

A browser lab that turns the 2026 “graph engineering” discourse into five short lessons and one toy graph you can actually walk.

Live (after Pages is enabled):
**https://sai-prakash.github.io/graph-engineering-lab/**

This is a learning artifact, not a production GraphRAG stack. No backend. Optional on-device tutor via [WebLLM](https://github.com/mlc-ai/web-llm).

## What you can do in 60 seconds

1. Open the live page (Chrome or Edge).
2. Click `RFC-12` and read its edges.
3. Run the default question in **Graph walk**, then switch to **Vector-ish**.
4. Notice the walk reaches Leo, Priya, and Ravi — the path is the point.
5. Optionally load the local tutor. First load downloads a small model and caches it.

## Lessons

1. Why agents fail without structure
2. Two graphs people keep mixing up (knowledge vs control)
3. Nodes, edges, provenance
4. Graph walk vs vector search
5. Ask a multi-hop question

The dataset is **Orbit Labs**: 22 nodes, 34 typed edges with a year standing in for provenance.

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Deploy

### GitHub Pages

This repo includes `.github/workflows/pages.yml`.

1. Push to `main`
2. Repo **Settings → Pages → Source: GitHub Actions**
3. The workflow builds with Vite and publishes `dist/`

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- No env vars required

`vite.config.js` uses `base: "./"` so both hosts work.

## WebLLM notes

- Model: `Llama-3.2-1B-Instruct-q4f16_1-MLC`
- Loaded only when the visitor clicks **Load tutor**
- Needs WebGPU (Chrome / Edge). Lessons still work without it
- System prompt is the current lesson plus the last retrieve dump, so the tutor cannot wander far
- Inference stays on the visitor’s machine

## What this is not

- Not Microsoft GraphRAG
- Not Neo4j
- Not a benchmark
- Not advice to put a graph under every agent

Graphs win when the answer is a **path**. Vectors still win on theme-shaped questions. The lab exists to make that distinction felt.

## Credits

The term “graph engineering” got loud on X in 2026 after people started arguing loops vs graphs, knowledge graphs vs orchestration graphs, and GraphRAG vs chunk RAG. This lab is a study artifact. It credits that conversation and then forces the claims through a 22-node example.

## License

MIT
