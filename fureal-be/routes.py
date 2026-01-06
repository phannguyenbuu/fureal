from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_bootstrap import Bootstrap5
from werkzeug.utils import secure_filename
import json, os, shutil
from models import ModelItem, ModelItemUpdate
from config import JSON_DIR

app = Flask(__name__)
app.secret_key = 'your-secret-key'  # Change this!
Bootstrap5(app)  # Nếu dùng flask-bootstrap
CORS(app)

@app.route('/')
def index():
    files = [f for f in os.listdir(JSON_DIR) if f.endswith('.json')]
    return render_template('index.html', files=files)

@app.route('/file/<filename>')
def view_file(filename):
    path = os.path.join(JSON_DIR, filename)
    if not os.path.exists(path):
        flash('File not found!', 'error')
        return redirect(url_for('index'))
    with open(path, 'r') as f:
        data = json.load(f)
    return render_template('edit_file.html', filename=filename, data=data)

@app.route('/file/<filename>/add', methods=['POST'])
def add_item(filename):
    try:
        item = ModelItem(**request.form.to_dict())
        path = os.path.join(JSON_DIR, filename)
        data = []
        if os.path.exists(path):
            with open(path, 'r') as f:
                data = json.load(f)
        data.append(item.dict())
        shutil.copy(path, path + '.bak')  # Backup
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        flash('Item added!', 'success')
    except Exception as e:
        flash(f'Validation error: {e}', 'error')
    return redirect(url_for('view_file', filename=filename))

@app.route('/file/<filename>/update/<int:index>', methods=['POST'])
def update_item(filename, index):
    path = os.path.join(JSON_DIR, filename)
    if not os.path.exists(path):
        flash('File not found!', 'error')
        return redirect(url_for('index'))
    update_data = {k: v[0] for k, v in request.form.items() if v[0]}
    with open(path, 'r') as f:
        data = json.load(f)
    if 0 <= index < len(data):
        data[index].update(update_data)
        shutil.copy(path, path + '.bak')
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        flash('Item updated!', 'success')
    else:
        flash('Invalid index!', 'error')
    return redirect(url_for('view_file', filename=filename))

@app.route('/file/<filename>/delete/<int:index>', methods=['POST'])
def delete_item(filename, index):
    path = os.path.join(JSON_DIR, filename)
    if not os.path.exists(path):
        return redirect(url_for('index'))
    with open(path, 'r') as f:
        data = json.load(f)
    if 0 <= index < len(data):
        data.pop(index)
        shutil.copy(path, path + '.bak')
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        flash('Item deleted!', 'success')
    return redirect(url_for('view_file', filename=filename))

@app.route('/create_file', methods=['POST'])
def create_file():
    filename = secure_filename(request.form['filename'] + '.json')
    path = os.path.join(JSON_DIR, filename)
    if os.path.exists(path):
        flash('File exists!', 'error')
    else:
        with open(path, 'w') as f:
            json.dump([], f)
        flash('File created!', 'success')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
