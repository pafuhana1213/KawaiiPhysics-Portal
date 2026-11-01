"""Drives the Unreal editor over its MCP server to record KawaiiPhysics sample exhibits.

Run with the engine's Python (stdlib only). See ../SKILL.md for the workflow.

  ue_capture.py setup
  ue_capture.py exhibits <out.json>
  ue_capture.py record <level> <y> <out.mp4> [--x -660] [--z 150] [--pitch -4] [--seconds 10] [--allow-static]
  ue_capture.py console "<command>"
  ue_capture.py quit
"""
import argparse
import json
import pathlib
import re
import subprocess
import sys
import time
import urllib.request

URL = "http://127.0.0.1:8000/mcp"
HERE = pathlib.Path(__file__).parent
EXAMPLES = "/Game/KawaiiPhysicsSample/Examples/"
THEME_LEVELS = [
    "01_BoneChain/L_KPS_01_BoneChain", "02_PhysicsSettings/L_KPS_02_PhysicsSettings",
    "03_Collision/L_KPS_03_Collision", "04_Forces/L_KPS_04_Forces", "05_Advanced/L_KPS_05_Advanced",
    "06_RuntimeControl/L_KPS_06_RuntimeControl", "07_SimpleWorldCollision/L_KPS_07_SimpleWorldCollision",
    "08_Wind/L_KPS_08_Wind", "09_Showcase/L_KPS_09_Showcase",
]
APP = "EditorToolset.EditorAppToolset"
SLATE = "SlateInspectorToolset.SlateInspectorToolset"
SCENE = "editor_toolset.toolsets.scene.SceneTools"
ACTOR = "editor_toolset.toolsets.actor.ActorTools"
OBJ = "editor_toolset.toolsets.object.ObjectTools"

# This PC shows a landscape 2560x1600 desktop on a portrait-native panel, so desktop duplication returns panel space.
DESKTOP_HEIGHT = 1600
VIEW_W, VIEW_H = 1280, 720
CHROME_X, CHROME_Y = 6, 72  # PIE viewport offset inside the floating window
MIN_FPS = 24.0


class Mcp:
    def __init__(self):
        res, self.session = self._post({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
            "protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "kp-capture", "version": "1"}}})
        self._post({"jsonrpc": "2.0", "method": "notifications/initialized"})

    def _post(self, payload):
        headers = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
        if getattr(self, "session", None):
            headers["Mcp-Session-Id"] = self.session
        req = urllib.request.Request(URL, json.dumps(payload).encode(), headers)
        with urllib.request.urlopen(req, timeout=600) as res:
            body = res.read().decode("utf-8", "replace")
            sid = res.headers.get("Mcp-Session-Id")
        if body.lstrip().startswith("data:") or "\ndata:" in body:
            lines = [l[5:].strip() for l in body.splitlines() if l.startswith("data:")]
            body = lines[-1] if lines else ""
        return (json.loads(body) if body.strip() else None), sid

    def tool(self, toolset, name, args=None):
        res, _ = self._post({"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {
            "name": "call_tool", "arguments": {"toolset_name": toolset, "tool_name": name, "arguments": args or {}}}})
        if "error" in res:
            raise RuntimeError(json.dumps(res["error"], ensure_ascii=False)[:1500])
        result = res["result"]
        text = "".join(p.get("text", "") for p in result.get("content", []))
        if result.get("isError"):
            raise RuntimeError(text[:1500])
        try:
            data = json.loads(text)
        except ValueError:
            return text
        return data.get("returnValue", data) if isinstance(data, dict) else data

    def console(self, *commands):
        """Types into the editor's Cmd box, the only console access the toolsets offer."""
        self.tool(SLATE, "Windows", {"action": "select", "index": 0})
        lines = self.tool(SLATE, "Snapshot", {"ref": "", "maxDepth": 40}).splitlines()
        ref = None
        for i, line in enumerate(lines):
            if 'text "Cmd"' in line:
                for follow in lines[i:i + 6]:
                    m = re.search(r"textbox .*\[ref=(\w+)\]", follow)
                    if m:
                        ref = m.group(1)
        if not ref:
            raise RuntimeError("console box not found")
        for command in commands:
            self.tool(SLATE, "Type", {"ref": ref, "text": command, "submit": True})


def setup(ue):
    ue.tool(OBJ, "set_properties", {"instance": {"refPath": "/Script/UnrealEd.Default__EditorPerformanceSettings"},
                                    "values": json.dumps({"bThrottleCPUWhenNotForeground": False})})
    ue.tool(OBJ, "set_properties", {"instance": {"refPath": "/Script/UnrealEd.Default__LevelEditorPlaySettings"},
                                    "values": json.dumps({"NewWindowWidth": VIEW_W, "NewWindowHeight": VIEW_H,
                                                          "NewWindowPosition": {"X": 100, "Y": 100}, "CenterNewWindow": False})})
    ue.console("DisableAllScreenMessages")
    print("capture settings applied")


def exhibits(ue, out):
    rows = []
    for level in THEME_LEVELS:
        ue.tool(SCENE, "load_level", {"level_path": EXAMPLES + level})
        for actor in ue.tool(SCENE, "find_actors", {"name": "Plate", "tag": "", "collision_channels": []}) or []:
            inst = {"refPath": actor["refPath"]}
            raw = ue.tool(OBJ, "get_properties", {"instance": inst, "properties": ["number", "title", "docPath", "descriptionEn", "description"]})
            props = json.loads(raw) if isinstance(raw, str) else raw
            loc = ue.tool(ACTOR, "get_actor_transform", {"actor": inst}).get("location")
            rows.append({"level": level, "y": loc["y"], **props})
    pathlib.Path(out).write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(rows), "exhibits ->", out)


