import { Text, View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';
import { UserAuth } from './AuthContext';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserRegistrationScreen({ navigation }) {
    // Accesses functions and variables from the AuthContext
    const { createUser, email, setEmail, password, setPassword } = UserAuth();

    //Clears input when from previous text in LogInMenu
    useEffect(() => {
        setEmail('');
        setPassword('');
    }, []);

    // Function to create a user in Firebase Authentication
    const createNewUser = async () => {
        try {
            // Function to create a user in Firebase Authentication
            await createUser(email, password);
            //Returns User back to logInMenu so it can Log in User and send Them to their collection
            AsyncStorage.getItem('Error').then((value) => {
                if (value == 'false') {
                    navigation.replace('LogInMenu');
                    AsyncStorage.setItem('Error', 'true');
                }
            });
            //Returns User back to logInMenu so it can Log in User and send Them to their collection
        } catch (error) {
            console.error(error);
        }
    };

    //Navigates User back to LogInMenu
    const backToLogInMenu = () => {
        setEmail('');
        setPassword('');
        navigation.replace('LogInMenu');
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
                    secureTextEntry // Input type is set to password
                />
            </View>

            <View style={styles.buttonContainer}>
                {/* Button for registering a new user */}
                <TouchableOpacity onPress={createNewUser} style={styles.button}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

                {/* Button for navigating back to the login menu */}
                <TouchableOpacity onPress={backToLogInMenu} style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutlineText}>Already Have an account</Text>
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