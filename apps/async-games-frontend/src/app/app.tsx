import { Route, Routes, Link } from 'react-router-dom';

import { ClassicCard, type ClassicDeckEntity } from './domains/classic-card';
import { useAxiosGet } from './hooks/api';
import { HeartsGamePage } from './domains/hearts';

function DeckDemo() {
  const { data: deck } = useAxiosGet<ClassicDeckEntity>('/cards/deck');
  return (
    <div className="flex flex-wrap gap-2 p-4">
      {deck?.cards.map((card) => (
        <ClassicCard
          key={`${card.name}-${card.suit}`}
          suit={card.suit}
          name={card.name}
          primaryValue={card.primaryValue}
        />
      ))}
    </div>
  );
}

function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to Async-Games</h1>
      <p className="mt-2 text-gray-600">
        Persistent, turn-based tabletop gaming.
      </p>
      <nav className="mt-4" role="navigation">
        <ul className="list-disc pl-6">
          <li>
            <Link className="text-emerald-700 underline" to="/hearts">
              Play Hearts
            </Link>
          </li>
          <li>
            <Link className="text-emerald-700 underline" to="/deck">
              View the deck
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hearts" element={<HeartsGamePage />} />
      <Route path="/deck" element={<DeckDemo />} />
    </Routes>
  );
}

export default App;
