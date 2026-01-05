@echo off
"C:\Program Files\Blender Foundation\Blender 3.2\blender.exe" --background --python trimesh_render.py -- "%~1" "%~2"
