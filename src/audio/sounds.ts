import { createAudioPlayer, setIsAudioActiveAsync, type AudioPlayer, type AudioSource } from 'expo-audio';
import { AppState } from 'react-native';

export const MUSIC = {
  lobby: require('../../assets/audio/lobby.mp3'),
  question: require('../../assets/audio/question.mp3'),
} as const;

export const SFX = {
  // Interface
  focus: require('../../assets/audio/focus.wav'),
  click: require('../../assets/audio/click.wav'),
  option: require('../../assets/audio/option.wav'),
  start: require('../../assets/audio/start.wav'),
  disabled: require('../../assets/audio/disabled.wav'),
  // Game
  'answer-locked': require('../../assets/audio/answer-locked.wav'),
  award: require('../../assets/audio/award.mp3'),
  bonus: require('../../assets/audio/bonus.mp3'),
  correct: require('../../assets/audio/correct.mp3'),
  fail: require('../../assets/audio/fail.wav'),
  'finale-intro': require('../../assets/audio/finale-intro.mp3'),
  'player-join': require('../../assets/audio/player-join.wav'),
  podium: require('../../assets/audio/podium.mp3'),
  'score-count': require('../../assets/audio/score-count.wav'),
  steal: require('../../assets/audio/steal.wav'),
  'theme-reveal': require('../../assets/audio/theme-reveal.mp3'),
  'themes-ready': require('../../assets/audio/themes-ready.wav'),
  tick: require('../../assets/audio/tick.mp3'),
  'time-up': require('../../assets/audio/time-up.mp3'),
} as const;

export type SfxName = keyof typeof SFX;

// Interface sounds, preloaded at startup so buttons react without delay.
export const UI_SFX: SfxName[] = ['focus', 'click', 'option', 'start', 'disabled'];

// A single player is shared by all screens, so only one track can ever play.
// Note: on Android, AudioPlayer.remove() does not stop playback, so players
// are paused and reused instead of being created and removed per screen.
let musicPlayer: AudioPlayer | null = null;
let currentMusic: AudioSource | null = null;

export function playMusic(source: AudioSource, volume = 0.5) {
  if (!musicPlayer) {
    musicPlayer = createAudioPlayer(source);
  } else if (currentMusic !== source) {
    musicPlayer.replace(source);
  }
  currentMusic = source;
  musicPlayer.loop = true;
  musicPlayer.volume = volume;
  musicPlayer.play();
  startMusicWatchdog();
}

// The system can pause every player behind our back (audio route lost when the
// TV input or HDMI/speaker changes, Siri, a session interruption) and does not
// always tell us to resume. While a track is meant to be playing, check it
// regularly and restart it, reactivating the audio session first.
const WATCHDOG_INTERVAL_MS = 2000;
let watchdog: ReturnType<typeof setInterval> | null = null;
let appActive = AppState.currentState === 'active';

function startMusicWatchdog() {
  if (watchdog) return;
  watchdog = setInterval(() => {
    if (!appActive || !musicPlayer || !currentMusic) return;
    if (musicPlayer.isLoaded && !musicPlayer.playing) {
      console.warn('[audio] music was paused by the system, restarting');
      void setIsAudioActiveAsync(true)
        .catch(() => {})
        .then(() => musicPlayer?.play());
    }
  }, WATCHDOG_INTERVAL_MS);
}

function stopMusicWatchdog() {
  if (watchdog) clearInterval(watchdog);
  watchdog = null;
}

// Starts the current track again. A browser refuses to play sound before the
// first click: the web start screen calls this from that click.
export function resumeMusic() {
  if (musicPlayer && currentMusic) musicPlayer.play();
}

// Stops the music, unless another screen already switched to a different track.
export function stopMusic(source?: AudioSource) {
  if (!musicPlayer || (source && source !== currentMusic)) return;
  musicPlayer.pause();
  void musicPlayer.seekTo(0);
  currentMusic = null;
  stopMusicWatchdog();
}

// Silences the app when it leaves the foreground, and resumes the current
// track when it comes back.
AppState.addEventListener('change', (state) => {
  appActive = state === 'active';
  if (!musicPlayer || !currentMusic) return;
  if (state === 'active') {
    void setIsAudioActiveAsync(true)
      .catch(() => {})
      .then(() => musicPlayer?.play());
  } else {
    musicPlayer.pause();
  }
});

// A few lazily created players per effect, used in turn, so a sound can be
// replayed while the previous occurrence is still playing.
const SFX_VOICES = 3;
const sfxPools = new Map<SfxName, { players: AudioPlayer[]; next: number }>();

function sfxPool(name: SfxName) {
  let pool = sfxPools.get(name);
  if (!pool) {
    pool = { players: Array.from({ length: SFX_VOICES }, () => createAudioPlayer(SFX[name])), next: 0 };
    sfxPools.set(name, pool);
  }
  return pool;
}

// Loads effects ahead of time so the first play has no delay.
export function preloadSfx(...names: SfxName[]) {
  names.forEach(sfxPool);
}

export async function playSfx(name: SfxName, volume = 1) {
  const pool = sfxPool(name);
  const player = pool.players[pool.next];
  pool.next = (pool.next + 1) % pool.players.length;
  player.volume = volume;
  // A finished player stays at the end: rewind before playing again.
  // The seek must complete first, otherwise iOS plays from the end (silence).
  try {
    await player.seekTo(0);
  } catch {
    // A failed rewind must not prevent the sound from playing.
  }
  player.play();
}

// Stops every occurrence of an effect that is still playing.
export function stopSfx(name: SfxName) {
  sfxPools.get(name)?.players.forEach((player) => player.pause());
}
