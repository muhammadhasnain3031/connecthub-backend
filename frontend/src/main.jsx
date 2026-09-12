import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // Router import kiya

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Poore app ko wrap kar diya */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
