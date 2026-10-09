"""
Removes hardcoded demo content that was showing on every real patient:
a prefilled MDT decision (treatment, rationale, provider, follow-up date),
a fake "M. Sullivan" case summary and physician list on the decision
screen, fixed Nov 2024 meeting/appointment/task entries, and a hardcoded
"Dr. A. Reyes" primary provider.

Run from your uvealcare-frontend repo folder:

    python3 remove_placeholder_content.py

Works before or after restyle_frontend.py. Safe to run once.
"""
import os
import re
import sys

MARK = "uvealcare: placeholder content removed"
APP = "src/App.tsx" if os.path.exists("src/App.tsx") else "App.tsx"
src = open(APP, encoding="utf-8").read()
if MARK in src:
    print("Already applied - nothing to do.")
    sys.exit(0)


def fail(msg):
    print("FAIL  " + msg)
    sys.exit(1)


def sub1(pattern, new, label, flags=0, start=0):
    """Regex-replace exactly one match at or after index `start`."""
    global src
    head, tail = src[:start], src[start:]
    repl = new if callable(new) else (lambda m: new)
    tail, n = re.subn(pattern, repl, tail, count=0, flags=flags)
    if n != 1:
        fail(f"{label}: expected 1 match, found {n}")
    src = head + tail


def drop_card(marker, label):
    """Delete the <Card>...</Card> that contains `marker`."""
    global src
    if src.count(marker) != 1:
        fail(f"{label}: marker not unique")
    a = src.find(marker)
    c = src.rfind("<Card", 0, a)
    d = src.find("</Card>", a)
    if c < 0 or d < 0:
        fail(f"{label}: card bounds not found")
    line_start = src.rfind("\n", 0, c) + 1
    end = d + len("</Card>")
    if src[end:end + 1] == "\n":
        end += 1
    src = src[:line_start] + src[end:]


def fn_start(name):
    i = src.find("function " + name + "(")
    if i < 0:
        fail("function not found: " + name)
    return i


# ---- Decision screen: no prefilled clinical content ------------------------
d0 = fn_start("TumorBoardDecisionScreen")
sub1(r'useState\("Iodine-125 \(I-125\) plaque brachytherapy"\)', 'useState("")', "default recommendation", start=d0)
sub1(r'useState\("Patient presents with T2b[^"\n]*"\)', 'useState("")', "default rationale", start=d0)
sub1(r'useState\("Simulate for I-125 plaque brachytherapy"\)', 'useState("")', "default next step", start=d0)
sub1(r'useState\("Dr\. K\. Hartman \(Radiation Oncology\)"\)', 'useState("")', "default provider", start=d0)
sub1(r'useState\("2024-12-05"\)', 'useState("")', "default follow-up date", start=d0)
sub1(r'useState\("Liver MRI every 6 months"\)', 'useState("")', "default surveillance", start=d0)
sub1(r'data\.surveillance_protocol \?\? "Liver MRI every 6 months"', 'data.surveillance_protocol ?? ""', "loaded surveillance fallback", start=d0)
sub1(r"<option>Liver MRI every 6 months</option>",
     '<option value="">Select protocol</option>\n                    <option>Liver MRI every 6 months</option>', "protocol placeholder option", start=d0)
sub1(r"(onClick=\{handleSaveDecision\}\s*)disabled=\{isSaving\}",
     lambda m: m.group(1) + "disabled={isSaving || !recommendation}", "save needs a recommendation", start=d0)
sub1(r"useState<\{ patient: string; mrn: string \} \| null>\(null\)",
     "useState<{ patient: string; mrn: string; diagnosis?: string | null } | null>(null)", "decision caseInfo type", start=d0)
sub1(r"\$\{caseInfo\.patient\} · \$\{caseInfo\.mrn\} · Tumor Board Nov 14, 2024", "${caseInfo.patient} · ${caseInfo.mrn}", "decision subtitle", start=d0)
sub1(r'\{ label: "Patient", value: "M\. Sullivan, 67F" \},.*?\{ label: "GEP", value: "Pending" \},',
     '{ label: "Patient", value: caseInfo?.patient ?? "-" },\n'
     '                  { label: "MRN", value: caseInfo?.mrn ?? "-", mono: true },\n'
     '                  { label: "Diagnosis", value: caseInfo?.diagnosis ?? "Not recorded" },',
     "decision case summary rows", flags=re.S, start=d0)

# "Additional Tasks Assigned": a fixed list that was never saved anywhere.
a = src.find("{/* Additional tasks */}", d0)
if a < 0:
    fail("additional tasks block")
a_line = src.rfind("\n", 0, a) + 1
b = src.find("</Card>", a)
b_line = src.rfind("\n", a, b) + 1
src = src[:a_line] + src[b_line:]

drop_card("<SectionHeader>Attending Physicians</SectionHeader>", "attending physicians card")

# ---- Tumor board summary ---------------------------------------------------
sub1(r'subtitle="Nov 14, 2024 · Multidisciplinary Oncology Conference"', 'subtitle="Multidisciplinary Oncology Conference"', "tumor board subtitle")
t0 = fn_start("TumorBoardScreen")
sub1(r"laterality: string \| null \} \| null>\(null\)", "laterality: string | null; primary_provider?: string | null } | null>(null)", "tumor board caseInfo type", start=t0)
sub1(r'\{ label: "Primary Provider", value: "Dr\. A\. Reyes" \},',
     '{ label: "Primary Provider", value: caseInfo?.primary_provider ?? "Not recorded" },', "tumor board primary provider")
drop_card("<SectionHeader>Participating Specialties</SectionHeader>", "participating specialties card")
drop_card("<SectionHeader>Meeting Details</SectionHeader>", "meeting details card")

# ---- Patient screen --------------------------------------------------------
drop_card("<SectionHeader>Upcoming</SectionHeader>", "fake upcoming card")
m = src.find("<SectionHeader>Open Tasks</SectionHeader>")
if m < 0 or src.count("<SectionHeader>Open Tasks</SectionHeader>") != 1:
    fail("open tasks card")
c = src.rfind("<Card", 0, m)
d = src.find("</Card>", m) + len("</Card>")
src = (src[:c] + '''<Card className="max-w-xl p-5">
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
          </Card>''' + src[d:])

code = "\n".join(l for l in src.split("\n") if not l.strip().startswith(("//", "*", "{/*")))
leftovers = [s for s in ("M. Sullivan", "Hartman", "Mehta", "Brennan", "Nov 14, 2024", "Nov 08, 2024", "Nov 10, 2024", "2024-12-05") if s in code]
if leftovers:
    fail("leftover placeholder text: " + ", ".join(leftovers))

open(APP, "w", encoding="utf-8").write("// " + MARK + "\n" + src)
print("OK    " + APP + " cleaned")
