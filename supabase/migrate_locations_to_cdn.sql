-- Migration: Update all locations to use BunnyCDN image URLs
-- This script updates the image_urls array in the locations table to point to BunnyCDN
-- Locations are mapped 1:1 with CDN location images (location-01.jpg → location-50.jpg)

-- Check how many locations you have (OPTIONAL)
-- SELECT COUNT(*) as total_locations FROM locations;

-- Update all locations using CTE with window functions
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

-- Verify the update (check first 5 locations)
-- SELECT id, name, image_urls FROM locations LIMIT 5;
