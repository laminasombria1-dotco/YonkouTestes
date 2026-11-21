#!/usr/bin/env python3
"""Transcreve um vídeo/áudio com faster-whisper (local, grátis), em português.
Uso: python3 transcrever.py <arquivo> [pasta_saida=trabalho] [modelo=small]
Gera: transcricao.txt (frases com tempo) e transcricao.json (mesmos dados)."""
import sys, json, pathlib
from faster_whisper import WhisperModel

def fmt(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"

src = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "trabalho"); out.mkdir(exist_ok=True)
model = WhisperModel(sys.argv[3] if len(sys.argv) > 3 else "small", device="cpu", compute_type="int8")
segs, info = model.transcribe(str(src), language="pt", vad_filter=False)
rows = [{"inicio": round(s.start, 2), "fim": round(s.end, 2), "texto": s.text.strip()} for s in segs]
(out / "transcricao.json").write_text(json.dumps({"arquivo": src.name, "duracao": round(info.duration, 2), "frases": rows}, ensure_ascii=False, indent=2))
(out / "transcricao.txt").write_text("\n".join(f"[{fmt(r['inicio'])} --> {fmt(r['fim'])}] {r['texto']}" for r in rows) + "\n")
print(f"{len(rows)} frases salvas em {out}/")
