from flask import Blueprint, request, jsonify
from models.ping_model import PingModel

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
