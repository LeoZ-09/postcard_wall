import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config
from models import db
from models import Postcard, Image, PlatformRule
from services.image_service import ImageService
from services.postcard_service import PostcardService
from services.platform_rule_service import PlatformRuleService

app = Flask(__name__, static_folder='../client', static_url_path='')
app.config.from_object(Config)
CORS(app)
db.init_app(app)


def serialize_postcard(postcard):
    return {
        'id': postcard.id,
        'front_image_id': postcard.front_image_id,
        'back_image_id': postcard.back_image_id,
        'front_image': {
            'id': postcard.front_image.id,
            'filename': postcard.front_image.filename,
            'url': f'/api/images/{postcard.front_image.id}'
        } if postcard.front_image else None,
        'back_image': {
            'id': postcard.back_image.id,
            'filename': postcard.back_image.filename,
            'url': f'/api/images/{postcard.back_image.id}'
        } if postcard.back_image else None,
        'send_date': postcard.send_date.isoformat() if postcard.send_date else None,
        'receive_date': postcard.receive_date.isoformat() if postcard.receive_date else None,
        'travel_days': postcard.travel_days,
        'postcard_code': postcard.postcard_code,
        'platform_type': postcard.platform_type,
        'description': postcard.description,
        'created_at': postcard.created_at.isoformat() if postcard.created_at else None
    }


def serialize_image(image):
    return {
        'id': image.id,
        'filename': image.filename,
        'original_name': image.original_name,
        'hash': image.hash,
        'size': image.size,
        'url': f'/api/images/{image.id}',
        'used_count': image.used_count
    }


def serialize_rule(rule):
    return {
        'id': rule.id,
        'name': rule.name,
        'pattern': rule.pattern,
        'platform_type': rule.platform_type,
        'priority': rule.priority,
        'is_active': rule.is_active,
        'description': rule.description
    }


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})


@app.route('/api/postcards', methods=['GET'])
def get_postcards():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    platform_type = request.args.get('platform_type')

    result = PostcardService.get_all_postcards(page, per_page, platform_type)
    return jsonify({
        'success': True,
        'data': {
            'items': [serialize_postcard(p) for p in result['items']],
            'total': result['total'],
            'page': result['page'],
            'pages': result['pages']
        }
    })


@app.route('/api/postcards/<int:postcard_id>', methods=['GET'])
def get_postcard(postcard_id):
    postcard = PostcardService.get_postcard_by_id(postcard_id)
    if not postcard:
        return jsonify({'success': False, 'message': '明信片不存在'}), 404
    return jsonify({'success': True, 'data': serialize_postcard(postcard)})


@app.route('/api/postcards', methods=['POST'])
def create_postcard():
    front_image_id = None
    back_image_id = None

    if 'front_image' in request.files:
        file = request.files['front_image']
        if file and file.filename:
            image = ImageService.create_image(file, file.filename)
            front_image_id = image.id

    if 'back_image' in request.files:
        file = request.files['back_image']
        if file and file.filename:
            image = ImageService.create_image(file, file.filename)
            back_image_id = image.id

    data = request.form.to_dict()
    if 'front_image_id' in data and data['front_image_id']:
        front_image_id = int(data['front_image_id'])
    if 'back_image_id' in data and data['back_image_id']:
        back_image_id = int(data['back_image_id'])

    data['front_image_id'] = front_image_id
    data['back_image_id'] = back_image_id

    postcard = PostcardService.create_postcard(data)
    return jsonify({'success': True, 'data': serialize_postcard(postcard)}), 201


