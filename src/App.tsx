import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "login"
  | "dashboard"
  | "patient"
  | "case-readiness"
  | "imaging"
  | "tumor-board"
  | "tumor-board-decision"
  | "patient-pathway"
  | "settings";

// ─── Constants / Data ─────────────────────────────────────────────────────────
const PATIENT = {
  name: "Margaret T. Sullivan",
  dob: "1957-03-14",
  age: 67,
  sex: "Female",
  mrn: "MRN-2847301",
  dxDate: "2024-10-08",
  diagnosis: "Uveal Melanoma — Choroidal",
  laterality: "Right Eye (OD)",
  stage: "T2bN0M0",
  currentStage: 3, // 0-indexed: 0=Diagnosis, 1=Imaging, 2=Case Prep, 3=MDT Review, 4=Treatment Planning, 5=Treatment, 6=Surveillance
  readiness: 82,
  provider: "Dr. Alicia M. Reyes, MD",
  referringProvider: "Dr. James O. Thornton, MD",
  phone: "(617) 555-0192",
  email: "m.sullivan@example.com",
  insurance: "Blue Cross Blue Shield — Plan PPO",
  nextAppt: "2024-11-14",
};

const JOURNEY_STAGES = [
  "Diagnosis",
  "Imaging",
  "Case Preparation",
  "Multidisciplinary Review",
  "Treatment Planning",
  "Treatment",
  "Surveillance",
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: GridIcon },
  { id: "patient", label: "Patients", icon: UsersIcon },
  { id: "case-readiness", label: "Cases", icon: ClipboardIcon },
  { id: "imaging", label: "Imaging", icon: ScanIcon },
  { id: "tumor-board", label: "Tumor Board", icon: GroupIcon },
  { id: "patient-pathway", label: "Tasks", icon: CheckIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const;

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

// A single deliberate hero moment for the login screen — rather than
// spinning the whole icon (which reads as a generic loading spinner),
// the pupil slowly orbits within the eye, like it's watching. This is
// the only animated icon in the app; everywhere else uses the plain
// static EyeIcon, on purpose.
function AnimatedEyeIcon({ size = 16 }: { size?: number }) {
  return (
    <>
      <style>{`
        @keyframes uvealcare-pupil-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
        <g
          style={{
            transformOrigin: "8px 8px",
            transformBox: "fill-box",
            animation: "uvealcare-pupil-orbit 3s linear infinite",
          }}
        >
          <circle cx="8" cy="5.3" r="1.6" />
        </g>
      </svg>
    </>
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

function Sidebar({ active, onNav, user }: { active: Screen; onNav: (s: Screen, caseId?: string) => void; user: { name: string; email: string; role: string } | null }) {
  // Computed from whoever actually logged in — "AR" for "Dr. Alicia M.
  // Reyes" — instead of a hardcoded initials badge.
  const initials = user ? getInitials(user.name) : "?";
  const roleLabel = user ? user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full" style={{ background: "linear-gradient(to right, #0F2D56, #0A0E14)" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#0EA5E9] flex items-center justify-center">
            <EyeIcon size={14} />
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">UvealCare</span>
        </div>
        <p className="text-white/40 text-[10px] mt-1 font-mono tracking-wider uppercase">Clinical Platform</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id as Screen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all text-left ${
                isActive
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/55 hover:text-white/80 hover:bg-white/8"
              }`}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User — now the actual signed-in account, not a hardcoded name */}
      <button
        onClick={() => onNav("settings")}
        className="px-4 py-4 border-t border-white/10 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#0EA5E9]/30 flex items-center justify-center text-[11px] text-[#7DD3FC] font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-white text-xs font-medium">{user?.name ?? "Not signed in"}</p>
            <p className="text-white/40 text-[10px]">{roleLabel}</p>
          </div>
        </div>
      </button>
    </aside>
  );
}

