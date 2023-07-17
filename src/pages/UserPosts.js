import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserPosts() {
    const [posts, setPosts] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingBody, setEditingBody] = useState('');
    const [error, setError] = useState(null);

    const refetchPosts = () => {
        const url = 'http://localhost:5000/user_posts';
        axios.get(url, { withCredentials: true })
            .then((res) => {
                setPosts(res.data);
                setError(null);
            })
            .catch((err) => {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    setError("Please login to view your posts");
                }
            });
    };

    useEffect(() => {
        refetchPosts();
    }, []);

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditingTitle(post.title);
        setEditingBody(post.body);
    };

    const updatePost = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/posts/${editingPostId}`, {
                title: editingTitle,
                body: editingBody
            }, { withCredentials: true });

            if (response.status === 200) {
                console.log('Post updated successfully');
                setEditingPostId(null); // Close the editor
                refetchPosts(); // Refetch the posts after updating
            } else if (response.status === 403) {
                console.log('You are not the author of this post');
            }
        } catch (error) {
            console.error('Error updating post', error);
        }
    };

    const deletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete your post?")) {
            return; // If user presses Cancel, we return without deleting the post
        }

        try {
            const response = await axios.delete(`http://localhost:5000/posts/${postId}`, { withCredentials: true });

            if (response.status === 200) {
                console.log('Post deleted successfully');
                // Remove the post from the state
                setPosts(posts.filter(post => post.id !== postId));
            } else if (response.status === 403) {
                console.log('You are not the author of this post');
            }
        } catch (error) {
            console.error('Error deleting post', error);
        }
    };



    return (
        <div>
            <h1>My Posts</h1>
            <br></br>
            {error && <p>{error}</p>}
            {posts.map((post) => (
                <div key={post.id}>
                    {editingPostId === post.id ? (
                        <div>
                            <input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} />
                            <textarea value={editingBody} onChange={e => setEditingBody(e.target.value)} />
                            <button onClick={updatePost}>Save</button>
                        </div>
                    ) : (
                        <div>
                            <h2>{post.title}</h2>
                            <p>{post.body}</p>
                            <button onClick={() => startEditing(post)}>Edit</button>
                            <button onClick={() => deletePost(post.id)}>Delete</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default UserPosts;
