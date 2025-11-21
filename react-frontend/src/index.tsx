import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Корневой элемент с id "root" не найден');
}

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