def viewport_origin():
    r = subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(HERE / "pie_rect.ps1")],
                       capture_output=True, text=True, timeout=30)
    nums = [int(n) for n in re.findall(r"-?\d+", r.stdout)]
    if len(nums) < 4:
        raise RuntimeError("PIE window not found: " + r.stdout + r.stderr)
    return nums[0] + CHROME_X, nums[1] + CHROME_Y


def effective_fps(path):
    """A clip can report 30 fps while repeating one frame, so count frames that actually changed."""
    cmd = ["ffmpeg", "-hide_banner", "-threads", "2", "-ss", "1", "-i", str(path), "-frames:v", "61", "-vf",
           "format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-",
           "-an", "-f", "null", "-"]
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60)
    values = [float(v) for v in re.findall(r"YAVG=([0-9.]+)", r.stdout)][1:]
    return 30.0 * sum(1 for v in values if v > 0.02) / len(values) if values else 0.0


def record(ue, args):
    if ue.tool(APP, "IsPIERunning"):
        ue.tool(APP, "StopPIE")
    level = args.level if args.level.startswith("/Game/") else EXAMPLES + args.level
    ue.tool(SCENE, "load_level", {"level_path": level})
    ue.tool(APP, "StartPIE", {"options": {
        "playMode": "PlayMode_InEditorFloating", "warmupSeconds": 3,
        "startTransform": {"location": {"x": args.x, "y": args.y, "z": args.z},
                           "rotation": {"pitch": args.pitch, "yaw": 0, "roll": 0}}}})
    try:
        vx, vy = viewport_origin()
        px, py = DESKTOP_HEIGHT - vy - VIEW_H, vx
        out = pathlib.Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        source = f"ddagrab=output_idx=0:framerate=30:draw_mouse=0:video_size={VIEW_H}x{VIEW_W}:offset_x={px}:offset_y={py}"
        cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-t", str(args.seconds), "-i", source,
               "-vf", "hwdownload,format=bgra,transpose=2,format=yuv420p",
               "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", str(out)]
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=args.seconds + 30)
        if r.returncode != 0:
            raise RuntimeError(r.stderr[:400])
    finally:
        if ue.tool(APP, "IsPIERunning"):
            ue.tool(APP, "StopPIE")
    fps = effective_fps(out)
    print(f"{out.name} effective_fps={fps:.1f} {out.stat().st_size // 1024}KB")
    if fps < MIN_FPS and not args.allow_static:
        raise SystemExit(f"low motion ({fps:.1f} fps): a held pose, or a failed capture. Check the frames, then use --allow-static.")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("setup")
    sub.add_parser("quit")
    sub.add_parser("exhibits").add_argument("out")
    sub.add_parser("console").add_argument("commands", nargs="+")
    rec = sub.add_parser("record")
    rec.add_argument("level", help="e.g. 02_PhysicsSettings/L_KPS_02_PhysicsSettings")
    rec.add_argument("y", type=float)
    rec.add_argument("out")
    rec.add_argument("--x", type=float, default=-660)
    rec.add_argument("--z", type=float, default=150)
    rec.add_argument("--pitch", type=float, default=-4)
    rec.add_argument("--seconds", type=int, default=10)
    rec.add_argument("--allow-static", action="store_true")
    args = parser.parse_args()
    ue = Mcp()
    if args.command == "setup":
        setup(ue)
    elif args.command == "exhibits":
        exhibits(ue, args.out)
    elif args.command == "record":
        record(ue, args)
    elif args.command == "console":
        ue.console(*args.commands)
    elif args.command == "quit":
        ue.console("QUIT_EDITOR")
        time.sleep(1)


if __name__ == "__main__":
    main()
