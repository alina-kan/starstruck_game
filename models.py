from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Player(db.Model):
    __tablename__ = 'player'
    player_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    pronouns = db.Column(db.String(20))
    appearance = db.Column(db.String(255))

class Dialogue(db.Model):
    __tablename__ = 'dialogue'
    dialogue_id = db.Column(db.Integer, primary_key=True)
    character_name = db.Column(db.String(100))
    dialogue_text = db.Column(db.Text)

class Choice(db.Model):
    __tablename__ = 'choice'
    choice_id = db.Column(db.Integer, primary_key=True)
    dialogue_id = db.Column(db.Integer, db.ForeignKey('dialogue.dialogue_id'))
    choice_text = db.Column(db.String(255))
    next_dialogue_id = db.Column(db.Integer)

class Progress(db.Model):
    __tablename__ = 'progress'
    progress_id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('player.player_id'))
    current_dialogue_id = db.Column(db.Integer, db.ForeignKey('dialogue.dialogue_id'))
