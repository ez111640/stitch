// src/App.js

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TextEditor from './TextEditor';
import PatternPage from './pages/PatternPage';

const App = () => {
  const publicUrl = process.env.PUBLIC_URL || '';
  const resolvedBaseName =
    publicUrl && publicUrl !== '/' && window.location.pathname.startsWith(publicUrl)
      ? publicUrl
      : '';

  return (
    <BrowserRouter basename={resolvedBaseName}>
      <div>
        <Routes>
          <Route path="/" element={<TextEditor />} />
          <Route path="/pattern" element={<PatternPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
