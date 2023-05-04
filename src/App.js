import './App.css';
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AboutMe from "./pages/AboutMe";
import Home from "./pages/Home";
import PostPage from "./pages/PostPage";
import NewPost from "./pages/NewPost";
import LoginPage from "./pages/LoginPage";


function App() {
  return (
    <>
      {/* Routes nest inside one another. Nested route paths build upon
            parent route paths, and nested route elements render inside
            parent route elements. See the note about <Outlet> below. */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutMe />} />
        </Route>
        <Route path="/:id" element={<PostPage />} />
        <Route path="/newpost" element={<NewPost />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;