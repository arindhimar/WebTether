# controllers/auth_controller.py
from flask import Blueprint, request, jsonify
from models.user_model import UserModel
from models.auth_model import AuthModel
from utils.jwt_utils import generate_token

auth_controller = Blueprint("auth_controller", __name__)
user_model = UserModel()
auth_model = AuthModel()

@auth_controller.route('/signup', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug logging
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        required_fields = ['name', 'email', 'password']
        if not all(key in data for key in required_fields):
            return jsonify({"error": f"Missing fields: {required_fields}"}), 400
        
        # Validate email format
        if "@" not in data['email']:
            return jsonify({"error": "Invalid email format"}), 400
        
        # Check for existing user
        if auth_model.get_auth_by_email(data['email']):
            return jsonify({"error": "Email already exists"}), 409
        
        # Create user
        user_data = {
            "name": data['name'],
            "wallet_address": data.get('wallet_address', '0x0000000000000000000000000000000000000000')
        }
        created_user = user_model.create_user(**user_data)
        print("User created:", created_user)  # Debug logging
        
        # Create auth record
        auth_data = auth_model.create_auth(
            user_id=created_user['id'],
            email=data['email'],
            password=data['password']
        )
        print("Auth record created:", auth_data)  # Debug logging
        
        # Generate token
        token = generate_token({"user_id": created_user['id']})
        
        return jsonify({
            "message": "User created successfully",
            "user_id": created_user['id'],
            "email": data['email'],
            "token": token
        }), 201
        
    except Exception as e:
        print("Signup error:", str(e)) 
        return jsonify({"error": "Registration failed", "details": str(e)}), 500
    
    
@auth_controller.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    required_fields = ['email', 'password']
    
    if not all(key in data for key in required_fields):
        return jsonify({"error": "Email and password are required"}), 400

    auth_data = auth_model.validate_credentials(data['email'], data['password'])
    if not auth_data:
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token({"user_id": auth_data['user_id']})
    return jsonify({
        "user_id": auth_data['user_id'],
        "email": auth_data['email'],
        "token": token
    }), 200