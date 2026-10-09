"""
Replaces the full-screen image viewer with a clinical one:

  * zoom: toolbar buttons, + / - keys, Ctrl/Cmd + scroll or trackpad
    pinch (zooms toward the cursor), double-click to zoom in and out
  * pan: click and drag when zoomed in
  * Fit and 1:1 (true pixel size) buttons
  * brightness and contrast sliders, invert, rotate (display only; the
    stored image is never changed)
  * cine play / pause for stacks (Space key)
  * download the original image file
  * plain scroll, arrow keys, Home / End and the slider still move
    through the slices, exactly as before

Run from your uvealcare-frontend folder:

    python3 patch_viewer_frontend.py

Safe to run twice. Fails without changing anything if the viewer code is
not where it expects.
"""
import os
import sys

APP = "src/App.tsx" if os.path.exists("src/App.tsx") else "App.tsx"
src = open(APP, encoding="utf-8").read()

MARK = "// uvealcare: image viewer v2"
if MARK in src:
    print("Already applied - nothing to do.")
    sys.exit(0)

START = "function SeriesViewer({ caseId, label, images, startIndex, onClose, onDeleteImage }: {"
END = "function ImagingContent("
for label, m in (("viewer start", START), ("viewer end", END)):
    n = src.count(m)
    if n != 1:
        print("FAIL  " + label + ": expected 1 match, found " + str(n))
        print("      App.tsx differs from what this patch expects.")
        sys.exit(1)
a = src.index(START)
b = src.index(END)
if b < a:
    print("FAIL  viewer markers are out of order")
    sys.exit(1)

