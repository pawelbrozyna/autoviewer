# Vehicle image generation

Catalogue images live in `public/cars/` as 1000x750 WebP files. Records are in `data/vehicle-images.json`.

When a generation is catalogued but its WebP is not ready yet, list the exact filename in `pendingImageFilenames`. Matching may already use that catalogue row; promote the filename out of `pendingImageFilenames` only after the file exists.

## Framing rules

### Cars, SUVs and vans

Use the current AutoViewer standard framing: subject fills the frame comfortably with a clean white studio background and consistent lighting.

### Motorcycles

- Maximum scale about 90% of the frame.
- Keep more white space than car images.
- Do not scale the bike up to fill empty space.
- Reference: existing Kawasaki Ninja 125 framing.

### Scooters and mopeds

- Maximum scale about 80% of the frame.
- Keep more white space than motorcycles.
- Do not scale up to fill empty space.

## Matching notes for this library

- Prefer generation-specific catalogue rows over collapsing a whole model onto one image.
- AMG derivatives (for example AMG G 63) and EV variants (for example G 580 EQ) must stay distinct catalogue models.
- Never infer AMG or EQ identity from a generic model string such as plain G-Class.
