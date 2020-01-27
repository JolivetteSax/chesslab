import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const queen = getByText(/wq/i);
  expect(queen).toBeInTheDocument();
});

test('renders learn react link', () => {
  const obj = new App();
  let id = obj.getId(0, 0);
  expect(id).toEqual('A8');
  id = obj.getId(7, 7);
  expect(id).toEqual('H1');
  let [x,y] = obj.decodePosition(id);
  expect(x).toEqual(7);
  expect(y).toEqual(7);
});

