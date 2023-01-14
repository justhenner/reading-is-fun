// modal
const searchButton = document.querySelector('#search-btn');
const modalBg = document.querySelector('.modal-background');
const closeButton = document.querySelector('#close-btn');
const modal = document.querySelector('.modal');

searchButton.addEventListener('click', () => {
    modal.classList.add('is-active');
});

modalBg.addEventListener('click', () => {
    modal.classList.remove('is-active');
});

closeButton.addEventListener('click', () => {
    modal.classList.remove('is-active');
})
