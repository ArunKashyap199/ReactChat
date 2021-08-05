import firebase from "firebase";
import firestore from "firebase/firestore";

const settings = { timestampsInSnapshots: true };

const config = {
	projectId: "reactchat11",
	apiKey: "AIzaSyChBvF32rD11iSI7Bo6WaeX32770mDOymU",
	databaseURL: "https://reactchat11-default-rtdb.firebaseio.com",
};
firebase.initializeApp(config);

firebase.firestore().settings(settings);
var database = firebase.database();

export default firebase;
