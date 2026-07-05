// ContentProvider seam (see PLACEHOLDERS.md #1-#2, docs/implementation-Guide.md
// Phase 5). Every method is async so the mock and the future real implementation share
// one call-site contract — swapping to a real admin- or AI-agent-fed backend means
// changing only this file's function bodies, with no changes to the Library page.

export const contentProvider = {
  // Medical updates feed. Mock: resolves immediately with the locale's static seed
  // content. Production: fetch from an admin- or AI-agent-populated endpoint.
  async getUpdates(seedUpdates) {
    return seedUpdates;
  },

  // Companion chat reply. Mock: canned reply after a short simulated-latency delay.
  // Production: call the real trusted-source endpoint with `userMessage`.
  async getCompanionReply(userMessage, cannedReply) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return cannedReply;
  },
};
