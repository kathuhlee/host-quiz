import { useState } from 'react'
import './App.css'

function App() {
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

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
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentQuestion(-1);

    }
  };
return (
  <div className="App">
    <h1>Which Airbnb host style are you?</h1>
    {currentQuestion >= 0 && currentQuestion < questions.length ? (
      <div>
        <div style={{marginBottom: '20px', fontSize: '18px'}}>
          Question {currentQuestion + 1} of 11
        </div>
        <h2>{questions[currentQuestion].text}</h2>
        {questions[currentQuestion].options.map((option, index) => (
          <button key={index} onClick={() => handleAnswer(option)}>
            {option}
          </button>
        ))}
      </div>
    )
// results screen
    : currentQuestion === -1 ? (
      <div>
        <h2>Your Host Style: Adventure Triathlete 🏊</h2>
        <p>Energy score: High! You thrive with active guests.</p>
        <p><strong>Listing tips:</strong> Oceanfront spot, bike rentals, Strava routes</p>
        <button onClick={() => {setCurrentQuestion(0); setAnswers([]);}}>
          Retake Quiz
        </button>
      </div>
    )
// default shouldn't show up, but just in case
    : null}
  </div>
);
}

export default App;
