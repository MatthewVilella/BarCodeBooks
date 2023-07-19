import { createContext, useContext, useEffect, useState } from "react";
import { firebase } from '../Firebase/firebase'; // Importing the Firebase module
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Creating a context for the user authentication functionality
const UserContext = createContext();

// AuthContextProvider component which wraps the application and provides authentication-related functionality
export const AuthContextProvider = ({ children }) => {
    // State variables for user, email, and password
    const [user, setUser] = useState({});
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Function to create a user in Firebase Authentication
    const createUser = async (email, password) => {
        return firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then(async () => {
                console.log('New account Created');
                AsyncStorage.setItem('Error', 'false');
            })
            .catch(error => {
                // Handling errors during user creation
                if (error.code === 'auth/email-already-in-use') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Email in Use', 'An account using this email already exist.',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/invalid-email') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Invalid Email', 'Please enter a valid email address.',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/weak-password') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Invalid Password Length', 'The password must contain 6 or more characters',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/missing-password') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Password Missing', 'There is no Password entered.',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/internal-error') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Server Error', 'Please try again later.',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/network-request-failed') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Network Connectivity Issue', 'Check your internet connection or try again later..',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                console.error(error);
            });
    };

    // Function to sign in a user using Firebase Authentication
    const signIn = async (email, password) => {
        return firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then(async () => {
                AsyncStorage.setItem('Error', 'false');
                console.log('User logged in');
            })
            .catch(error => {
                // Handling errors during sign-in
                if (error.code === 'auth/user-not-found') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('User account does not exist', 'Create an account or Check that information entered was spelled correctly',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/invalid-email') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Invalid Email', 'Please enter a valid email address.',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/wrong-password') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Incorrect Password', 'The Password you have entered is Incorrect.',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/missing-password') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Password Missing', 'There is no Password entered.',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/internal-error') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Server Error', 'Please try again later.',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                if (error.code === 'auth/network-request-failed') {
                    AsyncStorage.setItem('Error', 'true');
                    return Alert.alert('Network Connectivity Issue', 'Check your internet connection or try again later..',
                        [
                            { text: 'Close' },
                        ]
                    );
                }
                console.error(error);
            });
    };

    // Function to log out the currently signed-in user
    const logOut = () => {
        console.log('User has been logged out');
        return firebase.auth().signOut();
    };

    // useEffect hook to listen for changes in the authentication state
    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((createUser) => {
            setUser(createUser);
        })
        return () => {
            unsubscribe();
        }
    });

    // Providing the user authentication functionality through the UserContext.Provider
    return (
        <UserContext.Provider value={{ createUser, user, logOut, signIn, email, setEmail, password, setPassword }}>
            {children}
        </UserContext.Provider>
    )
}

// UserAuth component to consume the authentication functionality from UserContext
export const UserAuth = () => {
    return useContext(UserContext)
}
