var searchModal = u("#search-modal");
// modal
const searchButton = document.querySelector('#search-btn');
const modalBg = document.querySelector('.modal-background');
const closeButton = document.querySelector('#close-btn');
var titleInput = document.querySelector(".title-input");
var authorInput = document.querySelector(".author-input");
var subjectInput = document.querySelector(".subject-input");
var googleURL;



// Close the search modal when the user clicks the close button
function closeSearch() {
    searchModal.removeClass("is-active");
}

// function to validate input
function validateSearch(title, author, subject) {
    if (!title && !author && !subject) {
        u(".validation").append("<div class='modal is-active' id='invalid-search'><div class='modal-background close-warning'></div><div class='modal-card'><header class='modal-card-head has-background-primary'><p class='modal-card-title has-text-white'>Invalid Search</p><button class='delete close-warning' aria-label='close'></button></header><section class='modal-card-body'><p>Please enter at least one search term.</p></section><footer class='modal-card-foot'><button class='button is-primary close-warning'>OK</button></footer></div></div>");

        u(".close-warning").on("click", closeValidation);
        return false;
    } else {
        return true;
    }
}

function closeValidation() {
    u("#invalid-search").removeClass("is-active");
}

// function to build Google API URL

// Search event handler
function findBooks(event) {
    event.preventDefault();

    var title = titleInput.value.trim();
    var author = authorInput.value.trim();
    var subject = subjectInput.value.trim();

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

// Google Books API callback function

// Extract results from the API response

// Change document.location property to open search results page

// Close button event listener
u(".close-search").on("click", closeSearch);

// Search submit event listener
u(".book-search").on("submit", findBooks);

searchButton.addEventListener('click', () => {
    modal.classList.add('is-active');
});
