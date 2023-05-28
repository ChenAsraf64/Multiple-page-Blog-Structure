import React, { useState } from "react";

function Post(props) {
    const { title, description, author, published } = props;
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
    };

    return (
        <div className="post" onClick={handleClick}>
            <div className="box"></div>
            <h3>Blog post #{title}</h3>
            <p>
                {description}
                <br />
            </p>
            <br />
            <p>Published {published} days ago by {author}</p>
        </div>
    );
}

export default Post;
