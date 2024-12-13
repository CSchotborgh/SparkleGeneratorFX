import os
from flask import Flask, render_template, request, jsonify, send_file
import base64
import subprocess
import tempfile
from pathlib import Path
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)

app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "particle_system_secret"
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///particle_system.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

class ParticlePreset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    config = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/presets', methods=['GET'])
def list_presets():
    presets = ParticlePreset.query.order_by(ParticlePreset.likes.desc()).all()
    return jsonify([{
        'id': preset.id,
        'name': preset.name,
        'description': preset.description,
        'config': preset.config,
        'likes': preset.likes,
        'created_at': preset.created_at.isoformat()
    } for preset in presets])

@app.route('/api/presets', methods=['POST'])
def create_preset():
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

@app.route('/api/presets/<int:preset_id>/like', methods=['POST'])
def like_preset(preset_id):
    preset = ParticlePreset.query.get_or_404(preset_id)
    preset.likes += 1
    db.session.commit()
    return jsonify({'likes': preset.likes})

@app.route('/export-video', methods=['POST'])
def export_video():
    data = request.get_json()
    frames = data['frames']
    format = data.get('format', 'mp4')
    frame_rate = data.get('frameRate', 30)
    
    # Create temporary directory for frames
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Save frames as PNG files
        for i, frame in enumerate(frames):
            # Remove data URL prefix
            image_data = frame.split(',')[1]
            frame_path = temp_path / f"frame_{i:06d}.png"
            with open(frame_path, 'wb') as f:
                f.write(base64.b64decode(image_data))
        
        # Output video path
        output_path = temp_path / f"output.{format}"
        
        # FFmpeg command based on format
        cmd = ['ffmpeg', '-framerate', str(frame_rate), '-i', str(temp_path / 'frame_%06d.png')]
        
        if format == 'avi':
            # AVI format with uncompressed RGBA
            cmd.extend([
                '-c:v', 'png',        # Use PNG codec for lossless compression with alpha
                '-pix_fmt', 'rgba',   # Use RGBA pixel format for alpha support
                '-preset', 'veryslow' # Maximum compression
            ])
        else:
            # Default to WebM with VP9 codec for better transparency support
            cmd.extend([
                '-c:v', 'libvpx-vp9',  # VP9 codec
                '-pix_fmt', 'yuva420p', # YUV with alpha
                '-lossless', '1',       # Lossless encoding
                '-quality', 'best',     # Best quality
                '-auto-alt-ref', '0'    # Disable alternate reference frames
            ])
            format = 'webm'  # Use WebM container for VP9
            
        # Add output file
        cmd.extend(['-y', str(output_path)])
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            with open(output_path, 'rb') as f:
                return send_file(
                    f,
                    mimetype=f'video/{format}',
                    as_attachment=True,
                    download_name=f'particle-animation.{format}'
                )
        except subprocess.CalledProcessError as e:
            return str(e.stderr), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)