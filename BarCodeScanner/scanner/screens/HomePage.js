import { View, StyleSheet, Button, Modal, Text } from 'react-native';
import { UserAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HomePage({ navigation }) {
    const { signIn, isValidEmailFormat, isValidPasswordLength, email, setEmail, password, setPassword } = UserAuth();
    const [show2, setShow2] = useState('');

    
    
    
    
    useEffect(() => {
        // Load saved username and password on component mount
        AsyncStorage.getItem('email').then((value) => setEmail(value));
    }, []);

    let person;

    const fetchApiPost = async () => {
        person = { person: show2 };
        console.log(person);

        try {
            const res = await axios.post('http://10.0.0.32:9000/userPersonalDataBase', person);
        } catch (error) {
            console.log(error.message);
        }
    }

    // useEffect(() => {
    //     // Load saved username and password on component mount
    //     fetchApiPost();

    // }, []);

    const [modalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    const fetchApiPostUsersLibrary = async () => {
        let usersEmail = { usersEmail: email };
        console.log(usersEmail);

        try {
            const res = await axios.post('http://10.0.0.32:9000/userPersonalDataBase', usersEmail);
        } catch (error) {
            console.log(error.message);
        }
    };

    //Grants access to logOut function from AuthContext.js file.
    const { logOut } = UserAuth();

    //Log Out user who is signed into Firebase Authentication.
    const LogOutUser = async () => {
        try {
            await logOut();
            AsyncStorage.setItem('show', 'false');
            navigation.replace('LogInMenu');
            console.log('You are logged out')
        } catch (error) {
            console.error(error);
        }
    }


    //On press take User to SearchScreen.js
    const GoToSearchScreen = () => {
        fetchApiPostUsersLibrary();
        navigation.navigate('SearchScreen')
    };

    const GoToUserRegistrationScreen = () => {
        navigation.replace('UserRegistrationScreen');
    };

    //On press take User to BarCodeScannerCamera.js
    const GoToBarCodeScannerCamera = () => {
        navigation.navigate('BarCodeScannerCamera')
    };

    return (
        <View style={styles.container}>
            <Button
                title={'Saved'}
                onPress={GoToSearchScreen}
            ></Button>

            <Button
                title={'Scan'}
                onPress={GoToBarCodeScannerCamera}
            ></Button>

            <Button
                title={'out'}
                onPress={LogOutUser}
            ></Button>

            <Button
                title={'in'}
                onPress={fetchApiPostUsersLibrary}
            ></Button>

            <Button title="Open Modal" onPress={toggleModal} />
            <Modal visible={modalVisible} onRequestClose={toggleModal}>
                <View>
                    <Text>This is a modal!</Text>
                    <Button title="Close" onPress={toggleModal} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    maintext: {
        fontSize: 16,
        margin: 20,
    },
    barcodebox: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        width: 300,
        overflow: 'hidden',
        borderRadius: 30,
        backgroundColor: 'tomato'
    },
});