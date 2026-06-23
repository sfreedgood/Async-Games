import { fireEvent, render, screen } from '@testing-library/react';
import { PlayingCardFace } from './PlayingCardFace';

const count = (text: string | null, ch: string) =>
  (text ?? '').split(ch).length - 1;

describe('PlayingCardFace', () => {
  it('colours red suits red and black suits dark', () => {
    const { rerender } = render(
      <PlayingCardFace card={{ name: 'A', suit: 'heart' }} />
    );
    expect(screen.getByRole('button').className).toContain('text-red-600');

    rerender(<PlayingCardFace card={{ name: 'A', suit: 'spade' }} />);
    expect(screen.getByRole('button').className).toContain('text-neutral-900');
  });

  it('shows the rank in both corners', () => {
    render(<PlayingCardFace card={{ name: '9', suit: 'spade' }} />);
    expect(screen.getAllByText('9')).toHaveLength(2);
  });

  it('renders one pip per rank value plus the two corner glyphs', () => {
    const { container } = render(
      <PlayingCardFace card={{ name: '5', suit: 'club' }} />
    );
    // 5 centre pips + 2 corner suit glyphs
    expect(count(container.textContent, '♣')).toBe(7);
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
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(
      true
    );
  });

  it('applies the raised style when selected', () => {
    render(<PlayingCardFace card={{ name: 'K', suit: 'spade' }} selected />);
    expect(screen.getByRole('button').className).toContain('-translate-y-4');
  });
});
