'use strict';
require('dotenv').config();
require('ejs');
// bring in my dependencies
const express = require('express');
const app = express();
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

client.on('error', (err) => console.log(err));

// bring in my middleware
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// global variables

app.use(cors());

// routes
app.get('/', renderHomePage);
// app.get('/hello', testPage);
app.get('/searchform', renderSearchForm);
app.post('/searches', collectFormInformation);
app.get('/error', (request, response) => {
	response.render('pages/error.ejs');
});

function renderHomePage(request, response) {
	// go into the database
	const sql = 'SELECT * FROM books;';
	client.query(sql).then((results) => {
		// get all of my tasks
		const allBooks = results.rows;
		// render them to the page
		response.status(200).render('pages/index.ejs', { value: allBooks });
	});
}

function renderSearchForm(request, response) {
	// render the search form
	response.render('pages/searches/new.ejs');
}

function collectFormInformation(request, response) {
	// collect form information
	// console.log(request.body);
	// { search: [ 'Elizabeth Moon', 'author' ] }
	// { search: [ 'The magic of thinking big', 'title' ] }
	const searchQuery = request.body.search[0];
	const searchType = request.body.search[1];

	let url = 'https://www.googleapis.com/books/v1/volumes?q=';
	if (searchType === 'title') {
		url += `+intitle:${searchQuery}`;
	}
	if (searchType === 'author') {
		url += `+inauthor:${searchQuery}`;
	}

	superagent.get(url).then((data) => {
		//array of arrays
		const bookArray = data.body.items;
		// console.log(bookArray);
		//a book is an object with key value pairs
		const finalBookArray = bookArray.map((book) => new Book(book.volumeInfo));

		response.render('pages/searches/show', { bookResults: finalBookArray });
	});
}

function Book(book) {
	this.image = book.imageLinks
		? book.imageLinks.thumbnail.replace(/^http:\/\//i, 'https://')
		: 'https://i.imgur.com/J5LVHEL.jpg';
	this.title = book.title;
	this.author = book.authors;
	this.description = book.description
		? book.description
		: 'No description available.';
}

function notFoundHandler(req, res) {
	res.status(404).send('not found!');
}

app.use('*', notFoundHandler);

// client
// 	.connect()
// 	.then(() => {
// 		app.listen(PORT, () => {
// 			console.log(`listening on ${PORT}`);
// 		});
// 	})
// 	.catch((err) => {
// 		console.log(err);
// 	});
function startServer() {
	app.listen(PORT, () => {
		console.log('Server is listening on port', PORT);
	});
}
client
	.connect()
	.then(startServer)
	.catch((e) => console.log(e));
