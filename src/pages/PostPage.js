import { useParams } from "react-router-dom";
import { posts } from "../PostsArray.js";
import Post from '../components/Post.js';
import Header from '../components/Header.js';

const PostPage = () => {
    // Get the post ID from the URL params
    const { id } = useParams();

    // Find the post with the matching ID
    const post = posts.find((p) => p.id === parseInt(id));

    // Render the post data, or a message if no matching post was found
    if (!post) {
        return <div> <Header />
            Post not found</div>;
    }

    return (
        <div>
            <Header />
            <Post {...post} />
        </div>
    );
};

export default PostPage;
