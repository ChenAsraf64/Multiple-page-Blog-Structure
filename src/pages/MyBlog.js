import React, { useState, useEffect } from "react";
import Post from "../components/Post.js";
import Sidebar from "../components/Sidebar.js";
import axios from 'axios';
import Comments from "../components/Comments.js";

function MyBlog() {
    const sides = [
        {
            id: 1,
            title: "Latest",
            postnum: "1",
            postnum1: "2",
            postnum2: "3",
        },
        {
            id: 2,
            title: "Popular",
            postnum: "3",
            postnum1: "2",
            postnum2: "1",
        },
    ];

    // Create state variables for posts and selectedPost
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);

    // Fetch posts
    useEffect(() => {
        axios.get('http://localhost:5000/posts')
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error(`There was an error retrieving the data: ${error}`);
            });
    }, []);

    // Handle click on a post
    const handlePostClick = (post) => {
        setSelectedPost(post);
    };

    // Handle back to all posts
    const handleBackClick = () => {
        setSelectedPost(null);
    };

    return (
        <div id="root">
            <title>My blog</title>
            <h1>This is my blog</h1>

            <div>
                {selectedPost ?
                    <div>
                        <button onClick={handleBackClick}>Back</button>
                        <Post key={selectedPost.id} {...selectedPost} />
                        <Comments postId={selectedPost.id} />
                    </div>
                    :
                    posts.map((post) => (
                        <div key={post.id} onClick={() => handlePostClick(post)}>
                            <Post {...post} />
                        </div>
                    ))
                }
            </div>

            <div id="latest-sidebar"><Sidebar title={sides[0].title} postnum={sides[0].postnum} postnum1={sides[0].postnum1} postnum2={sides[0].postnum2} /></div>
            <div className="line"></div>
            <div id="popular-sidebar"><Sidebar title={sides[1].title} postnum={sides[1].postnum} postnum1={sides[1].postnum1} postnum2={sides[1].postnum2} /></div>
        </div>
    );
}

export default MyBlog;

