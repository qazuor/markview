# PWA Icons

This project uses SVG icons for the PWA manifest. While modern browsers support SVG icons, for better compatibility across all devices, you may want to generate PNG versions.

## Generating PNG Icons

To generate PNG icons from the SVG favicon, you can use one of these methods:

### Method 1: Using Inkscape (Recommended)

```bash
# Install Inkscape
sudo apt install inkscape

# Generate 192x192 icon
inkscape favicon.svg --export-filename=icon-192x192.png --export-width=192 --export-height=192

# Generate 512x512 icon
inkscape favicon.svg --export-filename=icon-512x512.png --export-width=512 --export-height=512
```

### Method 2: Using ImageMagick

```bash
# Install ImageMagick
sudo apt install imagemagick

# Generate 192x192 icon
convert -background none favicon.svg -resize 192x192 icon-192x192.png

# Generate 512x512 icon
convert -background none favicon.svg -resize 512x512 icon-512x512.png
```

### Method 3: Using Online Tools

You can also use online SVG to PNG converters:
- [Cloudconvert](https://cloudconvert.com/svg-to-png)
- [Convertio](https://convertio.co/svg-png/)

## Updating vite.config.ts

Once you have generated the PNG files, update `vite.config.ts`:

```typescript
icons: [
    {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
    },
    {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
    }
]
```

## Current Configuration

Currently, the project uses the SVG favicon for all icon sizes. This works in most modern browsers but may have limited support on older devices.
