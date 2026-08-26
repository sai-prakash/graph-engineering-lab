const MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export function webgpuOk() {
  return typeof navigator !== "undefined" && !!navigator.gpu;
}

export function createTutor() {
  let engine = null;
  let loading = false;

  return {
    model: MODEL,
    get ready() {
      return !!engine;
    },
    get loading() {
      return loading;
    },
    async load(onProgress) {
      if (engine || loading) return engine;
      if (!webgpuOk()) {
        throw new Error("WebGPU is not available in this browser.");
      }
      loading = true;
      try {
        const webllm = await import("https://esm.run/@mlc-ai/web-llm");
        engine = await webllm.CreateMLCEngine(MODEL, {
          initProgressCallback: (p) => {
            const pct = Math.round((p.progress || 0) * 100);
            onProgress?.({
              pct,
              text: p.text || (pct < 100 ? `Loading tutor ${pct}%` : "Ready"),
            });
          },
        });
        return engine;
      } finally {
        loading = false;
      }
    },
    async ask({ lesson, retrieveNote, question, onDelta }) {
      if (!engine) throw new Error("Load the tutor first.");
      const system = [
        "You are the Graph Engineering Lab tutor.",
        "Stay inside the lesson and the retrieve note.",
        "Be concrete. Short paragraphs. No fluff.",
        "If the question leaves the lab, say so and point back.",
        "",
        "LESSON:",
        lesson,
        "",
        "LAST RETRIEVE:",
        retrieveNote || "(none yet)",
      ].join("\n");

      const stream = await engine.chat.completions.create({
        stream: true,
        messages: [
          { role: "system", content: system },
          { role: "user", content: question },
        ],
      });

      let full = "";
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || "";
        if (!delta) continue;
        full += delta;
        onDelta?.(full);
      }
      return full;
    },
  };
}
