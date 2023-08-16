import React, { useState } from "react";
import axios from 'axios';

function NewPostForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [error, setError] = useState(null);
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = 'http://localhost:5000/posts';
        const formData = new FormData();
        formData.append('title', title);
        formData.append('body', description);
        formData.append('tags', tags);
        if (image) {
            formData.append('image', image);
        }

        axios.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
        })
            .then((res) => {
                console.log(res.data); // Log the response from the backend
                setTitle("");
                setDescription("");
                setTags("");
                setImage(null);
                setError(null); // Clear any existing error messages
            })
            .catch((err) => {
                console.error(err);
                // Check if error response status is 401 Unauthorized
                if (err.response && err.response.status === 401) {
                    setError("To post here you need to login");
                }
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="description">Description:</label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="tags">Tags:</label>
                <input
                    type="text"
                    id="tags"
                    value={tags}
                    placeholder="Enter tags, separated by commas"
                    onChange={(e) => setTags(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="image">Upload image:</label>
                <input
                    type="file"
                    id="image"
                    onChange={(e) => setImage(e.target.files[0])}
                />
            </div>

            <button type="submit" className="myButton">Add Post</button>
            {error && <p>{error}</p>} {/* Display error message when 'error' is not null */}
        </form>
    );
}

export default NewPostForm;
