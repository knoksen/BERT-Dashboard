/// <reference types="vitest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import usePersistentState from '../hooks/usePersistentState';

const KEY = 'test_persistent_key';

const Harness: React.FC<{ initial: string }> = ({ initial }) => {
  const [val, setVal, reset] = usePersistentState(KEY, initial);
  return (
    <div>
      <p data-testid="value">{val}</p>
      <button onClick={() => setVal(v => v + 'X')}>Append</button>
      <button onClick={() => setVal('custom')}>SetCustom</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

describe('usePersistentState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes from default when no localStorage entry', () => {
    render(<Harness initial="BASE" />);
    expect(screen.getByTestId('value').textContent).toBe('BASE');
    expect(JSON.parse(window.localStorage.getItem(KEY) || 'null')).toBe('BASE');
  });

  it('persists updates and can reset', async () => {
    render(<Harness initial="START" />);
    await userEvent.click(screen.getByRole('button', { name: 'Append' }));
    expect(screen.getByTestId('value').textContent).toBe('STARTX');
    expect(JSON.parse(window.localStorage.getItem(KEY) || 'null')).toBe('STARTX');

    await userEvent.click(screen.getByRole('button', { name: 'SetCustom' }));
    expect(screen.getByTestId('value').textContent).toBe('custom');

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByTestId('value').textContent).toBe('START');
    expect(JSON.parse(window.localStorage.getItem(KEY) || 'null')).toBe('START');
  });

  it('reads pre-existing value from localStorage', () => {
    window.localStorage.setItem(KEY, JSON.stringify('PRESET'));
    render(<Harness initial="IGNORED" />);
    expect(screen.getByTestId('value').textContent).toBe('PRESET');
  });
});
