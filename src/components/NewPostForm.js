import React, { useState } from "react";
import { posts } from "../PostsArray.js";

function NewPostForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [author, setAuthor] = useState("");
    const [published, setPublished] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const newPost = {
            id: posts.length + 1,
            title: title,
            description: description,
            author: author,
            published: published,
        };
        posts.push(newPost);
        // Reset form values
        setTitle("");
        setDescription("");
        setAuthor("");
        setPublished("");
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
            <div>
                <label htmlFor="published">Published:</label>
                <input
                    type="text"
                    id="published"
                    value={published}
                    onChange={(e) => setPublished(e.target.value)}
                />
            </div>
            <button type="submit" className="myButton">Add Post</button>
        </form>
    );
}
export default NewPostForm;