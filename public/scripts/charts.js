import firebaseConfig from "./firebaseConfig.js";
import {
    initializeApp,
    getApp,
    getApps
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    deleteDoc,
    updateDoc
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

console.log('Dashbaord');
const allJobs = await fetchAllUsers('jobs');
console.log(allJobs);

function getLast30Days() {
    const today = new Date();
    const last30Days = [];

    for (let i = 0; i < 30; i++) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        const year = pastDate.getFullYear();
        const month = String(pastDate.getMonth() + 1).padStart(2, '0');
        const day = String(pastDate.getDate()).padStart(2, '0');
        last30Days.push(`${year}-${month}-${day}`);
    }

    return last30Days;
}

function countJobsPerDay(jobs) {
    const last30Days = getLast30Days();
    const jobCount = {};

    // Initialize the jobCount object with last 30 days
    last30Days.forEach(date => {
        jobCount[date] = 0;
    });

    // Count jobs for each day
    jobs.forEach(job => {
        if (jobCount.hasOwnProperty(job.jobDate)) {
            jobCount[job.jobDate] += 1;
        }
    });

    // Create the result array
    const result = last30Days.map(date => ({
        date: date,
        count: jobCount[date]
    }));

    return result;
}

const jobData = countJobsPerDay(allJobs);
const labels = jobData.map(data => data.date);
const counts = jobData.map(data => data.count);

const last7Days = jobData.splice(0, 7);
const labels2 = last7Days.map(data => data.date);
const counts2 = last7Days.map(data => data.count);
console.log(last7Days);

const ctx = document.getElementById('jobChart').getContext('2d');
const ctx2 = document.getElementById('jobBar').getContext('2d');

const jobChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Number of Jobs',
            data: counts,
            borderColor: '#B80E12',
            backgroundColor: '#00000000',
            fill: true,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                },
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Jobs'
                }
            }
        }
    }
});

const jobBar = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: labels2,
        datasets: [{
            label: 'Number of Jobs',
            data: counts2,
            borderColor: '#B80E12',
            backgroundColor: '#B80E12',
            fill: true,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                },
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Jobs'
                }
            }
        }
    }
});