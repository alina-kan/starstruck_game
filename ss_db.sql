#CREATE DATABASE starstruck_game;

USE starstruck_game;

CREATE TABLE players (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pronouns VARCHAR(20),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE characters (
    character_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);

CREATE TABLE dialogue (
    dialogue_id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT,
    dialogue_text TEXT NOT NULL,
    FOREIGN KEY (character_id) REFERENCES characters(character_id)
        ON DELETE SET NULL
);

CREATE TABLE choices (
    choice_id INT AUTO_INCREMENT PRIMARY KEY,
    dialogue_id INT NOT NULL,
    choice_text VARCHAR(255) NOT NULL,
    next_dialogue_id INT,
    FOREIGN KEY (dialogue_id) REFERENCES dialogue(dialogue_id)
        ON DELETE CASCADE,
    FOREIGN KEY (next_dialogue_id) REFERENCES dialogue(dialogue_id)
        ON DELETE SET NULL
);

CREATE TABLE progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    current_dialogue_id INT,
    last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id)
        ON DELETE CASCADE,
    FOREIGN KEY (current_dialogue_id) REFERENCES dialogue(dialogue_id)
        ON DELETE SET NULL
);


