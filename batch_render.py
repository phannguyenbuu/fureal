import bpy
import sys
import os
import glob
from mathutils import Vector
from pathlib import Path

# Use Blender sys.argv after -- separator
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
folder_path = argv[0] if argv else "."

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def pro_lighting():
    bpy.context.scene.world.use_nodes = True
    bpy.context.scene.world.node_tree.nodes.clear()
    bg = bpy.context.scene.world.node_tree.nodes.new('ShaderNodeBackground')
    bg.inputs[0].default_value = (0.01, 0.01, 0.03, 1)
    out = bpy.context.scene.world.node_tree.nodes.new('ShaderNodeOutputWorld')
    bpy.context.scene.world.node_tree.links.new(bg.outputs[0], out.inputs[0])
    
    light_positions = [((10,-10,18), 3200), ((-6,-6,10), 1400), ((0,-16,12), 1600)]
    for i, ((x,y,z), energy) in enumerate(light_positions):
        light_data = bpy.data.lights.new(f"ProL{i}", 'AREA')
        light_data.energy = energy
        light_data.size = 4 if i==0 else 3
        light_obj = bpy.data.objects.new(f"ProL{i}", light_data)
        bpy.context.scene.collection.objects.link(light_obj)
        light_obj.location = (x,y,z)

def studio_material():
    mat = bpy.data.materials.new("CropPreview")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = (0.74, 0.74, 0.76, 1)
    bsdf.inputs['Metallic'].default_value = 0.7
    bsdf.inputs['Roughness'].default_value = 0.1
    output = mat.node_tree.nodes.new('ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs[0], output.inputs[0])
    
    for obj in [o for o in bpy.data.objects if o.type == 'MESH']:
        if obj.data:
            obj.data.materials.clear()
            obj.data.materials.append(mat)

def centered_large_fit():
    bbox_min = Vector((1e30, 1e30, 1e30))
    bbox_max = Vector((-1e30, -1e30, -1e30))
    
    for obj in bpy.data.objects:
        if obj.type != 'MESH': continue
        if not obj.data.vertices: continue
        for v in obj.data.vertices:
            wv = obj.matrix_world @ v.co
            bbox_min = Vector([min(bbox_min[i], wv[i]) for i in range(3)])
            bbox_max = Vector([max(bbox_max[i], wv[i]) for i in range(3)])
    
    center = (bbox_min + bbox_max) * 0.5
    diag = (bbox_max - bbox_min).length
    
    target_diag = 12.0
    distance = target_diag * 1.2
    
    cam_loc = center + Vector((distance*0.5, -distance*0.75, distance*0.6))
    cam_rot = (1.02, 0, 0.76)
    
    cam_data = bpy.data.cameras.new("CropCam")
    cam_data.lens = 35
    cam_obj = bpy.data.objects.new("CropCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = cam_rot
    bpy.context.scene.camera = cam_obj

def render_single(glb_path, output_path):
    print(f"🛏️ Rendering: {os.path.basename(glb_path)}")
    clear_scene()
    bpy.ops.import_scene.gltf(filepath=glb_path, import_pack_images=True)
    
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 2048
    scene.render.resolution_y = 2048
    scene.render.image_settings.file_format = 'PNG'
    scene.eevee.taa_render_samples = 16
    
    pro_lighting()
    studio_material()
    centered_large_fit()
    
    scene.render.filepath = os.path.abspath(output_path)
    bpy.ops.render.render(write_still=True)
    print(f"📸 Rendered: {output_path}")

# Batch processing
glb_files = glob.glob(os.path.join(folder_path, "**", "*.glb"), recursive=True)
glb_files = [f for f in glb_files if os.path.isfile(f)]

print(f"🚀 BATCH RENDER: {folder_path}")
print(f"📁 Found {len(glb_files)} GLB files")


subfolder_name = os.path.basename(os.path.normpath(folder_path))

output_dir = "static\\" + subfolder_name
os.makedirs(output_dir, exist_ok=True)

for i, glb in enumerate(glb_files, 1):
    base = Path(glb).stem
    output = os.path.join(output_dir, f"{base}.png")
    print(f"[{i}/{len(glb_files)}]")
    render_single(glb, output)

print("🎉 BATCH COMPLETE!")
