// Background script: open onboarding on install (only once)
const MOOBLE_URL = 'http://127.0.0.1:5000/?onboard=1';
const PING_URL = 'http://127.0.0.1:5000/';

async function pingLocalServer(timeoutMs = 2500) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(PING_URL, { method: 'HEAD', signal: controller.signal });
    clearTimeout(id);
    return resp && resp.ok;
  } catch (e) {
    return false;
  }
}

browser.runtime.onInstalled.addListener(async (details) => {
  try {
    const data = await browser.storage.local.get('onboard_shown');
    if (data && data.onboard_shown) {
      return; // already shown once
    }

    const reachable = await pingLocalServer();
    const openUrl = reachable ? MOOBLE_URL : browser.runtime.getURL('onboard.html');
    await browser.tabs.create({ url: openUrl });
    await browser.storage.local.set({ onboard_shown: true });
  } catch (err) {
    console.error('Mooble onboarding error', err);
  }
});
