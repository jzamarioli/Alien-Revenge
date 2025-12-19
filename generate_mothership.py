from PIL import Image, ImageDraw

# Create a 64x32 image with transparent background
img = Image.new('RGBA', (64, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Draw a red mothership shape
# Main body
draw.ellipse([(10, 10), (54, 26)], fill=(200, 0, 0, 255))
# Dome
draw.ellipse([(24, 6), (40, 18)], fill=(100, 200, 255, 255))
# Lights
draw.rectangle([(15, 18), (18, 20)], fill=(255, 255, 0, 255))
draw.rectangle([(25, 18), (28, 20)], fill=(255, 255, 0, 255))
draw.rectangle([(35, 18), (38, 20)], fill=(255, 255, 0, 255))
draw.rectangle([(45, 18), (48, 20)], fill=(255, 255, 0, 255))

img.save('assets/mothership.png')
print("mothership.png created")
