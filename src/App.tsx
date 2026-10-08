// uvealcare: navigation restructure
// uvealcare: placeholder content removed
// uvealcare-theme: light-clinical
import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "login"
  | "disease-select"
  | "dashboard"
  | "patient"
  | "case-readiness"
  | "imaging"
  | "case-packet"
  | "tumor-board"
  | "tumor-board-decision"
  | "patient-pathway"
  | "settings";

// ─── Constants / Data ─────────────────────────────────────────────────────────
// (Removed: a hardcoded Margaret-specific PATIENT object used to live
// here. PatientPathwayScreen now fetches real data for whichever
// patient is actually selected, instead of always showing one
// hardcoded showcase case.)

// (Removed: a hardcoded generic journey-stages list also used to live
// here. Every screen that shows a care-stage timeline now uses the real
// per-disease stages returned by the backend instead.)

// ─── Icons ────────────────────────────────────────────────────────────────────
function GridIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}
function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <circle cx="12" cy="5" r="2" />
      <path d="M15 13c0-2-1.3-3.7-3-4.4" />
    </svg>
  );
}
function ClipboardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="2" width="10" height="13" rx="1.5" />
      <path d="M6 2V1h4v1" />
      <path d="M5 7h6M5 10h4" />
    </svg>
  );
}
function ScanIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 4V2h3M12 1h3v3M1 12v3h3M12 15h3v-3" />
      <rect x="4" y="4" width="8" height="8" rx="1" />
    </svg>
  );
}
function GroupIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="4" r="2.5" />
      <circle cx="2.5" cy="11" r="2" />
      <circle cx="13.5" cy="11" r="2" />
      <path d="M5.5 14c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5" />
      <path d="M5.5 8.5C4.6 6.9 3 6 1.5 6.4" />
      <path d="M10.5 8.5C11.4 6.9 13 6 14.5 6.4" />
    </svg>
  );
}
function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SettingsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M11.5 4.5l1.4-1.4M3.1 12.9l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}
function AlertIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1L15 14H1L8 1z" strokeLinejoin="round" />
      <path d="M8 6v4M8 11.5v.5" strokeLinecap="round" />
    </svg>
  );
}
function EyeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronDownIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Shared Layout Components ─────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, "").split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const PATIENT_SCREENS: Screen[] = ["patient", "imaging", "case-readiness", "case-packet", "tumor-board", "tumor-board-decision"];
const PATIENT_NAV = [
  { id: "patient", label: "Overview", icon: UsersIcon },
  { id: "imaging", label: "Imaging", icon: ScanIcon },
  { id: "case-readiness", label: "Case Readiness", icon: ClipboardIcon },
  { id: "case-packet", label: "Case Packet", icon: GridIcon },
  { id: "tumor-board", label: "Tumor Board", icon: GroupIcon },
  { id: "tumor-board-decision", label: "Record Decision", icon: CheckIcon },
  { id: "patient-pathway", label: "Patient Journey", icon: EyeIcon },
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
  const roleLabel = user ? user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";
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

function TopBar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-[#FFFFFF] border-b border-[#D5DBE3] shrink-0">
      <div>
        <h1 className="text-[#1B2733] text-lg font-semibold">{title}</h1>
        {subtitle && <p className="text-[#5B6877] text-xs mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: "complete" | "missing" | "pending" | "warning" | "active" | "optional" }) {
  const map = {
    complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
    missing: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    warning: "bg-orange-50 text-orange-700 border-orange-200",
    active: "bg-sky-50 text-sky-700 border-sky-200",
    // Neutral, non-alarming — for fields that are tracked but were never
    // supposed to count against (or look like they're blocking) readiness,
    // like Date of Surgery on a patient who hasn't been treated yet.
    optional: "bg-[#F6F8FA] text-[#5B6877] border-[#D5DBE3]",
  };
  const labels = {
    complete: "Complete",
    missing: "Missing",
    pending: "Pending",
    warning: "Needs Review",
    active: "Active",
    optional: "Not Recorded",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function ReadinessBar({ value }: { value: number }) {
  const color = value >= 90 ? "#1B7F5C" : value >= 70 ? "#A15C00" : "#B3261E";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#F6F8FA] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-xs font-medium" style={{ color }}>{value}%</span>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#FFFFFF] rounded border border-[#D5DBE3] ${className}`}>{children}</div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-[#3D4B5C] mb-3">{children}</h3>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

// 1. LOGIN
function LoginScreen({ onLogin }: { onLogin: (user: { name: string; email: string; role: string }) => void }) {
  const [email, setEmail] = useState("a.reyes@uvealcare.org");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real account creation — this is what was missing before: the app
  // only ever had one hardcoded demo login. Toggling this shows a real
  // signup form instead of the sign-in form.
  const [isSignUp, setIsSignUp] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState("ophthalmologist");

  const handleSignUp = () => {
    setError(null);
    if (!signupName.trim() || !email.trim() || !password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsSubmitting(true);
    apiFetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: signupName, email, password, role: signupRole }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Couldn't create account.");
        // Real accounts are signed in immediately after creation, same
        // as after a normal login — no separate "please log in" step.
        authToken = data.token;
        onLogin({ name: data.name, email: data.email, role: data.role });
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsSubmitting(false));
  };

  const handleSignIn = () => {
    setError(null);
    setIsSubmitting(true);
    apiFetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          // The backend deliberately doesn't say whether the email or the
          // password was wrong — just that the combination was invalid.
          throw new Error(data.detail || "Invalid email or password");
        }
        // Store the real token — every request from here on needs to
        // carry this, since the backend now actually enforces it.
        authToken = data.token;
        onLogin({ name: data.name, email: data.email, role: data.role });
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel: neutral, no decorative effects */}
      <div className="hidden lg:flex w-[460px] flex-col justify-between p-12 bg-[#F6F8FA] border-r border-[#D5DBE3]">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded bg-[#0F2D56] text-white flex items-center justify-center">
              <EyeIcon size={20} />
            </div>
            <div>
              <p className="text-[#1B2733] font-semibold text-lg">UvealCare</p>
              <p className="text-[#5B6877] text-xs">Clinical Workflow Platform</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-[#1B2733] text-2xl font-semibold leading-snug">
              Tumor board preparation<br />and case readiness
            </h2>
            <p className="text-[#3D4B5C] text-sm leading-relaxed">
              Identify missing information before review, standardize multidisciplinary preparation, and track decisions and follow-up for every patient.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "Case readiness", desc: "Identify outstanding items before tumor board review" },
            { label: "Multidisciplinary review", desc: "Structured case summaries built from recorded data" },
            { label: "Decision tracking", desc: "Record recommendations and assign follow-up tasks" },
          ].map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded border border-[#C4CCD6] bg-white text-[#0F2D56] flex items-center justify-center mt-0.5 shrink-0">
                <CheckIcon size={12} />
              </div>
              <div>
                <p className="text-[#1B2733] text-sm font-medium">{f.label}</p>
                <p className="text-[#5B6877] text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#0F2D56] text-white flex items-center justify-center">
              <EyeIcon size={14} />
            </div>
            <span className="text-[#1B2733] font-semibold text-lg">UvealCare</span>
          </div>

          <h2 className="text-[#1B2733] text-2xl font-semibold mb-1">{isSignUp ? "Create account" : "Sign in"}</h2>
          <p className="text-[#5B6877] text-sm mb-8">{isSignUp ? "Set up your clinical workspace" : "Access your clinical workspace"}</p>

          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-[#3D4B5C] mb-1.5">Full name</label>
                <input
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full border border-[#C4CCD6] rounded px-3 py-2.5 text-sm text-[#1B2733] bg-[#FFFFFF] focus:outline-none focus:border-[#0B63B6] focus:ring-2 focus:ring-[#0B63B6]/20 transition-all"
                  placeholder="Dr. Jane Smith"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[#3D4B5C] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#C4CCD6] rounded px-3 py-2.5 text-sm text-[#1B2733] bg-[#FFFFFF] focus:outline-none focus:border-[#0B63B6] focus:ring-2 focus:ring-[#0B63B6]/20 transition-all"
                placeholder="clinician@hospital.org"
              />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-[#3D4B5C] mb-1.5">Role</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full border border-[#C4CCD6] rounded px-3 py-2.5 text-sm text-[#1B2733] bg-[#FFFFFF] focus:outline-none focus:border-[#0B63B6] transition-all"
                >
                  <option value="ophthalmologist">Ophthalmologist</option>
                  <option value="radiation_oncologist">Radiation Oncologist</option>
                  <option value="medical_oncologist">Medical Oncologist</option>
                  <option value="nurse_navigator">Nurse Navigator</option>
                  <option value="coordinator">Tumor Board Coordinator</option>
                </select>
              </div>
            )}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#3D4B5C]">Password</label>
                {!isSignUp && <a href="#" className="text-xs text-[#0B63B6] hover:underline">Forgot password?</a>}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (isSignUp ? handleSignUp() : handleSignIn())}
                className="w-full border border-[#C4CCD6] rounded px-3 py-2.5 text-sm text-[#1B2733] bg-[#FFFFFF] focus:outline-none focus:border-[#0B63B6] focus:ring-2 focus:ring-[#0B63B6]/20 transition-all"
              />
              {isSignUp && <p className="text-[11px] text-[#5B6877] mt-1">At least 8 characters.</p>}
            </div>

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
            )}

            <button
              onClick={isSignUp ? handleSignUp : handleSignIn}
              disabled={isSubmitting}
              className="w-full bg-[#0F2D56] text-white rounded py-2.5 text-sm font-semibold hover:bg-[#0B2342] transition-colors mt-2 disabled:opacity-60"
            >
              {isSubmitting ? (isSignUp ? "Creating account…" : "Signing in…") : (isSignUp ? "Create Account" : "Sign In")}
            </button>

            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="w-full text-xs text-[#5B6877] hover:text-[#0F2D56] transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Create one"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-[#D5DBE3]">
            <p className="text-[11px] text-[#5B6877] text-center leading-relaxed">
              This system is for authorized healthcare personnel only.<br />
              Unauthorized access is prohibited and may be prosecuted.
            </p>
          </div>

          </div>
      </div>
    </div>
  );
}

// 2. DASHBOARD

// TEMP: paste the case ID that seed.py printed on your machine
// (Removed: a hardcoded fallback case ID used to live here, left over
// from local testing. It silently broke every time the hosted database
// was reseeded, since that exact ID stopped existing — this is what
// caused sidebar navigation to 404 and crash. Replaced by dynamically
// loading a real, currently-existing case on login instead.)
const API_BASE = "https://uvealcare-backend.onrender.com";

// This is what the frontend does with the token the backend now requires:
// holds it after login, and attaches it to every single request from
// here on. This is a plain module-level variable rather than React state
// on purpose — it needs to be readable by fetch calls all over the file,
// not just components that received it as a prop, and it doesn't need
// to trigger re-renders when it changes.
let authToken: string | null = null;

function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });
}

