var searchModal = u("#search-modal");
// modal
const searchButton = document.querySelector('#search-btn');
const modalBg = document.querySelector('.modal-background');
const closeButton = document.querySelector('#close-btn');
var titleInput = document.querySelector(".title-input");
var authorInput = document.querySelector(".author-input");
var subjectInput = document.querySelector(".subject-input");
var googleURL = "";
var query = "";

function openLibrary() {
    console.log("loaded");
    fetch("https://openlibrary.org/api/books?bibkeys=isbn:9780425057735&jscmd=details&format=json")
        .then(function (response) {
            console.log(response);
            response.json()
                .then(function (data) {
                    console.log(data);
                });
        });
}

function openSearch() {
    if (document.getElementById("search-modal")) {
        document.getElementById("search-modal").classList.add('is-active');
    }
}

// Close the search modal when the user clicks the close button
function closeSearch() {
    searchModal.removeClass("is-active");
}

// function to validate input
function validateSearch(title, author, subject) {
    if (!title && !author && !subject) {
        u(".validation").append("<div class='modal is-active' id='invalid-search'><div class='modal-background close-warning'></div><div class='modal-card'><header class='modal-card-head has-background-primary'><p class='modal-card-title has-text-white'>Invalid Search</p><button class='delete close-warning' aria-label='close'></button></header><section class='modal-card-body'><p>Please enter at least one search term.</p></section><footer class='modal-card-foot'><button class='button is-primary close-warning'>OK</button></footer></div></div>");

        searchModal.removeClass("is-active");
        u(".close-warning").on("click", closeValidation);
        return false;
    } else {
        return true;
    }
}

function closeValidation(event) {
    event.preventDefault();
    u("#invalid-search").removeClass("is-active");
    if (document.location.pathname.includes("/index.html")) {
        openSearch();
    }
}

// function to build Google API URL
function buildGoogleURL(title = "", author = "", subject = "") {
    var titleQuery = "";
    var authorQuery = "";
    var subjectQuery = "";
    var tempString = "";

    if (title) {
        titleQuery = "intitle:" + title;
    }
    if (author) {
        authorQuery = "inauthor:" + author;
    }
    if (subject) {
        subjectQuery = "subject:" + subject;
    }

    tempString = "https://www.googleapis.com/books/v1/volumes?q=" + titleQuery;
    if (titleQuery && authorQuery) {
        tempString += "+" + authorQuery;
    } else if (authorQuery) {
        tempString += authorQuery;
    }
    if ((titleQuery || authorQuery) && subjectQuery) {
        tempString += "+" + subjectQuery;
    } else {
        tempString += subjectQuery;
    }

    tempString += "&key=AIzaSyAhDgj4gWvslxpeieHpnM8XOjFd5NET7RA"
    for (var i = 0; i < tempString.length; i++) {
        if (tempString[i] === " ") {
            googleURL += "+";
        } else {
            googleURL += tempString[i];
        }
    }
}

// Search event handler
function findBooks(event) {
    event.preventDefault();

    var titleInput = document.querySelector(".title-input");
    var authorInput = document.querySelector(".author-input");
    var subjectInput = document.querySelector(".subject-input");

    var title = titleInput.value.trim();
    var author = authorInput.value.trim();
    var subject = subjectInput.value.trim();

    if (title) {
        query = title;
        if (author) {
            query += "+" + author;
        }
        if (subject) {
            query += "+" + subject;
        }
    } else if (author) {
        query = author;
        if (subject) {
            query += "+" + subject;
        }
    } else {
        query = subject;
    }

    titleInput.value = "";
    authorInput.value = "";
    subjectInput.value = "";

    // Validate input
    if (validateSearch(title, author, subject)) {

        // Construct Google Books URL
        buildGoogleURL(title, author, subject);

        // Call Google Books API
        callGoogleBooksAPI(googleURL);
    }
}

// function to call Google Books API
function callGoogleBooksAPI(url) {
    fetch(url)
        .then(function (response) {
            response.json()
                .then(function (data) {
                    googleURL = "";
                    extractSearchResults(data);
                })
        });
}

