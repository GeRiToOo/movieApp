// Endpoints
const API_KEY = 'api_key=2d32cf3905066ed86561d96b0fb175ad';
const BASE_API = 'https://api.themoviedb.org/3';
const LATEST_URL = `${BASE_API}/discover/movie?sort_by=popularity.desc&${API_KEY}`;
const SEARCH_API = `${BASE_API}/search/movie?${API_KEY}&query="`;
const GENRES_URL = `${BASE_API}/genre/movie/list?${API_KEY}&language=en-US`;
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
// Elements
const moviesContainer = document.querySelector('#movies-container');
const form = document.querySelector('#form');
const search = document.querySelector('#search');
const buttonAll = document.querySelector('.all');
const spanYear = document.querySelector('#footer-year');
const pagination = document.querySelector('#pagination');
const logo = document.querySelector('#logo');
const noImage = './images/noImage.png';
const loading = './images/loading.png';

// Add current year to the footer span
const year = new Date().getFullYear();
spanYear.innerText = year;

// Fetching Data from API function
const fetchData = async (api) =>
  await fetch(`${api}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });

// Adding Different Colors to movies' ratings Function
const getClassByRate = (vote) => {
  if (vote >= 8) {
    return 'green';
  } else if (vote >= 5) {
    return 'orange';
  } else {
    return 'red';
  }
};

// Construction of the Film Cart and adding it to the DOM
const showMovies = (movies, genres) => {
  moviesContainer.innerHTML = '';

  movies.forEach((movie) => {
    const {
      title,
      poster_path,
      vote_average,
      overview,
      genre_ids,
      release_date,
    } = movie;
    /* Find genres of current movie from full list of Genres,
       and add values to new genresArray */
    const genresArray = [];
    genre_ids.forEach((id) => {
      genres.forEach((genre) => {
        if (genre.id === id) {
          genresArray.push(genre.name);
        }
      });
    });

    // Construct movie element
    const divMovie = document.createElement('div');
    divMovie.classList.add('movie');
    divMovie.innerHTML = ` 
            <img src=${
              !poster_path ? noImage : IMG_PATH + poster_path
            } alt=${title}>
            <div class="details">
                <div class="movie-info">
                     <h2>${title ? title : 'Title Available'}</h2>
                     <span class=${getClassByRate(
                       vote_average
                     )}>${vote_average}</span>
                </div>
                <div class='year'>
                     <h3>Year</h3>
                     <span>${
                       release_date ? release_date.substr(0, 4) : 'No Year'
                     }</span>
                </div>
                  <div class='genres'>
                     ${
                       genresArray.length === 0
                         ? 'Genres is not available'
                         : genresArray
                             .map((genre) => `<span>${genre},</span>`)
                             .join('')
                     }
                </div>
               <div class="overview">
                     <h3>Overview</h3>
                     <p>
                        ${overview ? overview : 'Overview is not available'}
                     </p>
                </div>
             </div>
       `;
    moviesContainer.appendChild(divMovie);
  });
};

// Pagination functionality
let currentPage = 1;
let buttonsPerPage = 7;

// Creation of Pagination Buttons
const createPaginationButton = (pageIndex, totalPages) => {
  const paginateButton = document.createElement('button');
  paginateButton.innerHTML = pageIndex;

  // Add active class to current page button
  if (currentPage === pageIndex) {
    paginateButton.classList.add('active');
  }

  // Add functionality on click to the buttons
  paginateButton.addEventListener('click', () => {
    currentPage = pageIndex;
    // when the page's button is clicked, scrollToTop
    window.scrollTo(0, 0);

    // remove active from any other buttons
    const removeActive = document.querySelector('#pagination .active');
    if (removeActive) {
      removeActive.classList.remove('active');
    }

    // Add Active class to current Page button
    if (currentPage === 1) {
      paginateButton.classList.add('active');
    } else if (currentPage === totalPages) {
      paginateButton.classList.add('active');
    }
    paginateButton.classList.add('active');

    /* Searched value is set to localStorage
       if localStorage value exists then is fetched SEARCH_API
       if does not exist is fetched initial LATEST_API */
    if (
      localStorage.getItem('search') &&
      localStorage.getItem('search') !== ''
    ) {
      let searchTerm = localStorage.getItem('search');
      getMoviesData(SEARCH_API + searchTerm, pageIndex);
    } else {
      getMoviesData(LATEST_URL, pageIndex);
    }
  });
  return paginateButton;
};

const setValueToLeft = () => {
  const width = reportWindowSize();

  if (width < 650 && currentPage >= 100) {
    const maxLeft = currentPage - 1;
    return maxLeft;
  } else {
    const maxLeft = currentPage - Math.floor(buttonsPerPage / 2);
    return maxLeft;
  }
};

// setUp Pagination in Pagination Wrapper
const setUpPagination = (pageCount) => {
  pagination.innerHTML = '';
  let totalPages = pageCount;

  /* Initializing two new values that will take a role in the pagination
     to show Math.floor(3.5)=4 on the left and Math.floor(3.5)=4 on the right 
     of the currentPage that */

  let maxLeft = currentPage - Math.floor(buttonsPerPage / 2);
  let maxRight = currentPage + Math.floor(buttonsPerPage / 2);

  /* Prevents maxLeft of going in negative value, 
     and maxRight going over totalPages */
  if (maxLeft < 1) {
    maxLeft = 1;
    maxRight = buttonsPerPage;
  } else if (maxRight > totalPages) {
    maxLeft = totalPages - (buttonsPerPage - 1);
    maxRight = totalPages;
    // Prevents -values of the buttons if buttonsPerPage > totalPages
    if (maxLeft < 1) {
      maxLeft = 1;
    }
  }

  /* If current page is not the first page, then is created button "First"
    that would navigate the user to the first page */
  if (currentPage !== 1) {
    const first = document.createElement('button');
    first.innerHTML = 'First';
    pagination.appendChild(first);

    // add functionality onClick to this button
    first.addEventListener('click', () => {
      currentPage = 1;
      const removeActive = document.querySelector('#pagination .active');
      if (removeActive) {
        removeActive.classList.remove('active');
      }

      /* Keep search functionality if there 
         is something in the local storage */
      if (
        localStorage.getItem('search') &&
        localStorage.getItem('search') !== ''
      ) {
        let searchTerm = localStorage.getItem('search');
        getMoviesData(SEARCH_API + searchTerm, currentPage);
      } else {
        getMoviesData(LATEST_URL, currentPage);
      }
    });
  }
  // For Loop renders pagination buttons
  for (let i = maxLeft; i < maxRight + 1; i++) {
    const button = createPaginationButton(i, totalPages);
    pagination.appendChild(button);
  }

  /* If current page is not the last page, then is created button "Last"
    that would navigate the user to the last page */
  if (currentPage !== totalPages) {
    const last = document.createElement('button');
    last.innerHTML = 'Last';
    pagination.appendChild(last);

    // add functionality onClick to this button
    last.addEventListener('click', () => {
      currentPage = totalPages;
      const removeActive = document.querySelector('#pagination .active');
      if (removeActive) {
        removeActive.classList.remove('active');
      }

      /* Keep search functionality if there 
         is something in the local storage */
      if (
        localStorage.getItem('search') &&
        localStorage.getItem('search') !== ''
      ) {
        let searchTerm = localStorage.getItem('search');
        getMoviesData(SEARCH_API + searchTerm, currentPage);
      } else {
        getMoviesData(LATEST_URL, currentPage);
      }
    });
  }
};

// Fetching All Needed Movie Data
const getMoviesData = async (url, currentPage) => {
  const { results, total_pages } = await fetchData(
    url + `&page=${currentPage}`
  );
  const { genres } = await fetchData(GENRES_URL);
  setUpPagination(total_pages);
  showMovies(results, genres);
};

// Search Functionality
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  /* Set search value to the localStorage to keep 
     the current search through pagination  */
  localStorage.setItem('search', searchTerm);
  if (searchTerm && searchTerm !== '') {
    getMoviesData(SEARCH_API + searchTerm, currentPage);
    search.value = '';
  } else {
    window.location.reload();
  }
});

// Logo's click cleans LocalStorage and reloads page
logo.addEventListener('click', () => {
  localStorage.removeItem('search');
  currentPage = 1;
  getMoviesData(LATEST_URL, 1);
});

// buttonAll cleans LocalStorage and shows Latest movies
buttonAll.addEventListener('click', () => {
  localStorage.removeItem('search');
  currentPage = 1;
  getMoviesData(LATEST_URL, 1);
});

/* Here again check if there is anything in the localStorage
    and depends on this information is triggered the same function
    with different parameters */
if (localStorage.getItem('search') && localStorage.getItem('search') !== '') {
  let searchTerm = localStorage.getItem('search');
  getMoviesData(SEARCH_API + searchTerm, currentPage);
} else {
  getMoviesData(LATEST_URL, currentPage);
}
