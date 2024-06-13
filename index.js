const express = require("express");
const app = express();

app.use(express.static(__dirname + '/public'));



function createUser() {
    console.log("hello")
}

app.set("view-engine", "ejs");

app.get("/", function (req, res) {
    res.send("Hello World");
});

app.get("/admin/login", function (req, res) {
    res.render("login.ejs");
});

app.get("/admin/register", function (req, res) {
    res.render("register.ejs");
});

app.get("/admin/dashboard", function (req, res) {
    res.render("dashboard.ejs");
});

app.get("/admin/profile", function (req, res) {
    res.render("profile.ejs");
});

app.get("/admin/invoice", function (req, res) {
    res.render("invoice.ejs");
});


app.get("/admin/live_jobs", function (req, res) {
    res.render("liveJobs.ejs");
});

app.get("/admin/add_job", function(req, res) {
    res.render("addjob.ejs");
});

app.get("/admin/manage_job", function(req, res) {
    res.render("managejob.ejs");
});

app.get("/admin/update_job", function(req, res) {
    res.render("updatejob.ejs");
});

app.get("/admin/add_worker", function(req, res) {
    res.render("addworker.ejs");
});

app.get("/admin/manage_worker", function(req, res) {
    res.render("manageworkers.ejs");
});

app.get("/admin/update_worker", function(req, res) {
    res.render("updateworkers.ejs");
});

app.get("/admin/add_services", function(req, res) {
    res.render("addservices.ejs");
});

app.get("/admin/manage_services", function(req, res) {
    res.render("manageservices.ejs");
});

app.get("/admin/update_services", function(req, res) {
    res.render("updateservices.ejs");
});

app.get("/admin/add_tires", function(req, res) {
    res.render("addtires.ejs");
});

app.get("/admin/manage_tires", function(req, res) {
    res.render("managetires.ejs");
});

app.get("/admin/update_tires", function(req, res) {
    res.render("updatetires.ejs");
});


app.get("/admin/add_sub_tire", function(req, res) {
    res.render("addsubtires.ejs");
});

app.get("/admin/manage_sub_tire", function(req, res) {
    res.render("managesubtires.ejs");
});

app.get("/admin/update_sub_tire", function(req, res) {
    res.render("updatesubtires.ejs");
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
