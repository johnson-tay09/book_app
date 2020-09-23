'use strict';
require('dotenv').config();
require('ejs');
// bring in my dependencies
const express = require('express');
const app = express();
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const methodOverride = require('method-override');

const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

client.on('error', (err) => console.log(err));

// bring in my middleware
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// global variables

app.use(cors());

// routes
app.get('/', renderHomePage);
app.get('/books/:book_id', getOneBook);
app.post('/books', saveBook);
app.put('/update/:book_id', updateOneBook);
app.delete('/delete/:book_id', deleteOneBook);
app.get('/searchform', renderSearchForm);
app.post('/searches', collectFormInformation);
app.get('/error', (request, response) => {
	response.render('pages/error.ejs');
});

function deleteOneBook(request, response) {
	const id = request.params.book_id;
	let sql = 'DELETE FROM books WHERE id=$1;';
	let safeValues = [id];
	client.query(sql, safeValues);
	response.status(200).redirect('/');
}

function updateOneBook(request, response) {
	console.log('In update function', request.body);
	const id = request.params.book_id;
	const { author, title, isbn, img_url, description } = request.body;
	let sql =
		'UPDATE books SET author=$1, title=$2, isbn=$3, img_url=$4, description=$5 WHERE id=$6;';
	let safeValues = [author, title, isbn, img_url, description, id];
	client.query(sql, safeValues);
	response.status(200).redirect(`/books/${id}`);
}

function saveBook(request, response) {
	const { author, title, isbn, img_url, description } = request.body;
	// put it in the database
	const sql =
		'INSERT INTO books (author, title, isbn, img_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
	const safeValues = [author, title, isbn, img_url, description];
	// console.log(safeValues);
	client.query(sql, safeValues).then((results) => {
		const id = results.rows[0].id;
		// console.log('results from sql', id);
		// redirect to the individual task when done
		console.log(results);
		response.redirect(`/books/${id}`);
	});
}

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
function getOneBook(request, response) {
	const id = request.params.book_id;
	// console.log('in the get one book', id);

	// now that I have the id, I can use it to look up the task in the database using the id, pull it out and display it to the user

	const sql = 'SELECT * FROM books WHERE id=$1;';
	const safeValues = [id];
	client.query(sql, safeValues).then((results) => {
		// console.log(results);
		// results.rows will look like this: [{my task}]
		const myChosenBook = results.rows[0];
		response.render('pages/books/detail', { value: myChosenBook });
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
	this.isbn = book.industryIdentifiers
		? book.industryIdentifiers[0].identifier
		: 'No ISBN available.';
}

function notFoundHandler(req, res) {
	res.status(404).send('not found!');
}

app.use('*', notFoundHandler);

function startServer() {
	app.listen(PORT, () => {
		console.log('Server is listening on port', PORT);
	});
}
client
	.connect()
	.then(startServer)
	.catch((e) => console.log(e));
