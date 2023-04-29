import { Link } from "react-router-dom";
import { posts } from '../PostsArray.js';

function Sidebar(props) {
    const { title, postnum, postnum1, postnum2 } = props;
    return (
        <div>
            <div className="sidebar">
                <h1>{title}</h1>
                <p>Blog post #{postnum} <Link id={postnum} to={postnum}>go to page</Link></p>
                <p>Blog post #{postnum1} <Link id={postnum1} to={postnum1}>go to page</Link></p>
                <p>Blog post #{postnum2} <Link id={postnum2} to={postnum2}>go to page</Link></p>
            </div>
        </div>
    );
}

export default Sidebar;