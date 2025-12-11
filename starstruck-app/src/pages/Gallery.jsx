import { useState, useEffect } from "react";
import styles from "./css/Gallery.module.css";
import logo from '../assets/main/logo.PNG';

export default function Gallery({ goToStart }) {
  const [fadeLogo, setFadeLogo] = useState(true);
  const [cgList, setCgList] = useState([]);
  const [selectedCG, setSelectedCG] = useState(null);
  const [lockedMessage, setLockedMessage] = useState("");

  // Fetch gallery unlock data
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/gallery")
      .then((res) => res.json())
      .then((data) => setCgList(data))
      .catch((err) => console.error(err));
  }, []);

  function handleLaunch() {
    setFadeLogo(false);
    setTimeout(() => {
      goToStart();
    }, 1300);
  }

  // Only allow clicking if unlocked
  function handleSelect(cg) {
    if (cg.unlocked === 1) {
      setSelectedCG(cg);
    }  else {
      setLockedMessage("You haven't collected this memory yet. Explore more paths!");
      setTimeout(() => setLockedMessage(""), 2000); // fades after 2 seconds
    }
  }

  // Close modal
  function closeModal() {
    setSelectedCG(null);
  }

  // Download full image
  function downloadImage() {
    const link = document.createElement("a");
    link.href = `/assets/gallery/${selectedCG.cg_key}.png`; 
    link.download = `${selectedCG.cg_key}.png`;
    link.click();
  }

  return (
    <div className={styles.bodyBackground}>
      <div className={`${styles.transitionGroup} ${!fadeLogo ? styles.fadeOut : ""}`}>

        <img src={logo} alt="StarStruck" className={styles.imageLogo} />

        {/* --- CENTER ROW OF IMAGES --- */}
        <div className={styles.galleryPhotos}>
          {cgList.map((cg) => {
            const imgSrc = cg.unlocked
              ? `http://127.0.0.1:5000/static/gallery/${cg.cg_key}.png`
              : `http://127.0.0.1:5000/static/gallery/${cg.cg_key}_locked.png`;

            return (
              <img
                key={cg.cg_key}
                src={imgSrc}
                className={styles.photo}
                alt={cg.cg_key}
                onClick={() => handleSelect(cg)}
                style={{
                  cursor: cg.unlocked ? "pointer" : "not-allowed",
                  filter: cg.unlocked ? "none" : "grayscale(80%) brightness(40%)",
                }}
              />
            );
          })}
        </div>
        
        {lockedMessage && (
          <p className={styles.lockedPopup}>
            {lockedMessage}
          </p>
        )}

        {/* Back button */}
        <div className={styles.controllerSpace}>
          <button className={styles.mainButtons} onClick={handleLaunch}>
            Back to Menu
          </button>
        </div>
      </div>

      {/* --- MODAL POPUP --- */}
      {selectedCG && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img
              src={`http://127.0.0.1:5000/static/gallery/${selectedCG.cg_key}.png`}
              className={styles.fullImage}
              alt="Selected CG"
            />
            <div> 
              <button className={styles.downloadBtn} onClick={downloadImage}>
                Download
              </button>

              <button className={styles.closeBtn} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/*
export default function Gallery({ goToStart }) {
  const [fadeLogo, setFadeLogo] = useState(true);
  const [cgList, setCgList] = useState([]);
  const [selectedCG, setSelectedCG] = useState(null);

  // Fetch gallery unlock data
  useEffect(() => {
    fetch("http://localhost:5000/api/gallery")
      .then((res) => res.json())
      .then((data) => setCgList(data))
      .catch((err) => console.error(err));
  }, []);

  function handleLaunch() {
      setFadeLogo(false);    
      setTimeout(() => {
          goToStart();    
      }, 1300); 
  }

    // Open modal only if unlocked
  function handleSelect(cg) {
    if (cg.unlocked === 1) {
      setSelectedCG(cg);
    }
  }

  // Close modal
  function closeModal() {
    setSelectedCG(null);
  }

  // Download handler
  function downloadImage() {
    const link = document.createElement("a");
    link.href = `../assets/gallery/${selectedCG.cg_key}.png`; // adjust path as needed
    link.download = `${selectedCG.cg_key}.png`;
    link.click();
  }

    //add image column for the left, and then on the right add the space to view the image
    //also add download function and if the player hasnt collected the image yet (reached that ending)
    //have message saying "You haven't collected this memory yet. Explore your options!"


  return (
    <div className={styles.bodyBackground}>
        <div className={`${styles.transitionGroup} ${!fadeLogo ? styles.fadeOut : ""}`}>
            <img src={logo} alt="StarStruck" className={styles.imageLogo}/>
            <div className={styles.galleryPhotos}>
              <img src={orion} className={styles.photo}/>
              <img src={orion} className={styles.photo}/>
              <img src={orion} className={styles.photo}/>
            </div>
            <div className={styles.controllerSpace}>
                <button className={styles.mainButtons} onClick={handleLaunch}>Back to Menu</button>
            </div>
        </div>
    </div>
  );
}
*/