NEW = r'''function SeriesViewer({ caseId, label, images, startIndex, onClose, onDeleteImage }: {
  caseId: string;
  label: string;
  images: StudyImage[];
  startIndex: number;
  onClose: () => void;
  onDeleteImage: (imageId: string) => Promise<void>;
}) {
  // uvealcare: image viewer v2
  const total = images.length;
  const [index, setIndex] = useState(startIndex);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrls = useRef<Record<string, string>>({});
  const requested = useRef<Set<string>>(new Set());
  const alive = useRef(true);
  const wheelAccum = useRef(0);

  // Display-only view settings. None of these touch the stored image.
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [inverted, setInverted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const viewRef = useRef({ scale: 1, pan: { x: 0, y: 0 } });
  viewRef.current = { scale, pan };

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 16;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const viewChanged = scale !== 1 || rotation !== 0 || brightness !== 100 || contrast !== 100 || inverted;

  // Zoom toward a point on screen (the cursor), so whatever you are
  // pointing at stays under the cursor instead of sliding away.
  const zoomAt = (nextScale: number, clientX?: number, clientY?: number) => {
    const s0 = viewRef.current.scale;
    const s = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    const t = viewRef.current.pan;
    let px = 0;
    let py = 0;
    const el = stageRef.current;
    if (el && clientX !== undefined && clientY !== undefined) {
      const r = el.getBoundingClientRect();
      px = clientX - (r.left + r.width / 2);
      py = clientY - (r.top + r.height / 2);
    }
    const k = s / s0;
    setScale(s);
    setPan(s <= 1 ? { x: 0, y: 0 } : { x: px - (px - t.x) * k, y: py - (py - t.y) * k });
  };
  const zoomBy = (factor: number) => zoomAt(viewRef.current.scale * factor);
  const fitView = () => { setScale(1); setPan({ x: 0, y: 0 }); };
  // A sideways (90 / 270 degree) image is tall instead of wide, so it is
  // shrunk just enough to stay inside the viewing area.
  const rotationFit = () => {
    const img = imgRef.current;
    const stage = stageRef.current;
    if (rotation % 180 === 0 || !img || !stage || !img.clientWidth || !img.clientHeight) return 1;
    return Math.min(1, stage.clientHeight / img.clientWidth, stage.clientWidth / img.clientHeight);
  };
  const actualPixels = () => {
    const img = imgRef.current;
    if (!img || !img.clientWidth || !img.naturalWidth) return;
    setPan({ x: 0, y: 0 });
    setScale(clamp(img.naturalWidth / img.clientWidth / rotationFit(), MIN_SCALE, MAX_SCALE));
  };
  const resetView = () => {
    fitView();
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setInverted(false);
  };

  // After a delete the list shrinks — never point past its end.
  const current = Math.max(0, Math.min(index, total - 1));
  const shown = images[current];

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      Object.values(objectUrls.current).forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const load = (id: string) => {
    if (requested.current.has(id)) return;
    requested.current.add(id);
    apiFetch(`${API_BASE}/cases/${caseId}/images/by-id/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Couldn't load image");
        return res.blob();
      })
      .then((blob) => {
        if (!alive.current) return;
        const url = URL.createObjectURL(blob);
        objectUrls.current[id] = url;
        setUrls((prev) => ({ ...prev, [id]: url }));
        setFailed((prev) => ({ ...prev, [id]: false }));
      })
      .catch(() => {
        requested.current.delete(id); // allow a retry the next time this slice is visited
        if (alive.current) setFailed((prev) => ({ ...prev, [id]: true }));
      });
  };

  // The slice on screen first, then the ones around it (further ahead
  // while playing, so the loop does not stall).
  const idKey = images.map((i) => i.id).join(",");
  useEffect(() => {
    const ahead = playing ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2];
    [0, ...ahead, -1].forEach((d) => {
      const im = images[current + d];
      if (im) load(im.id);
    });
  }, [current, idKey, playing]);

  // If the last image in the study was deleted, there's nothing left to view.
  useEffect(() => {
    if (total === 0) onClose();
  }, [total]);

  // Cine loop. It only advances when the next slice is already loaded, so
  // a slow connection pauses on the right slice instead of showing a
  // different one.
  useEffect(() => {
    if (!playing || total < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => {
        const cur = Math.max(0, Math.min(i, total - 1));
        const next = cur + 1 >= total ? 0 : cur + 1;
        return objectUrls.current[images[next].id] ? next : cur;
      });
    }, 125);
    return () => window.clearInterval(timer);
  }, [playing, total, idKey]);

  const goTo = (i: number) => {
    setConfirmingDelete(false);
    setDeleteError(null);
    setIndex(Math.max(0, Math.min(total - 1, i)));
  };
  const go = (delta: number) => goTo(current + delta);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      const tag = (e.target as HTMLElement | null)?.tagName;
      const inSlider = tag === "INPUT"; // a focused slider keeps its own arrow / Home / End keys
      if (!inSlider && (e.key === "ArrowRight" || e.key === "ArrowDown")) { e.preventDefault(); go(1); }
      else if (!inSlider && (e.key === "ArrowLeft" || e.key === "ArrowUp")) { e.preventDefault(); go(-1); }
      else if (!inSlider && e.key === "Home") { e.preventDefault(); goTo(0); }
      else if (!inSlider && e.key === "End") { e.preventDefault(); goTo(total - 1); }
      else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomBy(1.25); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomBy(0.8); }
      else if (e.key === "0") { e.preventDefault(); fitView(); }
      else if (e.key === "i" || e.key === "I") { e.preventDefault(); setInverted((v) => !v); }
      else if (e.key === "r" || e.key === "R") { e.preventDefault(); setRotation((r) => (r + 90) % 360); }
      else if (e.key === " " && tag !== "BUTTON" && tag !== "A" && !inSlider) { e.preventDefault(); if (total > 1) setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, total, onClose]);

  // Plain scroll steps through the slices. Ctrl/Cmd + scroll, or a
  // trackpad pinch (browsers report a pinch as Ctrl + scroll), zooms
  // toward the cursor. Attached natively (not as a React prop) so it can
  // stop the page behind the viewer from scrolling or zooming too.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-clamp(e.deltaY, -50, 50) * 0.004);
        zoomAt(viewRef.current.scale * factor, e.clientX, e.clientY);
        return;
      }
      wheelAccum.current += e.deltaY;
      if (Math.abs(wheelAccum.current) >= 60) {
        go(wheelAccum.current > 0 ? 1 : -1);
        wheelAccum.current = 0;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [current, total]);

  if (total === 0 || !shown) return null;

  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteImage(shown.id);
    } catch {
      setDeleteError("Couldn't delete that image. Please try again.");
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || viewRef.current.scale <= 1.01) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    setPan({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) });
  };
  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const src = urls[shown.id];
  const toolBtn = "text-xs text-white/80 hover:text-white border border-white/25 hover:bg-white/10 rounded px-2.5 py-1 transition-colors";
  const toolBtnOn = "text-xs text-white border border-white/70 bg-white/15 rounded px-2.5 py-1 transition-colors";

  return (
    <div ref={rootRef} className="fixed inset-0 bg-black z-50 flex flex-col" role="dialog" aria-label={`${label} images`}>
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-white/10 shrink-0">
        <div className="min-w-0">
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-white/60 text-xs truncate">{shown.filename}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-white/80 text-sm tabular-nums">{current + 1} / {total}</span>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-sm border border-white/30 rounded px-3 py-1"
          >
            Close
          </button>
        </div>
      </div>

      {/* Tools */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-2 border-b border-white/10 shrink-0" aria-label="Image tools">
        <div className="flex items-center gap-1.5">
          <button onClick={() => zoomBy(0.8)} aria-label="Zoom out" className={toolBtn}>−</button>
          <span className="text-white/80 text-xs tabular-nums w-14 text-center" aria-live="polite">{`×${scale.toFixed(1)}`}</span>
          <button onClick={() => zoomBy(1.25)} aria-label="Zoom in" className={toolBtn}>+</button>
          <button onClick={fitView} className={toolBtn}>Fit</button>
          <button onClick={actualPixels} className={toolBtn} title="True pixel size">1:1</button>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setRotation((r) => (r + 90) % 360)} className={toolBtn} title="Rotate 90° (R)">Rotate</button>
          <button onClick={() => setInverted((v) => !v)} className={inverted ? toolBtnOn : toolBtn} aria-pressed={inverted} title="Invert (I)">Invert</button>
        </div>
        <label className="flex items-center gap-2 text-xs text-white/70">
          Brightness
          <input type="range" min={40} max={200} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} aria-label="Brightness" className="w-24 accent-[#0B63B6]" />
        </label>
        <label className="flex items-center gap-2 text-xs text-white/70">
          Contrast
          <input type="range" min={40} max={250} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} aria-label="Contrast" className="w-24 accent-[#0B63B6]" />
        </label>
        {viewChanged && (
          <button onClick={resetView} className={toolBtn}>Reset view</button>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          {total > 1 && (
            <button onClick={() => setPlaying((p) => !p)} className={playing ? toolBtnOn : toolBtn} aria-pressed={playing} title="Play through the stack (Space)">
              {playing ? "Pause" : "Play"}
            </button>
          )}
          {src && (
            <a href={src} download={shown.filename} className={toolBtn} title="Download the original image">Download</a>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center gap-4 px-4 py-4 overflow-hidden">
        <button
          onClick={() => go(-1)}
          disabled={current === 0}
          aria-label="Previous image"
          className="w-10 h-10 shrink-0 rounded-full border border-white/30 text-white text-lg hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
        >
          ‹
        </button>
        <div
          ref={stageRef}
          className="flex-1 min-w-0 self-stretch flex items-center justify-center overflow-hidden relative touch-none"
          style={{ cursor: scale > 1.01 ? (dragging ? "grabbing" : "grab") : "default" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={(e) => (scale > 1.01 ? fitView() : zoomAt(2.5, e.clientX, e.clientY))}
        >
          {src ? (
            <img
              ref={imgRef}
              src={src}
              alt={`${label} — image ${current + 1} of ${total}`}
              draggable={false}
              className="max-w-full object-contain select-none"
              style={{
                maxHeight: "calc(100vh - 290px)",
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale * rotationFit()}) rotate(${rotation}deg)`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) invert(${inverted ? 1 : 0})`,
                imageRendering: scale >= 3 ? "pixelated" : "auto",
                transition: dragging ? "none" : "transform 60ms linear",
              }}
            />
          ) : failed[shown.id] ? (
            <p className="text-red-300 text-sm">Unable to load this image.</p>
          ) : (
            <p className="text-white/60 text-sm">Loading…</p>
          )}
        </div>
        <button
          onClick={() => go(1)}
          disabled={current === total - 1}
          aria-label="Next image"
          className="w-10 h-10 shrink-0 rounded-full border border-white/30 text-white text-lg hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
        >
          ›
        </button>
      </div>

      <div className="shrink-0 border-t border-white/10 px-6 py-3 space-y-2">
        {total > 1 && (
          <input
            type="range"
            min={0}
            max={total - 1}
            value={current}
            onChange={(e) => goTo(Number(e.target.value))}
            aria-label="Scrub through images"
            className="w-full accent-[#0B63B6]"
          />
        )}
        <div className="flex items-center justify-between gap-4">
          <p className="text-white/50 text-xs">
            Scroll or use the arrow keys to move through images. Ctrl/Cmd + scroll or pinch to zoom, drag to pan, double-click to zoom. Space plays. Esc closes.
          </p>
          {confirmingDelete ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-white/80">Delete image {current + 1} of {total}?</span>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="text-xs font-medium text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-xs text-white/70 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setPlaying(false); setConfirmingDelete(true); }}
              className="text-xs text-red-300 hover:underline shrink-0"
            >
              Delete this image
            </button>
          )}
        </div>
        {deleteError && <p className="text-xs text-red-300">{deleteError}</p>}
      </div>
    </div>
  );
}

'''
src = src[:a] + NEW + src[b:]
open(APP, "w", encoding="utf-8").write(src)
print("OK    image viewer replaced")
print("Done - " + APP + " patched.")