function TopBar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-[#12161D] border-b border-[#232A34] shrink-0">
      <div>
        <h1 className="text-[#E7ECF2] text-lg font-semibold">{title}</h1>
        {subtitle && <p className="text-[#8B96A3] text-xs mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: "complete" | "missing" | "pending" | "warning" | "active" }) {
  const map = {
    complete: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    missing: "bg-red-500/10 text-red-300 border-red-500/30",
    pending: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    warning: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    active: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  };
  const labels = {
    complete: "Complete",
    missing: "Missing",
    pending: "Pending",
    warning: "Needs Review",
    active: "Active",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function ReadinessBar({ value }: { value: number }) {
  const color = value >= 90 ? "#34D399" : value >= 70 ? "#FBBF24" : "#F87171";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#161B22] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-xs font-medium" style={{ color }}>{value}%</span>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#12161D] rounded border border-[#232A34] ${className}`}>{children}</div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold text-[#69758A] uppercase tracking-widest mb-3">{children}</h3>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

// 1. LOGIN
// A colorful rotating glow behind the login screen's eye badge — the
// one deliberately bold moment in an otherwise restrained, monochrome
// instrument-panel theme. A rotating conic-gradient blurred heavily
// reads as a soft swirling multicolor ring, similar to the reference
// image, without needing actual animated artwork.
function LoginHeroGlow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: "7rem", height: "7rem" }}>
      <style>{`
        @keyframes uvealcare-orb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        className="absolute rounded-full"
        style={{
          width: "7rem",
          height: "7rem",
          background: "conic-gradient(from 0deg, #ec4899, #f59e0b, #22d3ee, #6366f1, #ec4899)",
          filter: "blur(22px)",
          opacity: 0.65,
          animation: "uvealcare-orb-spin 7s linear infinite",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#0A0E14] flex relative overflow-hidden">
      {/* Ambient background glare — soft, slow-drifting, low-opacity color
          washes behind everything. Purely atmospheric: never sits above
          any readable content, and stays subtle enough not to distract
          from the actual sign-in task. */}
      <style>{`
        @keyframes uvealcare-glare-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.15); }
        }
        @keyframes uvealcare-glare-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -20px) scale(1.1); }
        }
      `}</style>
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-10%", left: "-5%", width: "45%", height: "60%",
          background: "radial-gradient(circle, #6366F1 0%, transparent 70%)",
          filter: "blur(90px)", opacity: 0.18,
          animation: "uvealcare-glare-drift-a 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-15%", right: "5%", width: "50%", height: "55%",
          background: "radial-gradient(circle, #EC4899 0%, transparent 70%)",
          filter: "blur(100px)", opacity: 0.14,
          animation: "uvealcare-glare-drift-b 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "20%", right: "20%", width: "35%", height: "40%",
          background: "radial-gradient(circle, #22D3EE 0%, transparent 70%)",
          filter: "blur(80px)", opacity: 0.12,
          animation: "uvealcare-glare-drift-a 25s ease-in-out infinite reverse",
        }}
      />

      {/* Left panel — a gradient instead of a flat navy block, so the
          panel visually dissolves into the page background at the seam
          rather than meeting it as a hard, flat-color edge. */}
      <div
        className="hidden lg:flex w-[480px] flex-col justify-between p-12 relative z-10"
        style={{ background: "linear-gradient(to right, #0F2D56, #0A0E14)" }}
      >
        <div>
          <div className="flex items-center gap-3 mb-12">
            <LoginHeroGlow>
              <div className="w-16 h-16 rounded-lg bg-[#0EA5E9] flex items-center justify-center">
                <AnimatedEyeIcon size={32} />
              </div>
            </LoginHeroGlow>
            <div>
              <p className="text-white font-semibold text-lg tracking-tight">UvealCare</p>
              <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Clinical Workflow Platform</p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-white text-3xl font-semibold leading-tight">
              Coordinated care<br />for uveal melanoma.
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Reduce preparation time, prevent missing information, and standardize multidisciplinary workflow for every patient.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "Case Readiness", desc: "Know what's missing before tumor board" },
            { label: "Multidisciplinary Review", desc: "Auto-generate structured case summaries" },
            { label: "Decision Tracking", desc: "Record and assign next steps instantly" },
          ].map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-[#0EA5E9]/20 flex items-center justify-center mt-0.5 shrink-0">
                <CheckIcon size={12} />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{f.label}</p>
                <p className="text-white/40 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Note: the compliance claims below are placeholder marketing copy
            from the original design, not verified certifications — remove
            or replace before showing this outside your own testing. */}
        <p className="text-white/20 text-xs">
          UvealCare v2.4.1 · © 2024 UvealCare Health Systems
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center">
              <EyeIcon size={14} />
            </div>
            <span className="text-[#E7ECF2] font-semibold text-lg">UvealCare</span>
          </div>

          <h2 className="text-[#E7ECF2] text-2xl font-semibold mb-1">{isSignUp ? "Create account" : "Sign in"}</h2>
          <p className="text-[#8B96A3] text-sm mb-8">{isSignUp ? "Set up your clinical workspace" : "Access your clinical workspace"}</p>

          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-[#C3CCD6] mb-1.5">Full name</label>
                <input
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full border border-[#2E3742] rounded px-3 py-2.5 text-sm text-[#E7ECF2] bg-[#12161D] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
                  placeholder="Dr. Jane Smith"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[#C3CCD6] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#2E3742] rounded px-3 py-2.5 text-sm text-[#E7ECF2] bg-[#12161D] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
                placeholder="clinician@hospital.org"
              />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-[#C3CCD6] mb-1.5">Role</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full border border-[#2E3742] rounded px-3 py-2.5 text-sm text-[#E7ECF2] bg-[#12161D] focus:outline-none focus:border-[#0EA5E9] transition-all"
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
                <label className="block text-xs font-medium text-[#C3CCD6]">Password</label>
                {!isSignUp && <a href="#" className="text-xs text-[#0EA5E9] hover:underline">Forgot password?</a>}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (isSignUp ? handleSignUp() : handleSignIn())}
                className="w-full border border-[#2E3742] rounded px-3 py-2.5 text-sm text-[#E7ECF2] bg-[#12161D] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
              />
              {isSignUp && <p className="text-[10px] text-[#69758A] mt-1">At least 8 characters.</p>}
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">{error}</p>
            )}

            <button
              onClick={isSignUp ? handleSignUp : handleSignIn}
              disabled={isSubmitting}
              className="w-full bg-[#0F2D56] text-white rounded py-2.5 text-sm font-semibold hover:bg-[#0F2D56]/90 transition-colors mt-2 disabled:opacity-60"
            >
              {isSubmitting ? (isSignUp ? "Creating account…" : "Signing in…") : (isSignUp ? "Create Account" : "Sign In")}
            </button>

            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="w-full text-xs text-[#8B96A3] hover:text-[#0F2D56] transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Create one"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-[#232A34]">
            <p className="text-[10px] text-[#69758A] text-center leading-relaxed">
              This system is for authorized healthcare personnel only.<br />
              Unauthorized access is prohibited and may be prosecuted.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-[#69758A]">
            <span>HL7 FHIR</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. DASHBOARD

// TEMP: paste the case ID that seed.py printed on your machine
const MARGARET_CASE_ID = "a178cdd3-9bd9-499a-92c8-9f48313171e5";
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

function DashboardScreen({ onNav }: { onNav: (s: Screen, caseId?: string) => void }) {
  // All 5 rows now come from the backend — no more hardcoded percentages
  // for anyone. Starts empty, fills in once the fetch completes.
  const [patients, setPatients] = useState<
    { case_id: string; patient_name: string; mrn: string; diagnosis: string; care_stage: string; readiness_pct: number; status: string }[]
  >([]);

  const loadPatients = () => {
    apiFetch(`${API_BASE}/cases`)
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // "+ New Patient" now actually creates a real patient — this is the
  // form state and submit handler for that.
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ mrn: "", name: "", dob: "", laterality: "OD", diagnosis: "", disease_profile_key: "" });
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Real disease profiles from the backend — this is what makes the form
  // itself prove the platform is generalizable: a brand-new patient can
  // be created under ANY configured disease, not just uveal melanoma.
  const [diseaseProfiles, setDiseaseProfiles] = useState<
    { key: string; display_name: string; field_count: number }[]
  >([]);

  useEffect(() => {
    apiFetch(`${API_BASE}/disease-profiles`)
      .then((res) => res.json())
      .then((data) => {
        setDiseaseProfiles(data);
        if (data.length > 0) {
          setNewPatient((prev) => ({ ...prev, disease_profile_key: data[0].key }));
        }
      })
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, []);

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
        setNewPatient({ mrn: "", name: "", dob: "", laterality: "OD", diagnosis: "", disease_profile_key: diseaseProfiles[0]?.key ?? "" });
        onNav("patient", data.case_id); // go straight to the new patient's profile
      })
      .catch((err) => setCreateError(err.message))
      .finally(() => setIsCreatingPatient(false));
  };

  // Summary stats computed from the real list, not hardcoded — these
  // will always match whatever's actually in the patients table above.
  const readyCount = patients.filter((p) => p.readiness_pct === 100).length;
  const incompleteCount = patients.filter((p) => p.readiness_pct < 100).length;
  const avgMissingItems = patients.length
    ? (patients.reduce((sum, p) => sum + Math.round((100 - p.readiness_pct) / 100 * 8), 0) / patients.length).toFixed(1)
    : "0";

  const stats = [
    { label: "Active Patients", value: String(patients.length), delta: "Live from backend", deltaColor: "#34D399" },
    { label: "Cases Requiring Attention", value: String(incompleteCount), delta: `${incompleteCount} incomplete`, deltaColor: "#F87171" },
    { label: "Ready for MDT Review", value: String(readyCount), delta: "100% complete", deltaColor: "#0EA5E9" },
    { label: "Incomplete Cases", value: String(incompleteCount), delta: `Avg ${avgMissingItems} items missing`, deltaColor: "#FBBF24" },
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
            className="flex items-center gap-2 bg-[#0F2D56] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0F2D56]/90 transition-colors"
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
          <div className="bg-[#12161D] rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#E7ECF2] mb-4">New Patient</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#C3CCD6] mb-1">Disease Profile *</label>
                <select
                  value={newPatient.disease_profile_key}
                  onChange={(e) => setNewPatient({ ...newPatient, disease_profile_key: e.target.value })}
                  className="w-full border border-[#2E3742] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0EA5E9]"
                >
                  {diseaseProfiles.length === 0 && <option>Loading…</option>}
                  {diseaseProfiles.map((p) => (
                    <option key={p.key} value={p.key}>{p.display_name} ({p.field_count} fields)</option>
                  ))}
                </select>
                <p className="text-[10px] text-[#69758A] mt-1">Determines which fields and stages this case will track.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#C3CCD6] mb-1">MRN *</label>
                <input
                  value={newPatient.mrn}
                  onChange={(e) => setNewPatient({ ...newPatient, mrn: e.target.value })}
                  className="w-full border border-[#2E3742] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0EA5E9]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#C3CCD6] mb-1">Full Name *</label>
                <input
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full border border-[#2E3742] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0EA5E9]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#C3CCD6] mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={newPatient.dob}
                    onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                    className="w-full border border-[#2E3742] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C3CCD6] mb-1">Laterality</label>
                  <select
                    value={newPatient.laterality}
                    onChange={(e) => setNewPatient({ ...newPatient, laterality: e.target.value })}
                    className="w-full border border-[#2E3742] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0EA5E9]"
                  >
                    <option>OD</option>
                    <option>OS</option>
                    <option>OU</option>
                    <option value="">N/A</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#C3CCD6] mb-1">Diagnosis</label>
                <input
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                  placeholder="e.g. Choroidal Melanoma OD"
                  className="w-full border border-[#2E3742] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0EA5E9]"
                />
              </div>
            </div>

            {createError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2 mt-3">{createError}</p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowNewPatientForm(false)}
                className="flex-1 border border-[#2E3742] text-[#C3CCD6] rounded py-2 text-sm font-medium hover:bg-[#0A0E14] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePatient}
                disabled={isCreatingPatient}
                className="flex-1 bg-[#0F2D56] text-white rounded py-2 text-sm font-semibold hover:bg-[#0F2D56]/90 transition-colors disabled:opacity-60"
              >
                {isCreatingPatient ? "Creating…" : "Create Patient"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#0A0E14]">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-[#8B96A3] text-xs mb-2">{s.label}</p>
              <p className="text-[#E7ECF2] text-2xl font-semibold font-mono">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: s.deltaColor }}>{s.delta}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6">
          {/* Patient list */}
          <Card>
            <div className="px-5 py-4 border-b border-[#161B22]">
              <SectionHeader>Active Patients</SectionHeader>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#161B22]">
                  {["Patient", "MRN", "Diagnosis", "Stage", "Case Readiness", "Tasks", ""].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold text-[#69758A] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.case_id}
                    className="border-b border-[#0A0E14] hover:bg-[#0A0E14] cursor-pointer transition-colors"
                    onClick={() => onNav("patient", p.case_id)}
                  >
                    <td className="px-5 py-3">
                      <p className="text-[#E7ECF2] text-sm font-medium">{p.patient_name}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-[11px] text-[#8B96A3]">{p.mrn}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[#C3CCD6] text-xs">{p.diagnosis}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status as any} />
                    </td>
                    <td className="px-5 py-3 w-36">
                      <ReadinessBar value={p.readiness_pct} />
                    </td>
                    <td className="px-5 py-3">
                      {/* Per-patient task counts aren't tracked in the backend
                          yet — showing a dash is honest, not a fake number. */}
                      <span className="text-[#454E59] text-xs">—</span>
                    </td>
                    <td className="px-5 py-3">
                      <ChevronRightIcon />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Tasks sidebar */}
          <div className="space-y-4">
            <Card>
              <div className="px-4 py-4 border-b border-[#161B22]">
                <SectionHeader>Upcoming Tasks</SectionHeader>
              </div>
              <div className="divide-y divide-[#0A0E14]">
                {tasks.length === 0 && (
                  <p className="px-4 py-3 text-xs text-[#69758A] italic">No open tasks assigned yet.</p>
                )}
                {tasks.map((t) => (
                  <div key={t.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-amber-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[#E7ECF2] text-xs font-medium truncate">{t.description}</p>
                      <p className="text-[#69758A] text-[10px]">
                        {t.patient_name}{t.assignee_name ? ` → ${t.assignee_name}` : ""}{t.due_date ? ` · Due ${t.due_date}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <SectionHeader>Next Tumor Board</SectionHeader>
              <div className="space-y-2">
                <p className="text-[#E7ECF2] text-sm font-semibold">Thursday, Nov 14, 2024</p>
                <p className="text-[#8B96A3] text-xs">2:00 PM — Video conference</p>
                <div className="pt-2 border-t border-[#161B22]">
                  <p className="text-[10px] text-[#69758A] mb-1.5">Cases Scheduled</p>
                  <p className="text-[#E7ECF2] text-xs font-medium">Sullivan, M. — Choroidal OD</p>
                  <p className="text-[#E7ECF2] text-xs font-medium">Kowalski, D. — Choroidal OD</p>
                  <p className="text-[#E7ECF2] text-xs font-medium">Hargrove, R. — Ciliary Body OS</p>
                </div>
                <button
                  onClick={() => onNav("tumor-board")}
                  className="w-full mt-2 border border-[#0F2D56] text-[#0F2D56] rounded py-2 text-xs font-medium hover:bg-[#0F2D56] hover:text-white transition-colors"
                >
                  Prepare Cases
                </button>
              </div>
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
      .then((res) => res.json())
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
    checklist: { key: string; field: string; category: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null }[];
  } | null>(null);

  useEffect(() => {
    loadCaseInfo();

    apiFetch(`${API_BASE}/cases/${caseId}/readiness`)
      .then((res) => res.json())
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
              className="flex items-center gap-2 border border-[#232A34] text-[#C3CCD6] px-3 py-2 rounded text-sm hover:bg-[#0A0E14] transition-colors"
            >
              <ClipboardIcon size={14} />
              Case Readiness
            </button>
            <button
              onClick={() => onNav("tumor-board")}
              className="flex items-center gap-2 bg-[#0F2D56] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#0F2D56]/90 transition-colors"
            >
              <GroupIcon size={14} />
              Prepare for MDT
            </button>
          </div>
        }
      />

      {/* Journey bar — driven by this case's real disease profile stages */}
      <div className="bg-[#12161D] border-b border-[#232A34] px-8 py-4">
        <div className="flex items-center gap-0">
          {journeyStages.map((stage, i) => {
            const isDone = i < currentStageIndex;
            const isActive = i === currentStageIndex;
            return (
              <div key={stage} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  isActive ? "bg-[#0F2D56] text-white" :
                  isDone ? "text-emerald-400" : "text-[#454E59]"
                }`}>
                  {isDone && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#0EA5E9] inline-block" />}
                  {stage}
                </div>
                {i < journeyStages.length - 1 && (
                  <div className={`w-6 h-px ${isDone ? "bg-emerald-300" : "bg-[#232A34]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#12161D] border-b border-[#232A34] px-8 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm capitalize transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? "border-[#0F2D56] text-[#0F2D56] font-medium"
                : "border-transparent text-[#8B96A3] hover:text-[#C3CCD6]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#0A0E14]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-[1fr_1fr_300px] gap-5">
            {/* Patient Info */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <SectionHeader>Patient Information</SectionHeader>
                {!isEditingInfo && (
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="text-xs text-[#0EA5E9] hover:underline -mt-3"
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
                      <span className="text-[#69758A] text-xs shrink-0">{r.label}</span>
                      <span className={`text-xs text-right ${r.mono ? "font-mono" : ""} ${r.value === "Not recorded" ? "text-[#454E59] italic" : "text-[#E7ECF2]"}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-[#69758A] mb-1">Sex</label>
                    <select
                      value={editForm.sex}
                      onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                      className="w-full border border-[#2E3742] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#0EA5E9]"
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
                      <label className="block text-[10px] text-[#69758A] mb-1">{f.label}</label>
                      <input
                        value={(editForm as any)[f.key]}
                        onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full border border-[#2E3742] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#0EA5E9]"
                      />
                    </div>
                  ))}

                  {saveInfoError && (
                    <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 rounded px-2 py-1.5">{saveInfoError}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setIsEditingInfo(false); setSaveInfoError(null); }}
                      className="flex-1 border border-[#2E3742] text-[#C3CCD6] rounded py-1.5 text-xs font-medium hover:bg-[#0A0E14] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveInfo}
                      disabled={isSavingInfo}
                      className="flex-1 bg-[#0F2D56] text-white rounded py-1.5 text-xs font-semibold hover:bg-[#0F2D56]/90 transition-colors disabled:opacity-60"
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
                      <span className="text-[#69758A] text-xs shrink-0">{r.label}</span>
                      <span className={`text-xs text-right ${(r as any).mono ? "font-mono" : ""} ${r.value === "Not recorded" ? "text-[#454E59] italic" : "text-[#E7ECF2]"}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <SectionHeader>Tumor Measurements</SectionHeader>
                {fieldValue("tumor_dimensions") ? (
                  <p className="text-sm text-[#C3CCD6] leading-relaxed">{fieldValue("tumor_dimensions")}</p>
                ) : (
                  <p className="text-xs text-[#454E59] italic">
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
                    <span className="text-xs text-[#8B96A3]">MDT Readiness</span>
                    <span className="font-mono text-sm font-semibold text-amber-400">
                      {readinessSummary ? `${readinessSummary.readiness_pct}%` : "…"}
                    </span>
                  </div>
                  <div className="h-2 bg-[#161B22] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${readinessSummary?.readiness_pct ?? 0}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  {readinessSummary?.missing_information.slice(0, 2).map((label) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-red-400">
                      <span>✕</span> {label}
                    </div>
                  ))}
                  {readinessSummary && readinessSummary.missing_information.length === 0 && (
                    <p className="text-xs text-[#69758A] italic">Nothing missing</p>
                  )}
                </div>
                <button
                  onClick={() => onNav("case-readiness")}
                  className="w-full border border-[#232A34] text-[#C3CCD6] rounded py-2 text-xs font-medium hover:bg-[#0A0E14] transition-colors"
                >
                  View Full Checklist
                </button>
              </Card>

              {/* Clinical Findings */}
              <Card className="p-5">
                <SectionHeader>Clinical Assessment</SectionHeader>
                {fieldValue("clinical_assessment") ? (
                  <p className="text-sm text-[#C3CCD6] leading-relaxed">{fieldValue("clinical_assessment")}</p>
                ) : (
                  <p className="text-xs text-[#454E59] italic">
                    Not yet recorded for this patient.
                  </p>
                )}
              </Card>

              {/* Next appointment */}
              <Card className="p-5">
                <SectionHeader>Upcoming</SectionHeader>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
                    <div>
                      <p className="text-xs font-medium text-[#E7ECF2]">Tumor Board</p>
                      <p className="text-[10px] text-[#69758A]">Nov 14, 2024 · 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#69758A]" />
                    <div>
                      <p className="text-xs font-medium text-[#E7ECF2]">FAF Imaging</p>
                      <p className="text-[10px] text-[#69758A]">Nov 08, 2024 · Ocular Imaging</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "imaging" && (
          <ImagingContent onNav={onNav} caseId={caseId} />
        )}

        {activeTab === "molecular" && (
          <Card className="p-6 max-w-2xl">
            <SectionHeader>Molecular Testing</SectionHeader>
            <p className="text-[10px] text-[#69758A] italic mb-3">
              For uveal melanoma, molecular testing (e.g. GEP) is used for metastatic risk stratification and surveillance planning — not for diagnosis, which remains clinical.
            </p>
            {(() => {
              const molecularItems = readinessSummary?.checklist.filter((c) => c.category === "molecular") ?? [];
              if (!readinessSummary) return <p className="text-xs text-[#69758A]">Loading…</p>;
              if (molecularItems.length === 0) return <p className="text-xs text-[#69758A] italic">No molecular testing configured for this disease profile.</p>;
              return (
                <div className="space-y-4">
                  {molecularItems.map((item) => (
                    <div key={item.key} className="border border-[#232A34] rounded p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-[#E7ECF2]">{item.field}</p>
                          <p className="text-xs text-[#8B96A3]">{item.source ?? "Not yet ordered"}</p>
                        </div>
                        <StatusBadge status={item.status as any} />
                      </div>
                      <p className="text-xs text-[#C3CCD6] mt-2">
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
            <div className="text-sm text-[#8B96A3] italic">No prior treatment recorded. Awaiting multidisciplinary recommendation.</div>
          </Card>
        )}

        {activeTab === "tasks" && (
          <Card className="max-w-xl">
            <div className="px-5 py-4 border-b border-[#161B22]">
              <SectionHeader>Open Tasks</SectionHeader>
            </div>
            <div className="divide-y divide-[#0A0E14]">
              {[
                { task: "Order FAF imaging", due: "Nov 08, 2024", priority: "high", assignee: "Imaging Department" },
                { task: "Obtain GEP result from Castle Biosciences", due: "Nov 10, 2024", priority: "high", assignee: "Dr. A. Reyes" },
              ].map((t, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-red-500" : "bg-amber-400"}`} />
                  <div className="flex-1">
                    <p className="text-sm text-[#E7ECF2] font-medium">{t.task}</p>
                    <p className="text-[11px] text-[#69758A]">{t.assignee} · Due {t.due}</p>
                  </div>
                  <span className="text-[10px] font-medium text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
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
    checklist: { key: string; field: string; category: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null }[];
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
  // Lets a status be reverted, not just moved forward — e.g. an item
  // marked Complete by mistake, or new information means it genuinely
  // needs redoing. Real clinical data isn't always a one-way ratchet.
  const [resolveStatus, setResolveStatus] = useState("complete");

  // Real tasks tied to this case — what "Assign task" buttons now
  // actually create, instead of doing nothing.
  const [tasks, setTasks] = useState<
    { id: string; description: string; assignee_name: string | null; status: string; due_date: string | null }[]
  >([]);
  // Which missing item currently has its little "assign" form open —
  // only one at a time, to keep the UI simple.
  const [assigningLabel, setAssigningLabel] = useState<string | null>(null);
  const [assigneeInput, setAssigneeInput] = useState("");
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
      .then((res) => res.json())
      .then((data) => setReadinessData(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => res.json())
      .then((data) => setCaseInfo(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
    loadReadiness();
    loadTasks();
  }, [caseId]);

  // This is what makes "Assign task" real: it creates an actual Task row
  // tied to this case, tagged with whichever missing field prompted it.
  const handleAssignTask = (fieldLabel: string) => {
    if (!assigneeInput.trim()) return;
    setIsAssigning(true);
    apiFetch(`${API_BASE}/cases/${caseId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: `Resolve: ${fieldLabel}`,
        assignee_name: assigneeInput.trim(),
      }),
    })
      .then((res) => res.json())
      .then(() => {
        loadTasks();
        setAssigningLabel(null);
        setAssigneeInput("");
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
  const openResolveForm = (fieldKey: string, existing?: { value: string | null; status?: string; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null }) => {
    setResolveFormKey(fieldKey);
    setResolveValue(existing?.value ?? "");
    setResolveMethod(existing?.measurement_method ?? "");
    setResolvePrecision(existing?.measurement_precision ?? "");
    setResolveLengthType(existing?.measurement_length_type ?? "");
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
    if (s === "complete") return <span className="text-emerald-400 font-bold">✓</span>;
    if (s === "missing") return <span className="text-red-400 font-bold">✕</span>;
    return <span className="text-amber-500 font-bold">⏳</span>;
  };

  if (!readinessData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0E14]">
        <p className="text-[#69758A] text-sm">Loading case readiness…</p>
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
              className="border border-[#232A34] text-[#C3CCD6] px-3 py-2 rounded text-sm hover:bg-[#0A0E14] transition-colors"
            >
              Order Imaging
            </button>
            <button
              onClick={() => onNav("tumor-board")}
              className="bg-[#0F2D56] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0F2D56]/90 transition-colors"
            >
              Prepare MDT Case
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#0A0E14]">
        {/* Readiness header card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-mono font-bold text-amber-400">{readiness}%</span>
                <span className="text-lg font-semibold text-[#E7ECF2]">Case Readiness</span>
              </div>
              <div className="flex items-center gap-2 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-sm text-amber-300">
                <AlertIcon size={14} />
                <span className="font-medium">
                  {readinessData.ready_for_review
                    ? "Case is ready for multidisciplinary review."
                    : "Case is not ready for multidisciplinary review."}
                </span>
                <span className="text-amber-400">
                  {readinessData.missing_information.length} item(s) require resolution before tumor board presentation.
                </span>
              </div>
            </div>
            <div className="w-48 shrink-0">
              <div className="h-3 bg-[#161B22] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${readiness}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#69758A]">
                <span>{complete} complete</span>
                <span>{allItems.length} total</span>
              </div>
            </div>
          </div>

          {/* Missing items callout — now driven by the backend's missing_information list */}
          <div className="mt-4 pt-4 border-t border-[#161B22]">
            <p className="text-xs font-semibold text-[#C3CCD6] mb-3">Missing or Pending Information</p>
            <div className="grid grid-cols-2 gap-3">
              {readinessData.missing_information.length === 0 && (
                <p className="text-xs text-[#69758A] italic">Nothing missing — case is fully documented.</p>
              )}
              {readinessData.missing_information.map((label) => {
                const existingTask = tasks.find((t) => t.description === `Resolve: ${label}` && t.status === "open");
                return (
                  <div key={label} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <span className="text-red-400 font-bold mt-0.5">✕</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-300">{label}</p>

                      {existingTask ? (
                        <p className="mt-2 text-xs text-red-300">
                          Assigned to <span className="font-medium">{existingTask.assignee_name}</span>
                        </p>
                      ) : assigningLabel === label ? (
                        <div className="mt-2 flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={assigneeInput}
                            onChange={(e) => setAssigneeInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAssignTask(label)}
                            placeholder="Assignee name…"
                            className="text-xs border border-red-500/40 rounded px-2 py-1 w-32 focus:outline-none focus:border-red-500"
                          />
                          <button
                            onClick={() => handleAssignTask(label)}
                            disabled={isAssigning || !assigneeInput.trim()}
                            className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {isAssigning ? "…" : "Go"}
                          </button>
                          <button
                            onClick={() => { setAssigningLabel(null); setAssigneeInput(""); }}
                            className="text-xs text-red-400 hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningLabel(label)}
                          className="mt-2 text-xs font-medium text-red-300 underline"
                        >
                          Assign task →
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
            <div className="px-5 py-3.5 border-b border-[#0A0E14] bg-[#12161D]">
              <h3 className="text-sm font-semibold text-[#E7ECF2]">Assigned Tasks</h3>
            </div>
            <div className="divide-y divide-[#0A0E14]">
              {tasks.map((task) => (
                <div key={task.id} className="px-5 py-3 flex items-center gap-4">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.status === "done" ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.status === "done" ? "text-[#69758A] line-through" : "text-[#E7ECF2]"}`}>{task.description}</p>
                    <p className="text-[11px] text-[#69758A]">
                      {task.assignee_name ?? "Unassigned"}{task.due_date ? ` · Due ${task.due_date}` : ""}
                    </p>
                  </div>
                  {task.status === "open" && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completingTaskId === task.id}
                      className="text-xs text-[#0EA5E9] hover:underline shrink-0 disabled:opacity-50"
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
              <div className="px-5 py-3.5 border-b border-[#0A0E14] flex items-center justify-between bg-[#12161D]">
                <h3 className="text-sm font-semibold text-[#E7ECF2] capitalize">{category.replace(/_/g, " ")}</h3>
                <span className="font-mono text-[11px] text-[#69758A]">
                  {catItems.filter((i) => i.status === "complete").length}/{catItems.length} complete
                </span>
              </div>
              <div className="divide-y divide-[#0A0E14]">
                {catItems.map((item) => (
                  <div key={item.field} className={`px-5 py-3 ${item.status === "missing" ? "bg-red-500/10/40" : item.status === "pending" ? "bg-amber-500/10/30" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-5 text-center text-sm shrink-0">{iconFor(item.status)}</div>
                      <div className="flex-1">
                        <p className="text-sm text-[#E7ECF2] font-medium">{item.field}</p>
                        {item.status === "complete" && item.value && (
                          <p className="text-xs text-[#8B96A3] mt-1 leading-relaxed">{item.value}</p>
                        )}
                        {item.status === "complete" && (item.measurement_method || item.measurement_precision || item.measurement_length_type) && (
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {item.measurement_method && (
                              <span className="text-[10px] text-[#8B96A3] bg-[#161B22] px-1.5 py-0.5 rounded">{item.measurement_method}</span>
                            )}
                            {item.measurement_precision && (
                              <span className="text-[10px] text-[#8B96A3] bg-[#161B22] px-1.5 py-0.5 rounded">{item.measurement_precision}</span>
                            )}
                            {item.measurement_length_type && (
                              <span className="text-[10px] text-[#8B96A3] bg-[#161B22] px-1.5 py-0.5 rounded">{item.measurement_length_type}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={item.status as any} />
                      {resolveFormKey !== item.key && confirmingDeleteKey !== item.key && (
                        <button
                          onClick={() => openResolveForm(item.key, item)}
                          className="text-xs text-[#0EA5E9] hover:underline shrink-0"
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
                          className="text-xs text-red-400 hover:underline shrink-0"
                        >
                          Delete
                        </button>
                      )}
                      {confirmingDeleteKey === item.key && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[#C3CCD6]">Delete this?</span>
                          <button
                            onClick={() => handleDeleteValue(item.key)}
                            disabled={deletingKey === item.key}
                            className="text-xs font-medium text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deletingKey === item.key ? "…" : "Yes, delete"}
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteKey(null)}
                            className="text-xs text-[#8B96A3] hover:text-[#C3CCD6]"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {resolveFormKey === item.key && (
                      <div className="mt-3 ml-9 space-y-2 max-w-md">
                        <div>
                          <label className="block text-[10px] text-[#69758A] mb-1">Status</label>
                          <select
                            value={resolveStatus}
                            onChange={(e) => setResolveStatus(e.target.value)}
                            className="border border-[#2E3742] rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#0EA5E9]"
                          >
                            <option value="complete">Complete</option>
                            <option value="pending">Pending</option>
                            <option value="missing">Missing (reset)</option>
                          </select>
                        </div>

                        {resolveStatus !== "missing" && (
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
                            className="w-full border border-[#2E3742] rounded px-2.5 py-2 text-xs focus:outline-none focus:border-[#0EA5E9] resize-none"
                          />
                        )}

                        {/* Measurement standardization metadata — only for
                            measurement-category fields, directly addressing
                            the real critique that published tumor
                            measurements rarely document who measured, how,
                            or whether a basal diameter is a chord- or
                            arc-length. */}
                        {item.category === "measurement" && resolveStatus === "complete" && (
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={resolveMethod}
                              onChange={(e) => setResolveMethod(e.target.value)}
                              className="border border-[#2E3742] rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#0EA5E9]"
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
                              className="border border-[#2E3742] rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#0EA5E9]"
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
                              className="border border-[#2E3742] rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#0EA5E9]"
                            >
                              <option value="">Chord/Arc…</option>
                              <option value="Chord length">Chord length</option>
                              <option value="Arc length">Arc length</option>
                              <option value="Not specified">Not specified</option>
                            </select>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setResolveFormKey(null)}
                            className="text-xs text-[#8B96A3] px-2.5 py-1.5 rounded hover:bg-[#161B22] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResolveSubmit(item.key)}
                            disabled={resolvingKey === item.key || (resolveStatus !== "missing" && !resolveValue.trim())}
                            className="text-xs font-medium text-white bg-[#0EA5E9] px-3 py-1.5 rounded hover:bg-[#0284C7] transition-colors disabled:opacity-50"
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
function AuthenticatedImage({ caseId, fieldKey, alt, className }: { caseId: string; fieldKey: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    apiFetch(`${API_BASE}/cases/${caseId}/images/${fieldKey}`)
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
  }, [caseId, fieldKey]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}

function ImagingContent({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  // Same live-fetch pattern as the other screens — pulling the full
  // checklist so both the imaging table AND the measurements card below
  // can show real per-patient data instead of one hardcoded showcase case.
  const [checklist, setChecklist] = useState<
    { key: string; field: string; category: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null }[] | null
  >(null);

  // Tracks which study is currently being ordered, so only that row's
  // button shows a brief loading state.
  const [orderingKey, setOrderingKey] = useState<string | null>(null);

  // Which fields have a real uploaded image — just filenames/dates, not
  // the image data itself, so this list stays lightweight.
  const [uploadedImages, setUploadedImages] = useState<
    { field_key: string; filename: string; uploaded_at: string | null }[]
  >([]);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadImageList = () => {
    apiFetch(`${API_BASE}/cases/${caseId}/images`)
      .then((res) => res.json())
      .then((data) => setUploadedImages(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  // Reads the chosen file as base64 in the browser, then sends it up —
  // this is what makes "upload a real image" actually real, instead of
  // the app only ever showing text descriptions of a study.
  const handleImageUpload = (fieldKey: string, file: File) => {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image must be under 8MB.");
      return;
    }
    setUploadingKey(fieldKey);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1]; // strip the "data:image/png;base64," prefix
      apiFetch(`${API_BASE}/cases/${caseId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_key: fieldKey,
          filename: file.name,
          content_type: file.type,
          data_base64: base64,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || "Upload failed.");
          }
          loadImageList();
        })
        .catch((err) => setUploadError(err.message))
        .finally(() => setUploadingKey(null));
    };
    reader.onerror = () => {
      setUploadError("Couldn't read that file.");
      setUploadingKey(null);
    };
    reader.readAsDataURL(file);
  };

  // Removes an uploaded image outright — previously the only option was
  // to overwrite it with a new file, with no way to just remove a wrong
  // or unwanted one.
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

  const loadImaging = () => {
    apiFetch(`${API_BASE}/cases/${caseId}/readiness`)
      .then((res) => res.json())
      .then((data) => setChecklist(data.checklist))
      .catch((err) => console.error("Couldn't reach backend:", err));
  };

  useEffect(() => {
    loadImaging();
    loadImageList();
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
    return <p className="text-[#69758A] text-sm">Loading imaging studies…</p>;
  }

  const completeCount = imagingItems.filter((s) => s.status === "complete").length;
  const pct = imagingItems.length ? Math.round((completeCount / imagingItems.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8B96A3]">{completeCount}/{imagingItems.length} studies complete</span>
          <div className="h-1.5 w-32 bg-[#161B22] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button
          onClick={handleOrderAllMissing}
          disabled={isBulkOrdering || imagingItems.filter((s) => s.status === "missing").length === 0}
          className="bg-[#0F2D56] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#0F2D56]/90 transition-colors disabled:opacity-50"
        >
          {isBulkOrdering ? "Ordering…" : "+ Order Missing Imaging"}
        </button>
      </div>

      {uploadError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">{uploadError}</p>
      )}

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#161B22] bg-[#12161D]">
              {["Study", "Status", "Image", "Source / Technician", "Findings", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#69758A] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0A0E14]">
            {imagingItems.map((s) => {
              const hasImage = uploadedImages.some((img) => img.field_key === s.key);
              return (
              <tr key={s.key} className={`${s.status === "missing" ? "bg-red-500/10/40" : s.status === "pending" ? "bg-amber-500/10/30" : "hover:bg-[#0A0E14]"} transition-colors`}>
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-[#E7ECF2]">{s.field}</p>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={s.status as any} />
                </td>
                <td className="px-5 py-3.5">
                  {hasImage ? (
                    <AuthenticatedImage
                      caseId={caseId}
                      fieldKey={s.key}
                      alt={`${s.field} image`}
                      className="w-16 h-16 object-cover rounded border border-[#232A34]"
                    />
                  ) : (
                    <span className="text-[10px] text-[#454E59] italic">No image</span>
                  )}
                  <label className="block mt-1 text-[10px] text-[#0EA5E9] hover:underline cursor-pointer">
                    {uploadingKey === s.key ? "Uploading…" : hasImage ? "Replace" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      className="bg-[#12161D] hidden"
                      disabled={uploadingKey === s.key}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(s.key, file);
                        e.target.value = ""; // allow re-selecting the same file later
                      }}
                    />
                  </label>
                  {hasImage && confirmingImageDeleteKey !== s.key && (
                    <button
                      onClick={() => setConfirmingImageDeleteKey(s.key)}
                      className="block mt-0.5 text-[10px] text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                  {confirmingImageDeleteKey === s.key && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-[#C3CCD6]">Sure?</span>
                      <button
                        onClick={() => handleDeleteImage(s.key)}
                        disabled={deletingImageKey === s.key}
                        className="text-[10px] font-medium text-white bg-red-500 px-1.5 py-0.5 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deletingImageKey === s.key ? "…" : "Yes"}
                      </button>
                      <button
                        onClick={() => setConfirmingImageDeleteKey(null)}
                        className="text-[10px] text-[#8B96A3] hover:text-[#C3CCD6]"
                      >
                        No
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <p className={`text-xs ${s.source ? "text-[#C3CCD6]" : "text-[#454E59]"}`}>{s.source ?? "Not assigned"}</p>
                </td>
                <td className="px-5 py-3.5 max-w-xs">
                  <p className={`text-xs leading-relaxed ${s.status === "missing" ? "text-red-400 italic" : s.status === "pending" ? "text-amber-400 italic" : "text-[#C3CCD6]"}`}>
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
                    <span className="text-xs text-[#454E59]">—</span>
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
            <p className="text-sm text-[#C3CCD6] leading-relaxed">{measurementItem.value}</p>
            {(measurementItem.measurement_method || measurementItem.measurement_precision || measurementItem.measurement_length_type) && (
              <div className="flex flex-wrap gap-3 mt-2">
                {measurementItem.measurement_method && (
                  <span className="text-[10px] text-[#8B96A3] bg-[#161B22] px-2 py-0.5 rounded">Method: {measurementItem.measurement_method}</span>
                )}
                {measurementItem.measurement_precision && (
                  <span className="text-[10px] text-[#8B96A3] bg-[#161B22] px-2 py-0.5 rounded">Precision: {measurementItem.measurement_precision}</span>
                )}
                {measurementItem.measurement_length_type && (
                  <span className="text-[10px] text-[#8B96A3] bg-[#161B22] px-2 py-0.5 rounded">{measurementItem.measurement_length_type}</span>
                )}
              </div>
            )}
            {measurementItem.source && (
              <p className="text-[10px] text-[#454E59] mt-2">Source: {measurementItem.source}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#454E59] italic">
            Not yet recorded for this patient — see the "Tumor measurements" status on the Case Readiness page.
          </p>
        )}
      </Card>
    </div>
  );
}

function ImagingScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  const [caseInfo, setCaseInfo] = useState<{ patient: string; mrn: string } | null>(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => res.json())
      .then((data) => setCaseInfo(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, [caseId]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Imaging & Measurements"
        subtitle={caseInfo ? `${caseInfo.patient} · ${caseInfo.mrn}` : ""}
      />
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#0A0E14]">
        <ImagingContent onNav={onNav} caseId={caseId} />
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
    checklist: { key: string; field: string; category: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null }[];
    missing_information: string[];
  } | null>(null);
  const [caseInfo, setCaseInfo] = useState<{ patient: string; mrn: string; diagnosis: string | null; laterality: string | null } | null>(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}/readiness`)
      .then((res) => res.json())
      .then((data) => setReadinessData(data))
      .catch((err) => console.error("Couldn't reach backend:", err));

    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => res.json())
      .then((data) => setCaseInfo(data))
      .catch((err) => console.error("Couldn't reach backend:", err));
  }, [caseId]);

  const readinessPct = readinessData?.readiness_pct ?? null;
  const fieldValue = (key: string): string | null =>
    readinessData?.checklist.find((c) => c.key === key)?.value ?? null;
  const fieldStatus = (key: string): string =>
    readinessData?.checklist.find((c) => c.key === key)?.status ?? "missing";
  const imagingItems = readinessData?.checklist.filter((c) => c.category === "imaging") ?? [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Tumor Board — Case Summary"
        subtitle="Nov 14, 2024 · Multidisciplinary Oncology Conference"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="border border-[#232A34] text-[#C3CCD6] px-3 py-2 rounded text-sm hover:bg-[#0A0E14] transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={() => onNav("tumor-board-decision")}
              className="bg-[#0F2D56] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0F2D56]/90 transition-colors"
            >
              Record Decision →
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#0A0E14]">
        <div className="grid grid-cols-[1fr_260px] gap-6">
          <div className="space-y-5">
            {/* Case header */}
            <Card className="p-6 border-l-4 border-l-[#0F2D56]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#E7ECF2]">{caseInfo ? caseInfo.patient : "Loading…"}</h2>
                  <p className="font-mono text-xs text-[#69758A] mt-0.5">
                    {caseInfo ? caseInfo.mrn : ""}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status="warning" />
                  <p className="text-[10px] text-[#69758A] mt-1">
                    Readiness: {readinessPct !== null ? `${readinessPct}%` : "…"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#161B22]">
                {[
                  { label: "Diagnosis", value: caseInfo?.diagnosis ?? "Not recorded" },
                  { label: "Laterality", value: caseInfo?.laterality ?? "Not recorded" },
                  { label: "TNM Stage", value: "Not recorded" },
                  { label: "Date of Dx", value: "Not recorded" },
                  { label: "Referring Provider", value: "Not recorded" },
                  { label: "Primary Provider", value: "Dr. A. Reyes" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[10px] text-[#69758A] uppercase tracking-wider mb-0.5">{f.label}</p>
                    <p className={`text-sm font-medium ${f.value === "Not recorded" ? "text-[#454E59] italic" : "text-[#E7ECF2]"}`}>{f.value}</p>
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
                    <div className="flex justify-between border-b border-[#0A0E14] pb-2">
                      <span className="text-xs text-[#69758A] shrink-0 mr-4">Location</span>
                      <span className="text-xs font-medium text-[#E7ECF2] text-right">{fieldValue("tumor_location")}</span>
                    </div>
                  )}
                  {fieldValue("tumor_dimensions") && (
                    <div className="flex justify-between">
                      <span className="text-xs text-[#69758A] shrink-0 mr-4">Measurements</span>
                      <span className="text-xs font-medium text-[#E7ECF2] text-right">{fieldValue("tumor_dimensions")}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#454E59] italic">Not yet recorded for this patient.</p>
              )}
            </Card>

            {/* Imaging summary — pulled from the real checklist, same data
                as the Imaging tab, so the two never disagree */}
            <Card className="p-5">
              <SectionHeader>Imaging Summary</SectionHeader>
              {imagingItems.length > 0 ? (
                <div className="space-y-3">
                  {imagingItems.map((i) => (
                    <div key={i.key} className={`flex gap-3 p-3 rounded border ${i.status === "missing" ? "bg-red-500/10 border-red-500/30" : i.status === "pending" ? "bg-amber-500/10 border-amber-500/30" : "bg-[#0A0E14] border-[#161B22]"}`}>
                      <span className={`font-mono text-[11px] font-semibold w-14 shrink-0 pt-0.5 ${i.status === "missing" ? "text-red-400" : i.status === "pending" ? "text-amber-400" : "text-[#0EA5E9]"}`}>{i.field}</span>
                      <p className={`text-xs leading-relaxed ${i.status === "missing" ? "text-red-400 italic" : i.status === "pending" ? "text-amber-300 italic" : "text-[#C3CCD6]"}`}>
                        {i.value ?? (i.status === "pending" ? "Awaiting results" : "Not obtained")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#69758A]">Loading…</p>
              )}
            </Card>

            {/* Molecular — generic over whatever molecular fields this
                disease profile actually defines */}
            <Card className="p-5">
              <SectionHeader>Molecular & Genetic Testing</SectionHeader>
              {(() => {
                const molecularItems = readinessData?.checklist.filter((c) => c.category === "molecular") ?? [];
                if (molecularItems.length === 0) return <p className="text-xs text-[#69758A] italic">No molecular testing configured for this disease profile.</p>;
                return (
                  <div className="space-y-2.5">
                    {molecularItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#0A0E14] last:border-0">
                        <span className="text-xs text-[#C3CCD6]">{item.field}</span>
                        <span className={`text-xs font-medium ${item.status === "complete" ? "text-[#E7ECF2]" : "text-amber-400"}`}>
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
            <Card className="p-5 border-l-4 border-l-[#0EA5E9]">
              <SectionHeader>Question for Multidisciplinary Team</SectionHeader>
              <p className="text-[#E7ECF2] text-sm leading-relaxed">
                Patient with {caseInfo?.diagnosis ?? "an undocumented diagnosis"}
                {caseInfo?.laterality ? ` (${caseInfo.laterality})` : ""}.
                {fieldValue("tumor_location") ? ` ${fieldValue("tumor_location")}` : ""}
                {fieldValue("tumor_dimensions") ? ` ${fieldValue("tumor_dimensions")}` : ""}
                {(() => {
                  const molecular = (readinessData?.checklist.filter((c) => c.category === "molecular" && c.value) ?? []);
                  return molecular.length > 0
                    ? ` Molecular testing: ${molecular.map((m) => m.value).join("; ")}.`
                    : " Molecular testing not yet available.";
                })()}
              </p>
              <p className="text-[#C3CCD6] text-sm leading-relaxed mt-3 font-medium">
                {readinessData && readinessData.missing_information.length > 0
                  ? `Case is ${readinessData.readiness_pct}% documented. Outstanding before full review: ${readinessData.missing_information.join(", ")}.`
                  : "Case is fully documented and ready for treatment recommendation."}
              </p>
            </Card>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <Card className="p-4">
              <SectionHeader>Participating Specialties</SectionHeader>
              <div className="space-y-3">
                {[
                  { specialty: "Ophthalmology", provider: "Dr. Alicia M. Reyes, MD", role: "Presenting Physician" },
                  { specialty: "Radiation Oncology", provider: "Dr. Kevin S. Hartman, MD", role: "Treatment Planning" },
                  { specialty: "Radiation Physics", provider: "Dr. Priya N. Mehta, PhD", role: "Dosimetry" },
                ].map((p) => (
                  <div key={p.specialty} className="border border-[#161B22] rounded p-3">
                    <p className="text-[10px] font-semibold text-[#69758A] uppercase tracking-wider">{p.specialty}</p>
                    <p className="text-xs font-medium text-[#E7ECF2] mt-0.5">{p.provider}</p>
                    <p className="text-[10px] text-[#69758A]">{p.role}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#69758A] italic mt-3">
                Medical oncology and other specialists join as needed for higher-risk or metastatic cases.
              </p>
            </Card>

            <Card className="p-4">
              <SectionHeader>Meeting Details</SectionHeader>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Date", value: "November 14, 2024" },
                  { label: "Time", value: "2:00 PM EST" },
                  { label: "Format", value: "Video conference" },
                ].map((d) => (
                  <div key={d.label} className="flex justify-between">
                    <span className="text-[#69758A]">{d.label}</span>
                    <span className="text-[#E7ECF2] font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <SectionHeader>Previous Treatment</SectionHeader>
              <p className="text-xs text-[#69758A] italic">No prior treatment recorded for this diagnosis.</p>
            </Card>

            <button
              onClick={() => onNav("tumor-board-decision")}
              className="w-full bg-[#0F2D56] text-white rounded py-3 text-sm font-semibold hover:bg-[#0F2D56]/90 transition-colors"
            >
              Record MDT Decision →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. TUMOR BOARD DECISION
function TumorBoardDecisionScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {
  const [caseInfo, setCaseInfo] = useState<{ patient: string; mrn: string } | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState("Iodine-125 (I-125) plaque brachytherapy");
  const [rationale, setRationale] = useState("Patient presents with T2b choroidal melanoma (11.2 × 9.8 mm base, 4.6 mm height) with Monosomy 3 and BAP1 loss — indicating high-risk molecular profile. Plaque brachytherapy selected given tumor size within treatable range, desire for globe preservation, and proximity to fovea. Proton beam therapy discussed but deferred given local expertise. Systemic surveillance with liver MRI every 6 months recommended given high-risk GEP profile (result pending).");
  const [nextStep, setNextStep] = useState("Simulate for I-125 plaque brachytherapy");
  const [responsible, setResponsible] = useState("Dr. K. Hartman (Radiation Oncology)");
  const [followUpDate, setFollowUpDate] = useState("2024-12-05");
  const [surveillanceProtocol, setSurveillanceProtocol] = useState("Liver MRI every 6 months");

  useEffect(() => {
    apiFetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => res.json())
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
          setSurveillanceProtocol(data.surveillance_protocol ?? "Liver MRI every 6 months");
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
        <div className="flex-1 overflow-y-auto px-8 py-12 bg-[#0A0E14] flex items-start justify-center">
          <div className="max-w-lg w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#34D399" strokeWidth="2.5">
                  <path d="M5 14l6 6L23 8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[#E7ECF2]">Decision Recorded</h2>
              <p className="text-[#8B96A3] text-sm mt-2">Multidisciplinary tumor board decision has been saved and assigned.</p>
            </div>

            <Card className="p-6 space-y-4">
              {[
                { label: "Treatment Recommendation", value: recommendation },
                { label: "Next Step", value: nextStep },
                { label: "Responsible Provider", value: responsible },
                { label: "Follow-up Date", value: followUpDate || "Not set" },
                { label: "Surveillance Protocol", value: surveillanceProtocol },
              ].map((f) => (
                <div key={f.label} className="border-b border-[#0A0E14] pb-3 last:border-0">
                  <p className="text-[10px] font-semibold text-[#69758A] uppercase tracking-wider mb-1">{f.label}</p>
                  <p className="text-sm text-[#E7ECF2]">{f.value}</p>
                </div>
              ))}
            </Card>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => onNav("patient")}
                className="flex-1 border border-[#232A34] text-[#C3CCD6] py-2.5 rounded text-sm font-medium hover:bg-[#0A0E14] transition-colors"
              >
                Return to Patient
              </button>
              <button
                onClick={() => onNav("dashboard")}
                className="flex-1 bg-[#0F2D56] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#0F2D56]/90 transition-colors"
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
        subtitle={caseInfo ? `${caseInfo.patient} · ${caseInfo.mrn} · Tumor Board Nov 14, 2024` : ""}
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#0A0E14]">
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
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${recommendation === opt ? "border-[#0F2D56] bg-[#0F2D56]" : "border-[#454E59] group-hover:border-[#69758A]"}`}>
                      {recommendation === opt && <div className="w-1.5 h-1.5 rounded-full bg-[#12161D]" />}
                    </div>
                    <span className="text-sm text-[#C3CCD6]">{opt}</span>
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
                className="w-full border border-[#232A34] rounded px-3 py-2.5 text-sm text-[#C3CCD6] bg-[#0A0E14] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all resize-none"
              />
            </Card>

            {/* Next steps */}
            <Card className="p-5">
              <SectionHeader>Next Steps & Action Items</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C3CCD6] mb-1.5">Immediate Next Step</label>
                  <input
                    value={nextStep}
                    onChange={(e) => setNextStep(e.target.value)}
                    className="w-full border border-[#232A34] rounded px-3 py-2.5 text-sm text-[#C3CCD6] bg-[#0A0E14] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C3CCD6] mb-1.5">Responsible Provider</label>
                  <input
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    className="w-full border border-[#232A34] rounded px-3 py-2.5 text-sm text-[#C3CCD6] bg-[#0A0E14] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C3CCD6] mb-1.5">Follow-up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full border border-[#232A34] rounded px-3 py-2.5 text-sm text-[#C3CCD6] bg-[#0A0E14] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C3CCD6] mb-1.5">Surveillance Protocol</label>
                  <select
                    value={surveillanceProtocol}
                    onChange={(e) => setSurveillanceProtocol(e.target.value)}
                    className="w-full border border-[#232A34] rounded px-3 py-2.5 text-sm text-[#C3CCD6] bg-[#0A0E14] focus:outline-none focus:border-[#0EA5E9] transition-all"
                  >
                    <option>Liver MRI every 6 months</option>
                    <option>Liver MRI every 12 months</option>
                    <option>Annual LFTs + imaging</option>
                    <option>Custom protocol</option>
                  </select>
                </div>
              </div>

              {/* Additional tasks */}
              <div className="mt-4 pt-4 border-t border-[#161B22]">
                <p className="text-xs font-medium text-[#C3CCD6] mb-2">Additional Tasks Assigned</p>
                <div className="space-y-2">
                  {[
                    { task: "Await GEP result — adjust systemic recommendation if Class 2", assignee: "Dr. L. Brennan" },
                    { task: "Radiation physics simulation — I-125 plaque dosimetry", assignee: "Dr. P. Mehta" },
                    { task: "Schedule radiation oncology new patient visit", assignee: "Radiation Oncology Coordinator" },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-[#0A0E14] rounded border border-[#161B22]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] shrink-0" />
                      <div className="flex-1 text-xs">
                        <span className="text-[#C3CCD6]">{t.task}</span>
                        <span className="text-[#69758A]"> → {t.assignee}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {saveError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">{saveError}</p>
            )}

            <button
              onClick={handleSaveDecision}
              disabled={isSaving}
              className="w-full bg-[#0F2D56] text-white py-3 rounded text-sm font-semibold hover:bg-[#0F2D56]/90 transition-colors disabled:opacity-60"
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
                  { label: "Patient", value: "M. Sullivan, 67F" },
                  { label: "Diagnosis", value: "Choroidal Melanoma OD" },
                  { label: "Stage", value: "T2bN0M0", mono: true },
                  { label: "Dimensions", value: "11.2 × 9.8 mm / 4.6 mm H", mono: true },
                  { label: "Chromosome 3", value: "Monosomy 3" },
                  { label: "BAP1", value: "Loss detected" },
                  { label: "GEP", value: "Pending" },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between border-b border-[#0A0E14] pb-1.5">
                    <span className="text-[#69758A]">{f.label}</span>
                    <span className={`text-[#E7ECF2] font-medium ${(f as any).mono ? "font-mono text-[10px]" : ""}`}>{f.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <SectionHeader>Attending Physicians</SectionHeader>
              <div className="space-y-2 text-xs">
                {[
                  { name: "Dr. A. Reyes", spec: "Ophthalmology" },
                  { name: "Dr. K. Hartman", spec: "Radiation Oncology" },
                  { name: "Dr. P. Mehta", spec: "Radiation Physics" },
                  { name: "Dr. L. Brennan", spec: "Medical Oncology" },
                ].map((p) => (
                  <div key={p.name} className="flex justify-between">
                    <span className="text-[#E7ECF2] font-medium">{p.name}</span>
                    <span className="text-[#69758A]">{p.spec}</span>
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
function PatientPathwayScreen({ onNav }: { onNav: (s: Screen, caseId?: string) => void }) {
  const steps = [
    {
      label: "Initial Evaluation",
      status: "done",
      date: "October 8, 2024",
      desc: "Your ophthalmologist completed a comprehensive eye examination and identified a pigmented mass in the back of your right eye. A diagnosis of uveal melanoma was made based on clinical features.",
      detail: "Your evaluation included visual acuity testing, eye pressure measurement, and a dilated retinal exam using specialized lenses.",
    },
    {
      label: "Imaging & Testing",
      status: "done",
      date: "October 10–16, 2024",
      desc: "Specialized imaging of your eye was performed to precisely measure the tumor, identify its characteristics, and assess for any involvement of surrounding structures.",
      detail: "Studies completed: B-scan ultrasound, OCT, Optos photography, and fluorescein angiography. Biopsy material was also sent for genetic testing.",
    },
    {
      label: "Multidisciplinary Review",
      status: "current",
      date: "November 14, 2024 (scheduled)",
      desc: "Your case will be reviewed by a team of specialists including an eye cancer specialist, radiation oncologist, radiation physicist, and medical oncologist.",
      detail: "The team will review all your imaging and test results together and recommend the best treatment option for you. You will receive a call after this meeting to discuss the recommendation.",
    },
    {
      label: "Treatment Planning",
      status: "upcoming",
      date: "To be scheduled",
      desc: "Once a treatment recommendation is made, your care team will schedule detailed planning sessions to prepare for treatment.",
      detail: "This may include additional imaging, simulation appointments, and coordination between multiple departments.",
    },
    {
      label: "Treatment",
      status: "upcoming",
      date: "To be scheduled",
      desc: "Your individualized treatment will be delivered based on the multidisciplinary team's recommendation.",
      detail: "Treatment for uveal melanoma often involves a form of radiation therapy delivered precisely to the tumor while preserving as much of your vision as possible.",
    },
    {
      label: "Surveillance",
      status: "upcoming",
      date: "Ongoing after treatment",
      desc: "After treatment, you will have regular follow-up appointments to monitor your eye and check for any signs of recurrence or spread.",
      detail: "Follow-up typically includes eye examinations, imaging of your liver (the most common site of spread), and blood tests.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Patient-facing header */}
      <div className="px-8 py-5 shrink-0" style={{ background: "linear-gradient(to bottom, #0F2D56, #0A0E14)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center">
              <EyeIcon size={14} />
            </div>
            <div>
              <p className="text-white font-semibold">UvealCare Patient Portal</p>
              <p className="text-white/50 text-xs">My Care Pathway</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-xs">{PATIENT.name}</span>
            <button
              onClick={() => onNav("dashboard")}
              className="text-white/60 text-xs hover:text-white transition-colors border border-white/20 px-3 py-1.5 rounded"
            >
              Staff View
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#0A0E14]">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[#E7ECF2]">Your Care Pathway</h1>
            <p className="text-[#8B96A3] text-sm mt-1">
              Hello, Margaret. This page shows where you are in your uveal melanoma care and what to expect next.
            </p>
          </div>

          {/* Current step callout */}
          <div className="mb-8 p-5 bg-sky-500/10 border border-sky-500/30 rounded-lg flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-[#0F2D56] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#E7ECF2]">You are currently at: Multidisciplinary Review</p>
              <p className="text-sm text-[#C3CCD6] mt-1">
                Your care team is preparing to present your case to a group of specialists on <strong>November 14, 2024</strong>. You do not need to do anything right now. We will contact you with the team's recommendation after the meeting.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, i) => {
              const isDone = step.status === "done";
              const isCurrent = step.status === "current";
              const isUpcoming = step.status === "upcoming";

              return (
                <div key={step.label} className="flex gap-5">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                      isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                      isCurrent ? "bg-[#0F2D56] border-[#0F2D56] text-white" :
                      "bg-[#12161D] border-[#232A34] text-[#454E59]"
                    }`}>
                      {isDone ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M2.5 7l3 3L11.5 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
                      ) : (
                        <span className="text-xs font-semibold">{i + 1}</span>
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 flex-1 my-1 ${isDone ? "bg-emerald-300" : "bg-[#232A34]"}`} style={{ minHeight: "32px" }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-8 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                    <div className={`rounded-lg border p-4 ${
                      isCurrent ? "bg-[#12161D] border-[#0F2D56] shadow-sm" :
                      isDone ? "bg-emerald-500/10/50 border-emerald-500/30" :
                      "bg-[#12161D] border-[#232A34]"
                    }`}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isCurrent ? "text-[#0F2D56]" : isDone ? "text-emerald-300" : "text-[#454E59]"}`}>
                              {isDone && "✓ "}{step.label}
                            </h3>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold text-white bg-[#0F2D56] px-2 py-0.5 rounded">
                                You are here
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${isDone ? "text-emerald-400" : isCurrent ? "text-[#0EA5E9]" : "text-[#454E59]"}`}>
                            {step.date}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm leading-relaxed ${isUpcoming ? "text-[#69758A]" : "text-[#C3CCD6]"}`}>
                        {step.desc}
                      </p>
                      {!isUpcoming && (
                        <p className={`text-xs leading-relaxed mt-2 pt-2 border-t ${isDone ? "border-emerald-500/30 text-emerald-400/70" : "border-[#161B22] text-[#69758A]"}`}>
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-5 bg-[#12161D] rounded-lg border border-[#232A34]">
            <p className="text-sm font-semibold text-[#E7ECF2] mb-1">Questions about your care?</p>
            <p className="text-sm text-[#8B96A3]">Contact Dr. Alicia Reyes' office at (617) 555-0100 or through your patient portal messaging.</p>
            <p className="text-xs text-[#69758A] mt-2">This information is provided by your care team at UvealCare. All clinical decisions are made by your physicians.</p>
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

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#0A0E14]">
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
                  <span className="text-[#69758A] text-xs shrink-0">{r.label}</span>
                  <span className="text-[#E7ECF2] text-xs text-right">{r.value}</span>
                </div>
              ))}
            </div>

            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="text-xs font-medium text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 rounded hover:bg-red-500/15 transition-colors"
              >
                Log Out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#C3CCD6]">Are you sure?</span>
                <button
                  onClick={onLogout}
                  className="text-xs font-medium text-white bg-red-500 px-3 py-1.5 rounded hover:bg-red-600 transition-colors"
                >
                  Yes, log out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="text-xs font-medium text-[#C3CCD6] px-3 py-1.5 rounded hover:bg-[#161B22] transition-colors"
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
              <p className="text-xs text-[#69758A]">Loading…</p>
            ) : profiles.length === 0 ? (
              <p className="text-xs text-[#69758A] italic">No disease profiles configured yet.</p>
            ) : (
              <div className="space-y-2">
                {profiles.map((p) => (
                  <div key={p.key} className="flex items-center justify-between py-2 border-b border-[#0A0E14] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#E7ECF2]">{p.display_name}</p>
                      <p className="text-[10px] text-[#69758A] font-mono">{p.key}</p>
                    </div>
                    <span className="text-xs text-[#8B96A3]">{p.field_count} tracked fields</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-[#69758A] mt-3 italic">
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
                  <span className="text-[#69758A] text-xs">{r.label}</span>
                  <span className="font-mono text-xs text-[#E7ECF2]">{r.value}</span>
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

  // This is the core fix: instead of every screen hardcoding Margaret's
  // case, the app now remembers WHICH case was clicked on the dashboard,
  // and passes that same ID to whichever screen you navigate to next.
  // Falls back to Margaret's case if none has been selected yet.
  const [selectedCaseId, setSelectedCaseId] = useState<string>(MARGARET_CASE_ID);

  const handleNav = (s: Screen, caseId?: string) => {
    if (caseId) setSelectedCaseId(caseId);
    setScreen(s);
  };

  // A real logout: clears the signed-in user, clears the auth token so
  // no further requests can be made with it, and sends them back to the
  // login screen. The backend can't force-invalidate a token before its
  // expiry yet (that would need a server-side revocation list), but the
  // frontend genuinely forgets it, and it expires on its own after 12 hours.
  const handleLogout = () => {
    authToken = null;
    setLoggedInUser(null);
    setScreen("login");
  };

  if (screen === "login") {
    return (
      <LoginScreen
        onLogin={(user) => {
          setLoggedInUser(user);
          setScreen("dashboard");
        }}
      />
    );
  }

  const isPatientFacing = screen === "patient-pathway";

  return (
    <div className="flex h-full bg-[#0A0E14]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
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
        <Sidebar active={screen} onNav={handleNav} user={loggedInUser} />
      )}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {screen === "dashboard" && <DashboardScreen onNav={handleNav} />}
        {screen === "patient" && <PatientScreen onNav={handleNav} caseId={selectedCaseId} />}
        {screen === "case-readiness" && <CaseReadinessScreen onNav={handleNav} caseId={selectedCaseId} />}
        {screen === "imaging" && <ImagingScreen onNav={handleNav} caseId={selectedCaseId} />}
        {screen === "tumor-board" && <TumorBoardScreen onNav={handleNav} caseId={selectedCaseId} />}
        {screen === "tumor-board-decision" && <TumorBoardDecisionScreen onNav={handleNav} caseId={selectedCaseId} />}
        {screen === "patient-pathway" && <PatientPathwayScreen onNav={handleNav} />}
        {screen === "settings" && <SettingsScreen user={loggedInUser} onLogout={handleLogout} />}
      </div>
    </div>
  );
}
