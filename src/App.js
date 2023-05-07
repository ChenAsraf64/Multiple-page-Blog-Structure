import './App.css';
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AboutMe from "./pages/AboutMe";
import PostPage from "./pages/PostPage";
import LoginPage from "./pages/LoginPage";
import MyBlog from './pages/MyBlog';
import NewPostForm from './components/NewPostForm';


function App() {
  return (
    <>
      {/* Routes nest inside one another. Nested route paths build upon
            parent route paths, and nested route elements render inside
            parent route elements. See the note about <Outlet> below. */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MyBlog />} />
          <Route path="about" element={<AboutMe />} />
          <Route path="/:id" element={<PostPage />} />
          <Route path="/newpost" element={<NewPostForm />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

      </Routes>
    </>
  );
}

export default App;