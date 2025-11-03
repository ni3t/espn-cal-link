# Extension Icons

This directory should contain the following icon files for the ESPN Calendar Link extension:

## Required Icons

- **icon16.png** - 16x16 pixels (toolbar icon)
- **icon48.png** - 48x48 pixels (extension management page)
- **icon128.png** - 128x128 pixels (Chrome Web Store)

## Design Guidelines

### Recommended Design
- A calendar icon (📅) with an ESPN or sports-related element
- Simple, recognizable design that works at small sizes
- Colors that complement ESPN's red/black branding
- Clear contrast for visibility in both light and dark modes

### Design Ideas
1. Calendar icon with a small football/basketball overlay
2. Calendar page with "ESPN" text
3. Calendar icon with a play button or arrow
4. Sports ball icon integrated with calendar squares

## Creating Icons

### Option 1: Use an Online Tool
- [Figma](https://www.figma.com/) - Free design tool
- [Canva](https://www.canva.com/) - Free icon creator
- [Favicon.io](https://favicon.io/) - Quick icon generator

### Option 2: Use AI Tools
- DALL-E, Midjourney, or similar to generate icon designs
- Export at required sizes

### Option 3: Create from Emoji
Quick placeholder approach:
```bash
# Using ImageMagick (install with: brew install imagemagick)
convert -size 16x16 xc:white -pointsize 12 -font "Apple-Color-Emoji" -draw "text 2,14 '📅'" icon16.png
convert -size 48x48 xc:white -pointsize 36 -font "Apple-Color-Emoji" -draw "text 6,42 '📅'" icon48.png
convert -size 128x128 xc:white -pointsize 96 -font "Apple-Color-Emoji" -draw "text 16,112 '📅'" icon128.png
```

### Option 4: Use Open Source Icons
- [Iconoir](https://iconoir.com/)
- [Feather Icons](https://feathericons.com/)
- [Heroicons](https://heroicons.com/)

Look for calendar or schedule icons, then customize with colors.

## Testing Icons

After creating icons:
1. Load the extension in Chrome
2. Check toolbar icon (16x16) for clarity
3. View extension management page (48x48)
4. Prepare 128x128 for Chrome Web Store listing

## Placeholder

Until custom icons are created, you can use simple colored squares or emoji-based icons as placeholders. The extension will still function without custom icons, but professional icons improve user experience.
