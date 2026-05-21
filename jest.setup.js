// Mock import.meta.env for Jest environment

globalThis.importMeta = {
  env: {
    VITE_REACT_LOCAL_BACKEND_URL: 'http://localhost:8080',
  },
};

process.env.VITE_REACT_LOCAL_BACKEND_URL = 'http://localhost:8080';