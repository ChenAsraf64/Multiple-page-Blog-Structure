import { useState } from "react";
import { Link } from "react-router-dom";

function Post(props) {
    const { title, description, author, published } = props;
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        setIsClicked(true);
    };

    return (
        <div className="post">
            <div className="box"></div>
            <span>
                <Link to={title} onClick={handleClick} disabled={isClicked}>
                    <h3>Blog post #{title}</h3>
                </Link>

                <p>
                    {description}
                    <br />
                </p>
                <br />
                <p>Published {published} days ago by {author}</p>
            </span>
        </div>
    );
}

export default Post;