// Text-to-Speech utility
class SpeechSynthesisService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.initVoice();
  }

  initVoice() {
    if (this.synth) {
      const voices = this.synth.getVoices();
      // Prefer English voices
      this.voice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      // Load voices if not loaded yet
      if (voices.length === 0) {
        this.synth.onvoiceschanged = () => {
          const newVoices = this.synth.getVoices();
          this.voice = newVoices.find(voice => voice.lang.startsWith('en')) || newVoices[0];
        };
      }
    }
  }

  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.voice;
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synth.speak(utterance);
    });
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  pause() {
    if (this.synth) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }

  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }
}

export default new SpeechSynthesisService();
