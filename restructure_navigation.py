"""
Reorganizes navigation around how a tumor board case is actually worked:

  * Workflow switcher dropdown (top of sidebar) replaces "click the logo".
  * Sidebar keeps only global items (Dashboard). Everything that belongs to
    one patient (Overview, Imaging, Case Readiness, Case Packet, Tumor
    Board, Record Decision) moves into a collapsible "Current patient"
    section that names the patient and only appears on patient screens.
  * User menu dropdown (bottom of sidebar): Settings and Sign out.
  * Dashboard patient list gets a search box and a filter dropdown.

Run from your uvealcare-frontend repo folder, AFTER restyle_frontend.py:

    python3 restructure_navigation.py
"""
import os
import re
import sys

MARK = "uvealcare: navigation restructure"
APP = "src/App.tsx" if os.path.exists("src/App.tsx") else "App.tsx"
src = open(APP, encoding="utf-8").read()
if MARK in src:
    print("Already applied - nothing to do.")
    sys.exit(0)
if "uvealcare-theme: light-clinical" not in src:
    print("FAIL  run restyle_frontend.py first, then this script.")
    sys.exit(1)


def fail(msg):
    print("FAIL  " + msg)
    sys.exit(1)


def once(old, new, label):
    global src
    if src.count(old) != 1:
        fail(f"{label}: expected 1 match, found {src.count(old)}")
    src = src.replace(old, new, 1)


