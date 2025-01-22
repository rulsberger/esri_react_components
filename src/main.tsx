import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@esri/calcite-components/dist/calcite/calcite.css';
import { setAssetPath } from "@esri/calcite-components/dist/components";

// Set the asset path for Calcite icons
setAssetPath(window.location.href);

// Ensure Web Components are initialized
import { defineCustomElements } from '@esri/calcite-components/dist/loader';
defineCustomElements(window);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
