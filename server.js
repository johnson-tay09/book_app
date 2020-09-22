'use strict';

// bring in my dependencies
const express = require('express');
const app = express();
require('ejs');
const superagent = require('superagent');
const cors = require('cors');
require('dotenv').config();

// bring in my middleware
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// global variables
const PORT = process.env.PORT || 3000;
app.use(cors());

// routes
app.get('/', renderHomePage);
// app.get('/hello', testPage);
app.get('/searchform', renderSearchForm);
app.post('/searches', collectFormInformation);
app.get('/error', (request, response) => {
	response.render('pages/error.ejs');
});

// function testPage(request, response) {
// 	response.render('pages/index');
// }
function renderHomePage(request, response) {
	// get the books from the DB and display them  on the homepage
	// or - if there are no books, directions on how the site works
	response.render('pages/index');
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
		? book.imageLinks.thumbnail
		: 'https://i.imgur.com/J5LVHEL.jpg';
	this.title = book.title;
	this.author = book.authors;
	this.description = book.description
		? book.description
		: 'No description available.';
}

app.listen(PORT, () => {
	console.log(`listening on ${PORT}`);
});