// The screen shown right after login — splits the app into two
// genuinely separate sections sharing one account, rather than one
// combined patient list mixing both diseases together. Real disease
// profiles are fetched from the backend, same source of truth as
// everywhere else — nothing about which diseases exist is hardcoded here.
function DiseaseSelectScreen({ onSelect }: { onSelect: (diseaseKey: string) => void }) {
  const [profiles, setProfiles] = useState<{ key: string; display_name: string; field_count: number }[]>([]);

  useEffect(() => {
    apiFetch(`${API_BASE}/disease-profiles`)
      .then((res) => res.json())
      .then((data) => setProfiles(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, []);

  // Short, honest descriptions — not overstated. Sarcoma has at least
  // one real named competitor (OncoLens, via a SARC partnership) already
  // active in this space, so "underserved" is accurate; "no one else is
  // doing this" would not be.
  const blurbs: Record<string, string> = {
    uveal_melanoma: "Rare primary intraocular malignancy. Tracks imaging, tumor measurements, molecular results, and multidisciplinary review.",
    soft_tissue_sarcoma: "Rare group of connective tissue malignancies. Tracks imaging, staging, and multidisciplinary review.",
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-white/40 text-[11px] font-mono mb-2">UvealCare Clinical Platform</p>
          <h1 className="text-[#1B2733] text-2xl font-semibold">Select a clinical workflow</h1>
          <p className="text-[#5B6877] text-sm mt-2">Each disease has its own dedicated set of cases, fields, and tumor board workflow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profiles.length === 0 && (
            <p className="text-[#5B6877] text-sm col-span-2 text-center">Loading available diseases…</p>
          )}
          {profiles.map((p) => (
            <button
              key={p.key}
              onClick={() => onSelect(p.key)}
              className="text-left bg-[#FFFFFF] border border-[#D5DBE3] rounded-lg p-6 hover:border-[#0B63B6] hover:bg-[#EEF2F6] transition-all group"
            >
              <div className="w-10 h-10 rounded bg-[#E8F0F9] text-[#0B63B6] flex items-center justify-center mb-4 transition-colors">
                <EyeIcon size={18} />
              </div>
              <h2 className="text-[#1B2733] text-lg font-semibold mb-1.5">{p.display_name}</h2>
              <p className="text-[#5B6877] text-xs leading-relaxed mb-3">
                {blurbs[p.key] ?? `${p.field_count} tracked clinical fields.`}
              </p>
              <p className="text-[#0B63B6] text-xs font-medium">Open workflow</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ onNav, diseaseProfileKey }: { onNav: (s: Screen, caseId?: string) => void; diseaseProfileKey: string }) {
  // All rows now come from the backend — no more hardcoded percentages
  // for anyone. Starts empty, fills in once the fetch completes.
  //
  // Beyond identity and overall readiness, this is a real *population*
  // view of the disease — not just a patient list — so it also carries
  // the handful of things a clinician scanning every melanoma patient at
  // once actually wants: laterality, imaging progress on its own,
  // the latest measurement and whether it's grown or shrunk, and the
  // recorded follow-up date so who's overdue is visible without opening
  // each chart individually. That's the concrete answer to "what does
  // this give me over Epic" — a generic EHR patient list can't show
  // this scoped to one disease without a custom report built per site.
  const [patients, setPatients] = useState<
    {
      case_id: string;
      patient_name: string;
      mrn: string;
      diagnosis: string;
      laterality: string | null;
      care_stage: string;
      readiness_pct: number;
      status: string;
      disease_profile_key: string;
      imaging_pct: number | null;
      key_measurement: string | null;
      measurement_trend: "growing" | "shrinking" | "stable" | null;
      follow_up_date: string | null;
      surveillance_protocol: string | null;
      tfsom_risk_label: "Low" | "Moderate" | "High" | null;
      gep_risk_label: "Low" | "Intermediate" | "High" | null;
    }[]
  >([]);

  const loadPatients = () => {
    apiFetch(`${API_BASE}/cases`)
      .then((res) => res.json())
      .then((data) => setPatients(Array.isArray(data) ? data.filter((c) => c.disease_profile_key === diseaseProfileKey) : []))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  useEffect(() => {
    loadPatients();
  }, [diseaseProfileKey]);

  // Real tumor board scheduling — this is what replaces the hardcoded
  // "Thursday, Nov 14, 2024" placeholder that used to show regardless
  // of the actual date or which patients were actually incomplete.
  const [nextMeetingDate, setNextMeetingDate] = useState<string | null>(null);
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [meetingDateInput, setMeetingDateInput] = useState("");
  const [isSavingMeeting, setIsSavingMeeting] = useState(false);

  const loadNextMeeting = () => {
    apiFetch(`${API_BASE}/tumor-board/next`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setNextMeetingDate(data?.meeting_date ?? null))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  useEffect(() => {
    loadNextMeeting();
  }, []);

  const handleSaveMeetingDate = () => {
    if (!meetingDateInput) return;
    setIsSavingMeeting(true);
    apiFetch(`${API_BASE}/tumor-board/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meeting_date: meetingDateInput }),
    })
      .then((res) => res.json())
      .then(() => {
        loadNextMeeting();
        setIsEditingMeeting(false);
      })
      .catch((err) => console.error("Couldn't save meeting date:", err))
      .finally(() => setIsSavingMeeting(false));
  };

  // Real days-until calculation, and a real list of which specific
  // patients (in this workflow) aren't ready yet — replacing the
  // hardcoded fake names that used to show for every account.
  const daysUntilMeeting = nextMeetingDate
    ? Math.ceil((new Date(nextMeetingDate + "T00:00:00").getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
    : null;
  const incompletePatients = patients.filter((p) => p.readiness_pct < 100);
  // Honest scope: this is a visible in-app alert, not an email or push
  // notification — no notification infrastructure exists to send those.
  const showUrgentAlert = daysUntilMeeting !== null && daysUntilMeeting <= 7 && daysUntilMeeting >= 0 && incompletePatients.length > 0;

  // "+ New Patient" now actually creates a real patient — this is the
  // form state and submit handler for that.
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ mrn: "", name: "", dob: "", laterality: "OD", diagnosis: "", disease_profile_key: "" });
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Real disease profile info from the backend — used to show the
  // current disease's real name in the form, and to pre-fill the new
  // patient with it. This is locked to whichever workflow tab you're
  // in, rather than letting a Sarcoma-tab session accidentally create a
  // Uveal Melanoma patient (or vice versa).
  const [diseaseProfiles, setDiseaseProfiles] = useState<
    { key: string; display_name: string; field_count: number }[]
  >([]);
  const currentProfile = diseaseProfiles.find((p) => p.key === diseaseProfileKey);

  useEffect(() => {
    apiFetch(`${API_BASE}/disease-profiles`)
      .then((res) => res.json())
      .then((data) => {
        setDiseaseProfiles(data);
        setNewPatient((prev) => ({ ...prev, disease_profile_key: diseaseProfileKey }));
      })
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, [diseaseProfileKey]);

  const handleCreatePatient = () => {
    setCreateError(null);
    if (!newPatient.mrn.trim() || !newPatient.name.trim() || !newPatient.dob) {
      setCreateError("MRN, name, and date of birth are required.");
      return;
    }
    setIsCreatingPatient(true);
    apiFetch(`${API_BASE}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPatient),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Couldn't create patient.");
        return data;
      })
      .then((data) => {
        loadPatients();
        setShowNewPatientForm(false);
        setNewPatient({ mrn: "", name: "", dob: "", laterality: "OD", diagnosis: "", disease_profile_key: diseaseProfileKey });
        onNav("patient", data.case_id); // go straight to the new patient's profile
      })
      .catch((err) => setCreateError(err.message))
      .finally(() => setIsCreatingPatient(false));
  };

  // Days until (positive) or since (negative) a date, so the follow-up
  // column and the sort below share one definition of "overdue."
  const daysUntil = (dateStr: string) =>
    Math.round((new Date(dateStr + "T00:00:00").getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));

  // Sorting the population view is the difference between "a list of
  // patients" and something a clinician actually scans before clinic —
  // by default, whoever is most overdue for follow-up floats to the
  // top, which is exactly the kind of at-a-glance triage a generic
  // per-patient EHR view doesn't give you across a whole disease cohort.
  const [sortMode, setSortMode] = useState<"urgency" | "readiness" | "name">("urgency");

  const [searchText, setSearchText] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "attention" | "ready">("all");
  const visiblePatients = patients.filter((p) => {
    const q = searchText.trim().toLowerCase();
    if (q && !(p.patient_name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q))) return false;
    if (filterMode === "attention") return p.readiness_pct < 100;
    if (filterMode === "ready") return p.readiness_pct === 100;
    return true;
  });

  const sortedPatients = [...visiblePatients].sort((a, b) => {
    if (sortMode === "name") return a.patient_name.localeCompare(b.patient_name);
    if (sortMode === "readiness") return a.readiness_pct - b.readiness_pct;
    // "urgency": no follow-up date sorts last; among the rest, most
    // overdue (most negative days) first, then soonest upcoming.
    const aDays = a.follow_up_date ? daysUntil(a.follow_up_date) : Number.POSITIVE_INFINITY;
    const bDays = b.follow_up_date ? daysUntil(b.follow_up_date) : Number.POSITIVE_INFINITY;
    if (aDays !== bDays) return aDays - bDays;
    return a.readiness_pct - b.readiness_pct;
  });

  // Summary stats computed from the real list, not hardcoded — these
  // will always match whatever's actually in the patients table above.
  const readyCount = patients.filter((p) => p.readiness_pct === 100).length;
  const incompleteCount = patients.filter((p) => p.readiness_pct < 100).length;
  const avgMissingItems = patients.length
    ? (patients.reduce((sum, p) => sum + Math.round((100 - p.readiness_pct) / 100 * 8), 0) / patients.length).toFixed(1)
    : "0";

  const stats = [
    { label: "Active Patients", value: String(patients.length), delta: "In this workflow", deltaColor: "#1B7F5C" },
    { label: "Cases Requiring Attention", value: String(incompleteCount), delta: `${incompleteCount} incomplete`, deltaColor: "#B3261E" },
    { label: "Ready for MDT Review", value: String(readyCount), delta: "100% complete", deltaColor: "#0B63B6" },
    { label: "Incomplete Cases", value: String(incompleteCount), delta: `Avg ${avgMissingItems} items missing`, deltaColor: "#A15C00" },
  ];

  // Real tasks across all patients — no more hardcoded fake names/tasks.
  // Starts empty, fills in once the fetch completes.
  const [tasks, setTasks] = useState<
    { id: string; description: string; assignee_name: string | null; due_date: string | null; patient_name: string }[]
  >([]);

  useEffect(() => {
    apiFetch(`${API_BASE}/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
        action={
          <button
            onClick={() => setShowNewPatientForm(true)}
            className="flex items-center gap-2 bg-[#0F2D56] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0B2342] transition-colors"
          >
            + New Patient
          </button>
        }
      />

      {/* New Patient modal — a real form backed by a real POST /patients
          call. On success it navigates straight into the new patient's
          profile, which already works fully generically since nothing
          in the detail screens is hardcoded to a specific patient. */}
      {showNewPatientForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowNewPatientForm(false)}>
          <div className="bg-[#FFFFFF] rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1B2733] mb-4">New Patient</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#3D4B5C] mb-1">Disease Profile</label>
                <div className="w-full border border-[#C4CCD6] rounded px-3 py-2 text-sm bg-[#F6F8FA] text-[#5B6877]">
                  {currentProfile ? `${currentProfile.display_name} (${currentProfile.field_count} fields)` : "Loading…"}
                </div>
                <p className="text-[11px] text-[#5B6877] mt-1">Matches whichever workflow tab you're currently in.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3D4B5C] mb-1">MRN *</label>
                <input
                  value={newPatient.mrn}
                  onChange={(e) => setNewPatient({ ...newPatient, mrn: e.target.value })}
                  className="w-full border border-[#C4CCD6] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0B63B6]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3D4B5C] mb-1">Full Name *</label>
                <input
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full border border-[#C4CCD6] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0B63B6]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#3D4B5C] mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={newPatient.dob}
                    onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                    className="w-full border border-[#C4CCD6] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0B63B6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#3D4B5C] mb-1">Laterality</label>
                  <select
                    value={newPatient.laterality}
                    onChange={(e) => setNewPatient({ ...newPatient, laterality: e.target.value })}
                    className="w-full border border-[#C4CCD6] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0B63B6]"
                  >
                    <option>OD</option>
                    <option>OS</option>
                    <option>OU</option>
                    <option value="">N/A</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3D4B5C] mb-1">Diagnosis</label>
                <input
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                  placeholder="e.g. Choroidal Melanoma OD"
                  className="w-full border border-[#C4CCD6] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0B63B6]"
                />
              </div>
            </div>

            {createError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mt-3">{createError}</p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowNewPatientForm(false)}
                className="flex-1 border border-[#C4CCD6] text-[#3D4B5C] rounded py-2 text-sm font-medium hover:bg-[#F6F8FA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePatient}
                disabled={isCreatingPatient}
                className="flex-1 bg-[#0F2D56] text-white rounded py-2 text-sm font-semibold hover:bg-[#0B2342] transition-colors disabled:opacity-60"
              >
                {isCreatingPatient ? "Creating…" : "Create Patient"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FFFFFF]">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-[#5B6877] text-xs mb-2">{s.label}</p>
              <p className="text-[#1B2733] text-2xl font-semibold font-mono">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: s.deltaColor }}>{s.delta}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6">
          {/* Patient list — a real population view of this disease, not
              just a table of names. Sortable by follow-up urgency by
              default, since that's the specific thing a clinician can't
              get from a generic per-patient EHR view without a custom
              report built per site. */}
          <Card>
            <div className="px-5 py-4 border-b border-[#E4E8ED] flex items-center justify-between">
              <div>
                <SectionHeader>Active Patients</SectionHeader>
                <p className="text-[11px] text-[#6B7785] -mt-2">
                  All {currentProfile?.display_name ?? "disease"} patients in this workflow. Sort by follow-up urgency, readiness, or name.
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                <label className="text-[11px] text-[#5B6877]">Sort:</label>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
                  className="bg-[#F6F8FA] border border-[#D5DBE3] text-[#3D4B5C] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#0B63B6]"
                >
                  <option value="urgency">Follow-up urgency</option>
                  <option value="readiness">Least ready first</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E4E8ED]">
                  {["Patient", "MRN", "Lat.", "Stage", "Imaging", "Measurement", "Follow-up", "Readiness", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap text-[11px] font-semibold text-[#5B6877]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedPatients.length === 0 && patients.length > 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-[#5B6877]">
                      No patients match the current search or filter.
                    </td>
                  </tr>
                )}
                {sortedPatients.map((p) => {
                  const followDays = p.follow_up_date ? daysUntil(p.follow_up_date) : null;
                  const isOverdue = followDays !== null && followDays < 0;
                  const isSoon = followDays !== null && followDays >= 0 && followDays <= 7;
                  const trendLabel =
                    p.measurement_trend === "growing" ? "Growing"
                    : p.measurement_trend === "shrinking" ? "Shrinking"
                    : p.measurement_trend === "stable" ? "Stable"
                    : null;
                  const trendColor =
                    p.measurement_trend === "growing" ? "text-amber-700"
                    : p.measurement_trend === "shrinking" ? "text-emerald-700"
                    : "text-[#5B6877]";
                  return (
                    <tr
                      key={p.case_id}
                      className="border-b border-[#E4E8ED] hover:bg-[#F6F8FA] cursor-pointer transition-colors"
                      onClick={() => onNav("patient", p.case_id)}
                    >
                      <td className="px-3 py-3 min-w-[10rem]">
                        <p className="text-[#1B2733] text-sm font-medium">{p.patient_name}</p>
                        <p className="text-[#6B7785] text-[11px]">{p.diagnosis}</p>
                        {/* Flags which nevi are trending toward melanoma
                            across the WHOLE population at a glance — the
                            kind of disease-specific signal a generic EHR
                            patient list has no way to surface. */}
                        {(p.tfsom_risk_label === "Moderate" || p.tfsom_risk_label === "High") && (
                          <p className={`text-[11px] font-medium mt-0.5 ${p.tfsom_risk_label === "High" ? "text-red-700" : "text-amber-700"}`}>
                            {p.tfsom_risk_label} growth risk (TFSOM)
                          </p>
                        )}
                        {/* A different axis from TFSOM above: this is an
                            already-diagnosed melanoma's metastatic risk,
                            not a nevus's risk of becoming one. */}
                        {(p.gep_risk_label === "Intermediate" || p.gep_risk_label === "High") && (
                          <p className={`text-[11px] font-medium mt-0.5 ${p.gep_risk_label === "High" ? "text-red-700" : "text-amber-700"}`}>
                            {p.gep_risk_label} metastatic risk (GEP)
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs text-[#5B6877]">{p.mrn}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[#3D4B5C] text-xs">{p.laterality ?? "—"}</span>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={p.status as any} />
                      </td>
                      <td className="px-3 py-3 w-24">
                        {p.imaging_pct === null ? (
                          <span className="text-[#6B7785] text-xs">—</span>
                        ) : (
                          <ReadinessBar value={p.imaging_pct} />
                        )}
                      </td>
                      <td className="px-3 py-3 max-w-[180px]">
                        {p.key_measurement ? (
                          <>
                            <p className="text-[#3D4B5C] text-xs truncate" title={p.key_measurement}>{p.key_measurement}</p>
                            {trendLabel && <p className={`text-[11px] ${trendColor}`}>{trendLabel}</p>}
                          </>
                        ) : (
                          <span className="text-[#6B7785] text-xs italic">Not recorded</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {p.follow_up_date ? (
                          <>
                            <p className={`text-xs font-medium ${isOverdue ? "text-red-700" : isSoon ? "text-amber-700" : "text-[#3D4B5C]"}`}>
                              {isOverdue ? `Overdue ${Math.abs(followDays!)}d` : followDays === 0 ? "Today" : `In ${followDays}d`}
                            </p>
                            <p className="text-[#6B7785] text-[11px]">{p.follow_up_date}</p>
                          </>
                        ) : (
                          <span className="text-[#6B7785] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 w-32">
                        <ReadinessBar value={p.readiness_pct} />
                      </td>
                      <td className="px-3 py-3">
                        <ChevronRightIcon />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </Card>

          {/* Tasks sidebar */}
          <div className="space-y-4">
            <Card>
              <div className="px-4 py-4 border-b border-[#E4E8ED]">
                <SectionHeader>Upcoming Tasks</SectionHeader>
              </div>
              <div className="divide-y divide-[#E4E8ED]">
                {tasks.length === 0 && (
                  <p className="px-4 py-3 text-xs text-[#5B6877] italic">No open tasks assigned yet.</p>
                )}
                {tasks.map((t) => (
                  <div key={t.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-amber-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1B2733] text-xs font-medium truncate">{t.description}</p>
                      <p className="text-[#5B6877] text-[11px]">
                        {t.patient_name}{t.assignee_name ? ` · Assigned to ${t.assignee_name}` : ""}{t.due_date ? ` · Due ${t.due_date}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-1">
                <SectionHeader>Next Tumor Board</SectionHeader>
                {!isEditingMeeting && (
                  <button
                    onClick={() => { setIsEditingMeeting(true); setMeetingDateInput(nextMeetingDate ?? ""); }}
                    className="text-[11px] text-[#0B63B6] hover:underline -mt-3"
                  >
                    {nextMeetingDate ? "Change" : "Set date"}
                  </button>
                )}
              </div>

              {isEditingMeeting ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={meetingDateInput}
                    onChange={(e) => setMeetingDateInput(e.target.value)}
                    className="w-full border border-[#C4CCD6] rounded px-2 py-1.5 text-xs bg-[#FFFFFF] text-[#3D4B5C] focus:outline-none focus:border-[#0B63B6]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingMeeting(false)}
                      className="flex-1 border border-[#C4CCD6] text-[#3D4B5C] rounded py-1.5 text-xs hover:bg-[#EEF2F6] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveMeetingDate}
                      disabled={isSavingMeeting || !meetingDateInput}
                      className="flex-1 bg-[#0F2D56] text-white rounded py-1.5 text-xs font-semibold hover:bg-[#0B2342] transition-colors disabled:opacity-60"
                    >
                      {isSavingMeeting ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {nextMeetingDate ? (
                    <>
                      <p className="text-[#1B2733] text-sm font-semibold">
                        {new Date(nextMeetingDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <p className="text-[#5B6877] text-xs">
                        {daysUntilMeeting !== null && daysUntilMeeting >= 0
                          ? daysUntilMeeting === 0 ? "Today" : `In ${daysUntilMeeting} day${daysUntilMeeting === 1 ? "" : "s"}`
                          : "This date has passed"}
                      </p>

                      {showUrgentAlert && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded">
                          <p className="text-xs text-red-700 font-medium">
                            {incompletePatients.length} case{incompletePatients.length === 1 ? "" : "s"} still incomplete — meeting in {daysUntilMeeting} day{daysUntilMeeting === 1 ? "" : "s"}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#E4E8ED]">
                        <p className="text-[11px] text-[#5B6877] mb-1.5">
                          {incompletePatients.length > 0 ? "Not Yet Ready" : "All Cases Ready"}
                        </p>
                        {incompletePatients.length === 0 && patients.length > 0 && (
                          <p className="text-[#5B6877] text-xs italic">Every case is 100% complete.</p>
                        )}
                        {incompletePatients.slice(0, 4).map((p) => (
                          <p key={p.case_id} className="text-[#1B2733] text-xs font-medium">
                            {p.patient_name} — {p.readiness_pct}%
                          </p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-[#5B6877] text-xs italic">No tumor board date set yet.</p>
                  )}
                  <button
                    onClick={() => onNav("tumor-board")}
                    className="w-full mt-2 border border-[#0F2D56] text-[#0F2D56] rounded py-2 text-xs font-medium hover:bg-[#0F2D56] hover:text-white transition-colors"
                  >
                    Prepare Cases
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. PATIENT PROFILE
function PatientScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  const [activeTab, setActiveTab] = useState("overview");

  // The actual identity of whichever patient was clicked — this is what
  // stops every patient from showing "Margaret T. Sullivan" at the top.
  const [caseInfo, setCaseInfo] = useState<{
    patient: string; mrn: string; care_stage: string; care_stages: string[];
    diagnosis: string | null; laterality: string | null; dob: string | null;
    sex: string | null; phone: string | null; insurance: string | null;
    primary_provider: string | null; referring_provider: string | null;
  } | null>(null);

  // Real editable contact/demographic info — this is what replaces the
  // "Not recorded" placeholders with an actual form. Only opens when the
  // person clicks "Edit"; otherwise the card is just a read-only summary.
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState({ sex: "", phone: "", insurance: "", primary_provider: "", referring_provider: "" });
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [saveInfoError, setSaveInfoError] = useState<string | null>(null);

  const loadCaseInfo = () => {
    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCaseInfo(data);
        setEditForm({
          sex: data.sex ?? "",
          phone: data.phone ?? "",
          insurance: data.insurance ?? "",
          primary_provider: data.primary_provider ?? "",
          referring_provider: data.referring_provider ?? "",
        });
      })
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  const handleSaveInfo = () => {
    setSaveInfoError(null);
    setIsSavingInfo(true);
    apiFetch(`${API_BASE}/cases/${caseId}/patient`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Couldn't save patient info.");
        loadCaseInfo();
        setIsEditingInfo(false);
      })
      .catch((err) => setSaveInfoError(err.message))
      .finally(() => setIsSavingInfo(false));
  };

  // Live readiness data — now includes the full checklist (with real
  // values), not just the missing-items summary, so this screen can show
  // genuine clinical content for whichever patient is selected.
  const [readinessSummary, setReadinessSummary] = useState<{
    readiness_pct: number;
    missing_information: string[];
    checklist: { key: string; field: string; category: string; data_type?: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null; basal_diameter_mm?: number | null; apical_height_mm?: number | null; required?: boolean }[];
  } | null>(null);

  useEffect(() => {
    loadCaseInfo();

    apiFetch(`${API_BASE}/cases/${caseId}/readiness`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setReadinessSummary(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, [caseId]);

  // Small helper: look up a field's real recorded value from the
  // checklist by key, so every card below can show genuine content for
  // whichever patient is selected instead of one hardcoded showcase case.
  const fieldValue = (key: string): string | null =>
    readinessSummary?.checklist.find((c) => c.key === key)?.value ?? null;

  // Real per-case journey stages — comes from this specific patient's
  // disease profile, not a hardcoded uveal-melanoma-only list. This is
  // what lets a completely different disease (with different stages)
  // render correctly in the exact same journey bar.
  const journeyStages = caseInfo?.care_stages ?? [];
  const currentStageIndex = caseInfo ? journeyStages.indexOf(caseInfo.care_stage) : 0;

  const tabs = ["overview", "imaging", "molecular", "treatment", "tasks"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title={caseInfo ? caseInfo.patient : "Loading…"}
        subtitle={caseInfo ? `${caseInfo.mrn} · ${caseInfo.care_stage}` : ""}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNav("case-readiness")}
              className="flex items-center gap-2 border border-[#D5DBE3] text-[#3D4B5C] px-3 py-2 rounded text-sm hover:bg-[#F6F8FA] transition-colors"
            >
              <ClipboardIcon size={14} />
              Case Readiness
            </button>
            <button
              onClick={() => onNav("case-packet")}
              className="flex items-center gap-2 border border-[#D5DBE3] text-[#3D4B5C] px-3 py-2 rounded text-sm hover:bg-[#F6F8FA] transition-colors"
            >
              <ScanIcon size={14} />
              Case Packet
            </button>
            <button
              onClick={() => onNav("tumor-board")}
              className="flex items-center gap-2 bg-[#0F2D56] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#0B2342] transition-colors"
            >
              <GroupIcon size={14} />
              Prepare for MDT
            </button>
          </div>
        }
      />

      {/* Journey bar — driven by this case's real disease profile stages */}
      <div className="bg-[#FFFFFF] border-b border-[#D5DBE3] px-8 py-4">
        <div className="flex items-center gap-0">
          {journeyStages.map((stage, i) => {
            const isDone = i < currentStageIndex;
            const isActive = i === currentStageIndex;
            return (
              <div key={stage} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  isActive ? "bg-[#0F2D56] text-white" :
                  isDone ? "text-emerald-700" : "text-[#6B7785]"
                }`}>
                  {isDone && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#0B63B6] inline-block" />}
                  {stage}
                </div>
                {i < journeyStages.length - 1 && (
                  <div className={`w-6 h-px ${isDone ? "bg-emerald-300" : "bg-[#E4E8ED]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#FFFFFF] border-b border-[#D5DBE3] px-8 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm capitalize transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? "border-[#0F2D56] text-[#0F2D56] font-medium"
                : "border-transparent text-[#5B6877] hover:text-[#1B2733]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FFFFFF]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-[1fr_1fr_300px] gap-5">
            {/* Patient Info */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <SectionHeader>Patient Information</SectionHeader>
                {!isEditingInfo && (
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="text-xs text-[#0B63B6] hover:underline -mt-3"
                  >
                    Edit
                  </button>
                )}
              </div>

              {!isEditingInfo ? (
                <div className="space-y-3">
                  {[
                    { label: "Full Name", value: caseInfo?.patient ?? "…" },
                    { label: "Date of Birth", value: caseInfo?.dob ?? "Not recorded" },
                    { label: "Sex", value: caseInfo?.sex ?? "Not recorded" },
                    { label: "MRN", value: caseInfo?.mrn ?? "…", mono: true },
                    { label: "Phone", value: caseInfo?.phone ?? "Not recorded" },
                    { label: "Insurance", value: caseInfo?.insurance ?? "Not recorded" },
                    { label: "Primary Provider", value: caseInfo?.primary_provider ?? "Not recorded" },
                    { label: "Referring Provider", value: caseInfo?.referring_provider ?? "Not recorded" },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between items-start gap-4">
                      <span className="text-[#5B6877] text-xs shrink-0">{r.label}</span>
                      <span className={`text-xs text-right ${r.mono ? "font-mono" : ""} ${r.value === "Not recorded" ? "text-[#6B7785] italic" : "text-[#1B2733]"}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-[#5B6877] mb-1">Sex</label>
                    <select
                      value={editForm.sex}
                      onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                      className="w-full border border-[#C4CCD6] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#0B63B6]"
                    >
                      <option value="">Not recorded</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {[
                    { key: "phone", label: "Phone", placeholder: "(555) 555-0100" },
                    { key: "insurance", label: "Insurance", placeholder: "e.g. Blue Cross Blue Shield" },
                    { key: "primary_provider", label: "Primary Provider", placeholder: "Dr. A. Reyes" },
                    { key: "referring_provider", label: "Referring Provider", placeholder: "Dr. J. Thornton" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-[11px] text-[#5B6877] mb-1">{f.label}</label>
                      <input
                        value={(editForm as any)[f.key]}
                        onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full border border-[#C4CCD6] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#0B63B6]"
                      />
                    </div>
                  ))}

                  {saveInfoError && (
                    <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5">{saveInfoError}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setIsEditingInfo(false); setSaveInfoError(null); }}
                      className="flex-1 border border-[#C4CCD6] text-[#3D4B5C] rounded py-1.5 text-xs font-medium hover:bg-[#F6F8FA] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveInfo}
                      disabled={isSavingInfo}
                      className="flex-1 bg-[#0F2D56] text-white rounded py-1.5 text-xs font-semibold hover:bg-[#0B2342] transition-colors disabled:opacity-60"
                    >
                      {isSavingInfo ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* Diagnosis & Assessment */}
            <div className="space-y-4">
              <Card className="p-5">
                <SectionHeader>Diagnosis</SectionHeader>
                <div className="space-y-3">
                  {[
                    { label: "Diagnosis", value: caseInfo?.diagnosis ?? "Not recorded" },
                    { label: "Laterality", value: caseInfo?.laterality ?? "Not recorded" },
                    { label: "Date of Diagnosis", value: "Not recorded" },
                    { label: "TNM Staging", value: "Not recorded", mono: true },
                    { label: "AJCC Classification", value: "Not recorded" },
                    { label: "Tumor Location", value: fieldValue("tumor_location") ?? "Not recorded" },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between items-start gap-4">
                      <span className="text-[#5B6877] text-xs shrink-0">{r.label}</span>
                      <span className={`text-xs text-right ${(r as any).mono ? "font-mono" : ""} ${r.value === "Not recorded" ? "text-[#6B7785] italic" : "text-[#1B2733]"}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <SectionHeader>Tumor Measurements</SectionHeader>
                {fieldValue("tumor_dimensions") ? (
                  <p className="text-sm text-[#3D4B5C] leading-relaxed">{fieldValue("tumor_dimensions")}</p>
                ) : (
                  <p className="text-xs text-[#6B7785] italic">
                    Not yet recorded for this patient. Overall status is tracked on the Case Readiness page.
                  </p>
                )}
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Case Readiness */}
              <Card className="p-5">
                <SectionHeader>Case Readiness</SectionHeader>
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[#5B6877]">MDT Readiness</span>
                    <span className="font-mono text-sm font-semibold text-amber-700">
                      {readinessSummary ? `${readinessSummary.readiness_pct}%` : "…"}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F6F8FA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${readinessSummary?.readiness_pct ?? 0}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  {readinessSummary?.missing_information.slice(0, 2).map((label) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-red-700">
                      <XIcon size={12} /> {label}
                    </div>
                  ))}
                  {readinessSummary && readinessSummary.missing_information.length === 0 && (
                    <p className="text-xs text-[#5B6877] italic">Nothing missing</p>
                  )}
                </div>
                <button
                  onClick={() => onNav("case-readiness")}
                  className="w-full border border-[#D5DBE3] text-[#3D4B5C] rounded py-2 text-xs font-medium hover:bg-[#F6F8FA] transition-colors"
                >
                  View Full Checklist
                </button>
              </Card>

              {/* Clinical Findings */}
              <Card className="p-5">
                <SectionHeader>Clinical Assessment</SectionHeader>
                {fieldValue("clinical_assessment") ? (
                  <p className="text-sm text-[#3D4B5C] leading-relaxed">{fieldValue("clinical_assessment")}</p>
                ) : (
                  <p className="text-xs text-[#6B7785] italic">
                    Not yet recorded for this patient.
                  </p>
                )}
              </Card>

              {/* Next appointment */}
            </div>
          </div>
        )}

        {activeTab === "imaging" && (
          <ImagingContent onNav={onNav} caseId={caseId} />
        )}

        {activeTab === "molecular" && (
          <Card className="p-6 max-w-2xl">
            <SectionHeader>Molecular Testing</SectionHeader>
            <p className="text-[11px] text-[#5B6877] italic mb-3">
              For uveal melanoma, molecular testing (e.g. GEP) is used for metastatic risk stratification and surveillance planning — not for diagnosis, which remains clinical.
            </p>
            {(() => {
              const molecularItems = readinessSummary?.checklist?.filter((c) => c.category === "molecular") ?? [];
              if (!readinessSummary) return <p className="text-xs text-[#5B6877]">Loading…</p>;
              if (molecularItems.length === 0) return <p className="text-xs text-[#5B6877] italic">No molecular testing configured for this disease profile.</p>;
              return (
                <div className="space-y-4">
                  {molecularItems.map((item) => (
                    <div key={item.key} className="border border-[#D5DBE3] rounded p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-[#1B2733]">{item.field}</p>
                          <p className="text-xs text-[#5B6877]">{item.source ?? "Not yet ordered"}</p>
                        </div>
                        <StatusBadge status={item.required === false && item.status !== "complete" ? "optional" : item.status as any} />
                      </div>
                      <p className="text-xs text-[#3D4B5C] mt-2">
                        {item.value ?? "Not yet recorded for this patient."}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        )}

        {activeTab === "treatment" && (
          <Card className="p-6 max-w-2xl">
            <SectionHeader>Treatment History</SectionHeader>
            <div className="text-sm text-[#5B6877] italic">No prior treatment recorded. Awaiting multidisciplinary recommendation.</div>
          </Card>
        )}

        {activeTab === "tasks" && (
          <Card className="max-w-xl p-5">
            <SectionHeader>Open Tasks</SectionHeader>
            <p className="text-sm text-[#5B6877]">
              Open tasks for this case are tracked on the Case Readiness screen, where each outstanding item can be assigned to a team member.
            </p>
            <button
              onClick={() => onNav("case-readiness")}
              className="mt-4 border border-[#C4CCD6] text-[#3D4B5C] px-3 py-2 rounded text-sm font-medium hover:bg-[#F6F8FA] transition-colors"
            >
              Open Case Readiness
            </button>
          </Card>
        )}
      </div>
    </div>
  );
}

// 4. CASE READINESS
function CaseReadinessScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  // Same identity fetch as PatientScreen — this is what makes the header
  // show the right patient's name and MRN instead of always Margaret's.
  const [caseInfo, setCaseInfo] = useState<{ patient: string; mrn: string } | null>(null);

  // Starts empty, gets filled in once the backend responds.
  const [readinessData, setReadinessData] = useState<{
    readiness_pct: number;
    ready_for_review: boolean;
    checklist: { key: string; field: string; category: string; data_type?: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null; basal_diameter_mm?: number | null; apical_height_mm?: number | null; required?: boolean }[];
    missing_information: string[];
  } | null>(null);

  // Tracks which field is currently being resolved, so we can show a
  // brief "Resolving…" state on just that one button.
  const [resolvingKey, setResolvingKey] = useState<string | null>(null);

  // Which item currently has its "Resolve" form open, and what's been
  // typed into it. Replaces the old one-click "Resolve" that silently
  // wrote a hardcoded placeholder instead of the actual finding — that
  // was fine for a demo, but genuinely wrong for a field like Patient
  // Counseling where the real content matters.
  const [resolveFormKey, setResolveFormKey] = useState<string | null>(null);
  const [resolveValue, setResolveValue] = useState("");
  const [resolveMethod, setResolveMethod] = useState("");
  const [resolvePrecision, setResolvePrecision] = useState("");
  const [resolveLengthType, setResolveLengthType] = useState("");
  // Structured numbers, separate from the free-text description above —
  // these power both the real COMS staging calculator and the ability
  // to track tumor size as a genuine trend across multiple visits.
  const [resolveBasalDiameter, setResolveBasalDiameter] = useState("");
  const [resolveApicalHeight, setResolveApicalHeight] = useState("");
  // Lets a status be reverted, not just moved forward — e.g. an item
  // marked Complete by mistake, or new information means it genuinely
  // needs redoing. Real clinical data isn't always a one-way ratchet.
  const [resolveStatus, setResolveStatus] = useState("complete");

  // Real tasks tied to this case — what "Assign task" buttons now
  // actually create, instead of doing nothing.
  const [tasks, setTasks] = useState<
    { id: string; description: string; assignee_name: string | null; assignee_id: string | null; status: string; due_date: string | null }[]
  >([]);
  // Which missing item currently has its little "assign" form open —
  // only one at a time, to keep the UI simple.
  const [assigningLabel, setAssigningLabel] = useState<string | null>(null);
  // Real accounts on the platform — this is what replaces free-text
  // assignee names with an actual selectable person, so "who's doing
  // this" is a real fact instead of typed text that could typo or go
  // stale if that person's name ever changes.
  const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const loadTasks = () => {
    apiFetch(`${API_BASE}/cases/${caseId}/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  const loadReadiness = () => {
    apiFetch(`${API_BASE}/cases/${caseId}/readiness`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setReadinessData(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCaseInfo(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
    loadReadiness();
    loadTasks();
    apiFetch(`${API_BASE}/users`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          if (data.length > 0) setAssigneeUserId(data[0].id);
        }
      })
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, [caseId]);

  // This is what makes "Assign task" real: it creates an actual Task row
  // tied to this case, tagged with whichever missing field prompted it.
  const handleAssignTask = (fieldLabel: string) => {
    if (!assigneeUserId) return;
    setIsAssigning(true);
    apiFetch(`${API_BASE}/cases/${caseId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: `Resolve: ${fieldLabel}`,
        assignee_id: assigneeUserId,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        loadTasks();
        setAssigningLabel(null);
      })
      .catch((err) => console.error("Couldn't assign task:", err))
      .finally(() => setIsAssigning(false));
  };

  const handleCompleteTask = (taskId: string) => {
    setCompletingTaskId(taskId);
    apiFetch(`${API_BASE}/tasks/${taskId}/complete`, { method: "PATCH" })
      .then((res) => res.json())
      .then(() => loadTasks())
      .catch((err) => console.error("Couldn't complete task:", err))
      .finally(() => setCompletingTaskId(null));
  };

  // This is the new piece: clicking "Resolve" actually writes to the
  // backend (POST), then re-fetches readiness so the percentage and
  // checklist update live — the first "write" action in the whole app.
  const openResolveForm = (fieldKey: string, existing?: { value: string | null; status?: string; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null; basal_diameter_mm?: number | null; apical_height_mm?: number | null }) => {
    setResolveFormKey(fieldKey);
    setResolveValue(existing?.value ?? "");
    setResolveMethod(existing?.measurement_method ?? "");
    setResolvePrecision(existing?.measurement_precision ?? "");
    setResolveLengthType(existing?.measurement_length_type ?? "");
    setResolveBasalDiameter(existing?.basal_diameter_mm != null ? String(existing.basal_diameter_mm) : "");
    setResolveApicalHeight(existing?.apical_height_mm != null ? String(existing.apical_height_mm) : "");
    // Default to "complete" when resolving something missing for the
    // first time; pre-fill the real current status when editing.
    setResolveStatus(existing?.status && existing.status !== "missing" ? existing.status : "complete");
  };

  const handleResolveSubmit = (fieldKey: string) => {
    // Marking something back to Missing is a deliberate correction, not
    // a normal save — the value can reasonably be empty in that case.
    if (resolveStatus !== "missing" && !resolveValue.trim()) return;
    setResolvingKey(fieldKey);
    apiFetch(`${API_BASE}/cases/${caseId}/values`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field_key: fieldKey,
        status: resolveStatus,
        value: resolveStatus === "missing" ? null : resolveValue,
        source: "Dr. A. Reyes",
        measurement_method: resolveMethod || null,
        measurement_precision: resolvePrecision || null,
        measurement_length_type: resolveLengthType || null,
        basal_diameter_mm: resolveBasalDiameter ? parseFloat(resolveBasalDiameter) : null,
        apical_height_mm: resolveApicalHeight ? parseFloat(resolveApicalHeight) : null,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        loadReadiness();
        setResolveFormKey(null);
      })
      .catch((err) => console.error("Couldn't resolve field:", err))
      .finally(() => setResolvingKey(null));
  };

  // Tracks which item is showing its "are you sure?" delete confirmation
  // — same two-step pattern as Settings' Log Out, so a stray click can't
  // accidentally destroy recorded clinical information.
  const [confirmingDeleteKey, setConfirmingDeleteKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const handleDeleteValue = (fieldKey: string) => {
    setDeletingKey(fieldKey);
    apiFetch(`${API_BASE}/cases/${caseId}/values/${fieldKey}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        loadReadiness();
        setConfirmingDeleteKey(null);
      })
      .catch((err) => console.error("Couldn't delete value:", err))
      .finally(() => setDeletingKey(null));
  };

  const iconFor = (s: string) => {
    if (s === "complete") return <span className="text-emerald-700"><CheckIcon size={14} /></span>;
    if (s === "missing") return <span className="text-red-700"><XIcon size={14} /></span>;
    return <span className="text-amber-700"><ClockIcon size={14} /></span>;
  };

  if (!readinessData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#FFFFFF]">
        <p className="text-[#5B6877] text-sm">Loading case readiness…</p>
      </div>
    );
  }

  const readiness = readinessData.readiness_pct;
  const allItems = readinessData.checklist;
  const complete = allItems.filter((i) => i.status === "complete").length;

  // Group the flat checklist from the backend into categories for display,
  // the same shape the original hardcoded array used.
  const grouped: Record<string, typeof allItems> = {};
  allItems.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Case Readiness"
        subtitle={caseInfo ? `${caseInfo.patient} · ${caseInfo.mrn}` : ""}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNav("imaging")}
              className="border border-[#D5DBE3] text-[#3D4B5C] px-3 py-2 rounded text-sm hover:bg-[#F6F8FA] transition-colors"
            >
              Order Imaging
            </button>
            <button
              onClick={() => onNav("tumor-board")}
              className="bg-[#0F2D56] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0B2342] transition-colors"
            >
              Prepare MDT Case
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FFFFFF]">
        {/* Readiness header card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-mono font-bold text-amber-700">{readiness}%</span>
                <span className="text-lg font-semibold text-[#1B2733]">Case Readiness</span>
              </div>
              <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                <AlertIcon size={14} />
                <span className="font-medium">
                  {readinessData.ready_for_review
                    ? "Case is ready for multidisciplinary review."
                    : "Case is not ready for multidisciplinary review."}
                </span>
                <span className="text-amber-700">
                  {readinessData.missing_information.length} item(s) require resolution before tumor board presentation.
                </span>
              </div>
            </div>
            <div className="w-48 shrink-0">
              <div className="h-3 bg-[#F6F8FA] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${readiness}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-[#5B6877]">
                <span>{complete} complete</span>
                <span>{allItems.length} total</span>
              </div>
            </div>
          </div>

          {/* Missing items callout — now driven by the backend's missing_information list */}
          <div className="mt-4 pt-4 border-t border-[#E4E8ED]">
            <p className="text-xs font-semibold text-[#3D4B5C] mb-3">Missing or Pending Information</p>
            <div className="grid grid-cols-2 gap-3">
              {readinessData.missing_information.length === 0 && (
                <p className="text-xs text-[#5B6877] italic">Nothing missing — case is fully documented.</p>
              )}
              {readinessData.missing_information.map((label) => {
                const existingTask = tasks.find((t) => t.description === `Resolve: ${label}` && t.status === "open");
                return (
                  <div key={label} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded">
                    <span className="text-red-700  mt-0.5"><XIcon size={14} /></span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-700">{label}</p>

                      {existingTask ? (
                        <p className="mt-2 text-xs text-red-700">
                          Assigned to <span className="font-medium">{existingTask.assignee_name}</span>
                        </p>
                      ) : assigningLabel === label ? (
                        <div className="mt-2 flex items-center gap-1.5">
                          <select
                            autoFocus
                            value={assigneeUserId}
                            onChange={(e) => setAssigneeUserId(e.target.value)}
                            className="text-xs border border-red-200 rounded px-2 py-1 bg-[#FFFFFF] text-[#3D4B5C] focus:outline-none focus:border-red-500"
                          >
                            {users.length === 0 && <option value="">No accounts yet</option>}
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignTask(label)}
                            disabled={isAssigning || !assigneeUserId}
                            className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {isAssigning ? "…" : "Go"}
                          </button>
                          <button
                            onClick={() => setAssigningLabel(null)}
                            className="text-xs text-red-700 hover:text-red-700"
                          >Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningLabel(label)}
                          className="mt-2 text-xs font-medium text-red-700 underline"
                        >
                          Assign task
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Assigned tasks — real data, proving "Assign task" actually did
            something. Also lets someone mark a task done directly here. */}
        {tasks.length > 0 && (
          <Card className="mb-6">
            <div className="px-5 py-3.5 border-b border-[#E4E8ED] bg-[#FFFFFF]">
              <h3 className="text-sm font-semibold text-[#1B2733]">Assigned Tasks</h3>
            </div>
            <div className="divide-y divide-[#E4E8ED]">
              {tasks.map((task) => (
                <div key={task.id} className="px-5 py-3 flex items-center gap-4">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.status === "done" ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.status === "done" ? "text-[#5B6877] line-through" : "text-[#1B2733]"}`}>{task.description}</p>
                    <p className="text-xs text-[#5B6877]">
                      {task.assignee_name ?? "Unassigned"}{task.due_date ? ` · Due ${task.due_date}` : ""}
                    </p>
                  </div>
                  {task.status === "open" && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completingTaskId === task.id}
                      className="text-xs text-[#0B63B6] hover:underline shrink-0 disabled:opacity-50"
                    >
                      {completingTaskId === task.id ? "Saving…" : "Mark Done"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Checklist */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, catItems]) => (
            <Card key={category}>
              <div className="px-5 py-3.5 border-b border-[#E4E8ED] flex items-center justify-between bg-[#FFFFFF]">
                <h3 className="text-sm font-semibold text-[#1B2733] capitalize">{category.replace(/_/g, " ")}</h3>
                <span className="font-mono text-xs text-[#5B6877]">
                  {catItems.filter((i) => i.status === "complete").length}/{catItems.length} complete
                </span>
              </div>
              <div className="divide-y divide-[#E4E8ED]">
                {catItems.map((item) => (
                  <div key={item.field} className={`px-5 py-3 ${item.status === "missing" ? "bg-red-50" : item.status === "pending" ? "bg-amber-50" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-5 text-center text-sm shrink-0">{iconFor(item.status)}</div>
                      <div className="flex-1">
                        <p className="text-sm text-[#1B2733] font-medium">{item.field}</p>
                        {item.status === "complete" && item.value && (
                          <p className="text-xs text-[#5B6877] mt-1 leading-relaxed">
                            {item.data_type === "boolean" ? (item.value === "true" ? "Present" : "Absent") : item.value}
                          </p>
                        )}
                        {item.status === "complete" && (item.measurement_method || item.measurement_precision || item.measurement_length_type) && (
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {item.measurement_method && (
                              <span className="text-[11px] text-[#5B6877] bg-[#F6F8FA] px-1.5 py-0.5 rounded">{item.measurement_method}</span>
                            )}
                            {item.measurement_precision && (
                              <span className="text-[11px] text-[#5B6877] bg-[#F6F8FA] px-1.5 py-0.5 rounded">{item.measurement_precision}</span>
                            )}
                            {item.measurement_length_type && (
                              <span className="text-[11px] text-[#5B6877] bg-[#F6F8FA] px-1.5 py-0.5 rounded">{item.measurement_length_type}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={item.required === false && item.status !== "complete" ? "optional" : item.status as any} />
                      {resolveFormKey !== item.key && confirmingDeleteKey !== item.key && (
                        <button
                          onClick={() => openResolveForm(item.key, item)}
                          className="text-xs text-[#0B63B6] hover:underline shrink-0"
                        >
                          {item.status === "complete" ? "Edit" : "Resolve"}
                        </button>
                      )}
                      {/* Direct delete — a quicker path than Edit for
                          genuinely removing bad or mistaken data, rather
                          than correcting it. Only shown when there's
                          actually something recorded to delete. */}
                      {item.status !== "missing" && resolveFormKey !== item.key && confirmingDeleteKey !== item.key && (
                        <button
                          onClick={() => setConfirmingDeleteKey(item.key)}
                          className="text-xs text-red-700 hover:underline shrink-0"
                        >
                          Delete
                        </button>
                      )}
                      {confirmingDeleteKey === item.key && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[#3D4B5C]">Delete this?</span>
                          <button
                            onClick={() => handleDeleteValue(item.key)}
                            disabled={deletingKey === item.key}
                            className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deletingKey === item.key ? "…" : "Yes, delete"}
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteKey(null)}
                            className="text-xs text-[#5B6877] hover:text-[#1B2733]"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {resolveFormKey === item.key && (
                      <div className="mt-3 ml-9 space-y-2 max-w-md">
                        <div>
                          <label className="block text-[11px] text-[#5B6877] mb-1">Status</label>
                          <select
                            value={resolveStatus}
                            onChange={(e) => setResolveStatus(e.target.value)}
                            className="border border-[#C4CCD6] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#0B63B6]"
                          >
                            <option value="complete">Complete</option>
                            <option value="pending">Pending</option>
                            <option value="missing">Missing (reset)</option>
                          </select>
                        </div>

                        {/* Boolean fields (currently just the TFSOM-UHHD
                            risk factors) get Present/Absent toggles
                            instead of a free-text box — the finding IS
                            the value, there's nothing else to type. */}
                        {resolveStatus !== "missing" && item.data_type === "boolean" && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setResolveValue("true")}
                              className={`flex-1 text-xs font-medium px-3 py-2 rounded border transition-colors ${
                                resolveValue === "true"
                                  ? "bg-amber-50 border-amber-500 text-amber-700"
                                  : "border-[#C4CCD6] text-[#5B6877] hover:bg-[#EEF2F6]"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => setResolveValue("false")}
                              className={`flex-1 text-xs font-medium px-3 py-2 rounded border transition-colors ${
                                resolveValue === "false"
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                  : "border-[#C4CCD6] text-[#5B6877] hover:bg-[#EEF2F6]"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        )}
                        {resolveStatus !== "missing" && item.data_type !== "boolean" && (
                          <textarea
                            autoFocus
                            value={resolveValue}
                            onChange={(e) => setResolveValue(e.target.value)}
                            placeholder={
                              item.category === "patient_support"
                                ? "What was discussed, and when/how (e.g. in clinic, phone follow-up)…"
                                : "Enter the finding…"
                            }
                            rows={3}
                            className="w-full border border-[#C4CCD6] rounded px-2.5 py-2 text-xs focus:outline-none focus:border-[#0B63B6] resize-none"
                          />
                        )}

                        {/* Measurement standardization metadata — only for
                            measurement-category fields, directly addressing
                            the real critique that published tumor
                            measurements rarely document who measured, how,
                            or whether a basal diameter is a chord- or
                            arc-length. */}
                        {item.category === "measurement" && resolveStatus === "complete" && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] text-[#5B6877] mb-0.5">Largest basal diameter (mm)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={resolveBasalDiameter}
                                  onChange={(e) => setResolveBasalDiameter(e.target.value)}
                                  placeholder="e.g. 10.1"
                                  className="w-full border border-[#C4CCD6] rounded px-2 py-1.5 text-xs bg-[#FFFFFF] text-[#3D4B5C] focus:outline-none focus:border-[#0B63B6]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-[#5B6877] mb-0.5">Apical height (mm)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={resolveApicalHeight}
                                  onChange={(e) => setResolveApicalHeight(e.target.value)}
                                  placeholder="e.g. 3.9"
                                  className="w-full border border-[#C4CCD6] rounded px-2 py-1.5 text-xs bg-[#FFFFFF] text-[#3D4B5C] focus:outline-none focus:border-[#0B63B6]"
                                />
                              </div>
                            </div>
                            <p className="text-[11px] text-[#6B7785] -mt-1">These two numbers are what let tumor size be tracked as a real trend over time.</p>
                            <div className="grid grid-cols-3 gap-2">
                            <select
                              value={resolveMethod}
                              onChange={(e) => setResolveMethod(e.target.value)}
                              className="border border-[#C4CCD6] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#0B63B6]"
                            >
                              <option value="">Method…</option>
                              <option value="Indirect ophthalmoscopy / fundus exam">Ophthalmoscopy</option>
                              <option value="B-scan ultrasonography">B-scan ultrasound</option>
                              <option value="Fundus photography">Fundus photography</option>
                              <option value="Optical coherence tomography">OCT</option>
                              <option value="MRI">MRI</option>
                              <option value="CT">CT</option>
                              <option value="Other">Other</option>
                            </select>
                            <select
                              value={resolvePrecision}
                              onChange={(e) => setResolvePrecision(e.target.value)}
                              className="border border-[#C4CCD6] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#0B63B6]"
                            >
                              <option value="">Precision…</option>
                              <option value="Nearest 0.1 mm">Nearest 0.1 mm</option>
                              <option value="Nearest 0.5 mm">Nearest 0.5 mm</option>
                              <option value="Nearest 1 mm">Nearest 1 mm</option>
                              <option value="Not specified">Not specified</option>
                            </select>
                            <select
                              value={resolveLengthType}
                              onChange={(e) => setResolveLengthType(e.target.value)}
                              className="border border-[#C4CCD6] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#0B63B6]"
                            >
                              <option value="">Chord/Arc…</option>
                              <option value="Chord length">Chord length</option>
                              <option value="Arc length">Arc length</option>
                              <option value="Not specified">Not specified</option>
                            </select>
                            </div>
                          </>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setResolveFormKey(null)}
                            className="text-xs text-[#5B6877] px-2.5 py-1.5 rounded hover:bg-[#EEF2F6] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResolveSubmit(item.key)}
                            disabled={resolvingKey === item.key || (resolveStatus !== "missing" && !resolveValue.trim())}
                            className="text-xs font-medium text-white bg-[#0B63B6] px-3 py-1.5 rounded hover:bg-[#094F93] transition-colors disabled:opacity-50"
                          >
                            {resolvingKey === item.key ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. IMAGING
// A plain <img src="..."> can't attach an Authorization header, but every
// endpoint in this app — including image serving — correctly requires one.
// This component fetches the image bytes through apiFetch like everything
// else, then hands the browser a local object URL to actually display it.
function AuthenticatedImage({ caseId, fieldKey, imageId, alt, className }: { caseId: string; fieldKey?: string; imageId?: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    // One specific image when an id is given; otherwise the first image
    // of the study, which is what a plain thumbnail wants.
    const url = imageId
      ? `${API_BASE}/cases/${caseId}/images/by-id/${imageId}`
      : `${API_BASE}/cases/${caseId}/images/${fieldKey}`;

    apiFetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("No image");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [caseId, fieldKey, imageId]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}

// One entry per uploaded image. A study (e.g. an OCT series) is several
// of these sharing a field_key, in viewing order.
type StudyImage = { id: string; field_key: string; filename: string; position: number; uploaded_at: string | null };

const MAX_IMAGES_PER_STUDY = 60; // keep in step with the backend's limit

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]); // strip the "data:image/png;base64," prefix
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

// Full-screen viewer for ONE study's images. Real OCT, CT and similar
// studies are dozens of slices a clinician scrolls up and down through —
// a single still doesn't show the finding — so this steps through every
// image in the study: mouse wheel, arrow keys, the on-screen buttons, or
// the slider. Neighbouring slices are fetched ahead of time so stepping
// feels instant instead of waiting on the network for each one.
function SeriesViewer({ caseId, label, images, startIndex, onClose, onDeleteImage }: {
  caseId: string;
  label: string;
  images: StudyImage[];
  startIndex: number;
  onClose: () => void;
  onDeleteImage: (imageId: string) => Promise<void>;
}) {
  // uvealcare: image viewer v2
  const total = images.length;
  const [index, setIndex] = useState(startIndex);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrls = useRef<Record<string, string>>({});
  const requested = useRef<Set<string>>(new Set());
  const alive = useRef(true);
  const wheelAccum = useRef(0);

  // Display-only view settings. None of these touch the stored image.
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [inverted, setInverted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const viewRef = useRef({ scale: 1, pan: { x: 0, y: 0 } });
  viewRef.current = { scale, pan };

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 16;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const viewChanged = scale !== 1 || rotation !== 0 || brightness !== 100 || contrast !== 100 || inverted;

  // Zoom toward a point on screen (the cursor), so whatever you are
  // pointing at stays under the cursor instead of sliding away.
  const zoomAt = (nextScale: number, clientX?: number, clientY?: number) => {
    const s0 = viewRef.current.scale;
    const s = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    const t = viewRef.current.pan;
    let px = 0;
    let py = 0;
    const el = stageRef.current;
    if (el && clientX !== undefined && clientY !== undefined) {
      const r = el.getBoundingClientRect();
      px = clientX - (r.left + r.width / 2);
      py = clientY - (r.top + r.height / 2);
    }
    const k = s / s0;
    setScale(s);
    setPan(s <= 1 ? { x: 0, y: 0 } : { x: px - (px - t.x) * k, y: py - (py - t.y) * k });
  };
  const zoomBy = (factor: number) => zoomAt(viewRef.current.scale * factor);
  const fitView = () => { setScale(1); setPan({ x: 0, y: 0 }); };
  // A sideways (90 / 270 degree) image is tall instead of wide, so it is
  // shrunk just enough to stay inside the viewing area.
  const rotationFit = () => {
    const img = imgRef.current;
    const stage = stageRef.current;
    if (rotation % 180 === 0 || !img || !stage || !img.clientWidth || !img.clientHeight) return 1;
    return Math.min(1, stage.clientHeight / img.clientWidth, stage.clientWidth / img.clientHeight);
  };
  const actualPixels = () => {
    const img = imgRef.current;
    if (!img || !img.clientWidth || !img.naturalWidth) return;
    setPan({ x: 0, y: 0 });
    setScale(clamp(img.naturalWidth / img.clientWidth / rotationFit(), MIN_SCALE, MAX_SCALE));
  };
  const resetView = () => {
    fitView();
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setInverted(false);
  };

  // After a delete the list shrinks — never point past its end.
  const current = Math.max(0, Math.min(index, total - 1));
  const shown = images[current];

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      Object.values(objectUrls.current).forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const load = (id: string) => {
    if (requested.current.has(id)) return;
    requested.current.add(id);
    apiFetch(`${API_BASE}/cases/${caseId}/images/by-id/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Couldn't load image");
        return res.blob();
      })
      .then((blob) => {
        if (!alive.current) return;
        const url = URL.createObjectURL(blob);
        objectUrls.current[id] = url;
        setUrls((prev) => ({ ...prev, [id]: url }));
        setFailed((prev) => ({ ...prev, [id]: false }));
      })
      .catch(() => {
        requested.current.delete(id); // allow a retry the next time this slice is visited
        if (alive.current) setFailed((prev) => ({ ...prev, [id]: true }));
      });
  };

  // The slice on screen first, then the ones around it (further ahead
  // while playing, so the loop does not stall).
  const idKey = images.map((i) => i.id).join(",");
  useEffect(() => {
    const ahead = playing ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2];
    [0, ...ahead, -1].forEach((d) => {
      const im = images[current + d];
      if (im) load(im.id);
    });
  }, [current, idKey, playing]);

  // If the last image in the study was deleted, there's nothing left to view.
  useEffect(() => {
    if (total === 0) onClose();
  }, [total]);

  // Cine loop. It only advances when the next slice is already loaded, so
  // a slow connection pauses on the right slice instead of showing a
  // different one.
  useEffect(() => {
    if (!playing || total < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => {
        const cur = Math.max(0, Math.min(i, total - 1));
        const next = cur + 1 >= total ? 0 : cur + 1;
        return objectUrls.current[images[next].id] ? next : cur;
      });
    }, 125);
    return () => window.clearInterval(timer);
  }, [playing, total, idKey]);

  const goTo = (i: number) => {
    setConfirmingDelete(false);
    setDeleteError(null);
    setIndex(Math.max(0, Math.min(total - 1, i)));
  };
  const go = (delta: number) => goTo(current + delta);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      const tag = (e.target as HTMLElement | null)?.tagName;
      const inSlider = tag === "INPUT"; // a focused slider keeps its own arrow / Home / End keys
      if (!inSlider && (e.key === "ArrowRight" || e.key === "ArrowDown")) { e.preventDefault(); go(1); }
      else if (!inSlider && (e.key === "ArrowLeft" || e.key === "ArrowUp")) { e.preventDefault(); go(-1); }
      else if (!inSlider && e.key === "Home") { e.preventDefault(); goTo(0); }
      else if (!inSlider && e.key === "End") { e.preventDefault(); goTo(total - 1); }
      else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomBy(1.25); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomBy(0.8); }
      else if (e.key === "0") { e.preventDefault(); fitView(); }
      else if (e.key === "i" || e.key === "I") { e.preventDefault(); setInverted((v) => !v); }
      else if (e.key === "r" || e.key === "R") { e.preventDefault(); setRotation((r) => (r + 90) % 360); }
      else if (e.key === " " && tag !== "BUTTON" && tag !== "A" && !inSlider) { e.preventDefault(); if (total > 1) setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, total, onClose]);

  // Plain scroll steps through the slices. Ctrl/Cmd + scroll, or a
  // trackpad pinch (browsers report a pinch as Ctrl + scroll), zooms
  // toward the cursor. Attached natively (not as a React prop) so it can
  // stop the page behind the viewer from scrolling or zooming too.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-clamp(e.deltaY, -50, 50) * 0.004);
        zoomAt(viewRef.current.scale * factor, e.clientX, e.clientY);
        return;
      }
      wheelAccum.current += e.deltaY;
      if (Math.abs(wheelAccum.current) >= 60) {
        go(wheelAccum.current > 0 ? 1 : -1);
        wheelAccum.current = 0;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [current, total]);

  if (total === 0 || !shown) return null;

  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteImage(shown.id);
    } catch {
      setDeleteError("Couldn't delete that image. Please try again.");
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || viewRef.current.scale <= 1.01) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    setPan({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) });
  };
  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const src = urls[shown.id];
  const toolBtn = "text-xs text-white/80 hover:text-white border border-white/25 hover:bg-white/10 rounded px-2.5 py-1 transition-colors";
  const toolBtnOn = "text-xs text-white border border-white/70 bg-white/15 rounded px-2.5 py-1 transition-colors";

  return (
    <div ref={rootRef} className="fixed inset-0 bg-black z-50 flex flex-col" role="dialog" aria-label={`${label} images`}>
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-white/10 shrink-0">
        <div className="min-w-0">
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-white/60 text-xs truncate">{shown.filename}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-white/80 text-sm tabular-nums">{current + 1} / {total}</span>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-sm border border-white/30 rounded px-3 py-1"
          >
            Close
          </button>
        </div>
      </div>

      {/* Tools */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-2 border-b border-white/10 shrink-0" aria-label="Image tools">
        <div className="flex items-center gap-1.5">
          <button onClick={() => zoomBy(0.8)} aria-label="Zoom out" className={toolBtn}>−</button>
          <span className="text-white/80 text-xs tabular-nums w-14 text-center" aria-live="polite">{`×${scale.toFixed(1)}`}</span>
          <button onClick={() => zoomBy(1.25)} aria-label="Zoom in" className={toolBtn}>+</button>
          <button onClick={fitView} className={toolBtn}>Fit</button>
          <button onClick={actualPixels} className={toolBtn} title="True pixel size">1:1</button>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setRotation((r) => (r + 90) % 360)} className={toolBtn} title="Rotate 90° (R)">Rotate</button>
          <button onClick={() => setInverted((v) => !v)} className={inverted ? toolBtnOn : toolBtn} aria-pressed={inverted} title="Invert (I)">Invert</button>
        </div>
        <label className="flex items-center gap-2 text-xs text-white/70">
          Brightness
          <input type="range" min={40} max={200} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} aria-label="Brightness" className="w-24 accent-[#0B63B6]" />
        </label>
        <label className="flex items-center gap-2 text-xs text-white/70">
          Contrast
          <input type="range" min={40} max={250} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} aria-label="Contrast" className="w-24 accent-[#0B63B6]" />
        </label>
        {viewChanged && (
          <button onClick={resetView} className={toolBtn}>Reset view</button>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          {total > 1 && (
            <button onClick={() => setPlaying((p) => !p)} className={playing ? toolBtnOn : toolBtn} aria-pressed={playing} title="Play through the stack (Space)">
              {playing ? "Pause" : "Play"}
            </button>
          )}
          {src && (
            <a href={src} download={shown.filename} className={toolBtn} title="Download the original image">Download</a>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center gap-4 px-4 py-4 overflow-hidden">
        <button
          onClick={() => go(-1)}
          disabled={current === 0}
          aria-label="Previous image"
          className="w-10 h-10 shrink-0 rounded-full border border-white/30 text-white text-lg hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
        >
          ‹
        </button>
        <div
          ref={stageRef}
          className="flex-1 min-w-0 self-stretch flex items-center justify-center overflow-hidden relative touch-none"
          style={{ cursor: scale > 1.01 ? (dragging ? "grabbing" : "grab") : "default" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={(e) => (scale > 1.01 ? fitView() : zoomAt(2.5, e.clientX, e.clientY))}
        >
          {src ? (
            <img
              ref={imgRef}
              src={src}
              alt={`${label} — image ${current + 1} of ${total}`}
              draggable={false}
              className="max-w-full object-contain select-none"
              style={{
                maxHeight: "calc(100vh - 290px)",
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale * rotationFit()}) rotate(${rotation}deg)`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) invert(${inverted ? 1 : 0})`,
                imageRendering: scale >= 3 ? "pixelated" : "auto",
                transition: dragging ? "none" : "transform 60ms linear",
              }}
            />
          ) : failed[shown.id] ? (
            <p className="text-red-300 text-sm">Unable to load this image.</p>
          ) : (
            <p className="text-white/60 text-sm">Loading…</p>
          )}
        </div>
        <button
          onClick={() => go(1)}
          disabled={current === total - 1}
          aria-label="Next image"
          className="w-10 h-10 shrink-0 rounded-full border border-white/30 text-white text-lg hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
        >
          ›
        </button>
      </div>

      <div className="shrink-0 border-t border-white/10 px-6 py-3 space-y-2">
        {total > 1 && (
          <input
            type="range"
            min={0}
            max={total - 1}
            value={current}
            onChange={(e) => goTo(Number(e.target.value))}
            aria-label="Scrub through images"
            className="w-full accent-[#0B63B6]"
          />
        )}
        <div className="flex items-center justify-between gap-4">
          <p className="text-white/50 text-xs">
            Scroll or use the arrow keys to move through images. Ctrl/Cmd + scroll or pinch to zoom, drag to pan, double-click to zoom. Space plays. Esc closes.
          </p>
          {confirmingDelete ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-white/80">Delete image {current + 1} of {total}?</span>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="text-xs font-medium text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-xs text-white/70 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setPlaying(false); setConfirmingDelete(true); }}
              className="text-xs text-red-300 hover:underline shrink-0"
            >
              Delete this image
            </button>
          )}
        </div>
        {deleteError && <p className="text-xs text-red-300">{deleteError}</p>}
      </div>
    </div>
  );
}

function ImagingContent({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  // Which study's images are open in the full-screen viewer, and which
  // slice it opened on. A study can hold many images — a real OCT or CT
  // series is dozens of slices you scroll through, not one snapshot — so
  // this opens a viewer you step through rather than a single picture.
  const [viewer, setViewer] = useState<{ fieldKey: string; label: string; index: number } | null>(null);

  // Same live-fetch pattern as the other screens — pulling the full
  // checklist so both the imaging table AND the measurements card below
  // can show real per-patient data instead of one hardcoded showcase case.
  const [checklist, setChecklist] = useState<
    { key: string; field: string; category: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null; basal_diameter_mm?: number | null; apical_height_mm?: number | null }[] | null
  >(null);

  // Tracks which study is currently being ordered, so only that row's
  // button shows a brief loading state.
  const [orderingKey, setOrderingKey] = useState<string | null>(null);

  // Every uploaded image, one entry each (a 24-slice study appears 24
  // times) — just ids, filenames and order, not the image data itself,
  // so this list stays lightweight.
  const [uploadedImages, setUploadedImages] = useState<StudyImage[]>([]);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ key: string; done: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Separate loading key for DICOM/PDF import — a different upload path
  // (multipart file upload, not base64 JSON) with its own in-flight state.
  const [importingKey, setImportingKey] = useState<string | null>(null);

  // One study's images, in viewing order.
  const imagesForStudy = (fieldKey: string) =>
    uploadedImages.filter((img) => img.field_key === fieldKey).sort((a, b) => a.position - b.position);

  // Real measurement history — every past recording of tumor size, not
  // just the single most recent value. This is what lets growth be
  // tracked as a genuine trend across visits, which manual chart review
  // does poorly and a single stored number can't show at all.
  const [measurementHistory, setMeasurementHistory] = useState<
    { value: string | null; basal_diameter_mm: number | null; apical_height_mm: number | null; measurement_method: string | null; recorded_at: string | null }[]
  >([]);

  const loadMeasurementHistory = () => {
    apiFetch(`${API_BASE}/cases/${caseId}/measurements/tumor_dimensions`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMeasurementHistory(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  const loadImageList = () =>
    apiFetch(`${API_BASE}/cases/${caseId}/images`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setUploadedImages(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Couldn't reach backend:", err));

  // Uploads one or many images to a study. Files are sorted by name the
  // way a person would ("slice_2" before "slice_10") and sent one at a
  // time, so a series exported as slice_001, slice_002, ... lands in the
  // right order. The whole batch is checked up front so a series never
  // ends up half-uploaded because of a file that was never going to work.
  const handleImageUpload = async (fieldKey: string, fileList: File[]) => {
    setUploadError(null);
    const files = [...fileList].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

    const notImage = files.find((f) => !f.type.startsWith("image/"));
    if (notImage) {
      setUploadError(`"${notImage.name}" isn't an image file — nothing was uploaded.`);
      return;
    }
    const tooBig = files.find((f) => f.size > 8 * 1024 * 1024);
    if (tooBig) {
      setUploadError(`"${tooBig.name}" is over 8MB — nothing was uploaded.`);
      return;
    }
    const alreadyThere = imagesForStudy(fieldKey).length;
    if (alreadyThere + files.length > MAX_IMAGES_PER_STUDY) {
      setUploadError(
        `A study can hold up to ${MAX_IMAGES_PER_STUDY} images. This one has ${alreadyThere}, so you can add ${Math.max(0, MAX_IMAGES_PER_STUDY - alreadyThere)} more — nothing was uploaded.`
      );
      return;
    }

    setUploadingKey(fieldKey);
    let done = 0;
    try {
      for (const file of files) {
        setUploadProgress({ key: fieldKey, done, total: files.length });
        const base64 = await readFileAsBase64(file);
        const res = await apiFetch(`${API_BASE}/cases/${caseId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field_key: fieldKey,
            filename: file.name,
            content_type: file.type,
            data_base64: base64,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Upload failed.");
        }
        done += 1;
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Upload failed.";
      setUploadError(`Uploaded ${done} of ${files.length}. Stopped at "${files[done]?.name}": ${reason}`);
    } finally {
      setUploadProgress(null);
      setUploadingKey(null);
      loadImageList();
    }
  };

  // Imports a single DICOM (.dcm) file exported from a vendor system
  // (Heidelberg, Optos, Visage) or a vendor PDF report, and hands it to
  // the backend to convert into image(s) for this study — a multi-frame
  // DICOM or multi-page PDF becomes a multi-slide study automatically,
  // no different from any other upload once it lands.
  const handleImportFile = async (fieldKey: string, file: File) => {
    setUploadError(null);
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".dcm") && !lower.endsWith(".dicom") && !lower.endsWith(".pdf")) {
      setUploadError(`"${file.name}" isn't a .dcm or .pdf file — nothing was imported.`);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError(`"${file.name}" is over 25MB — nothing was imported.`);
      return;
    }

    setImportingKey(fieldKey);
    try {
      const form = new FormData();
      form.append("field_key", fieldKey);
      form.append("file", file);
      // No Content-Type header here on purpose — the browser sets the
      // correct multipart boundary itself when the body is a FormData.
      const res = await apiFetch(`${API_BASE}/cases/${caseId}/images/import`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Import failed.");
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Import failed.";
      setUploadError(reason);
    } finally {
      setImportingKey(null);
      loadImageList();
    }
  };

  // Removes uploaded images. "Delete all" clears a whole study; the
  // viewer's "Delete this image" removes just one slice.
  const [confirmingImageDeleteKey, setConfirmingImageDeleteKey] = useState<string | null>(null);
  const [deletingImageKey, setDeletingImageKey] = useState<string | null>(null);

  const handleDeleteImage = (fieldKey: string) => {
    setDeletingImageKey(fieldKey);
    apiFetch(`${API_BASE}/cases/${caseId}/images/${fieldKey}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        loadImageList();
        setConfirmingImageDeleteKey(null);
      })
      .catch((err) => console.error("Couldn't delete image:", err))
      .finally(() => setDeletingImageKey(null));
  };

  const handleDeleteOneImage = async (imageId: string) => {
    const res = await apiFetch(`${API_BASE}/cases/${caseId}/images/by-id/${imageId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    await loadImageList();
  };

  const loadImaging = () => {
    apiFetch(`${API_BASE}/cases/${caseId}/readiness`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setChecklist(data.checklist))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  useEffect(() => {
    loadImaging();
    loadImageList();
    loadMeasurementHistory();
  }, [caseId]);

  const imagingItems = checklist?.filter((c) => c.category === "imaging") ?? null;
  const measurementItem = checklist?.find((c) => c.key === "tumor_dimensions");

  // This is the second "write" action in the app (after Resolve on the
  // Case Readiness page) — but it marks a study "pending" rather than
  // "complete", modeling the real workflow: order a study, wait for
  // results, then someone marks it complete once the images come back.
  const handleOrder = (fieldKey: string) => {
    setOrderingKey(fieldKey);
    apiFetch(`${API_BASE}/cases/${caseId}/values`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field_key: fieldKey,
        status: "pending",
        value: null,
        source: "Ordered via UI — awaiting results",
      }),
    })
      .then((res) => res.json())
      .then(() => loadImaging())
      .catch((err) => console.error("Couldn't order study:", err))
      .finally(() => setOrderingKey(null));
  };

  // Closes the loop: a pending study can now be marked complete once
  // results actually come back, right from this same screen — no more
  // detouring to the Case Readiness page just to finish an imaging study.
  const handleReceiveResult = (fieldKey: string) => {
    setOrderingKey(fieldKey);
    apiFetch(`${API_BASE}/cases/${caseId}/values`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field_key: fieldKey,
        status: "complete",
        value: "Result received via UI",
        source: "Dr. A. Reyes",
      }),
    })
      .then((res) => res.json())
      .then(() => loadImaging())
      .catch((err) => console.error("Couldn't mark result received:", err))
      .finally(() => setOrderingKey(null));
  };

  // Bulk version of handleOrder — orders every currently-missing study in
  // one click, instead of clicking "Order" on each row individually.
  const [isBulkOrdering, setIsBulkOrdering] = useState(false);
  const handleOrderAllMissing = () => {
    const missing = (imagingItems ?? []).filter((s) => s.status === "missing");
    if (missing.length === 0) return;
    setIsBulkOrdering(true);
    Promise.all(
      missing.map((s) =>
        apiFetch(`${API_BASE}/cases/${caseId}/values`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field_key: s.key,
            status: "pending",
            value: null,
            source: "Ordered via UI — awaiting results",
          }),
        })
      )
    )
      .then(() => loadImaging())
      .catch((err) => console.error("Couldn't order missing studies:", err))
      .finally(() => setIsBulkOrdering(false));
  };

  if (!imagingItems) {
    return <p className="text-[#5B6877] text-sm">Loading imaging studies…</p>;
  }

  const completeCount = imagingItems.filter((s) => s.status === "complete").length;
  const pct = imagingItems.length ? Math.round((completeCount / imagingItems.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#5B6877]">{completeCount}/{imagingItems.length} studies complete</span>
          <div className="h-1.5 w-32 bg-[#F6F8FA] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button
          onClick={handleOrderAllMissing}
          disabled={isBulkOrdering || imagingItems.filter((s) => s.status === "missing").length === 0}
          className="bg-[#0F2D56] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#0B2342] transition-colors disabled:opacity-50"
        >
          {isBulkOrdering ? "Ordering…" : "+ Order Missing Imaging"}
        </button>
      </div>

      {uploadError && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{uploadError}</p>
      )}

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E4E8ED] bg-[#FFFFFF]">
              {["Study", "Status", "Image", "Source / Technician", "Findings", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#5B6877]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8ED]">
            {imagingItems.map((s) => {
              const studyImages = imagesForStudy(s.key);
              const hasImage = studyImages.length > 0;
              return (
              <tr key={s.key} className={`${s.status === "missing" ? "bg-red-50" : s.status === "pending" ? "bg-amber-50" : "hover:bg-[#F6F8FA]"} transition-colors`}>
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-[#1B2733]">{s.field}</p>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={s.status as any} />
                </td>
                <td className="px-5 py-3.5">
                  {hasImage ? (
                    <button
                      onClick={() => setViewer({ fieldKey: s.key, label: s.field, index: 0 })}
                      className="relative inline-block w-28 h-28 hover:opacity-80 hover:ring-2 hover:ring-[#0B63B6] rounded transition-all"
                      title={studyImages.length > 1 ? `Open all ${studyImages.length} images` : "Click to view full size"}
                    >
                      <AuthenticatedImage
                        caseId={caseId}
                        imageId={studyImages[0].id}
                        alt={`${s.field} image`}
                        className="w-28 h-28 object-cover rounded border border-[#D5DBE3]"
                      />
                      {studyImages.length > 1 && (
                        <span className="absolute bottom-1 right-1 text-[11px] font-mono bg-black/75 text-white px-1.5 py-0.5 rounded">
                          {studyImages.length} images
                        </span>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#6B7785] italic">No image</span>
                  )}
                  <label className="block mt-1 text-[11px] text-[#0B63B6] hover:underline cursor-pointer">
                    {uploadingKey === s.key
                      ? uploadProgress && uploadProgress.key === s.key
                        ? `Uploading ${Math.min(uploadProgress.done + 1, uploadProgress.total)} of ${uploadProgress.total}…`
                        : "Uploading…"
                      : hasImage ? "Add images" : "Upload images"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="bg-[#FFFFFF] hidden"
                      disabled={uploadingKey === s.key}
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length > 0) handleImageUpload(s.key, files);
                        e.target.value = ""; // allow re-selecting the same files later
                      }}
                    />
                  </label>
                  <label className="block mt-0.5 text-[11px] text-[#0B63B6] hover:underline cursor-pointer">
                    {importingKey === s.key ? "Importing…" : "Import DICOM/PDF"}
                    <input
                      type="file"
                      accept=".dcm,.dicom,application/dicom,.pdf,application/pdf"
                      className="bg-[#FFFFFF] hidden"
                      disabled={importingKey === s.key}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImportFile(s.key, file);
                        e.target.value = ""; // allow re-selecting the same file later
                      }}
                    />
                  </label>
                  {hasImage && confirmingImageDeleteKey !== s.key && (
                    <button
                      onClick={() => setConfirmingImageDeleteKey(s.key)}
                      className="block mt-0.5 text-[11px] text-red-700 hover:underline"
                    >
                      {studyImages.length > 1 ? "Delete all" : "Delete"}
                    </button>
                  )}
                  {confirmingImageDeleteKey === s.key && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[11px] text-[#3D4B5C]">{studyImages.length > 1 ? `Delete all ${studyImages.length}?` : "Sure?"}</span>
                      <button
                        onClick={() => handleDeleteImage(s.key)}
                        disabled={deletingImageKey === s.key}
                        className="text-[11px] font-medium text-white bg-red-500 px-1.5 py-0.5 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deletingImageKey === s.key ? "…" : "Yes"}
                      </button>
                      <button
                        onClick={() => setConfirmingImageDeleteKey(null)}
                        className="text-[11px] text-[#5B6877] hover:text-[#1B2733]"
                      >
                        No
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <p className={`text-xs ${s.source ? "text-[#3D4B5C]" : "text-[#6B7785]"}`}>{s.source ?? "Not assigned"}</p>
                </td>
                <td className="px-5 py-3.5 max-w-xs">
                  <p className={`text-xs leading-relaxed ${s.status === "missing" ? "text-red-700 italic" : s.status === "pending" ? "text-amber-700 italic" : "text-[#3D4B5C]"}`}>
                    {s.value ?? (s.status === "pending" ? "Awaiting results" : "Not yet acquired")}
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  {s.status === "missing" ? (
                    <button
                      onClick={() => handleOrder(s.key)}
                      disabled={orderingKey === s.key}
                      className="text-xs text-white bg-red-500 px-2.5 py-1.5 rounded hover:bg-red-500 transition-colors disabled:opacity-60"
                    >
                      {orderingKey === s.key ? "Ordering…" : "Order"}
                    </button>
                  ) : s.status === "pending" ? (
                    <button
                      onClick={() => handleReceiveResult(s.key)}
                      disabled={orderingKey === s.key}
                      className="text-xs text-white bg-amber-500 px-2.5 py-1.5 rounded hover:bg-amber-600 transition-colors disabled:opacity-60"
                    >
                      {orderingKey === s.key ? "Saving…" : "Mark Result Received"}
                    </button>
                  ) : (
                    <span className="text-xs text-[#6B7785]">—</span>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Measurements card — real value for whichever patient this is,
          not one hardcoded showcase case */}
      <Card className="p-5">
        <SectionHeader>Tumor Measurements</SectionHeader>
        {measurementItem?.value ? (
          <div>
            <p className="text-sm text-[#3D4B5C] leading-relaxed">{measurementItem.value}</p>
            {(measurementItem.measurement_method || measurementItem.measurement_precision || measurementItem.measurement_length_type) && (
              <div className="flex flex-wrap gap-3 mt-2">
                {measurementItem.measurement_method && (
                  <span className="text-[11px] text-[#5B6877] bg-[#F6F8FA] px-2 py-0.5 rounded">Method: {measurementItem.measurement_method}</span>
                )}
                {measurementItem.measurement_precision && (
                  <span className="text-[11px] text-[#5B6877] bg-[#F6F8FA] px-2 py-0.5 rounded">Precision: {measurementItem.measurement_precision}</span>
                )}
                {measurementItem.measurement_length_type && (
                  <span className="text-[11px] text-[#5B6877] bg-[#F6F8FA] px-2 py-0.5 rounded">{measurementItem.measurement_length_type}</span>
                )}
              </div>
            )}
            {measurementItem.source && (
              <p className="text-[11px] text-[#6B7785] mt-2">Source: {measurementItem.source}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#6B7785] italic">
            Not yet recorded for this patient — see the "Tumor measurements" status on the Case Readiness page.
          </p>
        )}

        {/* Measurement history — every past recording, oldest first, so
            growth (or stability) across visits is genuinely visible,
            not just the single most recent number. */}
        {measurementHistory.length > 1 && (
          <div className="mt-4 pt-4 border-t border-[#D5DBE3]">
            <p className="text-[11px] font-semibold text-[#5B6877] mb-2">History ({measurementHistory.length} recordings)</p>
            <div className="space-y-2">
              {measurementHistory.map((h, i) => {
                const prev = i > 0 ? measurementHistory[i - 1] : null;
                let changeLabel: string | null = null;
                let changeColor = "text-[#5B6877]";
                if (prev && h.basal_diameter_mm != null && prev.basal_diameter_mm != null) {
                  const diff = h.basal_diameter_mm - prev.basal_diameter_mm;
                  if (Math.abs(diff) >= 0.1) {
                    changeLabel = `${diff > 0 ? "+" : ""}${diff.toFixed(1)}mm basal diameter`;
                    changeColor = diff > 0 ? "text-amber-700" : "text-emerald-700";
                  } else {
                    changeLabel = "No significant change";
                  }
                }
                return (
                  <div key={i} className="flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="text-[#3D4B5C]">{h.value}</p>
                      {changeLabel && <p className={`text-[11px] mt-0.5 ${changeColor}`}>{changeLabel}</p>}
                    </div>
                    <span className="text-[11px] text-[#6B7785] shrink-0">
                      {h.recorded_at ? new Date(h.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Full-screen image viewer — opens on the study you clicked and
          steps through every image in it. */}
      {viewer && (
        <SeriesViewer
          caseId={caseId}
          label={viewer.label}
          images={imagesForStudy(viewer.fieldKey)}
          startIndex={viewer.index}
          onClose={() => setViewer(null)}
          onDeleteImage={handleDeleteOneImage}
        />
      )}
    </div>
  );
}

function ImagingScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  const [caseInfo, setCaseInfo] = useState<{ patient: string; mrn: string } | null>(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCaseInfo(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, [caseId]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Imaging & Measurements"
        subtitle={caseInfo ? `${caseInfo.patient} · ${caseInfo.mrn}` : ""}
      />
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FFFFFF]">
        <ImagingContent onNav={onNav} caseId={caseId} />
      </div>
    </div>
  );
}

// 5b. CASE PACKET
// A single printable page assembling everything a clinician currently
// gathers by hand before presenting a case — the current measurement
// and its trend, one representative image per imaging study, readiness
// status, and the recorded treatment/follow-up plan. This is the direct
// answer to "I bring important cross-sections into my Epic note — what
// does this give me over that": one button instead of that manual work.
type CasePacket = {
  case_id: string;
  patient_name: string;
  mrn: string;
  dob: string | null;
  laterality: string | null;
  diagnosis: string | null;
  disease_profile: string;
  care_stage: string;
  generated_at: string;
  readiness_pct: number;
  ready_for_review: boolean;
  missing_information: string[];
  checklist: { key: string; field: string; category: string; data_type?: string; status: string; required: boolean; value: string | null; source: string | null }[];
  measurement: {
    value: string | null;
    method: string | null;
    precision: string | null;
    length_type: string | null;
    basal_diameter_mm: number | null;
    apical_height_mm: number | null;
    recorded_at: string | null;
    trend: "growing" | "shrinking" | "stable" | null;
  } | null;
  decision: {
    recommendation: string;
    rationale: string | null;
    next_step: string | null;
    responsible_provider: string | null;
    follow_up_date: string | null;
    surveillance_protocol: string | null;
    recorded_at: string | null;
  } | null;
  key_images: { field_key: string; field_label: string; image_id: string; filename: string; total_in_study: number }[];
  tfsom_risk: {
    factors_assessed: number;
    factors_total: number;
    factors_present: string[];
    factor_count: number;
    risk_label: "Low" | "Moderate" | "High";
    risk_estimate: string;
    mnemonic: string;
  } | null;
  gep_risk: {
    gep_class: string;
    risk_label: "Low" | "Intermediate" | "High" | null;
    chromosome_3_status: string | null;
    test_name: string;
  } | null;
};

function CasePacketScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  const [packet, setPacket] = useState<CasePacket | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setPacket(null);
    setLoadError(null);
    apiFetch(`${API_BASE}/cases/${caseId}/packet`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Couldn't load this case's packet.");
        return res.json();
      })
      .then((data) => setPacket(data))
      .catch((err) => setLoadError(err.message));
  }, [caseId]);

  const trendLabel =
    packet?.measurement?.trend === "growing" ? "Growing since last measurement"
    : packet?.measurement?.trend === "shrinking" ? "Shrinking since last measurement"
    : packet?.measurement?.trend === "stable" ? "Stable since last measurement"
    : null;
  const trendColor =
    packet?.measurement?.trend === "growing" ? "text-amber-700"
    : packet?.measurement?.trend === "shrinking" ? "text-emerald-700"
    : "text-[#5B6877]";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Case Packet"
        subtitle={packet ? `${packet.patient_name} · ${packet.mrn}` : "Loading…"}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNav("patient")}
              className="border border-[#D5DBE3] text-[#3D4B5C] px-3 py-2 rounded text-sm hover:bg-[#F6F8FA] transition-colors"
            >
              Back to Patient
            </button>
            <button
              onClick={() => window.print()}
              disabled={!packet}
              className="bg-[#0F2D56] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#0B2342] transition-colors disabled:opacity-50"
            >
              Print / Save as PDF
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FFFFFF]">
        {loadError && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{loadError}</p>
        )}
        {!packet && !loadError && <p className="text-[#5B6877] text-sm">Assembling case packet…</p>}

        {packet && (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Header */}
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#1B2733]">{packet.patient_name}</h2>
                  <p className="text-sm text-[#5B6877] mt-0.5">
                    MRN {packet.mrn}
                    {packet.dob ? ` · DOB ${packet.dob}` : ""}
                    {packet.laterality ? ` · ${packet.laterality}` : ""}
                  </p>
                  <p className="text-sm text-[#3D4B5C] mt-1">{packet.diagnosis ?? "No diagnosis on file"}</p>
                  <p className="text-xs text-[#5B6877] mt-1">{packet.disease_profile} · {packet.care_stage}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={packet.ready_for_review ? "complete" : packet.readiness_pct >= 70 ? "warning" : "missing"} />
                  <p className="text-xs text-[#5B6877] mt-1">{packet.readiness_pct}% ready</p>
                </div>
              </div>
              {!packet.ready_for_review && packet.missing_information.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#D5DBE3]">
                  <p className="text-[11px] font-semibold text-[#5B6877] mb-1">Still missing</p>
                  <p className="text-xs text-amber-700">{packet.missing_information.join(", ")}</p>
                </div>
              )}
              <p className="text-[11px] text-[#6B7785] mt-3">
                Generated {new Date(packet.generated_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </Card>

            {/* TFSOM-UHHD growth-risk score — only shown once at least one
                of the 8 factors has actually been assessed, so a case
                that hasn't had risk-factor documentation started yet
                doesn't show a misleading "Low risk" badge. */}
            {packet.tfsom_risk && (
              <Card
                className={`p-5 border-l-4 ${
                  packet.tfsom_risk.risk_label === "High"
                    ? "border-l-red-500"
                    : packet.tfsom_risk.risk_label === "Moderate"
                    ? "border-l-amber-500"
                    : "border-l-emerald-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <SectionHeader>TFSOM-UHHD Growth Risk</SectionHeader>
                    <p className="text-xs text-[#5B6877] mt-1">{packet.tfsom_risk.risk_estimate}</p>
                    {packet.tfsom_risk.factors_present.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {packet.tfsom_risk.factors_present.map((f) => (
                          <span key={f} className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-[#6B7785] mt-2">
                      {packet.tfsom_risk.factors_assessed} of {packet.tfsom_risk.factors_total} factors assessed
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded shrink-0 ${
                      packet.tfsom_risk.risk_label === "High"
                        ? "bg-red-50 text-red-700"
                        : packet.tfsom_risk.risk_label === "Moderate"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {packet.tfsom_risk.risk_label}
                  </span>
                </div>
              </Card>
            )}

            {/* GEP (DecisionDx-UM) metastatic-risk result — a DIFFERENT
                axis from TFSOM above: TFSOM estimates a nevus's risk of
                becoming melanoma in the first place, this estimates an
                already-diagnosed melanoma's risk of spreading. Only
                shown once a result has actually been recorded. */}
            {packet.gep_risk && (
              <Card
                className={`p-5 border-l-4 ${
                  packet.gep_risk.risk_label === "High"
                    ? "border-l-red-500"
                    : packet.gep_risk.risk_label === "Intermediate"
                    ? "border-l-amber-500"
                    : packet.gep_risk.risk_label === "Low"
                    ? "border-l-emerald-500"
                    : "border-l-[#C4CCD6]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <SectionHeader>Gene Expression Profile ({packet.gep_risk.test_name})</SectionHeader>
                    <p className="text-xs text-[#5B6877] mt-1">Class {packet.gep_risk.gep_class}</p>
                    {packet.gep_risk.chromosome_3_status && (
                      <p className="text-[11px] text-[#6B7785] mt-1">Chromosome 3: {packet.gep_risk.chromosome_3_status}</p>
                    )}
                  </div>
                  {packet.gep_risk.risk_label ? (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded shrink-0 ${
                        packet.gep_risk.risk_label === "High"
                          ? "bg-red-50 text-red-700"
                          : packet.gep_risk.risk_label === "Intermediate"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {packet.gep_risk.risk_label} metastatic risk
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded shrink-0 bg-[#F6F8FA] text-[#5B6877]">
                      Unrecognized class
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* GEP (DecisionDx-UM) metastatic-risk result — a DIFFERENT
                axis from TFSOM above: TFSOM estimates a nevus's risk of
                becoming melanoma in the first place, this estimates an
                already-diagnosed melanoma's risk of spreading. Only
                shown once a result has actually been recorded. */}
            {packet.gep_risk && (
              <Card
                className={`p-5 border-l-4 ${
                  packet.gep_risk.risk_label === "High"
                    ? "border-l-red-500"
                    : packet.gep_risk.risk_label === "Intermediate"
                    ? "border-l-amber-500"
                    : packet.gep_risk.risk_label === "Low"
                    ? "border-l-emerald-500"
                    : "border-l-[#C4CCD6]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <SectionHeader>Gene Expression Profile ({packet.gep_risk.test_name})</SectionHeader>
                    <p className="text-xs text-[#5B6877] mt-1">{/^class/i.test(packet.gep_risk.gep_class) ? packet.gep_risk.gep_class : `Class ${packet.gep_risk.gep_class}`}</p>
                    {packet.gep_risk.chromosome_3_status && (
                      <p className="text-[11px] text-[#6B7785] mt-1">Chromosome 3: {packet.gep_risk.chromosome_3_status}</p>
                    )}
                  </div>
                  {packet.gep_risk.risk_label ? (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded shrink-0 ${
                        packet.gep_risk.risk_label === "High"
                          ? "bg-red-50 text-red-700"
                          : packet.gep_risk.risk_label === "Intermediate"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {packet.gep_risk.risk_label} metastatic risk
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded shrink-0 bg-[#F6F8FA] text-[#5B6877]">
                      Unrecognized class
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* Current measurement */}
            <Card className="p-5">
              <SectionHeader>Current Measurement</SectionHeader>
              {packet.measurement ? (
                <div>
                  <p className="text-sm text-[#3D4B5C]">{packet.measurement.value}</p>
                  {trendLabel && <p className={`text-xs mt-1 font-medium ${trendColor}`}>{trendLabel}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {packet.measurement.method && (
                      <span className="text-[11px] text-[#5B6877] bg-[#F6F8FA] px-2 py-0.5 rounded">Method: {packet.measurement.method}</span>
                    )}
                    {packet.measurement.precision && (
                      <span className="text-[11px] text-[#5B6877] bg-[#F6F8FA] px-2 py-0.5 rounded">Precision: {packet.measurement.precision}</span>
                    )}
                    {packet.measurement.length_type && (
                      <span className="text-[11px] text-[#5B6877] bg-[#F6F8FA] px-2 py-0.5 rounded">{packet.measurement.length_type}</span>
                    )}
                  </div>
                  {packet.measurement.recorded_at && (
                    <p className="text-[11px] text-[#6B7785] mt-2">
                      Recorded {new Date(packet.measurement.recorded_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#6B7785] italic">Not yet recorded for this patient.</p>
              )}
            </Card>

            {/* Key images — one representative slice per study */}
            <Card className="p-5">
              <SectionHeader>Key Images</SectionHeader>
              {packet.key_images.length === 0 ? (
                <p className="text-xs text-[#6B7785] italic">No images uploaded for this case yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {packet.key_images.map((img) => (
                    <div key={img.field_key}>
                      <AuthenticatedImage
                        caseId={caseId}
                        imageId={img.image_id}
                        alt={img.field_label}
                        className="w-full h-32 object-cover rounded border border-[#D5DBE3]"
                      />
                      <p className="text-xs text-[#3D4B5C] mt-1">{img.field_label}</p>
                      {img.total_in_study > 1 && (
                        <p className="text-[11px] text-[#6B7785]">1 of {img.total_in_study} images — see full series in Imaging</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Treatment / follow-up plan */}
            <Card className="p-5">
              <SectionHeader>Treatment &amp; Follow-up Plan</SectionHeader>
              {packet.decision ? (
                <div className="space-y-1.5">
                  <p className="text-sm text-[#1B2733] font-medium">{packet.decision.recommendation}</p>
                  {packet.decision.rationale && <p className="text-xs text-[#3D4B5C]">{packet.decision.rationale}</p>}
                  {packet.decision.next_step && (
                    <p className="text-xs text-[#5B6877]">Next step: {packet.decision.next_step}</p>
                  )}
                  {packet.decision.responsible_provider && (
                    <p className="text-xs text-[#5B6877]">Responsible: {packet.decision.responsible_provider}</p>
                  )}
                  {packet.decision.surveillance_protocol && (
                    <p className="text-xs text-[#5B6877]">Surveillance protocol: {packet.decision.surveillance_protocol}</p>
                  )}
                  {packet.decision.follow_up_date && (
                    <p className="text-xs font-medium text-[#0B63B6]">Follow-up due {packet.decision.follow_up_date}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#6B7785] italic">No decision recorded yet for this case.</p>
              )}
            </Card>

            {/* Full checklist */}
            <Card>
              <div className="px-5 py-4 border-b border-[#E4E8ED]">
                <SectionHeader>Full Checklist</SectionHeader>
              </div>
              <table className="w-full">
                <tbody className="divide-y divide-[#E4E8ED]">
                  {packet.checklist.map((c) => (
                    <tr key={c.key}>
                      <td className="px-5 py-2.5">
                        <p className="text-xs text-[#1B2733]">{c.field}</p>
                        {c.value && (
                          <p className="text-[11px] text-[#5B6877]">
                            {c.data_type === "boolean" ? (c.value === "true" ? "Present" : "Absent") : c.value}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <StatusBadge status={(c.required ? c.status : "optional") as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// 6. TUMOR BOARD (CASE SUMMARY)
function TumorBoardScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  // Same live-fetch pattern as the other screens — now pulling the full
  // checklist (not just the percentage) so the case summary below can be
  // genuinely generated from real data for whichever patient this is.
  const [readinessData, setReadinessData] = useState<{
    readiness_pct: number;
    checklist: { key: string; field: string; category: string; data_type?: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null; basal_diameter_mm?: number | null; apical_height_mm?: number | null; required?: boolean }[];
    missing_information: string[];
  } | null>(null);
  const [caseInfo, setCaseInfo] = useState<{ patient: string; mrn: string; diagnosis: string | null; laterality: string | null; primary_provider?: string | null } | null>(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}/readiness`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setReadinessData(data))
      .catch((err) => console.error("Couldn't reach backend:", err));

    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCaseInfo(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, [caseId]);

  const readinessPct = readinessData?.readiness_pct ?? null;
  const fieldValue = (key: string): string | null =>
    readinessData?.checklist.find((c) => c.key === key)?.value ?? null;
  const fieldStatus = (key: string): string =>
    readinessData?.checklist.find((c) => c.key === key)?.status ?? "missing";
  const imagingItems = readinessData?.checklist?.filter((c) => c.category === "imaging") ?? [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Tumor Board — Case Summary"
        subtitle="Multidisciplinary Oncology Conference"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="border border-[#D5DBE3] text-[#3D4B5C] px-3 py-2 rounded text-sm hover:bg-[#F6F8FA] transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={() => onNav("tumor-board-decision")}
              className="bg-[#0F2D56] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0B2342] transition-colors"
            >
              Record Decision
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FFFFFF]">
        <div className="grid grid-cols-[1fr_260px] gap-6">
          <div className="space-y-5">
            {/* Case header */}
            <Card className="p-6 border-l-4 border-l-[#0F2D56]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#1B2733]">{caseInfo ? caseInfo.patient : "Loading…"}</h2>
                  <p className="font-mono text-xs text-[#5B6877] mt-0.5">
                    {caseInfo ? caseInfo.mrn : ""}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status="warning" />
                  <p className="text-[11px] text-[#5B6877] mt-1">
                    Readiness: {readinessPct !== null ? `${readinessPct}%` : "…"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E4E8ED]">
                {[
                  { label: "Diagnosis", value: caseInfo?.diagnosis ?? "Not recorded" },
                  { label: "Laterality", value: caseInfo?.laterality ?? "Not recorded" },
                  { label: "TNM Stage", value: "Not recorded" },
                  { label: "Date of Dx", value: "Not recorded" },
                  { label: "Referring Provider", value: "Not recorded" },
                  { label: "Primary Provider", value: caseInfo?.primary_provider ?? "Not recorded" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[11px] text-[#5B6877] mb-0.5">{f.label}</p>
                    <p className={`text-sm font-medium ${f.value === "Not recorded" ? "text-[#6B7785] italic" : "text-[#1B2733]"}`}>{f.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tumor characteristics — real data for whichever patient this is */}
            <Card className="p-5">
              <SectionHeader>Tumor Characteristics</SectionHeader>
              {fieldValue("tumor_location") || fieldValue("tumor_dimensions") ? (
                <div className="space-y-2.5">
                  {fieldValue("tumor_location") && (
                    <div className="flex justify-between border-b border-[#E4E8ED] pb-2">
                      <span className="text-xs text-[#5B6877] shrink-0 mr-4">Location</span>
                      <span className="text-xs font-medium text-[#1B2733] text-right">{fieldValue("tumor_location")}</span>
                    </div>
                  )}
                  {fieldValue("tumor_dimensions") && (
                    <div className="flex justify-between">
                      <span className="text-xs text-[#5B6877] shrink-0 mr-4">Measurements</span>
                      <span className="text-xs font-medium text-[#1B2733] text-right">{fieldValue("tumor_dimensions")}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#6B7785] italic">Not yet recorded for this patient.</p>
              )}
            </Card>

            {/* Imaging summary — pulled from the real checklist, same data
                as the Imaging tab, so the two never disagree */}
            <Card className="p-5">
              <SectionHeader>Imaging Summary</SectionHeader>
              {imagingItems.length > 0 ? (
                <div className="space-y-3">
                  {imagingItems.map((i) => (
                    <div key={i.key} className={`flex gap-3 p-3 rounded border ${i.status === "missing" ? "bg-red-50 border-red-200" : i.status === "pending" ? "bg-amber-50 border-amber-200" : "bg-[#FFFFFF] border-[#E4E8ED]"}`}>
                      <span className={`font-mono text-xs font-semibold w-14 shrink-0 pt-0.5 ${i.status === "missing" ? "text-red-700" : i.status === "pending" ? "text-amber-700" : "text-[#0B63B6]"}`}>{i.field}</span>
                      <p className={`text-xs leading-relaxed ${i.status === "missing" ? "text-red-700 italic" : i.status === "pending" ? "text-amber-700 italic" : "text-[#3D4B5C]"}`}>
                        {i.value ?? (i.status === "pending" ? "Awaiting results" : "Not obtained")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5B6877]">Loading…</p>
              )}
            </Card>

            {/* Molecular — generic over whatever molecular fields this
                disease profile actually defines */}
            <Card className="p-5">
              <SectionHeader>Molecular & Genetic Testing</SectionHeader>
              {(() => {
                const molecularItems = readinessData?.checklist?.filter((c) => c.category === "molecular") ?? [];
                if (molecularItems.length === 0) return <p className="text-xs text-[#5B6877] italic">No molecular testing configured for this disease profile.</p>;
                return (
                  <div className="space-y-2.5">
                    {molecularItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#E4E8ED] last:border-0">
                        <span className="text-xs text-[#3D4B5C]">{item.field}</span>
                        <span className={`text-xs font-medium ${item.status === "complete" ? "text-[#1B2733]" : "text-amber-700"}`}>
                          {item.value ?? "Not yet recorded"}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>

            {/* Clinical Question — genuinely auto-generated from real case
                data, for every patient. This is the actual "auto-generate
                structured case summary" the product is meant to do. */}
            <Card className="p-5 border-l-4 border-l-[#0B63B6]">
              <SectionHeader>Question for Multidisciplinary Team</SectionHeader>
              <p className="text-[#1B2733] text-sm leading-relaxed">
                Patient with {caseInfo?.diagnosis ?? "an undocumented diagnosis"}
                {caseInfo?.laterality ? ` (${caseInfo.laterality})` : ""}.
                {fieldValue("tumor_location") ? ` ${fieldValue("tumor_location")}` : ""}
                {fieldValue("tumor_dimensions") ? ` ${fieldValue("tumor_dimensions")}` : ""}
                {(() => {
                  const molecular = (readinessData?.checklist?.filter((c) => c.category === "molecular" && c.value) ?? []);
                  return molecular.length > 0
                    ? ` Molecular testing: ${molecular.map((m) => m.value).join("; ")}.`
                    : " Molecular testing not yet available.";
                })()}
              </p>
              <p className="text-[#3D4B5C] text-sm leading-relaxed mt-3 font-medium">
                {readinessData && readinessData.missing_information.length > 0
                  ? `Case is ${readinessData.readiness_pct}% documented. Outstanding before full review: ${readinessData.missing_information.join(", ")}.`
                  : "Case is fully documented and ready for treatment recommendation."}
              </p>
            </Card>
          </div>

          {/* Right panel */}
          <div className="space-y-4">


            <Card className="p-4">
              <SectionHeader>Previous Treatment</SectionHeader>
              <p className="text-xs text-[#5B6877] italic">No prior treatment recorded for this diagnosis.</p>
            </Card>

            <button
              onClick={() => onNav("tumor-board-decision")}
              className="w-full bg-[#0F2D56] text-white rounded py-3 text-sm font-semibold hover:bg-[#0B2342] transition-colors"
            >
              Record MDT Decision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. TUMOR BOARD DECISION
function TumorBoardDecisionScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  const [caseInfo, setCaseInfo] = useState<{ patient: string; mrn: string; diagnosis?: string | null } | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState("");
  const [rationale, setRationale] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [responsible, setResponsible] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [surveillanceProtocol, setSurveillanceProtocol] = useState("");

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCaseInfo(data))
      .catch((err) => console.error("Couldn't reach backend:", err));

    // Check if a decision was already recorded for this case — this is
    // what makes the decision actually persist. Refreshing the page (or
    // coming back tomorrow) no longer loses it.
    apiFetch(`${API_BASE}/cases/${caseId}/decision`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setRecommendation(data.recommendation);
          setRationale(data.rationale ?? "");
          setNextStep(data.next_step ?? "");
          setResponsible(data.responsible_provider ?? "");
          setFollowUpDate(data.follow_up_date ?? "");
          setSurveillanceProtocol(data.surveillance_protocol ?? "");
          setRecorded(true);
        }
      })
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, [caseId]);

  // This is what makes "Save Decision" real: it actually writes to the
  // backend instead of just flipping a local flag. If it fails, the
  // person sees why, rather than believing something was saved that wasn't.
  const handleSaveDecision = () => {
    setSaveError(null);
    setIsSaving(true);
    apiFetch(`${API_BASE}/cases/${caseId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recommendation,
        rationale,
        next_step: nextStep,
        responsible_provider: responsible,
        follow_up_date: followUpDate || null,
        surveillance_protocol: surveillanceProtocol,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("The server couldn't save this decision.");
        return res.json();
      })
      .then(() => setRecorded(true))
      .catch((err) => setSaveError(err.message))
      .finally(() => setIsSaving(false));
  };

  if (recorded) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="MDT Decision Recorded" subtitle={caseInfo ? `${caseInfo.patient} · ${caseInfo.mrn}` : ""} />
        <div className="flex-1 overflow-y-auto px-8 py-12 bg-[#FFFFFF] flex items-start justify-center">
          <div className="max-w-lg w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#1B7F5C" strokeWidth="2.5">
                  <path d="M5 14l6 6L23 8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[#1B2733]">Decision Recorded</h2>
              <p className="text-[#5B6877] text-sm mt-2">Multidisciplinary tumor board decision has been saved and assigned.</p>
            </div>

            <Card className="p-6 space-y-4">
              {[
                { label: "Treatment Recommendation", value: recommendation },
                { label: "Next Step", value: nextStep },
                { label: "Responsible Provider", value: responsible },
                { label: "Follow-up Date", value: followUpDate || "Not set" },
                { label: "Surveillance Protocol", value: surveillanceProtocol },
              ].map((f) => (
                <div key={f.label} className="border-b border-[#E4E8ED] pb-3 last:border-0">
                  <p className="text-[11px] font-semibold text-[#5B6877] mb-1">{f.label}</p>
                  <p className="text-sm text-[#1B2733]">{f.value}</p>
                </div>
              ))}
            </Card>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => onNav("patient")}
                className="flex-1 border border-[#D5DBE3] text-[#3D4B5C] py-2.5 rounded text-sm font-medium hover:bg-[#F6F8FA] transition-colors"
              >
                Return to Patient
              </button>
              <button
                onClick={() => onNav("dashboard")}
                className="flex-1 bg-[#0F2D56] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#0B2342] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Record MDT Decision"
        subtitle={caseInfo ? `${caseInfo.patient} · ${caseInfo.mrn}` : ""}
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FFFFFF]">
        <div className="grid grid-cols-[1fr_300px] gap-6 max-w-5xl">
          <div className="space-y-5">
            {/* Treatment recommendation */}
            <Card className="p-5">
              <SectionHeader>Treatment Recommendation</SectionHeader>
              <div className="space-y-3">
                {[
                  "Iodine-125 (I-125) plaque brachytherapy",
                  "Proton beam radiation therapy",
                  "Enucleation",
                  "Active surveillance (observation)",
                  "Other / custom",
                ].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${recommendation === opt ? "border-[#0F2D56] bg-[#0F2D56]" : "border-[#9AA5B1] group-hover:border-[#9AA5B1]"}`}>
                      {recommendation === opt && <div className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]" />}
                    </div>
                    <span className="text-sm text-[#3D4B5C]">{opt}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Clinical rationale */}
            <Card className="p-5">
              <SectionHeader>Clinical Rationale</SectionHeader>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={6}
                className="w-full border border-[#D5DBE3] rounded px-3 py-2.5 text-sm text-[#3D4B5C] bg-[#FFFFFF] focus:outline-none focus:border-[#0B63B6] focus:ring-2 focus:ring-[#0B63B6]/20 transition-all resize-none"
              />
            </Card>

            {/* Next steps */}
            <Card className="p-5">
              <SectionHeader>Next Steps & Action Items</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#3D4B5C] mb-1.5">Immediate Next Step</label>
                  <input
                    value={nextStep}
                    onChange={(e) => setNextStep(e.target.value)}
                    className="w-full border border-[#D5DBE3] rounded px-3 py-2.5 text-sm text-[#3D4B5C] bg-[#FFFFFF] focus:outline-none focus:border-[#0B63B6] focus:ring-2 focus:ring-[#0B63B6]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#3D4B5C] mb-1.5">Responsible Provider</label>
                  <input
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    className="w-full border border-[#D5DBE3] rounded px-3 py-2.5 text-sm text-[#3D4B5C] bg-[#FFFFFF] focus:outline-none focus:border-[#0B63B6] focus:ring-2 focus:ring-[#0B63B6]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#3D4B5C] mb-1.5">Follow-up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full border border-[#D5DBE3] rounded px-3 py-2.5 text-sm text-[#3D4B5C] bg-[#FFFFFF] focus:outline-none focus:border-[#0B63B6] focus:ring-2 focus:ring-[#0B63B6]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#3D4B5C] mb-1.5">Surveillance Protocol</label>
                  <select
                    value={surveillanceProtocol}
                    onChange={(e) => setSurveillanceProtocol(e.target.value)}
                    className="w-full border border-[#D5DBE3] rounded px-3 py-2.5 text-sm text-[#3D4B5C] bg-[#FFFFFF] focus:outline-none focus:border-[#0B63B6] transition-all"
                  >
                    <option value="">Select protocol</option>
                    <option>Liver MRI every 6 months</option>
                    <option>Liver MRI every 12 months</option>
                    <option>Annual LFTs + imaging</option>
                    <option>Custom protocol</option>
                  </select>
                </div>
              </div>

            </Card>

            {saveError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{saveError}</p>
            )}

            <button
              onClick={handleSaveDecision}
              disabled={isSaving || !recommendation}
              className="w-full bg-[#0F2D56] text-white py-3 rounded text-sm font-semibold hover:bg-[#0B2342] transition-colors disabled:opacity-60"
            >
              {isSaving ? "Saving…" : "Save Decision & Mark Case Complete"}
            </button>
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <SectionHeader>Case Summary</SectionHeader>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Patient", value: caseInfo?.patient ?? "-" },
                  { label: "MRN", value: caseInfo?.mrn ?? "-", mono: true },
                  { label: "Diagnosis", value: caseInfo?.diagnosis ?? "Not recorded" },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between border-b border-[#E4E8ED] pb-1.5">
                    <span className="text-[#5B6877]">{f.label}</span>
                    <span className={`text-[#1B2733] font-medium ${(f as any).mono ? "font-mono text-[11px]" : ""}`}>{f.value}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

// 8. PATIENT CARE PATHWAY
// Rule-based plain-language translations — deliberately NOT AI-generated.
// Each entry here was written once, for a known, controlled clinical
// option already used elsewhere in the app (the treatment/surveillance
// dropdowns). This is the same principle as a pharmacist's printed
// medication handout: fixed, reviewable text, not something generated
// fresh for each patient. Anything outside this known list gets an
// honest "ask your care team" fallback instead of a guessed translation.
const TREATMENT_PLAIN_LANGUAGE: Record<string, string> = {
  "Iodine-125 (I-125) plaque brachytherapy": "A small radioactive disc will be placed on the outside wall of your eye, near the tumor, for several days, then removed. This delivers radiation precisely to the tumor while sparing as much of your vision as possible.",
  "Proton beam radiation therapy": "A focused beam of radiation particles will be aimed precisely at the tumor over a series of short outpatient sessions.",
  "Enucleation": "Surgical removal of the affected eye. This is typically recommended when the tumor is too large or advanced for eye-preserving treatments.",
  "Active surveillance (observation)": "No treatment yet — your care team will monitor the tumor closely with regular exams and imaging, and treat only if it shows signs of growth.",
};

const SURVEILLANCE_PLAIN_LANGUAGE: Record<string, string> = {
  "Liver MRI every 6 months": "You'll have an MRI of your liver every 6 months, since that's the most common place this cancer can spread to. Catching any spread early gives more treatment options.",
  "Liver MRI every 12 months": "You'll have an MRI of your liver once a year to check for any spread.",
  "Annual LFTs + imaging": "You'll have a yearly blood test checking your liver function, along with imaging, to watch for any signs of spread.",
};

// Generic per-stage plain-language descriptions, keyed by the real stage
// NAME (not hardcoded per-disease) — this is what lets the exact same
// timeline correctly describe either Uveal Melanoma's or Sarcoma's care
// stages, since most stage names are shared between disease profiles.
const STAGE_PLAIN_LANGUAGE: Record<string, string> = {
  "Diagnosis": "Your care team completed a clinical evaluation and confirmed your diagnosis.",
  "Imaging": "Specialized imaging was performed to precisely characterize the tumor's size, location, and features.",
  "Staging": "Imaging and testing were performed to determine the full extent of the disease.",
  "Case Preparation": "Your care team gathered and organized all the information needed before presenting your case.",
  "Multidisciplinary Review": "A team of specialists reviewed your case together and discussed the best treatment approach.",
  "Treatment Planning": "Your care team is preparing the details needed to carry out the recommended treatment.",
  "Treatment": "You are receiving your recommended treatment.",
  "Surveillance": "You'll have regular follow-up appointments to monitor for any recurrence or spread.",
};

// Turns a raw diagnosis string like "Choroidal Melanoma OD" or "Soft
// Tissue Sarcoma, Left Thigh" into a plain-language sentence, using
// simple keyword matching rather than a full free-text translator —
// safe because it only ever states the general tumor type and location
// pattern, never invents specifics it wasn't given.
function plainLanguageDiagnosis(diagnosis: string | null, laterality: string | null): string {
  if (!diagnosis) return "Your care team has been evaluating your condition.";
  const d = diagnosis.toLowerCase();
  const sideWord = laterality === "OD" ? "right eye" : laterality === "OS" ? "left eye" : laterality === "OU" ? "both eyes" : "eye";
  if (d.includes("melanoma") && (d.includes("choroidal") || d.includes("ciliary") || d.includes("iris"))) {
    const location = d.includes("choroidal") ? "the back layer" : d.includes("ciliary body") ? "a structure behind the colored part" : "the colored part";
    return `You have a tumor in ${location} of your ${sideWord}, called uveal melanoma. This is a rare cancer, and your care team specializes in treating it.`;
  }
  if (d.includes("sarcoma")) {
    return `You have a soft tissue sarcoma — a rare type of cancer that develops in connective tissue such as muscle or fat. Your care team is coordinating a treatment plan specific to its location and characteristics.`;
  }
  return `Your diagnosis is ${diagnosis}. Ask your care team any questions about what this means for you.`;
}

// uvealcare: patient journey
// Plain-language walk through the whole diagnosis-to-surveillance path. All
// wording comes from the backend (patient_journey.py): fixed, rule-based text,
// never generated per patient and never a copy of clinician free text.
type JourneyStep = {
  key: string; number: number; title: string;
  status: "done" | "current" | "upcoming" | "not_needed";
  what_is_this: string;
  checklist: { label: string; explain: string | null; done: boolean }[];
  progress_note: string | null;
  findings: string[]; findings_held_back: boolean;
  not_needed_note: string | null; ongoing: boolean;
  next_up: string; questions: string[];
};
type PatientJourney = {
  diagnosis_plain: string; total_steps: number; current_step: number;
  current_title: string; headline: string; results_shared: boolean; preview: boolean;
  next_follow_up: string | null; steps: JourneyStep[];
  support: { title: string; plain: string; counseling_documented: boolean };
  glossary: { term: string; meaning: string }[]; disclaimer: string;
};

function JourneyPanel({ caseId, printing, onAvailable, onPrint }: {
  caseId: string; printing: boolean; onAvailable: (b: boolean) => void; onPrint: () => void;
}) {
  const [journey, setJourney] = useState<PatientJourney | null>(null);
  const [preview, setPreview] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`${API_BASE}/cases/${caseId}/patient-journey${preview ? "?preview=true" : ""}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const j: PatientJourney | null = data && data.journey ? data.journey : null;
        setJourney(j);
        onAvailable(!!j);
      })
      .catch((err) => {
        console.error("Couldn't reach backend:", err);
        if (!cancelled) onAvailable(false);
      });
    return () => { cancelled = true; };
  }, [caseId, preview, reloadKey]);

  if (!journey) return null;

  const shared = journey.results_shared;
  const showingPreview = journey.preview;

  const toggleShare = async () => {
    if (!shared && !window.confirm("Share the detailed, plain-language results with this patient?\n\nMake sure you have already talked through the results with them.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE}/cases/${caseId}/patient-journey/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ released: !shared }),
      });
      if (!res.ok) throw new Error("save failed");
      setPreview(false);
      setReloadKey((k) => k + 1);
    } catch {
      setError("Couldn't save that change. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const dot = (s: JourneyStep) =>
    s.status === "done" ? "bg-emerald-500 border-emerald-500 text-white" :
    s.status === "current" ? "bg-[#0F2D56] border-[#0F2D56] text-white" :
    s.status === "not_needed" ? "bg-[#EEF2F6] border-[#C4CCD6] text-[#5B6877]" :
    "bg-white border-[#D5DBE3] text-[#6B7785]";

  const badge = (s: JourneyStep) =>
    s.status === "done" ? { t: "Done", c: "text-emerald-700 bg-emerald-50 border-emerald-200" } :
    s.status === "current" ? { t: s.ongoing ? "Ongoing" : "You are here", c: "text-white bg-[#0F2D56] border-[#0F2D56]" } :
    s.status === "not_needed" ? { t: "Not needed", c: "text-[#3D4B5C] bg-[#EEF2F6] border-[#C4CCD6]" } :
    { t: "Coming up", c: "text-[#5B6877] bg-white border-[#D5DBE3]" };

  const pct = Math.round(((journey.current_step - 1) / journey.total_steps) * 100);

  return (
    <div className="care-summary-print-hide journey-print">
      {/* Care-team controls (never printed) */}
      <div className={`mb-6 p-4 rounded-lg border text-sm print:hidden ${shared ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        <p className="font-semibold text-[#1B2733] mb-1">Care team controls</p>
        <p className="text-[#3D4B5C] mb-3">
          {shared
            ? "Detailed results are shared with the patient on this page."
            : "Until you share them, the patient sees what each step is and whether it is done, but not the detailed explanations of their results (tumor size, scan findings, spread check, genetic test, treatment plan)."}
        </p>
        <div className="flex flex-wrap gap-2">
          {!shared && (
            <button onClick={() => setPreview((p) => !p)}
              className="border border-[#C4CCD6] bg-white text-[#3D4B5C] px-3 py-1.5 rounded text-xs hover:bg-[#EEF2F6]">
              {preview ? "Hide preview" : "Preview what the patient will see"}
            </button>
          )}
          <button onClick={toggleShare} disabled={busy}
            className={`px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-60 ${shared ? "border border-[#C4CCD6] bg-white text-[#3D4B5C] hover:bg-[#EEF2F6]" : "bg-[#0F2D56] text-white hover:bg-[#0B2342]"}`}>
            {busy ? "Saving…" : shared ? "Stop sharing" : "Share detailed results with patient"}
          </button>
        </div>
        {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
      </div>

      {showingPreview && (
        <p className="mb-4 text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300 rounded px-3 py-2 print:hidden">
          PREVIEW: the patient does not see the detailed results below yet.
        </p>
      )}

      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-[#1B2733]">Your journey, step by step</h2>
          <p className="text-sm text-[#3D4B5C] mt-1 leading-relaxed">{journey.diagnosis_plain}</p>
        </div>
        <button onClick={onPrint}
          className="shrink-0 border border-[#C4CCD6] text-[#3D4B5C] px-3 py-2 rounded text-sm hover:bg-[#EEF2F6] transition-colors print:hidden">
          Print my journey
        </button>
      </div>

      {/* Where you are */}
      <div className="mb-8 p-5 bg-sky-50 border border-sky-200 rounded-lg">
        <p className="text-sm font-semibold text-[#1B2733]">{journey.headline}</p>
        <div className="mt-3 h-2 rounded-full bg-white border border-sky-200 overflow-hidden print:hidden" aria-hidden="true">
          <div className="h-full bg-[#0B63B6]" style={{ width: `${pct}%` }} />
        </div>
        {journey.next_follow_up && (
          <p className="text-sm text-[#3D4B5C] mt-3">Your next follow-up visit: <strong>{journey.next_follow_up}</strong></p>
        )}
      </div>

      <div>
        {journey.steps.map((s, i) => {
          const isOpen = printing || (open[s.key] ?? s.status === "current");
          const b = badge(s);
          return (
            <div key={s.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${dot(s)}`}>
                  {s.status === "done" ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2.5 7l3 3L11.5 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{s.number}</span>
                  )}
                </div>
                {i < journey.steps.length - 1 && (
                  <div className={`w-0.5 flex-1 my-1 ${s.status === "done" ? "bg-emerald-300" : "bg-[#E4E8ED]"}`} style={{ minHeight: "24px" }} />
                )}
              </div>

              <div className="flex-1 pb-6 min-w-0">
                <div className={`rounded-lg border ${s.status === "current" ? "border-[#0F2D56] shadow-sm" : s.status === "done" ? "border-emerald-200" : "border-[#D5DBE3]"} bg-white`}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpen((o) => ({ ...o, [s.key]: !isOpen }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpen((o) => ({ ...o, [s.key]: !isOpen }));
                      }
                    }}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 text-left p-4 cursor-pointer"
                  >
                    <span className={`font-semibold ${s.status === "upcoming" ? "text-[#5B6877]" : "text-[#1B2733]"}`}>{s.title}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${b.c}`}>{b.t}</span>
                      <span className="text-[#5B6877] text-xs print:hidden">{isOpen ? "Hide" : "Show"}</span>
                    </span>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-4 text-sm text-[#3D4B5C] leading-relaxed">
                      <div>
                        <p className="text-[11px] font-semibold text-[#5B6877] mb-1">What this step is</p>
                        <p>{s.what_is_this}</p>
                      </div>

                      {s.checklist.length > 0 && (
                        <ul className="space-y-1.5">
                          {s.checklist.map((c) => (
                            <li key={c.label} className="flex items-start gap-2">
                              <span className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${c.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#C4CCD6] text-transparent"}`}>✓</span>
                              <span>
                                <span className={c.done ? "text-[#1B2733]" : ""}>{c.label}{c.done ? "" : " (not yet recorded)"}</span>
                                {c.explain && <span className="block text-xs text-[#5B6877]">This test {c.explain}.</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {s.progress_note && <p className="text-xs text-[#5B6877]">{s.progress_note}</p>}
                      {s.not_needed_note && <p className="p-3 rounded bg-[#EEF2F6] border border-[#D5DBE3]">{s.not_needed_note}</p>}

                      {s.findings.length > 0 && (
                        <div className="p-3 rounded bg-sky-50 border border-sky-200">
                          <p className="text-[11px] font-semibold text-[#5B6877] mb-1">What your team has found</p>
                          <ul className="space-y-2">
                            {s.findings.map((f, k) => <li key={k}>{f}</li>)}
                          </ul>
                        </div>
                      )}
                      {s.findings_held_back && (
                        <p className="p-3 rounded bg-[#F6F8FA] border border-[#D5DBE3]">
                          Your doctor will go over these results with you in person. The explanation will appear here after that conversation.
                        </p>
                      )}

                      <div>
                        <p className="text-[11px] font-semibold text-[#5B6877] mb-1">What comes next</p>
                        <p>{s.next_up}</p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-[#5B6877] mb-1">Questions you might ask</p>
                        <ul className="list-disc pl-5 space-y-0.5">
                          {s.questions.map((q) => <li key={q}>{q}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 p-5 rounded-lg border border-[#D5DBE3] bg-white">
        <p className="text-sm font-semibold text-[#1B2733] mb-1">{journey.support.title}</p>
        <p className="text-sm text-[#3D4B5C] leading-relaxed">{journey.support.plain}</p>
        {journey.support.counseling_documented && (
          <p className="text-xs text-[#5B6877] mt-2">Your care team has noted a conversation with you about support.</p>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-[#D5DBE3] bg-white">
        <button onClick={() => setGlossaryOpen((g) => !g)} aria-expanded={glossaryOpen || printing}
          className="w-full flex items-center justify-between p-4 text-left print:hidden">
          <span className="text-sm font-semibold text-[#1B2733]">Words you may hear</span>
          <span className="text-xs text-[#5B6877]">{glossaryOpen ? "Hide" : "Show"}</span>
        </button>
        <p className="hidden print:block p-4 pb-0 text-sm font-semibold text-[#1B2733]">Words you may hear</p>
        {(glossaryOpen || printing) && (
          <dl className="px-4 pb-4 space-y-2 text-sm text-[#3D4B5C]">
            {journey.glossary.map((g) => (
              <div key={g.term}>
                <dt className="font-semibold text-[#1B2733]">{g.term}</dt>
                <dd>{g.meaning}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <p className="mt-4 text-xs text-[#5B6877] leading-relaxed">{journey.disclaimer}</p>
    </div>
  );
}

function PatientPathwayScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  const [caseInfo, setCaseInfo] = useState<{
    patient: string; mrn: string; care_stage: string; care_stages: string[];
    diagnosis: string | null; laterality: string | null; primary_provider: string | null;
  } | null>(null);

  const [decision, setDecision] = useState<{
    recommendation: string; surveillance_protocol: string | null;
  } | null>(null);

  const [journeyAvailable, setJourneyAvailable] = useState(false);
  const [printMode, setPrintMode] = useState<"summary" | "journey">("summary");
  const printNow = (mode: "summary" | "journey") => {
    setPrintMode(mode);
    setTimeout(() => window.print(), 150);
  };
  useEffect(() => {
    const reset = () => setPrintMode("summary");
    window.addEventListener("afterprint", reset);
    return () => window.removeEventListener("afterprint", reset);
  }, []);

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCaseInfo(data))
      .catch((err) => console.error("Couldn't reach backend:", err));

    apiFetch(`${API_BASE}/cases/${caseId}/decision`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDecision(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, [caseId]);

  const careStages = caseInfo?.care_stages ?? [];
  const currentIndex = caseInfo ? careStages.indexOf(caseInfo.care_stage) : 0;

  const firstName = caseInfo?.patient ? caseInfo.patient.split(" ")[0] : "";

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-print-mode={printMode}>
      {/* Print-only styling for the downloadable Care Summary — hides
          everything except the summary card itself when printing, same
          principle as the clinician-facing Export PDF elsewhere in the
          app, but scoped to just this section. */}
      <style>{`
        @media print {
          .care-summary-print-hide { display: none !important; }
          .care-summary-print-show { display: block !important; }
          [data-print-mode="journey"] .journey-print { display: block !important; }
          [data-print-mode="journey"] .care-summary-print-show { display: none !important; }
        }
      `}</style>

      {/* Patient-facing header */}
      <div className="px-8 py-4 shrink-0 bg-white border-b border-[#D5DBE3] care-summary-print-hide">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#0F2D56] text-white flex items-center justify-center">
              <EyeIcon size={14} />
            </div>
            <div>
              <p className="text-[#1B2733] font-semibold">UvealCare Patient Portal</p>
              <p className="text-[#5B6877] text-xs">My Care Pathway</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#5B6877] text-xs">{caseInfo?.patient ?? "…"}</span>
            <button
              onClick={() => onNav("patient")}
              className="text-[#3D4B5C] text-xs hover:bg-[#F6F8FA] transition-colors border border-[#C4CCD6] px-3 py-1.5 rounded"
            >
              Staff View
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#FFFFFF]">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <div className="mb-8 flex items-start justify-between gap-4 care-summary-print-hide">
            <div>
              <h1 className="text-2xl font-semibold text-[#1B2733]">Your Care Pathway</h1>
              <p className="text-[#5B6877] text-sm mt-1">
                {firstName ? `Hello, ${firstName}.` : "Hello."} This page shows where you are in your care and what to expect next.
              </p>
            </div>
            <button
              onClick={() => printNow("summary")}
              className="shrink-0 border border-[#C4CCD6] text-[#3D4B5C] px-3 py-2 rounded text-sm hover:bg-[#EEF2F6] transition-colors"
            >
              Download / Print Summary
            </button>
          </div>

          {/* Current step callout */}
          {caseInfo && !journeyAvailable && (
            <div className="mb-8 p-5 bg-sky-50 border border-sky-200 rounded-lg flex items-start gap-4 care-summary-print-hide">
              <div className="w-9 h-9 rounded-full bg-[#0F2D56] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">{currentIndex + 1}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1B2733]">You are currently at: {caseInfo.care_stage}</p>
                <p className="text-sm text-[#3D4B5C] mt-1">
                  {STAGE_PLAIN_LANGUAGE[caseInfo.care_stage] ?? "Your care team is coordinating your next steps."}
                </p>
              </div>
            </div>
          )}

          <JourneyPanel caseId={caseId} printing={printMode === "journey"} onAvailable={setJourneyAvailable} onPrint={() => printNow("journey")} />

          {/* Steps — real per-disease stages, plain-language descriptions */}
          <div className={`space-y-0 care-summary-print-hide ${journeyAvailable ? "hidden" : ""}`}>
            {careStages.map((stageName, i) => {
              const isDone = i < currentIndex;
              const isCurrent = i === currentIndex;
              const isUpcoming = i > currentIndex;

              return (
                <div key={stageName} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                      isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                      isCurrent ? "bg-[#0F2D56] border-[#0F2D56] text-white" :
                      "bg-[#FFFFFF] border-[#D5DBE3] text-[#6B7785]"
                    }`}>
                      {isDone ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M2.5 7l3 3L11.5 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0B63B6]" />
                      ) : (
                        <span className="text-xs font-semibold">{i + 1}</span>
                      )}
                    </div>
                    {i < careStages.length - 1 && (
                      <div className={`w-0.5 flex-1 my-1 ${isDone ? "bg-emerald-300" : "bg-[#E4E8ED]"}`} style={{ minHeight: "32px" }} />
                    )}
                  </div>

                  <div className={`flex-1 pb-8 ${i === careStages.length - 1 ? "pb-0" : ""}`}>
                    <div className={`rounded-lg border p-4 ${
                      isCurrent ? "bg-[#FFFFFF] border-[#0F2D56] shadow-sm" :
                      isDone ? "bg-emerald-50 border-emerald-200" :
                      "bg-[#FFFFFF] border-[#D5DBE3]"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${isCurrent ? "text-[#0B63B6]" : isDone ? "text-emerald-700" : "text-[#6B7785]"}`}>
                          {stageName}{isDone && <span className="ml-2 text-xs font-normal text-emerald-700">Completed</span>}
                        </h3>
                        {isCurrent && (
                          <span className="text-[11px] font-semibold text-white bg-[#0F2D56] px-2 py-0.5 rounded">
                            You are here
                          </span>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${isUpcoming ? "text-[#5B6877]" : "text-[#3D4B5C]"}`}>
                        {STAGE_PLAIN_LANGUAGE[stageName] ?? "Your care team will guide you through this step."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* My Care Summary — the downloadable, plain-language document.
              Only ever shows pre-written translations for known,
              controlled clinical options; anything else honestly says
              to ask the care team rather than guessing. */}
          <div className="mt-8 p-6 bg-[#FFFFFF] rounded-lg border border-[#D5DBE3] care-summary-print-show">
            <h2 className="text-lg font-semibold text-[#1B2733] mb-4">My Care Summary</h2>

            <div className="mb-4">
              <p className="text-[11px] font-semibold text-[#5B6877] mb-1">Your Diagnosis</p>
              <p className="text-sm text-[#3D4B5C] leading-relaxed">
                {plainLanguageDiagnosis(caseInfo?.diagnosis ?? null, caseInfo?.laterality ?? null)}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-[11px] font-semibold text-[#5B6877] mb-1">Treatment Plan</p>
              <p className="text-sm text-[#3D4B5C] leading-relaxed">
                {decision?.recommendation
                  ? (TREATMENT_PLAIN_LANGUAGE[decision.recommendation] ?? "Your care team has recommended a treatment plan — ask them to walk you through the details.")
                  : "A treatment plan hasn't been finalized yet. Your care team will discuss this with you once it's decided."}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-[#5B6877] mb-1">Follow-up / Surveillance Plan</p>
              <p className="text-sm text-[#3D4B5C] leading-relaxed">
                {decision?.surveillance_protocol
                  ? (SURVEILLANCE_PLAIN_LANGUAGE[decision.surveillance_protocol] ?? "A follow-up plan has been set — ask your care team for the details.")
                  : "A follow-up plan will be set once your treatment plan is finalized."}
              </p>
            </div>
          </div>

          <div className="mt-8 p-5 bg-[#FFFFFF] rounded-lg border border-[#D5DBE3] care-summary-print-hide">
            <p className="text-sm font-semibold text-[#1B2733] mb-1">Questions about your care?</p>
            <p className="text-sm text-[#5B6877]">
              {caseInfo?.primary_provider
                ? `Contact ${caseInfo.primary_provider}'s office, or reach out through your patient portal messaging.`
                : "Contact your care team's office, or reach out through your patient portal messaging."}
            </p>
            <p className="text-xs text-[#5B6877] mt-2">This information is provided by your care team. All clinical decisions are made by your physicians.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 9. SETTINGS
function SettingsScreen({ user, onLogout }: { user: { name: string; email: string; role: string } | null; onLogout: () => void }) {
  // Real data from a backend endpoint that's existed since day one but
  // was never actually displayed anywhere in the app until now.
  const [profiles, setProfiles] = useState<
    { key: string; display_name: string; field_count: number }[] | null
  >(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    apiFetch(`${API_BASE}/disease-profiles`)
      .then((res) => res.json())
      .then((data) => setProfiles(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, []);

  const roleLabel = user ? user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Settings" subtitle="Account and platform configuration" />

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#FFFFFF]">
        <div className="max-w-2xl space-y-5">
          {/* Account */}
          <Card className="p-5">
            <SectionHeader>Account</SectionHeader>
            <div className="space-y-3 mb-4">
              {[
                { label: "Name", value: user?.name ?? "—" },
                { label: "Email", value: user?.email ?? "—" },
                { label: "Role", value: roleLabel || "—" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-start gap-4">
                  <span className="text-[#5B6877] text-xs shrink-0">{r.label}</span>
                  <span className="text-[#1B2733] text-xs text-right">{r.value}</span>
                </div>
              ))}
            </div>

            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="text-xs font-medium text-red-700 border border-red-200 bg-red-50 px-3 py-2 rounded hover:bg-red-50 transition-colors"
              >
                Log Out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#3D4B5C]">Are you sure?</span>
                <button
                  onClick={onLogout}
                  className="text-xs font-medium text-white bg-red-500 px-3 py-1.5 rounded hover:bg-red-600 transition-colors"
                >
                  Yes, log out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="text-xs font-medium text-[#3D4B5C] px-3 py-1.5 rounded hover:bg-[#EEF2F6] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </Card>

          {/* Disease profiles — real backend data, proving the platform's
              generalizability thesis: it isn't hardcoded to just one disease. */}
          <Card className="p-5">
            <SectionHeader>Configured Disease Profiles</SectionHeader>
            {!profiles ? (
              <p className="text-xs text-[#5B6877]">Loading…</p>
            ) : profiles.length === 0 ? (
              <p className="text-xs text-[#5B6877] italic">No disease profiles configured yet.</p>
            ) : (
              <div className="space-y-2">
                {profiles.map((p) => (
                  <div key={p.key} className="flex items-center justify-between py-2 border-b border-[#E4E8ED] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1B2733]">{p.display_name}</p>
                      <p className="text-[11px] text-[#5B6877] font-mono">{p.key}</p>
                    </div>
                    <span className="text-xs text-[#5B6877]">{p.field_count} tracked fields</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-[#5B6877] mt-3 italic">
              Adding a new disease means defining its fields here — not rewriting the app.
            </p>
          </Card>

          {/* Platform info */}
          <Card className="p-5">
            <SectionHeader>Platform</SectionHeader>
            <div className="space-y-2">
              {[
                { label: "Backend", value: API_BASE },
                { label: "Environment", value: "Local development" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center">
                  <span className="text-[#5B6877] text-xs">{r.label}</span>
                  <span className="font-mono text-xs text-[#1B2733]">{r.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string; role: string } | null>(null);

  // Which case is "selected" when a screen is reached without a specific
  // patient already chosen (e.g. clicking a sidebar tab like "Cases"
  // before ever opening a patient from the Dashboard). This used to
  // fall back to a hardcoded case ID left over from local testing —
  // which silently broke the moment the hosted database was reseeded
  // and that exact ID no longer existed, causing every such screen to
  // 404 and crash. Now it starts empty and gets filled in with a real,
  // currently-existing case the moment the app loads real data below.
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");

  // Which of the two workflows (Uveal Melanoma / Soft Tissue Sarcoma) is
  // currently active — chosen on the screen shown right after login.
  // This is what actually splits the app into two separate sections
  // sharing one account, rather than one combined patient list mixing
  // both diseases together.
  const [selectedDiseaseProfileKey, setSelectedDiseaseProfileKey] = useState<string>("");

  // The moment a disease is chosen (or re-chosen), fetch a real fallback
  // case belonging to THAT disease specifically — this is what replaces
  // the old hardcoded ID with something that's guaranteed to actually
  // exist, scoped correctly to whichever workflow is active.
  useEffect(() => {
    if (!loggedInUser || !selectedDiseaseProfileKey) return;
    apiFetch(`${API_BASE}/cases`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const match = data.find((c) => c.disease_profile_key === selectedDiseaseProfileKey);
          if (match) setSelectedCaseId(match.case_id);
        }
      })
      .catch((err) => console.error("Couldn't load a fallback case:", err));
  }, [loggedInUser, selectedDiseaseProfileKey]);

  // Real browser back/forward support. Before this, every screen change
  // was just React state — the browser had no idea any of these screens
  // existed, so pressing Back immediately left the site entirely (e.g.
  // back to a search engine), even after navigating several screens deep.
  //
  // Now, every in-app navigation writes a genuine browser history entry.
  // Pressing Back steps through the screens actually visited, one at a
  // time — Case Readiness → Patient → Dashboard — and only leaves the
  // site once you've gone back past the app's own starting point. That's
  // the same behavior any normal website has; this app just never wrote
  // to history before, so the browser had nothing to step through.
  const SCREENS_NEEDING_CASE_ID: Screen[] = ["patient", "case-readiness", "imaging", "case-packet", "tumor-board", "tumor-board-decision", "patient-pathway"];
  const ALL_SCREENS: Screen[] = ["disease-select", "dashboard", "patient", "case-readiness", "imaging", "case-packet", "tumor-board", "tumor-board-decision", "patient-pathway", "settings"];

  const encodeHash = (s: Screen, caseId: string) =>
    SCREENS_NEEDING_CASE_ID.includes(s) ? `#${s}/${caseId}` : `#${s}`;

  // True for a brief moment right after the browser's own Back/Forward
  // fires — this stops that reaction from itself writing ANOTHER history
  // entry, which would otherwise make Back feel broken (stuck, or
  // skipping screens) instead of stepping through cleanly one at a time.
  const isPoppingRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const [rawScreen, caseId] = hash.split("/");
      if (ALL_SCREENS.includes(rawScreen as Screen)) {
        isPoppingRef.current = true;
        if (caseId) setSelectedCaseId(caseId);
        setScreen(rawScreen as Screen);
        setTimeout(() => { isPoppingRef.current = false; }, 0);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNav = (s: Screen, caseId?: string) => {
    const resolvedCaseId = caseId ?? selectedCaseId;
    if (caseId) setSelectedCaseId(caseId);
    setScreen(s);

    if (!isPoppingRef.current) {
      window.history.pushState(null, "", encodeHash(s, resolvedCaseId));
    }
  };

  // A real logout: clears the signed-in user, clears the auth token so
  // no further requests can be made with it, and sends them back to the
  // login screen. The backend can't force-invalidate a token before its
  // expiry yet (that would need a server-side revocation list), but the
  // frontend genuinely forgets it, and it expires on its own after 12 hours.
  const handleLogout = () => {
    authToken = null;
    setLoggedInUser(null);
    setSelectedDiseaseProfileKey("");
    setSelectedCaseId("");
    setScreen("login");
    window.history.pushState(null, "", "#login");
  };

  if (screen === "login") {
    return (
      <LoginScreen
        onLogin={(user) => {
          setLoggedInUser(user);
          setScreen("disease-select");
          // disease-select needs its own real history entry too —
          // otherwise it's the one screen Back would always skip
          // straight past, since it was never reached through handleNav.
          window.history.pushState(null, "", "#disease-select");
        }}
      />
    );
  }

  if (screen === "disease-select") {
    return (
      <DiseaseSelectScreen
        onSelect={(diseaseKey) => {
          setSelectedDiseaseProfileKey(diseaseKey);
          setSelectedCaseId(""); // force a fresh fallback case for the newly chosen disease
          setScreen("dashboard");
          window.history.pushState(null, "", "#dashboard");
        }}
      />
    );
  }

  if (!selectedDiseaseProfileKey) {
    return (
      <DiseaseSelectScreen
        onSelect={(diseaseKey) => {
          setSelectedDiseaseProfileKey(diseaseKey);
          setSelectedCaseId("");
          setScreen("dashboard");
          window.history.pushState(null, "", "#dashboard");
        }}
      />
    );
  }

  const isPatientFacing = screen === "patient-pathway";

  return (
    <div className="flex h-full bg-[#FFFFFF]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Print-specific styling — this is what makes "Export PDF" produce a
          clean, single-column document instead of a raw screenshot of the
          whole app (sidebar, nav, and all). Only applies when printing. */}
      <style>{`
        @media print {
          @page { margin: 0.5in; }
          aside { display: none !important; }
          button { display: none !important; }
          .flex-1.overflow-y-auto { overflow: visible !important; height: auto !important; }
          .grid-cols-\\[1fr_260px\\] { display: block !important; }
          /* The on-screen theme is dark, but a printed/exported case
             summary should stay professional and ink-friendly — force
             every surface back to light regardless of the live theme. */
          body, * {
            background: white !important;
            color: #0F172A !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      {!isPatientFacing && (
        <Sidebar
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
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {screen === "dashboard" && <DashboardScreen onNav={handleNav} diseaseProfileKey={selectedDiseaseProfileKey} />}
        {selectedCaseId ? (
          <>
            {screen === "patient" && <PatientScreen onNav={handleNav} caseId={selectedCaseId} />}
            {screen === "case-readiness" && <CaseReadinessScreen onNav={handleNav} caseId={selectedCaseId} />}
            {screen === "imaging" && <ImagingScreen onNav={handleNav} caseId={selectedCaseId} />}
            {screen === "case-packet" && <CasePacketScreen onNav={handleNav} caseId={selectedCaseId} />}
            {screen === "tumor-board" && <TumorBoardScreen onNav={handleNav} caseId={selectedCaseId} />}
            {screen === "tumor-board-decision" && <TumorBoardDecisionScreen onNav={handleNav} caseId={selectedCaseId} />}
          </>
        ) : (
          ["patient", "case-readiness", "imaging", "case-packet", "tumor-board", "tumor-board-decision"].includes(screen) && (
            <div className="flex-1 flex items-center justify-center bg-[#FFFFFF]">
              <p className="text-[#5B6877] text-sm">Loading a patient case…</p>
            </div>
          )
        )}
        {screen === "patient-pathway" && <PatientPathwayScreen onNav={handleNav} caseId={selectedCaseId} />}
        {screen === "settings" && <SettingsScreen user={loggedInUser} onLogout={handleLogout} />}
      </div>
    </div>
  );
}
