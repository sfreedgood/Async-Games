import { fireEvent, render, screen } from '@testing-library/react';
import { PlayingCardFace } from './PlayingCardFace';

// Visual details (red/black colour, raised "selected" state) are covered by the
// Storybook snapshot tests; these specs assert behaviour and structure via
// Testing Library queries (the repo's spec lib excludes the DOM types).
describe('PlayingCardFace', () => {
  it('shows the rank in both corners', () => {
    render(<PlayingCardFace card={{ name: '9', suit: 'spade' }} />);
    expect(screen.getAllByText('9')).toHaveLength(2);
  });

  it('renders one pip per rank value plus the two corner glyphs', () => {
    render(<PlayingCardFace card={{ name: '5', suit: 'club' }} />);
    // 5 centre pips + 2 corner suit glyphs
    expect(screen.getAllByText('♣')).toHaveLength(7);
  });

  it('labels the card for accessibility', () => {
    render(<PlayingCardFace card={{ name: '10', suit: 'diamond' }} />);
    expect(screen.getByLabelText('10 of diamond')).toBeTruthy();
  });

  it('fires onClick with the card when enabled', () => {
    const onClick = jest.fn();
    render(
      <PlayingCardFace card={{ name: '3', suit: 'club' }} onClick={onClick} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith({ name: '3', suit: 'club' });
  });

  it('does not fire onClick when disabled', () => {
    const onClick = jest.fn();
    render(
      <PlayingCardFace
        card={{ name: '3', suit: 'club' }}
        onClick={onClick}
        disabled
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
