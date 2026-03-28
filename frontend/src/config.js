const isProd = import.meta.env.PROD;

export const API_BASE_URL = isProd 
  ? '/api' 
  : 'http://localhost:8000';

export const WS_BASE_URL = isProd
  ? `wss://${window.location.host}/ws`
  : 'ws://localhost:8000/ws';
