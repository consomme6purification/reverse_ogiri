import firebase from 'firebase' 

// ここにfirebase側のプロジェクト設定から確認できる構成オブジェクトを入力する
const firebaseConfig = {
  apiKey: "********************",
  authDomain: "********************",
  databaseURL: "********************",
  projectId: "********************",
  storageBucket: "********************",
  messagingSenderId: "********************",
  appId: "********************",
};

  const settings = { timestampsInSnapshots: true };
  firebase.initializeApp(firebaseConfig);
  firebase.firestore().settings(settings);
  export const db = firebase.firestore();
export default firebase