from flask import Flask, jsonify, render_template
from flask_cors import CORS
from models import db, Player, Character, Dialogue, Choice, Progress

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://flaskuser:flaskpass@localhost/starstruck_game'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create tables if they don't exist
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

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

# ==========================================================
# CHARACTER CRUD
# ==========================================================

@app.route('/characters', methods=['GET'])
def get_characters():
    characters = Character.query.all()
    return jsonify([{'id': c.id, 'name': c.name, 'description': c.description, 'image_url': c.image_url} for c in characters])

@app.route('/characters/<int:id>', methods=['GET'])
def get_character(id):
    c = Character.query.get_or_404(id)
    return jsonify({'id': c.id, 'name': c.name, 'description': c.description, 'image_url': c.image_url})

@app.route('/characters', methods=['POST'])
def create_character():
    data = request.get_json()
    new_char = Character(name=data['name'], description=data.get('description'), image_url=data.get('image_url'))
    db.session.add(new_char)
    db.session.commit()
    return jsonify({'message': 'Character created successfully!', 'id': new_char.id}), 201

@app.route('/characters/<int:id>', methods=['PUT'])
def update_character(id):
    c = Character.query.get_or_404(id)
    data = request.get_json()
    c.name = data.get('name', c.name)
    c.description = data.get('description', c.description)
    c.image_url = data.get('image_url', c.image_url)
    db.session.commit()
    return jsonify({'message': 'Character updated successfully!'})

@app.route('/characters/<int:id>', methods=['DELETE'])
def delete_character(id):
    c = Character.query.get_or_404(id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({'message': 'Character deleted successfully!'})

# ==========================================================
# DIALOGUE CRUD
# ==========================================================

@app.route('/dialogues', methods=['GET'])
def get_dialogues():
    dialogues = Dialogue.query.all()
    result = []
    for d in dialogues:
        result.append({
            'id': d.id,
            'text': d.text,
            'scene': d.scene,
            'character': {
                'id': d.character.id if d.character else None,
                'name': d.character.name if d.character else None,
                'image_url': d.character.image_url if d.character else None
            },
            'choices': [
                {'id': c.id, 'text': c.text, 'next_dialogue_id': c.next_dialogue_id}
                for c in d.choices
            ]
        })
    return jsonify(result)

@app.route('/dialogues/<int:id>', methods=['GET'])
def get_dialogue(id):
    d = Dialogue.query.get_or_404(id)
    return jsonify({'id': d.id, 'text': d.text, 'scene': d.scene, 'character': d.character})

@app.route('/dialogues', methods=['POST'])
def create_dialogue():
    data = request.get_json()
    new_dialogue = Dialogue(text=data['text'], scene=data.get('scene'), character=data.get('character'))
    db.session.add(new_dialogue)
    db.session.commit()
    return jsonify({'message': 'Dialogue created successfully!', 'id': new_dialogue.id}), 201

@app.route('/dialogues/<int:id>', methods=['PUT'])
def update_dialogue(id):
    d = Dialogue.query.get_or_404(id)
    data = request.get_json()
    d.text = data.get('text', d.text)
    d.scene = data.get('scene', d.scene)
    d.character = data.get('character', d.character)
    db.session.commit()
    return jsonify({'message': 'Dialogue updated successfully!'})

@app.route('/dialogues/<int:id>', methods=['DELETE'])
def delete_dialogue(id):
    d = Dialogue.query.get_or_404(id)
    db.session.delete(d)
    db.session.commit()
    return jsonify({'message': 'Dialogue deleted successfully!'})

# ==========================================================
# CHOICE CRUD
# ==========================================================

@app.route('/choices', methods=['GET'])
def get_choices():
    choices = Choice.query.all()
    return jsonify([{'id': c.id, 'dialogue_id': c.dialogue_id, 'text': c.text, 'next_dialogue_id': c.next_dialogue_id} for c in choices])

@app.route('/choices/<int:id>', methods=['GET'])
def get_choice(id):
    c = Choice.query.get_or_404(id)
    return jsonify({'id': c.id, 'dialogue_id': c.dialogue_id, 'text': c.text, 'next_dialogue_id': c.next_dialogue_id})

@app.route('/choices', methods=['POST'])
def create_choice():
    data = request.get_json()
    new_choice = Choice(dialogue_id=data['dialogue_id'], text=data['text'], next_dialogue_id=data.get('next_dialogue_id'))
    db.session.add(new_choice)
    db.session.commit()
    return jsonify({'message': 'Choice created successfully!', 'id': new_choice.id}), 201

@app.route('/choices/<int:id>', methods=['PUT'])
def update_choice(id):
    c = Choice.query.get_or_404(id)
    data = request.get_json()
    c.text = data.get('text', c.text)
    c.next_dialogue_id = data.get('next_dialogue_id', c.next_dialogue_id)
    db.session.commit()
    return jsonify({'message': 'Choice updated successfully!'})

@app.route('/choices/<int:id>', methods=['DELETE'])
def delete_choice(id):
    c = Choice.query.get_or_404(id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({'message': 'Choice deleted successfully!'})

# ==========================================================
# PROGRESS CRUD
# ==========================================================

@app.route('/progress', methods=['GET'])
def get_progress():
    progress = Progress.query.all()
    return jsonify([{'id': p.id, 'player_id': p.player_id, 'dialogue_id': p.dialogue_id, 'timestamp': p.timestamp} for p in progress])

@app.route('/progress/<int:id>', methods=['GET'])
def get_progress_by_id(id):
    p = Progress.query.get_or_404(id)
    return jsonify({'id': p.id, 'player_id': p.player_id, 'dialogue_id': p.dialogue_id, 'timestamp': p.timestamp})

@app.route('/progress', methods=['POST'])
def create_progress():
    data = request.get_json()
    new_progress = Progress(player_id=data['player_id'], dialogue_id=data.get('dialogue_id'))
    db.session.add(new_progress)
    db.session.commit()
    return jsonify({'message': 'Progress saved successfully!', 'id': new_progress.id}), 201

@app.route('/progress/<int:id>', methods=['PUT'])
def update_progress(id):
    p = Progress.query.get_or_404(id)
    data = request.get_json()
    p.dialogue_id = data.get('dialogue_id', p.dialogue_id)
    db.session.commit()
    return jsonify({'message': 'Progress updated successfully!'})

@app.route('/progress/<int:id>', methods=['DELETE'])
def delete_progress(id):
    p = Progress.query.get_or_404(id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Progress deleted successfully!'})

if __name__ == '__main__':
    app.run(debug=True)

