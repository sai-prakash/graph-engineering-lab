# Draft posts — edit before publishing

Do not auto-post this as-is. Tighten the hook in your voice.

## X thread

1/ I didn’t know graph engineering in detail. People were shipping long threads about it. So I turned the argument into a lab you can run in the browser.

No backend. 22 nodes. An optional tutor that loads in Chrome via WebLLM.

→ https://sai-prakash.github.io/graph-engineering-lab/

2/ The useful split hiding under the hype:

• Knowledge graph = what the agent remembers (entities, relations, time, source)
• Control graph = how the agent acts (states, tools, retries)

Calling a LangGraph topology a “knowledge graph” is how the term turned to mush.

3/ Same question, two retrieve modes on the same toy company:

Vector-ish: keyword overlap inside a node.
Graph walk: start from those seeds, take 2 hops, keep the path.

Ask who should review whether GraphRAG beats vectors. The walk reaches the eval author, the PM who funded it, and the RFC author.

4/ Provenance in this lab is just a year on the edge. That is a cheat. Production graphs need source, extractor, confidence, valid time. Without that you cannot debug a wrong path — and you cannot forget.

5/ Source is public. Steal the template for the next topic you don’t fully know yet.

https://github.com/sai-prakash/graph-engineering-lab

## LinkedIn

I keep a simple rule when a topic explodes on X: do not write a thread restating it. Ship a lab that makes the claim falsifiable in a minute.

Graph engineering is one of those topics. I did not know it in detail. I built a 22-node company graph, five short lessons, and two retrieve modes (a honest toy vector search vs a 2-hop walk). Optional on-device tutor via WebLLM — no API key, no server.

The distinction that actually mattered while building it: a knowledge graph is memory. A control graph is a program. Mixing them is why the phrase sounded profound and meant three different things by Friday.

Live demo and source in the comments. If you work on agents, try the default question in both modes before you add another vendor to the stack.
