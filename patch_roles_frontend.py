"""
Patches App.tsx in place to add the screens for roles and for smart import:

  * Case Packet: a "Care Team" card (who is on the case, add/remove people,
    request a consult from another specialty, sign off as your role, and the
    case's access log)
  * Settings: a "Team & Roles" section (what your role can do; for
    administrators, change anyone's role and see the full access log)
  * Imaging: a "Smart import" box (drop files, a folder or a .zip; the study is
    detected for you; wrong-patient files are held back)
  * Sign-up: the new specialist roles in the role list

Run from inside your frontend folder (same folder as src/App.tsx or App.tsx):

    python3 patch_roles_frontend.py

Needs the backend patches (patch_roles_backend.py and
patch_smart_import_backend.py) to be live. Independent of the other frontend
patches: apply in any order. Safe to run twice.
"""
import os
import sys

path = None
for cand in ("src/App.tsx", "App.tsx"):
    if os.path.exists(cand):
        path = cand
        break
if not path:
    print("FAIL  App.tsx not found. Run this from your frontend folder.")
    sys.exit(1)

content = open(path, "r", encoding="utf-8").read()
original = content


def fail(msg):
    print("  FAIL  " + msg)
    print("        Your App.tsx differs from what this patch expects. Nothing was changed.")
    sys.exit(1)


def replace_once(text, old, new, label):
    if text.count(old) != 1:
        fail("%s: expected exactly 1 match, found %d" % (label, text.count(old)))
    return text.replace(old, new, 1)


