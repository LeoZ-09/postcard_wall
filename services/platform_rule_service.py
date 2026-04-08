import re
from models import PlatformRule, db


class PlatformRuleService:
    @staticmethod
    def recognize_platform(postcard_code):
        if not postcard_code:
            return None

        rules = PlatformRule.query.filter_by(is_active=True).order_by(PlatformRule.priority.desc()).all()

        for rule in rules:
            try:
                if re.match(rule.pattern, postcard_code):
                    return {
                        'platform_type': rule.platform_type,
                        'rule_name': rule.name
                    }
            except re.error:
                continue
        return None

    @staticmethod
    def get_all_rules():
        return PlatformRule.query.order_by(PlatformRule.priority.desc(), PlatformRule.created_at.desc()).all()

    @staticmethod
    def create_rule(data):
        rule = PlatformRule(
            name=data['name'],
            pattern=data['pattern'],
            platform_type=data['platform_type'],
            priority=data.get('priority', 0),
            description=data.get('description', '')
        )
        db.session.add(rule)
        db.session.commit()
        return rule

    @staticmethod
    def update_rule(rule_id, data):
        rule = PlatformRule.query.get(rule_id)
        if not rule:
            return None
        rule.name = data.get('name', rule.name)
        rule.pattern = data.get('pattern', rule.pattern)
        rule.platform_type = data.get('platform_type', rule.platform_type)
        rule.priority = data.get('priority', rule.priority)
        rule.description = data.get('description', rule.description)
        rule.is_active = data.get('is_active', rule.is_active)
        db.session.commit()
        return rule

    @staticmethod
    def delete_rule(rule_id):
        rule = PlatformRule.query.get(rule_id)
        if not rule:
            return False
        db.session.delete(rule)
        db.session.commit()
        return True

    @staticmethod
    def initialize_default_rules():
        if PlatformRule.query.count() == 0:
            default_rules = [
                {'name': 'Postcards小邮局', 'pattern': r'^PC\d{8}$', 'platform_type': 'postcards', 'priority': 100, 'description': 'Postcards小邮局平台编码规则'},
                {'name': '相须Compose', 'pattern': r'^SX\d{10}$', 'platform_type': 'xiangxu', 'priority': 100, 'description': '相须平台编码规则'},
                {'name': '寻牍XunDu', 'pattern': r'^XD\d{6,8}$', 'platform_type': 'xundu', 'priority': 90, 'description': '寻牍平台编码规则'},
                {'name': '驴游Lyn', 'pattern': r'^LY\d{8}$', 'platform_type': 'lvyou', 'priority': 90, 'description': '驴游平台编码规则'},
                {'name': 'Generic通用', 'pattern': r'^[A-Z]{2}\d{6,12}$', 'platform_type': 'generic', 'priority': 10, 'description': '通用编码规则'}
            ]
            for rule_data in default_rules:
                PlatformRuleService.create_rule(rule_data)
            return True
        return False