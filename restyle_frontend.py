"""
Restyles the whole UvealCare interface to a white, clinical look (flat
surfaces, neutral grays, one navy/blue accent, no gradients or glow), and
tidies copy and symbols to match.

Run from your uvealcare-frontend repo folder:

    python3 restyle_frontend.py

Run AFTER patch_gep_frontend.py (that patch anchors on the old colors).
Safe to run once; a second run exits without changing anything.
"""
import os
import re
import sys

MARK = "uvealcare-theme: light-clinical"
APP = "src/App.tsx" if os.path.exists("src/App.tsx") else "App.tsx"
BASE = os.path.dirname(APP)
src = open(APP, encoding="utf-8").read()
if MARK in src:
    print("Already restyled - nothing to do.")
    sys.exit(0)
warnings = []


def once(old, new, label, hard=False):
    global src
    n = src.count(old)
    if n != 1:
        msg = f"{label}: expected 1 match, found {n}"
        if hard:
            print("FAIL  " + msg)
            sys.exit(1)
        warnings.append(msg)
        return
    src = src.replace(old, new, 1)


def region(start_marker, end_marker, new, label, start_rfind=None):
    """Replace src[start:end) where start/end are found by marker."""
    global src
    a = src.find(start_marker)
    if a < 0 or src.count(start_marker) != 1:
        print(f"FAIL  {label}: start marker not unique/found")
        sys.exit(1)
    if start_rfind:
        a = src.rfind(start_rfind, 0, a + len(start_marker))
    b = src.find(end_marker, a + 1)
    if a < 0 or b < 0:
        print(f"FAIL  {label}: end marker not found")
        sys.exit(1)
    src = src[:a] + new + src[b:]


# ---- 1. Palette: Tailwind arbitrary-hex classes ----------------------------
BG = {"#0A0E14": "#FFFFFF", "#12161D": "#FFFFFF", "#161B22": "#F6F8FA",
      "#232A34": "#E4E8ED", "#8291A3": "#7B8794", "#0EA5E9": "#0B63B6"}
HBG = {"#0A0E14": "#F6F8FA", "#161B22": "#EEF2F6", "#0284C7": "#094F93"}
BD = {"#0A0E14": "#E4E8ED", "#161B22": "#E4E8ED", "#232A34": "#D5DBE3",
      "#2E3742": "#C4CCD6", "#7C8794": "#9AA5B1", "#8291A3": "#9AA5B1",
      "#0EA5E9": "#0B63B6"}
TX = {"#E7ECF2": "#1B2733", "#C3CCD6": "#3D4B5C", "#8B96A3": "#5B6877",
      "#8291A3": "#5B6877", "#7C8794": "#6B7785", "#7DD3FC": "#0B63B6",
      "#0EA5E9": "#0B63B6"}
unmapped = set()
OLD = {"#0A0E14", "#12161D", "#161B22", "#232A34", "#2E3742", "#8291A3", "#8B96A3",
       "#7C8794", "#C3CCD6", "#E7ECF2", "#0EA5E9", "#0284C7", "#7DD3FC"}


def hexclass(m):
    mods, util, hx, op = m.group(1), m.group(2), m.group(3).upper(), m.group(4) or ""
    full = mods + util
    if hx not in OLD and not (hx == "#0F2D56" and full == "hover:bg" and op == "/90"):
        return m.group(0)  # already new-palette (or navy) - leave alone
    if hx == "#0F2D56":  # navy primary stays; hover darkens instead of fading
        if full == "hover:bg" and op == "/90":
            return mods + util + "-[#0B2342]"
        return m.group(0)
    if util == "text":
        if "hover:" in mods and hx == "#C3CCD6":
            new = "#1B2733"
        else:
            new = TX.get(hx)
    elif util.startswith("border") or util == "divide":
        new = BD.get(hx)
    elif util in ("ring", "accent"):
        new = {"#0EA5E9": "#0B63B6"}.get(hx)
    elif full == "hover:bg":
        new = HBG.get(hx)
    elif util == "bg":
        new = BG.get(hx)
    else:
        new = None
    if new is None:
        unmapped.add((full, hx))
        return m.group(0)
    return f"{mods}{util}-[{new}]{op}"


