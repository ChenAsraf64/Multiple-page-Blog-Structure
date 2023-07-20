// Header.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, OutlinedInput, IconButton } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/search?query=${searchText}`);
            navigate('/search', { state: { results: response.data } });
        } catch (error) {
            console.error('Error during search', error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
            document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            navigate('/login');
        } catch (error) {
            console.error('Error during logout', error);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    My Website
                </Typography>
                <OutlinedInput
                    placeholder="Search posts…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    inputProps={{ 'aria-label': 'search' }}
                    endAdornment={
                        <IconButton onClick={handleSearch} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    }
                />
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

                <Button color="inherit" onClick={handleMenuOpen}>
                    Login
                    <ArrowDropDownIcon />
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
                        Login
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                        Logout
                    </MenuItem>
                    <MenuItem component={Link} to="/myposts" onClick={handleMenuClose}>
                        My Posts
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Header;


