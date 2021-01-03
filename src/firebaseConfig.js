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

    // apiKey: "AIzaSyDK_pVP79jJPgXiF42T03WSZ9uoyqdwTKQ",
    // authDomain: "tests-1871b.firebaseapp.com",
    // databaseURL: "https://tests-1871b.firebaseio.com",
    // projectId: "tests-1871b",
    // storageBucket: "tests-1871b.appspot.com",
    // messagingSenderId: "580204606804",
    // appId: "1:580204606804:web:73ad4d0084ddf9b4a144c1",
    // measurementId: "G-NDYK0WH8T7"
};

const app = firebase.initializeApp(firebaseConfig);

export default app;
