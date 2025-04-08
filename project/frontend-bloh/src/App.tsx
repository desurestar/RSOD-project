import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage.tsx'

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<HomePage />} />
			</Routes>
		</Router>
	)
}

export default App
