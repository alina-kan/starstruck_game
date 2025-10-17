from flask import Flask, jsonify
from flask_cors import CORS
from models import db, Player, Dialogue, Choice, Progress

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://flaskuser:flaskpass@localhost/dating_sim_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create tables if they don't exist
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return "Welcome to the Starstruck Dating Simulator API!"

# ==========================================================
# PLAYER CRUD
# ==========================================================

@app.route('/players', methods=['GET'])
def get_players():
    players = Player.query.all()
    return jsonify([{'id': p.id, 'name': p.name, 'pronouns': p.pronouns} for p in players])

@app.route('/players/<int:id>', methods=['GET'])
def get_player(id):
    player = Player.query.get_or_404(id)
    return jsonify({'id': player.id, 'name': player.name, 'pronouns': player.pronouns})

@app.route('/players', methods=['POST'])
def create_player():
    data = request.get_json()
    new_player = Player(name=data['name'], pronouns=data.get('pronouns'))
    db.session.add(new_player)
    db.session.commit()
    return jsonify({'message': 'Player created successfully!', 'id': new_player.id}), 201

@app.route('/players/<int:id>', methods=['PUT'])
def update_player(id):
    player = Player.query.get_or_404(id)
    data = request.get_json()
    player.name = data.get('name', player.name)
    player.pronouns = data.get('pronouns', player.pronouns)
    db.session.commit()
    return jsonify({'message': 'Player updated successfully!'})

@app.route('/players/<int:id>', methods=['DELETE'])
def delete_player(id):
    player = Player.query.get_or_404(id)
    db.session.delete(player)
    db.session.commit()
    return jsonify({'message': 'Player deleted successfully!'})

if __name__ == '__main__':
    app.run(debug=True)

