//When im cliking on the post side bar this is the componenet 

function FullPost(props) {
    const { title, description, author, published } = props;

    return (
        <div className="post">
            <span>
                <h3>Blog post #{title}</h3>
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

export default FullPost;