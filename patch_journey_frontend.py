"""
Patches App.tsx in place to add the plain-language "Your Journey" section to
the patient Care Pathway page.

Run from inside your uvealcare-frontend folder:

    python3 patch_journey_frontend.py

It edits src/App.tsx (or App.tsx if you run it next to the file).
Needs the restyled App.tsx. Independent of the GEP / AJCC / viewer patches:
apply in any order. Safe to run twice. If the backend does not have the
journey endpoint yet (or the case is not uveal melanoma) the page quietly
keeps the original step list.
"""
import os
import sys

path = "src/App.tsx" if os.path.exists("src/App.tsx") else "App.tsx"
if not os.path.exists(path):
    print("FAIL  could not find src/App.tsx or App.tsx here. Run this from your uvealcare-frontend folder.")
    sys.exit(1)

content = open(path, "r", encoding="utf-8").read()
original = content
MARKER = "// uvealcare: patient journey"


def apply(label, old, new, content):
    n = content.count(old)
    if n != 1:
        print(f"  FAIL  {label}: expected exactly 1 match, found {n}")
        print("        Your App.tsx differs from what this patch expects.")
        sys.exit(1)
    print(f"  OK    {label}")
    return content.replace(old, new, 1)


if MARKER in content:
    print("Already applied - nothing to do.")
    sys.exit(0)

COMPONENT = r'''// uvealcare: patient journey
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

'''

# 1. the component, just before the existing screen
content = apply(
    "component",
    "function PatientPathwayScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {\n",
    COMPONENT + "function PatientPathwayScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {\n",
    content,
)

# 2. state in the screen
content = apply(
    "screen state",
    "  const [decision, setDecision] = useState<{\n    recommendation: string; surveillance_protocol: string | null;\n  } | null>(null);\n\n  useEffect(() => {\n    apiFetch(`${API_BASE}/cases/${caseId}`)",
    "  const [decision, setDecision] = useState<{\n    recommendation: string; surveillance_protocol: string | null;\n  } | null>(null);\n\n"
    "  const [journeyAvailable, setJourneyAvailable] = useState(false);\n"
    "  const [printMode, setPrintMode] = useState<\"summary\" | \"journey\">(\"summary\");\n"
    "  const printNow = (mode: \"summary\" | \"journey\") => {\n"
    "    setPrintMode(mode);\n"
    "    setTimeout(() => window.print(), 150);\n"
    "  };\n"
    "  useEffect(() => {\n"
    "    const reset = () => setPrintMode(\"summary\");\n"
    "    window.addEventListener(\"afterprint\", reset);\n"
    "    return () => window.removeEventListener(\"afterprint\", reset);\n"
    "  }, []);\n\n"
    "  useEffect(() => {\n    apiFetch(`${API_BASE}/cases/${caseId}`)",
    content,
)

# 3. print css + mode attribute on the root
content = apply(
    "print styles",
    "      <style>{`\n        @media print {\n          .care-summary-print-hide { display: none !important; }\n          .care-summary-print-show { display: block !important; }\n        }\n      `}</style>\n",
    "      <style>{`\n        @media print {\n          .care-summary-print-hide { display: none !important; }\n          .care-summary-print-show { display: block !important; }\n"
    "          [data-print-mode=\"journey\"] .journey-print { display: block !important; }\n"
    "          [data-print-mode=\"journey\"] .care-summary-print-show { display: none !important; }\n"
    "        }\n      `}</style>\n",
    content,
)
content = apply(
    "root print mode attribute",
    "  return (\n    <div className=\"flex-1 flex flex-col overflow-hidden\">\n      {/* Print-only styling for the downloadable Care Summary",
    "  return (\n    <div className=\"flex-1 flex flex-col overflow-hidden\" data-print-mode={printMode}>\n      {/* Print-only styling for the downloadable Care Summary",
    content,
)

# 4. summary print button goes through printNow so it resets the mode
content = apply(
    "summary print button",
    "              onClick={() => window.print()}\n              className=\"shrink-0 border border-[#C4CCD6] text-[#3D4B5C] px-3 py-2 rounded text-sm hover:bg-[#EEF2F6] transition-colors\"\n            >\n              Download / Print Summary",
    "              onClick={() => printNow(\"summary\")}\n              className=\"shrink-0 border border-[#C4CCD6] text-[#3D4B5C] px-3 py-2 rounded text-sm hover:bg-[#EEF2F6] transition-colors\"\n            >\n              Download / Print Summary",
    content,
)

# 5. hide the old one-line callout + generic step list when the journey is available
content = apply(
    "hide old callout",
    "          {/* Current step callout */}\n          {caseInfo && (\n",
    "          {/* Current step callout */}\n          {caseInfo && !journeyAvailable && (\n",
    content,
)
content = apply(
    "journey panel + hide old step list",
    "          {/* Steps — real per-disease stages, plain-language descriptions */}\n          <div className=\"space-y-0 care-summary-print-hide\">\n",
    "          <JourneyPanel caseId={caseId} printing={printMode === \"journey\"} onAvailable={setJourneyAvailable} onPrint={() => printNow(\"journey\")} />\n\n"
    "          {/* Steps — real per-disease stages, plain-language descriptions */}\n"
    "          <div className={`space-y-0 care-summary-print-hide ${journeyAvailable ? \"hidden\" : \"\"}`}>\n",
    content,
)

# 6. The patient page needs a way in. (The old "Tasks" sidebar item that used to
#    open it was dropped in the navigation cleanup, so it had no button at all.)
content = apply(
    "sidebar entry: Patient Journey",
    '  { id: "tumor-board-decision", label: "Record Decision", icon: CheckIcon },\n] as const;',
    '  { id: "tumor-board-decision", label: "Record Decision", icon: CheckIcon },\n  { id: "patient-pathway", label: "Patient Journey", icon: EyeIcon },\n] as const;',
    content,
)
content = apply(
    "keep the patient selected on refresh",
    'const SCREENS_NEEDING_CASE_ID: Screen[] = ["patient", "case-readiness", "imaging", "case-packet", "tumor-board", "tumor-board-decision"];',
    'const SCREENS_NEEDING_CASE_ID: Screen[] = ["patient", "case-readiness", "imaging", "case-packet", "tumor-board", "tumor-board-decision", "patient-pathway"];',
    content,
)
content = apply(
    "Staff View returns to the patient",
    '              onClick={() => onNav("dashboard")}\n              className="text-[#3D4B5C] text-xs hover:bg-[#F6F8FA] transition-colors border border-[#C4CCD6] px-3 py-1.5 rounded"\n            >\n              Staff View',
    '              onClick={() => onNav("patient")}\n              className="text-[#3D4B5C] text-xs hover:bg-[#F6F8FA] transition-colors border border-[#C4CCD6] px-3 py-1.5 rounded"\n            >\n              Staff View',
    content,
)

if content == original:
    print("\nNothing changed.")
    sys.exit(0)
open(path, "w", encoding="utf-8").write(content)
print(f"\nDone - {path} patched.")
