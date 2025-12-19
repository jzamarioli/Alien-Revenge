from PIL import Image
import os

files = ['assets/spaceship.png', 'assets/alien1.png', 'assets/alien2.png', 'assets/alien3.png', 'assets/alien4.png', 'assets/alien5.png']

for f in files:
    if os.path.exists(f):
        try:
            img = Image.open(f)
            img = img.convert("RGBA")
            width, height = img.size
            pixels = img.load()
            
            transparent_count = 0
            total_pixels = width * height
            
            for y in range(height):
                for x in range(width):
                    if pixels[x, y][3] == 0:
                        transparent_count += 1
            
            ratio = transparent_count / total_pixels
            print(f"File: {f}, Transparency: {ratio:.1%} ({transparent_count}/{total_pixels} pixels)")
            
            # Check corners specifically
            corners = [(0,0), (width-1, 0), (0, height-1), (width-1, height-1)]
            corner_colors = [pixels[c] for c in corners]
            print(f"  Corners: {corner_colors}")

        except Exception as e:
            print(f"Error checking {f}: {e}")
    else:
        print(f"File not found: {f}")
