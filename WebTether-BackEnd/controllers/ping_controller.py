from flask import Blueprint, request, jsonify
from models.ping_model import PingModel
from models.user_model import UserModel
from utils.jwt_utils import decode_token
import requests
import os

ping_controller = Blueprint("ping_controller", __name__)
ping_model = PingModel()
user_model = UserModel()

@ping_controller.route('/pings', methods=['POST'])
def create_ping():
    data = request.json
    res = ping_model.create_ping(
        data["wid"],
        data["is_up"],
        data.get("latency_ms"),
        data.get("region"),
        data.get("uid")
    )
    return jsonify(res.data), 201

@ping_controller.route('/pings', methods=['GET'])
def list_pings():
    return jsonify(ping_model.get_all_pings().data), 200

@ping_controller.route('/pings/<int:pid>', methods=['GET'])
def get_ping(pid):
    return jsonify(ping_model.get_ping_by_id(pid).data), 200

@ping_controller.route('/pings/<int:pid>', methods=['PUT'])
def update_ping(pid):
    data = request.json
    return jsonify(ping_model.update_ping(pid, data).data), 200

@ping_controller.route('/pings/<int:pid>', methods=['DELETE'])
def delete_ping(pid):
    ping_model.delete_ping(pid)
    return jsonify({"message": "Deleted"}), 200

@ping_controller.route('/pings/manual', methods=['POST'])
def manual_ping():
    try:
        # Get JWT token from Authorization header
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"error": "Authorization token required"}), 401

        # Decode token to get user info
        claims = decode_token(token)
        if not claims:
            return jsonify({"error": "Invalid token"}), 401

        data = request.json
        uid = data.get("uid")
        wid = data.get("wid")
        url = data.get("url")

        if not uid or not wid or not url:
            return jsonify({"error": "Missing uid, wid, or url"}), 400

        # Verify the user ID from token matches the request
        if claims.get("user_id") != uid:
            return jsonify({"error": "Token user ID doesn't match request"}), 403

        # Get user's Cloudflare Worker URL
        user_data = user_model.get_user_by_id(uid).data
        agent_url = user_data.get("agent_url")
        
        if not agent_url:
            return jsonify({"error": "Cloudflare Worker URL not configured. Please set it in your settings."}), 400

        # Call the user's Cloudflare Worker
        try:
            worker_response = requests.post(
                agent_url,
                json={"url": url},
                timeout=15,
                headers={"Content-Type": "application/json"}
            )
            
            if worker_response.status_code != 200:
                return jsonify({"error": f"Worker returned status {worker_response.status_code}"}), 500
                
            result = worker_response.json()
            
            # Save ping result to database
            ping_model.create_ping(
                wid=wid,
                is_up=result.get("is_up", False),
                latency_ms=result.get("latency_ms"),
                region=result.get("region", "cloudflare-edge"),
                uid=uid
            )

            return jsonify({
                "status": "recorded",
                "result": result
            }), 200
            
        except requests.exceptions.Timeout:
            return jsonify({"error": "Worker request timed out"}), 500
        except requests.exceptions.RequestException as e:
            return jsonify({"error": f"Failed to reach worker: {str(e)}"}), 500
        except ValueError as e:
            return jsonify({"error": "Invalid response from worker"}), 500
            
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500