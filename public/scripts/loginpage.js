import firebaseConfig from "./firebaseConfig.js";
import {
    initializeApp,
    getApp,
    getApps,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    deleteDoc,
    orderBy,
    query,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
let userProps = null;
async function addUserData(dbName, userData, redirect) {
    try {
        const db = getFirestore(firebaseApp);
        const docRef = await addDoc(collection(db, dbName), {...userData, createdAt: new Date()});
        window.location = redirect
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
async function fetchAllUsers(dbName) {
    try {
        const usersCollection = collection(db, dbName);
        const usersQuery = query(usersCollection, orderBy('createdAt', 'desc'));
        const userSnapshot = await getDocs(usersQuery);
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
async function updateDocumentById(collectionName, documentId, updateData, redirect) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, updateData);
      console.log("Document updated successfully");
      window.location.href = redirect;
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

function completeTask(uid) {
    updateDocumentById('jobs', uid, {jobStatus: 'completed', completedOn: new Date().toString().split(" ").splice(1, 4).join(" ")}, '/admin/manage_job');
}

async function updateUserPassword(newPassword) {
    const user = auth.currentUser;

    if (user) {
        try {
            await updatePassword(user, newPassword);
            window.location.href = "./admin/profile.ejs";
            console.log("User password updated successfully!");
        } catch (error) {
            console.error("Error updating user password: ", error);
            if (error.code === 'auth/requires-recent-login') {
                // Re-authenticate the user and then try again
                const email = user.email;
                const password = prompt("Please enter your current password for re-authentication:");
                const credential = EmailAuthProvider.credential(email, password);

                try {
                    await reauthenticateWithCredential(user, credential);
                    await updatePassword(user, newPassword);
                    console.log("User password updated successfully after re-authentication!");
                } catch (reauthError) {
                    console.error("Error re-authenticating user: ", reauthError);
                }
            }
        }
    } else {
        console.log("No user is signed in.");
    }
}

async function registerUser(name, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, {
            displayName: name
        });
        console.log('User registered and information saved to Firestore:', user);
        window.location.href = '/admin/dashboard';
    } catch (error) {
        console.error('Error registering user:', error.message);
        document.querySelector('.error-msg-auth').classList.remove('d-none');
    }
}
async function deleteDocumentById(collectionName, documentId) {
    try {
        const docRef = doc(db, collectionName, documentId);
        await deleteDoc(docRef);
        console.log("Document successfully deleted!");
        window.location.reload();
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is signed in:", user);
        userProps = user;
        if (window.location.href.includes("/admin/profile")) {
            document.querySelector('#profileName').value = userProps.displayName;
            document.querySelector('#profileEmail').value = userProps.email;
        }
        if (!(window.location.href.includes("/admin/login") && window.location.href.includes("/admin/register"))) {
            setTimeout(() => {
                document.querySelector('.username-navbar').innerText = userProps.displayName;
            }, 500);
        }
    } else {
        // No user is signed in
        console.log("No user is signed in.");
        userProps = null;
        if (!window.location.href.includes("/admin/login") && (!window.location.href.includes("/admin/register"))) {
            window.location.href = "/admin/login";
        }
    }
});
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

function signOutUser() {
    signOut(auth).then(() => {
        console.log("User signed out successfully.");
    }).catch((error) => {
        console.error("Error signing out:", error.message);
    });
}

function getUrlID() {
    return window.location.search.split("=")[1];
}
if (window.location.href.includes("/admin/login")) {
    document.querySelector("#login-submit").addEventListener('click', function() {
        const email = document.querySelector('#login-form #email').value;
        const password = document.querySelector('#login-form #password').value;
        signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
            window.location.href = "/admin/dashboard";
        }).catch((error) => {
            document.querySelector('.error-msg').classList.remove('d-none');
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
        });
    });
}
if (window.location.href.includes("/admin/register")) {
    document.querySelector("#register-submit").addEventListener('click', function() {
        const name = document.querySelector('#register-form #name').value;
        const email = document.querySelector('#register-form #email').value;
        const password = document.querySelector('#register-form #password').value;
        if (document.querySelector('#register-form #name').value == '' ||
            document.querySelector('#register-form #email').value == '' || 
            document.querySelector('#register-form #password').value == ''){

            document.querySelector('.error-msg').classList.remove('d-none');

        } else {
            document.querySelector('.error-msg').classList.add('d-none');
            registerUser(name, email, password);
        }
    });
};
document.querySelector("#logout").addEventListener('click', function() {
    signOutUser();
});
async function uploadFile(file) {
    const storageRef = ref(storage, 'uploads/' + file.name);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}
