// No bootstrap file needed

import '../css/app.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';

const container = document.getElementById('app');

if (container) {
    const root = createRoot(container);
    console.log('Rendering App...');
    root.render(
        <AppRouter />
    );
}
