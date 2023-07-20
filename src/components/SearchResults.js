import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Post from "../components/Post.js";
import Comments from "../components/Comments.js";

const SearchResults = () => {
    const location = useLocation();
    const results = location.state ? location.state.results : [];
    const [selectedPost, setSelectedPost] = useState(null);

    const handlePostClick = (post) => {
        setSelectedPost(post);
    };

    const handleBackClick = () => {
        setSelectedPost(null);
    };

    return (
        <div>
            {selectedPost ?
                <div>
                    <button onClick={handleBackClick}>Back</button>
                    <Post {...selectedPost} />
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



