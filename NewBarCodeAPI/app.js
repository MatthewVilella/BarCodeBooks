//Dependencies for the application
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
// Middleware for parsing application/json data.
app.use(bodyParser.json());
//Imports the Firebase Admin SDK and provides access to Firebase services on the server-side.
const admin = require("firebase-admin");

//These are for accsessing and doing specific actions in FireBase DataBase.
let dataRequestBody;
let upc;
let userScanning;
let userPersonalDataBase;
let userWhoDeletesItem;
let upcBookAlreadyExist;
let deleteUser;

//These are use to form the fetch URL to Look up and Receieve data on Book.
let url = 'https://api.upcitemdb.com/prod/trial/lookup?upc=';
let findBookUrl;

//These variables store are for storing book information based on a given UPC code.
let book;
let image;
let isbn;
//This is for telling if a book already exist or not.
let bookAlreadyExist;

//Stores a reference to a specific collection in the Firestore database. 
let collectionRef;
//An array that is used to store the details of UPC items retrieved from the Firestore database.
let returnUpcItemDetails = [];
//An array that keeps track of the UPC item details that have already been sent to to filter out duplicate data.
let sentUpcItemDetails = [];

//Firebase Admin SDK is initialized using a service account credential, and a connection to the Firestore database is established.
let serviceAccount = require('./item-upc-info-firebase-adminsdk-1c8dr-dfde7306eb.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
let firebaseDataBase = admin.firestore();

let fetchUpcFinderApi = (() => {
    // Book information is extracted from the API response and stored in variables.
    fetch(findBookUrl)
        .then(response => {
            return response.json();
        })
        .then(Users => {
            if (!Users.items[0].isbn) {
                return console.log('not a book');
            }
            else {
                isbn = Users.items[0].isbn;
            }

            if (!Users.items[0].images[1] || Users.items[0].images[1] == undefined) {
                image = 'NO IMAGE';
            }
            else {
                image = Users.items[0].images[1];
            }

            book = {
                isbn: isbn,
                title: Users.items[0].title,
                madeBy: Users.items[0].publisher,
                image: image,
            }
            // If the book already exists, it is not added to the database.
            if (bookAlreadyExist == true) {
                console.log('exist');

            }
            // Otherwise, the book is added to the Firestore database.
            else {
                firebaseDataBase.collection('UsersCollection').doc('User').collection(userScanning).doc(isbn).set(book);
            }
        })
})

//Retrieves a specific book from the Firestore database.
async function getBook(firebaseDataBase, name) {
    return await firebaseDataBase.collection('users').doc(name).get();
}
//Deletes Book in the User's Database.
async function fireBaseDeleteBook(firebaseDataBase, name) {
    return await firebaseDataBase.collection('UsersCollection').doc('User').collection(userWhoDeletesItem).doc(name).delete();
}
//Deletes User's DataBase from Firebase Database.
async function deleteUsersDataBase(collectionPath) {
    // Get a reference to the collection within the 'users' document
    const deleteCollectionRef = firebaseDataBase.collection('UsersCollection').doc('User').collection(collectionPath);

    // Retrieve a query snapshot of all the documents within the collection
    const querySnapshot = await deleteCollectionRef.get();

    // Delete each document in the collection
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
        deletePromises.push(doc.ref.delete());
    });

    // Wait for all delete operations to complete
    await Promise.all(deletePromises);

    console.log(`Documents within collection '${collectionPath}' deleted successfully.`);
}


app.post('/book', (req, res, next) => {
    // This route handler receives a POST request with a UPC number and user information.
    dataRequestBody = req.body;
    upc = dataRequestBody.upcNumber;
    userScanning = dataRequestBody.user;
    // It fetches book details from the external API and adds the book to the Firestore database.
    findBookUrl = url + upc;
    fetchUpcFinderApi();
    // Call next() to pass control to the next middleware or route handler
    next();
});

app.post('/userPersonalDataBase', (req, res, next) => {
    // This route handler receives a POST request with user information.
    dataRequestBody = req.body;
    userPersonalDataBase = dataRequestBody.user;
    // It sets up the Firestore collection reference for accessing user-specific data.
    collectionRef = firebaseDataBase.collection('UsersCollection').doc('User').collection(userPersonalDataBase);
    next();
});

app.get('/data', (req, res) => {
    // This route handler retrieves data from the Firestore database and sends it as a response.
    collectionRef.get().then(upcItemDetails => {
        upcItemDetails.forEach(doc => {
            returnUpcItemDetails.push({
                isbn: doc.data().isbn,
                title: doc.data().title,
                madeBy: doc.data().madeBy,
                image: doc.data().image,
            })
        });
        console.log(returnUpcItemDetails);
        // filter out any data that has already been sent
        const newData = returnUpcItemDetails.filter(book => !sentUpcItemDetails.includes(book));
        // add the new data to the sentUpcItemDetails array
        sentUpcItemDetails = sentUpcItemDetails.concat(newData);
        // send the response with the new data
        res.send(newData);
    }).catch(err => {
        console.log('Error getting documents', err);
    });

});

app.get('/book/:upc', (req, res) => {
    // This route handler retrieves a specific book from the Firestore database to check if it already exist or not.
    getBook(firebaseDataBase, 'upcNum').then(book => {
        if (book.exists) {
            bookAlreadyExist = true;
            return res.status(200).json(book);
        }
        else {
            bookAlreadyExist = false;
        }
        return res.status(404).send('Couldnt Find book');
    });
});

app.post('/deleteBook', (req, res) => {
    // This route handler receives a POST request with information about a book to be deleted and the User who want the book deleted.
    dataRequestBody = req.body;
    upcBookAlreadyExist = dataRequestBody.deleteBooksIsbn;
    userWhoDeletesItem = dataRequestBody.userDeleting;
    // It deletes the book from the Firestore database.
    fireBaseDeleteBook(firebaseDataBase, upcBookAlreadyExist);
    upcBookAlreadyExist = undefined;
    userWhoDeletesItem = undefined;
});

app.post('/deleteUser', async (req, res) => {
    // This route handler receives a POST request with information about a user to be deleted.
    dataRequestBody = req.body;
    deleteUser = dataRequestBody.user;

    // It deletes the User's data from the Firestore database.
    try {
        await deleteUsersDataBase(deleteUser);
        res.status(200).send(`Collection '${deleteUser}' deleted successfully.`);
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).send('An error occurred while deleting the collection.');
    }
});


//These lines of code set up Express to parse incoming requests as JSON and handle URL-encoded data.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//This exports the app object, allowing it to be used as a module in other files.
module.exports = app;

