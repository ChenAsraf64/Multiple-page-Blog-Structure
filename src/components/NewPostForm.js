import React, { useState } from "react";
import axios from 'axios';

function NewPostForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [author, setAuthor] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = 'http://localhost:5000/posts';
        const data = {
            title: title,
            body: description,
            user_id: author
        }

        axios.post(url, data)
            .then((res) => {
                console.log(res.data); // Log the response from the backend
                setTitle("");
                setDescription("");
                setAuthor("");
            })
            .catch((err) => {
                console.error(err);
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
                <label htmlFor="author">Author:</label>
                <input
                    type="text"
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                />
            </div>

            <button type="submit" className="myButton">Add Post</button>
        </form>
    );
}

export default NewPostForm;
