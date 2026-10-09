"""
GEP (DecisionDx-UM) metastatic-risk tracking for the frontend, for an
App.tsx that has ALREADY been through restyle_frontend.py.

Run from your uvealcare-frontend folder:

    python3 patch_gep_after_restyle.py

Requires the TFSOM patch (already in your App.tsx). Safe to run twice.
Fails without changing anything if an anchor is not found.
"""
import os
import sys

APP = "src/App.tsx" if os.path.exists("src/App.tsx") else "App.tsx"
src = open(APP, encoding="utf-8").read()
orig = src


def apply(label, old, new):
    global src
    if new in src:
        print("  SKIP  " + label + " (already applied)")
        return
    n = src.count(old)
    if n != 1:
        print("  FAIL  " + label + ": expected 1 match, found " + str(n))
        print("        App.tsx differs from what this patch expects.")
        sys.exit(1)
    src = src.replace(old, new, 1)
    print("  OK    " + label)


apply("population state type", '      tfsom_risk_label: "Low" | "Moderate" | "High" | null;\n    }[]', '      tfsom_risk_label: "Low" | "Moderate" | "High" | null;\n      gep_risk_label: "Low" | "Intermediate" | "High" | null;\n    }[]')
apply("population row GEP flag", '                            {p.tfsom_risk_label} growth risk (TFSOM)\n                          </p>\n                        )}\n', '                            {p.tfsom_risk_label} growth risk (TFSOM)\n                          </p>\n                        )}\n                        {/* A different axis from TFSOM above: this is an\n                            already-diagnosed melanoma\'s metastatic risk,\n                            not a nevus\'s risk of becoming one. */}\n                        {(p.gep_risk_label === "Intermediate" || p.gep_risk_label === "High") && (\n                          <p className={`text-[11px] font-medium mt-0.5 ${p.gep_risk_label === "High" ? "text-red-700" : "text-amber-700"}`}>\n                            {p.gep_risk_label} metastatic risk (GEP)\n                          </p>\n                        )}\n')
apply("CasePacket gep_risk type", '    risk_estimate: string;\n    mnemonic: string;\n  } | null;\n};', '    risk_estimate: string;\n    mnemonic: string;\n  } | null;\n  gep_risk: {\n    gep_class: string;\n    risk_label: "Low" | "Intermediate" | "High" | null;\n    chromosome_3_status: string | null;\n    test_name: string;\n  } | null;\n};')
apply("case packet GEP banner", '{/* Current measurement */}', '{/* GEP (DecisionDx-UM) metastatic-risk result — a DIFFERENT\n                axis from TFSOM above: TFSOM estimates a nevus\'s risk of\n                becoming melanoma in the first place, this estimates an\n                already-diagnosed melanoma\'s risk of spreading. Only\n                shown once a result has actually been recorded. */}\n            {packet.gep_risk && (\n              <Card\n                className={`p-5 border-l-4 ${\n                  packet.gep_risk.risk_label === "High"\n                    ? "border-l-red-500"\n                    : packet.gep_risk.risk_label === "Intermediate"\n                    ? "border-l-amber-500"\n                    : packet.gep_risk.risk_label === "Low"\n                    ? "border-l-emerald-500"\n                    : "border-l-[#C4CCD6]"\n                }`}\n              >\n                <div className="flex items-start justify-between">\n                  <div>\n                    <SectionHeader>Gene Expression Profile ({packet.gep_risk.test_name})</SectionHeader>\n                    <p className="text-xs text-[#5B6877] mt-1">{/^class/i.test(packet.gep_risk.gep_class) ? packet.gep_risk.gep_class : `Class ${packet.gep_risk.gep_class}`}</p>\n                    {packet.gep_risk.chromosome_3_status && (\n                      <p className="text-[11px] text-[#6B7785] mt-1">Chromosome 3: {packet.gep_risk.chromosome_3_status}</p>\n                    )}\n                  </div>\n                  {packet.gep_risk.risk_label ? (\n                    <span\n                      className={`text-xs font-semibold px-2.5 py-1 rounded shrink-0 ${\n                        packet.gep_risk.risk_label === "High"\n                          ? "bg-red-50 text-red-700"\n                          : packet.gep_risk.risk_label === "Intermediate"\n                          ? "bg-amber-50 text-amber-700"\n                          : "bg-emerald-50 text-emerald-700"\n                      }`}\n                    >\n                      {packet.gep_risk.risk_label} metastatic risk\n                    </span>\n                  ) : (\n                    <span className="text-xs font-medium px-2.5 py-1 rounded shrink-0 bg-[#F6F8FA] text-[#5B6877]">\n                      Unrecognized class\n                    </span>\n                  )}\n                </div>\n              </Card>\n            )}\n\n            {/* Current measurement */}')

if src == orig:
    print("Nothing changed.")
    sys.exit(0)
open(APP, "w", encoding="utf-8").write(src)
print("Done - " + APP + " patched.")
