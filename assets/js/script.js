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
var library = [];
var numBooks = 3;

if (window.innerWidth > 1024) {
    // u("#bookshelf").removeClass("mx-0");
    // u("#library").removeClass("py-1");
    // u("#library").removeClass("mx-0");
    numBooks = 9;
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
        result.publicationDate = "";
        if (data.items[i].volumeInfo.publishedDate) {
            result.publicationDate = data.items[i].volumeInfo.publishedDate.slice(0, 4);
        }
        result.title = data.items[i].volumeInfo.title;
        if (data.items[i].volumeInfo.subtitle) {
            result.subtitle = data.items[i].volumeInfo.subtitle;
        } else {
            result.subtitle = "";
        }
        result.isbn = 0;
        if (data.items[i].volumeInfo.industryIdentifiers) {
            result.isbn = data.items[i].volumeInfo.industryIdentifiers[0].identifier;
        }
        results.push(result);
    }

    // Call the populateSearchResults function
    populateSearchResults(results);
}

// Function to populate the library from local storage
function populateLibrary() {
    u("#bookshelf").empty();
    if (localStorage.getItem("library")) {
        library = JSON.parse(localStorage.getItem("library"));
    }

    for (var i = 0; i < Math.min(library.length,numBooks); i++) {
        // add li class
        // img -> background img for li; style tag
        // if thumbnail = unavil img src; then append <p> title

        u('#bookshelf').append("<li id='fBook" + i + "' class='data-package library-book image has-ratio' style='background-image: url(" + library[i].thumbnail + ")'></li>");


        // u('#bookshelf').append("<li id='fBook"+i+"' class='data-package '></li>");

        var newfavorite = document.getElementById("fBook" + i);

        // u(newfavorite).append("<img class= 'library-book' src= '"+ library[i].thumbnail+"'/>")
        console.log(library[i].thumbnail);
        if (library[i].thumbnail === "./assets/images/CoverUnavailable.jpg") {
            u(newfavorite).text(library[i].title);
            // console.log(library[i].title)
        }
        // if(i>1) {
        //     library[i].includes();
        // }

        newfavorite.setAttribute("data-thumbnail", library[i].thumbnail);
        newfavorite.setAttribute("data-title", library[i].title);
        newfavorite.setAttribute("data-subtitle", library[i].subtitle);
        newfavorite.setAttribute("data-authors", library[i].authors);
        newfavorite.setAttribute("data-publicationDate", library[i].publicationDate);
        newfavorite.setAttribute("data-pages", library[i].pages);
        newfavorite.setAttribute("data-categories", library[i].categories);
        newfavorite.setAttribute("data-id", library[i].id);
        newfavorite.setAttribute("data-description", library[i].description);
        newfavorite.setAttribute("data-previewLink", library[i].previewLink);
        newfavorite.setAttribute("data-isbn", library[i].isbn);
        console.log(newfavorite);

    }

    u("#bookshelf").off('click', showDetails);
    u("#bookshelf").on('click', showDetails);

}




// Populate search results function
function populateSearchResults(results) {
    u("#index-page").remove();
    u("#details-left").children().remove();
    u("#details-right").children().remove();
    u("#details").addClass("is-hidden");
    u("#results-page").attr("style", "display:block");
    u("#search-results").removeClass("is-hidden");

    populateLibrary();
    // console.log(library = JSON.parse(localStorage.getItem("library")));

    document.getElementById("results-heading").textContent = 'Search results for "' + query + '"';

    // Use the search results to dynamically generate html
    u("#result-list").empty();
    for (var i = 0; i < results.length; i++) {
        // Append the dynamically generated html to the search results container
        u("#result-list").append("<div id='result" + i + "' class='box is-shadowless has-background-grey-lighter result mb-5 px-2 py-1 w-100 columns data-package is-clickable'><div><img src='" + results[i].thumbnail + "'/></div><div class='column'><h3 class='is-size-4 has-text-primary-dark'>" + results[i].title + "</h3><h4 class='is-size-5 has-text-primary'>" + results[i].subtitle + "</h4><p class='is-size-6'>Author(s): " + results[i].authors + "</p><div class='columns'><p class='column is-size-6 pb-0'>Publication Date: " + results[i].publicationDate + "</p><p class='column is-size-6'>" + results[i].pages + " pages</p></div><p class='is-size-6'>Subject(s): " + results[i].categories + "</p></div></div");
        var newResult = document.getElementById("result" + i);
        newResult.setAttribute("data-thumbnail", results[i].thumbnail);
        newResult.setAttribute("data-title", results[i].title);
        newResult.setAttribute("data-subtitle", results[i].subtitle);
        newResult.setAttribute("data-authors", results[i].authors);
        newResult.setAttribute("data-publicationDate", results[i].publicationDate);
        newResult.setAttribute("data-pages", results[i].pages);
        newResult.setAttribute("data-categories", results[i].categories);
        newResult.setAttribute("data-id", results[i].id);
        newResult.setAttribute("data-description", results[i].description);
        newResult.setAttribute("data-previewLink", results[i].previewLink);
        newResult.setAttribute("data-isbn", results[i].isbn);
    }
    query = "";
    u("#result-list").on("click", showDetails);
}


