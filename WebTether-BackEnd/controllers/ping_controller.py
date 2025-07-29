from flask import Blueprint, request, jsonify
from models.ping_model import PingModel
from utils.selenium_checker import run_manual_site_check

ping_controller = Blueprint("ping_controller", __name__)
ping_model = PingModel()

@ping_controller.route('/ping', methods=['POST'])
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

@ping_controller.route('/ping', methods=['GET'])
def list_pings():
    res = ping_model.get_all_pings()
    return jsonify(res.data), 200

@ping_controller.route('/ping/<int:pid>', methods=['GET'])
def get_ping(pid):
    res = ping_model.get_ping_by_id(pid)
    return jsonify(res.data), 200

@ping_controller.route('/ping/<int:pid>', methods=['PUT'])
def update_ping(pid):
    data = request.json
    res = ping_model.update_ping(pid, data)
    return jsonify(res.data), 200

@ping_controller.route('/ping/<int:pid>', methods=['DELETE'])
def delete_ping(pid):
    ping_model.delete_ping(pid)
    return jsonify({"message": "Deleted"}), 200

@ping_controller.route('/ping/manual', methods=['POST'])
def manual_ping():
    data = request.json
    uid = data.get("uid")
    wid = data.get("wid")
    url = data.get("url")

    if not uid or not wid or not url:
        return jsonify({"error": "Missing uid, wid or url"}), 400

    user = user_model.get_user_by_id(uid).data
    agent_url = user.get("replit_agent_url")
    agent_token = user.get("replit_agent_token")

    if not agent_url or not agent_token:
        return jsonify({"error": "User has not linked a Replit agent"}), 400

    try:
        response = requests.post(agent_url, json={"url": url}, headers={"Authorization": f"Bearer {agent_token}"})
        result = response.json()

        ping_model.create_ping(
            wid=wid,
            is_up=result.get("is_up", False),
            latency_ms=result.get("latency_ms"),
            region=result.get("region"),
            uid=uid,
            replit_used=True
        )

        return jsonify({
            "status": "recorded",
            "result": result
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
