import os
import hashlib
import shutil
from models import Image, db
from config import Config


class ImageService:
    @staticmethod
    def compute_hash(file_path):
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

    @staticmethod
    def find_by_hash(hash_value):
        return Image.query.filter_by(hash=hash_value).first()

    @staticmethod
    def create_image(file_obj, original_name):
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

        filename = f"{hashlib.sha256(str(os.urandom(16)).encode()).hexdigest()[:16]}.{original_name.rsplit('.', 1)[1].lower()}"
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file_obj.save(file_path)

        file_hash = ImageService.compute_hash(file_path)
        size = os.path.getsize(file_path)

        existing = ImageService.find_by_hash(file_hash)
        if existing:
            os.remove(file_path)
            existing.used_count += 1
            db.session.commit()
            return existing

        mime_type = f"image/{original_name.rsplit('.', 1)[1].lower()}"
        if mime_type == 'image/jpg':
            mime_type = 'image/jpeg'

        image = Image(
            filename=filename,
            original_name=original_name,
            hash=file_hash,
            mime_type=mime_type,
            size=size,
            path=file_path,
            used_count=1
        )
        db.session.add(image)
        db.session.commit()
        return image

    @staticmethod
    def get_all_images():
        return Image.query.order_by(Image.created_at.desc()).all()

    @staticmethod
    def get_image_by_id(image_id):
        return Image.query.get(image_id)

    @staticmethod
    def delete_image(image_id):
        image = Image.query.get(image_id)
        if not image:
            return False

        if image.used_count <= 1:
            if os.path.exists(image.path):
                os.remove(image.path)
            image.delete()
        else:
            image.used_count -= 1
            db.session.commit()
        return True