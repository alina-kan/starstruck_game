import styles from './css/startPage.module.css';
import logo from '../assets/main/logo.PNG'
import { useState, useEffect } from 'react'

export default function StartPage({ goToNewModal, goToGallery, goToSaveFiles }) {
    const [fadeLogo, setFadeLogo] = useState(true);
    const [hasSaves, setHasSaves] = useState(false);

    //go to new game if clicked
    function handleLaunchNewGame() {
        setFadeLogo(false);
        setTimeout(() => {
            goToNewModal(); 
        }, 1300);
    }

    //go to gallery if clicked
    function handleLaunchGallery() {
        setFadeLogo(false);    
        setTimeout(() => {
            goToGallery();    
        }, 1300); 
    }

    //go to save files if clicked to continue game
    function handleLaunchSave() {
        setFadeLogo(false);    
        setTimeout(() => {
            goToSaveFiles();    
        }, 1300); 
    }

    //bring up exit option if clicked
    function handleExit() {
        if (window.opener) {
            window.close(); // works only if opened by your script
        } else {
            alert("You can close this tab to exit.");
        }
    }

    //check if any saves in table in order to make Continue button clickable
    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/saves")
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    setHasSaves(true);
                }
            })
            .catch(err => console.error(err));
    }, []);

  return (
    <div className={styles.bodyBackground}>
        <div className={`${styles.transitionGroup} ${!fadeLogo ? styles.fadeOut : ""}`}>
            <img src={logo} alt="StarStruck" className={styles.imageLogo}/>
            <div className={styles.controllerSpace}>
                <button className={styles.mainButtons} onClick={handleLaunchNewGame}>New Game</button>
                <button 
                    className={styles.mainButtons} 
                    onClick={hasSaves ? handleLaunchSave : null}
                    disabled={!hasSaves}
                    style={{ opacity: hasSaves ? 1 : 0.4 }}
                >
                    Continue
                </button>
                <button className={styles.mainButtons} onClick={handleLaunchGallery}>Gallery</button>
                <button className={styles.mainButtons} onClick={handleExit}>Exit</button>
            </div>
        </div>
    </div>
  );
}
