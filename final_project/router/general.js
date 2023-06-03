const express = require('express');
const axios = require('axios').default;

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

async function getAllBooks()
{    
    let allBooks = (await axios.get('/')).data;
    return allBooks;
}

async function getBookByISBN(isbn){
    let resp = await axios.get('/isbn/' + String(isbn));
    if(resp.status == 200)
        return resp.data;
    else 
        return undefined;
}

async function getBooksByAuthor(author) 
{
    let authorBooks = (await axios.get("/author/" + String(author))).data;
    return authorBooks;
}

async function getBookByTitle(title){
    let resp = await axios.get("/title/" + String(title));
    if(resp.status == 200)
        return resp.data;
    else 
        return undefined;
}


public_users.post("/register", (req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    if(!username || !password){
        res.status(400).json({message: "Please provide username and password."});
        return;
    }

    if(String(username).length == 0 && String(password).length == 0)
    {
        res.status(400).json({message: "Username and password must contain at least one character."});
        return;
    }
        
    if(users.find((val, index, arr) => val.username === username))
    {
        res.status(400).json({message: "This username already exists."});
        return;
    }
    users.push({"username": username, "password": password});
    res.status(201).json({message: "User created!"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here    
    let promise = new Promise((resolve,reject) =>
    {
        resolve(JSON.stringify(books, null , 4));
    }).then((json) => res.send(json));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    let promise = new Promise((resolve, reject) => {
        let book = books[req.params.isbn]    
        if(book)
        {
            resolve(JSON.stringify(book, null, 4));
            return;
        }           
        reject("Book not found.");
    })
    .then((json) => res.send(json))
    .catch((reason) => res.status(404).json({message: reason}));
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let promise = new Promise((resolve, reject) => {
        let allkeys = Object.keys(books);
        let authBooks = [];
        allkeys.forEach((val,index,arr) => {
            if (books[val].author == req.params.author) { authBooks.push(books[val]); }
        });   
        resolve(JSON.stringify(authBooks, null, 4));
    })
    .then((json) => res.send(json));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let promise = new Promise((resolve,reject) => {
        let allkeys = Object.keys(books);
        let titleBook = undefined;
        allkeys.forEach((val,index,arr) => {
            if (books[val].title === req.params.title) { titleBook = books[val]; }
        });    
        if(titleBook){
            resolve(JSON.stringify(titleBook, null, 4));
        }
        reject("Book not found.");
    })
    .then((json) => res.send(json))
    .catch((reason) => res.status(404).json({message : reason}));    
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let book = books[req.params.isbn]    
    if(book)
    {
        res.send(JSON.stringify(book.reviews, null, 4));
        return;
    }
    res.status(404).json({message: "Book not found."})
});

module.exports.general = public_users;
