export const SAVE_CACHE_KEY = 'bubbles-cloud-saves-v1';

export function createSaveClient({ storage, fetcher, onStatus = () => {} }) {
  const cached = storage.getItem(SAVE_CACHE_KEY);
  let records = cached ? JSON.parse(cached) : {};
  let running = null;
  let conflict = false;
  const persist = () => storage.setItem(SAVE_CACHE_KEY, JSON.stringify(records));
  const status = value => onStatus(value);
  const client = {
    async load() {
      try {
        const result = await fetcher('/api/saves', { cache: 'no-store', redirect: 'error' });
        if (!result.ok) throw new Error(`Save service: ${result.status}`);
        const remote = await result.json();
        records = { ...remote, ...Object.fromEntries(Object.entries(records).filter(([, row]) => row.pending)) };
        persist();
      } catch (error) {
        if (!cached) throw error;
        status('offline');
        return;
      }
      await client.flush();
    },
    getItem(key) { return records[key]?.value ?? null; },
    keys() { return Object.keys(records).filter(key => records[key].value !== null); },
    setItem(key, value) {
      if (conflict) throw new Error('Resolve the save conflict before continuing');
      const row = records[key] ?? { revision: 0, value: null };
      if (row.value === value) return;
      row.value = value;
      row.pending ??= { revision: row.revision, value };
      records[key] = row;
      try { persist(); } catch (error) { status('error'); throw error; }
      status('saving');
      queueMicrotask(() => { void client.flush(); });
    },
    removeItem(key) { client.setItem(key, null); },
    flush() {
      if (running) return running;
      if (conflict) return Promise.resolve();
      running = (async () => {
        try {
          let entry;
          while ((entry = Object.entries(records).find(([, row]) => row.pending))) {
            const [key, row] = entry;
            while (row.pending) {
              const sent = row.pending;
              const result = await fetcher(`/api/saves/${encodeURIComponent(key)}`, {
                method: 'PUT', headers: { 'content-type': 'application/json' },
                body: JSON.stringify(sent), redirect: 'error',
              });
              if (result.status === 409) { conflict = true; status('conflict'); return; }
              if (!result.ok) throw new Error(`Save service: ${result.status}`);
              const saved = await result.json();
              row.revision = saved.revision;
              row.pending = row.value === sent.value ? null : { revision: row.revision, value: row.value };
              persist();
            }
          }
          status('saved');
        } catch { status('offline'); }
      })().finally(() => { running = null; });
      return running;
    },
  };
  return client;
}
