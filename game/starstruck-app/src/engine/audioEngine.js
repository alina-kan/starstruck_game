
class AudioEngine {
  constructor() {
    // single music element used for playing current track
    this.music = new Audio();
    this.music.loop = true;
    this.music.volume = 0.6;
    this.currentTrack = null;

    // small pool for SFX so overlap works
    this.sfxPool = [];
    for (let i = 0; i < 6; i++) this.sfxPool.push(new Audio());
  }

  // play or crossfade to bg music (name = filename without extension)
  playMusic(name, { loop = true, fade = true } = {}) {
    if (!name) return this.stopMusic();

    if (this.currentTrack === name) return; // already playing

    const newSrc = `/assets/audio/music/${name}.mp3`;
    if (!fade || !this.music.src) {
      this.music.pause();
      this.music.src = newSrc;
      this.music.loop = loop;
      this.music.volume = 0.6;
      this.music.play().catch(() => {});
      this.currentTrack = name;
      return;
    }

    // crossfade: create a new Audio and fade in while fading out current
    const old = this.music;
    const newAudio = new Audio(newSrc);
    newAudio.loop = loop;
    newAudio.volume = 0;
    newAudio.play().catch(() => {});

    const dur = 600;
    const step = 40;
    const steps = dur / step;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      const t = i / steps;
      old.volume = Math.max(0, 0.6 * (1 - t));
      newAudio.volume = Math.min(0.6, 0.6 * t);
      if (i >= steps) {
        clearInterval(interval);
        try { old.pause(); } catch {}
        this.music = newAudio;
        this.currentTrack = name;
      }
    }, step);
  }

  stopMusic() {
    try { this.music.pause(); } catch {}
    this.currentTrack = null;
  }

  playSFX(name) {
    if (!name) return;
    const src = `/assets/audio/sfx/${name}.mp3`;
    const a = this.sfxPool.find(x => x.paused) || new Audio();
    a.src = src;
    a.volume = 1.0;
    a.play().catch(() => {});
  }

  setMusicVolume(v) { this.music.volume = v; }
  setSFXVolume(v) { this.sfxPool.forEach(s => s.volume = v); }
}

export const audioEngine = new AudioEngine();
