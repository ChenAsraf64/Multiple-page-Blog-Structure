import React, { useState } from "react";
import { Link } from "react-router-dom";
import Comments from "./Comments.js";
import axios from 'axios';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

function Post(props) {
    const { id, title, body, author, published, tags = [], likes, image } = props;
    const [isClicked, setIsClicked] = useState(false);
    const [likeCount, setLikeCount] = useState(likes || 0);
    const [isLiked, setIsLiked] = useState(false); // To keep track of whether the post is liked or not


    const handleClick = () => {
        setIsClicked(true);
    };

    const handleLike = (event) => {
        event.stopPropagation();

        axios.post(`http://localhost:5000/posts/${id}/like`, {}, { withCredentials: true })
            .then(() => {
                setLikeCount(prevLikeCount => prevLikeCount + 1);
                setIsLiked(true); // Post is now liked
            })
            .catch(error => {
                console.error(`There was an error liking the post: ${error}`);
            });
    };

    return (
        <div className="post" onClick={handleClick}>
            <h3>Blog post: {title}</h3>
            <div className="image-container">
                {image && <img className="post-image" src={`http://localhost:5000/images/${image}`} alt={title} />}
            </div>
            <p>
                {body}
            </p>
            {tags.filter(Boolean).map((tag, index) => (
                <Link key={index} to={`/tag/${tag}`}>
                    <span className="tag">{tag}</span>
                </Link>
            ))}
            <p>Published on {published} by {author}</p>
            <p>{likeCount} Likes</p>
            <button onClick={handleLike} style={{ background: 'transparent', border: 'none' }}>
                {isLiked ?
                    <AiFillHeart style={{ color: 'red', fontSize: '24px' }} />
                    :
                    <AiOutlineHeart style={{ color: 'black', fontSize: '24px' }} />}
            </button>

            {isClicked && <Comments postId={id} />}
        </div>
    );
}

export default Post;