NEW_SIDEBAR = '''const PATIENT_SCREENS: Screen[] = ["patient", "imaging", "case-readiness", "case-packet", "tumor-board", "tumor-board-decision"];
const PATIENT_NAV = [
  { id: "patient", label: "Overview", icon: UsersIcon },
  { id: "imaging", label: "Imaging", icon: ScanIcon },
  { id: "case-readiness", label: "Case Readiness", icon: ClipboardIcon },
  { id: "case-packet", label: "Case Packet", icon: GridIcon },
  { id: "tumor-board", label: "Tumor Board", icon: GroupIcon },
  { id: "tumor-board-decision", label: "Record Decision", icon: CheckIcon },
] as const;

function Sidebar({ active, onNav, user, caseId, diseaseKey, onSelectWorkflow, onLogout }: {
  active: Screen;
  onNav: (s: Screen, caseId?: string) => void;
  user: { name: string; email: string; role: string } | null;
  caseId: string;
  diseaseKey: string;
  onSelectWorkflow: (key: string) => void;
  onLogout: () => void;
}) {
  const initials = user ? getInitials(user.name) : "?";
  const roleLabel = user ? user.role.replace(/_/g, " ").replace(/\\b\\w/g, (c) => c.toUpperCase()) : "";
  const inPatient = PATIENT_SCREENS.includes(active);

  const [profiles, setProfiles] = useState<{ key: string; display_name: string }[]>([]);
  const [patient, setPatient] = useState<{ id: string; name: string; mrn: string } | null>(null);
  const [menu, setMenu] = useState<"workflow" | "user" | null>(null);
  const [patientOpen, setPatientOpen] = useState(true);
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/disease-profiles`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setProfiles(data); })
      .catch(() => {});
  }, []);

  // Only ever shows the name for the case currently on screen, never a
  // previously viewed patient while the next one loads.
  useEffect(() => {
    if (!caseId || !inPatient) return;
    let cancelled = false;
    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => { if (d && !cancelled) setPatient({ id: caseId, name: d.patient, mrn: d.mrn }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [caseId, inPatient]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (asideRef.current && !asideRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const shown = patient && patient.id === caseId ? patient : null;
  const workflowName = profiles.find((p) => p.key === diseaseKey)?.display_name ?? "Clinical Platform";
  const navBtn = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors text-left border ${
      isActive
        ? "bg-white border-[#D5DBE3] text-[#0F2D56] font-semibold"
        : "border-transparent text-[#3D4B5C] hover:bg-[#EEF2F6] hover:text-[#1B2733]"
    }`;

  return (
    <aside ref={asideRef} className="w-56 shrink-0 flex flex-col h-full bg-[#F6F8FA] border-r border-[#D5DBE3]">
      <div className="relative border-b border-[#D5DBE3]">
        <button
          onClick={() => setMenu(menu === "workflow" ? null : "workflow")}
          aria-haspopup="menu"
          aria-expanded={menu === "workflow"}
          className="w-full px-4 py-3 flex items-center gap-2.5 text-left hover:bg-[#EEF2F6] transition-colors"
        >
          <div className="w-7 h-7 rounded bg-[#0F2D56] text-white flex items-center justify-center shrink-0">
            <EyeIcon size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[#1B2733] font-semibold text-[15px] leading-tight">UvealCare</p>
            <p className="text-[#5B6877] text-[11px] truncate">{workflowName}</p>
          </div>
          <span className="text-[#5B6877] shrink-0"><ChevronDownIcon size={12} /></span>
        </button>
        {menu === "workflow" && (
          <div role="menu" className="absolute left-3 right-3 top-full mt-1 z-30 bg-white border border-[#D5DBE3] rounded shadow-lg py-1">
            <p className="px-3 py-1.5 text-[11px] text-[#5B6877]">Switch workflow</p>
            {profiles.map((p) => (
              <button
                key={p.key}
                role="menuitem"
                onClick={() => {
                  setMenu(null);
                  if (p.key !== diseaseKey) onSelectWorkflow(p.key);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-[#1B2733] hover:bg-[#F6F8FA] transition-colors"
              >
                {p.display_name}
                {p.key === diseaseKey && <span className="text-[#0B63B6]"><CheckIcon size={13} /></span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <button onClick={() => onNav("dashboard")} className={navBtn(active === "dashboard")}>
          <GridIcon size={15} />
          Dashboard
        </button>

        {inPatient && (
          <div className="mt-4 pt-3 border-t border-[#D5DBE3]">
            <button
              onClick={() => setPatientOpen(!patientOpen)}
              aria-expanded={patientOpen}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded text-left hover:bg-[#EEF2F6] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-[11px] text-[#5B6877]">Current patient</p>
                <p className="text-sm font-semibold text-[#1B2733] truncate">{shown ? shown.name : "Loading…"}</p>
                {shown && <p className="text-[11px] text-[#5B6877]">MRN {shown.mrn}</p>}
              </div>
              <span className={`text-[#5B6877] shrink-0 transition-transform ${patientOpen ? "" : "-rotate-90"}`}>
                <ChevronDownIcon size={12} />
              </span>
            </button>
            {patientOpen && (
              <div className="mt-1 space-y-0.5">
                {PATIENT_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => onNav(item.id as Screen)} className={navBtn(active === item.id)}>
                      <Icon size={15} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="relative border-t border-[#D5DBE3]">
        {menu === "user" && (
          <div role="menu" className="absolute left-3 right-3 bottom-full mb-1 z-30 bg-white border border-[#D5DBE3] rounded shadow-lg py-1">
            <button
              role="menuitem"
              onClick={() => { setMenu(null); onNav("settings"); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left text-[#1B2733] hover:bg-[#F6F8FA] transition-colors"
            >
              <SettingsIcon size={14} />
              Settings
            </button>
            <button
              role="menuitem"
              onClick={() => { setMenu(null); onLogout(); }}
              className="w-full px-3 py-2 text-sm text-left text-[#1B2733] hover:bg-[#F6F8FA] transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
        <button
          onClick={() => setMenu(menu === "user" ? null : "user")}
          aria-haspopup="menu"
          aria-expanded={menu === "user"}
          className="w-full px-4 py-3.5 flex items-center gap-2.5 text-left hover:bg-[#EEF2F6] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#0F2D56] text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[#1B2733] text-xs font-medium truncate">{user?.name ?? "Not signed in"}</p>
            <p className="text-[#5B6877] text-[11px] truncate">{roleLabel}</p>
          </div>
          <span className="text-[#5B6877] shrink-0 rotate-180"><ChevronDownIcon size={12} /></span>
        </button>
      </div>
    </aside>
  );
}

'''
a = src.find("function Sidebar(")
b = src.find("function TopBar(")
if a < 0 or b < a or src.count("function Sidebar(") != 1:
    fail("Sidebar region not found")