COMPONENTS = r'''// uvealcare: roles and smart import
// ─── Care team, roles, and smart import ──────────────────────────────────────
type MyPerms = {
  role: string; label: string; is_admin: boolean; restricted: boolean;
  write_categories: string[] | null; can_write_images: boolean; can_manage_team: boolean; summary: string;
};
type TeamMember = { user_id: string; name: string; team_role: string; label: string; added_by: string | null };
type Signoff = { role: string; label: string; by: string; note: string | null; at: string | null };
type AuditRow = { at: string | null; user: string; role: string; action: string; status: number | null; detail: string | null; case_id?: string | null };

function fmtWhen(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

async function readError(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  return typeof data.detail === "string" ? data.detail : fallback;
}

function AuditList({ rows }: { rows: AuditRow[] }) {
  if (rows.length === 0) return <p className="text-xs text-[#5B6877] italic">Nothing recorded yet.</p>;
  return (
    <div className="max-h-64 overflow-y-auto border border-[#E4E9EF] rounded">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-3 px-3 py-1.5 text-[11px] border-b border-[#EEF2F6] last:border-b-0">
          <span className="text-[#6B7785] w-28 shrink-0">{fmtWhen(r.at)}</span>
          <span className="text-[#1B2733] w-32 shrink-0 truncate">{r.user}</span>
          <span className={r.action.startsWith("blocked") ? "text-red-700" : "text-[#3D4B5C]"}>
            {r.detail || r.action}
          </span>
        </div>
      ))}
    </div>
  );
}

function TeamPanel({ caseId }: { caseId: string }) {
  const [perms, setPerms] = useState<MyPerms | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [signoffs, setSignoffs] = useState<Signoff[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [audit, setAudit] = useState<AuditRow[] | null>(null);
  const [addId, setAddId] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    apiFetch(`${API_BASE}/me/permissions`).then((r) => (r.ok ? r.json() : null)).then(setPerms).catch(() => {});
    apiFetch(`${API_BASE}/cases/${caseId}/team`).then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMembers(d.members)).catch(() => {});
    apiFetch(`${API_BASE}/cases/${caseId}/signoffs`).then((r) => (r.ok ? r.json() : [])).then(setSignoffs).catch(() => {});
    apiFetch(`${API_BASE}/users`).then((r) => (r.ok ? r.json() : [])).then(setUsers).catch(() => {});
  };
  useEffect(() => { load(); setAudit(null); setMsg(null); }, [caseId]);

  const send = async (url: string, method: string, body: unknown, okText: string) => {
    setBusy(true); setMsg(null);
    try {
      const res = await apiFetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error(await readError(res, "That didn't work."));
      setMsg({ ok: true, text: okText });
      load();
      if (audit) loadAudit();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "That didn't work." });
    } finally { setBusy(false); }
  };

  const loadAudit = () =>
    apiFetch(`${API_BASE}/cases/${caseId}/audit`).then((r) => (r.ok ? r.json() : null)).then((d) => d && setAudit(d)).catch(() => {});

  const onTeam = new Set(members.map((m) => m.user_id));
  const addable = users.filter((u) => !onTeam.has(u.id));
  const canManage = perms?.can_manage_team ?? false;
  const mySigned = signoffs.find((s) => perms && s.role === perms.role);

  return (
    <Card className="p-5 print:hidden">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader>Care Team</SectionHeader>
        {perms && (
          <span className="text-[11px] text-[#3D4B5C] bg-[#F6F8FA] px-2 py-0.5 rounded shrink-0">You: {perms.label}</span>
        )}
      </div>

      {members.length === 0 ? (
        <p className="text-xs text-[#5B6877] italic mb-3">
          No one has been added yet. Specialists (radiation and systemic oncology) can only open a case once they are on its team.
        </p>
      ) : (
        <div className="mb-3 space-y-1">
          {members.map((m) => (
            <div key={m.user_id} className="flex items-center justify-between text-xs border-b border-[#EEF2F6] py-1.5">
              <span><span className="text-[#1B2733] font-medium">{m.name}</span> <span className="text-[#5B6877]">· {m.label}</span></span>
              {canManage && (
                <button
                  disabled={busy}
                  onClick={() => send(`${API_BASE}/cases/${caseId}/team/${m.user_id}`, "DELETE", null, `${m.name} removed.`)}
                  className="text-[11px] text-red-700 hover:underline disabled:opacity-50"
                  aria-label={`Remove ${m.name} from the care team`}
                >Remove</button>
              )}
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className="flex gap-2 mb-4">
          <select value={addId} onChange={(e) => setAddId(e.target.value)} aria-label="Person to add"
            className="flex-1 border border-[#C4CCD6] rounded px-2 py-1.5 text-xs text-[#1B2733] bg-white">
            <option value="">Add someone to this case…</option>
            {addable.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.role.replace(/_/g, " ")})</option>
            ))}
          </select>
          <button
            disabled={!addId || busy}
            onClick={() => { send(`${API_BASE}/cases/${caseId}/team`, "POST", { user_id: addId }, "Added to the care team."); setAddId(""); }}
            className="text-xs font-medium text-white bg-[#0B63B6] px-3 py-1.5 rounded disabled:opacity-40"
          >Add</button>
        </div>
      )}

      <div className="mb-4">
        <p className="text-[11px] font-semibold text-[#3D4B5C] mb-1.5">Ask another specialty to review</p>
        <input
          value={note} onChange={(e) => setNote(e.target.value)} maxLength={300}
          placeholder="Optional note, e.g. plaque or proton?" aria-label="Consult note"
          className="w-full border border-[#C4CCD6] rounded px-2 py-1.5 text-xs mb-2"
        />
        <div className="flex flex-wrap gap-2">
          {[["ocular_oncologist", "Ocular oncology"], ["radiation_oncologist", "Radiation oncology"], ["systemic_oncologist", "Systemic oncology"]].map(([k, l]) => (
            <button key={k} disabled={busy}
              onClick={() => { send(`${API_BASE}/cases/${caseId}/consult-request`, "POST", { to_role: k, note }, `${l} review requested. It now shows on their task list.`); setNote(""); }}
              className="text-xs text-[#0B63B6] border border-[#B9D3EC] bg-[#F3F8FD] px-3 py-1.5 rounded hover:bg-[#E6F0FA] disabled:opacity-50"
            >Request {l.toLowerCase()}</button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[11px] font-semibold text-[#3D4B5C] mb-1.5">Sign-offs</p>
        {signoffs.length === 0 ? (
          <p className="text-xs text-[#5B6877] italic">No one has signed off yet.</p>
        ) : (
          signoffs.map((s) => (
            <p key={s.role} className="text-xs text-[#1B2733]">
              <span className="text-emerald-700">✓</span> {s.label}: {s.by} <span className="text-[#6B7785]">· {fmtWhen(s.at)}</span>
            </p>
          ))
        )}
        <button
          disabled={busy}
          onClick={() => send(`${API_BASE}/cases/${caseId}/signoff`, "POST", { note: "" }, "Signed off.")}
          className="mt-2 text-xs text-[#1B2733] border border-[#C4CCD6] px-3 py-1.5 rounded hover:bg-[#EEF2F6] disabled:opacity-50"
        >{mySigned ? "Sign off again" : `Sign off as ${perms?.label ?? "my role"}`}</button>
      </div>

      {msg && (
        <p role="status" className={`text-xs mb-2 ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>
      )}

      {perms && !perms.restricted && (
        <div>
          <button onClick={() => (audit ? setAudit(null) : loadAudit())} className="text-[11px] text-[#0B63B6] hover:underline">
            {audit ? "Hide access log" : "Show access log"}
          </button>
          {audit && <div className="mt-2"><AuditList rows={audit} /></div>}
        </div>
      )}
    </Card>
  );
}

function TeamRolesSection() {
  const [perms, setPerms] = useState<MyPerms | null>(null);
  const [catalog, setCatalog] = useState<{ key: string; label: string; summary: string }[]>([]);
  const [people, setPeople] = useState<{ id: string; name: string; email: string; role: string; label: string; is_admin: boolean; restricted: boolean; case_count: number }[]>([]);
  const [audit, setAudit] = useState<AuditRow[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadPeople = () =>
    apiFetch(`${API_BASE}/admin/users`).then((r) => (r.ok ? r.json() : [])).then(setPeople).catch(() => {});

  useEffect(() => {
    apiFetch(`${API_BASE}/me/permissions`).then((r) => (r.ok ? r.json() : null)).then((p) => {
      setPerms(p);
      if (p?.is_admin) loadPeople();
    }).catch(() => {});
    apiFetch(`${API_BASE}/roles`).then((r) => (r.ok ? r.json() : null)).then((d) => d && setCatalog(d.roles)).catch(() => {});
  }, []);

  const act = async (url: string, method: string, body: unknown, okText: string) => {
    setMsg(null);
    try {
      const res = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      if (!res.ok) throw new Error(await readError(res, "That didn't work."));
      const data = await res.json().catch(() => ({}));
      setMsg({ ok: true, text: typeof data.added === "number" ? `${okText} (${data.added} case${data.added === 1 ? "" : "s"}).` : okText });
      loadPeople();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "That didn't work." });
    }
  };

  if (!perms) return null;
  return (
    <Card className="p-5">
      <SectionHeader>Team &amp; Roles</SectionHeader>
      <p className="text-xs text-[#1B2733] font-medium">{perms.label}</p>
      <p className="text-xs text-[#5B6877] mt-1 mb-3">{perms.summary}</p>
      {perms.restricted && (
        <p className="text-[11px] text-[#3D4B5C] bg-[#F6F8FA] rounded px-3 py-2 mb-3">
          You can open cases you've been added to. You can edit: {(perms.write_categories ?? []).map((c) => c.replace(/_/g, " ")).join(", ") || "nothing"}
          {perms.can_write_images ? ", and add imaging." : ". Imaging is view-only."}
        </p>
      )}

      <p className="text-[11px] font-semibold text-[#3D4B5C] mb-1.5">What each role can do</p>
      <div className="space-y-1.5 mb-4">
        {catalog.filter((r) => ["ocular_oncologist", "radiation_oncologist", "systemic_oncologist", "admin"].includes(r.key)).map((r) => (
          <p key={r.key} className="text-xs text-[#3D4B5C]"><span className="font-medium text-[#1B2733]">{r.label}.</span> {r.summary}</p>
        ))}
      </div>

      {perms.is_admin && (
        <>
          <p className="text-[11px] font-semibold text-[#3D4B5C] mb-1.5">Accounts</p>
          <div className="border border-[#E4E9EF] rounded mb-3">
            {people.map((u) => (
              <div key={u.id} className="flex items-center gap-2 px-3 py-2 border-b border-[#EEF2F6] last:border-b-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#1B2733] truncate">{u.name}{u.is_admin ? " · admin" : ""}</p>
                  <p className="text-[11px] text-[#6B7785] truncate">{u.email}{u.restricted ? ` · on ${u.case_count} case${u.case_count === 1 ? "" : "s"}` : ""}</p>
                </div>
                <select
                  value={u.role === "medical_oncologist" ? "systemic_oncologist" : u.role} aria-label={`Role for ${u.name}`}
                  onChange={(e) => act(`${API_BASE}/users/${u.id}/role`, "PUT", { role: e.target.value }, `${u.name} is now ${e.target.value.replace(/_/g, " ")}.`)}
                  className="border border-[#C4CCD6] rounded px-2 py-1 text-xs bg-white"
                >
                  {catalog.some((c) => c.key === u.role) ? null : <option value={u.role}>{u.role.replace(/_/g, " ")}</option>}
                  {catalog.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                {u.restricted && (
                  <button
                    onClick={() => act(`${API_BASE}/users/${u.id}/team-all`, "POST", null, `${u.name} added to every case`)}
                    className="text-[11px] text-[#0B63B6] hover:underline shrink-0"
                  >Add to all cases</button>
                )}
              </div>
            ))}
          </div>
          {msg && <p role="status" className={`text-xs mb-2 ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>}
          <button
            onClick={() => (audit ? setAudit(null) : apiFetch(`${API_BASE}/audit`).then((r) => (r.ok ? r.json() : null)).then((d) => d && setAudit(d)))}
            className="text-[11px] text-[#0B63B6] hover:underline"
          >{audit ? "Hide access log" : "Show full access log"}</button>
          {audit && <div className="mt-2"><AuditList rows={audit} /></div>}
        </>
      )}
    </Card>
  );
}

type SmartResult = {
  name: string; status: "imported" | "held" | "needs_study" | "skipped" | "error";
  field_key: string | null; field_label: string | null; images: number; reason: string | null;
  problems: string[]; detected_by?: string;
};

async function collectDropped(items: DataTransferItemList): Promise<File[]> {
  const out: File[] = [];
  const walk = async (entry: any, prefix: string): Promise<void> => {
    if (entry.isFile) {
      const file: File = await new Promise((res, rej) => entry.file(res, rej));
      out.push(new File([file], prefix + file.name, { type: file.type }));
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      let batch: any[] = [];
      do {
        batch = await new Promise((res, rej) => reader.readEntries(res, rej));
        for (const e of batch) await walk(e, prefix + entry.name + "/");
      } while (batch.length > 0);
    }
  };
  const entries: any[] = [];
  for (let i = 0; i < items.length; i++) {
    const e = (items[i] as any).webkitGetAsEntry?.();
    if (e) entries.push(e);
  }
  for (const e of entries) await walk(e, "");
  return out;
}

function SmartImportPanel({ caseId, onDone }: { caseId: string; onDone: () => void }) {
  const [studies, setStudies] = useState<{ key: string; label: string }[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [studyKey, setStudyKey] = useState("auto");
  const [neutral, setNeutral] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SmartResult[] | null>(null);
  const [summary, setSummary] = useState("");
  const [pickFor, setPickFor] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}/readiness`).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d?.checklist) setStudies(d.checklist.filter((c: any) => c.category === "imaging").map((c: any) => ({ key: c.key, label: c.field })));
    }).catch(() => {});
    setFiles([]); setResults(null); setError(null);
  }, [caseId]);

  const run = async (opts: { field?: string; allow?: boolean; only?: string[] }) => {
    if (files.length === 0) return;
    setBusy(true); setError(null);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f, (f as any).webkitRelativePath || f.name));
      form.append("field_key", opts.field ?? studyKey);
      form.append("neutral_names", neutral ? "true" : "false");
      form.append("allow_mismatch", opts.allow ? "true" : "false");
      if (opts.only) form.append("only", JSON.stringify(opts.only));
      const res = await apiFetch(`${API_BASE}/cases/${caseId}/images/import-smart`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await readError(res, "Import failed."));
      const data = await res.json();
      // A re-run only covers some files, so merge into what we already showed.
      setResults((prev) => {
        if (!opts.only || !prev) return data.results;
        const redone = new Set(opts.only);
        return [...prev.filter((r) => !redone.has(r.name)), ...data.results];
      });
      setSummary(`${data.imported_images} image${data.imported_images === 1 ? "" : "s"} added from ${data.imported_files} file${data.imported_files === 1 ? "" : "s"}.`);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally { setBusy(false); }
  };

  const addFiles = (list: File[]) => { setFiles(list); setResults(null); setError(null); };
  const held = results?.filter((r) => r.status === "held") ?? [];
  const unsorted = results?.filter((r) => r.status === "needs_study") ?? [];
  const chip = (s: SmartResult["status"]) =>
    s === "imported" ? "bg-emerald-50 text-emerald-700" : s === "held" ? "bg-amber-50 text-amber-800" :
    s === "needs_study" ? "bg-blue-50 text-blue-800" : s === "error" ? "bg-red-50 text-red-700" : "bg-[#F6F8FA] text-[#5B6877]";
  const chipText = (s: SmartResult["status"]) =>
    s === "imported" ? "Imported" : s === "held" ? "Held back" : s === "needs_study" ? "Choose a study" : s === "error" ? "Problem" : "Skipped";

  return (
    <div className="mb-6 border border-[#D5DBE3] rounded p-5 bg-[#FBFCFD]">
      <h3 className="text-sm font-semibold text-[#1B2733]">Smart import</h3>
      <p className="text-xs text-[#5B6877] mt-1 mb-3">
        Drop DICOM files, PDF reports, a whole folder, or a .zip from an Optos, Heidelberg or Visage export. The study type is detected for you,
        and files that belong to a different patient or the other eye are held back.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (e) => {
          e.preventDefault(); setDragging(false);
          const dropped = await collectDropped(e.dataTransfer.items);
          addFiles(dropped.length ? dropped : Array.from(e.dataTransfer.files));
        }}
        className={`border-2 border-dashed rounded px-4 py-6 text-center text-xs ${dragging ? "border-[#0B63B6] bg-[#F3F8FD]" : "border-[#C4CCD6] bg-white"}`}
      >
        <p className="text-[#3D4B5C] mb-2">{files.length > 0 ? `${files.length} file${files.length === 1 ? "" : "s"} ready` : "Drag files or a folder here"}</p>
        <div className="flex justify-center gap-2">
          <button onClick={() => fileRef.current?.click()} className="text-xs text-[#0B63B6] border border-[#B9D3EC] bg-white px-3 py-1.5 rounded hover:bg-[#F3F8FD]">Choose files or .zip</button>
          <button onClick={() => folderRef.current?.click()} className="text-xs text-[#0B63B6] border border-[#B9D3EC] bg-white px-3 py-1.5 rounded hover:bg-[#F3F8FD]">Choose a folder</button>
        </div>
        <input ref={fileRef} type="file" multiple className="hidden" data-testid="smart-files"
          onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))} />
        <input ref={folderRef} type="file" className="hidden" data-testid="smart-folder"
          {...({ webkitdirectory: "", directory: "" } as any)}
          onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))} />
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3">
        <label className="text-xs text-[#3D4B5C] flex items-center gap-2">
          Study
          <select value={studyKey} onChange={(e) => setStudyKey(e.target.value)} className="border border-[#C4CCD6] rounded px-2 py-1 text-xs bg-white">
            <option value="auto">Detect automatically</option>
            {studies.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
        <label className="text-xs text-[#3D4B5C] flex items-center gap-2">
          <input type="checkbox" checked={neutral} onChange={(e) => setNeutral(e.target.checked)} />
          Replace file names with neutral labels (recommended)
        </label>
        <button
          disabled={files.length === 0 || busy}
          onClick={() => run({})}
          className="ml-auto text-xs font-medium text-white bg-[#0B63B6] px-4 py-2 rounded disabled:opacity-40"
        >{busy ? "Importing…" : "Import"}</button>
      </div>

      {error && <p role="alert" className="text-xs text-red-700 mt-3">{error}</p>}

      {results && (
        <div className="mt-4">
          <p className="text-xs font-medium text-[#1B2733] mb-2">{summary}</p>
          <div className="border border-[#E4E9EF] rounded bg-white">
            {results.map((r, i) => (
              <div key={i} className="px-3 py-2 border-b border-[#EEF2F6] last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#1B2733] truncate flex-1">{r.name}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded shrink-0 ${chip(r.status)}`}>{chipText(r.status)}</span>
                </div>
                <p className="text-[11px] text-[#5B6877] mt-0.5">
                  {r.status === "imported" && `${r.images} image${r.images === 1 ? "" : "s"} added to ${r.field_label}${r.detected_by ? ` (${r.detected_by})` : ""}.`}
                  {r.status !== "imported" && r.reason}
                </p>
                {r.problems.map((p, j) => <p key={j} className="text-[11px] text-amber-800 mt-0.5">{p}</p>)}
              </div>
            ))}
          </div>

          {held.length > 0 && (
            <div className="mt-3 text-xs bg-amber-50 border border-amber-200 rounded px-3 py-2">
              <p className="text-amber-900 mb-2">
                {held.length} file{held.length === 1 ? " was" : "s were"} held back because {held.length === 1 ? "it doesn't" : "they don't"} match this patient or eye.
                Check you have the right case before overriding.
              </p>
              <button disabled={busy} onClick={() => run({ allow: true, only: held.map((h) => h.name) })}
                className="text-xs text-amber-900 border border-amber-400 bg-white px-3 py-1.5 rounded hover:bg-amber-100 disabled:opacity-50">
                Import the held files anyway
              </button>
            </div>
          )}

          {unsorted.length > 0 && (
            <div className="mt-3 text-xs bg-blue-50 border border-blue-200 rounded px-3 py-2 flex flex-wrap items-center gap-2">
              <span className="text-blue-900">{unsorted.length} file{unsorted.length === 1 ? "" : "s"} couldn't be sorted. Put {unsorted.length === 1 ? "it" : "them"} in:</span>
              <select value={pickFor} onChange={(e) => setPickFor(e.target.value)} className="border border-[#C4CCD6] rounded px-2 py-1 text-xs bg-white" aria-label="Study for unsorted files">
                <option value="">Choose a study…</option>
                {studies.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <button disabled={!pickFor || busy} onClick={() => run({ field: pickFor, only: unsorted.map((u) => u.name) })}
                className="text-xs text-blue-900 border border-blue-400 bg-white px-3 py-1.5 rounded hover:bg-blue-100 disabled:opacity-50">Import</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImagingWithSmartImport({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  const [tick, setTick] = useState(0);
  return (
    <>
      <SmartImportPanel caseId={caseId} onDone={() => setTick((t) => t + 1)} />
      <ImagingContent key={tick} onNav={onNav} caseId={caseId} />
    </>
  );
}

'''

