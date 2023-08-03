import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Modal, TouchableOpacity, Image, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAuth } from './AuthContext';
import BarcodeScannerModal from './BarCodeScannerCamera';

export default function UpcItemsDetails({ navigation }) {
    // Accesses functions and variables from the AuthContext
    const { email, setEmail } = UserAuth();

    // State for controlling the visibility of the modal
    const [modalVisible, setModalVisible] = useState(false);

    // Load saved username and password on component mount
    useEffect(() => {
        AsyncStorage.getItem('email').then((value) => setEmail(value));
    }, []);

    // Sends a post request to tell which User Database to accsess 
    const apiPostUser = async () => {
        let user = { user: email };

        try {
            //Enter IP for local Host to work
            const res = await axios.post('http://Enter IP for local Host to work:9000/userPersonalDataBase', user);
        } catch (error) {
            console.log(error.message);
        }
    };

    // Sends a POST request to delete a book in the User's Database using its ISBN and for which User Database
    const apiPostDeleteBook = async () => {
        let deleteBook = { deleteBooksIsbn: navigation.getParam('isbn'), userDeleting: email };

        try {
           //Enter IP for local Host to work
            const res = await axios.post('http://Enter IP for local Host to work:9000/deleteBook', deleteBook);
        } catch (error) {
            console.log(error.message);
        }
    };

    // Opens the modal
    const openModal = () => {
        setModalVisible(true);
    };

    // Closes the modal and calls the API to obtain accsess back to the User's Database
    const closeModal = () => {
        apiPostUser();
        setModalVisible(false);
    };

    // Navigates back to the SearchScreen
    const GoToSearchScreen = () => {
        navigation.replace('SearchScreen');
    };

    // Displays an alert to confirm the deletion of a book
    const deleteBook = () => {
        Alert.alert('Delete Book', `${navigation.getParam('title')}`, [
            { text: 'NO' },
            { text: 'YES', onPress: () => { apiPostDeleteBook() } },
        ]);
    };

    return (
        <View style={styles.backgroundImage}>
            <View style={styles.container}>
                {/* Button for navigating back to the SearchScreen */}
                <TouchableOpacity style={{ ...styles.button, marginRight: 60 }} onPress={GoToSearchScreen}>
                    <Ionicons name="arrow-back-circle-sharp" size={30} color="#f5f5f5" />
                </TouchableOpacity>

                {/* Button for opening the barcode scanner modal */}
                <TouchableOpacity style={{ ...styles.button, marginLeft: 10, paddingRight: 10, }} onPress={openModal}>
                    <MaterialCommunityIcons name="barcode-scan" size={30} color="#f5f5f5" />
                </TouchableOpacity>

                {/* Modal for displaying the barcode scanner */}
                <Modal visible={modalVisible} animationType="slide">
                    <BarcodeScannerModal closeModal={closeModal} />
                </Modal>
            </View>

            {/* Display book title */}
            <Text style={styles.title}>{navigation.getParam('title')}</Text>

            {/* Display book ISBN */}
            <Text style={styles.isbn}>#ISBN: {navigation.getParam('isbn')}</Text>

            {/* Display book image */}
            <Image
                style={styles.image}
                source={{ uri: navigation.getParam('image') }}
            />

            {/* Display publisher information */}
            <Text style={styles.publish}>Published by {navigation.getParam('madeBy')}</Text>

            {/* Button for deleting the book */}
            <TouchableOpacity style={styles.deleteContainer} onPress={deleteBook}>
                <FontAwesome name="trash" size={30} color="#f5f5f5" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        backgroundColor: '#324d6f',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: 30,
        alignItems: 'center'
    },
    image: {
        width: '60%',
        height: 300,
    },
    title: {
        fontSize: 24,
        marginBottom: 5,
        color: '#f5f5f5',
    },
    isbn: {
        fontSize: 14,
        marginBottom: 10,
        color: '#949ba3',
    },
    publish: {
        marginTop: 20,
        fontSize: 16,
        color: '#949ba3',
        marginBottom: 50,
    },
    deleteContainer: {
        backgroundColor: '#949ba3',
        padding: 10,
        marginTop: 10,
        borderRadius: 5,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#949ba3',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        flex: 1,
    },
})
