// Firebase App module
import firebase from 'firebase/compat/app';
// Firebase Authentication module
import 'firebase/compat/auth';
// Firebase Firestore module
import 'firebase/compat/firestore';

// Firebase configuration object
//Add you own FirebaseAuth firebaseConfig here
const firebaseConfig = {
    
};

// Initialize Firebase if it hasn't been initialized already
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export the firebase object for use in other files
export { firebase }