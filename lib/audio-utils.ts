export const downloadAudio = (audioBlob: Blob, filename: string) => {
  const url = URL.createObjectURL(audioBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.mp3`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const createAudioUrl = (audioData: ArrayBuffer): string => {
  const blob = new Blob([audioData], { type: 'audio/mpeg' });
  return URL.createObjectURL(blob);
};

export const cleanupAudioUrl = (url: string) => {
  URL.revokeObjectURL(url);
};