// Function to show the details of the clicked search result or library book
function showDetails(event) {
    // clear the search results from the screen

    u("#result-list").off("click");
    u("#search-results").addClass("is-hidden");
    u("#details").removeClass("is-hidden");
    u("#details-left").empty();
    u("#details-right").empty();

    // replace the search results with details of the selected book
    var dataPackage = event.target;
    while (!dataPackage.matches(".data-package")) {
        dataPackage = dataPackage.parentElement;
    }
    // console.log(dataPackage);
    // Title
    u("#details-left").append("<h3 id='details-title' class='is-size-4 has-text-primary-dark'>" + dataPackage.getAttribute("data-title") + "</h3>");
    var detailsTitle = document.getElementById("details-title");
    console.log(dataPackage.getAttribute("data-subtitle"));
    if (dataPackage.getAttribute("data-subtitle") && dataPackage.getAttribute("data-subtitle") != "undefined") {
        detailsTitle.textContent += ": " + dataPackage.getAttribute("data-subtitle");
    }

    // Details
    u("#details-left").append("<p class='is-size-6'>Author(s): " + dataPackage.getAttribute("data-authors") + "</p><p class='is-size-6'>Publication Date: " + dataPackage.getAttribute("data-publicationDate") + "</p><p class='is-size-6'>" + dataPackage.getAttribute("data-pages") + " pages</p><p class='is-size-6'>Subject(s): " + dataPackage.getAttribute("data-categories") + "</p><p class='is-size-6 my-3 is-clipped'>" + dataPackage.getAttribute("data-description") + "</p>");

    // execute a function call to fetch data from the Bored API
    getAlternateActivity();

    // append a preview of the book from Google Books
    u("#details-right").append("<button class='button is-fullwidth is-primary' id='add-to-library'>Put this book in my library</button>");
    var data = dataPackage.dataset;
    for (var key in data) {
        u("#add-to-library").data(key, data[key]);
    }
    // Event listener for library add button
    u("#add-to-library").on("click", saveFavorites);
}

// Function to generate alternate activity
function getAlternateActivity() {
    // Execute a call to the Bored API
    fetch("https://www.boredapi.com/api/activity/")
        // Extract data from the response
        .then(function (response) {
            response.json()
                .then(function (data) {
                    var activity = {
                        activity: data.activity,
                        type: data.type,
                        participants: data.participants,
                        link: data.link
                    };

                    // Call a function to update the html
                    appendActivity(activity);
                })
        });
}

function appendActivity(activity) {
    u("#details-right").append("<div class='card mt-4'><header class='card-header'><p class='card-header-title'>Not interested? Try this instead!</p></header><div class='card-content'><div class='content'><p id='activity-name' class='has-text-primary'></p><p>Activity Type: " + activity.type + "</p><p>Number of People Required: " + activity.participants + "</p></div></div></div>");
    if (activity.link) {
        u("#activity-name").append("<a class='has-text-primary' href='" + activity.link + "' target='_blank'>" + activity.activity + "</a");
    } else u("#activity-name").append(activity.activity);
}

// Function to save favorites
function saveFavorites(event) {
    // Populate the library array from local storage in reverse order
    if (localStorage.getItem("library")) {
        library = JSON.parse(localStorage.getItem("library"));
    }

    // Create an object for the current book and push it to the library array if it is not already present
    var currentBook = {};
    var data = document.getElementById("add-to-library").dataset;
    for (var key in data) {
        currentBook[key] = data[key];
    }

    var inLibrary = false;
    if (library) {
        for (var i = 0; i < library.length; i++) {
            if (currentBook.id === library[i].id) {
                // if (currentBook.isbn === library[i].isbn || currentBook.id === library[i].id) {
                inLibrary = true;
            }
        }
    }
    if (!inLibrary) {
        // library.push(currentBook);
        // test
        library.unshift(currentBook);
    }
    // console.log(library.reverse());
    if (library.length > 8) {
        library.pop();
    }
    // Reverse the order of the array and save it to local storage
    localStorage.setItem("library", JSON.stringify(library));
    // console.log(localStorage.getItem("library"))
    // Empty the library array
    library = [];

    // call the populateLibrary function
    populateLibrary();

}

// Close button event listener
u(".close-search").on("click", closeSearch);

// Search submit event listener
u(".book-search").on("submit", findBooks);

u(searchButton).on("click", openSearch);


