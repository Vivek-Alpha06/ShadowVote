from PIL import Image, ImageDraw, ImageFilter

def create_square_mark():
    size = 1000
    img = Image.new("RGBA", (size, size), (9, 9, 13, 255))
    
    # Ambient radial glow
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    cx, cy = size // 2, size // 2
    for r in range(450, 0, -10):
        alpha = int(50 * (1 - (r / 450) ** 1.3))
        g_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(147, 51, 234, alpha))
    for r in range(220, 0, -5):
        alpha = int(70 * (1 - (r / 220) ** 1.2))
        g_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(192, 132, 252, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(35))
    img = Image.alpha_composite(img, glow)
    
    # Exact logo polygons
    scale = 16.0
    offset_x = cx - (24 * scale)
    offset_y = cy - (24 * scale)
    
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
    
    poly1 = [(offset_x + p[0] * scale, offset_y + p[1] * scale) for p in poly1_raw]
    poly2 = [(offset_x + p[0] * scale, offset_y + p[1] * scale) for p in poly2_raw]
    
    # Outer neon glow
    logo_glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    lg_draw = ImageDraw.Draw(logo_glow)
    lg_draw.polygon(poly1, fill=(168, 85, 247, 190))
    lg_draw.polygon(poly2, fill=(168, 85, 247, 190))
    logo_glow_wide = logo_glow.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img, logo_glow_wide)
    
    logo_glow_tight = logo_glow.filter(ImageFilter.GaussianBlur(10))
    img = Image.alpha_composite(img, logo_glow_tight)
    
    # Shadow
    shadow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sh_draw = ImageDraw.Draw(shadow_layer)
    poly1_sh = [(p[0] + 8, p[1] + 16) for p in poly1]
    poly2_sh = [(p[0] + 8, p[1] + 16) for p in poly2]
    sh_draw.polygon(poly1_sh, fill=(0, 0, 0, 240))
    sh_draw.polygon(poly2_sh, fill=(0, 0, 0, 240))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(12))
    img = Image.alpha_composite(img, shadow_layer)
    
    # 4x Supersampling for crisp vector gradient
    ss = 4
    ss_mask = Image.new("L", (size * ss, size * ss), 0)
    ss_draw = ImageDraw.Draw(ss_mask)
    poly1_ss = [(p[0] * ss, p[1] * ss) for p in poly1]
    poly2_ss = [(p[0] * ss, p[1] * ss) for p in poly2]
    ss_draw.polygon(poly1_ss, fill=255)
    ss_draw.polygon(poly2_ss, fill=255)
    
    y_min = int(min(min(p[1] for p in poly1_ss), min(p[1] for p in poly2_ss)))
    y_max = int(max(max(p[1] for p in poly1_ss), max(p[1] for p in poly2_ss)))
    
    grad_img = Image.new("RGBA", (size * ss, size * ss), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(grad_img)
    for y in range(max(0, y_min), min(size * ss, y_max + 1)):
        t = (y - y_min) / max(1, (y_max - y_min))
        r = int(255 * (1 - t) + 192 * t)
        g = int(255 * (1 - t) + 132 * t)
        b = int(255 * (1 - t) + 252 * t)
        g_draw.line([(0, y), (size * ss, y)], fill=(r, g, b, 255))
        
    grad_img.putalpha(ss_mask)
    crisp_logo = grad_img.resize((size, size), Image.Resampling.LANCZOS)
    img = Image.alpha_composite(img, crisp_logo)
    
    final_rgb = img.convert("RGB")
    final_rgb.save("logo/shadowvote_minimal_logo.jpg", quality=96)
    print("Saved logo/shadowvote_minimal_logo.jpg")

if __name__ == "__main__":
    create_square_mark()
