/**
 * Client-side resilient reply when the API stream is empty — no LM Studio setup banners.
 */

export function buildLocalChatFallback(userMessage: string, routeId: string): string {
  const q = userMessage.trim().toLowerCase();

  if (/\b(computer)\b/.test(q)) {
    return (
      "**Computer** ek electronic machine hai jo data process karti hai — input, program, output. " +
      "CPU, RAM, storage aur devices milkar kaam karti hai."
    );
  }

  if (/\b(hello|hi|salam|hey|aoa|assalam)\b/.test(q)) {
    return (
      "Wa alaikum assalam! Main **OmniMind** hoon — jese Gemini / ChatGPT, seedha jawab dunga. " +
      "Koi bhi sawal poochho, spelling thori ghalat ho to bhi samajh jaunga."
    );
  }

  if (routeId === "business-analytics") {
    return (
      "**Business Analytics** active hai — right panel par Karachi sales, regional tabs, " +
      "aur wastage metrics dekhain. Charts client runtime par chal rahe hain."
    );
  }

  const preview = userMessage.trim().slice(0, 120);
  return (
    `Samajh gaya — aap ne likha: _${preview}_\n\n` +
    "Backend abhi connect nahi; **GEMINI_API_KEY** aur API port **8001** check karein, phir dubara try karein."
  );
}
