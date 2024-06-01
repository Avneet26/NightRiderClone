const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();



export default {
    addUserData, fetchAllUsers
}
