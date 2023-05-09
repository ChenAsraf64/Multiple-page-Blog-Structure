import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

const Header = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    My Website
                </Typography>
                <Button color="inherit" component={Link} to="/">
                    Home
                </Button>
                <Button color="inherit" component={Link} to="/about">
                    About Me
                </Button>
                <Button color="inherit" component={Link} to="/contact">
                    Contact Me
                </Button>
                <Button color="inherit" component={Link} to="/newpost">
                    New Post
                </Button>
                <Button color="inherit" id="login" component={Link} to="/login">
                    Login
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
