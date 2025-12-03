from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models import db, Material
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'threejs-materials-2025-secret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///materials.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app, resources={r"/*": {"origins": "*"}})  # ✅ Full CORS

with app.app_context():
    db.create_all()

# Helper function: convert hex color to RGB for template
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

@app.route('/')
def index():
    materials = Material.query.all()
    # Pass RGB colors cho template preview
    materials_with_rgb = []
    for material in materials:
        rgb = hex_to_rgb(f'{material.color:06x}')
        materials_with_rgb.append({
            **material.__dict__,
            'rgb_color': rgb,
            'hex_color': f'{material.color:06x}'
        })
    return render_template('index.html', materials=materials_with_rgb)

@app.route('/create', methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        try:
            material = Material(
                name=request.form['name'],
                material_type=request.form['material_type'],
                color=int(request.form['color'], 16),
                metalness=float(request.form.get('metalness', 0)),
                roughness=float(request.form.get('roughness', 1.0)),
                transmission=float(request.form.get('transmission', 0)),
                thickness=float(request.form.get('thickness', 0)),
                ior=float(request.form.get('ior', 1.5)),
                specularIntensity=float(request.form.get('specularIntensity', 1.0)),
                specularColor=int(request.form.get('specularColor', 0xffffff), 16),
                clearcoat=float(request.form.get('clearcoat', 0)),
                clearcoatRoughness=float(request.form.get('clearcoatRoughness', 0)),
                envMapIntensity=float(request.form.get('envMapIntensity', 1.0)),
                transparent='transparent' in request.form,
                opacity=float(request.form.get('opacity', 1.0)),
                side=request.form.get('side', 'FrontSide'),
                normalMap=request.form.get('normalMap', ''),
                emissiveMap=request.form.get('emissiveMap', ''),
                aoMap=request.form.get('aoMap', ''),
                description=request.form.get('description', ''),
                created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            )
            db.session.add(material)
            db.session.commit()
            flash('🎨 Material created successfully!', 'success')
            return redirect(url_for('index'))
        except Exception as e:
            flash(f'Error: {str(e)}', 'danger')
    
    material_types = ['MeshPhysicalMaterial', 'MeshStandardMaterial', 'MeshBasicMaterial', 'MeshLambertMaterial']
    sides = ['FrontSide', 'BackSide', 'DoubleSide']
    return render_template('create.html', material_types=material_types, sides=sides)

@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit(id):
    material = Material.query.get_or_404(id)
    
    if request.method == 'POST':
        try:
            material.name = request.form['name']
            material.material_type = request.form['material_type']
            material.color = int(request.form['color'], 16)
            material.metalness = float(request.form.get('metalness', 0))
            material.roughness = float(request.form.get('roughness', 1.0))
            material.transmission = float(request.form.get('transmission', 0))
            material.thickness = float(request.form.get('thickness', 0))
            material.ior = float(request.form.get('ior', 1.5))
            material.specularIntensity = float(request.form.get('specularIntensity', 1.0))
            material.specularColor = int(request.form.get('specularColor', 0xffffff), 16)
            material.clearcoat = float(request.form.get('clearcoat', 0))
            material.clearcoatRoughness = float(request.form.get('clearcoatRoughness', 0))
            material.envMapIntensity = float(request.form.get('envMapIntensity', 1.0))
            material.transparent = 'transparent' in request.form
            material.opacity = float(request.form.get('opacity', 1.0))
            material.side = request.form.get('side', 'FrontSide')
            material.normalMap = request.form.get('normalMap', '')
            material.emissiveMap = request.form.get('emissiveMap', '')
            material.aoMap = request.form.get('aoMap', '')
            material.description = request.form.get('description', '')
            
            db.session.commit()
            flash('✨ Material updated successfully!', 'success')
            return redirect(url_for('index'))
        except Exception as e:
            flash(f'Error updating: {str(e)}', 'danger')
    
    material_types = ['MeshPhysicalMaterial', 'MeshStandardMaterial', 'MeshBasicMaterial', 'MeshLambertMaterial']
    sides = ['FrontSide', 'BackSide', 'DoubleSide']
    return render_template('edit.html', material=material, material_types=material_types, sides=sides)

@app.route('/delete/<int:id>')
def delete(id):
    material = Material.query.get_or_404(id)
    material_name = material.name
    db.session.delete(material)
    db.session.commit()
    flash(f'🗑️ "{material_name}" deleted successfully!', 'danger')
    return redirect(url_for('index'))

# ✅ API Endpoints cho Three.js
@app.route('/api/materials')
def api_materials():
    materials = Material.query.all()
    return jsonify([{
        'id': m.id,
        'name': m.name,
        'type': m.material_type,
        'color': m.color,
        'metalness': m.metalness,
        'roughness': m.roughness,
        'transmission': m.transmission,
        'thickness': m.thickness,
        'ior': m.ior,
        'specularIntensity': m.specularIntensity,
        'specularColor': m.specularColor,
        'clearcoat': m.clearcoat,
        'clearcoatRoughness': m.clearcoatRoughness,
        'envMapIntensity': m.envMapIntensity,
        'transparent': m.transparent,
        'opacity': m.opacity,
        'side': m.side
    } for m in materials])

@app.route('/api/materials/<int:id>')
def api_material(id):
    material = Material.query.get_or_404(id)
    return jsonify({
        'id': material.id,
        'name': material.name,
        'type': material.material_type,
        # ... all properties
    })

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
