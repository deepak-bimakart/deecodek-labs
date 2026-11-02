"""
Remove the white background from the DeeCodeK Labs logo and save as a transparent PNG.
Also create a dark-theme variant (inverted: dark text → light text for dark backgrounds).
"""
from PIL import Image
import numpy as np

def remove_white_bg(input_path, output_path, threshold=235):
    """
    Remove white/near-white background from an image.
    Pixels where R, G, B are all above threshold become fully transparent.
    Edge pixels are anti-aliased for smooth transitions.
    """
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Calculate "whiteness" — how close to white each pixel is
    # Use the minimum of R, G, B as the base (white = all high)
    min_rgb = np.minimum(np.minimum(r, g), b)
    max_rgb = np.maximum(np.maximum(r, g), b)
    
    # If all channels are above threshold, it's background → transparent
    # Use a smooth transition for anti-aliasing
    # alpha = how far below threshold the min channel is
    # If min_rgb >= threshold: fully transparent (alpha=0)
    # If min_rgb <= threshold - 30: fully opaque (alpha=255)
    # Linear interpolation in between
    
    bg_mask = min_rgb.astype(float)
    
    # Smooth alpha: 255 (opaque) when min_rgb is low, 0 (transparent) when min_rgb is high
    alpha_new = np.clip(255.0 * (threshold - bg_mask) / 30.0, 0, 255).astype(np.uint8)
    
    # Preserve original alpha where it was already semi-transparent
    alpha_new = np.minimum(alpha_new, a)
    
    data[:, :, 3] = alpha_new
    
    result = Image.fromarray(data, "RGBA")
    result.save(output_path, "PNG")
    print(f"  ✓ Saved transparent logo: {output_path}")
    print(f"    Size: {result.size}, Mode: {result.mode}")
    
    # Stats
    total = alpha_new.size
    transparent = np.sum(alpha_new < 10)
    print(f"    Transparent pixels: {transparent}/{total} ({100*transparent/total:.1f}%)")
    return result

def create_dark_variant(input_path, output_path, threshold=235):
    """
    Create a variant suitable for dark backgrounds.
    Dark blue text → light (white) text, green stays green-ish.
    """
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img).astype(np.int16)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Whiteness check for background
    min_rgb = np.minimum(np.minimum(r, g), b)
    is_bg = min_rgb >= threshold
    
    # For non-background pixels, invert dark colors to light
    # Dark blue (low R, G, B) → light (high R, G, B)
    # Green stays (medium R, high G, medium B) — boost slightly
    darkness = 255 - np.maximum(np.maximum(r, g), b)
    
    # Invert: where the pixel is dark, make it light
    # r_new = 255 - darkness (dark blue → light)
    r_new = np.where(is_bg, r, np.clip(255 - darkness, 0, 255).astype(np.uint8))
    g_new = np.where(is_bg, g, np.clip(255 - darkness, 0, 255).astype(np.uint8))
    b_new = np.where(is_bg, b, np.clip(255 - darkness, 0, 255).astype(np.uint8))
    
    # Keep green pixels green (high G relative to R and B)
    is_green = (g > r + 20) & (g > b + 20) & (~is_bg)
    r_new = np.where(is_green, r, r_new)
    g_new = np.where(is_green, g, g_new)
    b_new = np.where(is_green, b, b_new)
    
    data[:, :, 0] = r_new
    data[:, :, 1] = g_new
    data[:, :, 2] = b_new
    
    # Remove background (same as before)
    alpha_smooth = np.clip(255.0 * (threshold - min_rgb.astype(float)) / 30.0, 0, 255).astype(np.uint8)
    data[:, :, 3] = np.minimum(alpha_smooth, a)
    
    result = Image.fromarray(data.astype(np.uint8), "RGBA")
    result.save(output_path, "PNG")
    print(f"  ✓ Saved dark-variant logo: {output_path}")

if __name__ == "__main__":
    input_path = "/home/z/my-project/public/logo-original.png"
    
    # Light theme logo (transparent bg, original colors)
    remove_white_bg(input_path, "/home/z/my-project/public/logo-light.png")
    
    # Dark theme logo (transparent bg, inverted text for dark backgrounds)
    create_dark_variant(input_path, "/home/z/my-project/public/logo-dark.png")
    
    print("\nDone — both variants created.")
