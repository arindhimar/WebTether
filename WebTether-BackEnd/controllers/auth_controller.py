# controllers/auth_controller.py

from flask import Blueprint, request, jsonify
from models.user_model import UserModel

auth_controller = Blueprint("auth_controller", __name__)
user_model = UserModel()

@auth_controller.route('/signup', methods=['POST'])
def register():
    try:
        data = request.get_json()
                
        
        if not all(key in data for key in ['name', 'email', 'password']):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Create user
        created_user = user_model.create_user(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            wallet_address=data.get('wallet_address', '0x0000000000000000000000000000000000000000')
        )
        
        return jsonify({
            "message": "User created successfully",
            "user": created_user
        }), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Registration failed"}), 500

# @auth_controller.route("/signup", methods=["POST"])
# def register():
#     """
#     Register a new user by accepting name, email, password, and wallet address.
#     """
#     data = request.get_json(silent=True) or {}

#     name = data.get("name")
#     email = data.get("email")
#     password = data.get("password")
#     wallet_address = data.get("wallet_address")
    
#     if not(wallet_address):
#         wallet_address = "0x0000000000000000000000000000000000000000"

#     if not all([name, email, password, wallet_address]):
#         return jsonify({"error": "All fields are required"}), 400

#     existing_user = user_model.get_user_by_email(email)
#     if existing_user:
#         return jsonify({"error": "User already exists"}), 409

#     created_user = user_model.create_user(name, email, password, wallet_address)
#     if not created_user:
#         print("asdjkasjdhkaj")
#         return jsonify({"error": "User creation failed"}), 500

#     return jsonify(created_user), 201


@auth_controller.route("/login", methods=["POST"])
def login():
    """
    Authenticate an existing user using email and password.
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400

    user = user_model.validate_user(email, password)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify(user), 200
