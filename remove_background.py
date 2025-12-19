from PIL import Image
import os
import collections

files = ['assets/spaceship.png', 'assets/alien1.png', 'assets/alien2.png', 'assets/alien3.png', 'assets/alien4.png', 'assets/alien5.png']

def distance(c1, c2):
    # Calculate Euclidean distance between two colors (ignoring alpha)
    r = c1[0] - c2[0]
    g = c1[1] - c2[1]
    b = c1[2] - c2[2]
    return (r*r + g*g + b*b) ** 0.5

def remove_bg(filename, tolerance=100):
    try:
        if not os.path.exists(filename):
            print(f"File not found: {filename}")
            return

        img = Image.open(filename)
        img = img.convert("RGBA")
        width, height = img.size
        pixels = img.load()

        # Potential seed points: corners
        seeds = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        
        # Pixels to clear
        to_clear = set()
        visited = set()

        # Run flood fill for EACH seed
        for seed_point in seeds:
            sx, sy = seed_point
            if (sx, sy) in visited:
                continue
                
            seed_color = pixels[sx, sy]
            
            queue = collections.deque([(sx, sy)])
            visited.add((sx, sy))
            
            # If the seed itself is already transparent, we still want to walk 
            # its neighbors to find *connected* non-transparent background noise if possible?
            # Or just assume if it's transparent, we already handled it. 
            # Let's assume we proceed.

            while queue:
                x, y = queue.popleft()
                
                # Check neighbors
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                        current_color = pixels[nx, ny]
                        
                        # Logic:
                        # 1. If it's transparent, it's "background", add to visited/queue to walk through it.
                        # 2. If it matches SEED color within tolerance, it's background.
                        
                        match = False
                        if current_color[3] == 0:
                            match = True
                        elif distance(current_color, seed_color) <= tolerance:
                            match = True
                            to_clear.add((nx, ny))
                        
                        if match:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            
            # After finishing one seed's connected area, we also ensure the seed point itself is cleared
            # (if it wasn't already)
            if distance(seed_color, seed_color) <= tolerance: # Always true
                 to_clear.add((sx, sy))

        # Apply transparency
        for x, y in to_clear:
            pixels[x, y] = (0, 0, 0, 0)

        img.save(filename, "PNG")
        print(f"Processed {filename} with tolerance {tolerance}")
    except Exception as e:
        print(f"Error processing {filename}: {e}")

for f in files:
    remove_bg(f)
