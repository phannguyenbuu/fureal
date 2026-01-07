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

from flask import jsonify  # Đã có

FENGSHUI_PATH = os.path.join(JSON_DIR, 'fengshui.json')

@app.route('/api/fengshui', methods=['GET'])
def get_fengshui():
    try:
        if os.path.exists(FENGSHUI_PATH):
            with open(FENGSHUI_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {}  # Default empty dict {element: {valid: [], invalid: []}}
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fengshui/<element>', methods=['PUT'])  # Update element
def update_fengshui_element(element):
    try:
        payload = request.get_json()
        if not os.path.exists(FENGSHUI_PATH):
            return jsonify({'error': 'File not found'}), 404
        with open(FENGSHUI_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        data[element] = {'valid': payload.get('valid', []), 'invalid': payload.get('invalid', [])}
        shutil.copy(FENGSHUI_PATH, FENGSHUI_PATH + '.bak')
        with open(FENGSHUI_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fengshui/<element>', methods=['DELETE'])
def delete_fengshui_element(element):
    try:
        if not os.path.exists(FENGSHUI_PATH):
            return jsonify({'error': 'File not found'}), 404
        with open(FENGSHUI_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        data.pop(element, None)
        shutil.copy(FENGSHUI_PATH, FENGSHUI_PATH + '.bak')
        with open(FENGSHUI_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fengshui', methods=['POST'])  # Add new element
def add_fengshui_element():
    try:
        element = request.json.get('element')
        payload = request.json.get('data', {})
        if not os.path.exists(FENGSHUI_PATH):
            data = {}
        else:
            with open(FENGSHUI_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
        data[element] = {'valid': payload.get('valid', []), 'invalid': payload.get('invalid', [])}
        shutil.copy(FENGSHUI_PATH, FENGSHUI_PATH + '.bak')
        with open(FENGSHUI_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/", defaults={"room": None})
@app.route("/<room>")
def index(room):
    with open("/var/www/creative/json/modelLibrary.json", encoding="utf-8") as f:
        model_library = json.load(f)

    model_library.sort(key=lambda x: x.get("label", "").lower())

    selected = None
    for item in model_library:
        if item["shortLabel"] == room or item["activeRoom"] == room:
            selected = item
            break

    return render_template(
        "index.html",
        model_library=model_library,
        selected=selected
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

@app.route("/api/update/<path:filename>/<int:index>", methods=["POST"])
def api_update(filename, index):
    path = os.path.join(JSON_DIR, filename)
    print("Update", path, flush=True)

    if not os.path.exists(path):
        return {"error": "File not found"}, 404

    try:
        payload = request.get_json(force=True)

        print("OK1")

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if index < 0 or index >= len(data):
            return {"error": "Invalid index"}, 400

        data[index].update(payload)

        shutil.copy(path, path + ".bak")

        print("OK2")

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        return {"ok": True}

    except PermissionError as e:
        print("❌ PERMISSION ERROR:", e, flush=True)
        return {"error": "Permission denied"}, 403

    except Exception as e:
        print("❌ ERROR:", e, flush=True)
        return {"error": str(e)}, 500
    

@app.route("/api/model/<path:filename>/materials", methods=["POST"])
def save_materials(filename):
    path = os.path.join(JSON_DIR, "modelLibrary.json")

    payload = request.json  # [{index, material}]

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    for item in data:
        if item["path"] == filename:
            item["materials"] = payload
            break

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



# USER

USERS_PATH = os.path.join(JSON_DIR, 'users.json')

@app.route('/api/user', methods=['GET'])
def get_users():
    page = request.args.get('page', 1, type=int)
    lead = request.args.get('lead', 1)
    try:
        # Proxy external API
        import requests
        resp = requests.get(f'https://admake.vn/api/user/?lead={lead}&page={page}')
        data = resp.json() if resp.ok else {'data': [], 'totalPages': 1}
        
        # Cache local nếu edit mode
        if os.path.exists(USERS_PATH):
            with open(USERS_PATH, 'r') as f:
                cached = json.load(f)
            data['cached'] = cached
        return jsonify(data)
    except:
        # Fallback local
        if os.path.exists(USERS_PATH):
            with open(USERS_PATH, 'r') as f:
                data = json.load(f)
            return jsonify({'data': data.get('data', []), 'totalPages': data.get('totalPages', 1)})
        return jsonify({'data': [], 'totalPages': 1})

@app.route('/api/user/<int:user_id>', methods=['PUT'])  # Update user
def update_user(user_id):
    try:
        payload = request.get_json()
        if not os.path.exists(USERS_PATH):
            return jsonify({'error': 'No local cache'}), 404
        with open(USERS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for user in data.get('data', []):
            if user.get('id') == user_id:
                user.update(payload)
                break
        shutil.copy(USERS_PATH, USERS_PATH + '.bak')
        with open(USERS_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user', methods=['POST'])  # Add user
@app.route('/api/user/<int:user_id>', methods=['DELETE'])  # Delete
def crud_user(user_id=None):
    # Tương tự update, implement add/delete với local cache
    # Sync với external nếu cần POST to admake.vn
    pass  # Extend tương tự fengshui







if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')



