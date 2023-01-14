var searchModal = u("#search-modal");
// modal
const searchButton = document.querySelector('#search-btn');
const modalBg = document.querySelector('.modal-background');
const closeButton = document.querySelector('#close-btn');



// Close the search modal when the user clicks the close button
function closeSearch() {
    searchModal.removeClass("is-active");
}

// Search event handler
function findBooks(event){
    event.preventDefault();

    console.log(u(".title-input"));

    var title = u(".title-input").attr("value");
    var author = u(".author-input").attr("value");
    var subject = u(".subject-input").attr("value");
    console.log(title, author, subject);
    // Validate input

    // Construct Google Books URL

    // Call Google Books API

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
