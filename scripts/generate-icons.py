"""Export icons from the clean, approved copper-background PNG.

Optional asset-authoring dependency: python -m pip install Pillow
Run from any directory: python scripts/generate-icons.py
The 512px original is the source of truth. Do not overlay bars on a smaller
raster of the logo: it already contains the bars and creates doubled edges.
"""
import base64
from pathlib import Path

from PIL import Image

PUBLIC = Path(__file__).resolve().parents[1] / "public"
source_path = PUBLIC / "preambl-logo.png"
image = Image.open(source_path).convert("RGB")
assert image.size == (512, 512), "Expected the original 512px logo"
encoded = base64.b64encode(source_path.read_bytes()).decode("ascii")
svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
    f'<image width="512" height="512" href="data:image/png;base64,{encoded}"/>'
    '</svg>\n'
)
(PUBLIC / "preambl-logo.svg").write_text(svg, encoding="utf-8")
(PUBLIC / "favicon.svg").write_text(svg, encoding="utf-8")

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