src = src[:a] + NEW_SIDEBAR + src[b:]

# Old nav list is no longer used.
a = src.find("const NAV_ITEMS = [")
b = src.find("] as const;\n", a)
if a < 0 or b < 0:
    fail("NAV_ITEMS not found")
src = src[:a] + src[b + len("] as const;\n"):].lstrip("\n")

once("function ChevronRightIcon(", '''function ChevronDownIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon(''', "chevron down icon")

once('''        <Sidebar
          active={screen}
          onNav={handleNav}
          user={loggedInUser}
          onSwitchWorkflow={() => {
            setScreen("disease-select");
            window.history.pushState(null, "", "#disease-select");
          }}
        />''', '''        <Sidebar
          active={screen}
          onNav={handleNav}
          user={loggedInUser}
          caseId={selectedCaseId}
          diseaseKey={selectedDiseaseProfileKey}
          onSelectWorkflow={(key) => {
            setSelectedDiseaseProfileKey(key);
            setSelectedCaseId(""); // fresh fallback case for the newly chosen workflow
            setScreen("dashboard");
            window.history.pushState(null, "", "#dashboard");
          }}
          onLogout={handleLogout}
        />''', "Sidebar usage")

# ---- Dashboard: search + filter ----------------------------------------------
once("  const sortedPatients = [...patients].sort((a, b) => {", '''  const [searchText, setSearchText] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "attention" | "ready">("all");
  const visiblePatients = patients.filter((p) => {
    const q = searchText.trim().toLowerCase();
    if (q && !(p.patient_name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q))) return false;
    if (filterMode === "attention") return p.readiness_pct < 100;
    if (filterMode === "ready") return p.readiness_pct === 100;
    return true;
  });

  const sortedPatients = [...visiblePatients].sort((a, b) => {''', "patient filtering")

once('''              <div className="flex items-center gap-1.5">
                <label className="text-[11px] text-[#5B6877]">Sort:</label>''', '''              <div className="flex items-center gap-2">
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search name or MRN"
                  aria-label="Search patients"
                  className="w-40 bg-white border border-[#D5DBE3] text-[#3D4B5C] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#0B63B6]"
                />
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as typeof filterMode)}
                  aria-label="Filter patients"
                  className="bg-[#F6F8FA] border border-[#D5DBE3] text-[#3D4B5C] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#0B63B6]"
                >
                  <option value="all">All patients</option>
                  <option value="attention">Needs attention</option>
                  <option value="ready">Ready for review</option>
                </select>
                <label className="text-[11px] text-[#5B6877]">Sort:</label>''', "search and filter controls")

once("{sortedPatients.map((p) => {", '''{sortedPatients.length === 0 && patients.length > 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-[#5B6877]">
                      No patients match the current search or filter.
                    </td>
                  </tr>
                )}
                {sortedPatients.map((p) => {''', "empty filter state")

# Tighter cell padding so the Readiness column stays in view.
a = src.find("<SectionHeader>Active Patients</SectionHeader>")
e = src.find("</table>", a)
if a < 0 or e < 0:
    fail("patient table region")
seg = src[a:e].replace("px-4 py-2.5", "px-3 py-2.5").replace("px-4 py-3", "px-3 py-3")
src = src[:a] + seg + src[e:]

open(APP, "w", encoding="utf-8").write("// " + MARK + "\n" + src)
print("OK    " + APP + " navigation restructured")
