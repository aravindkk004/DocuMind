from flask import Blueprint, request, jsonify, current_app

end_session_bp = Blueprint('end_session', __name__)

@end_session_bp.route('/end_session', methods=['POST'])
def end_session():
    data = request.get_json()
    session_id = data.get("session_id")
    if session_id and session_id in current_app.session_vectorstores:
        del current_app.session_vectorstores[session_id]
        return jsonify({"status": "success", "message": "Session ended and data cleared."})
    return jsonify({"status": "error", "message": "Invalid session_id"}), 400
