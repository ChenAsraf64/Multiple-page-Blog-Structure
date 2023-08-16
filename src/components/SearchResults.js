import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Post from "../components/Post.js";
import Comments from "../components/Comments.js";

const SearchResults = () => {
    const location = useLocation();
    const results = location.state ? location.state.results : [];

    console.log("Debug: Results from location state:", results); // Debugging line

    const [selectedPost, setSelectedPost] = useState(null);
    const [refresh, setRefresh] = useState(false); // For refreshing the posts
    const [popularPosts, setPopularPosts] = useState([]);

    useEffect(() => {
        // Refresh posts when refresh state changes
        if (selectedPost) {
            axios.get(`http://localhost:5000/posts/${selectedPost.id}`)
                .then(response => {
                    setSelectedPost(response.data);
                })
                .catch(error => {
                    console.error(`There was an error retrieving the data: ${error}`);
                });
        }
        // Fetch popular posts
        axios.get('http://localhost:5000/popular-posts')
            .then(response => {
                setPopularPosts(response.data);
            })
            .catch(error => {
                console.error(`There was an error retrieving the data: ${error}`);
            });
    }, [refresh]);

    const handlePostClick = (post) => {
        axios.get(`http://localhost:5000/posts/${post.id}`)
            .then(response => {
                setSelectedPost(response.data);
            })
            .catch(error => {
                console.error(`There was an error retrieving the data: ${error}`);
            });
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
        <div>
            {selectedPost ?
                <div>
                    <button onClick={handleBackClick}>Back</button>
                    <Post key={selectedPost.id} {...selectedPost} likes={selectedPost.likes} handlePostLike={() => handleLike(selectedPost.id)} />
                    <Comments postId={selectedPost.id} />
                </div>
                :
                results.map((post) => (
                    <div key={post.id} onClick={() => handlePostClick(post)}>
                        <h3>{post.title}</h3>
                        <p>{post.body.substring(0, 100)}...</p>
                    </div>
                ))
            }
            {results.length === 0 && <p>No search results to display</p>}
        </div>
    );
};

export default SearchResults;
