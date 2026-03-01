/**
 * Import the axios library for making HTTP requests.
 */
import axios from 'axios';

/**
 * The base URL for The Movie Database (TMDB) API version 3.
 */
const MOVIE_DB_API_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * The API key retrieved from environment variables for authenticating with TMDB.
 */
const MOVIE_DB_API_KEY = process.env.EXPO_PUBLIC_MOVIE_DB_API_KEY;

/**
 * Endpoint to fetch trending movies of the day.
 */
const trendingMoviesEndpoint = `${MOVIE_DB_API_BASE_URL}/trending/movie/day?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Endpoint to fetch upcoming movies.
 */
const upcomingMoviesEndpoint = `${MOVIE_DB_API_BASE_URL}/movie/upcoming?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Endpoint to fetch top-rated movies.
 */
const topRatedMoviesEndpoint = `${MOVIE_DB_API_BASE_URL}/movie/top_rated?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Endpoint for searching movies.
 */
const searchMoviesEndpoint = `${MOVIE_DB_API_BASE_URL}/search/movie?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Generates an endpoint to fetch details for a specific movie by its ID.
 * @param id The ID of the movie.
 */
const movieDetailsEndpoint = (id: string) =>
  `${MOVIE_DB_API_BASE_URL}/movie/${id}?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Generates an endpoint to fetch cast and crew details for a specific movie.
 * @param id The ID of the movie.
 */
const movieCreditsEndpoint = (id: string) =>
  `${MOVIE_DB_API_BASE_URL}/movie/${id}/credits?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Generates an endpoint to fetch similar movies for a specific movie.
 * @param id The ID of the movie.
 */
const similarMoviesEndpoint = (id: string) =>
  `${MOVIE_DB_API_BASE_URL}/movie/${id}/similar?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Generates an endpoint to fetch details for a specific person (actor/crew) by their ID.
 * @param id The ID of the person.
 */
const personDetailsEndpoint = (id: string) =>
  `${MOVIE_DB_API_BASE_URL}/person/${id}?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Generates an endpoint to fetch movies associated with a specific person.
 * @param id The ID of the person.
 */
const personMoviesEndpoint = (id: string) =>
  `${MOVIE_DB_API_BASE_URL}/person/${id}/movie_credits?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Helper to construct an image URL with width w500.
 * @param posterPath The image path from TMDB.
 */
export const image500 = (posterPath: string) =>
  posterPath ? 'https://image.tmdb.org/t/p/w500' + posterPath : null;

/**
 * Helper to construct an image URL with width w342.
 * @param posterPath The image path from TMDB.
 */
export const image342 = (posterPath: string) =>
  posterPath ? 'https://image.tmdb.org/t/p/w342' + posterPath : null;

/**
 * Helper to construct an image URL with width w185.
 * @param posterPath The image path from TMDB.
 */
export const image185 = (posterPath: string) =>
  posterPath ? 'https://image.tmdb.org/t/p/w185' + posterPath : null;

/**
 * Fallback URL for when a movie poster is unavailable.
 */
export const fallbackMoviePoster =
  'https://img.myloview.com/stickers/whitelaptop-screen-with-hd-video-technology-icon-isolated-on-grey-background-abstractcircle-random-dots-vector-illustration-400-176057922.jpg';

/**
 * Fallback URL for when a person's image is unavailable.
 */
export const fallbackPersonImage =
  'https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-855.jpg';

/**
 * Generic function to perform a GET request to a specified TMDB endpoint.
 * @param endpoint The URL to fetch data from.
 * @param params Optional query parameters for the request.
 * @returns The data from the API response or an empty object on error.
 */
const apiCall = async (endpoint: string, params?: object) => {
  const options = {
    method: 'GET',
    url: endpoint,
    params: params ? params : {},
  };
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log('error: ', error);
    return {};
  }
};

/**
 * Fetches the list of trending movies.
 * @param page Optional page number for pagination.
 */
export const fetchTrendingMovies = (page?: number) => {
  return apiCall(trendingMoviesEndpoint + (page ? '&page=' + page : ''));
};

/**
 * Fetches the list of upcoming movies.
 * @param page Optional page number for pagination.
 */
export const fetchUpcomingMovies = (page?: number) => {
  return apiCall(upcomingMoviesEndpoint + (page ? '&page=' + page : ''));
};

/**
 * Fetches the list of top-rated movies.
 * @param page Optional page number for pagination.
 */
export const fetchTopRatedMovies = (page?: number) => {
  return apiCall(topRatedMoviesEndpoint + (page ? '&page=' + page : ''));
};

/**
 * Searches for movies based on the provided parameters.
 * @param params Search query parameters (e.g., query, page).
 */
export const searchMovies = (params: { [key: string]: string | number }) => {
  return apiCall(searchMoviesEndpoint, params);
};

/**
 * Fetches specific details for a movie.
 * @param id The movie ID.
 */
export const fetchMovieDetails = (id: number | string) => {
  return apiCall(movieDetailsEndpoint(String(id)));
};

/**
 * Fetches the cast and crew for a movie.
 * @param movieId The movie ID.
 */
export const fetchMovieCredits = (movieId: number | string) => {
  return apiCall(movieCreditsEndpoint(String(movieId)));
};

/**
 * Fetches movies similar to the given movie.
 * @param movieId The movie ID.
 */
export const fetchSimilarMovies = (movieId: number | string) => {
  return apiCall(similarMoviesEndpoint(String(movieId)));
};

/**
 * Fetches details for a specific person.
 * @param personId The person ID.
 */
export const fetchPersonDetails = (personId: number | string) => {
  return apiCall(personDetailsEndpoint(String(personId)));
};

/**
 * Fetches movies that a person has worked on.
 * @param personId The person ID.
 */
export const fetchPersonMovies = (personId: number | string) => {
  return apiCall(personMoviesEndpoint(String(personId)));
};

/**
 * Generates an endpoint to fetch videos (trailers, etc.) related to a movie.
 * @param id The movie ID.
 */
const movieVideosEndpoint = (id: string) =>
  `${MOVIE_DB_API_BASE_URL}/movie/${id}/videos?api_key=${MOVIE_DB_API_KEY}`;

/**
 * Fetches available videos for a specific movie.
 * @param movieId The movie ID.
 */
export const fetchMovieVideos = (movieId: number | string) => {
  return apiCall(movieVideosEndpoint(String(movieId)));
};
