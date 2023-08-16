import React from 'react';

function Sidebar(props) {
    const { title, posts = [], onPostClick } = props;

    return (
        <div className="sidebar">
            <h1>{title}</h1>
            {posts.map(post => (
                <div key={post.id} className="sidebar-item">
                    Blog post #{post.id}
                    <button className="arrow-button" onClick={() => onPostClick(post)}>→</button>
                </div>
            ))}
        </div>
    );
}

export default Sidebar;
