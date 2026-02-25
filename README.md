# React Quiz matching users to Airbnb host types

# Airbnb Host Style Quiz
React quiz matching users to Airbnb host personalities—built for Connect Engineering Apprenticeship prep.

**Live Demo**: (https://quiz-phi-six-94.vercel.app/)

**Tech**: React 19 + Vite + scoring logic (for/if loops)
**Airbnb Connect Skills Demo**: State management, array iteration, conditional rendering

To start program, do "run npm dev" in terminal.

## Key Features
- **11 unique questions** covering morning routine, guest types, amenities, conflict resolution
- **Real scoring algorithm**: Counts keywords like "swim", "Endurance", "welcome", "Luxe" across answers
- **Progress tracking**: Visual bar + "Question X of 11"
- **Previous button**: Navigate back to change answers
- **Dynamic results**: Highest score wins (Energy vs Social vs Style Host)
- **Retake quiz**: Reset state with one click

## Key Decisions + Tradeoffs
| Choice and the why
| `useState` array | Track all 11 answers for final scoring | "Needed full answer history vs single-page apps" |
| For loop scoring | Simple, readable, no dependencies | "Like Splunk query logic at Apple—parse + count" |
| Inline styles + Tailwind | Fast iteration | "Prioritized ship speed over CSS modules" |
| No backend | Pure frontend MVP | "SQLite added later for anon result tracking" |
| 3 host types | Clear winner vs complex matrix | "Focused on Airbnb's core host archetypes" |

## Scoring Algorithm
```javascript
// Counts keywords across all 11 answers
let energy = 0, social = 0, style = 0;
for(let i = 0; i < answers.length; i++) {
  if(answers[i].includes('swim') || answers[i].includes('Endurance')) energy++;
  if(answers[i].includes('welcome') || answers[i].includes('Full service')) social++;
  if(answers[i].includes('Luxe') || answers[i].includes('magical')) style++;
}
// Highest score = your host type
