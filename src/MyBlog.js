import React from "react";
import Post from "./components/Post.js";
import Sidebar from "./components/Sidebar.js";
import { posts } from './PostsArray.js';

function MyBlog() {
    const sides = [
        {
            id: 1,
            title: "Latest",
            postnum: "1",
            postnum1: "2",
            postnum2: "3",
        },
        {
            id: 2,
            title: "Popular",
            postnum: "3",
            postnum1: "2",
            postnum2: "1",
        },
    ];


    return (
        <div id="root">
            <title>My blog</title>
            <h1>This is my blog</h1>

            <div>
                {posts.map((post) => (
                    <Post key={post.id} {...post} />
                ))}
            </div>

            <div id="latest-sidebar"><Sidebar title={sides[0].title} postnum={sides[0].postnum} postnum1={sides[0].postnum1} postnum2={sides[0].postnum2} /></div>


            <div className="line"></div>

            <div id="popular-sidebar"><Sidebar title={sides[1].title} postnum={sides[1].postnum} postnum1={sides[1].postnum1} postnum2={sides[1].postnum2} /></div>


        </div>

    );
}

export default MyBlog;