"""
Small clean-up patch for src/App.tsx:

  * Results saved from the case screens were always labelled "Dr. A. Reyes".
    They now carry the name of whoever is signed in.
  * The "Primary Provider" box no longer suggests a real person's name.

Run from the frontend folder (the one with package.json):

    python3 patch_polish_frontend.py

Safe to run twice. Works before or after the two-step patch.
"""
import os
import sys

PATH = "src/App.tsx"
if not os.path.exists(PATH):
    print("FAIL  src/App.tsx not found. Run this from the folder that has package.json.")
    sys.exit(1)
src = open(PATH, encoding="utf-8").read()
if "signedInName" in src:
    print("  SKIP  already applied\n\nNothing changed.")
    sys.exit(0)

EDITS = [
    ("signed-in name holder", "let authToken: string | null = null;\n",
     "let authToken: string | null = null;\n// Name of whoever is signed in, used to label the results they save.\nlet signedInName = \"\";\n", 1),
    ("set name at sign-in", "          setLoggedInUser(user);\n",
     "          setLoggedInUser(user);\n          signedInName = user.name;\n", 1),
    ("clear name at sign-out", "  const handleLogout = () => {\n    authToken = null;\n",
     "  const handleLogout = () => {\n    authToken = null;\n    signedInName = \"\";\n", 1),
    ("saved-by label", 'source: "Dr. A. Reyes",', 'source: signedInName || "Clinician",', 2),
    ("provider placeholder", 'placeholder: "Dr. A. Reyes"', 'placeholder: "Provider name"', 1),
]
for name, old, new, n in EDITS:
    if src.count(old) != n:
        print("  FAIL  could not find: " + name + "\n        Your App.tsx differs from what this patch expects. Nothing was changed.")
        sys.exit(1)
for name, old, new, n in EDITS:
    src = src.replace(old, new)
    print("  OK    " + name)
open(PATH, "w", encoding="utf-8").write(src)
print("\nDone - src/App.tsx patched.")
