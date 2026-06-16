import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TILE } from "../game/pixels";
import { MAP_W, MAP_H, BUILDINGS, START, KIWIS, isSolid, interactAt } from "../game/map";
import { buildWorld } from "../game/tiles";
import { buildInteriorArt } from "../game/interiorTiles";
import { buildCampusArt, drawPortalFx } from "../game/campusTiles";
import { getInteriors } from "../game/interiors";
import { buildPlayerFrames, buildCharacterFrames, buildKiwiFrames, NPC_PALS, SPRITE_W, SPRITE_H } from "../game/sprites";
import { WELCOME, PANEL_INTROS, DIALOGS, CHOICES } from "../game/dialogues";
import SectionPanel from "../game/SectionPanel";
import "../game/village.css";

const VIEW_W = MAP_W * TILE; // 384
const VIEW_H = MAP_H * TILE; // 320
const WALK_SPEED = 4.2; // tiles per second
const FADE_MS = 280;
const DIR_VECTORS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPPOSITE_DIR = { up: "down", down: "up", left: "right", right: "left" };
const NPC_WALK_SPEED = 2.4; // tiles per second — a stroll, slower than the player
const KIWI_WALK_SPEED = 1.6; // a snuffling forage, slower still
const KIWI_ROAM = 2; // tiles from home, Chebyshev

// An NPC occupies its tile and, mid-step, its target tile.
const npcAt = (room, x, y) =>
  room.npcs.find((n) => (n.x === x && n.y === y) || (n.moving && n.tx === x && n.ty === y));
const kiwiAt = (kiwis, x, y) =>
  kiwis.find((k) => (k.x === x && k.y === y) || (k.moving && k.tx === x && k.ty === y));
const KEY_DIRS = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
};

