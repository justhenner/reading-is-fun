var searchModal = u("#search-modal");




// Close the search modal when the user clicks the close button
function closeSearch() {
    searchModal.removeClass("is-active");
}
// Search event handler
function findBooks(event){
    
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