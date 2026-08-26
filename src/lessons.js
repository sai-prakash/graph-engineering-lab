export const LESSONS = [
  {
    id: "why",
    num: "01",
    title: "Why agents fail without structure",
    minutes: 4,
    body: `
<p>A language model is good at sounding sure. It is worse at keeping relationships straight across a long task.</p>
<p>Ask it “who should review the GraphRAG work?” and a vector index will pull every chunk that mentions GraphRAG. That pile may include a design spec, a tweet, and a meeting note. It will not reliably tell you that <em>Ravi authored RFC-12, RFC-12 recommends GraphRAG, and Priya funded the eval</em>.</p>
<p><strong>Graph engineering</strong> is the unglamorous job of deciding which of those facts are nodes, which are edges, who asserted them, and which graph the agent is allowed to walk while it works.</p>
<p>The viral threads in 2026 mixed two different graphs. This lab separates them, then lets you break a tiny company graph on purpose.</p>
`,
    tutorHint: "Explain why a bag of similar chunks is not the same as a path between people, docs, and concepts. Use Orbit Labs examples.",
    prompts: [
      "Why do long agent runs lose the plot even when retrieval is 'working'?",
      "Give me a concrete question that vectors will miss on this graph.",
    ],
  },
  {
    id: "two-graphs",
    num: "02",
    title: "Two graphs people keep mixing up",
    minutes: 5,
    body: `
<p>Same word. Two jobs.</p>
<ol>
  <li><strong>Knowledge graph</strong> — what the system <em>remembers</em>. People, projects, papers, tools. Edges carry meaning: <code>authored</code>, <code>requires</code>, <code>compares</code>. Time and source belong here.</li>
  <li><strong>Control graph</strong> — how the system <em>acts</em>. States, tools, branches, retries, human gates. LangGraph-style orchestration lives here. It is a program, not a memory.</li>
</ol>
<p>On the Orbit graph, RFC-12 and Eval Note are knowledge. Harness Kit implementing a control graph is knowledge <em>about</em> control. The control graph itself would be the router that decides “retrieve → walk → generate → eval.”</p>
<p>If you store tool-call traces as if they were facts about the world, the memory rots. If you try to plan an agent by only embedding documents, the plan has no joints.</p>
`,
    tutorHint: "Keep knowledge graphs and control graphs distinct. Never call a LangGraph topology a knowledge graph.",
    prompts: [
      "Is LangGraph a knowledge graph? Why or why not?",
      "What would we put in Orbit's control graph vs its knowledge graph?",
    ],
  },
  {
    id: "anatomy",
    num: "03",
    title: "Nodes, edges, provenance",
    minutes: 5,
    body: `
<p>Click any node on the right. You get a type, a blurb, and every edge with a year.</p>
<ul>
  <li><strong>Node</strong> — a stable thing you can point at twice. Prefer <em>Ravi Iyer</em> over a sentence that happens to contain his name.</li>
  <li><strong>Edge</strong> — a typed relation, not a vibe. <code>authored</code> is better than <code>related_to</code>.</li>
  <li><strong>Provenance</strong> — who said this, when, from which doc. Without it you cannot debug a wrong answer, and you cannot forget stale facts.</li>
</ul>
<p>This lab cheats: provenance is just a year on the edge. Production graphs add source doc, extractor, confidence, and a valid-time range. That is the part threads skip and production teams drown in.</p>
<p>Design rule: if you cannot write the edge in a short triple — <code>(Leo, authored, Eval Note, 2026)</code> — do not store it as structure yet. Leave it as text.</p>
`,
    tutorHint: "Teach typed triples and why untyped 'related_to' edges become sludge. Point at the year on Orbit edges as a toy stand-in for provenance.",
    prompts: [
      "Write three good triples and one bad related_to edge from Orbit.",
      "What breaks if we delete the year from every edge?",
    ],
  },
  {
    id: "retrieve",
    num: "04",
    title: "Graph walk vs vector search",
    minutes: 6,
    body: `
<p>Same question. Two retrieve modes. Run both.</p>
<p><strong>Vector-ish</strong> here is honest about being a toy: it scores nodes by keyword overlap in their own text. No neighbors. That is the shape of chunk search even when the real math is cosine.</p>
<p><strong>Graph walk</strong> starts from those same seeds, then follows edges for two hops and keeps the path. That is the shape of GraphRAG-style retrieval, minus community summaries and expensive indexing.</p>
<p>Try: <em>“Who should I ask about whether GraphRAG beats vectors on multi-hop questions?”</em></p>
<p>Keyword search lands on GraphRAG, Vector RAG, Multi-hop, Eval Note. The walk also reaches Leo (authored the eval), Priya (funded it), and Ravi (authored the RFC that recommended GraphRAG). The extra names are the point.</p>
<p>Real systems mix both: vectors to enter the graph, walks to gather the neighborhood, maybe a global summary for theme-level questions. Graphs are not free. They win when the answer is a <em>path</em>.</p>
`,
    tutorHint: "Contrast path-shaped questions with theme-shaped questions. Do not claim graphs always win.",
    prompts: [
      "When would the vector mode be the right call on this dataset?",
      "Walk me through the hops for the GraphRAG bake-off question.",
    ],
  },
  {
    id: "lab",
    num: "05",
    title: "Ask the graph a multi-hop question",
    minutes: 8,
    body: `
<p>This is the whole lab. Pick a question whose answer is not sitting in one node.</p>
<p>Starter prompts:</p>
<ul>
  <li>Who designed the project that requires WebGPU?</li>
  <li>Which PM funded a document that compares GraphRAG and Vector RAG?</li>
  <li>What tool does Maya use that requires WebGPU?</li>
  <li>Who studies the method RFC-12 recommends?</li>
</ul>
<p>Read the path string. If the path is nonsense, the schema is wrong — that is graph engineering, not prompt engineering.</p>
<p>Then load the on-device tutor (optional, Chrome/Edge + WebGPU). It only knows the current lesson plus the last retrieve result. It cannot phone a server.</p>
<p>When you ship your own version: swap Orbit for a domain you actually care about. Keep the node count under 40 until the questions get sharp.</p>
`,
    tutorHint: "Help the learner pose a multi-hop question, predict the path, then check it against the retrieve panel.",
    prompts: [
      "Propose two multi-hop questions I have not tried yet.",
      "I ran a query and the path looks wrong. How do I debug the schema?",
    ],
  },
];

export function lessonText(lesson) {
  const tmp = document.createElement("div");
  tmp.innerHTML = lesson.body;
  return `${lesson.title}\n${tmp.textContent}\nTutor stance: ${lesson.tutorHint}`;
}
