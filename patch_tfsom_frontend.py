"""
Patches App.tsx in place to add TFSOM-UHHD risk scoring to the frontend,
since the updated App.tsx itself couldn't be delivered as a file this
session.

Run this from inside your uvealcare-frontend repo folder, in the same
folder as App.tsx (usually src/App.tsx — cd there first, or edit the
APP_TSX_PATH line below):

    python3 patch_tfsom_frontend.py

Safe to run only once; running it twice will fail cleanly (it checks
each change isn't already applied).
"""
import sys
import os

APP_TSX_PATH = "App.tsx"
if not os.path.exists(APP_TSX_PATH) and os.path.exists("src/App.tsx"):
    APP_TSX_PATH = "src/App.tsx"

with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

original = content


def apply_one(label, old, new, content):
    if new in content:
        print(f"  SKIP  {label} (already applied)")
        return content
    count = content.count(old)
    if count != 1:
        print(f"  FAIL  {label}: expected exactly 1 match, found {count}")
        print("        Your App.tsx may differ from what this patch expects.")
        sys.exit(1)
    print(f"  OK    {label}")
    return content.replace(old, new, 1)


def apply_all(label, old, new, expected_count, content):
    if new in content:
        print(f"  SKIP  {label} (already applied)")
        return content
    count = content.count(old)
    if count != expected_count:
        print(f"  FAIL  {label}: expected {expected_count} matches, found {count}")
        print("        Your App.tsx may differ from what this patch expects.")
        sys.exit(1)
    print(f"  OK    {label} ({count} occurrences)")
    return content.replace(old, new)


# 1. The checklist item type appears 3 times (readiness screen, tumor
#    board screen, tumor board decision screen) — all the same shape, so
#    data_type is added to all three at once.
content = apply_all(
    "checklist item type (data_type)",
    old='    checklist: { key: string; field: string; category: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null; basal_diameter_mm?: number | null; apical_height_mm?: number | null; required?: boolean }[];',
    new='    checklist: { key: string; field: string; category: string; data_type?: string; status: string; value: string | null; source: string | null; measurement_method?: string | null; measurement_precision?: string | null; measurement_length_type?: string | null; basal_diameter_mm?: number | null; apical_height_mm?: number | null; required?: boolean }[];',
    expected_count=3,
    content=content,
)

# 2. CasePacket type: add data_type to its checklist field too.
content = apply_one(
    "CasePacket checklist type (data_type)",
    old='  checklist: { key: string; field: string; category: string; status: string; required: boolean; value: string | null; source: string | null }[];',
    new='  checklist: { key: string; field: string; category: string; data_type?: string; status: string; required: boolean; value: string | null; source: string | null }[];',
    content=content,
)

# 3. CasePacket type: add the tfsom_risk field.
content = apply_one(
    "CasePacket tfsom_risk type",
    old='  key_images: { field_key: string; field_label: string; image_id: string; filename: string; total_in_study: number }[];\n};',
    new=(
        '  key_images: { field_key: string; field_label: string; image_id: string; filename: string; total_in_study: number }[];\n'
        '  tfsom_risk: {\n'
        '    factors_assessed: number;\n'
        '    factors_total: number;\n'
        '    factors_present: string[];\n'
        '    factor_count: number;\n'
        '    risk_label: "Low" | "Moderate" | "High";\n'
        '    risk_estimate: string;\n'
        '    mnemonic: string;\n'
        '  } | null;\n'
        '};'
    ),
    content=content,
)