// Google Books API callback function
function extractSearchResults(data) {
    console.log(data);
    // Extract results from the API response
    var results = [];

    for (var i = 0; i < data.items.length; i++) {
        var result = {};
        result.id = data.items[i].id;
        result.authors = "";
        if (data.items[i].volumeInfo.authors) {
            if (data.items[i].volumeInfo.authors.length > 1) {
                for (var j = 0; j < data.items[i].volumeInfo.authors.length - 1; j++) {
                    result.authors += data.items[i].volumeInfo.authors[j];
                    result.authors += ", ";
                }
                result.authors += data.items[i].volumeInfo.authors[data.items[i].volumeInfo.authors.length - 1];
            } else {
                result.authors = data.items[i].volumeInfo.authors[0];
            }
        }
        result.categories = "";
        if (data.items[i].volumeInfo.categories) {
            if (data.items[i].volumeInfo.categories.length > 1) {
                for (var j = 0; j < data.items[i].volumeInfo.categories.length - 1; j++) {
                    result.categories += data.items[i].volumeInfo.categories[j];
                    result.categories += ", ";
                }
                result.categories += data.items[i].volumeInfo.categories[data.items[i].volumeInfo.categories.length - 1];
            } else {
                result.categories = data.items[i].volumeInfo.categories[0];
            }
        }
        result.description = data.items[i].volumeInfo.description;
        if (data.items[i].volumeInfo.imageLinks) {
            result.thumbnail = "https" + data.items[i].volumeInfo.imageLinks.thumbnail.slice(4);
        } else {
            result.thumbnail = "./assets/images/CoverUnavailable.jpg"
        }
        result.pages = data.items[i].volumeInfo.pageCount;
        result.previewLink = "https" + data.items[i].volumeInfo.previewLink.slice(4);
        result.publicationDate = data.items[i].volumeInfo.publishedDate.slice(0, 4);
        result.title = data.items[i].volumeInfo.title;
        if (data.items[i].volumeInfo.subtitle) {
            result.subtitle = data.items[i].volumeInfo.subtitle;
        } else {
            result.subtitle = "";
        }
        result.isbn = data.items[i].volumeInfo.industryIdentifiers[0].identifier;
        results.push(result);
    }

    // Call the populateSearchResults function
    populateSearchResults(results);
}

// Populate search results function
function populateSearchResults(results) {
    u("#index-page").remove();
    u("#results-page").attr("style", "display:block");

    // populateLibrary();

    document.getElementById("results-heading").textContent = 'Search results for "' + query + '"';

    // Use the search results to dynamically generate html
    u("#result-list").empty();
    for (var i = 0; i < results.length; i++) {
        // Append the dynamically generated html to the search results container
        var newResult = u("#result-list").append("<div id='result" + i + "' class='box is-shadowless has-background-grey-lighter result mb-5 px-2 py-1 w-100 columns is-clickable'><div><img src='" + results[i].thumbnail + "'/></div><div class='column'><h3 class='is-size-4 has-text-primary-dark'>" + results[i].title + "</h3><h4 class='is-size-5 has-text-primary'>" + results[i].subtitle + "</h4><p class='is-size-6'>Author(s): " + results[i].authors + "</p><div class='columns'><p class='column is-size-6 pb-0'>Publication Date: " + results[i].publicationDate + "</p><p class='column is-size-6'>" + results[i].pages + " pages</p></div><p class='is-size-6'>Subject(s): " + results[i].categories + "</p></div></div");
        u(newResult).data({ thumbnail: results[i].thumbnail, title: results[i].title, subtitle: results[i].subtitle, authors: results[i].authors, publicationDate: results[i].publicationDate, pages: results[i].pages, categories: results[i].categories, id: results[i].id, description: results[i].description, previewLink: results[i].previewLink, isbn: results[i].isbn });
    }
    query = "";
    u("#result-list").on("click", showDetails);
}

// Close button event listener
u(".close-search").on("click", closeSearch);

// Search submit event listener
u(".book-search").on("submit", findBooks);

u(searchButton).on("click", openSearch);

document.querySelector("body").addEventListener("load", (openLibrary()));