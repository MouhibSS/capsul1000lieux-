# BunnyCDN Location Images Migration Guide

## Overview
This guide will update all location images in Supabase to use BunnyCDN URLs instead of Supabase Storage or external URLs.

## Current State
- ✅ 50 location images uploaded to BunnyCDN (`location-01.jpg` to `location-50.jpg`)
- ✅ CDN utility function created (`src/utils/cdn.js`)
- ✅ Static images (hero, categories, about) using CDN
- ⏳ Location images still need database update

---

## Step 1: Run the Migration SQL

### Option A: Using Supabase Dashboard (RECOMMENDED)

1. Go to: https://supabase.com → Your Project → SQL Editor
2. Create new query
3. Copy the entire contents of `migrate_locations_to_cdn.sql`
4. **IMPORTANT: First, run the count query to see how many locations you have:**
   ```sql
   SELECT COUNT(*) as total_locations FROM locations;
   ```
5. Review that the count matches your expected number
6. **UNCOMMENT** the main UPDATE statement (remove `--` at the start)
7. Run the migration
8. Verify with the SELECT query at the bottom

### Option B: Using Supabase CLI

```bash
supabase db push -- -f migrate_locations_to_cdn.sql
```

---

## Step 2: Understanding the Migration

The script does this:

```sql
-- Each location gets mapped to ONE CDN image:
Location #1 (created first) → location-01.jpg
Location #2 (created second) → location-02.jpg
Location #3 (created third) → location-03.jpg
...
Location #50 → location-50.jpg
```

**Note:** If you have MORE than 50 locations, the mapping will cycle:
- Location #51 → location-01.jpg (again)
- Location #52 → location-02.jpg (again)

To use multiple images per location, uncomment the alternative script in the SQL file.

---

## Step 3: Verify the Update

After running the migration, check in Supabase:

```sql
SELECT id, name, image_urls FROM locations LIMIT 5;
```

You should see something like:
```
id                                  | name           | image_urls
------------------------------------+----------------+--------------------
550e8400-e29b-41d4-a716-446655440000 | Villa Oasis   | {https://1000lieuxtn.b-cdn.net/locations/location-01.jpg}
550e8400-e29b-41d4-a716-446655440001 | Rooftop Tunis | {https://1000lieuxtn.b-cdn.net/locations/location-02.jpg}
...
```

---

## Step 4: Update React Component Mapping (if needed)

Currently, components use `location.images[0]`.

If your backend returns the `image_urls` array as `images`, no code changes needed.

If it's returned as `image_urls` instead, update the components:

**LocationCard.jsx**
```jsx
// FROM:
src={location.images[0]}

// TO:
src={location.image_urls?.[0] || location.images?.[0]}
```

Check how your hook transforms the data (look in `useFeaturedLocations()`, `useLocations()` hooks).

---

## Step 5: Test Everything

1. Run `npm run build`
2. Start dev server: `npm run dev`
3. Go to `/explore` and verify location images load
4. Go to `/location/:id` and verify detail images load
5. Check browser console for any 404 errors

---

## Troubleshooting

### Images still not loading?
- Check browser Network tab → verify BunnyCDN URLs are being requested
- Verify CDN Pull Zone is active: https://1000lieuxtn.b-cdn.net/locations/location-01.jpg
- Check Supabase table has been updated: `SELECT image_urls FROM locations LIMIT 1;`

### Some locations have no images?
- If you have more locations than CDN images, they'll cycle. To fix:
  - Upload more location images to BunnyCDN
  - Or update migration script to handle fallbacks

### Need to rollback?
Keep a backup of old image_urls before running migration, or restore from Supabase backup.

---

## File Mapping Reference

**BunnyCDN Location Images:**
```
/locations/location-01.jpg
/locations/location-02.jpg
...
/locations/location-50.jpg
```

**Database:**
```
locations.image_urls = ['https://1000lieuxtn.b-cdn.net/locations/location-01.jpg']
```

**Frontend:**
```jsx
// LocationCard, FeaturedCarousel, LocationDetail all use:
location.images[0]  // OR location.image_urls[0]
```

---

## Next Steps After Migration

1. ✅ All location images served from BunnyCDN
2. ✅ Better performance (CDN edge caching)
3. ✅ Responsive images with query parameters (width, quality)
4. 🔄 Optional: Add more CDN images and update more locations
5. 🔄 Optional: Implement image optimization (WebP, lazy loading)

---

## Questions?

- BunnyCDN URLs: https://1000lieuxtn.b-cdn.net/
- Migration script: `migrate_locations_to_cdn.sql`
- CDN utility: `src/utils/cdn.js`
