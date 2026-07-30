import { BrowserRouter } from 'react-router-dom'

import AppRoutes from './routes/AppRoutes.jsx'

import { AuthProvider } from './context/AuthContext.jsx'



function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <AppRoutes />

      </BrowserRouter>

    </AuthProvider>

  )

}



export default App