const express = require("express");
const app = express.Router();
const fs = require("fs");
const path = require("path");

app.get("/", (req, res) => res.sendFile(path.resolve(__dirname, "../views/index.html")))
app.get("/productDetail/", (req, res) => res.sendFile(path.resolve(__dirname, "../views/productDetail.html")))
app.get("/productCart/", (req, res) => res.sendFile(path.resolve(__dirname, "../views/productCart.html")))
app.get("/register/", (req, res) => res.sendFile(path.resolve(__dirname, "../views/register.html")))
app.get("/login/", (req, res) => res.sendFile(path.resolve(__dirname, "../views/login.html")))

module.exports = app;