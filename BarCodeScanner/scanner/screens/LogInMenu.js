import React, { useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Button, Alert } from 'react-native';
import { firebase } from '../Firebase/firebase';
import { UserAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function LogInMenu({ navigation }) {
    // Accesses functions and variables from the AuthContext
    const { signIn, email, setEmail, password, setPassword } = UserAuth();

    // Load saved username and password on component mount
    useEffect(() => {
        AsyncStorage.getItem('email').then((value) => {
            if (value != undefined || value != null) {
                setEmail(value);
            };
        });

        AsyncStorage.getItem('password').then((value) => {
            if (value != undefined || value != null) {
                setPassword(value);
            };
        });
    }, []);

    // Save username and password on state change
    useEffect(() => {
        if (email != undefined || email != null && password != undefined || password != null) {
            AsyncStorage.setItem('email', email);
            AsyncStorage.setItem('password', password);
        }
    }, [email, password]);

    //Check if the Users suppose to be auto Loged In to their collection or not.
    useEffect(() => {
        AsyncStorage.getItem('inAccount').then((value) => {
            if (value == 'true') {
                checkAuthState();
            }
        });
    }, []);

    //If User is signed in automatically take them their collection
    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                apiPostUser();
                setTimeout(() => {
                    navigation.replace('SearchScreen');
                }, 1000);
            }
        });
    }, []);

    //If User logs out remove credentials
    useEffect(() => {
        AsyncStorage.getItem('inAccount').then((value) => {
            if (value == 'false') {
                removeItemFromAsyncStorage('email');
                removeItemFromAsyncStorage('password');
                setEmail('');
                setPassword('');
                AsyncStorage.setItem('inAccount', 'true');
            }
        });
    }, []);

    // Post user data to the API endpoint
    const apiPostUser = async () => {
        let user = { user: email };

        try {
            const res = await axios.post('http://10.0.0.32:9000/userPersonalDataBase', user);
        } catch (error) {
            console.log(error.message);
        }
    };

    // Function to sign in a user
    const signInUser = async () => {
        try {
            // Function to sign in a user using Firebase Authentication
            await signIn(email, password);
            apiPostUser();
            //User is loged into their account.
            AsyncStorage.setItem('inAccount', 'true');
        } catch (error) {
            console.error(error);
        }
    };

    // Check the authentication state and sign in the user automatically if credentials exist in AsyncStorage
    async function checkAuthState() {
        const saveUsersEmail = await AsyncStorage.getItem('email');
        const saveUsersPassword = await AsyncStorage.getItem('password');
        if (saveUsersEmail && saveUsersPassword) {
            try {
                await firebase.auth().signInWithEmailAndPassword(saveUsersEmail, saveUsersPassword);
            } catch (error) {
                console.error('Error authenticating user:', error);
            }
        }
    };

    // Navigate to the user registration screen
    const goToUserRegistrationScreen = () => {
        navigation.replace('UserRegistrationScreen');
    };

    // Remove an item from AsyncStorage using the provided key
    const removeItemFromAsyncStorage = async (key) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item with key "${key}" from AsyncStorage:`, error);
        }
    };

    return (
        // A container that adjusts its position to avoid the keyboard
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            {/* Input container */}
            <View style={styles.inputContainer}>
                {/* Email input */}
                <TextInput
                    placeholder='Email'
                    placeholderTextColor="#949ba3"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}
                />
                {/* Password input */}
                <TextInput
                    placeholder='Password'
                    placeholderTextColor="#949ba3"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.input}
                    secureTextEntry
                />
            </View>

            {/* Button container */}
            <View style={styles.buttonContainer}>
                {/* Login button */}
                <TouchableOpacity onPress={signInUser} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                {/* Register button */}
                <TouchableOpacity onPress={goToUserRegistrationScreen} style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutlineText}>Register</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#324d6f',
    },
    inputContainer: {
        width: '80%',
    },
    input: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 7,
    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    button: {
        backgroundColor: '#949ba3',
        width: '100%',
        padding: 15,
        borderRadius: 10,
    },
    buttonOutline: {
        backgroundColor: '#f5f5f5',
        marginTop: 7,
        borderColor: '#949ba3',
        borderWidth: 2,
    },
    buttonText: {
        color: '#f5f5f5',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonOutlineText: {
        color: '#949ba3',
        fontWeight: '700',
        fontSize: 16,
    },
});