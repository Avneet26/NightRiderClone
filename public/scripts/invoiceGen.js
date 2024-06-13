import firebaseConfig from "./firebaseConfig.js";
import {initializeApp, getApp, getApps} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {getFirestore, doc, getDoc} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

async function getDocumentById(collectionName, documentId) {
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.warn("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error retrieving document:", error);
        throw error;
    }
}

function getUrlID() {
    return window.location.search.split("=")[1];
}

console.log("Invoice Page")

let data = await getDocumentById("jobs", getUrlID());
console.log("job data", data)

function fillDetails() {
    document.querySelector(".invoice-date").innerText = new Date().toLocaleDateString("en-US");
    document.querySelector(".inv-name").innerText = data.company;
    document.querySelector(".inv-email").innerText = data.email;
    document.querySelector(".inv-phone").innerText = data.driverPhone;
    document.querySelector(".inv-vin").innerText = data.vinNum;
    document.querySelector(".inv-unit").innerText = data.unit;
    document.querySelector(".inv-make").innerText = data.make;
    document.querySelector(".inv-lic").innerText = data.lic;

    document.querySelector(".inv-notes").innerText = data.notes;

    data.tire.forEach(function(ele) {
        const html = `
            <tr>
                <td>${ele.qty}</td>
                <td>${ele.name}</td>
                <td></td>
                <td>${ele.price}</td>
            </tr>
        `;
        document.querySelector(".tire-table").insertAdjacentHTML('beforeend', html);
    });

    document.querySelector(".inv-driver-name").innerText = data.driverName;

}

document.querySelector("#invoice-download").addEventListener("click", function(){
    const element = document.querySelector("#invoice-container");
    var opt = {
        filename:     `invoice${data.company}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, width: 992 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    }
    html2pdf(element, opt);
})

document.querySelector(".footer-body").remove();

fillDetails();

document.querySelector(".loader-container").remove();
document.querySelector('#invoice-container.d-none').classList.remove('d-none');