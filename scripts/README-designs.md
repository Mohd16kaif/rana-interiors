# Designs sync

Naming rule: type__space__room__source-ID.ext

- type: id from src/data/design-config.json types
- space: home, office, shop
- room: room id from config, or any
- source-ID: ours-001, pexels-1234567, unsplash-AbC123
- ext: .jpg .jpeg .png .webp only
- Use double underscore __ between the 4 parts.

Examples:
- pop__home__living-room__ours-001.jpg
- wardrobe__home__bedroom__pexels-1234567.webp
- tv-unit__home__any__unsplash-AbC123XyZ.png

Commands:
- npm run sync-designs -- D:\ri-3D\designs-raw --dry-run
- npm run sync-designs -- D:\ri-3D\designs-raw
- npm run sync-designs (uses default D:\ri-3D\designs-raw)

Notes:
- --dry-run only validates names and prints the plan. No .env needed.
- Real run needs CLOUDINARY_URL in .env. It uploads missing files to rana/designs, skips existing, never deletes, then writes public/data/designs.json.
- Put real photos in D:\ri-3D\designs-raw\. Sample names (not real files):
  - pop__home__living-room__ours-001.jpg
  - wardrobe__home__bedroom__pexels-1234567.webp
  - tv-unit__home__any__unsplash-AbC123XyZ.png

Find the photo ID:
- Pexels: open the photo page, URL looks like https://www.pexels.com/photo/some-name-1234567/ and the trailing digits 1234567 are the ID.
- Unsplash: open the photo page, URL looks like https://unsplash.com/photos/some-name-AbC123XyZ and the last token AbC123XyZ is the ID.
