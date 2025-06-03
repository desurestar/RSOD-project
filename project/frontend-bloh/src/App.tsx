import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import { ArticlePage } from './pages/ArticlePage/ArticlePage.tsx'
// import { CreatePostPage} from './pages/CreatePostPage/CreatePostPage.tsx'
import { HomePage } from './pages/HomePage/HomePage.tsx'
import { PostPage } from './pages/PostPage/PostPage.tsx'
// import { Profile } from './pages/Profile/Profile.tsx'
import { SubscriptionsPage } from './pages/SubscriptionsPage/SubscriptionsPage.tsx'
import { UserPublicProfile } from './pages/UserProfilePage/UserPublicProfile.tsx'
// import { useGetMeQuery } from './services/authApi.ts'
// import { useAuthStore } from './store/authStore.ts'
// import { useEffect } from 'react'

function App() {
	// const {data: user, isSuccess} = useGetMeQuery()
	// const setUser = useAuthStore(state => state.setUser)

	// useEffect(() => {
	// 	if (user && isSuccess) {
	// 		setUser(user)
	// 	}
	// }, [user, isSuccess, setUser])

	return (
		<Router>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/article' element={<ArticlePage />} />
				{/* <Route path='/profile' element={<Profile />} /> */}
				<Route path='/profile/:username' element={<UserPublicProfile />} />
				<Route path='/posts/:postId' element={<PostPage />} />
				<Route path='/subscriptions' element={<SubscriptionsPage />} />
				{/* <Route path='/create-post' element={<CreatePostPage />} /> */}
			</Routes>
		</Router>
	)
}

export default App
