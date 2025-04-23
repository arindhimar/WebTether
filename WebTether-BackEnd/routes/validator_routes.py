from flask import Blueprint
from controllers.validator_controller import (
    get_all_validators,
    create_validator,
    get_validator,
    update_validator,
    delete_validator,
    get_validator_stats,
    assign_website_to_validator,
    remove_website_from_validator,
    ping_website,
    get_enhanced_validator_stats
)
from middleware.auth_middleware import auth_required

validator_bp = Blueprint('validator', __name__)

# Get all validators
@validator_bp.route('/', methods=['GET'])
@auth_required
def get_validators():
    return get_all_validators()

# Create a new validator
@validator_bp.route('/', methods=['POST'])
@auth_required
def create_new_validator():
    return create_validator()

# Get a specific validator
@validator_bp.route('/<validator_id>', methods=['GET'])
@auth_required
def get_validator_by_id(validator_id):
    return get_validator(validator_id)

# Update a validator
@validator_bp.route('/<validator_id>', methods=['PUT'])
@auth_required
def update_validator_by_id(validator_id):
    return update_validator(validator_id)

# Delete a validator
@validator_bp.route('/<validator_id>', methods=['DELETE'])
@auth_required
def delete_validator_by_id(validator_id):
    return delete_validator(validator_id)

# Get validator statistics
@validator_bp.route('/stats', methods=['GET'])
@auth_required
def get_stats():
    return get_validator_stats()

# Get enhanced validator statistics
@validator_bp.route('/enhanced-stats', methods=['GET'])
@auth_required
def get_enhanced_stats():
    return get_enhanced_validator_stats()

# Assign a website to a validator
@validator_bp.route('/<validator_id>/websites', methods=['POST'])
@auth_required
def assign_website(validator_id):
    return assign_website_to_validator(validator_id)

# Remove a website from a validator
@validator_bp.route('/<validator_id>/websites/<website_id>', methods=['DELETE'])
@auth_required
def remove_website(validator_id, website_id):
    return remove_website_from_validator(validator_id, website_id)

# Ping a website using a validator
@validator_bp.route('/<validator_id>/ping', methods=['POST'])
@auth_required
def ping_website_with_validator(validator_id):
    return ping_website(validator_id)

# Ping a specific website using a validator
@validator_bp.route('/<validator_id>/ping/<website_id>', methods=['POST'])
@auth_required
def ping_specific_website(validator_id, website_id):
    return ping_website(validator_id, website_id)
