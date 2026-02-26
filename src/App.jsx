import { useState } from 'react'
import './App.css'

function App() {
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hostResult, setHostResult] = useState('');


  const questions = [
    {id: 0, text: "What does your morning routine look like?", options: ["Sunrise swim", "Coffee, contemplation and chill", "Both" ]},
    {id: 1, text: "How do you prefer guests check in?", options: ["Personal welcome with local tips", "Self check-in with smart lock", "Mix depending on guest"]},
    {id: 2, text: "What's your home decor vibe?", options: ["Minimalist clean lines", "Cozy eclectic with personality", "Luxe unique touches"]},
    {id: 3, text: "A guest leaves dishes in sink overnight?", options: ["Strict house rules enforced", "Flexible - treat like home", "Gentle reminder next morning"]},
    {id: 4, text: "What guest type excites you most?", options: ["Adventure travelers (hikes/swims)", "Relaxers (Netflix & chill)", "Families with kids"]},
    {id: 5, text: "Top amenity you'd provide?", options: ["Gym/pool access or bikes", "Fully stocked kitchen", "Curated local guidebook"]},
    {id: 6, text: "Guest complains about WiFi?", options: ["Fix immediately, apologize profusely", "Troubleshoot together", "Offer discount if needed"]},
    {id: 7, text: "Your hosting superpower?", options: ["Endurance (I never quit!)", "Making guests feel at home", "Creating magical spaces"]},
    { id: 8, text: "Late check-out request?", options: ["Strict 11am policy", "Flexible for great guests", "Case-by-case basis"] },
    { id: 9, text: "Your perfect guest review says?", options: ["'Super clean & organized!'", "'Felt like family!'", "'Most unique stay ever!'"] },
    { id: 10, text: "Weekend hosting vibe?", options: ["Full service (local recs, coffee)", "Hands-off (keys + enjoy)", "Curated experiences (tours, swims)"] }
  ]

  const handleAnswer = (choice) => {
  const newAnswers = [...answers, choice];
  setAnswers(newAnswers);

  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(currentQuestion + 1);
  } else {
    // REAL SCORING with for loop
    let energy = 0, social = 0, style = 0;
    for(let i = 0; i < newAnswers.length; i++) {
      if(newAnswers[i].includes('swim') || newAnswers[i].includes('Endurance')) energy++;
      if(newAnswers[i].includes('welcome') || newAnswers[i].includes('Full service')) social++;
      if(newAnswers[i].includes('Luxe') || newAnswers[i].includes('magical')) style++;
    }

    // Dynamic result based on highest score
    const scores = { energy, social, style };
    const hostType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    // Save to localStorage + Leaderboard
  const result = {
    hostType,
    scores,
    timestamp: Date.now(),
    answers: newAnswers  // Full audit trail
  };

  // Get existing results or []
  const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
  results.unshift(result);  // Add to front (newest first)
  localStorage.setItem('quizResults', JSON.stringify(results.slice(0, 100)));  // Keep top 100

  setHostResult(hostType);
  setCurrentQuestion(-1);
  }
};



return (
  <div className="App">
    <h1>Which Airbnb host style are you?</h1>

    {currentQuestion >= 0 && currentQuestion < questions.length ? (
      // QUESTION SCREEN (unchanged)
      <div>
        <div style={{marginBottom: '20px'}}>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${(currentQuestion/10)*100}%`}}></div>
          </div>
          <small>Question {currentQuestion + 1} of 11</small>
        </div>
        <h2>{questions[currentQuestion].text}</h2>
        {questions[currentQuestion].options.map((option, index) => (
          <button key={index} onClick={() => handleAnswer(option)}>
            {option}
          </button>
        ))}
        {currentQuestion > 0 && (
          <button className="prev" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
            ← Previous
          </button>
        )}
        <p style={{color: '#666', fontSize: '14px'}}>
          Previous: {answers[currentQuestion-1] || 'None yet'}
        </p>
      </div>
    ) : currentQuestion === -1 ? (
      // RESULTS SCREEN
      <div>
        <h2>Your Host Style: {hostResult.charAt(0).toUpperCase() + hostResult.slice(1)} Host 🏠</h2>
        <p>Perfect for {hostResult} travelers!</p>
        <p><strong>Listing tips:</strong> Oceanfront spot, bike rentals, Strava routes</p>
        <button onClick={() => {setCurrentQuestion(0); setAnswers([]);}}>
          Retake Quiz
        </button>
        <button onClick={() => setCurrentQuestion(-2)}>View Leaderboard</button>
      </div>
    ) : currentQuestion === -2 ? (
      // 🆕 LEADERBOARD SCREEN (FIXED)
      <div>
        <h3>🏆 Top Hosts (local)</h3>
        {(() => {
          const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
          const counts = { energy: 0, social: 0, style: 0 };
          results.forEach(r => counts[r.hostType]++);

          return (
            <div>
              <p>Energy Hosts: <strong>{counts.energy}</strong></p>
              <p>Social Hosts: <strong>{counts.social}</strong></p>
              <p>Style Hosts: <strong>{counts.style}</strong></p>
              <p>Total Quizzes: <strong>{results.length}</strong></p>
              <button onClick={() => setCurrentQuestion(0)}>New Quiz</button>
              <button onClick={() => localStorage.removeItem('quizResults')}>Clear Data</button>
            </div>
          );
        })()}
      </div>
    ) : null}
  </div>
);

}
export default App;
