import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Comments({ postId }) {
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [fetchTrigger, setFetchTrigger] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:5000/posts/${postId}/comments`)
            .then(response => {
                setComments(response.data);
                setFetchTrigger(false);
            })
            .catch(error => {
                console.error(`Error fetching comments: ${error}`);
            });
    }, [postId, fetchTrigger]);

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post(`http://localhost:5000/posts/${postId}/comments`, { content: commentContent }, { withCredentials: true })
            .then(response => {
                setComments([...comments, response.data]);
                setCommentContent('');
                setFetchTrigger(true);
            })
            .catch(error => {
                console.error(`Error adding comment: ${error}`);
                if (error.response && error.response.status === 401) {
                    alert('You must be logged in to post a comment.');
                }
            });
    };


    return (
        <div>
            <h3>Comments</h3>
            {comments.map(comment => (
                <div key={comment.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '8px', backgroundColor: '#f8f8f8', width: '30%' }}>
                    <p style={{ marginBottom: '5px', color: '#365899', fontWeight: 'bold' }}>
                        {comment.username}
                        <span style={{ fontWeight: 'normal', color: '#616770' }}> commented at {new Date(comment.created_at).toLocaleString()}</span>
                    </p>
                    <p style={{ margin: '0' }}>{comment.content}</p>
                </div>
            ))}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={commentContent}
                    onChange={e => setCommentContent(e.target.value)}
                    placeholder="New comment"
                    required
                />
                <button type="submit">Add Comment</button>
            </form>
        </div>
    );

}

export default Comments;
