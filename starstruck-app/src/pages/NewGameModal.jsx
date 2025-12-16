import styles from './css/NewGameModal.module.css';
import logo from '../assets/main/logo.PNG'
import { useState } from 'react'

export default function NewGameModal({ onFinish, goToStart, goToSaveFiles }) {
    const [nickname, setNickname] = useState("Roxanne");     // default
    const [pronouns, setPronouns] = useState("she/her");      // default
    const [fadeLogo, setFadeLogo] = useState(true);

    //go back to menu if clicked
    function handleLaunch() {
        setFadeLogo(false);    
        setTimeout(() => {
            goToStart();    
        }, 1300); 
    }

    //submit all info to save files to create a new save for a new game
    function submit() {
        if (!nickname || !pronouns) return;

        // Fade transition before continuing
        setFadeLogo(false);
        setTimeout(() => {
            onFinish({ nickname, pronouns });
        }, 800);
    }

    return (
        <div className={styles.bodyBackground}>
            <div className={`${styles.transitionGroup} ${!fadeLogo ? styles.fadeOut : ""}`}>
                <img src={logo} alt="StarStruck" className={styles.imageLogo} />
                <div className={styles.mainForm}>
                    <h2 className={styles.h2Title}>New Game</h2>
                    {/* nickname */}
                    <input
                        className={styles.input}
                        placeholder="Nickname"
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                    />

                    {/* pronouns */}
                    <select
                        className={styles.pronouns}
                        value={pronouns}
                        onChange={e => setPronouns(e.target.value)}
                    >
                        <option value="she/her">She/Her</option>
                        <option value="he/him">He/Him</option>
                        <option value="they/them">They/Them</option>
                    </select>

                    <button className={styles.mainButtons} onClick={submit}>
                        Choose Save Slot
                    </button>
                </div>
                <button className={styles.mainButtons} onClick={handleLaunch}>
                    Back to Menu
                </button>
            </div>
        </div>
    );
}
