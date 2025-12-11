// src/pages/GameEngine.jsx
import React, { useEffect, useState } from 'react';
import story from '../scripts/story.json';
import { audioEngine } from '../engine/audioEngine';
import styles from './css/GameEngine.module.css';

const USER_ID = 1;

export default function GameEngine({
  initialSceneId = 1,
  initialLineId = null,
  nickname = 'Roxanne',
  pronouns = 'she/her',
  goToStart,
  goToSaveFiles
}) {
  const [sceneId, setSceneId] = useState(initialSceneId);
  const [lineIndex, setLineIndex] = useState(0);
  const [scene, setScene] = useState(story[initialSceneId] || []);
  const [currentLine, setCurrentLine] = useState(null);
  const [choiceModal, setChoiceModal] = useState(false);
  const [pauseModal, setPauseModal] = useState(false);
  const [transition, setTransition] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Initialize using props once on mount or when initial props change
  useEffect(() => {
    if (story[initialSceneId]) {
      setSceneId(initialSceneId);
      setScene(story[initialSceneId]);
      if (initialLineId !== null) {
        const idx = story[initialSceneId].findIndex(l => l.id === initialLineId);
        setLineIndex(idx >= 0 ? idx : 0);
      } else {
        setLineIndex(0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSceneId, initialLineId]);

  // Keep `scene` in sync when sceneId changes
  useEffect(() => {
    setScene(story[sceneId] || []);
  }, [sceneId]);

  // Update currentLine when scene or lineIndex changes
  useEffect(() => {
    setCurrentLine(scene[lineIndex] || null);
  }, [scene, lineIndex]);

  // Handle music / sfx / transitions / choice modal
  useEffect(() => {
    if (!currentLine) return;
    if (currentLine.music) audioEngine.playMusic(currentLine.music);
    if (currentLine.sfx) audioEngine.playSFX(currentLine.sfx);

    if (currentLine.transition) {
      setTransition(currentLine.transition);
      const t = setTimeout(() => setTransition(null), 600);
      return () => clearTimeout(t);
    }

    setChoiceModal(currentLine.type === 'choice');
  }, [currentLine]);

  // Keyboard for pause
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'p') setPauseModal(true);
      if (e.key === 'Escape') setPauseModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const processText = (t) => {
    if (!t) return '';
    let subj = nickname, obj = nickname, possessive = 'their';
    if (pronouns) {
      const parts = pronouns.split('/');
      subj = parts[0] || nickname;
      obj = parts[1] || nickname;
      switch (subj.toLowerCase()) {
        case 'they': possessive = 'their'; break;
        case 'she': possessive = 'her'; break;
        case 'he': possessive = 'his'; break;
        default: possessive = subj + "'s";
      }
    }
    return t
      .replaceAll('{name}', nickname)
      .replaceAll('{subject}', subj)
      .replaceAll('{object}', obj)
      .replaceAll('{possessive}', possessive);
  };

  // Advance line & auto-transition between scenes
  const advance = () => {
    if (!currentLine || currentLine.type === 'choice') return;
    if (currentLine.nextScene) {
      goToScene(currentLine.nextScene);
      return;
    }
    if (lineIndex + 1 < scene.length) {
      setLineIndex(lineIndex + 1);
      return;
    }
    // fallback: next scene numerically
    if (story[sceneId + 1]) {
      goToScene(sceneId + 1);
    } else {
      console.log('End of story reached');
    }
  };

  const goToScene = (id, lineId = null) => {
    if (story[id]) {
      setSceneId(id);
      setScene(story[id]);
      if (lineId !== null) {
        const idx = story[id].findIndex(l => l.id === lineId);
        setLineIndex(idx >= 0 ? idx : 0);
      } else {
        setLineIndex(0);
      }
      return;
    }
    for (const key in story) {
      const idx = story[key].findIndex(l => l.id === id);
      if (idx >= 0) {
        setSceneId(Number(key));
        setScene(story[key]);
        setLineIndex(idx);
        return;
      }
    }
    console.warn('Scene/line not found:', id);
  };

    const handleChoice = (option) => {
        setChoiceModal(false);
        if (option.affection) {
        // implement affection tracking if you want
        }
        if (option.goto) goToScene(option.goto);
    };

    const getCurrentSaveData = () => {
        return {
            user_id: USER_ID,           // or context.userId
            scene_id: sceneId,          // from your state
            line_id: currentLine.id,           // from your state
            nickname,
            pronouns
        };
    };

  // Save directly from Pause modal without overwrite prompt
  const saveToSlot = async (slot) => {
    const payload = getCurrentSaveData();
    if (!payload) return;

    try {
        await fetch("http://127.0.0.1:5000/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: payload.user_id,      // FIXED
            save_slot: slot,
            scene_id: payload.scene_id,    // FIXED
            line_id: payload.line_id,      // FIXED
            nickname: payload.nickname,    // FIXED
            pronouns: payload.pronouns     // FIXED
        })
        });

        setLastSavedAt(Date.now());
        console.log(`Saved slot ${slot}`);
    } catch (err) {
        console.error("Save failed", err);
    }
    };


  // Open SaveFiles in continue mode so user can choose a save to load
  const handleLoad = () => {
    setPauseModal(false);
    if (goToSaveFiles) {
      // send no getCurrentSaveData here — for load we don't need it
      goToSaveFiles('continue', null);
    }
  };

  const handleBackToMenu = () => {
    setPauseModal(false);
    if (goToStart) goToStart();
  };

  return (
    <div className={styles.gameWrapper}>
      {transition === 'fade' && <div className={styles.fadeOverlay}></div>}
      {transition === 'whiteflash' && <div className={styles.whiteflash}></div>}

      {currentLine?.bg && (
        <img src={`../assets/backgrounds/${currentLine.bg}.png`} alt="bg" className={styles.bgImage} />
      )}

      {currentLine?.sprite && (
        <img
          src={`../assets/sprites/${currentLine.sprite.split('_')[0]}/${currentLine.sprite}.png`}
          alt="sprite"
          className={styles.sprite}
        />
      )}

      {currentLine && !currentLine.hideTextbox && (
        <div className={styles.textboxContainer} onClick={advance}>
          <div className={styles.textboxSpeaker}>{processText(currentLine.speaker || '')}</div>
          <div className={styles.textboxText}>{processText(currentLine.text)}</div>
        </div>
      )}

      {choiceModal && currentLine?.choices && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 style={{ color: 'white' }}>Choose</h3>
            {currentLine.choices.map((c, i) => (
              <button key={i} className={styles.mainButtons} onClick={() => handleChoice(c)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {pauseModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 style={{ color: 'white' }}>Pause</h2>

            {/* Save directly in pause modal — no overwrite prompt */}
            <div style={{ marginBottom: 8 }}>
              <button className={styles.mainButtons} onClick={() => saveToSlot(1)}>Save Slot 1</button>
              <button className={styles.mainButtons} onClick={() => saveToSlot(2)}>Save Slot 2</button>
              <button className={styles.mainButtons} onClick={() => saveToSlot(3)}>Save Slot 3</button>
            </div>

            {/* Load navigates out to SaveFiles -> user chooses a slot to load */}
            <button className={styles.mainButtons} onClick={handleLoad}>Load Game</button>

            {/* Back to menu */}
            <button className={styles.mainButtons} onClick={handleBackToMenu}>Back to Menu</button>

            <button className={styles.closeBtn} onClick={() => setPauseModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}



/* src/pages/GameEngine.jsx
import React, { useEffect, useState } from "react";
import story from "../scripts/story.json";
import { audioEngine } from "../engine/audioEngine";
import styles from "./css/GameEngine.module.css";

const USER_ID = 1;

export default function GameEngine({ goToStart, goToSaveFiles, startGame, nickname = "Roxanne", pronouns = "she/her" }) {
  const [sceneId, setSceneId] = useState(1);
  const [lineIndex, setLineIndex] = useState(0);
  const [scene, setScene] = useState(story[sceneId] || []);
  const [currentLine, setCurrentLine] = useState(scene[lineIndex] || null);

  // Modals
  const [choiceModal, setChoiceModal] = useState(false);
  const [pauseModal, setPauseModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);

  // Transitions
  const [transition, setTransition] = useState(null);

  // Stats & last saved
  const [stats, setStats] = useState({ affection: 0 });
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Reload scene when sceneId changes
  useEffect(() => {
    setScene(story[sceneId] || []);
    setLineIndex(0);
  }, [sceneId]);

  // Set current line
  useEffect(() => {
    if (lineIndex >= 0) setCurrentLine(scene[lineIndex] || null);
    }, [scene, lineIndex]);

  // Handle music, SFX, transitions
  useEffect(() => {
    if (!currentLine) return;

    if (currentLine.music) audioEngine.playMusic(currentLine.music);
    if (currentLine.sfx) audioEngine.playSFX(currentLine.sfx);

    if (currentLine.transition) {
      setTransition(currentLine.transition);
      const t = setTimeout(() => setTransition(null), 600);
      return () => clearTimeout(t);
    }

    if (currentLine.type === "choice") setChoiceModal(true);
    else setChoiceModal(false);
  }, [currentLine]);

  // Key handling for Pause
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "p") setPauseModal(true);
      if (e.key === "Escape") setPauseModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

    // Helper to replace placeholders with nickname and pronouns
    const processText = (t) => {
    if (!t) return "";

    let subj = nickname;    // subject pronoun
    let obj = nickname;     // object pronoun
    let possessive = "their"; // default possessive

    if (pronouns) {
        const parts = pronouns.split("/"); // e.g., "they/them" => ["they","them"]
        subj = parts[0] || nickname;
        obj = parts[1] || nickname;

        // Auto-generate possessive
        switch (subj.toLowerCase()) {
        case "they":
            possessive = "their";
            break;
        case "she":
            possessive = "her";
            break;
        case "he":
            possessive = "his";
            break;
        // add more custom pronouns here if needed
        default:
            possessive = subj + "'s"; // fallback
        }
    }

    return t
        .replaceAll("{name}", nickname)
        .replaceAll("{subject}", subj)
        .replaceAll("{object}", obj)
        .replaceAll("{possessive}", possessive);
    };

  // Advance line
  const advance = () => {
    if (currentLine.nextScene) {
        goToScene(currentLine.nextScene);
    } else if (lineIndex + 1 < scene.length) {
        setLineIndex(lineIndex + 1);
    } else {
    // fallback: next scene by id
    }
  };

  // Go to scene or line id
  const goToScene = (id, lineId = null) => {
    if (story[id]) {
        setSceneId(id);
        setScene(story[id]);

        // If a specific line id is passed, find its index in the scene array
        if (lineId !== null) {
            const idx = story[id].findIndex(line => line.id === lineId);
            setLineIndex(idx >= 0 ? idx : 0);
        } else {
            setLineIndex(0);
        }

        return;
    }

    // search across scenes for line id if not top-level scene
    for (const key in story) {
        const idx = story[key].findIndex((l) => l.id === id);
        if (idx >= 0) {
        setSceneId(Number(key));
        setScene(story[key]);
        setLineIndex(idx);
        return;
        }
    }
    console.warn("Scene/line not found:", id);
    };


  // Handle choice selection
  const handleChoice = (option) => {
    setChoiceModal(false);
    if (option.affection) setStats((s) => ({ ...s, affection: s.affection + option.affection }));
    if (option.goto) goToScene(option.goto);
  };

  // Save to slot
    // GameEngine.jsx
    const saveToSlot = (slot, id) => {
        if (!currentLine) return;  // ensure we have a current line
        const payload = { 
            scene_id: sceneId, 
            line_id: id,   // <-- script line ID
            nickname, 
            pronouns 
        };
        fetch(`http://127.0.0.1:5000/api/saves/${USER_ID}/${slot}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        .then(() => setLastSavedAt(Date.now()))
        .catch(console.error);
    };

  // Pause modal callbacks
  const handleLoad = () => {
    setPauseModal(false);
    if (goToSaveFiles) goToSaveFiles("continue");
  };
  const handleExit = () => {
    setPauseModal(false);
    if (goToStart) goToStart();
  };

  // Check unsaved
  const unsaved = Date.now() - (lastSavedAt || 0) > 120000;

  return (
    <div className={styles.gameWrapper}>
      {/* Transition overlays *}
      {transition === "fade" && <div className={styles.fadeOverlay}></div>}
      {transition === "whiteflash" && <div className={styles.whiteflash}></div>}

      {/* Background *}
      {currentLine?.bg && (
        <img
          src={`../assets/backgrounds/${currentLine.bg}.png`}
          alt="bg"
          className={styles.bgImage}
        />
      )}

      {/* Sprite *}
      {currentLine?.sprite && (
        <img
          src={`../assets/sprites/${currentLine.sprite.split("_")[0]}/${currentLine.sprite}.png`}
          alt="sprite"
          className={styles.sprite}
        />
      )}

      {/* Textbox *}
      {currentLine && !currentLine.hideTextbox && (
        <div className={styles.textboxContainer} onClick={advance}>
          <div className={styles.textboxSpeaker}>{processText(currentLine.speaker || "")}</div>
          <div className={styles.textboxText}>{processText(currentLine.text)}</div>
        </div>
      )}

      {/* Choice Modal *}
      {choiceModal && currentLine?.choices && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 style={{ color: "white" }}>Choose</h3>
            {currentLine.choices.map((c, i) => (
              <button key={i} className={styles.mainButtons} onClick={() => handleChoice(c)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pause Modal *}
      {pauseModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 style={{ color: "white" }}>Pause</h2>
            <button className={styles.mainButtons} onClick={() => setSaveModal(true)}>
              Save Game
            </button>
            <button className={styles.mainButtons} onClick={handleLoad}>
              Load Game
            </button>
            <button className={styles.mainButtons} onClick={handleExit}>
              Exit to Menu
            </button>
            <button className={styles.closeBtn} onClick={() => setPauseModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Save Slots Modal *}
      {saveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 style={{ color: "white" }}>Save to Slot</h3>
            {[1, 2, 3].map((slot) => (
              <button key={slot} className={styles.mainButtons} onClick={() => saveToSlot(slot, currentLine.id)}>
                Save Slot {slot}
              </button>
            ))}
            <button className={styles.closeBtn} onClick={() => setSaveModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} */
