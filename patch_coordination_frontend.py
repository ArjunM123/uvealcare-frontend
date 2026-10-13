"""
Patches App.tsx in place to add the care coordination screens:

  * Case Packet: one-page PDF button, imaging study log, surveillance
    schedule, decision history and outcomes, clinical trial matches
  * a new "Board agenda" screen (agenda, PDF, surveillance alerts, review
    of past decisions) with a sidebar link
  * Settings: clinical trial manager (administrators only)

Run from inside your frontend folder (the one with package.json), after the
roles frontend patch is already applied:

    python3 patch_coordination_frontend.py

Safe to run twice. Nothing is changed unless every anchor is found exactly once.
"""
import os
import sys

if os.path.exists("src/App.tsx"):
    PATH = "src/App.tsx"
elif os.path.exists("App.tsx"):
    PATH = "App.tsx"
else:
    print("FAIL  Can't find App.tsx. Run this from the folder that has package.json.")
    sys.exit(1)

content = open(PATH, "r", encoding="utf-8").read()
original = content
MARKER = "// uvealcare: care coordination"

COMPONENTS = r'''// uvealcare: care coordination
// Imaging study log, surveillance schedule, decision outcomes and trial
// matches (case packet), the Board agenda screen, and the trial manager
// (settings, administrators only). All data comes from the backend; nothing
// is decided here.
type CoRec = Record<string, any>;

const coInput = "border border-[#D5DBE3] rounded px-2 py-1 text-xs text-[#1B2733] bg-white w-full";
const coPrimary = "bg-[#0F2D56] text-white text-xs px-3 py-1.5 rounded hover:bg-[#0B63B6] disabled:opacity-50";
const coGhost = "border border-[#D5DBE3] text-[#3D4B5C] text-xs px-3 py-1.5 rounded hover:bg-[#EEF2F6] disabled:opacity-50";
const coLink = "text-[11px] text-[#0B63B6] hover:underline";

async function coSend(url: string, method: string, body?: unknown): Promise<{ ok: boolean; status: number; data: CoRec }> {
  const res = await apiFetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function coDetail(data: CoRec, fallback = "That didn't work."): string {
  return typeof data?.detail === "string" ? data.detail : fallback;
}

async function coOpenPdf(path: string, onError: (m: string) => void) {
  const w = window.open("", "_blank");
  try {
    const res = await apiFetch(`${API_BASE}${path}`);
    if (!res.ok) {
      if (w) w.close();
      onError(coDetail(await res.json().catch(() => ({})), "Couldn't make the PDF."));
      return;
    }
    const url = URL.createObjectURL(await res.blob());
    if (w) { w.location.href = url; }
    else {
      const a = document.createElement("a");
      a.href = url; a.download = "summary.pdf"; a.click();
    }
  } catch {
    if (w) w.close();
    onError("Couldn't reach the server.");
  }
}

function coFmtDate(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { dateStyle: "medium" });
}

function CoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-[#5B6877] mb-0.5">{label}</span>
      {children}
    </label>
  );
}

function CoMsg({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null;
  return <p className={`text-xs mt-2 ${m.ok ? "text-green-700" : "text-red-700"}`}>{m.text}</p>;
}

const CO_STATUS_STYLE: Record<string, string> = {
  overdue: "bg-red-50 text-red-700 border-red-200",
  due_soon: "bg-amber-50 text-amber-800 border-amber-200",
  no_date: "bg-amber-50 text-amber-800 border-amber-200",
  ok: "bg-green-50 text-green-700 border-green-200",
};

// ── Imaging study log ────────────────────────────────────────────────────
function ImagingLogPanel({ caseId }: { caseId: string }) {
  const [data, setData] = useState<CoRec | null>(null);
  const [form, setForm] = useState<CoRec | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [dup, setDup] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    apiFetch(`${API_BASE}/cases/${caseId}/imaging-studies`).then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
  useEffect(() => { setData(null); setForm(null); load(); }, [caseId]);

  const blank = { modality: "", eye: "", status: "ordered", ordered_date: "", performed_date: "", due_next_date: "",
    location: "", outside: false, read_by: "", result_summary: "", comparison_note: "" };
  const set = (k: string, v: unknown) => setForm((f) => ({ ...(f || {}), [k]: v }));

  const save = async (confirmDuplicate = false) => {
    if (!form) return;
    setBusy(true); setMsg(null);
    const body = { ...form, confirm_duplicate: confirmDuplicate };
    const r = editId
      ? await coSend(`${API_BASE}/cases/${caseId}/imaging-studies/${editId}`, "PUT", body)
      : await coSend(`${API_BASE}/cases/${caseId}/imaging-studies`, "POST", body);
    setBusy(false);
    if (r.status === 409 && r.data?.detail?.duplicate) { setDup(r.data.detail.message); return; }
    if (!r.ok) { setMsg({ ok: false, text: coDetail(r.data) }); return; }
    const upd: string[] = r.data.surveillance_updated || [];
    setMsg({ ok: true, text: upd.length ? `Saved. Surveillance updated: ${upd.join(", ")}.` : "Saved." });
    setForm(null); setEditId(null); setDup(null);
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this study from the log?")) return;
    const r = await coSend(`${API_BASE}/cases/${caseId}/imaging-studies/${id}`, "DELETE");
    if (!r.ok) setMsg({ ok: false, text: coDetail(r.data) }); else load();
  };

  const edit = (s: CoRec) => {
    setEditId(s.id); setDup(null); setMsg(null);
    setForm({ modality: s.modality, eye: s.eye, status: s.status, ordered_date: s.ordered_date || "", performed_date: s.performed_date || "",
      due_next_date: s.due_next_date || "", location: s.location || "", outside: !!s.outside, read_by: s.read_by || "",
      result_summary: s.result_summary || "", comparison_note: s.comparison_note || "" });
  };

  const summary = data?.summary;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <SectionHeader>Imaging study log</SectionHeader>
        {!form && <button className={coGhost} onClick={() => { setForm({ ...blank }); setEditId(null); setDup(null); setMsg(null); }}>Add study</button>}
      </div>
      <p className="text-[11px] text-[#5B6877] -mt-2 mb-3">What was ordered, done, received and read, including studies done elsewhere. Warns before a repeat order.</p>

      {summary && (summary.latest.length > 0 || summary.waiting.length > 0) && (
        <div className="mb-3 space-y-0.5">
          {summary.latest.map((l: CoRec, i: number) => (
            <p key={i} className="text-xs text-[#1B2733]">
              <span className="font-medium">{l.modality_label}, {l.eye_label}:</span> last {coFmtDate(l.performed_date)} ({l.days_ago} day{l.days_ago === 1 ? "" : "s"} ago){l.location ? ` at ${l.location}` : ""}{l.outside ? ", outside study" : ""}
            </p>
          ))}
          {summary.waiting.map((w: CoRec, i: number) => (
            <p key={i} className="text-xs text-amber-800">
              <span className="font-medium">{w.modality_label}, {w.eye_label}:</span> ordered{w.ordered_date ? ` ${coFmtDate(w.ordered_date)}` : ""}, not done yet{w.days_waiting != null ? ` (${w.days_waiting} day${w.days_waiting === 1 ? "" : "s"})` : ""}
            </p>
          ))}
        </div>
      )}

      {form && data && (
        <div className="border border-[#E4E9EF] rounded p-3 mb-3 bg-[#F6F8FA]">
          <div className="grid grid-cols-3 gap-2">
            <CoField label="Study">
              <select className={coInput} value={form.modality} onChange={(e) => set("modality", e.target.value)}>
                <option value="">Choose…</option>
                {data.types.map((t: CoRec) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </CoField>
            <CoField label="Eye">
              <select className={coInput} value={form.eye} onChange={(e) => set("eye", e.target.value)}>
                <option value="">{form.modality === "liver_imaging" || form.modality === "other" ? "Not eye-specific (default)" : "Choose…"}</option>
                {data.eyes.map((t: CoRec) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </CoField>
            <CoField label="Status">
              <select className={coInput} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {data.statuses.map((t: CoRec) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </CoField>
            <CoField label="Date ordered"><input type="date" className={coInput} value={form.ordered_date} onChange={(e) => set("ordered_date", e.target.value)} /></CoField>
            <CoField label="Date performed"><input type="date" className={coInput} value={form.performed_date} onChange={(e) => set("performed_date", e.target.value)} /></CoField>
            <CoField label="Next due (optional)"><input type="date" className={coInput} value={form.due_next_date} onChange={(e) => set("due_next_date", e.target.value)} /></CoField>
            <CoField label="Where it was done"><input className={coInput} value={form.location} onChange={(e) => set("location", e.target.value)} /></CoField>
            <CoField label="Read by"><input className={coInput} value={form.read_by} onChange={(e) => set("read_by", e.target.value)} /></CoField>
            <label className="flex items-center gap-2 text-xs text-[#3D4B5C] mt-4">
              <input type="checkbox" checked={!!form.outside} onChange={(e) => set("outside", e.target.checked)} /> Done outside this clinic
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <CoField label="Result summary"><textarea rows={2} className={coInput} value={form.result_summary} onChange={(e) => set("result_summary", e.target.value)} /></CoField>
            <CoField label="Compared with earlier study"><textarea rows={2} className={coInput} value={form.comparison_note} onChange={(e) => set("comparison_note", e.target.value)} /></CoField>
          </div>
          {dup && (
            <div className="mt-3 border border-amber-300 bg-amber-50 rounded p-2.5">
              <p className="text-xs text-amber-900">{dup}</p>
              <div className="flex gap-2 mt-2">
                <button className={coPrimary} disabled={busy} onClick={() => save(true)}>Order anyway</button>
                <button className={coGhost} onClick={() => { setDup(null); setForm(null); setEditId(null); }}>Cancel, don't order</button>
              </div>
            </div>
          )}
          {!dup && (
            <div className="flex gap-2 mt-3">
              <button className={coPrimary} disabled={busy} onClick={() => save(false)}>{editId ? "Save changes" : "Add to log"}</button>
              <button className={coGhost} onClick={() => { setForm(null); setEditId(null); setMsg(null); }}>Cancel</button>
            </div>
          )}
        </div>
      )}
      <CoMsg m={msg} />

      {data && data.studies.length === 0 && !form && <p className="text-xs text-[#6B7785] italic">No studies logged yet.</p>}
      {data && data.studies.length > 0 && (
        <div className="border border-[#E4E9EF] rounded">
          {data.studies.map((s: CoRec) => (
            <div key={s.id} className="px-3 py-2 border-b border-[#EEF2F6] last:border-b-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[#1B2733]">
                  <span className="font-medium">{s.modality_label}</span>, {s.eye_label}
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-[#EEF2F6] text-[#3D4B5C] text-[11px]">{s.status_label}</span>
                  {s.outside && <span className="ml-1 text-[11px] text-[#5B6877]">outside</span>}
                </p>
                <span className="shrink-0 flex gap-3">
                  <button className={coLink} onClick={() => edit(s)}>Edit</button>
                  <button className="text-[11px] text-red-700 hover:underline" onClick={() => remove(s.id)}>Delete</button>
                </span>
              </div>
              <p className="text-[11px] text-[#5B6877]">
                {s.performed_date ? `Done ${coFmtDate(s.performed_date)}` : s.ordered_date ? `Ordered ${coFmtDate(s.ordered_date)}` : ""}
                {s.location ? ` · ${s.location}` : ""}{s.read_by ? ` · read by ${s.read_by}` : ""}{s.due_next_date ? ` · next due ${coFmtDate(s.due_next_date)}` : ""}
              </p>
              {s.result_summary && <p className="text-xs text-[#3D4B5C] mt-0.5">{s.result_summary}</p>}
              {s.comparison_note && <p className="text-[11px] text-[#5B6877]">Compared: {s.comparison_note}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Surveillance ─────────────────────────────────────────────────────────
function SurveillancePanel({ caseId }: { caseId: string }) {
  const [data, setData] = useState<CoRec | null>(null);
  const [form, setForm] = useState<CoRec | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    apiFetch(`${API_BASE}/cases/${caseId}/surveillance`).then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
  useEffect(() => { setData(null); setForm(null); load(); }, [caseId]);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...(f || {}), [k]: v }));

  const save = async () => {
    if (!form) return;
    setBusy(true); setMsg(null);
    const r = editId
      ? await coSend(`${API_BASE}/cases/${caseId}/surveillance/${editId}`, "PUT", form)
      : await coSend(`${API_BASE}/cases/${caseId}/surveillance`, "POST", form);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: coDetail(r.data) }); return; }
    setForm(null); setEditId(null); load();
  };
  const done = async (id: string) => {
    const r = await coSend(`${API_BASE}/cases/${caseId}/surveillance/${id}/done`, "POST", {});
    if (!r.ok) setMsg({ ok: false, text: coDetail(r.data) }); else load();
  };
  const remove = async (id: string) => {
    if (!window.confirm("Remove this item from the schedule?")) return;
    const r = await coSend(`${API_BASE}/cases/${caseId}/surveillance/${id}`, "DELETE");
    if (!r.ok) setMsg({ ok: false, text: coDetail(r.data) }); else load();
  };
  const edit = (i: CoRec) => {
    setEditId(i.id); setMsg(null);
    setForm({ kind: i.kind, label: i.label, interval_months: String(i.interval_months), start_date: i.start_date || "",
      last_done: i.last_done || "", study_type: i.study_type || "", eye: i.eye || "", notes: i.notes || "" });
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <SectionHeader>Surveillance schedule</SectionHeader>
        {!form && <button className={coGhost} onClick={() => { setForm({ kind: "", label: "", interval_months: "", start_date: "", last_done: "", study_type: "", eye: "", notes: "" }); setEditId(null); setMsg(null); }}>Add item</button>}
      </div>
      <p className="text-[11px] text-[#5B6877] -mt-2 mb-3">The clinician sets how often each item repeats. There are no built-in intervals. Logging a matching imaging study marks the item done.</p>

      {form && data && (
        <div className="border border-[#E4E9EF] rounded p-3 mb-3 bg-[#F6F8FA]">
          <div className="grid grid-cols-3 gap-2">
            <CoField label="Kind">
              <select className={coInput} value={form.kind} onChange={(e) => set("kind", e.target.value)}>
                <option value="">Choose…</option>
                {data.kinds.map((t: CoRec) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </CoField>
            <CoField label="Name (for example Liver MRI)"><input className={coInput} value={form.label} onChange={(e) => set("label", e.target.value)} /></CoField>
            <CoField label="Repeats every (months)"><input type="number" min={1} max={60} className={coInput} value={form.interval_months} onChange={(e) => set("interval_months", e.target.value)} /></CoField>
            <CoField label="Last done"><input type="date" className={coInput} value={form.last_done} onChange={(e) => set("last_done", e.target.value)} /></CoField>
            <CoField label="Start date (if never done)"><input type="date" className={coInput} value={form.start_date} onChange={(e) => set("start_date", e.target.value)} /></CoField>
            <CoField label="Matches imaging study (optional)">
              <select className={coInput} value={form.study_type} onChange={(e) => set("study_type", e.target.value)}>
                <option value="">None</option>
                {data.types.map((t: CoRec) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </CoField>
            <CoField label="Eye (optional)">
              <select className={coInput} value={form.eye} onChange={(e) => set("eye", e.target.value)}>
                <option value="">Any</option>
                {data.eyes.map((t: CoRec) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </CoField>
            <div className="col-span-2"><CoField label="Notes"><input className={coInput} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></CoField></div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className={coPrimary} disabled={busy} onClick={save}>{editId ? "Save changes" : "Add to schedule"}</button>
            <button className={coGhost} onClick={() => { setForm(null); setEditId(null); setMsg(null); }}>Cancel</button>
          </div>
        </div>
      )}
      <CoMsg m={msg} />
      {data && data.items.length === 0 && !form && <p className="text-xs text-[#6B7785] italic">Nothing scheduled yet.</p>}
      {data && data.items.length > 0 && (
        <div className="border border-[#E4E9EF] rounded">
          {data.items.map((i: CoRec) => (
            <div key={i.id} className="px-3 py-2 border-b border-[#EEF2F6] last:border-b-0 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[#1B2733]"><span className="font-medium">{i.label}</span> <span className="text-[#5B6877]">every {i.interval_months} month{i.interval_months === 1 ? "" : "s"}</span></p>
                <p className="text-[11px] text-[#5B6877]">{i.last_done ? `Last done ${coFmtDate(i.last_done)}` : "Never recorded as done"}{i.notes ? ` · ${i.notes}` : ""}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] px-2 py-0.5 rounded border ${CO_STATUS_STYLE[i.status] || ""}`}>{i.text}</span>
                <button className={coLink} onClick={() => done(i.id)}>Done today</button>
                <button className={coLink} onClick={() => edit(i)}>Edit</button>
                <button className="text-[11px] text-red-700 hover:underline" onClick={() => remove(i.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Decision history and outcomes ────────────────────────────────────────
function OutcomesPanel({ caseId }: { caseId: string }) {
  const [data, setData] = useState<CoRec | null>(null);
  const [form, setForm] = useState<CoRec | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    apiFetch(`${API_BASE}/cases/${caseId}/decision-history`).then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
  useEffect(() => { setData(null); setForm(null); load(); }, [caseId]);

  const save = async () => {
    if (!form) return;
    setBusy(true); setMsg(null);
    const r = await coSend(`${API_BASE}/cases/${caseId}/outcomes`, "POST", form);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: coDetail(r.data) }); return; }
    setForm(null); load();
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this outcome note?")) return;
    const r = await coSend(`${API_BASE}/cases/${caseId}/outcomes/${id}`, "DELETE");
    if (!r.ok) setMsg({ ok: false, text: coDetail(r.data) }); else load();
  };

  const current = data?.versions?.[0];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <SectionHeader>Decision history and outcomes</SectionHeader>
        {!form && current && <button className={coGhost} onClick={() => { setForm({ status: "", note: "", event_date: "" }); setMsg(null); }}>Add outcome</button>}
      </div>
      {!current && <p className="text-xs text-[#6B7785] italic">No board decision recorded yet. Once one is saved, each version is kept here and you can record what happened.</p>}
      {current && (
        <div className="mb-3">
          <p className="text-[11px] text-[#5B6877]">Current recommendation, saved {fmtWhen(current.logged_at)}</p>
          <p className="text-xs text-[#1B2733]">{current.recommendation}</p>
          {data.versions.length > 1 && (
            <button className={coLink} onClick={() => setShowVersions(!showVersions)}>
              {showVersions ? "Hide earlier versions" : `Show ${data.versions.length - 1} earlier version${data.versions.length === 2 ? "" : "s"}`}
            </button>
          )}
          {showVersions && data.versions.slice(1).map((v: CoRec) => (
            <div key={v.id} className="mt-2 pl-3 border-l-2 border-[#D5DBE3]">
              <p className="text-[11px] text-[#5B6877]">Saved {fmtWhen(v.logged_at)}</p>
              <p className="text-xs text-[#3D4B5C]">{v.recommendation}</p>
              {v.rationale && <p className="text-[11px] text-[#5B6877]">Why: {v.rationale}</p>}
            </div>
          ))}
        </div>
      )}
      {form && data && (
        <div className="border border-[#E4E9EF] rounded p-3 mb-3 bg-[#F6F8FA]">
          <div className="grid grid-cols-2 gap-2">
            <CoField label="What happened to the plan">
              <select className={coInput} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="">Choose…</option>
                {data.statuses.map((t: CoRec) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </CoField>
            <CoField label="Date"><input type="date" className={coInput} value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></CoField>
          </div>
          <div className="mt-2"><CoField label="Note"><textarea rows={3} className={coInput} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></CoField></div>
          <div className="flex gap-2 mt-3">
            <button className={coPrimary} disabled={busy} onClick={save}>Save outcome</button>
            <button className={coGhost} onClick={() => { setForm(null); setMsg(null); }}>Cancel</button>
          </div>
        </div>
      )}
      <CoMsg m={msg} />
      {data && data.outcomes.length > 0 && (
        <div className="border border-[#E4E9EF] rounded">
          {data.outcomes.map((o: CoRec) => (
            <div key={o.id} className="px-3 py-2 border-b border-[#EEF2F6] last:border-b-0">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#1B2733]"><span className="font-medium">{o.status_label}</span>{o.event_date ? ` · ${coFmtDate(o.event_date)}` : ""}</p>
                <button className="text-[11px] text-red-700 hover:underline" onClick={() => remove(o.id)}>Delete</button>
              </div>
              <p className="text-xs text-[#3D4B5C]">{o.note}</p>
              <p className="text-[11px] text-[#5B6877]">{o.recorded_by}, {fmtWhen(o.recorded_at)}{o.recommendation_then ? ` · plan then: ${o.recommendation_then}` : ""}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Trial matches ────────────────────────────────────────────────────────
function TrialMatchesPanel({ caseId }: { caseId: string }) {
  const [data, setData] = useState<CoRec | null>(null);
  const [showNo, setShowNo] = useState(false);
  useEffect(() => {
    setData(null);
    apiFetch(`${API_BASE}/cases/${caseId}/trial-matches`).then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
  }, [caseId]);

  const label: Record<string, string> = {
    possible_match: "Possible match", needs_data: "Needs more data", not_a_match: "Does not match", no_criteria: "No criteria entered",
  };
  const style: Record<string, string> = {
    possible_match: "bg-green-50 text-green-700 border-green-200", needs_data: "bg-amber-50 text-amber-800 border-amber-200",
    not_a_match: "bg-[#F6F8FA] text-[#5B6877] border-[#D5DBE3]", no_criteria: "bg-[#F6F8FA] text-[#5B6877] border-[#D5DBE3]",
  };
  const mark: Record<string, string> = { ok: "Met", fails: "Not met", unknown: "Not recorded" };
  const shown = data ? data.matches.filter((m: CoRec) => showNo || m.overall !== "not_a_match") : [];
  const hidden = data ? data.matches.length - shown.length : 0;

  return (
    <Card className="p-5">
      <SectionHeader>Clinical trial matches</SectionHeader>
      <p className="text-[11px] text-[#5B6877] -mt-2 mb-3">{data?.notice ?? "Compares recorded findings with trial criteria an administrator entered."}</p>
      {data && data.matches.length === 0 && <p className="text-xs text-[#6B7785] italic">No active trials have been entered. An administrator can add them in Settings.</p>}
      {shown.map((m: CoRec) => (
        <div key={m.trial.id} className="border border-[#E4E9EF] rounded p-3 mb-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#1B2733]">{m.trial.name}{m.trial.nct_id ? <span className="font-normal text-[#5B6877]"> · {m.trial.nct_id}</span> : null}</p>
            <span className={`text-[11px] px-2 py-0.5 rounded border shrink-0 ${style[m.overall]}`}>{label[m.overall]}</span>
          </div>
          {m.trial.last_verified && <p className="text-[11px] text-[#5B6877]">Criteria last checked {coFmtDate(m.trial.last_verified)}</p>}
          <div className="mt-1.5 space-y-0.5">
            {m.criteria.map((c: CoRec, i: number) => (
              <p key={i} className="text-[11px] text-[#3D4B5C]">
                <span className={c.state === "ok" ? "text-green-700" : c.state === "fails" ? "text-red-700" : "text-amber-800"}>{mark[c.state]}</span>
                {" · "}{c.kind === "exclusion" ? "Excluded if " : ""}{c.label} {c.text}{c.have ? ` (recorded: ${c.have})` : ""}
              </p>
            ))}
          </div>
        </div>
      ))}
      {hidden > 0 && <button className={coLink} onClick={() => setShowNo(true)}>Show {hidden} that do not match</button>}
      {showNo && data && data.matches.some((m: CoRec) => m.overall === "not_a_match") && <button className={`${coLink} ml-3`} onClick={() => setShowNo(false)}>Hide them</button>}
    </Card>
  );
}

function CoordinationPanels({ caseId }: { caseId: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <SectionHeader>One-page summary</SectionHeader>
            <p className="text-[11px] text-[#5B6877] -mt-2">A single PDF of this case for the board or to attach in Epic. Contains patient information. Each download is logged.</p>
          </div>
          <button className={coPrimary} onClick={() => { setMsg(null); coOpenPdf(`/cases/${caseId}/summary.pdf`, (m) => setMsg({ ok: false, text: m })); }}>Open PDF</button>
        </div>
        <CoMsg m={msg} />
      </Card>
      <ImagingLogPanel caseId={caseId} />
      <SurveillancePanel caseId={caseId} />
      <OutcomesPanel caseId={caseId} />
      <TrialMatchesPanel caseId={caseId} />
    </>
  );
}

// ── Board agenda screen ──────────────────────────────────────────────────
function BoardAgendaScreen({ onNav }: { onNav: (s: Screen, caseId?: string) => void }) {
  const [agenda, setAgenda] = useState<CoRec | null>(null);
  const [alerts, setAlerts] = useState<CoRec | null>(null);
  const [review, setReview] = useState<CoRec | null>(null);
  const [cases, setCases] = useState<CoRec[]>([]);
  const [pick, setPick] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = () => {
    apiFetch(`${API_BASE}/tumor-board/agenda`).then((r) => (r.ok ? r.json() : null)).then(setAgenda).catch(() => {});
    apiFetch(`${API_BASE}/surveillance/overdue`).then((r) => (r.ok ? r.json() : null)).then(setAlerts).catch(() => {});
    apiFetch(`${API_BASE}/tumor-board/review`).then((r) => (r.ok ? r.json() : null)).then(setReview).catch(() => {});
    apiFetch(`${API_BASE}/cases`).then((r) => (r.ok ? r.json() : [])).then((d) => Array.isArray(d) && setCases(d)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const add = async (caseId: string) => {
    const r = await coSend(`${API_BASE}/tumor-board/agenda`, "POST", { case_id: caseId });
    if (!r.ok) setMsg({ ok: false, text: coDetail(r.data) }); else { setMsg(null); setPick(""); load(); }
  };
  const remove = async (caseId: string) => {
    const r = await coSend(`${API_BASE}/tumor-board/agenda/${caseId}`, "DELETE");
    if (!r.ok) setMsg({ ok: false, text: coDetail(r.data) }); else load();
  };
  const clear = async () => {
    if (!window.confirm("Remove every case from the agenda?")) return;
    const r = await coSend(`${API_BASE}/tumor-board/agenda?confirm=true`, "DELETE");
    if (!r.ok) setMsg({ ok: false, text: coDetail(r.data) }); else load();
  };

  const onAgenda = new Set<string>((agenda?.items ?? []).map((i: CoRec) => i.case_id));
  const addable = cases.filter((c) => !onAgenda.has(c.case_id));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Board agenda"
        subtitle={agenda?.meeting_date ? `Next tumor board: ${coFmtDate(agenda.meeting_date)}` : "Next tumor board date not set (set it on the Dashboard)"}
        action={
          <button className={coPrimary} disabled={!agenda || agenda.items.length === 0}
            onClick={() => { setMsg(null); coOpenPdf("/tumor-board/agenda.pdf", (m) => setMsg({ ok: false, text: m })); }}>
            Agenda + summaries (PDF)
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FFFFFF]">
        <div className="max-w-3xl space-y-5">
          <CoMsg m={msg} />

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SectionHeader>On the agenda</SectionHeader>
              {agenda && agenda.items.length > 0 && <button className={coLink} onClick={clear}>Clear agenda</button>}
            </div>
            {agenda && agenda.items.length === 0 && <p className="text-xs text-[#6B7785] italic">No cases on the agenda yet.</p>}
            {agenda && agenda.items.map((i: CoRec, n: number) => (
              <div key={i.case_id} className="flex items-center justify-between gap-3 py-2 border-b border-[#EEF2F6] last:border-b-0">
                <div className="min-w-0">
                  <p className="text-xs text-[#1B2733]"><span className="text-[#5B6877]">{n + 1}.</span> <span className="font-medium">{i.patient_name}</span> <span className="text-[#5B6877]">MRN {i.mrn}</span></p>
                  <p className="text-[11px] text-[#5B6877]">{i.readiness_pct}% ready{i.has_decision ? " · decision recorded" : ""}{i.note ? ` · ${i.note}` : ""}</p>
                </div>
                <span className="flex gap-3 shrink-0">
                  <button className={coLink} onClick={() => coOpenPdf(`/cases/${i.case_id}/summary.pdf`, (m) => setMsg({ ok: false, text: m }))}>PDF</button>
                  <button className={coLink} onClick={() => onNav("case-packet", i.case_id)}>Open</button>
                  <button className="text-[11px] text-red-700 hover:underline" onClick={() => remove(i.case_id)}>Remove</button>
                </span>
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <select className={coInput} value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">Add a case…</option>
                {addable.map((c) => <option key={c.case_id} value={c.case_id}>{c.patient_name} (MRN {c.mrn})</option>)}
              </select>
              <button className={coPrimary} disabled={!pick} onClick={() => add(pick)}>Add</button>
            </div>
          </Card>

          {agenda && agenda.suggested.length > 0 && (
            <Card className="p-5">
              <SectionHeader>Ready for review, no decision yet</SectionHeader>
              {agenda.suggested.map((s: CoRec) => (
                <div key={s.case_id} className="flex items-center justify-between py-1.5">
                  <p className="text-xs text-[#1B2733]">{s.patient_name} <span className="text-[#5B6877]">{s.readiness_pct}% ready</span></p>
                  <button className={coLink} onClick={() => add(s.case_id)}>Add to agenda</button>
                </div>
              ))}
            </Card>
          )}

          <Card className="p-5">
            <SectionHeader>Surveillance needing attention{alerts ? ` (${alerts.total})` : ""}</SectionHeader>
            {alerts && alerts.items.length === 0 && <p className="text-xs text-[#6B7785] italic">Nothing overdue or due within 30 days.</p>}
            {alerts && alerts.items.map((a: CoRec) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-[#EEF2F6] last:border-b-0">
                <p className="text-xs text-[#1B2733]"><span className="font-medium">{a.patient_name}</span> <span className="text-[#5B6877]">{a.label}</span></p>
                <span className="flex items-center gap-3 shrink-0">
                  <span className={`text-[11px] px-2 py-0.5 rounded border ${CO_STATUS_STYLE[a.status] || ""}`}>{a.text}</span>
                  <button className={coLink} onClick={() => onNav("case-packet", a.case_id)}>Open</button>
                </span>
              </div>
            ))}
          </Card>

          <Card className="p-5">
            <SectionHeader>Looking back: decisions and what happened</SectionHeader>
            {review && (
              <p className="text-[11px] text-[#5B6877] mb-3">
                {review.summary.decided} decided · {review.summary.with_outcome} with an outcome noted · {review.summary.no_outcome_yet} without · {review.summary.plan_changed} where the plan changed
              </p>
            )}
            {review && review.rows.length === 0 && <p className="text-xs text-[#6B7785] italic">No decisions recorded yet.</p>}
            {review && review.rows.map((r: CoRec) => (
              <div key={r.case_id} className="py-2 border-b border-[#EEF2F6] last:border-b-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-[#1B2733]"><span className="font-medium">{r.patient_name}</span> <span className="text-[#5B6877]">decided {coFmtDate(r.decided_on)}{r.days_since != null ? ` (${r.days_since} day${r.days_since === 1 ? "" : "s"} ago)` : ""}</span></p>
                  <button className={coLink} onClick={() => onNav("case-packet", r.case_id)}>Open</button>
                </div>
                <p className="text-[11px] text-[#3D4B5C]">Plan: {r.recommendation}</p>
                {r.latest_outcome
                  ? <p className="text-[11px] text-[#3D4B5C]">{r.latest_outcome.status_label}{r.latest_outcome.event_date ? `, ${coFmtDate(r.latest_outcome.event_date)}` : ""}: {r.latest_outcome.note}</p>
                  : <p className="text-[11px] text-amber-800">No outcome noted yet</p>}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Trial manager (Settings, administrators) ─────────────────────────────
function TrialsAdminSection() {
  const [perms, setPerms] = useState<CoRec | null>(null);
  const [trials, setTrials] = useState<CoRec | null>(null);
  const [fields, setFields] = useState<CoRec[]>([]);
  const [form, setForm] = useState<CoRec | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    apiFetch(`${API_BASE}/trials`).then((r) => (r.ok ? r.json() : null)).then(setTrials).catch(() => {});
  };
  useEffect(() => {
    apiFetch(`${API_BASE}/me/permissions`).then((r) => (r.ok ? r.json() : null)).then(setPerms).catch(() => {});
    apiFetch(`${API_BASE}/trial-fields`).then((r) => (r.ok ? r.json() : null)).then((d) => d && setFields(d.fields)).catch(() => {});
    load();
  }, []);
  if (!perms || !perms.is_admin) return null;

  const blank = { name: "", nct_id: "", summary: "", source_note: "", last_verified: "", active: true, criteria: [] as CoRec[] };
  const setCrit = (i: number, k: string, v: string) => {
    const next = [...form!.criteria];
    next[i] = { ...next[i], [k]: v };
    if (k === "field_key") next[i].field_label = fields.find((f) => f.key === v)?.label || v;
    setForm({ ...form!, criteria: next });
  };

  const save = async () => {
    if (!form) return;
    setBusy(true); setMsg(null);
    const r = editId ? await coSend(`${API_BASE}/trials/${editId}`, "PUT", form) : await coSend(`${API_BASE}/trials`, "POST", form);
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: coDetail(r.data) }); return; }
    setForm(null); setEditId(null); load();
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this trial?")) return;
    const r = await coSend(`${API_BASE}/trials/${id}`, "DELETE");
    if (!r.ok) setMsg({ ok: false, text: coDetail(r.data) }); else load();
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <SectionHeader>Clinical trials (administrators)</SectionHeader>
        {!form && <button className={coGhost} onClick={() => { setForm({ ...blank }); setEditId(null); setMsg(null); }}>Add trial</button>}
      </div>
      <p className="text-[11px] text-[#5B6877] mb-3">
        Type in the criteria from the trial's own listing and note where they came from. UvealCare has no trial list of its own and does not check that these are current. Matches only compare recorded findings with what is typed here.
      </p>
      {form && (
        <div className="border border-[#E4E9EF] rounded p-3 mb-3 bg-[#F6F8FA]">
          <div className="grid grid-cols-2 gap-2">
            <CoField label="Trial name"><input className={coInput} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></CoField>
            <CoField label="Trial number (NCT01234567)"><input className={coInput} value={form.nct_id} onChange={(e) => setForm({ ...form, nct_id: e.target.value })} /></CoField>
            <CoField label="Where the criteria came from"><input className={coInput} value={form.source_note} onChange={(e) => setForm({ ...form, source_note: e.target.value })} /></CoField>
            <CoField label="Criteria last checked"><input type="date" className={coInput} value={form.last_verified} onChange={(e) => setForm({ ...form, last_verified: e.target.value })} /></CoField>
          </div>
          <div className="mt-2"><CoField label="Summary"><textarea rows={2} className={coInput} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></CoField></div>
          <p className="text-[11px] font-medium text-[#3D4B5C] mt-3 mb-1">Criteria</p>
          {form.criteria.map((c: CoRec, i: number) => (
            <div key={i} className="grid grid-cols-[110px_1fr_130px_1fr_auto] gap-2 mb-1.5 items-center">
              <select className={coInput} value={c.kind || ""} onChange={(e) => setCrit(i, "kind", e.target.value)}>
                <option value="">Type…</option><option value="inclusion">Must have</option><option value="exclusion">Excluded if</option>
              </select>
              <select className={coInput} value={c.field_key || ""} onChange={(e) => setCrit(i, "field_key", e.target.value)}>
                <option value="">Finding…</option>
                {fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
              <select className={coInput} value={c.op || ""} onChange={(e) => setCrit(i, "op", e.target.value)}>
                <option value="">Is…</option>
                {(trials?.ops ?? []).map((o: CoRec) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <input className={coInput} placeholder="value (present, absent, 2.5, Class 2)" value={c.value || ""} onChange={(e) => setCrit(i, "value", e.target.value)} />
              <button className="text-[11px] text-red-700 hover:underline" onClick={() => setForm({ ...form, criteria: form.criteria.filter((_: CoRec, j: number) => j !== i) })}>Remove</button>
            </div>
          ))}
          <button className={coLink} onClick={() => setForm({ ...form, criteria: [...form.criteria, { kind: "inclusion", field_key: "", op: "is", value: "" }] })}>Add criterion</button>
          <label className="flex items-center gap-2 text-xs text-[#3D4B5C] mt-3">
            <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active (include in matching)
          </label>
          <div className="flex gap-2 mt-3">
            <button className={coPrimary} disabled={busy} onClick={save}>{editId ? "Save changes" : "Add trial"}</button>
            <button className={coGhost} onClick={() => { setForm(null); setEditId(null); setMsg(null); }}>Cancel</button>
          </div>
        </div>
      )}
      <CoMsg m={msg} />
      {trials && trials.trials.length === 0 && !form && <p className="text-xs text-[#6B7785] italic">No trials entered yet.</p>}
      {trials && trials.trials.map((t: CoRec) => (
        <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-[#EEF2F6] last:border-b-0">
          <p className="text-xs text-[#1B2733]">{t.name}{t.nct_id ? <span className="text-[#5B6877]"> · {t.nct_id}</span> : null}
            <span className="text-[11px] text-[#5B6877]"> · {t.criteria.length} criteria{t.active ? "" : " · inactive"}</span></p>
          <span className="flex gap-3">
            <button className={coLink} onClick={() => { setEditId(t.id); setMsg(null); setForm({ name: t.name, nct_id: t.nct_id || "", summary: t.summary || "", source_note: t.source_note || "", last_verified: t.last_verified || "", active: t.active, criteria: t.criteria }); }}>Edit</button>
            <button className="text-[11px] text-red-700 hover:underline" onClick={() => remove(t.id)}>Delete</button>
          </span>
        </div>
      ))}
    </Card>
  );
}
'''