# 4. Resolve form: boolean fields (the TFSOM factors) get Present/Absent
#    toggle buttons instead of a free-text box.
content = apply_one(
    "boolean Present/Absent toggle in resolve form",
    old='''                        {resolveStatus !== "missing" && (
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
                        )}''',
    new='''                        {/* Boolean fields (currently just the TFSOM-UHHD
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
                                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                                  : "border-[#2E3742] text-[#8B96A3] hover:bg-[#161B22]"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => setResolveValue("false")}
                              className={`flex-1 text-xs font-medium px-3 py-2 rounded border transition-colors ${
                                resolveValue === "false"
                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                  : "border-[#2E3742] text-[#8B96A3] hover:bg-[#161B22]"
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
                            className="w-full border border-[#2E3742] rounded px-2.5 py-2 text-xs focus:outline-none focus:border-[#0EA5E9] resize-none"
                          />
                        )}''',
    content=content,
)

# 5. Checklist row: show "Present"/"Absent" instead of raw "true"/"false".
content = apply_one(
    "checklist row Present/Absent display",
    old='''                        {item.status === "complete" && item.value && (
                          <p className="text-xs text-[#8B96A3] mt-1 leading-relaxed">{item.value}</p>
                        )}''',
    new='''                        {item.status === "complete" && item.value && (
                          <p className="text-xs text-[#8B96A3] mt-1 leading-relaxed">
                            {item.data_type === "boolean" ? (item.value === "true" ? "Present" : "Absent") : item.value}
                          </p>
                        )}''',
    content=content,
)

# 6. Case packet's full-checklist table: same Present/Absent fix.
content = apply_one(
    "case packet table Present/Absent display",
    old='                        {c.value && <p className="text-[10px] text-[#8291A3]">{c.value}</p>}',
    new='''                        {c.value && (
                          <p className="text-[10px] text-[#8291A3]">
                            {c.data_type === "boolean" ? (c.value === "true" ? "Present" : "Absent") : c.value}
                          </p>
                        )}''',
    content=content,
)

# 7. Case packet: insert the TFSOM-UHHD growth-risk banner card.
content = apply_one(
    "case packet TFSOM risk banner",
    old='''            {/* Current measurement */}
            <Card className="p-5">
              <SectionHeader>Current Measurement</SectionHeader>''',
    new='''            {/* TFSOM-UHHD growth-risk score — only shown once at least one
                of the 8 factors has actually been assessed, so a case
                that hasn't had risk-factor documentation started yet
                doesn't show a misleading "Low risk" badge. */}
            {packet.tfsom_risk && (
              <Card
                className={`p-5 border-l-4 ${

            {/* Current measurement */}
            <Card className="p-5">
              <SectionHeader>Current Measurement</SectionHeader>''',
    content=content,
)

# 8. Population view state: add tfsom_risk_label.
content = apply_one(
    "population view state type (tfsom_risk_label)",
    old='''      follow_up_date: string | null;
      surveillance_protocol: string | null;
    }[]
  >([]);''',
    new='''      follow_up_date: string | null;
      surveillance_protocol: string | null;
      tfsom_risk_label: "Low" | "Moderate" | "High" | null;
    }[]
  >([]);''',
    content=content,
)

# 9. Population table row: show the growth-risk flag under the diagnosis.
content = apply_one(
    "population table risk flag",
    old='''                      <td className="px-4 py-3">
                        <p className="text-[#E7ECF2] text-sm font-medium">{p.patient_name}</p>
                        <p className="text-[#7C8794] text-[10px]">{p.diagnosis}</p>
                      </td>''',
    new='''                      <td className="px-4 py-3">
                        <p className="text-[#E7ECF2] text-sm font-medium">{p.patient_name}</p>
                        <p className="text-[#7C8794] text-[10px]">{p.diagnosis}</p>
                        {/* Flags which nevi are trending toward melanoma
                            across the WHOLE population at a glance — the
                            kind of disease-specific signal a generic EHR
                            patient list has no way to surface. */}
                        {(p.tfsom_risk_label === "Moderate" || p.tfsom_risk_label === "High") && (
                          <p className={`text-[10px] font-medium mt-0.5 ${p.tfsom_risk_label === "High" ? "text-red-400" : "text-amber-400"}`}>
                            ⚠ {p.tfsom_risk_label} growth risk (TFSOM)
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
