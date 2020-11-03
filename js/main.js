const API_KEY  = 'be0311975f164b8ee929631c0278bd97';
const BASE_URL = 'https://api.themoviedb.org/3/';
const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w1280';

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

const carousels = {};
var carouselsLoaded = 0;

class MovieCarousel {
    constructor(sliderId, imageList, movieData) {
        this.carouselContent = document.getElementById(sliderId + '-carousel');
        this.sliderId = sliderId;
        this.imageList = imageList;
        this.movieData = movieData;
        this.viewIndex = 0;
        this.imageSize = 232;
        this.step = 5;
        this.initButtons();
    }

    initButtons() {
        const prevBtn = document.getElementById(this.sliderId + '-prev');
        if(prevBtn !== null) {
            prevBtn.addEventListener('click', () => {
                this.prevImage();
            });
        }
        const nextBtn = document.getElementById(this.sliderId + '-next');
        if(nextBtn !== null) {
            nextBtn.addEventListener('click', () => {
                this.nextImage();
            });
        }
    }

    updateTranslation() {
        this.carouselContent.style.transform = `translateX(-${this.viewIndex * (this.step * this.imageSize)}px)`;
    }

     nextImage() {
        if(this.viewIndex + 1 < (this.imageList.length / this.step) - 1) {
            console.log(this.viewIndex)
            this.viewIndex++;
            this.updateTranslation();
        } 
    }

    prevImage() {
        if(this.viewIndex - 1 >= 0) {
            this.viewIndex--;
            this.updateTranslation();
        }
    }

    render() {
        this.carouselContent.innerHTML = '';
        let htmlContent = '';
        for(let image of this.imageList) {
                htmlContent += `<li id ="${image.id}" class="title-img"><div class="rating"><i class="fas fa-star"></i> ${image.vote_average}</div><img src=${BASE_IMAGE_URL + image.poster_path}
                id=${image.id}/>
                <h3>${image.title}</h3></li>`   
        }
        this.carouselContent.innerHTML = htmlContent;
    }
}