src = re.sub(r"((?:[a-z-]+:)*)([a-z]+(?:-[a-z]+)?)-\[(#[0-9A-Fa-f]{6})\](/\d+)?", hexclass, src)

# Invalid stacked-opacity classes (never rendered) -> real light tints.
src = src.replace("bg-red-500/10/40", "bg-red-50").replace("bg-amber-500/10/30", "bg-amber-50")

# ---- 2. Status colors that were tuned for a dark background ----------------
src = re.sub(r"\btext-(red|amber|emerald|sky|orange)-(300|400|500)\b", r"text-\1-700", src)
src = re.sub(r"\bbg-(red|amber|emerald|sky|orange)-500/(?:10|15|20)\b", r"bg-\1-50", src)
src = re.sub(r"\bborder-(red|amber|emerald|sky|orange)-500/(?:30|40)\b", r"border-\1-200", src)
for old, new in (('"#34D399"', '"#1B7F5C"'), ('"#FBBF24"', '"#A15C00"'),
                 ('"#F87171"', '"#B3261E"'), ('"#0EA5E9"', '"#0B63B6"'),
                 ('stroke="#34D399"', 'stroke="#1B7F5C"')):
    src = src.replace(old, new)

# ---- 3. Typography: nothing below 11px, calmer labels ----------------------
src = src.replace("text-[11px]", "text-xs").replace("text-[10px]", "text-[11px]").replace("text-[9px]", "text-[11px]")
src = re.sub(r" (uppercase|tracking-wider|tracking-widest)(?=[ \"'`])", "", src)

# Dashboard table: keep the patient column readable and headers on one line.
src, n1 = re.subn(r'(<th key=\{h\} className="px-4 py-2\.5 text-left )', r"\1whitespace-nowrap ", src)
src, n2 = re.subn(r'<td className="px-4 py-3">(\s*<p className="text-\[#1B2733\] text-sm font-medium">\{p\.patient_name\}</p>)',
                  r'<td className="px-4 py-3 min-w-[10rem]">\1', src)
if (n1, n2) != (1, 1):
    warnings.append(f"dashboard table widths not applied ({n1},{n2})")
TBL = '<table className="w-full">'
a = src.find("<SectionHeader>Active Patients</SectionHeader>")
t = src.find(TBL, a)
e = src.find("</table>", t)
if a > 0 and t > 0 and e > 0 and src.count("grid grid-cols-[1fr_320px] gap-6") == 1:
    src = src[:t] + '<div className="overflow-x-auto">\n            ' + TBL + src[t + len(TBL):e] + "</table>\n            </div>" + src[e + 8:]
    src = src.replace("grid grid-cols-[1fr_320px] gap-6", "grid grid-cols-[minmax(0,1fr)_320px] gap-6")
else:
    warnings.append("dashboard table wrapper not applied")

# ---- 4. Structural pieces --------------------------------------------------
NEW_ICONS = '''function XIcon({ size = 14 }: { size?: number }) {
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
'''
region("// A single deliberate hero moment", "function ChevronRightIcon(", NEW_ICONS, "animated eye icon", "// A single deliberate hero moment")
region("// A colorful rotating glow", "function LoginScreen(", "", "login glow component", "// A colorful rotating glow")

