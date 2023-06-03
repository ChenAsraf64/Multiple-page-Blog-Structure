import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure to import axios

function LogoutPage() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:5000/logout');
            console.log(response.data);
        } catch (error) {
            console.error('Error during logout', error);
        }

        // Then navigate to another page.
        navigate('http://localhost:5000/login');
    };

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default LogoutPage;

