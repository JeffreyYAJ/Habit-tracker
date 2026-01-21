from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/habit_tracker'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    habits = db.relationship('Habit', backref='user', lazy=True, cascade='all, delete-orphan')

class Habit(db.Model):
    __tablename__ = 'habits'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    logs = db.relationship('HabitLog', backref='habit', lazy=True, cascade='all, delete-orphan')

class HabitLog(db.Model):
    __tablename__ = 'habit_logs'
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey('habits.id'), nullable=False)
    logged_date = db.Column(db.DateTime, default=datetime.utcnow)
    completed = db.Column(db.Boolean, default=True)

# Routes
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'id': user.id, 'username': user.username}), 201

@app.route('/api/habits', methods=['POST'])
def create_habit():
    data = request.get_json()
    habit = Habit(user_id=data['user_id'], name=data['name'], description=data.get('description'))
    db.session.add(habit)
    db.session.commit()
    return jsonify({'id': habit.id, 'name': habit.name}), 201

@app.route('/api/habits/<int:user_id>', methods=['GET'])
def get_habits(user_id):
    habits = Habit.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': h.id, 'name': h.name, 'description': h.description} for h in habits])

@app.route('/api/logs', methods=['POST'])
def log_habit():
    data = request.get_json()
    log = HabitLog(habit_id=data['habit_id'], completed=data.get('completed', True))
    db.session.add(log)
    db.session.commit()
    return jsonify({'id': log.id}), 201

if __name__ == '__main__':
    app.run(debug=True)