// An experimental, fully playable GBA-style village. Every building can be
// entered; inside, each resume entry is a villager you can talk to. All pixel
// art is generated in src/game/.
export default function Village() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Mutable game state, owned by the rAF loop (not React).
  const playerRef = useRef({ x: START.x, y: START.y, tx: START.x, ty: START.y, dir: START.dir, moving: false, progress: 0, animClock: 0 });
  const keysRef = useRef(new Set());
  const modeRef = useRef("dialog"); // 'play' | 'dialog' | 'panel' | 'fade'
  const cooldownRef = useRef(0);
  const sceneIdRef = useRef("village"); // 'village' | interior id
  const interiorsRef = useRef(null); // room logic, built on mount
  // Stack of return points — one per nested scene, so village → school house →
  // campus pops back the way it came. Each entry: { scene, x, y, dir }.
  const returnStackRef = useRef([]);
  const visitedRef = useRef(new Set()); // interiors that showed their intro line
  const kiwisRef = useRef(
    KIWIS.map((k) => ({
      x: k.x, y: k.y, tx: k.x, ty: k.y, home: { x: k.x, y: k.y },
      dir: k.dir, moving: false, progress: 0, timer: Math.random() * 2, animClock: 0,
    })),
  );

  // UI state (dialog box, panel, scene fade) — owned by React.
  const [dialog, setDialog] = useState(null); // {pages, index, choice?, panelAfter?}
  const [typed, setTyped] = useState(0);
  const [choiceSel, setChoiceSel] = useState(0);
  const [panel, setPanel] = useState(null);
  const [fade, setFade] = useState(false);
  const [scale, setScale] = useState(1);

  modeRef.current = panel ? "panel" : dialog ? "dialog" : fade ? "fade" : "play";

  const openDialog = (pages, extra = {}) => {
    cooldownRef.current = Infinity;
    setChoiceSel(0);
    setDialog({ pages, index: 0, ...extra });
  };

  const closeDialog = (cancelled = false) => {
    // Cancelling the village exit prompt nudges the player back off the tile.
    if (cancelled && dialog?.choice?.cancelNudge) {
      const p = playerRef.current;
      p.y = p.ty = MAP_H - 2;
      p.dir = "up";
    }
    setDialog(null);
    cooldownRef.current = performance.now() + 400;
  };

  // Fade to black, swap scenes, fade back in.
  const changeScene = (id, pos) => {
    cooldownRef.current = Infinity;
    setFade(true);
    setTimeout(() => {
      sceneIdRef.current = id;
      const p = playerRef.current;
      p.x = p.tx = pos.x;
      p.y = p.ty = pos.y;
      p.dir = pos.dir;
      p.moving = false;
      p.progress = 0;
      setFade(false);
      cooldownRef.current = performance.now() + 350;
      // Campuses replay their arrival card on every visit; buildings show their
      // intro line just once per session.
      const room = id !== "village" ? interiorsRef.current[id] : null;
      const isCampus = room?.kind === "campus";
      if (room && PANEL_INTROS[id] && (isCampus || !visitedRef.current.has(id))) {
        visitedRef.current.add(id);
        openDialog(PANEL_INTROS[id]);
      }
    }, FADE_MS);
  };

  const trigger = (action) => {
    // Direction-gated triggers (exit mats, the village exit) only fire when
    // the player is facing that way — walking across them sideways is safe.
    if (action.dir && playerRef.current.dir !== action.dir) return;
    if (action.type === "panel") openDialog(action.pages || PANEL_INTROS[action.id], { panelAfter: action.id });
    else if (action.type === "dialog") openDialog(action.pages || DIALOGS[action.id]);
    else if (action.type === "npc") {
      if (action.npc) action.npc.dir = OPPOSITE_DIR[playerRef.current.dir]; // face the player
      openDialog(action.pages, action.choice ? { choice: action.choice } : {});
    }
    else if (action.type === "kiwi") {
      // Side-view sprite only — face the player when there's a horizontal gap.
      const p = playerRef.current;
      if (p.x !== action.kiwi.x) action.kiwi.dir = p.x < action.kiwi.x ? "left" : "right";
      openDialog(DIALOGS.kiwi);
    }
    else if (action.type === "choice") {
      const c = CHOICES[action.id];
      openDialog(c.pages, { choice: c.choice });
    } else if (action.type === "enter") {
      const building = BUILDINGS.find((b) => b.id === action.id);
      returnStackRef.current.push({ scene: "village", x: building.door.x, y: building.door.y + 1, dir: "down" });
      changeScene(action.id, interiorsRef.current[action.id].spawn);
    } else if (action.type === "portal") {
      // Warp to another scene (the campus), returning to where we stood, facing
      // away from the portal so we don't immediately step back through it.
      const p = playerRef.current;
      returnStackRef.current.push({ scene: sceneIdRef.current, x: p.x, y: p.y, dir: OPPOSITE_DIR[p.dir] });
      changeScene(action.to, interiorsRef.current[action.to].spawn);
    } else if (action.type === "exit-interior") {
      const back = returnStackRef.current.pop() || { scene: "village", x: START.x, y: START.y, dir: START.dir };
      changeScene(back.scene, back);
    }
  };

  const confirmChoice = (selection) => {
    const choice = dialog.choice;
    if (selection === 0) {
      if (choice.route) {
        navigate(choice.route);
      } else if (choice.href) {
        window.open(choice.href, "_blank", "noopener");
        closeDialog();
      }
    } else {
      closeDialog(true);
    }
  };

  // A button: interact / advance dialog / confirm choice / open queued panel.
  const actionA = () => {
    if (panel || fade) return;
    if (!dialog) {
      const p = playerRef.current;
      if (p.moving) return;
      const [dx, dy] = DIR_VECTORS[p.dir];
      const scene = sceneIdRef.current;
      const kiwi = scene === "village" ? kiwiAt(kiwisRef.current, p.x + dx, p.y + dy) : null;
      const target = kiwi
        ? { type: "kiwi", kiwi }
        : scene === "village"
          ? interactAt(p.x + dx, p.y + dy)
          : interiorsRef.current[scene].hotspotAt(p.x + dx, p.y + dy);
      if (target) trigger(target);
      return;
    }
    const text = dialog.pages[dialog.index];
    if (typed < text.length) {
      setTyped(text.length);
    } else if (dialog.index < dialog.pages.length - 1) {
      setDialog({ ...dialog, index: dialog.index + 1 });
    } else if (dialog.choice) {
      confirmChoice(choiceSel);
    } else if (dialog.panelAfter) {
      setPanel(dialog.panelAfter);
      setDialog(null);
    } else {
      closeDialog();
    }
  };

  // B button: cancel/close.
  const actionB = () => {
    if (panel) {
      setPanel(null);
      cooldownRef.current = performance.now() + 400;
    } else if (dialog) {
      closeDialog(true);
    }
  };

  // Typewriter for the current dialog page.
  useEffect(() => {
    if (!dialog) return undefined;
    setTyped(0);
    const text = dialog.pages[dialog.index];
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= text.length) clearInterval(iv);
    }, 18);
    return () => clearInterval(iv);
  }, [dialog]);

  // Action keys + choice navigation (re-bound as UI state changes).
  useEffect(() => {
    const onKey = (e) => {
      if (["z", "Z", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        actionA();
      } else if (["x", "X", "Escape"].includes(e.key)) {
        actionB();
      } else if (dialog?.choice && ["ArrowUp", "ArrowDown"].includes(e.key)) {
        setChoiceSel((s) => 1 - s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Movement key tracking (persistent).
  useEffect(() => {
    const down = (e) => {
      const dir = KEY_DIRS[e.key];
      if (dir) {
        e.preventDefault();
        keysRef.current.add(dir);
      }
    };
    const up = (e) => {
      const dir = KEY_DIRS[e.key];
      if (dir) keysRef.current.delete(dir);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Integer pixel scaling to fit the viewport.
  useEffect(() => {
    const fit = () =>
      setScale(Math.max(1, Math.floor(Math.min(
        (window.innerWidth - 24) / VIEW_W,
        (window.innerHeight - 150) / VIEW_H,
      ))));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Build the world, interiors, and characters; run the game loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const world = buildWorld();
    const playerFrames = buildPlayerFrames();
    const interiors = getInteriors();
    interiorsRef.current = interiors;
    const interiorArt = Object.fromEntries(
      Object.entries(interiors).map(([id, room]) => [
        id,
        room.kind === "campus" ? buildCampusArt(room) : buildInteriorArt(room),
      ]),
    );
    const npcFrames = NPC_PALS.map((pal) => buildCharacterFrames(pal));
    const kiwiFrames = buildKiwiFrames();
    const triggerRef = trigger; // stable: only touches refs + setState

    let raf;
    let last = performance.now();

    const sceneSolid = (x, y) => {
      if (sceneIdRef.current === "village") return isSolid(x, y) || !!kiwiAt(kiwisRef.current, x, y);
      const room = interiors[sceneIdRef.current];
      return room.isSolid(x, y) || !!npcAt(room, x, y);
    };
    const sceneHotspot = (x, y) => {
      if (sceneIdRef.current === "village") {
        const k = kiwiAt(kiwisRef.current, x, y);
        if (k) return { type: "kiwi", kiwi: k };
        return interactAt(x, y);
      }
      const room = interiors[sceneIdRef.current];
      const n = npcAt(room, x, y);
      if (n) return { type: "npc", pages: n.pages, choice: n.choice, npc: n };
      return room.hotspotAt(x, y);
    };

    const tryInteract = (x, y) => {
      if (performance.now() < cooldownRef.current) return;
      const target = sceneHotspot(x, y);
      if (target) triggerRef(target);
    };

    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = playerRef.current;

      if (modeRef.current === "play") {
        if (!p.moving) {
          const dir = ["up", "down", "left", "right"].find((d) => keysRef.current.has(d));
          if (dir) {
            p.dir = dir;
            const [dx, dy] = DIR_VECTORS[dir];
            const nx = p.x + dx;
            const ny = p.y + dy;
            if (!sceneSolid(nx, ny)) {
              p.tx = nx;
              p.ty = ny;
              p.moving = true;
              p.progress = 0;
            } else {
              tryInteract(nx, ny); // bump-to-open: doors, signs, villagers…
              tryInteract(p.x, p.y); // standing on a gated tile (exit mat) and pressing into it
            }
          } else {
            p.animClock = 0;
          }
        }
        if (p.moving) {
          p.progress += dt * WALK_SPEED;
          p.animClock += dt;
          if (p.progress >= 1) {
            p.x = p.tx;
            p.y = p.ty;
            p.moving = false;
            p.progress = 0;
            tryInteract(p.x, p.y); // walkable triggers: exit gap, door mats
          }
        }
      }

      // --- NPC idle wander: steps finish in any mode, new moves only in play ---
      const sceneId = sceneIdRef.current;
      if (sceneId === "village") {
        kiwisRef.current.forEach((k) => {
          if (k.moving) {
            k.progress += dt * KIWI_WALK_SPEED;
            k.animClock += dt;
            if (k.progress >= 1) {
              k.x = k.tx;
              k.y = k.ty;
              k.moving = false;
              k.progress = 0;
              k.animClock = 0;
            }
          } else if (modeRef.current === "play") {
            k.timer -= dt;
            if (k.timer <= 0) {
              k.timer = 1.2 + Math.random() * 3;
              const dir = ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
              if (dir === "left" || dir === "right") k.dir = dir; // side-view sprite
              if (Math.random() < 0.6) {
                const [dx, dy] = DIR_VECTORS[dir];
                const nx = k.x + dx;
                const ny = k.y + dy;
                const clear =
                  Math.abs(nx - k.home.x) <= KIWI_ROAM && Math.abs(ny - k.home.y) <= KIWI_ROAM &&
                  !isSolid(nx, ny) && !interactAt(nx, ny) && !kiwiAt(kiwisRef.current, nx, ny) &&
                  !(p.x === nx && p.y === ny) && !(p.tx === nx && p.ty === ny);
                if (clear) {
                  k.tx = nx;
                  k.ty = ny;
                  k.moving = true;
                  k.progress = 0;
                }
              }
            }
          }
        });
      } else {
        interiors[sceneId].npcs.forEach((n) => {
          if (n.moving) {
            n.progress += dt * NPC_WALK_SPEED;
            n.animClock += dt;
            if (n.progress >= 1) {
              n.x = n.tx;
              n.y = n.ty;
              n.moving = false;
              n.progress = 0;
              n.animClock = 0;
            }
          } else if (modeRef.current === "play") {
            n.timer -= dt;
            if (n.timer <= 0) {
              n.timer = 1.6 + Math.random() * 2.8;
              const dir = ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
              n.dir = dir; // turn either way; step only half the time
              if (Math.random() < 0.5) {
                const [dx, dy] = DIR_VECTORS[dir];
                const nx = n.x + dx;
                const ny = n.y + dy;
                const room = interiors[sceneId];
                const clear =
                  Math.abs(nx - n.home.x) <= 1 && Math.abs(ny - n.home.y) <= 1 &&
                  !room.isSolid(nx, ny) && !room.hotspotAt(nx, ny) && !npcAt(room, nx, ny) &&
                  !(p.x === nx && p.y === ny) && !(p.tx === nx && p.ty === ny);
                if (clear) {
                  n.tx = nx;
                  n.ty = ny;
                  n.moving = true;
                  n.progress = 0;
                }
              }
            }
          }
        });
      }

      // --- draw ---
      let ox = 0;
      let oy = 0;
      const drawables = [];

      if (sceneId === "village") {
        ctx.drawImage(world.bg, 0, 0);
        ctx.drawImage(world.pondFrames[Math.floor(now / 600) % 2], world.pond.x * TILE, world.pond.y * TILE);
        const flowerFrame = world.flowerFrames[Math.floor(now / 450) % 2];
        world.flowerTiles.forEach(([fx, fy]) => ctx.drawImage(flowerFrame, fx * TILE, fy * TILE));
        kiwisRef.current.forEach((k) => {
          const tt = k.moving ? k.progress : 0;
          const wx = (k.x + (k.tx - k.x) * tt) * TILE;
          const wy = (k.y + (k.ty - k.y) * tt) * TILE;
          const frames = kiwiFrames[k.dir];
          const fi = k.moving ? [1, 0, 1, 0][Math.floor(k.animClock / 0.18) % 4] : 0;
          drawables.push({
            y: wy,
            draw: () => ctx.drawImage(
              frames[fi],
              Math.round(wx + (TILE - frames[fi].width) / 2),
              Math.round(wy + TILE - frames[fi].height - (fi ? 1 : 0)),
            ),
          });
        });
      } else {
        const art = interiorArt[sceneId];
        ctx.drawImage(art.bg, 0, 0);
        ox = art.ox;
        oy = art.oy;
        (interiors[sceneId].portals || []).forEach((pf) =>
          drawPortalFx(ctx, ox + pf.x * TILE, oy + pf.y * TILE, (pf.w || 1) * TILE, (pf.h || 1) * TILE, now));
        interiors[sceneId].npcs.forEach((npc) => {
          const tt = npc.moving ? npc.progress : 0;
          const wx = (npc.x + (npc.tx - npc.x) * tt) * TILE;
          const wy = (npc.y + (npc.ty - npc.y) * tt) * TILE;
          const frames = npcFrames[npc.pal % NPC_PALS.length][npc.dir];
          const stepSeq = frames.length === 3 ? [1, 0, 2, 0] : [1, 0, 1, 0];
          const fi = npc.moving ? stepSeq[Math.floor(npc.animClock / 0.16) % 4] : 0;
          const npcBob = fi > 0 ? 1 : 0;
          drawables.push({
            y: wy,
            draw: () => ctx.drawImage(frames[fi], Math.round(ox + wx + (TILE - SPRITE_W) / 2), Math.round(oy + wy + TILE - SPRITE_H - npcBob)),
          });
        });
      }

      const t = p.moving ? p.progress : 0;
      const drawX = ox + (p.x + (p.tx - p.x) * t) * TILE + (TILE - SPRITE_W) / 2;
      const drawYBase = (p.y + (p.ty - p.y) * t) * TILE;
      const dirFrames = playerFrames[p.dir];
      const seq = dirFrames.length === 3 ? [1, 0, 2, 0] : [1, 0, 1, 0];
      const frameIdx = p.moving ? seq[Math.floor(p.animClock / 0.13) % 4] : 0;
      const bob = frameIdx > 0 ? 1 : 0;
      drawables.push({
        y: drawYBase,
        draw: () => ctx.drawImage(dirFrames[frameIdx], Math.round(drawX), Math.round(oy + drawYBase + TILE - SPRITE_H - bob)),
      });

      drawables.sort((a, b) => a.y - b.y).forEach((d) => d.draw());

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Welcome dialog once on mount.
  useEffect(() => {
    openDialog(WELCOME);
  }, []);

  const holdDir = (dir) => (e) => {
    e.preventDefault();
    keysRef.current.add(dir);
  };
  const releaseDir = (dir) => () => keysRef.current.delete(dir);

  const dialogText = dialog ? dialog.pages[dialog.index] : "";
  const typingDone = typed >= dialogText.length;
  const showChoice = dialog?.choice && dialog.index === dialog.pages.length - 1 && typingDone;

  return (
    <div className="pv-root">
      <div className="pv-header">
        <span className="pv-title">LOGAN CITY</span>
        <button className="pv-exit" onClick={() => navigate("/")}>
          EXIT ▸
        </button>
      </div>

      <div className="pv-stage" style={{ width: VIEW_W * scale }}>
        <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} style={{ width: VIEW_W * scale }} />

        <div className={`pv-fade ${fade ? "pv-fade-show" : ""}`} />

        {dialog && (
          <div className="pv-dialog" onClick={actionA}>
            {dialogText.slice(0, typed)}
            {typingDone && !showChoice && <span className="pv-dialog-arrow">▼</span>}
            {showChoice && (
              // Anchored above the dialog box so it can never overlap the text.
              <div className="pv-choice" onClick={(e) => e.stopPropagation()}>
                {["YES", "NO"].map((label, i) => (
                  <span
                    key={label}
                    className={`pv-choice-option ${choiceSel === i ? "selected" : ""}`}
                    onClick={() => confirmChoice(i)}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {panel && <SectionPanel id={panel} onClose={actionB} />}
      </div>

      <div className="pv-touch">
        <div className="pv-dpad">
          <span className="pv-dpad-blank" />
          <button onTouchStart={holdDir("up")} onTouchEnd={releaseDir("up")} onMouseDown={holdDir("up")} onMouseUp={releaseDir("up")} aria-label="Up">▲</button>
          <span className="pv-dpad-blank" />
          <button onTouchStart={holdDir("left")} onTouchEnd={releaseDir("left")} onMouseDown={holdDir("left")} onMouseUp={releaseDir("left")} aria-label="Left">◀</button>
          <span className="pv-dpad-blank" />
          <button onTouchStart={holdDir("right")} onTouchEnd={releaseDir("right")} onMouseDown={holdDir("right")} onMouseUp={releaseDir("right")} aria-label="Right">▶</button>
          <span className="pv-dpad-blank" />
          <button onTouchStart={holdDir("down")} onTouchEnd={releaseDir("down")} onMouseDown={holdDir("down")} onMouseUp={releaseDir("down")} aria-label="Down">▼</button>
          <span className="pv-dpad-blank" />
        </div>
        <div className="pv-ab">
          <button onClick={actionB} aria-label="B button">B</button>
          <button onClick={actionA} aria-label="A button">A</button>
        </div>
      </div>

      <div className="pv-footer">ARROWS / WASD move · Z / ENTER interact · X / ESC close</div>
    </div>
  );
}
