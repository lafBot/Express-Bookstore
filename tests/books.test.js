process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let isbn;

beforeEach(async function() {
    // create testable books in database
    let book = await db.query(`
        INSERT INTO books
        (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES(
            '0691161518',
            'http://a.co/eobPtX2',
            'Matthew Lane',
            'english',
            264,
            'Princeton University Press',
            'Power-up: Unlocking the Hidden Mathematics in Video Games',
            2017)
        RETURNING isbn`);
    isbn = book.rows[0].isbn
})

describe("GET /books", () => {

	test("request list of books", async function() {
		const resp = await request(app).get('/books')
		
        expect(resp.statusCode).toBe(200);
		expect(resp.body.books).toEqual([
            {
              "isbn": "0691161518",
              "amazon_url": "http://a.co/eobPtX2",
              "author": "Matthew Lane",
              "language": "english",
              "pages": 264,
              "publisher": "Princeton University Press",
              "title": "Power-up: Unlocking the Hidden Mathematics in Video Games",
              "year": 2017
            }
          ]);
    })
})

describe("GET /books/:id", () => {
	test("request specific book by isbn", async function() {
		const resp = await request(app).get(`/books/${isbn}`)
		
        expect(resp.statusCode).toBe(200);
		expect(resp.body.book).toEqual({
              "isbn": "0691161518",
              "amazon_url": "http://a.co/eobPtX2",
              "author": "Matthew Lane",
              "language": "english",
              "pages": 264,
              "publisher": "Princeton University Press",
              "title": "Power-up: Unlocking the Hidden Mathematics in Video Games",
              "year": 2017
        });
    })

	test("request invalid book by isbn", async function() {
		const resp = await request(app).get(`/books/88888888`)
		
        expect(resp.statusCode).toBe(404);
    })
})

describe("PUT /books/:isbn", () => {

	test("Update book", async function() {
		const resp = await request(app).put(`/books/${isbn}`).send({
            isbn: '12345678',
            amazon_url: 'https://google.com/new-book',
            author: 'new-author',
            language: 'french',
            pages: 300,
            publisher: 'new publishing inc',
            title: 'A NEW day in the life',
            year: 2020
        });
		
        expect(resp.statusCode).toBe(200);
        expect(resp.body.book).toHaveProperty("isbn");
		expect(resp.body.book).toEqual({
            isbn: `${isbn}`,
            amazon_url: 'https://google.com/new-book',
            author: 'new-author',
            language: 'french',
            pages: 300,
            publisher: 'new publishing inc',
            title: 'A NEW day in the life',
            year: 2020
        });
    })

	test("Invalid isbn reference for book put request", async function() {
		const resp = await request(app).put(`/books/99999999`).send({
            isbn: '12345678',
            amazon_url: 'https://google.com/new-book',
            author: 'new-author',
            language: 'french',
            pages: 300,
            publisher: 'new publishing inc',
            title: 'A NEW day in the life',
            year: 2020
        });
		
        expect(resp.statusCode).toBe(404);
    })

	test("Invalid value (author) for updating book", async function() {
		const resp = await request(app).put(`/books/${isbn}`).send({
            isbn: '12345678',
            amazon_url: 'https://google.com/new-book',
            author: 5555,
            language: 'french',
            pages: 300,
            publisher: 'new publishing inc',
            title: 'A NEW day in the life',
            year: 2020
        });
		
        expect(resp.statusCode).toBe(400);
    })
})

describe("POST /books", () => {

	test("Create book", async function() {
		const resp = await request(app).post('/books').send({
            isbn: '12345678',
            amazon_url: 'https://google.com',
            author: 'author',
            language: 'english',
            pages: 251,
            publisher: 'publishing inc',
            title: 'A day in the life',
            year: 1993
        });
		
        expect(resp.statusCode).toBe(201);
        expect(resp.body.book).toHaveProperty("isbn");
		expect(resp.body.book).toEqual({
                "amazon_url": "https://google.com",
                "author": "author",
                "isbn": "12345678",
                "language": "english",
                "pages": 251,
                "publisher": "publishing inc",
                "title": "A day in the life",
                "year": 1993
            });
    })
    
    test("Create invalid schema: incorrect amazon_url", async function() {
        const resp = await request(app).post('/books').send({
            isbn: '12345678',
            amazon_url: 4,
            author: 'author',
            language: 'english',
            pages: 251,
            publisher: 'publishing inc',
            title: 'A day in the life',
            year: 1993
        });
		
        expect(resp.statusCode).toBe(400);
    })
})

describe("DELETE /books/:id", () => {
	test("DELETE book", async function() {
		const resp = await request(app).delete(`/books/${isbn}`)
		
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ message: "Book deleted" })
    })

    test("invalid isbn for delete request", async function() {
		const resp = await request(app).delete(`/books/99999`)
		
        expect(resp.statusCode).toBe(404);
    })
})

afterEach(async function() {
    // remove all books
    await db.query('DELETE FROM books')
})


afterAll(async function() {
    // end database connection
    await db.end()
})