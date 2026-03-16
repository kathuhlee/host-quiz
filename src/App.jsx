import { useState } from "react";
import styles from "./App.module.css";

// ============================================
// DATA
// ============================================

const QUESTIONS = [
  { id: 0,  text: "What does your morning routine look like?",    options: ["Sunrise swim", "Coffee, contemplation and chill", "Both"] },
  { id: 1,  text: "How do you prefer guests check in?",           options: ["Personal welcome with local tips", "Self check-in with smart lock", "Mix depending on guest"] },
  { id: 2,  text: "What's your home decor vibe?",                 options: ["Minimalist clean lines", "Cozy eclectic with personality", "Luxe unique touches"] },
  { id: 3,  text: "A guest leaves dishes in the sink overnight?", options: ["Strict house rules enforced", "Flexible — treat it like home", "Gentle reminder next morning"] },
  { id: 4,  text: "What guest type excites you most?",            options: ["Adventure travelers (hikes/swims)", "Relaxers (Netflix & chill)", "Families with kids"] },
  { id: 5,  text: "Top amenity you'd provide?",                   options: ["Gym/pool access or bikes", "Fully stocked kitchen", "Curated local guidebook"] },
  { id: 6,  text: "Guest complains about WiFi?",                  options: ["Fix immediately, apologize profusely", "Troubleshoot together", "Offer discount if needed"] },
  { id: 7,  text: "Your hosting superpower?",                     options: ["Endurance (I never quit!)", "Making guests feel at home", "Creating magical spaces"] },
  { id: 8,  text: "Late check-out request?",                      options: ["Strict 11am policy", "Flexible for great guests", "Case-by-case basis"] },
  { id: 9,  text: "Your perfect guest review says?",              options: ["'Super clean & organized!'", "'Felt like family!'", "'Most unique stay ever!'"] },
  { id: 10, text: "Weekend hosting vibe?",                        options: ["Full service (local recs, coffee)", "Hands-off (keys + enjoy)", "Curated experiences (tours, swims)"] },
];

const HOST_TYPES = {
  energy: {
    label: "The Adventure Host",
    emoji: "🏄",
    tagline: "You turn every stay into a story worth telling.",
    description:
      "You're high-energy, outdoorsy, and your guests leave with tan lines and trail maps. Your listing practically radiates vitality — guests who want to actually do things gravitate to you.",
    tips: [
      "Highlight nearby trails, surf spots, and bike paths in your listing",
      "Stock the garage with bikes, wetsuits, or gear guests can borrow",
      "Leave a handwritten 'adventure guide' with your personal recs",
      "Use action photos in your listing — not just the bedroom",
    ],
    color: "#0ea5e9",
    bg: "#f0f9ff",
  },
  social: {
    label: "The Warm Welcome Host",
    emoji: "🏡",
    tagline: "Guests don't just stay — they feel at home.",
    description:
      "You're the host everyone messages to say thanks two weeks later. You remember names, anticipate needs, and make a studio apartment feel like a hug. Five-star reviews are basically your hobby.",
    tips: [
      "Lead your listing with personal touches ('I leave coffee ready for you')",
      "Build a house manual that feels like a letter from a friend",
      "Offer a quick local orientation at check-in",
      "Ask guests what they're celebrating — then make it special",
    ],
    color: "#f97316",
    bg: "#fff7ed",
  },
  style: {
    label: "The Design Host",
    emoji: "✨",
    tagline: "Your space is the experience.",
    description:
      "You've definitely spent time on Pinterest boards and know what 'japandi' means. Guests book your place because of the vibe — and they Instagram it. Your listing photos do 80% of the selling.",
    tips: [
      "Invest in one statement piece that photographs beautifully",
      "Keep decor cohesive — pick a palette and commit",
      "Offer a small luxury (espresso machine, quality bath products)",
      "Hire a professional photographer — your design deserves it",
    ],
    color: "#8b5cf6",
    bg: "#faf5ff",
  },
};

// ============================================
// HELPERS
// ============================================

// In-memory leaderboard — avoids localStorage which breaks in most deployments
const leaderboard = { energy: 0, social: 0, style: 0, total: 0 };

