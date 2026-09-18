#!/usr/bin/env python3
"""
Minimal ffmpeg helper for ios-video-qa.

Examples:
  # Extract a screenshot at 12.4 seconds
  python extract_evidence.py recording.mov --out assets --shot QA-001-problem,12.4

  # Extract a clip from 20.0 to 27.5 seconds
  python extract_evidence.py recording.mov --out assets --clip QA-002-keyboard,20.0,27.5

Multiple --shot / --clip arguments are supported.
"""

import argparse
import shutil
import subprocess
from pathlib import Path

def run(cmd):
    subprocess.run(cmd, check=True)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("--out", required=True)
    p.add_argument("--shot", action="append", default=[],
                   help="name,time_seconds")
    p.add_argument("--clip", action="append", default=[],
                   help="name,start_seconds,end_seconds")
    args = p.parse_args()

    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise SystemExit(
            "ffmpeg was not found on PATH. Install ffmpeg or use another local "
            "video tool, then rerun evidence extraction."
        )

    video = Path(args.video)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    for item in args.shot:
        name, t = item.rsplit(",", 1)
        dest = out / f"{name}.png"
        run([
            ffmpeg, "-hide_banner", "-loglevel", "error",
            "-ss", t, "-i", str(video),
            "-frames:v", "1", "-y", str(dest)
        ])
        print(dest)

    for item in args.clip:
        name, start, end = item.rsplit(",", 2)
        duration = max(0.05, float(end) - float(start))
        dest = out / f"{name}.mp4"
        run([
            ffmpeg, "-hide_banner", "-loglevel", "error",
            "-ss", start, "-i", str(video),
            "-t", str(duration),
            "-an",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
            "-movflags", "+faststart",
            "-y", str(dest)
        ])
        print(dest)

if __name__ == "__main__":
    main()
