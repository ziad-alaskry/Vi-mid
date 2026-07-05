// CallProvider seam (see PLACEHOLDERS.md #4, docs/implementation-Guide.md Phase 5,
// Architecture ADR-004). The call room only ever talks to this module for the actual
// media connection — swapping to a real two-party WebRTC SDK (LiveKit/Daily/Agora) means
// implementing this same connect/disconnect contract here, with no changes to the call
// room's timer, extend-prompt, or rating logic.

export const callProvider = {
  // Mock: local camera self-view only, no real peer connection. Resolves with a
  // MediaStream, or null if the camera is unavailable or access is denied.
  // Production: resolve once signaling completes; expose local + remote streams.
  async connect() {
    if (!navigator.mediaDevices?.getUserMedia) return null;
    try {
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch {
      return null;
    }
  },

  disconnect(stream) {
    stream?.getTracks().forEach((track) => track.stop());
  },
};
