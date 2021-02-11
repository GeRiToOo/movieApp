const API_KEY = 'api_key=2d32cf3905066ed86561d96b0fb175ad';
const BASE_API = 'https://api.themoviedb.org/3';
const LATEST_URL = `${BASE_API}/discover/movie?sort_by=popularity.desc&${API_KEY}`;
const SEARCH_API = `${BASE_API}/search/movie?${API_KEY}&query="`;
const GENRES_URL = `${BASE_API}/genre/movie/list?${API_KEY}&language=en-US`;
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';

const moviesContainer = document.querySelector('#movies-container');
const form = document.querySelector('#form');
const search = document.querySelector('#search');
const buttonAll = document.querySelector('.all');
const spanYear = document.querySelector('#footer-year');
const pagination = document.querySelector('#pagination');
const logo = document.querySelector('#logo');
const noImage = './images/noImage.png';
const loading = './images/loading.png';

const year = new Date().getFullYear();
spanYear.innerText = year;

const fetchData = async (api) =>
  await fetch(`${api}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });

const getClassByRate = (vote) => {
  if (vote >= 8) {
    return 'green';
  } else if (vote >= 5) {
    return 'orange';
  } else {
    return 'red';
  }
};

const showMovies = (movies, genres) => {
  moviesContainer.innerHTML = '';

  if (movies.length === 0) {
    const noMovies = document.createElement('h2');
    noMovies.classList.add('noMovies');
    noMovies.innerHTML = 'No results';
    moviesContainer.appendChild(noMovies);
  }

  movies.forEach((movie) => {
    const {
      title,
      poster_path,
      vote_average,
      overview,
      genre_ids,
      release_date,
    } = movie;

    const genresArray = [];
    genre_ids.forEach((id) => {
      genres.forEach((genre) => {
        if (genre.id === id) {
          genresArray.push(genre.name);
        }
      });
    });

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

const createPaginationButton = (pageIndex, totalPages) => {
  const paginateButton = document.createElement('button');
  paginateButton.innerHTML = pageIndex;

  if (currentPage === pageIndex) {
    paginateButton.classList.add('active');
  }

  paginateButton.addEventListener('click', () => {
    currentPage = pageIndex;
    window.scrollTo(0, 0);

    const removeActive = document.querySelector('#pagination .active');
    if (removeActive) {
      removeActive.classList.remove('active');
    }

    if (currentPage === 1) {
      paginateButton.classList.add('active');
    } else if (currentPage === totalPages) {
      paginateButton.classList.add('active');
    }
    paginateButton.classList.add('active');

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

const setUpPagination = (pageCount) => {
  pagination.innerHTML = '';
  let totalPages = pageCount;

  let maxLeft = currentPage - Math.floor(buttonsPerPage / 2);
  let maxRight = currentPage + Math.floor(buttonsPerPage / 2);

  if (maxLeft < 1) {
    maxLeft = 1;
    maxRight = buttonsPerPage;
  } else if (maxRight > totalPages) {
    maxLeft = totalPages - (buttonsPerPage - 1);
    maxRight = totalPages;

    if (maxLeft < 1) {
      maxLeft = 1;
    }
  }

  if (currentPage !== 1) {
    const first = document.createElement('button');
    first.innerHTML = 'First';
    pagination.appendChild(first);

    first.addEventListener('click', () => {
      currentPage = 1;
      const removeActive = document.querySelector('#pagination .active');
      if (removeActive) {
        removeActive.classList.remove('active');
      }

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

  for (let i = maxLeft; i < maxRight + 1; i++) {
    const button = createPaginationButton(i, totalPages);
    pagination.appendChild(button);
  }

  if (currentPage !== totalPages) {
    const last = document.createElement('button');
    last.innerHTML = 'Last';
    pagination.appendChild(last);

    last.addEventListener('click', () => {
      currentPage = totalPages;
      const removeActive = document.querySelector('#pagination .active');
      if (removeActive) {
        removeActive.classList.remove('active');
      }

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

const getMoviesData = async (url, currentPage) => {
  const { results, total_pages } = await fetchData(
    url + `&page=${currentPage}`
  );
  const { genres } = await fetchData(GENRES_URL);
  setUpPagination(total_pages);
  showMovies(results, genres);
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  localStorage.setItem('search', searchTerm);
  if (searchTerm && searchTerm !== '') {
    getMoviesData(SEARCH_API + searchTerm, currentPage);
    search.value = '';
  } else {
    window.location.reload();
  }
});

logo.addEventListener('click', () => {
  localStorage.removeItem('search');
  currentPage = 1;
  getMoviesData(LATEST_URL, 1);
});

buttonAll.addEventListener('click', () => {
  localStorage.removeItem('search');
  currentPage = 1;
  getMoviesData(LATEST_URL, 1);
});

if (localStorage.getItem('search') && localStorage.getItem('search') !== '') {
  let searchTerm = localStorage.getItem('search');
  getMoviesData(SEARCH_API + searchTerm, currentPage);
} else {
  getMoviesData(LATEST_URL, currentPage);
}
