import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // Router import kiya
import { Provider } from 'react-redux'; // NAYA: Provider import kiya
import store from './store/store'; // NAYA: Store import kiya

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🔮 Central Bank (Store) ko poori application par wrap kar diya */}
    <Provider store={store}>
      <BrowserRouter> {/* Poore app ko wrap kar diya */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
