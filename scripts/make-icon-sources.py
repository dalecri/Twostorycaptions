"""Draws the app icon and splash source art into assets/ (and the web favicon tst.png).

The "t." glyph is redrawn from rectangles measured off the original 1242px artwork, so it stays
pixel-crisp at any size. Run `npm run icons` afterwards to generate the Android resources.
"""
import sys
from PIL import Image, ImageDraw

BLUE = '#0059FF'    # --moss in the Marina theme: the app's primary accent
WHITE = '#FFFFFF'
PAPER = '#F0F5FF'   # --paper: app background, splash background

# (x0, y0, x1, y1) on the original 1242 x 1246 canvas
REF_W, REF_H = 1242, 1246
GLYPH = [
    (462, 195, 562, 939),   # stem
    (373, 412, 740, 512),   # crossbar
    (462, 839, 780, 939),   # foot
    (839, 839, 941, 939),   # dot
]


def draw_glyph(img, color, scale=1.0, center=None):
    """Draw the glyph at `scale` (1.0 = original proportion of the canvas) around `center`."""
    w, h = img.size
    cx, cy = center or (w / 2, h / 2)
    d = ImageDraw.Draw(img)
    for x0, y0, x1, y1 in GLYPH:
        # Keep the original's placement relative to its canvas centre (it's optically centred)
        nx0 = cx + (x0 - REF_W / 2) / REF_W * w * scale
        nx1 = cx + (x1 - REF_W / 2) / REF_W * w * scale
        ny0 = cy + (y0 - REF_H / 2) / REF_H * h * scale
        ny1 = cy + (y1 - REF_H / 2) / REF_H * h * scale
        d.rectangle([round(nx0), round(ny0), round(nx1) - 1, round(ny1) - 1], fill=color)


def icon(size):
    img = Image.new('RGBA', (size, size), BLUE)
    draw_glyph(img, WHITE)
    return img


# Legacy launcher icons (Android 7 and older). capacitor-assets pads these on white, so after it
# runs, `--legacy` redraws them full-bleed: square and round versions for every density.
if '--legacy' in sys.argv:
    RES = 'android/app/src/main/res/'
    for density, size in {'ldpi': 36, 'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
        art = icon(1024).resize((size, size), Image.LANCZOS)
        art.save(f'{RES}mipmap-{density}/ic_launcher.png')
        round_mask = Image.new('L', (size * 4, size * 4), 0)
        ImageDraw.Draw(round_mask).ellipse([0, 0, size * 4 - 1, size * 4 - 1], fill=255)
        rounded = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        rounded.paste(art, (0, 0), round_mask.resize((size, size), Image.LANCZOS))
        rounded.save(f'{RES}mipmap-{density}/ic_launcher_round.png')
    print('Wrote legacy launcher icons')
    sys.exit()

# Full-bleed icon: legacy launcher icons, web favicon / home-screen icon
icon(1024).save('assets/icon-only.png')
icon(1242).save('tst.png')

# Adaptive icon (Android 8+): capacitor-assets insets each layer by 16.7%, so this whole image
# is the visible area. Launchers then mask it (circle, squircle...); at 0.9 the glyph's corners
# stay clear of even the circle mask.
fg = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
draw_glyph(fg, WHITE, scale=0.9)
fg.save('assets/icon-foreground.png')
Image.new('RGBA', (1024, 1024), BLUE).save('assets/icon-background.png')

# Splash: the icon as a rounded tile on the app background
S = 2732
tile_size = 640
splash = Image.new('RGBA', (S, S), PAPER)
tile = icon(tile_size)
mask = Image.new('L', (tile_size, tile_size), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, tile_size - 1, tile_size - 1], radius=int(tile_size * 0.22), fill=255)
splash.paste(tile, ((S - tile_size) // 2, (S - tile_size) // 2), mask)
splash.save('assets/splash.png')
print('Wrote assets/ and tst.png')
