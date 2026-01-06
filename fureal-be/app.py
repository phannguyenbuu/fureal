from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_cors import CORS  # 🔥 THÊM NÀY
from werkzeug.utils import secure_filename
import json
import os
import shutil  # 🔥 Backup file
from models import ModelItem, ModelItemUpdate  # Giả sử models.py có sẵn
from config import JSON_DIR  # Giả sử config.py có JSON_DIR


app = Flask(__name__)
app.secret_key = 'your-secret-key'  # Change this!
CORS(app)


@app.route("/")
def index():
    model_lib_path = os.path.join(JSON_DIR, "modelLibrary.json")

    with open(model_lib_path, "r", encoding="utf-8") as f:
        model_library = json.load(f)

    return render_template(
        "index.html",
        model_library=model_library
    )


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


@app.route("/api/json/save/<filename>", methods=["POST"])
def save_json(filename):
    data = request.get_json()
    path = os.path.join(BASE_PATH, filename)

    if not path.startswith(BASE_PATH):
        return {"error": "invalid path"}, 400

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return {"status": "ok"}

@app.route("/api/update/<path:filename>/<int:index>", methods=["POST"])
def api_update(filename, index):
    path = os.path.join(JSON_DIR, filename)

    print("Update", path)

    if not os.path.exists(path):
        return {"error": "File not found"}, 404

    payload = request.json

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if index < 0 or index >= len(data):
        return {"error": "Invalid index"}, 400

    data[index].update(payload)

    # backup
    shutil.copy(path, path + ".bak")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return {"ok": True}


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
