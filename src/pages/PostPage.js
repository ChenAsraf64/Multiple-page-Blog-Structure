//When im cliking on the side bar posts this is the component 

import { useParams } from "react-router-dom";
import { posts } from "../PostsArray.js";
import FullPost from '../components/FullPost.js';

const PostPage = () => {
    // Get the post ID from the URL params
    const { id } = useParams();

    // Find the post with the matching ID
    const post = posts.find((p) => p.id === parseInt(id));

    // Render the post data, or a message if no matching post was found
    if (!post) {
        return <div>
            Post not found</div>;
    }

    return (
        <div>
            <FullPost {...post} />
        </div>
    );
};

export default PostPage;
