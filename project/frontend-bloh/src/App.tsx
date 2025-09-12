import { Suspense, lazy } from 'react'
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from 'react-router-dom'
import './App.css'
import { Layout } from './components/Layout/Layout'
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner'
import { useAuthStore } from './stores/authStore'

// Ленивая загрузка страниц
const HomePage = lazy(() =>
	import('./pages/HomePage/HomePage').then(module => ({
		default: module.HomePage,
	}))
)
const ArticlePage = lazy(() =>
	import('./pages/ArticlePage/ArticlePage').then(module => ({
		default: module.ArticlePage,
	}))
)
const Profile = lazy(() =>
	import('./pages/Profile/Profile').then(module => ({
		default: module.Profile,
	}))
)
const UserPublicProfile = lazy(() =>
	import('./pages/UserProfilePage/UserPublicProfile').then(module => ({
		default: module.UserPublicProfile,
	}))
)
const PostPage = lazy(() =>
	import('./pages/PostPage/PostPage').then(module => ({
		default: module.PostPage,
	}))
)
const SubscriptionsPage = lazy(() =>
	import('./pages/SubscriptionsPage/SubscriptionsPage').then(module => ({
		default: module.SubscriptionsPage,
	}))
)
const EditProfilePage = lazy(() =>
	import('./pages/EditProfilePage/EditProfilePage').then(module => ({
		default: module.EditProfilePage,
	}))
)

const AdminPanel = lazy(() =>
	import('./pages/AdminPanel/AdminPanel').then(module => ({
		default: module.AdminPanel,
	}))
)

const CreatePostPage = lazy(() =>
	import('./pages/CreatePostPage/CreatePostPage').then(module => ({
		default: module.CreatePostPage,
	}))
)

// Добавлено: страница отчетов
const AdminReportsPage = lazy(() =>
	import('./pages/ReportPage/AdminReportsPage').then(module => ({
		default: module.AdminReportsPage,
	}))
)

const NotFoundPage = lazy(() =>
	import('./pages/NotFoundPage/NotFoundPage').then(module => ({
		default: module.NotFoundPage,
	}))
)

interface ProtectedRouteProps {
	children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { user } = useAuthStore()

	if (!user) {
		return <Navigate to='/' replace />
	}

	// if (!isAdmin()) {
	// 	return <Navigate to='/profile' replace />
	// }

	return <>{children}</>
}

function App() {
	return (
		<Router>
			<Layout>
				<Suspense fallback={<LoadingSpinner fullPage />}>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/article' element={<ArticlePage />} />
						<Route path='/posts/:postId' element={<PostPage />} />
						<Route path='/profile/:username' element={<UserPublicProfile />} />

						<Route
							path='/profile'
							element={
								<ProtectedRoute>
									<Profile />
								</ProtectedRoute>
							}
						/>

						<Route
							path='/subscriptions'
							element={
								<ProtectedRoute>
									<SubscriptionsPage />
								</ProtectedRoute>
							}
						/>

						<Route
							path='/create-post'
							element={
								<ProtectedRoute>
									<CreatePostPage />
								</ProtectedRoute>
							}
						/>

						<Route
							path='/profile/edit'
							element={
								<ProtectedRoute>
									<EditProfilePage />
								</ProtectedRoute>
							}
						/>

						<Route
							path='/admin'
							element={
								<ProtectedRoute>
									<AdminPanel />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/admin/reports'
							element={
								<ProtectedRoute>
									<AdminReportsPage />
								</ProtectedRoute>
							}
						/>

						<Route path='/404' element={<NotFoundPage />} />
						<Route path='*' element={<Navigate to='/404' replace />} />
					</Routes>
				</Suspense>
			</Layout>
		</Router>
	)
}

export default App