NEW_SIDEBAR = '''function Sidebar({ active, onNav, user, onSwitchWorkflow }: { active: Screen; onNav: (s: Screen, caseId?: string) => void; user: { name: string; email: string; role: string } | null; onSwitchWorkflow: () => void }) {
  const initials = user ? getInitials(user.name) : "?";
  const roleLabel = user ? user.role.replace(/_/g, " ").replace(/\\b\\w/g, (c) => c.toUpperCase()) : "";

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-[#F6F8FA] border-r border-[#D5DBE3]">
      <button onClick={onSwitchWorkflow} className="px-5 py-4 border-b border-[#D5DBE3] text-left hover:bg-[#EEF2F6] transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#0F2D56] text-white flex items-center justify-center">
            <EyeIcon size={14} />
          </div>
          <span className="text-[#1B2733] font-semibold text-[15px]">UvealCare</span>
        </div>
        <p className="text-[#5B6877] text-[11px] mt-1">Clinical Platform</p>
      </button>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id as Screen)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors text-left border ${
                isActive
                  ? "bg-white border-[#D5DBE3] text-[#0F2D56] font-semibold"
                  : "border-transparent text-[#3D4B5C] hover:bg-[#EEF2F6] hover:text-[#1B2733]"
              }`}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => onNav("settings")}
        className="px-4 py-4 border-t border-[#D5DBE3] text-left hover:bg-[#EEF2F6] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#0F2D56] text-white flex items-center justify-center text-[11px] font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-[#1B2733] text-xs font-medium">{user?.name ?? "Not signed in"}</p>
            <p className="text-[#5B6877] text-[11px]">{roleLabel}</p>
          </div>
        </div>
      </button>
    </aside>
  );
}

'''
region("function Sidebar(", "function TopBar(", NEW_SIDEBAR, "sidebar")

region("function SectionHeader(", "// ─── Screens", '''function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-[#3D4B5C] mb-3">{children}</h3>
  );
}

''', "section header")

NEW_LOGIN_LEFT = '''<div className="min-h-screen bg-white flex">
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

      '''
region("{/* Ambient background glare", "{/* Right panel */}", NEW_LOGIN_LEFT, "login left panel", '<div className="min-h-screen')

NEW_PORTAL_HEADER = '''{/* Patient-facing header */}
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
              onClick={() => onNav("dashboard")}
              className="text-[#3D4B5C] text-xs hover:bg-[#F6F8FA] transition-colors border border-[#C4CCD6] px-3 py-1.5 rounded"
            >
              Staff View
            </button>
          </div>
        </div>
      </div>
'''
a = src.find("{/* Patient-facing header */}")
b = src.find('<div className="flex-1 overflow-y-auto', a)
if src.count("{/* Patient-facing header */}") != 1 or b < 0:
    print("FAIL  portal header markers")
    sys.exit(1)
b = src.rfind("\n\n", a, b) + 2
src = src[:a] + NEW_PORTAL_HEADER + "\n      " + src[b:].lstrip(" ")

# Remaining small structural items.
src = re.sub(r'<div className="mt-6 flex items-center justify-center gap-4[^"]*">\s*<span>HL7 FHIR</span>\s*</div>\s*', "", src)
src = src.replace("w-8 h-8 rounded-lg bg-[#0B63B6] flex items-center justify-center", "w-8 h-8 rounded bg-[#0F2D56] text-white flex items-center justify-center")
once("w-10 h-10 rounded-lg bg-[#0B63B6]/15 flex items-center justify-center mb-4 group-hover:bg-[#0B63B6]/25 transition-colors",
     "w-10 h-10 rounded bg-[#E8F0F9] text-[#0B63B6] flex items-center justify-center mb-4 transition-colors", "workflow card icon")

# ---- 5. Symbols -> plain text / line icons ---------------------------------
ICONS = {"✓": "CheckIcon", "✕": "XIcon", "⏳": "ClockIcon"}
src = re.sub(r'<span className="([^"]*)">(✓|✕|⏳)</span>',
             lambda m: '<span className="%s"><%s size={14} /></span>' % (m.group(1).replace("font-bold", "").strip(), ICONS[m.group(2)]), src)
