import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__, 
    static_folder='static',
    template_folder='templates'
)

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

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)