// services/api.js
import axios from 'axios';

const apiBaseUrl =
  // process.env.NODE_ENV === 'production'
    // ? 
    process.env.NEXT_PUBLIC_API_BASE_URL_PRODUCTION 
  //   : 
    // process.env.NEXT_PUBLIC_API_BASE_URL_DEVELOPMENT;  


const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Create an Axios instance with the base URL
const api = axios.create({
    baseURL: apiBaseUrl,
    // headers: headers
  // You can add more configuration options here, such as headers, interceptors, etc.
});

if(typeof(window) !== 'undefined' && typeof(window) !== undefined){
  const getInfoLocal = JSON.parse(localStorage.getItem('userData'))
  
  if(getInfoLocal?.AccessToken){
    api.defaults.headers.common['Authorization'] = 'Bearer ' + getInfoLocal?.AccessToken;
  }
}




export default api;