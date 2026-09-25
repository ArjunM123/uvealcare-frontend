"""
Adds a neutral "optional" status to StatusBadge, and updates both
places it's used in the checklist to show it for fields that aren't
required for readiness (like the new treatment/follow-up fields) —
instead of the same alarming red "Missing" badge a genuinely required,
incomplete field gets.

Safe to run more than once — checks whether the fix is already present.

Run with:  python3 fix_optional_field_badges.py
"""

PATH = "src/App.tsx"

STATUSBADGE_OLD = '''function StatusBadge({ status }: { status: "complete" | "missing" | "pending" | "warning" |"active" }) {
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
}'''

STATUSBADGE_NEW = '''function StatusBadge({ status }: { status: "complete" | "missing" | "pending" | "warning" | "active" | "optional" }) {
  const map = {
    complete: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    missing: "bg-red-500/10 text-red-300 border-red-500/30",
    pending: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    warning: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    active: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    // Neutral, non-alarming — for fields that are tracked but were
    // never supposed to count against (or look like they're blocking)
    // readiness, like Date of Surgery on a not-yet-treated patient.
    optional: "bg-[#161B22] text-[#8291A3] border-[#232A34]",
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}'''

MOLECULAR_OLD = '''                          <p className="text-xs text-[#8B96A3]">{item.source ?? "Not yet ordered"}</p>
                        </div>
                        <StatusBadge status={item.status as any} />'''

MOLECULAR_NEW = '''                          <p className="text-xs text-[#8B96A3]">{item.source ?? "Not yet ordered"}</p>
                        </div>
                        <StatusBadge status={item.required === false && item.status !== "complete" ? "optional" : item.status as any} />'''

CHECKLIST_OLD = '''                      </div>
                      <StatusBadge status={item.status as any} />
                      {resolveFormKey !== item.key && confirmingDeleteKey !== item.key && ('''

CHECKLIST_NEW = '''                      </div>
                      <StatusBadge status={item.required === false && item.status !== "complete" ? "optional" : item.status as any} />
                      {resolveFormKey !== item.key && confirmingDeleteKey !== item.key && ('''


def apply_fix(content, old, new, label):
    if new in content:
        print(f"  {label}: already applied — skipping.")
        return content
    count = content.count(old)
    if count == 0:
        print(f"  {label}: could not find the expected code — no changes made for this part.")
        return content
    if count > 1:
        print(f"  {label}: found {count} matches, expected exactly 1 — refusing to guess. No changes made for this part.")
        return content
    print(f"  {label}: fixed.")
    return content.replace(old, new)


def run():
    with open(PATH, "r") as f:
        content = f.read()

    content = apply_fix(content, STATUSBADGE_OLD, STATUSBADGE_NEW, "StatusBadge component")
    content = apply_fix(content, MOLECULAR_OLD, MOLECULAR_NEW, "Molecular tab badge")
    content = apply_fix(content, CHECKLIST_OLD, CHECKLIST_NEW, "Main checklist badge")

    with open(PATH, "w") as f:
        f.write(content)
    print("Done.")


if __name__ == "__main__":
    run()
