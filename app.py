import os
from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
import base64
import subprocess
import tempfile
from pathlib import Path
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__, static_folder='static', static_url_path='/static')

# Configuration
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or os.urandom(24)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///particle_system.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

class ParticlePreset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    config = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)

# Initialize database
db.init_app(app)

# Create tables within application context
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

@app.route('/')
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error rendering index template: {e}")
        return "Error loading page", 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory(app.static_folder, filename)
    except Exception as e:
        logger.error(f"Error serving static file {filename}: {e}")
        return "File not found", 404

@app.route('/api/presets', methods=['GET'])
def list_presets():
    try:
        presets = ParticlePreset.query.order_by(ParticlePreset.likes.desc()).all()
        return jsonify([{
            'id': preset.id,
            'name': preset.name,
            'description': preset.description,
            'config': preset.config,
            'likes': preset.likes,
            'created_at': preset.created_at.isoformat()
        } for preset in presets])
    except Exception as e:
        logger.error(f"Error fetching presets: {e}")
        return jsonify({"error": "Failed to fetch presets"}), 500

@app.route('/api/presets', methods=['POST'])
def create_preset():
    try:
        data = request.get_json()
        preset = ParticlePreset(
            name=data['name'],
            description=data.get('description', ''),
            config=data['config']
        )
        db.session.add(preset)
        db.session.commit()
        return jsonify({
            'id': preset.id,
            'name': preset.name,
            'description': preset.description,
            'config': preset.config,
            'likes': preset.likes,
            'created_at': preset.created_at.isoformat()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating preset: {e}")
        return jsonify({"error": "Failed to create preset"}), 500

@app.route('/api/presets/<int:preset_id>/like', methods=['POST'])
def like_preset(preset_id):
    try:
        preset = ParticlePreset.query.get_or_404(preset_id)
        preset.likes += 1
        db.session.commit()
        return jsonify({'likes': preset.likes})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error liking preset {preset_id}: {e}")
        return jsonify({"error": "Failed to like preset"}), 500

@app.route('/export-video', methods=['POST'])
def export_video():
    try:
        data = request.get_json()
        frames = data['frames']
        format = data.get('format', 'mp4')
        frame_rate = data.get('frameRate', 30)

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Save frames as PNG files
            for i, frame in enumerate(frames):
                image_data = frame.split(',')[1]
                frame_path = temp_path / f"frame_{i:06d}.png"
                with open(frame_path, 'wb') as f:
                    f.write(base64.b64decode(image_data))

            output_path = temp_path / f"output.{format}"

            cmd = [
                'ffmpeg', '-framerate', str(frame_rate),
                '-i', str(temp_path / 'frame_%06d.png'),
                '-c:v', 'qtrle',
                '-q:v', '3',
                '-pix_fmt', 'rgb32',
                '-y', str(output_path)
            ]

            subprocess.run(cmd, check=True, capture_output=True)

            return send_file(
                output_path,
                mimetype=f'video/{format}',
                as_attachment=True,
                download_name=f'particle-animation.{format}'
            )
    except Exception as e:
        logger.error(f"Error exporting video: {e}")
        return jsonify({"error": "Failed to export video"}), 500

@app.errorhandler(404)
def not_found_error(error):
    logger.error(f"404 Error: {error}")
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 Error: {error}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    logger.info(f"Starting Flask server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)