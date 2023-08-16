import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Post from '../components/Post';

function TagPage() {
    const [posts, setPosts] = useState([]);
    const { tag } = useParams();

    useEffect(() => {
        axios.get(`http://localhost:5000/posts/tag/${tag}`)
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error(`There was an error retrieving the data: ${error}`);
            });
    }, [tag]);

    return (
        <div className="TagPage">
            <h2>Posts with tag: {tag}</h2>
            {posts.map(post => (
                <Post
                    key={post.id}
                    {...post}
                    likes={post.likes}
                    image={post.image}
                />
            ))}
        </div>
    );
}

export default TagPage;


