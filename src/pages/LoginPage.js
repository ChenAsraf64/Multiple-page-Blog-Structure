import { TextField, Button, Link } from "@material-ui/core";

function LoginPage() {
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
                    />
                </div>
                <div>
                    <TextField
                        id="password"
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                    />
                </div>
                <div>
                    <Button variant="contained" color="primary">
                        Login
                    </Button>
                    <Link href="/login">Forgot password?</Link>
                </div>
            </form>
        </main>
    );
}

export default LoginPage;
