import React, { useState, useEffect } from "react";
import Post from "../components/Post.js";
import Sidebar from "../components/Sidebar.js";
import axios from 'axios';
import Comments from "../components/Comments.js";
import { useLocation } from 'react-router-dom';

function MyBlog() {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [popularPosts, setPopularPosts] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const location = useLocation();

    useEffect(() => {
        axios.get('http://localhost:5000/posts')
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error(`There was an error retrieving the data: ${error}`);
            });

        axios.get('http://localhost:5000/popular-posts')
            .then(response => {
                setPopularPosts(response.data);
            })
            .catch(error => {
                console.error(`There was an error retrieving the data: ${error}`);
            });
    }, [refresh]);

    useEffect(() => {
        setSelectedPost(null);
    }, [location]);


    const sortedPostsByTime = [...popularPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const latestPosts = sortedPostsByTime.slice(-3);
    const topPopularPosts = [...popularPosts].sort((a, b) => b.likes - a.likes).slice(0, 3);

    const handlePostClick = (post) => {
        setSelectedPost(post);
    };

    const handleBackClick = () => {
        setSelectedPost(null);
    };

    const handleLike = (postId) => {
        axios.post(`http://localhost:5000/posts/${postId}/like`)
            .then(() => {
                setRefresh(!refresh);
            })
            .catch(error => {
                console.error(`There was an error liking the post: ${error}`);
            });
    };

    return (
        <div id="root">
            <title>My blog</title>
            <h1>Chen Asraf Private Blog Post</h1>

            <div>
                {selectedPost ?
                    <div>
                        <button onClick={handleBackClick}>Back</button>
                        <Post key={selectedPost.id} {...selectedPost} likes={selectedPost.likes} handlePostLike={() => handleLike(selectedPost.id)} />
                        <Comments postId={selectedPost.id} />
                    </div>
                    :
                    popularPosts.map((post) => (
                        <div key={post.id} onClick={() => handlePostClick(post)}>
                            <Post {...post} tags={post.tags} likes={post.likes} handlePostLike={() => handleLike(post.id)} />
                        </div>
                    ))
                }
            </div>

            <div id="latest-sidebar">
                <Sidebar title="Latest" posts={latestPosts} onPostClick={handlePostClick} />
            </div>
            <div className="line"></div>
            <div id="popular-sidebar">
                <Sidebar title="Popular" posts={topPopularPosts} onPostClick={handlePostClick} />
            </div>
        </div>
    );
}

export default MyBlog;

