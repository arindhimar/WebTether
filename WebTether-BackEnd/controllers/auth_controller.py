from flask import Blueprint, request, jsonify
from models.auth_model import AuthModel
from models.user_model import UserModel
from utils.jwt_utils import generate_token

auth_controller = Blueprint("auth_controller", __name__)
auth_model = AuthModel()
user_model = UserModel()

@auth_controller.route('/signup', methods=['POST'])
def signup():
    data = request.json
    user_row = user_model.create_user(
        data["name"],
        data.get("isVisitor", False),
        data.get("secret_key")
    ).data[0]

    auth_row = auth_model.create_auth(
        data["email"],
        data["password"],
        user_row["id"]
    ).data[0]

    session_token = generate_token({"user_id": user_row["id"]})

    return jsonify({
        "user": {
            "id": user_row["id"],
            "name": user_row["name"],
            "isVisitor": user_row["isVisitor"]
        },
        "session": {
            "token": session_token,
            "expires_in": 86400
        }
    }), 201

@auth_controller.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    pw = data.get("password")

    auth_res = auth_model.sign_in(email, pw)
    if auth_res.get("status") != "success":
        return jsonify({"error": auth_res.get("reason", "Invalid credentials")}), 401

    user_row = user_model.get_user_by_id(auth_res["user"]["user_id"]).data
    session_token = generate_token({
        "user_id": user_row["id"],
        "email": email
    })

    return jsonify({
        "user": {
            "id": user_row["id"],
            "name": user_row["name"],
            "isVisitor": user_row["isVisitor"]
        },
        "token": session_token
    }), 200