src = src.replace("<span>✕</span>", "<XIcon size={12} />")
src = re.sub(r">\s*✕\s*</button>", ">Cancel</button>", src)
for old, new in (('"▲ Growing"', '"Growing"'), ('"▼ Shrinking"', '"Shrinking"'), ('"● Stable"', '"Stable"'),
                 ('"▲ Growing since last measurement"', '"Growing since last measurement"'),
                 ('"▼ Shrinking since last measurement"', '"Shrinking since last measurement"'),
                 ('"● Stable since last measurement"', '"Stable since last measurement"'),
                 ("⚠ {p.tfsom_risk_label}", "{p.tfsom_risk_label}"), ("⚠ {p.gep_risk_label}", "{p.gep_risk_label}"),
                 ('{isDone && "✓ "}{stageName}', '{stageName}{isDone && <span className="ml-2 text-xs font-normal text-emerald-700">Completed</span>}'),
                 ("Open workflow →", "Open workflow"), ("Assign task →", "Assign task"),
                 ("Record Decision →", "Record Decision"), ("Record MDT Decision →", "Record MDT Decision"),
                 ('<span className="text-[#5B6877]"> → {t.assignee}</span>', '<span className="text-[#5B6877]"> · {t.assignee}</span>'),
                 ('` → ${t.assignee_name}`', '` · Assigned to ${t.assignee_name}`')):
    if old in src:
        src = src.replace(old, new)
    else:
        warnings.append("symbol/copy not found: " + old[:50])

# ---- 6. Copy ---------------------------------------------------------------
for old, new in (
    ("Choose a workflow", "Select a clinical workflow"),
    ("Couldn't load this image.", "Unable to load this image."),
    ('delta: "Live from backend"', 'delta: "In this workflow"'),
    ('Every {currentProfile?.display_name ?? "disease"} patient, one place — sorted so who needs attention shows up first.',
     'All {currentProfile?.display_name ?? "disease"} patients in this workflow. Sort by follow-up urgency, readiness, or name.'),
    ("A rare ocular cancer (~1,500–2,000 US cases/year) with no dedicated clinical workflow tool on the market today.",
     "Rare primary intraocular malignancy. Tracks imaging, tumor measurements, molecular results, and multidisciplinary review."),
    ("A rare cancer (~13,000 US cases/year), officially recognized by the NCI as an underserved area of oncology.",
     "Rare group of connective tissue malignancies. Tracks imaging, staging, and multidisciplinary review."),
):
    once(old, new, "copy: " + old[:40])

# ---- 7. Whole-file checks --------------------------------------------------
left = sorted(set(re.findall(r"#(?:0A0E14|12161D|161B22|232A34|2E3742|8291A3|8B96A3|7C8794|C3CCD6|E7ECF2|0EA5E9|0284C7|7DD3FC)\b", src, re.I)))
grad = re.findall(r"(?:linear|radial|conic)-gradient", src)
if left or grad or unmapped:
    print("FAIL  leftovers:", left, grad[:3], sorted(unmapped))
    sys.exit(1)

src = "// " + MARK + "\n" + src
open(APP, "w", encoding="utf-8").write(src)
print("OK    " + APP + " restyled")

# ---- 8. index.css and index.html (best effort) -----------------------------
def edit(path, pairs):
    if not os.path.exists(path):
        warnings.append("missing " + path)
        return
    t = open(path, encoding="utf-8").read()
    for old, new in pairs:
        if old in t:
            t = t.replace(old, new, 1)
        else:
            warnings.append(path + ": anchor not found: " + old[:40])
    open(path, "w", encoding="utf-8").write(t)
    print("OK    " + path)


edit(os.path.join(BASE, "index.css"), [
    ("@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');\n", ""),
    (".font-mono {\n  font-family: 'JetBrains Mono', 'Courier New', monospace;\n}",
     ".font-mono {\n  font-family: 'Inter', system-ui, sans-serif;\n  font-variant-numeric: tabular-nums;\n}\n\n"
     "body {\n  background: #ffffff;\n  color: #1b2733;\n  -webkit-font-smoothing: antialiased;\n}\n\n"
     "button:focus-visible,\na:focus-visible {\n  outline: 2px solid #0b63b6;\n  outline-offset: 2px;\n}"),
])
html = "index.html" if BASE in ("", ".") else os.path.join(os.path.dirname(BASE) or ".", "index.html")
edit(html, [('<html lang="<!-- figma:lang -->">', '<html lang="en">'),
            ("<title><!-- figma:title --></title>", "<title>UvealCare | Clinical Platform</title>")])

for w in warnings:
    print("WARN  " + w)
print("Done.")
