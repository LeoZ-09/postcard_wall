from datetime import datetime
from models import Postcard, db
from services.platform_rule_service import PlatformRuleService


class PostcardService:
    @staticmethod
    def calculate_travel_days(send_date, receive_date):
        if send_date and receive_date:
            return (receive_date - send_date).days
        return None

    @staticmethod
    def create_postcard(data):
        send_date = datetime.strptime(data['send_date'], '%Y-%m-%d').date() if data.get('send_date') else None
        receive_date = datetime.strptime(data['receive_date'], '%Y-%m-%d').date() if data.get('receive_date') else None

        travel_days = PostcardService.calculate_travel_days(send_date, receive_date)

        platform_type = None
        postcard_code = data.get('postcard_code')
        if postcard_code:
            recognized = PlatformRuleService.recognize_platform(postcard_code)
            if recognized:
                platform_type = recognized['platform_type']

        postcard = Postcard(
            front_image_id=data.get('front_image_id'),
            back_image_id=data.get('back_image_id'),
            send_date=send_date,
            receive_date=receive_date,
            travel_days=travel_days,
            postcard_code=postcard_code,
            platform_type=platform_type,
            description=data.get('description', '')
        )
        db.session.add(postcard)
        db.session.commit()
        return PostcardService.get_postcard_by_id(postcard.id)

    @staticmethod
    def update_postcard(postcard_id, data):
        postcard = Postcard.query.get(postcard_id)
        if not postcard:
            return None

        if 'send_date' in data and data['send_date']:
            postcard.send_date = datetime.strptime(data['send_date'], '%Y-%m-%d').date()
        if 'receive_date' in data and data['receive_date']:
            postcard.receive_date = datetime.strptime(data['receive_date'], '%Y-%m-%d').date()

        postcard.travel_days = PostcardService.calculate_travel_days(postcard.send_date, postcard.receive_date)

        if 'postcard_code' in data:
            postcard.postcard_code = data['postcard_code']
            recognized = PlatformRuleService.recognize_platform(data['postcard_code'])
            postcard.platform_type = recognized['platform_type'] if recognized else None

        if 'front_image_id' in data:
            postcard.front_image_id = data['front_image_id']
        if 'back_image_id' in data:
            postcard.back_image_id = data['back_image_id']
        if 'description' in data:
            postcard.description = data['description']

        db.session.commit()
        return PostcardService.get_postcard_by_id(postcard_id)

    @staticmethod
    def delete_postcard(postcard_id):
        postcard = Postcard.query.get(postcard_id)
        if not postcard:
            return False
        db.session.delete(postcard)
        db.session.commit()
        return True

    @staticmethod
    def get_postcard_by_id(postcard_id):
        return Postcard.query.get(postcard_id)

    @staticmethod
    def get_all_postcards(page=1, per_page=20, platform_type=None):
        query = Postcard.query

        if platform_type:
            query = query.filter_by(platform_type=platform_type)

        query = query.order_by(Postcard.created_at.desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'items': pagination.items,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }

    @staticmethod
    def get_stats():
        total = Postcard.query.count()
        traveling = Postcard.query.filter_by(receive_date=None).count()
        return {'total': total, 'traveling': traveling}