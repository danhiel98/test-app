import * as firebase from "firebase";
import "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDK_pVP79jJPgXiF42T03WSZ9uoyqdwTKQ",
    authDomain: "tests-1871b.firebaseapp.com",
    databaseURL: "https://tests-1871b.firebaseio.com",
    projectId: "tests-1871b",
    storageBucket: "tests-1871b.appspot.com",
    messagingSenderId: "580204606804",
    appId: "1:580204606804:web:73ad4d0084ddf9b4a144c1",
    measurementId: "G-NDYK0WH8T7"
};

const app = firebase.initializeApp(firebaseConfig);

export default app;