if "// uvealcare: roles and smart import" in content:
    print("  SKIP  new components (already applied)")
else:
    content = replace_once(content, "function SettingsScreen(", COMPONENTS + "function SettingsScreen(", "SettingsScreen anchor")
    print("  OK    TeamPanel, TeamRolesSection, SmartImportPanel components")

# Case packet: care team card, placed just before the key-images block
tp = "<TeamPanel caseId={packet.case_id} />"
if tp in content:
    print("  SKIP  care team card (already applied)")
else:
    anchor = "{/* Key images — one representative slice per study */}"
    content = replace_once(content, anchor, tp + "\n            " + anchor, "case packet anchor")
    print("  OK    Care Team card on the case packet")

# Settings: Team & Roles section
tr = "<TeamRolesSection />"
if tr in content:
    print("  SKIP  settings section (already applied)")
else:
    anchor = "          {/* Disease profiles — real backend data, proving the platform's"
    content = replace_once(content, anchor, "          " + tr + "\n\n" + anchor, "settings anchor")
    print("  OK    Team & Roles section in Settings")

# Imaging screen: smart import above the study list
if "<ImagingWithSmartImport" in content:
    print("  SKIP  imaging screen (already applied)")
else:
    old = "        <ImagingContent onNav={onNav} caseId={caseId} />\n      </div>\n    </div>\n  );\n}\n"
    new = "        <ImagingWithSmartImport onNav={onNav} caseId={caseId} />\n      </div>\n    </div>\n  );\n}\n"
    content = replace_once(content, old, new, "imaging screen anchor")
    print("  OK    Smart import box on the Imaging screen")

# Sign-up role list
if 'value="ocular_oncologist"' in content:
    print("  SKIP  sign-up roles (already applied)")
else:
    old = '                  <option value="ophthalmologist">Ophthalmologist</option>\n'
    new = ('                  <option value="ocular_oncologist">Ocular Oncologist</option>\n' + old)
    content = replace_once(content, old, new, "signup option anchor")
    old2 = '                  <option value="medical_oncologist">Medical Oncologist</option>\n'
    content = replace_once(content, old2, '                  <option value="systemic_oncologist">Systemic (Medical) Oncologist</option>\n', "signup option 2 anchor")
    print("  OK    sign-up role list")

if content == original:
    print("\nNothing changed.")
    sys.exit(0)
open(path, "w", encoding="utf-8").write(content)
print("\nDone - %s patched." % path)