function scoreAnswers(answers) {
  let energy = 0, social = 0, style = 0;

  for (let i = 0; i < answers.length; i++) {
    const a = answers[i];
    if (a.includes("swim") || a.includes("Endurance") || a.includes("hikes") || a.includes("Gym")) energy++;
    if (a.includes("welcome") || a.includes("Full service") || a.includes("family") || a.includes("Flexible")) social++;
    if (a.includes("Luxe") || a.includes("magical") || a.includes("Curated") || a.includes("unique stay")) style++;
  }

  const scores = { energy, social, style };
  return Object.keys(scores).reduce((a, b) => scores[a] >= scores[b] ? a : b);
}

// Fetches a random tip from a free public API — demonstrates async/await + error handling
async function fetchHostingTip() {
  try {
    const res = await fetch("https://api.adviceslip.com/advice");
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return data.slip?.advice ?? null;
  } catch {
    return null;
  }
}

// ============================================
// COMPONENT
// ============================================

export default function App() {
  const [screen, setScreen]         = useState("quiz"); // "quiz" | "result" | "leaderboard"
  const [currentQ, setCurrentQ]     = useState(0);
  const [answers, setAnswers]       = useState([]);
  const [hostType, setHostType]     = useState(null);
  const [tip, setTip]               = useState(null);
  const [tipLoading, setTipLoading] = useState(false);

  // Dark mode — toggling this sets data-theme="dark" on <html>
  // which triggers the CSS variable overrides in index.css
  const [darkMode, setDarkMode]     = useState(false);

  // Tracks which direction the user is moving so we can
  // slide questions in from the right (forward) or left (back)
  const [direction, setDirection]   = useState("forward");

  // Share button cycles: "idle" → "copied" → back to "idle" after 2s
  const [shareState, setShareState] = useState("idle");

  const progress = (currentQ / QUESTIONS.length) * 100;

  // Applies or removes data-theme="dark" on the root <html> element.
  // Because CSS variables cascade from :root, this one attribute
  // swap instantly re-themes every element on the page.
  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  }

  async function handleAnswer(option) {
    setDirection("forward");
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const result = scoreAnswers(newAnswers);
      setHostType(result);
      leaderboard[result]++;
      leaderboard.total++;
      setScreen("result");

      // Fetch external tip when quiz completes
      setTipLoading(true);
      const fetchedTip = await fetchHostingTip();
      setTip(fetchedTip);
      setTipLoading(false);
    }
  }

  function handlePrev() {
    if (currentQ > 0) {
      setDirection("back");
      setAnswers(answers.slice(0, -1));
      setCurrentQ(currentQ - 1);
    }
  }

  // Writes a pre-formatted message to the clipboard using the
  // browser's Clipboard API (navigator.clipboard.writeText).
  // Then sets shareState to "copied" and resets after 2 seconds
  // so the button label reverts automatically.
  async function handleShare() {
    if (!host) return;
    const text = `I took the Airbnb Host Quiz and I'm "${host.label}" — ${host.tagline} Try it: https://host-quiz.vercel.app/`;
    try {
      await navigator.clipboard.writeText(text);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      // Clipboard API can be blocked in some browsers — fail silently
      setShareState("idle");
    }
  }

  function handleRetake() {
    setAnswers([]);
    setCurrentQ(0);
    setHostType(null);
    setTip(null);
    setScreen("quiz");
  }

  const host = hostType ? HOST_TYPES[hostType] : null;

  return (
    <div className={styles.app}>
      <div className={styles.card}>

        {/* ── Top bar: dark mode toggle ───────────── */}
        <div className={styles.topBar}>
          <button className={styles.darkToggle} onClick={toggleDark}>
            {darkMode ? "☀ light" : "◑ dark"}
          </button>
        </div>

        {/* ── Header ─────────────────────────────── */}
        <div className={styles.header}>
          <span className={styles.badge}>Airbnb Host Quiz</span>
          <h1 className={styles.title}>Which host style are you?</h1>
        </div>

        {/* ── Quiz screen ────────────────────────── */}
        {screen === "quiz" && (
          <div>
            <div className={styles.progressWrap}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <p className={styles.progressLabel}>
              Question {currentQ + 1} of {QUESTIONS.length}
            </p>

            {/*
              key={currentQ} is the trick that makes animations work.
              When key changes, React unmounts the old div and mounts
              a fresh one — which replays the CSS animation from scratch.
              Without key, React reuses the same DOM node and the
              animation never re-triggers.
            */}
            <div
              key={currentQ}
              className={
                direction === "back"
                  ? styles.questionBlockReverse
                  : styles.questionBlock
              }
            >
              <h2 className={styles.question}>{QUESTIONS[currentQ].text}</h2>

              <div className={styles.optionList}>
                {QUESTIONS[currentQ].options.map((opt) => (
                  <button
                    key={opt}
                    className={styles.optionBtn}
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.navRow}>
              {currentQ > 0 && (
                <button className={styles.prevBtn} onClick={handlePrev}>
                  ← Back
                </button>
              )}
              {answers[currentQ - 1] && (
                <p className={styles.prevAnswer}>
                  Previous: <em>{answers[currentQ - 1]}</em>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Result screen ──────────────────────── */}
        {screen === "result" && host && (
          <div className={styles.resultBlock}>
            <div
              className={styles.resultHero}
              style={{ background: host.bg, borderColor: host.color + "33" }}
            >
              <div className={styles.resultEmoji}>{host.emoji}</div>
              <h2 className={styles.resultLabel} style={{ color: host.color }}>
                {host.label}
              </h2>
              <p className={styles.resultTagline}>{host.tagline}</p>
            </div>

            <p className={styles.resultDesc}>{host.description}</p>

            <div className={styles.tipsBox}>
              <h3 className={styles.tipsTitle}>Listing tips for you</h3>
              {host.tips.map((t, i) => (
                <div key={i} className={styles.tipRow}>
                  <span className={styles.tipDot} style={{ background: host.color }} />
                  <span className={styles.tipText}>{t}</span>
                </div>
              ))}
            </div>

            <div className={styles.apiBox}>
              <p className={styles.apiLabel}>✦ Bonus advice from the internet</p>
              {tipLoading ? (
                <p className={styles.apiTip}>Loading...</p>
              ) : tip ? (
                <p className={styles.apiTip}>"{tip}"</p>
              ) : (
                <p className={styles.apiTip}>Could not load — check your connection.</p>
              )}
            </div>

            <div className={styles.btnRow}>
              <button className={styles.primaryBtn} onClick={handleRetake}>
                Retake quiz
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => setScreen("leaderboard")}
              >
                See leaderboard
              </button>
              {/*
                shareBtn + shareBtnCopied are combined with a template
                literal so both classes apply at once when copied.
                The green flash is pure CSS — no JS timeout affects styles.
              */}
              <button
                className={`${styles.shareBtn} ${shareState === "copied" ? styles.shareBtnCopied : ""}`}
                onClick={handleShare}
              >
                {shareState === "copied" ? "✓ copied!" : "⤴ share"}
              </button>
            </div>
          </div>
        )}

        {/* ── Leaderboard screen ─────────────────── */}
        {screen === "leaderboard" && (
          <div>
            <h2 className={styles.lbTitle}>🏆 Host type breakdown</h2>
            <p className={styles.lbSub}>
              {leaderboard.total} quiz{leaderboard.total !== 1 ? "zes" : ""} taken this session
            </p>

            {Object.entries(HOST_TYPES).map(([key, h]) => {
              const count = leaderboard[key];
              const pct = leaderboard.total > 0
                ? Math.round((count / leaderboard.total) * 100)
                : 0;

              return (
                <div key={key} className={styles.lbRow}>
                  <span className={styles.lbEmoji}>{h.emoji}</span>
                  <div className={styles.lbMeta}>
                    <span className={styles.lbName}>{h.label}</span>
                    <div className={styles.lbBarBg}>
                      <div
                        className={styles.lbBar}
                        style={{ width: `${pct}%`, background: h.color }}
                      />
                    </div>
                  </div>
                  <span className={styles.lbCount}>{count}</span>
                </div>
              );
            })}

            <div className={styles.btnRow}>
              <button className={styles.primaryBtn} onClick={handleRetake}>
                Take quiz again
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
