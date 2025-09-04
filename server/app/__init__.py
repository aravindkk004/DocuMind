from flask import Flask
from flask_cors import CORS
from .routes.analyze_pdf import analyze_pdf_bp
from .routes.chat_with_pdf import chat_with_pdf_bp
from .routes.end_session import end_session_bp

def create_app():
    app = Flask(__name__)
    CORS(app, support_credentials=True)

    # Initialize session storage here
    app.session_vectorstores = {}  

    # Register blueprints
    app.register_blueprint(analyze_pdf_bp, url_prefix='/api')
    app.register_blueprint(chat_with_pdf_bp, url_prefix='/api')
    app.register_blueprint(end_session_bp, url_prefix='/api')

    # Session timeout config
    app.SESSION_TIMEOUT = 60 * 60  # 30 min
    app.CLEANUP_INTERVAL = 5 * 60  # 5 min

    # Start background cleanup thread
    import threading, time

    def cleanup_sessions():
        while True:
            current_time = time.time()
            expired_sessions = [
                sid for sid, data in app.session_vectorstores.items()
                if current_time - data['timestamp'] > app.SESSION_TIMEOUT
            ]
            for sid in expired_sessions:
                del app.session_vectorstores[sid]
            time.sleep(app.CLEANUP_INTERVAL)

    threading.Thread(target=cleanup_sessions, daemon=True).start()

    return app
