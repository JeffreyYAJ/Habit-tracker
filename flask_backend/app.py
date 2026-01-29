from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from uuid import uuid4
import os

app = Flask(__name__)
CORS(app)

# Database configuration
db_user = os.getenv('DB_USER', 'user')
db_password = os.getenv('DB_PASSWORD', 'password')
db_host = os.getenv('DB_HOST', 'localhost')
db_port = os.getenv('DB_PORT', '5432')
db_name = os.getenv('DB_NAME', 'habit_tracker')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class Habit(db.Model):
    __tablename__ = 'habits'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(100), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completions = db.relationship('HabitCompletion', backref='habit', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'month': self.month,
            'year': self.year,
            'created_at': self.created_at.isoformat()
        }

class HabitCompletion(db.Model):
    __tablename__ = 'habit_completions'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    habit_id = db.Column(db.String(36), db.ForeignKey('habits.id'), nullable=False)
    day_number = db.Column(db.Integer, nullable=False)
    completed = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'habit_id': self.habit_id,
            'day_number': self.day_number,
            'completed': self.completed,
            'created_at': self.created_at.isoformat()
        }

# Routes
@app.route('/api/habits', methods=['GET'])
def get_habits():
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    
    query = Habit.query
    if month:
        query = query.filter_by(month=month)
    if year:
        query = query.filter_by(year=year)
    
    habits = query.order_by(Habit.created_at).all()
    return jsonify([h.to_dict() for h in habits]), 200

@app.route('/api/habits', methods=['POST'])
def create_habit():
    data = request.get_json()
    habit = Habit(
        name=data['name'],
        month=data['month'],
        year=data['year']
    )
    db.session.add(habit)
    db.session.commit()
    return jsonify(habit.to_dict()), 201

@app.route('/api/habits/<habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    habit = Habit.query.get(habit_id)
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    db.session.delete(habit)
    db.session.commit()
    return jsonify({'success': True}), 200

@app.route('/api/completions', methods=['GET'])
def get_completions():
    habit_ids = request.args.getlist('habit_id')
    
    if not habit_ids:
        completions = HabitCompletion.query.all()
    else:
        completions = HabitCompletion.query.filter(HabitCompletion.habit_id.in_(habit_ids)).all()
    
    return jsonify([c.to_dict() for c in completions]), 200

@app.route('/api/completions', methods=['POST'])
def create_completion():
    data = request.get_json()
    completion = HabitCompletion(
        habit_id=data['habit_id'],
        day_number=data['day_number'],
        completed=data.get('completed', True)
    )
    db.session.add(completion)
    db.session.commit()
    return jsonify(completion.to_dict()), 201

@app.route('/api/completions/<completion_id>', methods=['PUT'])
def update_completion(completion_id):
    completion = HabitCompletion.query.get(completion_id)
    if not completion:
        return jsonify({'error': 'Completion not found'}), 404
    
    data = request.get_json()
    completion.completed = data.get('completed', completion.completed)
    db.session.commit()
    return jsonify(completion.to_dict()), 200

@app.route('/api/completions', methods=['PUT'])
def update_completion_by_habit_day():
    data = request.get_json()
    completion = HabitCompletion.query.filter_by(
        habit_id=data['habit_id'],
        day_number=data['day_number']
    ).first()
    
    if not completion:
        return jsonify({'error': 'Completion not found'}), 404
    
    completion.completed = data.get('completed', completion.completed)
    db.session.commit()
    return jsonify(completion.to_dict()), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)