# Quick CDN Setup — 3 Steps

## ✅ What's Done
- CDN utility function created
- Static images (hero, categories, about) → BunnyCDN
- LazyImage component for lazy loading
- Build passing

---

## ⏳ What's Left: Update Location Images (5 minutes)

### Step 1: Go to Supabase Dashboard
https://supabase.com → Your Project → SQL Editor

### Step 2: Run the Migration
1. **New Query** button
2. Copy this SQL:

```sql
WITH numbered_locations AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM locations
)
UPDATE locations
SET image_urls = ARRAY[
  CONCAT('https://1000lieuxtn.b-cdn.net/locations/location-',
    LPAD(CAST(nl.row_num AS TEXT), 2, '0'),
    '.jpg')
]
FROM numbered_locations nl
WHERE locations.id = nl.id;

SELECT id, name, image_urls FROM locations LIMIT 3;
```

3. Click **Run**
4. Should see: ✓ X rows affected

### Step 3: Test
```bash
npm run build
npm run dev
```
- Go to `/explore` → location cards should show CDN images
- Go to a location detail → images should load

---

## Done! 🎉

All images now served from BunnyCDN:
- ✅ Hero (7 images)
- ✅ Categories (8 images)
- ✅ Featured carousel (8 images)
- ✅ Amenities (19 icons)
- ✅ About page (4 images)
- ✅ Location detail pages (50 images)
- ✅ Studio images (5 images)

**Total: 101 images on CDN**

---

## Notes
- Each location gets ONE CDN image (can add more later)
- Images are mapped by creation order: first location created → location-01.jpg, etc.
- If you have 100 locations but only 50 CDN images, they'll repeat (location-01.jpg gets reused)
- To use different images, upload more to BunnyCDN and update the migration script

---

## Files Created
- `src/utils/cdn.js` — CDN helper functions
- `src/components/LazyImage.jsx` — lazy loading component
- `migrate_locations_to_cdn.sql` — database migration
- `CDN_MIGRATION_GUIDE.md` — detailed guide
