from flask import Blueprint, request, jsonify
from models.ping_model import PingModel
from utils.jwt_utils import decode_token
import requests

ping_controller = Blueprint("ping_controller", __name__)
ping_model = PingModel()

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
    data = request.json
    uid = data.get("uid")
    wid = data.get("wid")
    url = data.get("url")

    if not uid or not wid or not url:
        return jsonify({"error": "Missing uid, wid, or url"}), 400

    # Cloudflare Worker URL is fixed (hosted by you)
    cloudflare_worker_url = os.getenv("CLOUDFLARE_WORKER_URL")
    if not cloudflare_worker_url:
        return jsonify({"error": "Cloudflare Worker URL is not configured"}), 500

    try:
        res = requests.post(cloudflare_worker_url, json={"url": url})
        result = res.json()

        ping_model.create_ping(
            wid=wid,
            is_up=result.get("is_up", False),
            latency_ms=result.get("latency_ms"),
            region=result.get("region"),
            uid=uid,
            replit_used=False
        )

        return jsonify({
            "status": "recorded",
            "result": result
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
