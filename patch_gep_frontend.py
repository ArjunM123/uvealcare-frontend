"""
Patches App.tsx in place to add GEP/molecular metastatic-risk tracking to
the frontend, on top of the TFSOM-UHHD patch already applied.

Run this from inside your uvealcare-frontend repo folder, in the same
folder as App.tsx (usually src/App.tsx):

    python3 patch_gep_frontend.py

Safe to run only once; running it twice will fail cleanly. Requires
patch_tfsom_frontend.py to have already been run — it anchors onto the
TFSOM banner and risk-label field it added.
"""
import sys
import os

APP_TSX_PATH = "App.tsx"
if not os.path.exists(APP_TSX_PATH) and os.path.exists("src/App.tsx"):
    APP_TSX_PATH = "src/App.tsx"

with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

original = content


def apply(label, old, new, content):
    if new in content:
        print(f"  SKIP  {label} (already applied)")
        return content
    count = content.count(old)
    if count != 1:
        print(f"  FAIL  {label}: expected exactly 1 match, found {count}")
        print("        Your App.tsx may differ from what this patch expects")
        print("        (did patch_tfsom_frontend.py run successfully first?).")
        sys.exit(1)
    print(f"  OK    {label}")
    return content.replace(old, new, 1)


# 1. CasePacket type: add the gep_risk field.
content = apply(
    "CasePacket gep_risk type",
    old='''  tfsom_risk: {
    factors_assessed: number;
    factors_total: number;
    factors_present: string[];
    factor_count: number;
    risk_label: "Low" | "Moderate" | "High";
    risk_estimate: string;
    mnemonic: string;
  } | null;
};''',
    new='''  tfsom_risk: {
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
};''',
    content=content,
)

# 2. Case packet: insert the GEP metastatic-risk banner right after the
#    TFSOM banner.
content = apply(
    "case packet GEP risk banner",
    old='''              </Card>
            )}

            {/* Current measurement */}''',
    new='''              </Card>
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
                    : "border-l-[#2E3742]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <SectionHeader>Gene Expression Profile ({packet.gep_risk.test_name})</SectionHeader>
                    <p className="text-xs text-[#8B96A3] mt-1">{/^class/i.test(packet.gep_risk.gep_class) ? packet.gep_risk.gep_class : `Class ${packet.gep_risk.gep_class}`}</p>
                    {packet.gep_risk.chromosome_3_status && (
                      <p className="text-[10px] text-[#7C8794] mt-1">Chromosome 3: {packet.gep_risk.chromosome_3_status}</p>
                    )}
                  </div>
                  {packet.gep_risk.risk_label ? (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded shrink-0 ${
                        packet.gep_risk.risk_label === "High"
                          ? "bg-red-500/15 text-red-400"
                          : packet.gep_risk.risk_label === "Intermediate"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {packet.gep_risk.risk_label} metastatic risk
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded shrink-0 bg-[#161B22] text-[#8B96A3]">
                      Unrecognized class
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* Current measurement */}''',
    content=content,
)

# 3. Population view state: add gep_risk_label.
content = apply(
    "population view state type (gep_risk_label)",
    old='''      tfsom_risk_label: "Low" | "Moderate" | "High" | null;
    }[]
  >([]);''',
    new='''      tfsom_risk_label: "Low" | "Moderate" | "High" | null;
      gep_risk_label: "Low" | "Intermediate" | "High" | null;
    }[]
  >([]);''',
    content=content,
)

# 4. Population table row: add the GEP metastatic-risk flag.
content = apply(
    "population table GEP risk flag",
    old='''                        {(p.tfsom_risk_label === "Moderate" || p.tfsom_risk_label === "High") && (
                          <p className={`text-[10px] font-medium mt-0.5 ${p.tfsom_risk_label === "High" ? "text-red-400" : "text-amber-400"}`}>
                            ⚠ {p.tfsom_risk_label} growth risk (TFSOM)
                          </p>
                        )}
                      </td>''',
    new='''                        {(p.tfsom_risk_label === "Moderate" || p.tfsom_risk_label === "High") && (
                          <p className={`text-[10px] font-medium mt-0.5 ${p.tfsom_risk_label === "High" ? "text-red-400" : "text-amber-400"}`}>
                            ⚠ {p.tfsom_risk_label} growth risk (TFSOM)
                          </p>
                        )}
                        {/* A different axis from TFSOM above: this is an
                            already-diagnosed melanoma's metastatic risk,
                            not a nevus's risk of becoming one. */}
                        {(p.gep_risk_label === "Intermediate" || p.gep_risk_label === "High") && (
                          <p className={`text-[10px] font-medium mt-0.5 ${p.gep_risk_label === "High" ? "text-red-400" : "text-amber-400"}`}>
                            ⚠ {p.gep_risk_label} metastatic risk (GEP)
                          </p>
                        )}
                      </td>''',
    content=content,
)

if content == original:
    print("\nNothing changed (everything already applied?). App.tsx left untouched.")
    sys.exit(0)

with open(APP_TSX_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nDone — {APP_TSX_PATH} patched successfully.")
