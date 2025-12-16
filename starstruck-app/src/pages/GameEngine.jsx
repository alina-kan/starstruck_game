import { useEffect, useState } from 'react';
import story from '../scripts/story.json';
import { audioEngine } from '../engine/audioEngine';
import styles from './css/GameEngine.module.css';

const USER_ID = 1;

export default function GameEngine({
    initialSceneId = 1,
    initialLineId = null,
    nickname = 'Roxanne',
    pronouns = 'she/her',
    initialAffection = 0,
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
    const [affection, setAffection] = useState(initialAffection);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [showChoices, setShowChoices] = useState(false);
    const [currentSprite, setCurrentSprite] = useState(null);
    const [prevSprite, setPrevSprite] = useState(null);

    //if we're starting the story from the beginning
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
    }, [initialSceneId, initialLineId]);

    // Keep `scene` in sync when sceneId changes
    useEffect(() => {
        setScene(story[sceneId] || []);
    }, [sceneId]);

    // Update currentLine when scene or lineIndex changes
    useEffect(() => {
        setCurrentLine(scene[lineIndex] || null);
    }, [scene, lineIndex]);

    //hide choices buttons if no choices
    useEffect(() => {
        setShowChoices(false);
    }, [currentLine]);

    // Handle music / sfx / transitions / choice modal NOT IN EFFECT
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

    // Keyboard for pause - Press "p", forgot to write in documentation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key.toLowerCase() === 'p') setPauseModal(true);
            if (e.key === 'Escape') setPauseModal(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    //switch between sprites with fade transitions
    useEffect(() => {
        const next = currentLine?.sprite || null;

        if (next === currentSprite) return;

        // move current → previous
        setPrevSprite(currentSprite);
        setCurrentSprite(next);

        if (currentSprite) {
            const t = setTimeout(() => {
            setPrevSprite(null);
            }, 1000); // match CSS duration

            return () => clearTimeout(t);
        }
    }, [currentLine?.sprite]);

    //count affection points earned and save
    useEffect(() => {
        const rawScene = story[sceneId] || [];

        const filtered = rawScene.filter(line => {
            if (line.min_affection !== undefined) {
                return affection >= line.min_affection;
            }
            return true;
        });

        setScene(filtered);
    }, [sceneId, affection]);

    //if an ending is reached, unlock the specified CG
    useEffect(() => {
        if (!currentLine?.ending) return;

        unlockEnding(currentLine.ending);

        // optional: disable advancing
        console.log("ENDING REACHED:", currentLine.ending.key);
    }, [currentLine]);

    //process text to use chosen nickname and pronouns with grammatically correct verbage
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

    //advance through the story by pressing on textbox
    const advance = () => {
        if (!currentLine) return;

        if (currentLine.ending) return;

        // If this line has choices and they aren't shown yet → show them
        if (currentLine.choices && !showChoices) {
            setShowChoices(true);
            return;
        }

        // If choices are showing, don't advance by clicking
        if (currentLine.choices) return;

        // Normal flow
        if (currentLine.nextScene) {
            goToScene(currentLine.nextScene);
            return;
        }

        //after making choice, go to specified line
        if (currentLine.goto !== undefined){
            goToScene(currentLine.goto);
            return;
        }

        //change line index to match 
        if (lineIndex + 1 < scene.length) {
            setLineIndex(lineIndex + 1);
            return;
        }

        //move through scenes
        if (story[sceneId + 1]) {
            goToScene(sceneId + 1);
        }
    };

    //allows to go to specific scenes
    const goToScene = (id, lineId = null) => {
        if (story[id]) { // scene number
            setSceneId(id);
            setScene(story[id]);
            setLineIndex(lineId !== null ? story[id].findIndex(l => l.id === lineId) : 0);
            return;
        }
        // search all scenes for a line id
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

    //look through selected choice, increase/decrease any affection, go to specific line
    const handleChoice = (choice) => {
        setChoiceModal(false);

        if (typeof choice.affection === "number") {
            setAffection(prev => prev + choice.affection);
        }

        if (choice.goto !== undefined) {
            goToScene(choice.goto);
        }
    };

    //get all data for saving
    const getCurrentSaveData = () => {
        return {
            user_id: USER_ID,           
            scene_id: sceneId,          
            line_id: currentLine.id,           
            nickname,
            pronouns,
            affection
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
                user_id: payload.user_id,     
                save_slot: slot,
                scene_id: payload.scene_id,    
                line_id: payload.line_id,      
                nickname: payload.nickname,    
                pronouns: payload.pronouns,
                affection: payload.affection    
            })
            });

            setLastSavedAt(Date.now());
            console.log(`Saved slot ${slot}`);
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    //if ending reached, update table to "unlock" specific image
    const unlockEnding = async (ending) => {
        try {
            await fetch("http://127.0.0.1:5000/api/gallery/unlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cg_key: ending.cg })
            });
        } catch (err) {
            console.error("Failed to unlock CG", err);
        }
    };

    // Open SaveFiles in continue mode so user can choose a save to load
    const handleLoad = () => {
        setPauseModal(false);
        if (goToSaveFiles) {
            goToSaveFiles('continue', null);
        }
    };

    //pause modal lets you go back to Main Menu
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

            {prevSprite && (
                <img
                    src={`../assets/sprites/${prevSprite.split('_')[0]}/${prevSprite}.png`}
                    className={`${styles.sprite} ${styles.spriteFadeOut}`}
                    alt=""
                />
            )}

            {currentSprite && (
                <img
                    src={`../assets/sprites/${currentSprite.split('_')[0]}/${currentSprite}.png`}
                    className={`${styles.sprite} ${styles.spriteFadeIn}`}
                    alt=""
                />
            )}

            {currentLine && !currentLine.hideTextbox && (
                <div className={styles.textboxContainer} onClick={advance}>
                    <div className={styles.textboxSpeaker}>{processText(currentLine.speaker || '')}</div>
                    <div className={styles.textboxText}>{processText(currentLine.text)}</div>
                </div>
            )}

            {showChoices && currentLine?.choices && (
                <div className={styles.choiceContainer}>
                    {currentLine.choices.map((c, i) => (
                    <button
                        key={i}
                        className={styles.choiceButtons}
                        onClick={() => handleChoice(c)}
                    >
                        {c.label}
                    </button>
                    ))}
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
