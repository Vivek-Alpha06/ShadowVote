import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_banner():
    width = 1920
    height = 1080
    
    # 1. Base Dark Obsidian Background
    img = Image.new("RGBA", (width, height), (9, 9, 13, 255))
    
    # Left ambient purple radial glows
    glow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    logo_cx = 480
    logo_cy = 540
    
    # Draw soft radial gradient rings for purple ambient lighting
    for r in range(500, 0, -10):
        alpha = int(45 * (1 - (r / 500) ** 1.5))
        glow_draw.ellipse(
            [logo_cx - r, logo_cy - r, logo_cx + r, logo_cy + r],
            fill=(147, 51, 234, alpha)
        )
    for r in range(260, 0, -5):
        alpha = int(65 * (1 - (r / 260) ** 1.2))
        glow_draw.ellipse(
            [logo_cx - r, logo_cy - r, logo_cx + r, logo_cy + r],
            fill=(192, 132, 252, alpha)
        )
        
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(40))
    img = Image.alpha_composite(img, glow_layer)
    
    # 2. Exact Vector Polygons from Logo.tsx
    # viewBox: 4..44 in X (center 24), 6..42 in Y (center 24)
    scale = 14.5  # Large, crisp logo size
    offset_x = logo_cx - (24 * scale)
    offset_y = logo_cy - (24 * scale)
    
    poly1_raw = [
        (6, 8), (42, 8), (38.11, 14.98), (35.19, 14.98), (37.52, 10.59),
        (10.48, 10.59), (15.24, 19.36), (16.8, 19.56), (18.26, 22.16), (13.88, 22.06)
    ]
    poly2_raw = [
        (13.49, 12.39), (16.41, 12.49), (20.4, 19.56), (27.6, 19.56),
        (31.59, 12.49), (34.51, 12.39), (30.52, 19.46), (35.48, 19.56),
        (24, 40), (16.51, 26.74), (19.43, 26.74), (24, 34.82),
        (31.1, 22.26), (21.96, 22.26), (24, 25.94), (25.75, 22.85),
        (28.67, 22.85), (24, 31.03)
    ]
    
    def transform_poly(poly):
        return [(offset_x + p[0] * scale, offset_y + p[1] * scale) for p in poly]
        
    poly1 = transform_poly(poly1_raw)
    poly2 = transform_poly(poly2_raw)
    
    # Ambient Neon Glow around vector edges
    logo_glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    lg_draw = ImageDraw.Draw(logo_glow)
    lg_draw.polygon(poly1, fill=(168, 85, 247, 190))
    lg_draw.polygon(poly2, fill=(168, 85, 247, 190))
    
    logo_glow_wide = logo_glow.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img, logo_glow_wide)
    
    logo_glow_tight = logo_glow.filter(ImageFilter.GaussianBlur(10))
    img = Image.alpha_composite(img, logo_glow_tight)
    
    # 3D Depth Shadow below logo
    shadow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    sh_draw = ImageDraw.Draw(shadow_layer)
    poly1_sh = [(p[0] + 8, p[1] + 16) for p in poly1]
    poly2_sh = [(p[0] + 8, p[1] + 16) for p in poly2]
    sh_draw.polygon(poly1_sh, fill=(0, 0, 0, 240))
    sh_draw.polygon(poly2_sh, fill=(0, 0, 0, 240))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(12))
    img = Image.alpha_composite(img, shadow_layer)
    
    # 4x Supersampling for ultra-crisp vector rasterization
    ss = 4
    ss_mask = Image.new("L", (width * ss, height * ss), 0)
    ss_draw = ImageDraw.Draw(ss_mask)
    
    poly1_ss = [(p[0] * ss, p[1] * ss) for p in poly1]
    poly2_ss = [(p[0] * ss, p[1] * ss) for p in poly2]
    
    ss_draw.polygon(poly1_ss, fill=255)
    ss_draw.polygon(poly2_ss, fill=255)
    
    # Create smooth gradient
    y_min = int(min(min(p[1] for p in poly1_ss), min(p[1] for p in poly2_ss)))
    y_max = int(max(max(p[1] for p in poly1_ss), max(p[1] for p in poly2_ss)))
    
    grad_img = Image.new("RGBA", (width * ss, height * ss), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(grad_img)
    
    for y in range(max(0, y_min), min(height * ss, y_max + 1)):
        t = (y - y_min) / max(1, (y_max - y_min))
        # Top pure white (#ffffff) to bottom radiant violet (#c084fc)
        r = int(255 * (1 - t) + 192 * t)
        g = int(255 * (1 - t) + 132 * t)
        b = int(255 * (1 - t) + 252 * t)
        g_draw.line([(0, y), (width * ss, y)], fill=(r, g, b, 255))
        
    grad_img.putalpha(ss_mask)
    crisp_logo = grad_img.resize((width, height), Image.Resampling.LANCZOS)
    img = Image.alpha_composite(img, crisp_logo)
    
    # 3. Typography
    text_x = 880
    text_y_title = 445
    text_y_sub = 575
    
    # Load fonts
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 112)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 44)
    except:
        font_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 108)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 44)
            
    text_draw = ImageDraw.Draw(img)
    
    # Draw tracked title "SHADOWVOTE"
    title_text = "SHADOWVOTE"
    spacing = 16
    curr_x = text_x
    for i, char in enumerate(title_text):
        # Color "SHADOW" in white, "VOTE" in light purple/lavender (#e9d5ff)
        c = (255, 255, 255, 255) if i < 6 else (216, 180, 254, 255)
        text_draw.text((curr_x, text_y_title), char, fill=c, font=font_title)
        bbox = font_title.getbbox(char)
        char_w = bbox[2] - bbox[0]
        curr_x += char_w + spacing
        
    # Draw subtitle "Vote Privately. Verify Publicly."
    sub_text = "Vote Privately. Verify Publicly."
    text_draw.text((text_x + 4, text_y_sub), sub_text, fill=(203, 213, 225, 255), font=font_sub)
    
    # 4. Save Final Outputs
    final_rgb = img.convert("RGB")
    final_rgb.save("screenshots/shadowvote_banner.jpg", quality=96)
    final_rgb.save("screenshots/shadowvote_banner_hd.png")
    print("Banner rendered successfully and replaced in screenshots/shadowvote_banner.jpg!")

if __name__ == "__main__":
    create_banner()
