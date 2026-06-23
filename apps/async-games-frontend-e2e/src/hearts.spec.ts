import { test, expect, type Page, type Route } from '@playwright/test';

type Card = { name: string; suit: string };

const players = () => [
  { seat: 0, name: 'You', isBot: false, handCount: 13, totalScore: 0, roundScore: 0 },
  { seat: 1, name: 'West', isBot: true, handCount: 13, totalScore: 0, roundScore: 0 },
  { seat: 2, name: 'North', isBot: true, handCount: 13, totalScore: 0, roundScore: 0 },
  { seat: 3, name: 'East', isBot: true, handCount: 13, totalScore: 0, roundScore: 0 },
];

const view = (overrides: Partial<Record<string, unknown>> = {}) => ({
  gameId: 'e2e-game',
  phase: 'playing',
  roundNumber: 0,
  passDirection: 'left',
  heartsBroken: false,
  viewerSeat: 0,
  currentTurn: 0,
  trickLeader: 0,
  players: players(),
  yourHand: [] as Card[],
  legalMoves: [] as Card[],
  pendingPassCount: 0,
  currentTrick: { leadSuit: null, plays: [] as { seat: number; card: Card }[] },
  lastTrick: null,
  winnerSeat: null,
  ...overrides,
});

const fulfill = (route: Route, body: unknown) =>
  route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });

test.describe('Hearts UI', () => {
  test('plays a legal card into the trick and disables illegal cards', async ({
    page,
  }: {
    page: Page;
  }) => {
    const initial = view({
      yourHand: [
        { name: '2', suit: 'club' },
        { name: 'A', suit: 'heart' },
      ],
      legalMoves: [{ name: '2', suit: 'club' }],
    });
    const afterPlay = view({
      yourHand: [{ name: 'A', suit: 'heart' }],
      legalMoves: [],
      currentTurn: 1,
      currentTrick: {
        leadSuit: 'club',
        plays: [{ seat: 0, card: { name: '2', suit: 'club' } }],
      },
    });

    await page.route('**/api/hearts/games', (route) =>
      route.request().method() === 'POST' ? fulfill(route, initial) : route.fallback()
    );
    await page.route('**/api/hearts/games/*/play', (route) =>
      fulfill(route, afterPlay)
    );

    await page.goto('/hearts');

    // Illegal card is disabled before any move.
    await expect(
      page.getByRole('button', { name: 'A of heart' })
    ).toBeDisabled();

    // Play the legal 2 of clubs.
    await page.getByRole('button', { name: '2 of club' }).click();

    // It now appears in the centre trick area.
    await expect(
      page.getByTestId('trick-area').getByLabel('2 of club')
    ).toBeVisible();
    await expect(page.getByTestId('turn-status')).toContainText('Waiting for West');
  });

  test('passes three cards then finishes with a winner', async ({
    page,
  }: {
    page: Page;
  }) => {
    const passing = view({
      phase: 'passing',
      yourHand: [
        { name: '2', suit: 'club' },
        { name: '5', suit: 'club' },
        { name: '9', suit: 'club' },
        { name: 'A', suit: 'heart' },
      ],
      legalMoves: [],
      currentTrick: { leadSuit: null, plays: [] },
    });
    const playing = view({
      yourHand: [{ name: '2', suit: 'club' }],
      legalMoves: [{ name: '2', suit: 'club' }],
    });
    const finished = view({
      phase: 'finished',
      winnerSeat: 0,
      yourHand: [],
      legalMoves: [],
      players: players().map((p) =>
        p.seat === 0 ? { ...p, totalScore: 80 } : { ...p, totalScore: 102 }
      ),
    });

    await page.route('**/api/hearts/games', (route) =>
      route.request().method() === 'POST' ? fulfill(route, passing) : route.fallback()
    );
    await page.route('**/api/hearts/games/*/pass', (route) =>
      fulfill(route, playing)
    );
    await page.route('**/api/hearts/games/*/play', (route) =>
      fulfill(route, finished)
    );

    await page.goto('/hearts');

    const passButton = page.getByTestId('pass-button');
    await expect(passButton).toBeDisabled();

    await page.getByRole('button', { name: '2 of club' }).click();
    await page.getByRole('button', { name: '5 of club' }).click();
    await page.getByRole('button', { name: '9 of club' }).click();
    await expect(passButton).toBeEnabled();
    await passButton.click();

    // Now in the playing phase, it is our turn.
    await expect(page.getByTestId('turn-status')).toContainText('Your turn');

    await page.getByRole('button', { name: '2 of club' }).click();

    // Game over banner names the winner.
    const banner = page.getByTestId('game-over');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('You wins!');
  });
});
