import './App.css';
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AboutMe from "./pages/AboutMe";
import PostPage from "./pages/PostPage";
import LoginPage from "./pages/LoginPage";
import MyBlog from './pages/MyBlog';
import NewPostForm from './components/NewPostForm';
import LogoutPage from './components/LogoutPage';
import UserPosts from './pages/UserPosts';
import SearchResults from './components/SearchResults';
import FullPost from './components/FullPost';
import TagPage from './components/TagPage.js';
import ContactMe from './components/ContactMe';




function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MyBlog />} />
          <Route path="about" element={<AboutMe />} />
          <Route path="/contact" element={<ContactMe />} />
          <Route path="/:id" element={<PostPage />} />
          <Route path="/newpost" element={<NewPostForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/myposts" element={<UserPosts />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="post/:id" element={<FullPost />} />
          <Route path="/tag/:tag" element={<TagPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
