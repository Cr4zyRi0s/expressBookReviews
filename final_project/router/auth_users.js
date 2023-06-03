const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {username: "test123", password: "p4ssw0rd"},
    {username: "test1234", password: "p4ssw0rd"}
];

const isValid = (username)=>{ //returns boolean
    if(!username) return false;
    if(String(username).length == 0) return false;
    return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let logUser = users.find((value,index,arr) =>{ 
        return value.username === username && value.password === password;
    });
    if(logUser){
        return true;
    }
    return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    let username = req.body.username;
    let password = req.body.password;    

    if(!isValid(username) || !isValid(password)){
        res.status(400).json({message:"Provide username and password."});
        return;
    }

    if(!authenticatedUser(username, password)){
        res.status(400).json({message:"Wrong credentials."});
        return;
    }

    let token = jwt.sign({username: username, password: password}, "access", {expiresIn: 60*60});

    req.session.authorization = {
        token,username
    }
    res.status(200).send("Successfull Login!");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let review = req.body.review;
    if(!review){res.status(400).json({message:"Please sumbit a valid review"})}
    let username = req.session.authorization["username"]
    let book = books[req.params.isbn];
    if(!book){res.status(404).send("Book not found.")}
    book.reviews[username] = username + " says: " + review;
    res.status(200).json({message: "Review Submitted!"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let username = req.session.authorization["username"];
    let book = books[req.params.isbn];
    if(!book){
        res.status(404).send("Book not found.");
    }
    book.reviews = Object.fromEntries(Object
        .entries(book.reviews)
        .filter(([key]) => key != username)
    );
    res.status(200).send("Review Deleted!");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
