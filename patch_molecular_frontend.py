"""
Patches App.tsx in place to show, on the Case Packet page:

  * a TFSOM-DIM growth-risk card (diameter >5 mm score), and
  * a Molecular Profile card (PRAME, chromosome 3, 8q/6p, BAP1, SF3B1, EIF1AX,
    with a plain flag when results disagree or genetic counseling is indicated).

Run from inside your uvealcare-frontend folder:

    python3 patch_molecular_frontend.py

The 12 new yes/no fields appear by themselves in Case Readiness (Present /
Absent buttons, same as the TFSOM-UHHD factors) once the backend patch is live.
Independent of the AJCC, GEP, viewer and journey patches: apply in any order.
Safe to run twice.
"""
import os
import sys

path = "src/App.tsx" if os.path.exists("src/App.tsx") else "App.tsx"
if not os.path.exists(path):
    print("FAIL  could not find src/App.tsx or App.tsx here. Run this from your uvealcare-frontend folder.")
    sys.exit(1)

content = open(path, "r", encoding="utf-8").read()
MARKER = "// uvealcare: molecular cards"
if MARKER in content:
    print("Already applied - nothing to do.")
    sys.exit(0)


def apply(label, old, new, content):
    n = content.count(old)
    if n != 1:
        print(f"  FAIL  {label}: expected exactly 1 match, found {n}")
        print("        Your App.tsx differs from what this patch expects.")
        sys.exit(1)
    print(f"  OK    {label}")
    return content.replace(old, new, 1)


COMPONENT = r'''// uvealcare: molecular cards
// TFSOM-DIM and the molecular profile. All numbers and wording come from the
// backend (molecular_risk.py). Nothing here is calculated in the browser.
type TfsomDim = {
  factors_assessed: number; factors_total: number; factors_present: string[];
  factor_count: number; risk_label: "Low" | "Moderate" | "High";
  risk_estimate: string; provisional: boolean; mnemonic: string;
};
type MolecularProfile = {
  findings: { key: string; label: string; value: string; direction: "higher" | "lower" | "intermediate"; note: string }[];
  higher_count: number; lower_count: number; pattern: string;
  flags: { level: "action" | "review"; text: string }[];
  disclaimer: string;
};
type MolecularExtras = { tfsom_dim?: TfsomDim | null; molecular_profile?: MolecularProfile | null };

function MolecularCards({ packet }: { packet: MolecularExtras }) {
  const dim = packet.tfsom_dim;
  const mol = packet.molecular_profile;
  if (!dim && !mol) return null;
  const dirChip = (d: string) =>
    d === "higher" ? { t: "Higher risk", c: "bg-red-50 text-red-700" } :
    d === "lower" ? { t: "Lower risk", c: "bg-emerald-50 text-emerald-700" } :
    { t: "Intermediate / neutral", c: "bg-[#F6F8FA] text-[#5B6877]" };
  return (
    <>
      {dim && (
        <Card
          className={`p-5 border-l-4 ${
            dim.risk_label === "High" ? "border-l-red-500" : dim.risk_label === "Moderate" ? "border-l-amber-500" : "border-l-emerald-500"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <SectionHeader>TFSOM-DIM Growth Risk</SectionHeader>
              <p className="text-xs text-[#5B6877] mt-1">{dim.risk_estimate}</p>
              {dim.factors_present.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {dim.factors_present.map((f) => (
                    <span key={f} className="text-[11px] text-[#3D4B5C] bg-[#F6F8FA] px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-[#6B7785] mt-2">
                {dim.factors_assessed} of {dim.factors_total} factors assessed. A separate published score from TFSOM-UHHD: it adds basal diameter over 5 mm.
              </p>
              {dim.provisional && (
                <p className="text-[11px] text-amber-700 mt-1">Not every factor has been assessed, so this is a minimum.</p>
              )}
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded shrink-0 ${
                dim.risk_label === "High" ? "bg-red-50 text-red-700" : dim.risk_label === "Moderate" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {dim.risk_label}
            </span>
          </div>
        </Card>
      )}

      {mol && (
        <Card className="p-5">
          <SectionHeader>Molecular Profile</SectionHeader>
          <p className="text-xs text-[#3D4B5C] mt-1 font-medium">{mol.pattern}</p>

          {mol.flags.length > 0 && (
            <div className="mt-3 space-y-2">
              {mol.flags.map((f, i) => (
                <p
                  key={i}
                  className={`text-xs rounded border px-3 py-2 ${
                    f.level === "action" ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <span className="font-semibold">{f.level === "action" ? "Action: " : "Review: "}</span>{f.text}
                </p>
              ))}
            </div>
          )}

          <ul className="mt-3 divide-y divide-[#E4E8ED]">
            {mol.findings.map((f) => {
              const chip = dirChip(f.direction);
              return (
                <li key={f.key} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-[#1B2733]"><span className="font-semibold">{f.label}:</span> {f.value}</p>
                    <p className="text-[11px] text-[#5B6877] mt-0.5 leading-relaxed">{f.note}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${chip.c}`}>{chip.t}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-[#6B7785] mt-3">{mol.disclaimer}</p>
        </Card>
      )}
    </>
  );
}

'''

content = apply(
    "cards component",
    "function CasePacketScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {\n",
    COMPONENT + "function CasePacketScreen({ onNav, caseId }: { onNav: (s: Screen, caseId?: string) => void; caseId: string }) {\n",
    content,
)
content = apply(
    "cards on the case packet",
    "            {/* Key images — one representative slice per study */}\n",
    "            <MolecularCards packet={packet as unknown as MolecularExtras} />\n\n"
    "            {/* Key images — one representative slice per study */}\n",
    content,
)

open(path, "w", encoding="utf-8").write(content)
print(f"\nDone - {path} patched.")
