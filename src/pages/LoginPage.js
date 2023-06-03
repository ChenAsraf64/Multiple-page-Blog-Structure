import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';

function LoginPage() {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [resp, setResp] = useState('');
    const [data, setData] = useState([]);  // data state added

    const doEditUser = (e) => {
        setUser(e.target.value);
    };

    const doEditPass = (e) => {
        setPass(e.target.value);
    };

    const doLogin = (e) => {
        e.preventDefault(); // Prevent form submission

        const url = 'http://localhost:5000/login';
        const dataToSend = {   // renamed to avoid confusion with 'data' state
            user: user,
            pass: pass
        };

        axios
            .post(url, dataToSend, { withCredentials: true })
            .then((res) => {
                setData([]);  // clear the data state
                setResp('Welcome!');
            })
            .catch((err) => {
                setData([]);  // clear the data state
                setResp('Error!');
            });
    };

    const doRegister = (e) => {
        e.preventDefault();

        const url = 'http://localhost:5000/register';  // Update the URL for the registration endpoint
        const dataToSend = {
            user: user,
            pass: pass
        };

        axios
            .post(url, dataToSend)
            .then((res) => {
                setResp('Registration successful!');  // Set the success message
                setUser('');  // Clear the username field
                setPass('');  // Clear the password field
            })
            .catch((err) => {
                setResp('Error occurred during registration.');  // Set the error message
            });
    };




    return (
        <main>
            <h1 className="login-page__title">Login</h1>
            <form className="login-form">
                <div>
                    <TextField
                        id="username"
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        onChange={doEditUser}
                    />
                </div>
                <div>
                    <TextField
                        id="password"
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        onChange={doEditPass}
                    />
                </div>
                <div>
                    <Button onClick={doLogin} type="submit" variant="contained" color="primary">
                        Login
                    </Button>
                    <p>{resp}</p>
                    <br></br>
                    <br></br>
                    <p>Not registered yet? click here:</p>
                    <Button onClick={doRegister} type="submit" variant="contained" color="primary">
                        Register
                    </Button>
                </div>
            </form>
        </main>
    );
}

export default LoginPage;

