# Pixel Brush image sources

## Active user-selected images — 2026-11-01

The user supplied six image attachments and confirmed that they may be used in
the public website and GitHub repository. This records the user's confirmation;
it does not claim independent license verification or that every image was
personally photographed by the user. No external image was downloaded.

The originals were copied without visual edits into `selected/`, in this order:

1. `cherry-night.png` — cherry blossoms and a vending machine at night; also the Gallery / Loading representative image.
2. `flight-window.png` — airplane window view.
3. `city-walk.png` — city street walk.
4. `hollywood.png` — Hollywood hillside.
5. `rainy-evening.png` — rainy evening street.
6. `campus-lawn.jpg` — people on a lawn beside a building.

The artwork displays the full original aspect ratio. Canvas layers are sized
to fit within 1500 × 900 pixels; this changes rendering resolution without
cropping or modifying the stored photographs. Preview thumbnails retain their
existing frame and use a centre crop.

The second and third originals are approximately 18 MB each. They are preserved
as source files; the deployed selection now imports the optimized copies below.

## Deployment optimization — 2026-11-01

`selected/optimized/` contains the six deployed JPEGs. The large portrait images
were resized to 1536 × 2048 pixels, preserving the full frame; the other images
retain their dimensions. JPEG encoding used quality 90 with the existing Windows
image processing library. `campus-lawn.jpg` was copied without re-encoding to
avoid increasing its size. No runtime dependency was added.

The six originals total 40,023,767 bytes; the deployed copies total 1,908,726
bytes (about 95.2% smaller). The unused originals remain in this repository but
are not included in Vite's emitted production assets. This is a byte-size
comparison, not a measured page-load speed improvement. The use confirmation
above applies to these copies as well; optimization does not establish a new
license or independently verify the original source.

## Previous prototype assets — no longer selected

The first prototype used these temporary generated images. They remain as
historical project files but are no longer imported by `photos.ts`.

- santorini.png, street.png, cherry.png, dog.png: created for this project with
  the built-in OpenAI imagegen tool on 2026-10-10. No third-party photograph was
  downloaded or copied from the design reference.
- The fifth image reuses ../christmas-night.png, already generated for the project.

Generation prompts:

1. Photorealistic landscape travel photograph of Santorini at sunset, white buildings and blue domed churches on the right, tranquil sea and soft peach sunset on the left. Wide horizontal 3:2 framing, natural photographic detail, restrained elegant editorial travel photography. No text, UI, watermarks or borders.
2. Photorealistic editorial travel photograph of a quiet European street in warm afternoon light, limestone buildings, cafe windows, gentle perspective into the distance, no readable signage. Horizontal 3:2 framing. Natural texture, premium understated photographic color. No text, UI, watermarks or borders.
3. Photorealistic spring photograph of a large flowering cherry tree beside a quiet park path, pink blossoms with delicate branches, softly lit overcast sky, green grass. Horizontal 3:2 framing, natural photographic texture and colors. No text, UI, watermarks or borders.
4. Photorealistic portrait photograph of a friendly golden retriever outdoors in a soft green garden, dog's head and shoulders, natural joyful expression, warm daylight, realistic fur with gentle background bokeh. Horizontal 3:2 framing. No text, UI, watermarks or borders.

The active selection is now defined by the six user-provided entries in
`src/works/pixel-brush/photos.ts`.
