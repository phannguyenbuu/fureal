import os

# Đường dẫn thư mục
path = r"D:\Dropbox\_Documents\_Vlance_2025\October\fureal\fureal3D\public\textures\diff"

# File output
output_file = "textures_list.txt"

print("📁 ĐANG LIỆT KÊ FILES...")
print("💾 Lưu vào:", output_file)

if os.path.exists(path):
    files = os.listdir(path)
    
    # Lưu vào file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("📁 TEXTURES/DIFF FILES LIST\n")
        f.write("=" * 60 + "\n\n")
        
        for file in sorted(files):
            full_path = os.path.join(path, file)
            size = os.path.getsize(full_path) / 1024  # KB
            f.write(f"✅ {file} ({size:.1f} KB)\n")
        
        f.write(f"\n📊 Tổng: {len(files)} files\n")
        f.write(f"📂 Thư mục: {path}\n")
    
    print("✅ ĐÃ LUU THANH CONG!")
    print(f"📄 Xem file: {output_file}")
    
    # In ra màn hình luôn
    print("\n📋 DANH SÁCH:")
    print("=" * 60)
    with open(output_file, 'r', encoding='utf-8') as f:
        print(f.read())
        
else:
    print("❌ Thư mục KHÔNG tồn tại!")
    with open(output_file, 'w') as f:
        f.write("❌ ERROR: Thư mục không tồn tại!\n")
        f.write(f"Path: {path}\n")
