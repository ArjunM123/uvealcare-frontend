"""
Same goal as before — make uploaded images bigger and clickable, with a
full-size overlay — but rebuilt using flexible regex patterns instead
of exact-character string matching. The previous version failed
because it trusted subtle spacing seen in terminal-copied text that
turned out to be word-wrap display artifacts, not real file content.
Regex with \\s+ (flexible whitespace) between tokens avoids that
entire problem.

Safe to run more than once — checks whether the fix is already present.

Run with:  python3 make_images_visual_v2.py
"""

import re

PATH = "src/App.tsx"

with open(PATH, "r") as f:
    content = f.read()

changes_made = []

# ─── 1. Add enlarge-image state right after ImagingContent's signature ───
if "const [enlargedImage, setEnlargedImage] = useState" in content:
    print("  Enlarge-image state: already applied — skipping.")
else:
    pattern = re.compile(
        r'(function ImagingContent\(\{\s*onNav,\s*caseId\s*\}\s*:\s*\{\s*onNav:\s*\(s:\s*Screen,\s*caseId\?:\s*string\)\s*=>\s*void;\s*caseId:\s*string\s*\}\)\s*\{)'
    )
    new_content, n = pattern.subn(
        r'\1\n  // Which uploaded image (if any) is currently shown full-size in the\n'
        r'  // enlarge overlay — addresses real clinical feedback that a tiny\n'
        r'  // thumbnail and text description aren\'t enough to actually review an\n'
        r'  // image; clicking it now opens a large, genuinely readable view.\n'
        r'  const [enlargedImage, setEnlargedImage] = useState<{ fieldKey: string; label: string } | null>(null);\n',
        content,
        count=1,
    )
    if n == 1:
        content = new_content
        changes_made.append("Enlarge-image state")
        print("  Enlarge-image state: fixed.")
    else:
        print("  Enlarge-image state: could not find ImagingContent's signature — no changes made for this part.")

# ─── 2. Make the thumbnail bigger and clickable ───
if "setEnlargedImage({ fieldKey: s.key" in content:
    print("  Bigger, clickable thumbnail: already applied — skipping.")
else:
    pattern = re.compile(
        r'<AuthenticatedImage\s+caseId=\{caseId\}\s+fieldKey=\{s\.key\}\s+alt=\{`\$\{s\.field\} image`\}\s+className="[^"]*"\s*/>'
    )
    replacement = (
        '<button\n'
        '                      onClick={() => setEnlargedImage({ fieldKey: s.key, label: s.field })}\n'
        '                      className="block hover:opacity-80 hover:ring-2 hover:ring-[#0EA5E9] rounded transition-all"\n'
        '                      title="Click to view full size"\n'
        '                    >\n'
        '                      <AuthenticatedImage\n'
        '                        caseId={caseId}\n'
        '                        fieldKey={s.key}\n'
        '                        alt={`${s.field} image`}\n'
        '                        className="w-28 h-28 object-cover rounded border border-[#232A34]"\n'
        '                      />\n'
        '                    </button>'
    )
    new_content, n = pattern.subn(replacement, content, count=1)
    if n == 1:
        content = new_content
        changes_made.append("Bigger, clickable thumbnail")
        print("  Bigger, clickable thumbnail: fixed.")
    else:
        print(f"  Bigger, clickable thumbnail: found {n} matches, expected 1 — no changes made for this part.")

# ─── 3. Add the full-size overlay right before ImagingScreen starts ───
if 'Full-size image overlay' in content:
    print("  Full-size overlay: already applied — skipping.")
else:
    pattern = re.compile(
        r'\}\s*\n+(function ImagingScreen\(\{\s*onNav,\s*caseId\s*\}\s*:\s*\{\s*onNav:\s*\(s:\s*Screen,\s*caseId\?:\s*string\)\s*=>\s*void;\s*caseId:\s*string\s*\}\)\s*\{)'
    )
    overlay = '''
      {/* Full-size image overlay — real clinical feedback was that a
          tiny thumbnail and a text description aren't enough to
          actually review an image. Click any thumbnail above to open
          it here, large enough to genuinely read. */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">{enlargedImage.label}</p>
              <button
                onClick={() => setEnlargedImage(null)}
                className="text-white/70 hover:text-white text-sm border border-white/30 rounded px-3 py-1"
              >
                Close \u2715
              </button>
            </div>
            <AuthenticatedImage
              caseId={caseId}
              fieldKey={enlargedImage.fieldKey}
              alt={enlargedImage.label}
              className="max-w-full max-h-[80vh] object-contain rounded border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}

'''
    new_content, n = pattern.subn(lambda m: overlay + m.group(1), content, count=1)
    if n == 1:
        content = new_content
        changes_made.append("Full-size overlay")
        print("  Full-size overlay: fixed.")
    else:
        print(f"  Full-size overlay: found {n} matches, expected 1 — no changes made for this part.")

with open(PATH, "w") as f:
    f.write(content)

print("Done.")
