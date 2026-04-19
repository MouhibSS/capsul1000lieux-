#!/bin/bash

# --- CONFIGURATION ---
# Base directory where your folders already exist
BASE_DIR="cdn-images"

# Function to download images: download_img [folder] [count] [width] [height] [keyword] [prefix]
download_img() {
    local folder=$1
    local count=$2
    local width=$3
    local height=$4
    local keyword=$5
    local prefix=$6

    echo "------------------------------------------------"
    echo "📂 Processing: /$folder/ ($count images)"
    echo "------------------------------------------------"

    for i in $(seq -f "%02g" 1 $count); do
        # Using Unsplash Source for public domain style images
        # Format: https://source.unsplash.com/featured/WIDTHxHEIGHT/?KEYWORD
        # Note: We add a random seed (?sig=) to prevent getting the same image
        URL="https://source.unsplash.com/featured/${width}x${height}/?${keyword}&sig=${i}"
        DEST="$BASE_DIR/$folder/$prefix-$i.jpg"
        
        echo "📥 Downloading $prefix-$i.jpg..."
        curl -L -s "$URL" -o "$DEST"
        
        # Small sleep to be polite to the server
        sleep 0.5
    done
}

# --- EXECUTION ---

# 1. LOCATIONS (Priority 1) - 60 images
download_img "locations" 60 1200 800 "tunisia,interior,architecture" "location"

# 2. HERO (Priority 2) - 7 images
download_img "hero" 7 1920 1080 "tunisia,landscape,luxury" "hero"

# 3. CATEGORIES (Priority 3) - 10 images
# Note: These use generic keywords; you might want to manually adjust specific ones later
download_img "categories" 10 600 400 "apartment,villa,resort" "category"

# 4. FEATURED (Priority 4) - 8 images
download_img "featured" 8 800 600 "interior,design,modern" "featured"

# 5. AMENITIES (Priority 5) - 25 images
download_img "amenities" 25 400 400 "kitchen,pool,wifi,gym" "amenity"

# 6. STUDIO (Priority 6) - 5 images
download_img "studio" 5 800 600 "office,workspace,team" "studio"

# 7. ABOUT (Priority 7) - 4 images
download_img "about" 4 1200 800 "tunisia,culture,market" "about"

echo "✅ ALL DOWNLOADS COMPLETE!"
echo "Check your '$BASE_DIR' directory."