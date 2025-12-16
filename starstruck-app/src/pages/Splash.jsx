import styles from './css/Splash.module.css';
import { useEffect } from 'react'

export default function Splash({ onFinish }) {
  //load in start page
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish(); // go to StartPage
        }, 1710); // 1 second fade-in duration

        return () => clearTimeout(timer);
    }, [onFinish]);

  return (
    <div className={styles.transitionScene}>
    </div>
  );
}
