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
    url = data.get("url")
    wid = data.get("wid")
    uid = data.get("uid")
    region = data.get("region")

    if not url or not wid:
        return jsonify({"error": "URL and WID are required"}), 400

    result = run_manual_site_check(url)

    ping_model.create_ping(
        wid=wid,
        is_up=result.get("is_up", False),
        latency_ms=result.get("latency_ms"),
        region=region,
        uid=uid
    )

    return jsonify({
        "status": "recorded",
        "is_up": result.get("is_up", False),
        "latency": result.get("latency_ms")
    }), 200
