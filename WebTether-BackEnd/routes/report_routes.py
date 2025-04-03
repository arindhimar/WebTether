from flask import Blueprint
from controllers.report_controller import ReportController
from middleware.auth_middleware import token_required

report_routes = Blueprint('report_routes', __name__)

@report_routes.route('', methods=['GET'])
@token_required
def get_all_reports():
    return ReportController.get_all_reports()

@report_routes.route('', methods=['POST'])
@token_required
def create_report():
    return ReportController.create_report()

@report_routes.route('/<string:report_id>', methods=['GET'])
@token_required
def get_report(report_id):
    return ReportController.get_report(report_id)

@report_routes.route('/<string:report_id>', methods=['PUT'])
@token_required
def update_report(report_id):
    return ReportController.update_report(report_id)

@report_routes.route('/<string:report_id>', methods=['DELETE'])
@token_required
def delete_report(report_id):
    return ReportController.delete_report(report_id)

@report_routes.route('/stats', methods=['GET'])
@token_required
def get_report_stats():
    return ReportController.get_report_stats()

