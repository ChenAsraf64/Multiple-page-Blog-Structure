import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <div>
            <Link to={"/"}>Home</Link> |{" "}
            <Link to={"/about"}>About Me</Link> |{" "}
            <Link to="/contact">Contact Me</Link> |{" "}
            <Link to="/newpost">New Post</Link>
            <Link id="login" to="/login">Login</Link>
        </div>
    );
};

export default Header;