@app.route('/api/postcards/<int:postcard_id>', methods=['PUT'])
def update_postcard(postcard_id):
    postcard = PostcardService.get_postcard_by_id(postcard_id)
    if not postcard:
        return jsonify({'success': False, 'message': '明信片不存在'}), 404

    data = request.form.to_dict()

    if 'front_image' in request.files:
        file = request.files['front_image']
        if file and file.filename:
            image = ImageService.create_image(file, file.filename)
            data['front_image_id'] = image.id

    if 'back_image' in request.files:
        file = request.files['back_image']
        if file and file.filename:
            image = ImageService.create_image(file, file.filename)
            data['back_image_id'] = image.id

    if 'front_image_id' in data:
        data['front_image_id'] = int(data['front_image_id']) if data['front_image_id'] else None
    if 'back_image_id' in data:
        data['back_image_id'] = int(data['back_image_id']) if data['back_image_id'] else None

    updated = PostcardService.update_postcard(postcard_id, data)
    return jsonify({'success': True, 'data': serialize_postcard(updated)})


@app.route('/api/postcards/<int:postcard_id>', methods=['DELETE'])
def delete_postcard(postcard_id):
    result = PostcardService.delete_postcard(postcard_id)
    return jsonify({'success': result, 'message': '删除成功' if result else '明信片不存在'})


@app.route('/api/postcards/stats', methods=['GET'])
def get_stats():
    stats = PostcardService.get_stats()
    return jsonify({'success': True, 'data': stats})


@app.route('/api/images', methods=['GET'])
def get_images():
    images = ImageService.get_all_images()
    return jsonify({'success': True, 'data': [serialize_image(img) for img in images]})


@app.route('/api/images/<int:image_id>', methods=['GET'])
def get_image(image_id):
    image = ImageService.get_image_by_id(image_id)
    if not image:
        return jsonify({'success': False, 'message': '图片不存在'}), 404
    return send_from_directory(os.path.dirname(image.path), image.filename)


@app.route('/api/images', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': '没有文件'}), 400

    file = request.files['image']
    if not file.filename:
        return jsonify({'success': False, 'message': '没有选择文件'}), 400

    image = ImageService.create_image(file, file.filename)
    return jsonify({'success': True, 'data': serialize_image(image)}), 201


@app.route('/api/images/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    result = ImageService.delete_image(image_id)
    return jsonify({'success': result, 'message': '删除成功' if result else '图片不存在'})


@app.route('/api/images/check', methods=['GET'])
def check_duplicate():
    hash_value = request.args.get('hash')
    if not hash_value:
        return jsonify({'success': False, 'message': '缺少hash参数'}), 400

    existing = ImageService.find_by_hash(hash_value)
    if existing:
        return jsonify({'success': True, 'data': {'exists': True, 'image': serialize_image(existing)}})
    return jsonify({'success': True, 'data': {'exists': False}})


@app.route('/api/rules', methods=['GET'])
def get_rules():
    rules = PlatformRuleService.get_all_rules()
    return jsonify({'success': True, 'data': [serialize_rule(r) for r in rules]})


@app.route('/api/rules', methods=['POST'])
def create_rule():
    data = request.json
    if not all(k in data for k in ['name', 'pattern', 'platform_type']):
        return jsonify({'success': False, 'message': '缺少必要参数'}), 400

    try:
        import re
        re.compile(data['pattern'])
    except re.error:
        return jsonify({'success': False, 'message': '无效的正则表达式'}), 400

    rule = PlatformRuleService.create_rule(data)
    return jsonify({'success': True, 'data': serialize_rule(rule)}), 201


@app.route('/api/rules/<int:rule_id>', methods=['PUT'])
def update_rule(rule_id):
    data = request.json
    rule = PlatformRuleService.update_rule(rule_id, data)
    if not rule:
        return jsonify({'success': False, 'message': '规则不存在'}), 404
    return jsonify({'success': True, 'data': serialize_rule(rule)})


@app.route('/api/rules/<int:rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    result = PlatformRuleService.delete_rule(rule_id)
    return jsonify({'success': result, 'message': '删除成功' if result else '规则不存在'})


@app.route('/api/rules/initialize', methods=['POST'])
def initialize_rules():
    PlatformRuleService.initialize_default_rules()
    return jsonify({'success': True, 'message': '默认规则初始化成功'})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        PlatformRuleService.initialize_default_rules()

    app.run(host='0.0.0.0', port=3001, debug=True)