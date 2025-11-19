import { Route, Routes, Link } from 'react-router-dom';

import { ClassicCard } from './domains/classic-card';
import { useAxiosGet } from './hooks/api';
import { ClassicDeckEntity } from './domains/classic-card';

export function App() {
  const { data: deck } = useAxiosGet<ClassicDeckEntity>('/cards/deck');

  return (
    <div>
      <h1>Welcome</h1>
      {/* START: routes */}
      {/* These routes and navigation have been generated for you */}
      {/* Feel free to move and update them to fit your needs */}
      {deck?.cards.map((card) => {
        return (
          <ClassicCard
            key={`${card.name}-${card.suit}`}
            suit={card.suit}
            name={card.name}
            primaryValue={card.primaryValue}
          />
        );
      })}

      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
          <li>
            <Link to="/deck">Cards</Link>
          </li>
        </ul>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
        <Route
          path="/deck"
          element={
            <div>
              <Link to="deck">View Deck</Link>
            </div>
          }
        />
      </Routes>
      {/* END: routes */}
    </div>
  );
}

export default App;
