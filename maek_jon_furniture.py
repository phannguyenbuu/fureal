import os
import json
import random

def generate_model_json(obj_folder):
    """
    Duyệt tất cả file .glb trong thư mục src_folder_path/obj/
    Tạo JSON theo format yêu cầu
    """

    base_dir = os.path.basename(obj_folder)
    
    preview_folder = os.path.join(obj_folder, 'preview')
    
    if not os.path.exists(obj_folder):
        print(f"Thư mục {obj_folder} không tồn tại!")
        return
    
    data = []
    
    # Duyệt tất cả file .glb
    for filename in os.listdir(obj_folder):
        if filename.endswith('.glb'):
            # Type: srcFolder.name.split('_')[0]
            folder_name = base_dir.split('_')[0].lower()
            
            # Preview: thay .glb bằng .png
            preview_filename = filename.replace('.glb', '.png')
            preview = f"/preview/{base_dir}/{preview_filename}"
            
            # Name: type + tên file bỏ .glb (đơn giản hóa)
            model_name = filename.replace('.glb', '')
            name = f"{folder_name.capitalize()} {model_name}"
            
            # Cost: random(1000, 20000) * 1000
            cost = random.randint(1000, 20000) * 1000
            
            item = {
                "type": folder_name,
                "file": f"/models/{base_dir}/{filename}",
                "preview": preview,
                "name": name,
                "cost": cost,
                "color": "bw"
            }
            data.append(item)
    
    # Lưu file JSON
    output_file = base_dir + '.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Đã tạo file {output_file} với {len(data)} items!")
    # json.dumps(data, indent=2, ensure_ascii=False)


for root_dir in [
                    "Bed_37","Cabinet_39","Chair_26","Chair_29",
                     "Lamp_38",
                     "Table_09",
                     "Table_16",
                     "Table_21",
                     "Table_25",
                     "TV_35",
                     
                     ]:

    src_folder = f"fureal3D//public//models//{root_dir}"  # Hoặc đường dẫn đầy đủ
    generate_model_json(src_folder)
