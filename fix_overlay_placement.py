"""
Fixes the actual bug: the previous patch placed the full-size image
overlay AFTER ImagingContent's closing "}", putting it completely
outside the function — which is invalid syntax, since JSX like
{enlargedImage && (...)} can only exist inside a component's return
statement.

This script finds that broken shape and reorders it correctly: the
overlay code moves to before the function's real closing, right after
the measurements Card.

Safe to run more than once — checks whether the fix is already applied.

Run with:  python3 fix_overlay_placement.py
"""

import re

PATH = "src/App.tsx"

with open(PATH, "r") as f:
    content = f.read()

pattern = re.compile(
    r'(</Card>\s*\n)\s*</div>\s*\n\s*\);\s*\n\}\s*\n+(\s*\{/\* Full-size image overlay.*?\n\s*\)\}\s*\n)\s*</div>\s*\n\s*\);\s*\n\}',
    re.DOTALL
)

if not pattern.search(content):
    if "Full-size image overlay" in content:
        print("Could not find the broken pattern, but the overlay code exists.")
        print("This likely means it's already fixed. No changes made.")
    else:
        print("Could not find the overlay code at all. No changes made.")
else:
    replacement = r'\1\n\2    </div>\n  );\n}'
    new_content, n = pattern.subn(replacement, content, count=1)
    with open(PATH, "w") as f:
        f.write(new_content)
    print(f"Fixed — moved the overlay code inside the function, before its closing brace. ({n} match)")
