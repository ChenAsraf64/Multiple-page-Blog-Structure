import React, { useState } from "react";
import Comments from "./Comments.js";

function Post(props) {
    const { id, title, description, author, published } = props;
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
    };

    return (
        <div className="post" onClick={handleClick}>
            <div className="box"></div>
            <h3>Blog post: {title}</h3>
            <p>
                {description}
                <br />
            </p>
            <br />
            <p>Published on {published} by {author}</p>
            {isClicked && <Comments postId={id} />}
        </div>
    );
}

export default Post;


