// Simple sandboxed agent worker. Performs non-DOM analysis of agent text
// and returns a small set of allowed instructions for the content script
// to apply. This worker intentionally does NOT execute arbitrary code.

self.addEventListener('message', (ev) => {
  const msg = ev.data || {};
  if (msg.cmd === 'run') {
    const agentText = msg.agentText || '';
    // produce a simple summary and a single safe instruction by default
    const lines = agentText.split('\n').map(s=>s.trim()).filter(Boolean);
    let summary = '';
    for (let i=0;i<lines.length;i++){
      if (!lines[i].startsWith('---')) { summary = lines[i]; break; }
    }
    if (!summary && lines.length>0) summary = lines[0];

    // derive an id from the top header if available
    let id = 'sprungles-agent';
    const m = agentText.match(/^#?\s*([^\n\r]+)/m);
    if (m && m[1]) id = m[1].trim().toLowerCase().replace(/[^a-z0-9\-]+/g,'-');

    // Check for a fenced code block labeled ```sprungles-instructions\nJSON\n```
    // Very small parser: find the fence and attempt JSON.parse on its contents.
    let instructions = null;
    try {
      const fenceLabel = '```sprungles-instructions';
      const idx = agentText.indexOf(fenceLabel);
      if (idx !== -1) {
        const rest = agentText.slice(idx + fenceLabel.length);
        // find the closing fence
        const closeIdx = rest.indexOf('\n```');
        if (closeIdx !== -1) {
          const jsonText = rest.slice(0, closeIdx).trim();
          // only attempt to parse if it looks like JSON (starts with { or [)
          if (jsonText && (jsonText[0] === '{' || jsonText[0] === '[')) {
            try {
              const parsed = JSON.parse(jsonText);
              if (parsed && parsed.instructions && Array.isArray(parsed.instructions)) {
                instructions = parsed.instructions;
              }
            } catch (e) {
              // parsing failed; ignore and fall back to default
              instructions = null;
            }
          }
        }
      }
    } catch (e) {
      instructions = null;
    }

    if (!instructions) {
      instructions = [ {op: 'set-data-attr', key: 'data-sprungles-last-agent', value: id} ];
    }

    const result = {
      ok: true,
      summary: summary.slice(0, 200),
      instructions: instructions
    };
    self.postMessage({cmd:'result', result});
  }
});
