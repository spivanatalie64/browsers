// Content script injected into every page

// Listen for run events dispatched on the window (page context)
window.addEventListener('sprungles-run-agent', (ev) => {
  try {
    const detail = ev.detail || {};
    const path = detail.path;
    if (!path) return;
    // Ask background for agent content
    chrome.runtime.sendMessage({action: 'getAgentContent', path}, (resp) => {
      const text = resp && resp.text ? resp.text : '';
      // spawn a sandboxed worker to analyze the agent text and return safe instructions
      try {
        const workerUrl = chrome.runtime.getURL('worker/agent-worker.js');
        const w = new Worker(workerUrl);
        w.addEventListener('message', (wev) => {
          const msg = wev.data || {};
          if (msg.cmd === 'result' && msg.result) {
            const res = msg.result;
            // validate and apply allowed instructions safely
            try {
              const allowedOps = new Set(['set-data-attr','add-class','remove-class','set-text']);
              const simpleSelectorRe = /^([a-zA-Z0-9\-]+|\#[a-zA-Z0-9_\-]+|\.[a-zA-Z0-9_\-]+)$/;
              const maxLen = 200;
              (res.instructions || []).forEach((instr) => {
                try {
                  if (!instr || typeof instr !== 'object') return;
                  const op = instr.op;
                  if (!allowedOps.has(op)) return;

                  if (op === 'set-data-attr') {
                    if (typeof instr.key !== 'string') return;
                    const safeKey = instr.key.replace(/[^a-zA-Z0-9\-]/g,'');
                    const safeVal = String(instr.value === undefined ? '' : instr.value).slice(0, maxLen);
                    try { document.documentElement.setAttribute(safeKey, safeVal); } catch(e){}
                  }

                  if (op === 'add-class' || op === 'remove-class' || op === 'set-text') {
                    if (typeof instr.selector !== 'string') return;
                    if (!simpleSelectorRe.test(instr.selector)) return;
                    const nodes = document.querySelectorAll(instr.selector);
                    if (!nodes || nodes.length === 0) return;

                    if (op === 'add-class' || op === 'remove-class') {
                      if (typeof instr['class'] !== 'string') return;
                      const cls = instr['class'].slice(0, maxLen).replace(/[^a-zA-Z0-9_\- ]/g, '');
                      nodes.forEach(el => {
                        try {
                          if (op === 'add-class') el.classList.add(cls);
                          else el.classList.remove(cls);
                        } catch(e){}
                      });
                    }

                    if (op === 'set-text') {
                      if (typeof instr.text !== 'string') return;
                      const txt = instr.text.slice(0, maxLen);
                      // basic sanitization: remove null chars
                      const safeTxt = txt.replace(/\0/g, '');
                      nodes.forEach(el => {
                        try { el.textContent = safeTxt; } catch(e){}
                      });
                    }
                  }
                } catch (e) {
                  // per-instruction protection
                }
              });
            } catch (e) {
              console.error('sprungles apply instr error', e);
            }

            const id = path.split('/').pop().replace(/\.md$/, '');
            const result = {path, id, summary: res.summary || `Loaded ${path}`};
            const out = new CustomEvent('sprungles-agent-response', {detail: result});
            window.dispatchEvent(out);
            chrome.runtime.sendMessage({action: 'agentResponse', detail: result});
          }
          w.terminate();
        });
        w.postMessage({cmd:'run', agentText: text});
      } catch (e) {
        // fallback: perform minimal action
        const id = path.split('/').pop().replace(/\.md$/, '');
        try { document.documentElement.setAttribute('data-sprungles-last-agent', id); } catch (e) {}
        const result = {path, id, summary: `Loaded ${path} (${(text||'').length} chars)`};
        const out = new CustomEvent('sprungles-agent-response', {detail: result});
        window.dispatchEvent(out);
        chrome.runtime.sendMessage({action: 'agentResponse', detail: result});
      }
    });
  } catch (e) {
    console.error('sprungles run handler', e);
  }
});

// allow background messages if needed
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // reserved for future use
});
