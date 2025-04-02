from flask import Blueprint
from controllers.validator_controller import ValidatorController
from middleware.auth_middleware import token_required

validator_routes = Blueprint('validator_routes', __name__)

@validator_routes.route('', methods=['GET'])
@token_required
def get_all_validators():
    return ValidatorController.get_all_validators()

@validator_routes.route('', methods=['POST'])
@token_required
def create_validator():
    return ValidatorController.create_validator()

@validator_routes.route('/<string:validator_id>', methods=['GET'])
@token_required
def get_validator(validator_id):
    return ValidatorController.get_validator(validator_id)

@validator_routes.route('/<string:validator_id>', methods=['PUT'])
@token_required
def update_validator(validator_id):
    return ValidatorController.update_validator(validator_id)

@validator_routes.route('/<string:validator_id>', methods=['DELETE'])
@token_required
def delete_validator(validator_id):
    return ValidatorController.delete_validator(validator_id)

@validator_routes.route('/stats', methods=['GET'])
@token_required
def get_validator_stats():
    return ValidatorController.get_validator_stats()

@validator_routes.route('/<string:validator_id>/websites', methods=['POST'])
@token_required
def assign_website(validator_id):
    return ValidatorController.assign_website(validator_id)

@validator_routes.route('/<string:validator_id>/websites/<string:website_id>', methods=['DELETE'])
@token_required
def remove_website(validator_id, website_id):
    return ValidatorController.remove_website(validator_id, website_id)