if (document.querySelector("#submit-job")) {
    const workers = await fetchAllUsers('workers');
    console.log(workers);
    workers.forEach(function(ele) {
        const li = `<option value="${ele.name}">${ele.name}</option>`;
        document.querySelector("select#worker").insertAdjacentHTML('beforeend', li);
    });
    document.querySelector("#submit-job").addEventListener('click', async function() {
        const file = document.querySelector('#Add-Job #fileupload').files[0];
        let fileUploadURL = '';
        if (file) {
            try {
                fileUploadURL = await uploadFile(file);
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
        let newTires = [];
        if (document.querySelector('.new-tire')) {
            document.querySelectorAll(".new-tire").forEach(function(ele) {
                const newTire = {
                    qty: ele.querySelector('#tire-qty').value,
                    name: ele.querySelector('#tire-name').value,
                    desc: ele.querySelector('#tire-desc').value,
                    price: ele.querySelector('#tire-price').value
                }
                newTires.push(newTire)
            });
        }
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const readableDate = `${hours}:${minutes}:${seconds}`;
        const jobData = {
            jobDate: document.querySelector('#Add-Job #jobDate').value,
            company: document.querySelector('#Add-Job #company').value,
            unit: document.querySelector('#Add-Job #unit').value,
            make: document.querySelector('#Add-Job #make').value,
            vinNum: document.querySelector('#Add-Job #vinNum').value,
            year: document.querySelector("#Add-Job #year").value,
            millage: document.querySelector('#Add-Job #millage').value,
            lic: document.querySelector('#Add-Job #lic').value,
            invoiceNum: document.querySelector('#Add-Job #invoiceNum').value,
            alignment: document.querySelector('#Add-Job #alignment').value,
            jobStatus: document.querySelector('#Add-Job #jobStatus').value,
            driverName: document.querySelector('#Add-Job #driverName').value,
            driverPhone: document.querySelector('#Add-Job #driverPhone').value,
            email: document.querySelector('#Add-Job #email').value,
            worker: document.querySelector('#Add-Job #worker').value,
            bay: document.querySelector('#Add-Job #bay').value,
            notes: document.querySelector('#Add-Job #note').value,
            tire: newTires,
            fileUpload: fileUploadURL,
            completedOn: '',
            jobCreatedTime: readableDate,
            jobCreatedBy: userProps.email
        }
        // console.log(jobData);
        addUserData('jobs', jobData, "/admin/manage_job");
    })
}
if (window.location.href.includes("/admin/update_job")) {
    const workers = await fetchAllUsers('workers');
    console.log(workers);
    workers.forEach(function(ele) {
        const li = `<option value="${ele.name}">${ele.name}</option>`;
        document.querySelector("select#worker").insertAdjacentHTML('beforeend', li);
    });
    const uid = getUrlID();
    getDocumentById('jobs', uid).then(data => {
        if (data) {
            console.log(data);
            document.querySelector('#Add-Job #jobDate').value = data.jobDate;
            document.querySelector('#Add-Job #company').value = data.company;
            document.querySelector('#Add-Job #unit').value = data.unit;
            document.querySelector('#Add-Job #make').value = data.make;
            document.querySelector('#Add-Job #vinNum').value = data.vinNum;
            document.querySelector('#Add-Job #year').value = data.year;
            document.querySelector('#Add-Job #millage').value = data.millage;
            document.querySelector('#Add-Job #lic').value = data.lic;
            document.querySelector('#Add-Job #invoiceNum').value = data.invoiceNum;
            document.querySelector('#Add-Job #alignment').value = data.alignment;
            document.querySelector('#Add-Job #jobStatus').value = data.jobStatus;
            document.querySelector('#Add-Job #driverName').value = data.driverName;
            document.querySelector('#Add-Job #driverPhone').value = data.driverPhone;
            document.querySelector('#Add-Job #email').value = data.email;
            document.querySelector('#Add-Job #worker').value = data.worker;
            document.querySelector('#Add-Job #bay').value = data.bay;
            document.querySelector('#Add-Job #note').value = data.notes;

            data.tire.forEach(function(ele) {
                let newTireInput = `
                <div class="row bg-light m-1 p-1 new-tire">
                    <div class="col-1">
                        <input type="number" name="tire-qty" id="tire-qty" class="form-control" value="${ele.qty}"/>
                    </div>
                    <div class="col-2">
                        <input type="text" name="tire-name" id="tire-name" class="form-control" value="${ele.name}"/>
                    </div>
                    <div class="col-6 d-flex align-items-center">
                        <input type="text" name="tire-desc" id="tire-desc" class="form-control" value="${ele.desc}"/>
                    </div>
                    <div class="col-2 d-flex align-items-center">
                        <input type="text" name="tire-price" id="tire-price" class="form-control" value="${ele.price}"/>
                    </div>
                    <div class="col-1">
                        <button type="button" onclick="removeNewTire(event)" id="delete-job-tire" class="btn btn-danger">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                `;
                document.querySelector("#add-job-tire").insertAdjacentHTML('beforeend', newTireInput)
            });

            document.querySelector('#update-job').addEventListener('click', function() {
                let newTires = [];
                if (document.querySelector('.new-tire')) {
                    document.querySelectorAll(".new-tire").forEach(function(ele) {
                        const newTire = {
                            qty: ele.querySelector('#tire-qty').value,
                            name: ele.querySelector('#tire-name').value,
                            desc: ele.querySelector('#tire-desc').value,
                            price: ele.querySelector('#tire-price').value
                        }
                        newTires.push(newTire)
                    });
                }
                const workerData = {
                    jobDate: document.querySelector('#Add-Job #jobDate').value,
                    company: document.querySelector('#Add-Job #company').value,
                    unit: document.querySelector('#Add-Job #unit').value,
                    make: document.querySelector('#Add-Job #make').value,
                    vinNum: document.querySelector('#Add-Job #vinNum').value,
                    year: document.querySelector("#Add-Job #year").value,
                    millage: document.querySelector('#Add-Job #millage').value,
                    lic: document.querySelector('#Add-Job #lic').value,
                    invoiceNum: document.querySelector('#Add-Job #invoiceNum').value,
                    alignment: document.querySelector('#Add-Job #alignment').value,
                    jobStatus: document.querySelector('#Add-Job #jobStatus').value,
                    driverName: document.querySelector('#Add-Job #driverName').value,
                    driverPhone: document.querySelector('#Add-Job #driverPhone').value,
                    email: document.querySelector('#Add-Job #email').value,
                    worker: document.querySelector('#Add-Job #worker').value,
                    bay: document.querySelector('#Add-Job #bay').value,
                    notes: document.querySelector('#Add-Job #note').value,
                    tire: newTires
                }
                updateDocumentById('jobs', uid, workerData, "/admin/manage_job"); 
            });
        } else {
            console.log("Document not found.");
        }
    }).catch(error => {
        console.error("Error retrieving document:", error);
    });
}
if (window.location.href.includes('/admin/manage_job')) {
    let data = await fetchAllUsers('jobs');
    const tableBody = document.querySelector('#jobTable tbody');
    data.forEach((job, idx) => {
        console.log(job, idx);
        const rowHtml = `
        <tr data-row-id="${job.id}" class="job-row ${job.jobStatus}">
            <td>
                <div class="openable-menu close">
                    <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModal${idx}">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <span>${idx + 1}</span>
                </div>
                <div class="modal fade" id="exampleModal${idx}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div>
                                <p><strong>Driver: </strong>${job.driverName}</p>
                                <p><strong>Worker: </strong>${job.worker}</p>
                                <p><strong>Notes: </strong>${job.notes}</p>
                                <p><strong>Status: </strong>${job.jobStatus}</p>
                                <p><strong>Added On: </strong>${job.jobDate} ${job.jobCreatedTime}</p>
                                <p><strong>Completed On: </strong>${job.completedOn}</p>
                                <p><strong>Added By: </strong>${job.jobCreatedBy}</p>
                                <p>
                                    <button class="btn btn-warning download-invoice text-white" class="Download Invoice"><i class="fa-solid fa-download"></i></button>
                                    <a href="/admin/update_job?job=${job.id}" class="btn btn-primary update-job text-white"><i class="fa-solid fa-pen-to-square"></i></a>
                                    <button class="btn btn-success complete-job text-white"><i class="fa-solid fa-check"></i></button>
                                    <button class="btn btn-danger delete-job text-white"><i class="fa-solid fa-trash"></i></button>
                                </p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                        </div>
                    </div>
                </div>
            </td>
            <td>${job.jobDate}</td>
            <td>${job.company}</td>
            <td>${job.bay}</td>
            <td>${job.unit}</td>
            <td>${job.make}</td>
            <td>${job.vinNum}</td>
            <td>${job.year}</td>
            <td>${job.millage}</td>
            <td>${job.lic}</td>
            <td>${job.alignment}</td>
        </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', rowHtml);
    });
    $('#jobTable').DataTable({
        order: [0, 'desc']
    });
    document.querySelectorAll(".complete-job").forEach(function(ele) {
        ele.addEventListener("click", function(eve) {
            const uid = eve.currentTarget.closest(".job-row").getAttribute('data-row-id');
            completeTask(uid);
        });
    });
    document.querySelectorAll(".delete-job").forEach(function(ele) {
        ele.addEventListener("click", function(eve) {
            const uid = eve.currentTarget.closest(".job-row").getAttribute('data-row-id');
            console.log(uid);
            deleteDocumentById("jobs", uid);
        });
    });
}
if (document.querySelector("#worker-submit")) {
    document.querySelector("#worker-submit").addEventListener('click', function() {
        if (document.querySelector('#workerName').value == '') {
            document.querySelector('.error-msg').classList.remove('d-none');
        } else {
            const workerData = {
                name: document.querySelector('#workerName').value,
                email: document.querySelector('#workerEmail').value,
                phone: document.querySelector('#workerPhone').value,
                address: document.querySelector('#workerAddress').value
            }
            addUserData('workers', workerData, "/admin/manage_worker");
        }
    })
}
if (window.location.href.includes("/admin/manage_worker")) {
    let data = await fetchAllUsers('workers');
    const tableBody = document.querySelector('#workerTable tbody');
    data.forEach((job, idx) => {
        console.log(job, idx);
        const rowHtml = `
        <tr data-row-id="${job.id}" class="job-row">
            <td>${idx + 1}</td>
            <td>${job.name}</td>
            <td>${job.email}</td>
            <td>${job.phone}</td>
            <td>${job.address}</td>
            <td>
                <a href="/admin/update_worker?job=${job.id}" class="btn btn-primary text-white update-worker"><i class="fa-solid fa-pen-to-square"></i></a>
                <button class="btn btn-danger text-white delete-worker"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', rowHtml);
    });
    $('#workerTable').DataTable();
    document.querySelectorAll(".delete-worker").forEach(function(ele) {
        ele.addEventListener("click", function(eve) {
            const uid = eve.currentTarget.closest(".job-row").getAttribute('data-row-id');
            console.log(uid);
            deleteDocumentById("workers", uid);
        });
    });
}
if (window.location.href.includes("/admin/update_worker")) {
    const uid = getUrlID();
    getDocumentById('workers', uid).then(data => {
        if (data) {
            console.log(data);
            document.querySelector('#workerName').value = data.name;
            document.querySelector('#workerEmail').value = data.email;
            document.querySelector('#workerPhone').value = data.phone;
            document.querySelector('#workerAddress').value = data.address;
            document.querySelector('#worker-update').addEventListener('click', function() {
                const workerData = {
                    name: document.querySelector('#workerName').value,
                    email: document.querySelector('#workerEmail').value,
                    phone: document.querySelector('#workerPhone').value,
                    address: document.querySelector('#workerAddress').value
                }
                updateDocumentById('workers', uid, workerData, "/admin/manage_worker"); 
            });
        } else {
            console.log("Document not found.");
        }
    }).catch(error => {
        console.error("Error retrieving document:", error);
    });
}
if (document.querySelector("#services-submit")) {
    document.querySelector("#services-submit").addEventListener('click', function() {
        if (document.querySelector('#serviceName').value == '') {
            document.querySelector('.error-msg').classList.remove('d-none');
        } else {
            const serviceData = {
                serviceName: document.querySelector('#serviceName').value
            }
            addUserData('services', serviceData, "/admin/manage_services");
        }
    })
}
if (window.location.href.includes("/admin/manage_services")) {
    let data = await fetchAllUsers('services');
    const tableBody = document.querySelector('#servicesTable tbody');
    data.forEach((job, idx) => {
        console.log(job, idx);
        const rowHtml = `
        <tr data-row-id="${job.id}" class="job-row">
            <td>${idx + 1}</td>
            <td>${job.serviceName}</td>
            <td>
                <a href="/admin/update_services?job=${job.id}" class="btn btn-primary text-white update-service"><i class="fa-solid fa-pen-to-square"></i></a>
                <button class="btn btn-danger text-white delete-service"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', rowHtml);
    });
    $('#servicesTable').DataTable();
    document.querySelectorAll(".delete-service").forEach(function(ele) {
        ele.addEventListener("click", function(eve) {
            const uid = eve.currentTarget.closest(".job-row").getAttribute('data-row-id');
            console.log(uid);
            deleteDocumentById("services", uid);
        });
    });
}
if (window.location.href.includes("/admin/update_services")) {
    const uid = getUrlID();
    getDocumentById('services', uid).then(data => {
        if (data) {
            console.log(data);
            document.querySelector('#serviceName').value = data.serviceName;
            document.querySelector('#services-update').addEventListener('click', function() {
                const serviceData = {
                    serviceName: document.querySelector('#serviceName').value
                }
                updateDocumentById('services', uid, serviceData, "/admin/manage_services"); 
            });
        } else {
            console.log("Document not found.");
        }
    }).catch(error => {
        console.error("Error retrieving document:", error);
    });
}
if (document.querySelector("#tires-submit")) {
    document.querySelector("#tires-submit").addEventListener('click', function() {
        if (document.querySelector('#tireName').value == '') {
            document.querySelector('.error-msg').classList.remove('d-none');
        } else {
            const tireData = {
                tireName: document.querySelector('#tireName').value
            }
            addUserData('tires', tireData, "/admin/manage_tires");
        }
    })
}
if (window.location.href.includes("/admin/manage_tires")) {
    let data = await fetchAllUsers('tires');
    const tableBody = document.querySelector('#tiresTable tbody');
    data.forEach((job, idx) => {
        console.log(job, idx);
        const rowHtml = `
        <tr data-row-id="${job.id}" class="job-row">
            <td>${idx + 1}</td>
            <td>${job.tireName}</td>
            <td>
                <a href="/admin/update_tires?job=${job.id}" class="btn btn-primary text-white update-tire"><i class="fa-solid fa-pen-to-square"></i></a>
                <button class="btn btn-danger text-white delete-tire"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', rowHtml);
    });
    $('#tiresTable').DataTable();
    document.querySelectorAll(".delete-tire").forEach(function(ele) {
        ele.addEventListener("click", function(eve) {
            const uid = eve.currentTarget.closest(".job-row").getAttribute('data-row-id');
            console.log(uid);
            deleteDocumentById("tires", uid);
        });
    });
}
if (window.location.href.includes("/admin/update_tires")) {
    const uid = getUrlID();
    getDocumentById('tires', uid).then(data => {
        if (data) {
            console.log(data);
            document.querySelector('#tireName').value = data.tireName;
            document.querySelector('#tires-update').addEventListener('click', function() {
                const tireData = {
                    tireName: document.querySelector('#tireName').value
                }
                updateDocumentById('tires', uid, tireData, "/admin/manage_tires"); 
            });
        } else {
            console.log("Document not found.");
        }
    }).catch(error => {
        console.error("Error retrieving document:", error);
    });
}
if (document.querySelector("#tireSub-submit")) {
    const tires = await fetchAllUsers('tires');
    tires.forEach(function(ele) {
        const li = `<option value="${ele.tireName}">${ele.tireName}</option>`
        document.querySelector('select#tireName').insertAdjacentHTML('beforeend', li);
    });
    document.querySelector("#tireSub-submit").addEventListener('click', function() {
        if (document.querySelector('#tireName').value == 'none' || document.querySelector('#tireType').value == '') {
            document.querySelector('.error-msg').classList.remove('d-none');
        } else {
            const tireTypeData = {
                tireName: document.querySelector('#tireName').value,
                tireType: document.querySelector('#tireType').value
            }
            addUserData('tireType', tireTypeData, "/admin/manage_sub_tire");
        }
    })
}
if (window.location.href.includes("/admin/manage_sub")) {
    let data = await fetchAllUsers('tireType');
    const tableBody = document.querySelector('#tireTypeTable tbody');
    data.forEach((job, idx) => {
        console.log(job, idx);
        const rowHtml = `
        <tr data-row-id="${job.id}" class="job-row">
            <td>${idx + 1}</td>
            <td>${job.tireName}</td>
            <td>${job.tireType}</td>
            <td>
                <a href="/admin/update_sub_tire?job=${job.id}" class="btn btn-primary text-white update-tire-type"><i class="fa-solid fa-pen-to-square"></i></a>
                <button class="btn btn-danger text-white delete-tire-type"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', rowHtml);
    });
    $('#tireTypeTable').DataTable();
    document.querySelectorAll(".delete-tire-type").forEach(function(ele) {
        ele.addEventListener("click", function(eve) {
            const uid = eve.currentTarget.closest(".job-row").getAttribute('data-row-id');
            console.log(uid);
            deleteDocumentById("tireType", uid);
        });
    });
}
if (window.location.href.includes("/admin/update_sub_tire")) {
    const tires = await fetchAllUsers('tires');
    tires.forEach(function(ele) {
        const li = `<option value="${ele.tireName}">${ele.tireName}</option>`
        document.querySelector('select#tireName').insertAdjacentHTML('beforeend', li);
    });
    const uid = getUrlID();
    getDocumentById('tireType', uid).then(data => {
        if (data) {
            console.log(data);
            document.querySelector('#tireName').value = data.tireName;
            document.querySelector('#tireType').value = data.tireType;
            document.querySelector('#tireSub-update').addEventListener('click', function() {
                const tireTypeData = {
                    tireName: document.querySelector('#tireName').value,
                    tireType: document.querySelector('#tireType').value
                }
                updateDocumentById('tireType', uid, tireTypeData, "/admin/manage_sub_tire"); 
            });
        } else {
            console.log("Document not found.");
        }
    }).catch(error => {
        console.error("Error retrieving document:", error);
    });
}

if (window.location.href.includes("/admin/profile")) {

    document.querySelector("#profile-submit").addEventListener('click', function() {
        const newPass = document.querySelector("#password").value;
        const confPass = document.querySelector("#confirmPassword").value;
        if (newPass == "") {
            document.querySelector(".error-msg").classList.remove('d-none');
        } else {
            document.querySelector(".error-msg").classList.add('d-none');
        }
        if (newPass == confPass) {
            updateUserPassword(newPass);
        } else {
            document.querySelector(".error-msg-pass").classList.remove('d-none');
        }
    });
}

$(document).keypress(
    function(event){
      if (event.which == '13') {
        event.preventDefault();
      }
  });