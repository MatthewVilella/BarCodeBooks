import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, Alert } from 'react-native';
import { SearchBar } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BarcodeScannerModal from './BarCodeScannerCamera';
import { UserAuth } from './AuthContext';
import { firebase } from '../Firebase/firebase';

export default function SearchScreen({ navigation }) {
    // State variables
    const [search, setSearch] = useState(''); // Stores the search text
    const [isLoading, setIsLoading] = useState(true); // Indicates if the data is loading
    const [dataSource, setDataSource] = useState([]); // Stores the fetched data
    const [arrayholder, setArrayholder] = useState([]); // Stores a copy of the fetched data for filtering
    const [modalVisible, setModalVisible] = useState(false); // Indicates if the modal is visible
    const { logOut, email, setEmail } = UserAuth(); // Accesses functions and variables from the AuthContext

    // Fetches data from the User's database on component mount
    useEffect(() => {
        fetchUsersDataBase();
    }, []);

    // Loads saved username from AsyncStorage on component mount
    useEffect(() => {
        AsyncStorage.getItem('email').then((value) => setEmail(value));
    }, []);

    // Fetches the data from the User's database
    const fetchUsersDataBase = () => {
        //Enter IP for local Host to work
        fetch('http://Enter IP for local Host to work:9000/data')
            .then((response) => response.json())
            .then((responseJson) => {
                setIsLoading(false);
                setDataSource(responseJson);
                setArrayholder(responseJson);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    // Clears the search text and filters the data accordingly
    function clearFunction() {
        setSearch('');
        SearchFilterFunction('');
    }

    // Filters the data based on the search text
    function SearchFilterFunction(text) {
        const newData = arrayholder.filter(function (item) {
            const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });
        setDataSource(newData);
        setSearch(text);
    }

    // Renders a separator between list items
    function ListViewItemSeparator() {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#f5f5f5',
                }}
            />
        );
    }

    // Renders a loading indicator while data is being fetched
    if (isLoading) {
        return (
            <View style={{ flex: 1, paddingTop: 21 }}>
                <ActivityIndicator />
            </View>
        );
    }

    // Sends a post request to tell which User Database to accsess 
    const apiPostUser = async () => {
        AsyncStorage.getItem('email').then((value) => setEmail(value));
        let user = { user: email };

        try {
            //Enter IP for local Host to work
            const res = await axios.post('http://Enter IP for local Host to work:9000/userPersonalDataBase', user);
        } catch (error) {
            console.log(error.message);
        }
    };

    // Post User data for database deletion to the API endpoint
    const apiPostDeleteUser = async () => {
        let user = { user: email };

        try {
            //Enter IP for local Host to work
            const res = await axios.post('http://Enter IP for local Host to work:9000/deleteUser', user);
        } catch (error) {
            console.log(error.message);
        }
    };

    // Delete the User's Database and Firebase authentication
    const deleteUser = async () => {
        const user = firebase.auth().currentUser;
        if (user) {
            try {
                await apiPostDeleteUser();
                await user.delete();
                AsyncStorage.setItem('inAccount', 'false');
                navigation.replace('LogInMenu');
                console.log('User deleted successfully.');
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    // Logs out the user and navigates to the login menu
    const LogOutUser = async () => {
        try {
            await logOut();
            AsyncStorage.setItem('inAccount', 'false');
            navigation.replace('LogInMenu');
        } catch (error) {
            console.error(error);
        }
    }

    // Opens the modal for barcode scanning
    const openModal = () => {
        setModalVisible(true);
    };

    // Closes the modal and makes request to receive new data if any
    const closeModal = () => {
        apiPostUser();
        setTimeout(() => {
            fetchUsersDataBase();
        }, 1000);
        setModalVisible(false);
    };

    // Displays an alert to confirm the deletion of a User
    const deleteUserAlert = () => {
        Alert.alert('Deleteing Account', `Once you Account is deleted all data regarding this account will be Gone. Are you sure you wish to procced?`, [
            { text: 'No' },
            { text: 'Yes', onPress: () => { deleteUser() } },
        ]);
    };

    // Displays an alert as an Settings Menu.
    const Settings = () => {
        Alert.alert('Settings', ``, [
            { text: 'Close' },
            { text: 'Delete Account', onPress: () => { deleteUserAlert() } },
            { text: 'Log Out', onPress: () => { LogOutUser() } },
        ]);
    };

    return (
        <View style={styles.viewStyle}>
            <View style={styles.backgroundImage}>
                <View style={styles.container}>
                    {/* Button for logging out */}
                    <TouchableOpacity style={{ ...styles.button, marginRight: 60 }} onPress={Settings}>
                        <Ionicons name="settings-sharp" size={30} color="#f5f5f5" />
                    </TouchableOpacity>

                    {/* Button for opening barcode scanner */}
                    <TouchableOpacity style={{ ...styles.button, marginLeft: 10, paddingRight: 10, }} onPress={openModal}>
                        <MaterialCommunityIcons name="barcode-scan" size={30} color="#f5f5f5" />
                    </TouchableOpacity>

                    {/* Modal for barcode scanning */}
                    <Modal visible={modalVisible} animationType="slide">
                        <BarcodeScannerModal closeModal={closeModal} />
                    </Modal>
                </View>

                {/* Search bar */}
                <SearchBar
                    round
                    searchIcon={{ size: 25, color: '#949ba3' }}
                    onChangeText={(text) => SearchFilterFunction(text)}
                    onClear={() => clearFunction()}
                    placeholder="Type Here to Search."
                    placeholderTextColor="#949ba3"
                    value={search}
                    containerStyle={styles.searchContainerStyle}
                    inputContainerStyle={styles.searchInputContainerStyle}
                    inputStyle={styles.searchInputStyle}
                />

                {/* Flat list for displaying the data */}
                <FlatList
                    data={dataSource}
                    ItemSeparatorComponent={ListViewItemSeparator}
                    numColumns={4}
                    columnWrapperStyle={styles.columnWrapper}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.bookContainer}
                            onPress={() => navigation.navigate('UpcItemsDetails', item)}
                        >
                            <Text style={styles.textStyle}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    viewStyle: {
        justifyContent: 'center',
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        backgroundColor: '#324d6f',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: 55
    },
    searchContainerStyle: {
        backgroundColor: '#949ba3',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        paddingVertical: 4,
        borderRadius: 8,
    },
    searchInputContainerStyle: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    searchInputStyle: {
        color: '#324d6f',
    },
    textStyle: {
        padding: 11,
        color: '#f5f5f5',
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
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    bookContainer: {
        width: 75,
        height: 100,
        backgroundColor: '#949ba3',
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
        marginTop: 10,
        marginRight: 5,
    },
    textStyle: {
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 5,
        color: '#f5f5f5',
    },
});
