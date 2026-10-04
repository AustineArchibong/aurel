// Connection to the AUREL database (publishable key is safe to expose; security rules protect the data)
const DB = {
  url: "https://giljbtmtfkptykkljwpj.supabase.co",
  key: "sb_publishable_8xzZ590kyrjqWvrieAC3Pw_6g0H2NRA"
};
const db = {
  headers(token) {
    return { apikey: DB.key, "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) };
  },
  async call(path, opts = {}, token) {
    const r = await fetch(DB.url + path, { ...opts, headers: { ...this.headers(token), ...(opts.headers || {}) } });
    const j = await r.json().catch(() => null);
    if (!r.ok) { const e = new Error((j && (j.message || j.msg || j.error_description)) || "Something went wrong"); e.status = r.status; throw e; }
    return j;
  },
  rpc(fn, args, token) { return this.call("/rest/v1/rpc/" + fn, { method: "POST", body: JSON.stringify(args || {}) }, token); }
};
