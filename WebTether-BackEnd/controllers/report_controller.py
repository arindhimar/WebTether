from flask import Blueprint, request, jsonify
from models.report_model import ReportModel

report_controller = Blueprint("report_controller", __name__)
report_model = ReportModel()

@report_controller.route('/report', methods=['POST'])
def create_report():
    data = request.json
    res = report_model.create_report(
        data["pid"],
        data["reason"],
        data.get("uid")
    )
    return jsonify(res.data), 201

@report_controller.route('/report', methods=['GET'])
def list_reports():
    res = report_model.get_all_reports()
    return jsonify(res.data), 200

@report_controller.route('/report/<int:rid>', methods=['GET'])
def get_report(rid):
    res = report_model.get_report_by_id(rid)
    return jsonify(res.data), 200

@report_controller.route('/report/<int:rid>', methods=['PUT'])
def update_report(rid):
    data = request.json
    res = report_model.update_report(rid, data)
    return jsonify(res.data), 200

@report_controller.route('/report/<int:rid>', methods=['DELETE'])
def delete_report(rid):
    report_model.delete_report(rid)
    return jsonify({"message": "Deleted"}), 200
