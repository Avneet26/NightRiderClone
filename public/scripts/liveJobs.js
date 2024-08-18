import firebaseConfig from "./firebaseConfig.js";
import {
    initializeApp,
    getApp,
    getApps
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

async function fetchAllUsers(dbName) {
    try {
        const usersCollection = collection(db, dbName);
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // console.log(userList);
        return userList;
    } catch (e) {
        console.error("Error fetching user data: ", e);
    }
}

console.log('Live Jobs');
const allJobs = await fetchAllUsers('jobs');

allJobs.forEach(function(job, idx) {
    if(job.jobStatus != "completed" && job.jobStatus != "invoiced") {
        const html = `
        <div class="col-3">
            <div class="inner bg-white rounded p-3 position-relative">
                <h1 class="position-absolute live-id"><b>${idx + 1}</b></h1>
                <p>BAY: <strong>${job.bay}</strong></p>
                <p>COMPANY: <strong>${job.company}</strong></p>
                <p>UNIT: <strong>${job.unit}</strong></p>
                <p>STATUS: <strong>${job.jobStatus}</strong></p>
                <div style="overflow-x:scroll">
                    <p>Parts:</p>
                    <table class="border table tire-table">
                        <tbody>
                            <tr>
                                <th>Qty</th>
                                <th>Tire</th>
                                <th>Desc.</th>
                            </tr>
                        </tbody>
                    </table>
                </div>   
                <p>${job.notes}</p>
            </div>
        </div>
        `;
        document.querySelector(".live-jobs-container").insertAdjacentHTML('beforeend', html);
        job.tire.forEach(function(tire) {
            const newtire = `
            <tr>
                <td>${tire.qty}</td>
                <td>${tire.name}</td>
                <td>${tire.desc}</td>
            </tr>
        `;
            document.querySelector('.tire-table').insertAdjacentHTML('beforeend', newtire);
        });
    }
});



setTimeout(() => {
    window.location.reload();
}, 30000);