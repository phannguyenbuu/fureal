import cv2
import numpy as np
import sys

def auto_crop_navy_bg(input_path, output_path, max_size=1024):
    img = cv2.imread(input_path)
    if img is None: return False
    
    h, w = img.shape[:2]
    print(f"📏 ORIG: {w}x{h}")
    
    # Navy BG chính xác [52,26,26]
    bg_bgr = np.array([52, 26, 26], dtype=np.uint8)
    print(f"🟦 FIXED BG: BGR[52 26 26]")
    
    # HSV threshold navy tốt hơn (low contrast)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_navy = np.array([90, 0, 0])   # Navy HSV range
    upper_navy = np.array([130, 255, 60])
    mask = cv2.inRange(hsv, lower_navy, upper_navy)
    
    # Morphology clean noise
    kernel = np.ones((20,20), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    
    # Find model (inverse mask)
    model_mask = cv2.bitwise_not(mask)
    
    # Largest connected component
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(model_mask, connectivity=8)
    if num_labels < 2:
        print("⚠️ No model detected, fallback center")
        return center_crop_fallback(img, output_path, max_size)
    
    # Largest non-background component
    largest_label = np.argmax(stats[1:, cv2.CC_STAT_AREA]) + 1
    cc_x, cc_y, cc_w, cc_h, cc_area = stats[largest_label]
    
    print(f"🎯 Model: x={cc_x} y={cc_y} w={cc_w} h={cc_h} area={cc_area}")
    
    # Tight crop + aggressive pad 5-10%
    pad_ratio = 0.08
    pad_w = int(cc_w * pad_ratio)
    pad_h = int(cc_h * pad_ratio)
    
    x1 = max(0, cc_x - pad_w)
    y1 = max(0, cc_y - pad_h)
    x2 = min(w, cc_x + cc_w + pad_w)
    y2 = min(h, cc_y + cc_h + pad_h)
    
    crop = img[int(y1):int(y2), int(x1):int(x2)]
    crop_h, crop_w = crop.shape[:2]
    print(f"✂️ Tight: {crop_w}x{crop_h}")
    
    # Square pad navy nếu cần
    final_size = min(max_size, max(crop_w, crop_h))
    pad_crop = np.full((final_size, final_size, 3), bg_bgr, dtype=np.uint8)
    p_y = (final_size - crop_h) // 2
    p_x = (final_size - crop_w) // 2
    pad_crop[int(p_y):int(p_y+crop_h), int(p_x):int(p_x+crop_w)] = crop
    
    print(f"🟦 Navy pad {p_x}px L/R, {p_y}px T/B")
    cv2.imwrite(str(output_path), pad_crop)
    print(f"✅ {final_size}x{final_size} → {output_path}")
    return True

def center_crop_fallback(img, output_path, max_size):
    h, w = img.shape[:2]
    size = min(h, w, max_size)
    y1, x1 = (h - size) // 2, (w - size) // 2
    crop = img[int(y1):int(y1+size), int(x1):int(x1+size)]
    cv2.imwrite(str(output_path), crop)
    print(f"🔄 Fallback center {size}x{size}")
    return True


if __name__ == "__main__":
    import os 
    for root_dir in [
                     "static/Lamp_38/",
                     "static/Table_09/",
                     "static/Table_16/",
                     "static/Table_21/",
                     "static/Table_25/",
                     "static/TV_35/",
                     
                     ]:
        

        dest_dir = root_dir + "cropped"
        os.makedirs(dest_dir, exist_ok=True)

        # file = "004.png"
        # full_path = os.path.join(dest_dir, file)
        # auto_crop_navy_bg(root_dir + file, full_path)

        for dirpath, dirs, files in os.walk(root_dir):
            for file in files:
                if file.lower().endswith('.png'):
                    full_path = os.path.join(dest_dir, file)
                    print(f"File: {full_path}", root_dir + file)
                    # Thêm logic xử lý PNG (crop, resize, etc.)


                    auto_crop_navy_bg(root_dir + file, full_path)