const app = {

    init: () => {
        document.addEventListener('DOMContentLoaded', app.load);
    },

    load: () => {
        searchBtn.addEventListener('click', app.onClickSearchBtn);
        document.addEventListener('click', app.onClickImg);
        app.getPage();
    },

    getPage: () => {
        let page = document.body.id;
        switch (page) {
            case 'browse':
                app.createBrowsePage();
                break;
            case 'search':
                app.createSearchPage();
                break;
            case 'movie':
                app.createMoviePage();
                break;
            default:
                break;
        }
    },

    createBrowsePage: () => {
        let paths = ['movie/now_playing', 'trending/movie/week', 'movie/top_rated', 'movie/upcoming'];
        let elements = ['now-playing', 'trending', 'top-rated', 'upcoming'];

        for(let i in elements) {
            app.requestData(paths[i], movies => {
                let carousel = new MovieCarousel(elements[i], app.getImages(movies.results), movies);
                carousels[elements[i]] = carousel;
                carousel.render();
                carouselsLoaded++;
            });
        }
    },

    requestData: (path, action, query='') => {
        let url = app.generateUrl(path, query);
        app.requestApi(url, action);
    },

    generateUrl: (path, query='') => {
        return `${BASE_URL}${path}?api_key=${API_KEY}${query}`;
    },

    requestApi: (url, action) => {
        fetch(url)
        .then((res) => res.json())
        .then(action)
        .catch((error) => {
            console.log(`Api Error: ${error}`);
        })
    },

    getImages: (movies) => {
        let moviesImgs = [];
        movies.forEach(movie => {
            if(movie.poster_path != null){
                moviesImgs.push(movie);  
            }
        });
        return moviesImgs;
    },

    createSearchPage: () => {
        let value = sessionStorage.getItem('value');
        let path = 'search/movie';
        let list = document.getElementById('movies-results');
        app.requestData(path, movies => {
            app.renderImgs(movies.results, list);
        }, `&query=${value}`);
        
    },

    renderImgs: (movies, list) => {
        list.innerHTML = '';
        let htmlContent = '';
        let imgs = app.getImages(movies);
        document.getElementById('search-results').innerHTML = `Search Results: ${app.getMoviesLength(movies)}`;
        imgs.forEach(img => {
            htmlContent += `<li id ="${img.id}" class="title-img"><div class="rating"><i class="fas fa-star"></i> ${img.vote_average}</div><img src=${BASE_IMAGE_URL + img.poster_path}
            id=${img.id}/>
            <h3>${img.title}</h3></li>`;  
        });  
        list.innerHTML = htmlContent;
    },

    getMoviesLength: (movies) => {
        let length = 0;
        movies.forEach(movie => {
            if (movie.poster_path != null) {
                length += 1;
            }
        });
        return length;
    },

    onClickSearchBtn: (event) => {
        event.preventDefault();
        let value = searchInput.value;
        if (value != '') {
            sessionStorage.setItem('value', value);
            window.location = "search.html";
            app.getPage();
        }
    },

    createMoviePage: () => {
        let movieId = sessionStorage.getItem('movieId');
        let movieHeader = document.getElementById('movie-header');
        let topic = document.getElementById('topic');
        let shortInfo = document.getElementById('short-info');
        let movieDetails = document.getElementById('movie-details');
        let iframeContainer = document.getElementById('iframe-container');
        let moreMovieDetails = document.getElementById('more-movie-details');
        app.requestData(`movie/${movieId}`, (movie) => {app.requestData(`movie/${movieId}/videos`, (trailer) => {
            movieHeader.style.backgroundImage = `url('${BASE_IMAGE_URL}${movie.backdrop_path}')`;
            topic.innerHTML =`
            <span id='stars'><i class="fas fa-star"></i>${movie.vote_average}/10</span>
            <h1>${movie.original_title}</h1>`;
            shortInfo.innerHTML =`
            <span>${movie.release_date.substring(0, 4)}</span>
            <span>- ${app.getCategories(movie)}-</span>
            <span>${app.getRuntime(movie)}</span>`;
            movieDetails.innerHTML = `<h2>Status</h2><span><h4>Status:</h4> ${movie.status}</span>
            <h2>Summary</h2>
            <div id = 'tagline'><p>${movie.tagline}</p></div>
            <div id = 'summary'><p>${movie.overview}</p></div>`;
            iframeContainer.innerHTML = `<h2>Watch Trailer</h2><div iframe-wrapper><iframe src="https://www.youtube-nocookie.com/embed/${trailer.results[0].key}" 
            allowfullscreen ></iframe></div>`;
            moreMovieDetails.innerHTML = `<h2>Movie Details</h2><ul id='more-details'><li>${app.getBudget(movie)}</li><li>${app.getRevenue(movie)}<li>
            <li id='production-companies'><h4>Production companies</h4>:<ul id='production'>${app.getProduction(movie)}</ul></li>`;
            app.requestData(`movie/${movie.id}/similar`, movies => {
                console.log(movies)
                if (movies.results.length != 0) {
                    let carousel = new MovieCarousel('similar-movies', app.getImages(movies.results), movies);
                    carousel.render();
                }
                else {
                    document.getElementById('similar-movies-container').style.display = 'None';
                    let notFound = document.createElement('h4');
                    notFound.innerHTML = 'No movies found :/';
                    document.getElementById('similar-movies').appendChild(notFound);
                }
            });
        })});
    },

    getCategories: (movie) => {
        let categories = '';
        let genres = movie.genres;
        genres.forEach(genre => {
            categories += genre.name + ` | `;
        });
        return categories.substring(0, categories.length-2);
    },

    getRuntime: (movie) => {
        let runtime = '';
        if(movie.runtime !== null) {
            runtime = movie.runtime + ' mins';
        }
        return runtime;
    },

    getNumberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    getBudget: (movie) => {
        let budget = '';
        if(movie.budget == 0) {
            budget = 'unknown';
        }
        else {
            budget = `${app.getNumberWithCommas(movie.budget)}$`
        }
        return `<h4>Budget:</h4> ${budget}`;
    },

    getRevenue: (movie) => {
        let revenue = '';
        if(movie.revenue == 0) {
            revenue = 'unknown';
        }
        else {
            revenue = `${app.getNumberWithCommas(movie.revenue)}$`
        }
        return `<h4>Revenue:</h4> ${revenue}`;
    },

    getProduction: (movie) => {
        let production = ``;
        let companies = movie.production_companies
        companies.forEach(company => {
            production += `<li>${company.name}</li>`;
        });
        return production;
    },

    onClickImg: (event) => {
        let target = event.target;
        if(target.tagName.toLowerCase() === 'img') {
            let movieId = target.id;
            movieId = movieId.substring(0, movieId.length -1);
            sessionStorage.setItem('movieId', movieId);
            window.location = "movie.html";
            app.getPage();
        }
    }

}

app.init()

