import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { UserAuth } from './AuthContext';


export default function BarcodeScannerModal({ closeModal }) {
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [hasFlashPermission, setHasFlashPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
    const [startScanning, setStartScanning] = useState(false);

    // Custom hook to access the user's email from the authentication context
    const { email, setEmail } = UserAuth();

    // Get the user's email from AsyncStorage on component mount
    useEffect(() => {
        AsyncStorage.getItem('email').then((value) => setEmail(value));
    }, []);

    // Request camera and flash permissions on component mount
    useEffect(() => {
        (async () => {
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            const flashStatus = await Camera.requestMicrophonePermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
            setHasFlashPermission(flashStatus.status === 'granted');
        })();
    }, []);

    // Function for barcode scanning
    const handleBarCodeScanned = ({ type, data }) => {
        if (startScanning) {
            setScanned(true);
            //If barcode type is 32 the scan if not return.
            if (type === 32) {
                let usersScannedData = { upcNumber: data, user: email };

                // Send scanned data to the server using axios
                const apiPostScannedData = async () => {
                    try {
                        //Enter IP for local Host to work
                        const res = await axios.post('http://Enter IP for local Host to work:9000/book', usersScannedData);
                    } catch (error) {
                        console.log(error.message);
                    }
                };

                // Display an alert asking the user to add the book to their collection
                Alert.alert(
                    'Book Scanned',
                    `Book with UPC Number  ${data}  has been scanned! Would you like to add it to your collection.`,
                    [
                        { text: 'No' },
                        { text: 'Yes', onPress: () => apiPostScannedData() },
                    ]
                );
            } else {
                // Display an alert if the scanned item is not a book
                Alert.alert('Item Scanned', 'Not a Book', [{ text: 'Close' }]);
            }
        }
    };

    // Toggle the torch (flashlight) on/off
    const toggleTorch = () => {
        setTorchOn((prev) => !prev);
    };

    // Switch between front and back camera
    const toggleCamera = () => {
        setCameraType((prev) =>
            prev === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back
        );
    };

    // Start scanning for barcodes
    const startScanningHandler = () => {
        setStartScanning(true);
    };

    // Reference to the camera component
    const cameraRef = useRef(null);

    // Handle camera and flashlight permissions states
    if (hasCameraPermission === null || hasFlashPermission === null) {
        return <Text>Requesting for camera and flashlight permissions</Text>;
    }

    if (hasCameraPermission === false || hasFlashPermission === false) {
        return <Text>No access to camera or flashlight</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* Torch button to toggle flashlight */}
                {hasFlashPermission && (
                    <TouchableOpacity style={styles.torchButton} onPress={toggleTorch}>
                        {torchOn ? (
                            <Ionicons name="ios-flash-off" size={30} color="#f5f5f5" />
                        ) : (
                            <Ionicons name="ios-flash" size={30} color="#f5f5f5" />
                        )}
                    </TouchableOpacity>
                )}

                {/* Camera switch button to toggle between front and back cameras */}
                <TouchableOpacity style={styles.cameraSwitchButton} onPress={toggleCamera}>
                    {cameraType === Camera.Constants.Type.back ? (
                        <MaterialIcons name="camera-front" size={30} color="#f5f5f5" />
                    ) : (
                        <MaterialIcons name="camera-rear" size={30} color="#f5f5f5" />
                    )}
                </TouchableOpacity>

                {/* Close modal button */}
                <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
                    <FontAwesome name="close" size={30} color="#f5f5f5" />
                </TouchableOpacity>
            </View>

            {/* Camera component for barcode scanning */}
            <Camera
                ref={cameraRef}
                type={cameraType}
                flashMode={torchOn ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.crosshairContainer}>
                {/* Crosshair design for better barcode scanning */}
                <View style={styles.crosshair} />

                {/* Start scanning button */}
                {!startScanning && (
                    <TouchableOpacity style={styles.scanButtonContainer} onPress={startScanningHandler}>
                        <Text style={styles.textStyle}>Tap to Start</Text>
                    </TouchableOpacity>
                )}

                {/* Button to scan again after successful scan */}
                {scanned && (
                    <View style={styles.scanButtonContainer}>
                        <TouchableOpacity onPress={() => setScanned(false)} style={styles.scanButton}>
                            <Text style={styles.textStyle}>Tap to Scan Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#324d6f',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        top: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
        zIndex: 1,
    },
    crosshairContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    crosshair: {
        width: 250,
        height: 150,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'transparent',
    },
    scanButtonContainer: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: '#949ba3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    textStyle: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f5f5f5',
    },
    closeModalButton: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    torchButton: {
        padding: 10,
        marginTop: 30,
        borderRadius: 5,
    },
    cameraSwitchButton: {
        padding: 10,
        marginTop: 30,
        borderRadius: 5,
    },
});