def fail(msg):
    print("  FAIL  " + msg)
    print("        Your App.tsx differs from what this patch expects. Nothing was changed.")
    sys.exit(1)


def apply(label, old, new):
    global content
    n = content.count(old)
    if n != 1:
        fail("%s: expected exactly 1 match, found %d" % (label, n))
    content = content.replace(old, new, 1)
    print("  OK    " + label)


if MARKER in content:
    print("  SKIP  care coordination (already applied)")
    print("\nNothing changed.")
    sys.exit(0)

if "function TeamPanel(" not in content or "async function readError(" not in content:
    fail("the roles frontend patch must be applied first (patch_roles_frontend.py)")

apply("screen type", '  | "patient-pathway"\n  | "settings";', '  | "patient-pathway"\n  | "board-agenda"\n  | "settings";')
apply("known screens", '"patient-pathway", "settings"];', '"patient-pathway", "board-agenda", "settings"];')
apply("sidebar link",
      '        <button onClick={() => onNav("dashboard")} className={navBtn(active === "dashboard")}>\n          <GridIcon size={15} />\n          Dashboard\n        </button>\n',
      '        <button onClick={() => onNav("dashboard")} className={navBtn(active === "dashboard")}>\n          <GridIcon size={15} />\n          Dashboard\n        </button>\n'
      '        <button onClick={() => onNav("board-agenda")} className={navBtn(active === "board-agenda")}>\n          <ClipboardIcon size={15} />\n          Board agenda\n        </button>\n')
apply("screen router",
      '        {screen === "settings" && <SettingsScreen user={loggedInUser} onLogout={handleLogout} />}\n',
      '        {screen === "board-agenda" && <BoardAgendaScreen onNav={handleNav} />}\n'
      '        {screen === "settings" && <SettingsScreen user={loggedInUser} onLogout={handleLogout} />}\n')
apply("case packet panels", '<TeamPanel caseId={packet.case_id} />', '<TeamPanel caseId={packet.case_id} />\n            <CoordinationPanels caseId={packet.case_id} />')
apply("settings trial manager", '<TeamRolesSection />', '<TeamRolesSection />\n\n          <TrialsAdminSection />')
apply("components", 'function SettingsScreen({', COMPONENTS + 'function SettingsScreen({')

if content == original:
    print("\nNothing changed.")
    sys.exit(0)
open(PATH, "w", encoding="utf-8").write(content)
print("\nDone - %s patched." % PATH)
