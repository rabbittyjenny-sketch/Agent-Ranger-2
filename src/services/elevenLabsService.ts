/**
 * ElevenLabs Text-to-Speech Service
 * Converts AI agent responses to audio using ElevenLabs API
 * Proxied through Vite server to keep API key server-side
 */

// Default voice: "Rachel" — supports multilingual incl. Thai
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
const MODEL_ID = 'eleven_multilingual_v2';

export interface TTSOptions {
  voiceId?: string;
  stability?: number;        // 0-1
  similarityBoost?: number;  // 0-1
  style?: number;            // 0-1
}

let currentAudio: HTMLAudioElement | null = null;

/**
 * Speak text using ElevenLabs API
 * Returns void, plays audio directly in browser
 */
export async function speakText(text: string, options: TTSOptions = {}): Promise<void> {
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Strip markdown symbols for cleaner speech
  const cleanText = text
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // **bold**
    .replace(/\*([^*]+)\*/g, '$1')        // *italic*
    .replace(/`([^`]+)`/g, '$1')          // `code`
    .replace(/#{1,3}\s/g, '')             // ### headers
    .replace(/\[System Note:[^\]]*\]/g, '') // system notes
    .replace(/⚠️|✅|📊|🎯|👥|🎨|🗣️|📚|✨|📅|⚙️|💡/gu, '') // emojis
    .replace(/\n{2,}/g, '. ')             // paragraph breaks → pause
    .replace(/\n/g, ' ')
    .slice(0, 2500);                       // ElevenLabs char limit

  if (!cleanText.trim()) return;

  const voiceId = options.voiceId || DEFAULT_VOICE_ID;

  const response = await fetch(`/api/elevenlabs/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({
      text: cleanText,
      model_id: MODEL_ID,
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS error (${response.status}): ${err}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;

  audio.play();
  audio.onended = () => {
    URL.revokeObjectURL(url);
    if (currentAudio === audio) currentAudio = null;
  };
}

/** Stop any currently playing TTS audio */
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

/** Returns true if audio is currently playing */
export function isSpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

/** List available voices (for voice picker UI) */
export async function getVoices(): Promise<Array<{ voice_id: string; name: string }>> {
  const response = await fetch('/api/elevenlabs/v1/voices');
  if (!response.ok) throw new Error('Failed to fetch ElevenLabs voices');
  const data = await response.json() as any;
  return data.voices ?? [];
}
