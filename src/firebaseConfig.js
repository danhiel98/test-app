import * as firebase from "firebase";
import "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB3d7zkpF_Nh9LpDhOD0Fnt_p0PwFE_H98",
    authDomain: "turbomega-9c7f7.firebaseapp.com",
    databaseURL: "https://turbomega-9c7f7.firebaseio.com",
    projectId: "turbomega-9c7f7",
    storageBucket: "turbomega-9c7f7.appspot.com",
    messagingSenderId: "918088120293",
    appId: "1:918088120293:web:994c5417055b746c2fe10c",
    measurementId: "G-G7S6Q94YYL"

};

const app = firebase.initializeApp(firebaseConfig);

export default app;
