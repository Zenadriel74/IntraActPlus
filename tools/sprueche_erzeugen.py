"""
Erzeugt die Motivationssprüche als MP3 mit ElevenLabs.

Liest die Tabelle in audio/SPRUECHE.md (Dateiname + Satz) und legt für jede
noch fehlende Datei eine MP3 in audio/ an. Vorhandene Dateien bleiben
unangetastet (außer mit --neu).

Vorbereitung (einmalig, in PowerShell), eine der beiden Möglichkeiten:
    setx ELEVENLABS_API_KEY "dein-schlüssel"     (dauerhaft für deinen Windows-Benutzer)
    $env:ELEVENLABS_API_KEY = "dein-schlüssel"   (nur für dieses Fenster)
Oder den Schlüssel in die Datei tools/elevenlabs.key schreiben (wird nicht committet).

Stimmen anzeigen:
    python tools/sprueche_erzeugen.py --stimmen

Sprüche erzeugen:
    python tools/sprueche_erzeugen.py --stimme <voice_id>

Optionen:
    --nur start_1.mp3,weiter_2.mp3   nur diese Dateien
    --neu                            vorhandene Dateien überschreiben
    --probe                          nur anzeigen, was erzeugt würde

Der API-Schlüssel wird nur aus der Umgebungsvariable gelesen und nie
ausgegeben oder gespeichert. Es werden nur Standardbibliotheken verwendet.
"""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"
LIST = AUDIO / "SPRUECHE.md"
API = "https://api.elevenlabs.io/v1"
MODEL = "eleven_multilingual_v2"


def lies_liste():
    rows = re.findall(r"^\|\s*`([a-z]+_\d+\.mp3)`\s*\|\s*(.+?)\s*\|\s*$", LIST.read_text(encoding="utf-8"), re.M)
    return [(f, satz) for f, satz in rows]


def schluessel():
    """Schlüssel aus Umgebungsvariable, Windows-Benutzerumgebung (setx) oder tools/elevenlabs.key."""
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not key and sys.platform == "win32":
        try:
            import winreg

            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as k:
                key = str(winreg.QueryValueEx(k, "ELEVENLABS_API_KEY")[0]).strip()
        except OSError:
            key = ""
    datei = Path(__file__).resolve().parent / "elevenlabs.key"
    if not key and datei.exists():
        key = datei.read_text(encoding="utf-8").strip()
    return key


def anfrage(pfad, key, daten=None):
    req = urllib.request.Request(
        API + pfad,
        data=json.dumps(daten).encode("utf-8") if daten is not None else None,
        headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "*/*"},
        method="POST" if daten is not None else "GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        text = e.read().decode("utf-8", "replace")[:300]
        sys.exit(f"ElevenLabs meldet Fehler {e.code}: {text}")


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap =argparse.ArgumentParser(description="Sprüche mit ElevenLabs erzeugen")
    ap.add_argument("--stimme", help="voice_id der ElevenLabs-Stimme")
    ap.add_argument("--stimmen", action="store_true", help="verfügbare Stimmen anzeigen")
    ap.add_argument("--nur", help="kommagetrennte Dateinamen")
    ap.add_argument("--neu", action="store_true", help="vorhandene Dateien überschreiben")
    ap.add_argument("--probe", action="store_true", help="nichts erzeugen, nur anzeigen")
    ap.add_argument("--stabilitaet", type=float, default=0.6, help="0 bis 1, höher = ruhiger (Standard 0,6)")
    args = ap.parse_args()

    liste = lies_liste()
    if args.nur:
        wahl = {x.strip() for x in args.nur.split(",")}
        liste = [x for x in liste if x[0] in wahl]
    offen = [(f, s) for f, s in liste if args.neu or not (AUDIO / f).exists()]

    if args.probe:
        for f, s in offen:
            print(f"{f}: {s}")
        print(f"{len(offen)} Datei(en) würden erzeugt.")
        return

    key = schluessel()
    if not key:
        sys.exit(
            "Kein ElevenLabs-Schlüssel gefunden. Einmalig in PowerShell:\n"
            '    setx ELEVENLABS_API_KEY "dein-schlüssel"\n'
            "(oder den Schlüssel in die Datei tools/elevenlabs.key schreiben, sie wird nicht committet)"
        )

    if args.stimmen:
        daten = json.loads(anfrage("/voices", key))
        for v in daten.get("voices", []):
            labels = ", ".join(f"{k}: {w}" for k, w in (v.get("labels") or {}).items())
            print(f"{v['voice_id']}  {v['name']}  ({labels})")
        return

    if not args.stimme:
        sys.exit("Bitte eine Stimme angeben: --stimme <voice_id>  (Liste mit --stimmen)")

    for f, satz in offen:
        print(f"erzeuge {f}: {satz}")
        mp3 = anfrage(
            f"/text-to-speech/{args.stimme}?output_format=mp3_44100_128",
            key,
            {
                "text": satz,
                "model_id": MODEL,
                "language_code": "de",
                "voice_settings": {"stability": args.stabilitaet, "similarity_boost": 0.75},
            },
        )
        (AUDIO / f).write_bytes(mp3)
    print(f"fertig: {len(offen)} Datei(en) in {AUDIO}")


if __name__ == "__main__":
    main()
