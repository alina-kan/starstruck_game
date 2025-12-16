// src/pages/SaveFiles.jsx
import React, { useState, useEffect } from 'react';
import styles from './css/SaveFiles.module.css';
import logo from '../assets/main/logo.PNG';
import story from '../scripts/story.json';

const USER_ID = 1;

export default function SaveFiles({ mode, newGameData, startGame, goToStart }) {
  const [fadeLogo, setFadeLogo] = useState(true);
  const [saves, setSaves] = useState({ 1: null, 2: null, 3: null });

  //get all saves as soon as page loads
  useEffect(() => {
    fetchSaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //fetch all the saves and map them correctly to the rows
  const fetchSaves = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/saves');
      const data = await res.json();
      const mapped = { 1: null, 2: null, 3: null };
      data.forEach(row => (mapped[row.save_slot] = row));
      setSaves(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  //go back to main menu
  const handleLaunch = () => {
    setFadeLogo(false);
    setTimeout(() => goToStart(), 300);
  };

  // Build save data depending on where SaveFiles was opened from
  const buildSaveDataForNewGame = () => {
    // If invoked from GameEngine (pause -> SaveFiles) it will have getCurrentSaveData
    if (newGameData && typeof newGameData.getCurrentSaveData === 'function') {
      return newGameData.getCurrentSaveData();
    }

    // Else, starting a brand new game from StartPage -> NewGameModal:
    // use first line of scene 1 as the starting save point
    const firstScene = story[1];
    const firstLineId = firstScene && firstScene[0] ? firstScene[0].id : 0;

    return {
      scene_id: 1,
      line_id: firstLineId,
      nickname: newGameData?.nickname ?? 'Player',
      pronouns: newGameData?.pronouns ?? 'they/them',
      affection: newGameData?.affection ?? 0
    };
  };

  //choose a save file
  const handleSelect = async (slot) => {
    const existing = saves[slot];

    if (mode === 'new') {
      const saveData = buildSaveDataForNewGame();
      if (!saveData) return;

      // Optional overwrite confirmation UI (you said overwriting should be allowed, but prompt is optional)
      if (existing && !window.confirm('Overwrite this save file?')) return;

      try {
        await fetch("http://127.0.0.1:5000/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: USER_ID,          // your constant
                save_slot: slot,
                scene_id: saveData.scene_id,
                line_id: saveData.line_id,
                nickname: saveData.nickname,
                pronouns: saveData.pronouns,
                affection: saveData.affection
            })
        });

        // Update UI immediately
        setSaves(prev => ({ ...prev, [slot]: { ...saveData, save_slot: slot, save_time: new Date().toISOString() } }));

        // Start game at the correct spot
        startGame(saveData.scene_id, saveData.line_id, saveData.nickname, saveData.pronouns, saveData.affection);
      } catch (err) {
        console.error(err);
      }
    } else {
      // continue: load existing save
      if (!existing) return;
      startGame(existing.scene_id, existing.line_id, existing.nickname, existing.pronouns, existing.affection);
    }
  };

  //delete a save file if available
  const deleteSlot = async (slot) => {
    if (!saves[slot]) return;
    if (!window.confirm('Delete this save file?')) return;

    try {
      await fetch(`http://127.0.0.1:5000/api/saves/${USER_ID}/${slot}`, { method: 'DELETE' });
      setSaves(prev => ({ ...prev, [slot]: null }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.bodyBackground}>
      <div className={`${styles.transitionGroup} ${!fadeLogo ? styles.fadeOut : ''}`}>
        <img src={logo} alt="StarStruck" className={styles.imageLogo} />

        <div style={{ marginTop: '30px', textAlign: 'center', color: 'white' }}>
          <h2>Save Files</h2>
          <table className={styles.tableDisplay}>
            <thead>
              <tr className={styles.tableRow}>
                <th>Slot</th>
                <th>Name</th>
                <th>Progress</th>
                <th>Last Saved</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(saves).map(([slot, data]) => (
                <tr key={slot} style={{ borderBottom: '1px solid gray' }}>
                  <td>{slot}</td>
                  <td>{data ? data.nickname : '—'}</td>
                  <td>{data ? `Scene ${data.scene_id}` : 'Empty Slot'}</td>
                  <td>{data ? new Date(data.save_time).toLocaleString() : '—'}</td>

                  <td>
                    {data ? (
                      <button className={styles.mainButtons} onClick={() => handleSelect(Number(slot))}>
                        Load
                      </button>
                    ) : (
                      <span style={{ opacity: 0.4 }}>No Save</span>
                    )}
                  </td>

                  <td>
                    {mode === 'new' ? (
                      <button className={styles.mainButtons} onClick={() => handleSelect(Number(slot))}>
                        Save Here
                      </button>
                    ) : data ? (
                      <button className={styles.mainButtons} onClick={() => deleteSlot(Number(slot))}>
                        Delete
                      </button>
                    ) : (
                      <span style={{ opacity: 0.4 }}>No Save</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.controllerSpace}>
          <button className={styles.mainButtons} onClick={handleLaunch}>Back to Menu</button>
        </div>
      </div>
    </div>
  );
}
