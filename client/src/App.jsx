import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PostcardList from './pages/PostcardList';
import PostcardDetail from './pages/PostcardDetail';
import PostcardCreate from './pages/PostcardCreate';
import PostcardEdit from './pages/PostcardEdit';
import ImageLibrary from './pages/ImageLibrary';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="postcards" element={<PostcardList />} />
        <Route path="postcards/create" element={<PostcardCreate />} />
        <Route path="postcards/:id" element={<PostcardDetail />} />
        <Route path="postcards/:id/edit" element={<PostcardEdit />} />
        <Route path="images" element={<ImageLibrary />} />
      </Route>
    </Routes>
  );
}

export default App;
