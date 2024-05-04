import { useState } from 'react';
import { loginFields } from "../constants/formFields";
import Input from "./Input";

// Define form fields based on the imported loginFields from constants
const fields = loginFields;

// Initialize the form state with empty values for each field
let fieldsState = {};
fields.forEach(field => fieldsState[field.id] = '');

export default function Login() {
    // Declare and initialize state variables
    const [loginState, setLoginState] = useState(fieldsState);
    // State to control flash messages
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });

    // Function to handle flash messages
    const handleFlashMessage = (text, success) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), 2000);
    };

    // Function to handle input field changes
    const handleChange = (e) => {
        setLoginState({ ...loginState, [e.target.id]: e.target.value });
    }

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if required fields are entered
        if (!loginState.username) {
            handleFlashMessage("Please enter an username", false, 2000);
            return;
        } else {
            authenticateUser();
        }
    }

    // Handle Login API Integration here
    const authenticateUser = () => {
        // Extract username and password from the form state
        const usernameInput = loginState.username;

        // Send the encrypted credentials to the server
        fetch("/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: usernameInput
            }),
        })
            .then(async (response) => {
                if (response.ok) {
                    window.location.href = '/rag';
                } else {
                    handleFlashMessage("Enter a valid username", false);
                }
            })
            .catch((error) => {
                console.error("Error logging in:", error);
                handleFlashMessage("Error logging in", false);
            });
    };

    return (
        <div>

            {/* Displaying failure flash message */}
            {flashMessage.failure && (
                <div id="failFlashMsg">
                    {flashMessage.text}
                </div>
            )}

            {/* Login form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="-space-y-px">
                    {/* Map over form fields and render Input components for each */}
                    {fields.map(field =>
                        <Input
                            key={field.id}
                            handleChange={handleChange}
                            value={loginState[field.id]}
                            labelText={field.labelText}
                            labelFor={field.labelFor}
                            id={field.id}
                            name={field.name}
                            type={field.type}
                            isRequired={field.isRequired}
                            placeholder={field.placeholder}
                            maxLength={field.maxLength}
                        />
                    )}
                </div>

                {/* Login button */}
                <button className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-10" onClick={handleSubmit}>Login</button>
            </form>

        </div>
    )
}
