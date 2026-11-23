"""Rasterize the approved copper-background SVG logo without redesigning it.

Optional asset-authoring dependency: python -m pip install Pillow
Run from any directory: python scripts/generate-icons.py
The source has vector bars and an embedded raster background; exports cannot
recover detail missing from that background.
"""
import base64
import io
from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw

PUBLIC = Path(__file__).resolve().parents[1] / "public"
source_path = PUBLIC / "preambl-logo.svg"
source = ET.parse(source_path).getroot()
ns = "{http://www.w3.org/2000/svg}"
background = next(source.iter(ns + "image"))
encoded = background.get("href").split(",", 1)[1]
image = Image.open(io.BytesIO(base64.b64decode(encoded))).convert("RGB")
image = image.resize((4096, 4096), Image.Resampling.BILINEAR)
draw = ImageDraw.Draw(image)
bars = list(source.iter(ns + "rect"))
assert len(bars) == 8, "Expected the approved eight-bar Preambl logo"
for bar in bars:
    x, y, width, height = (float(bar.attrib[key]) for key in ("x", "y", "width", "height"))
    draw.rectangle((x * 4, y * 4, (x + width) * 4, (y + height) * 4), fill=bar.get("fill"))

(PUBLIC / "favicon.svg").write_bytes(source_path.read_bytes())
for size in (16, 32, 48, 96, 180, 192, 512, 1024):
    name = (
        "preambl-logo-1024.png" if size == 1024 else
        "apple-touch-icon.png" if size == 180 else
        f"android-chrome-{size}.png" if size in (192, 512) else
        f"favicon-{size}.png"
    )
    image.resize((size, size), Image.Resampling.LANCZOS).save(PUBLIC / name, optimize=True)
image.resize((256, 256), Image.Resampling.LANCZOS).save(
    PUBLIC / "favicon.ico", sizes=[(size, size) for size in (16, 32, 48, 64)]
)
