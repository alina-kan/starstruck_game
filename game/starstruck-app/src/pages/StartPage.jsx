import styles from './css/startPage.module.css';
import logo from '../assets/main/logo.PNG'
import { useState, useEffect } from 'react'

export default function StartPage({ goToNewModal, goToGallery, goToSaveFiles }) {
    const [fadeLogo, setFadeLogo] = useState(true);
    const [hasSaves, setHasSaves] = useState(false);

    function handleLaunchNewGame() {
        setFadeLogo(false);
        setTimeout(() => {
            goToNewModal();   // <-- Navigate properly
        }, 1300);
    }

    function handleNewGameComplete(data) {
        goToSaveFiles("new", data);  // send mode + nickname/pronouns
    }

    function handleLaunchGallery() {
        setFadeLogo(false);    
        setTimeout(() => {
            goToGallery();    
        }, 1300); 
    }

    function handleLaunchSave() {
        setFadeLogo(false);    
        setTimeout(() => {
            goToSaveFiles();    
        }, 1300); 
    }

    function handleExit() {
        if (window.opener) {
            window.close(); // works only if opened by your script
        } else {
            alert("You can close this tab to exit.");
        }
    }

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

    //add function for launching the game
    // - if creating a new game, ask for nickname and pronouns
    // - if loading game, go to DB and get all possible saves (up to 3)

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

/*

{styles.transitionGroup}

{`${styles.transitionGroup} ${!fadeLogo ? styles.fadeOut : ""}`
*/

/* mine
import styles from './css/startPage.module.css';
import logo from '../assets/main/logo.PNG'
import { useState } from 'react'

export default function StartPage({ goToGallery }) {
    const [fadeLogo, setFadeLogo] = useState(true);

    function handleLaunch() {
        setFadeLogo(false);    
        setTimeout(() => {
            goToGallery();    
        }, 500); 
    }

  return (

    //add function for launching the game
    // - if creating a new game, ask for nickname and pronouns
    // - if loading game, go to DB and get all possible saves (up to 3)

    <div className={styles.bodyBackground}>

        {/* <AnimatePresence>
            {fadeLogo && (
                <motion.h1
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.7 }}
                >
                Animate Header
                </motion.h1>
            )}  
        </AnimatePresence> *}

        <img src={logo} alt="StarStruck" className={`${styles.imageLogo} ${fadeLogo ? styles.fadeOut : ''}`}/>

        <div className={styles.controllerSpace}>
            <button onClick={handleLaunch}>Gallery</button>
        </div>
    </div>
  );

  //<img src={logo} alt="StarStruck" className={styles.imageLogo}/>
  //className={`${styles.imageLogo} ${fadeLogo ? styles.fadeOut : ''}`}
} */