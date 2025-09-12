import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
	baseURL: 'http://localhost:8000/api/',
})

// Добавляем токен в заголовки
api.interceptors.request.use(config => {
	const token = Cookies.get('access_token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Обновление токена при истечении срока
api.interceptors.response.use(
	response => response,
	async error => {
		if (!error.response) return Promise.reject(error)

		const { status } = error.response
		const originalRequest = error.config
		const url: string = originalRequest?.url || ''

		const isLoginRequest = url.endsWith('auth/token/')
		const isRefreshRequest = url.endsWith('auth/token/refresh/')
		const isRegisterRequest = url.endsWith('auth/register/')

		// Для запросов авторизации / регистрации ничего не пытаемся рефрешить
		if (
			status === 401 &&
			(isLoginRequest || isRefreshRequest || isRegisterRequest)
		) {
			return Promise.reject(error)
		}

		if (status === 401 && !originalRequest._retry) {
			const refreshToken = Cookies.get('refresh_token')
			if (!refreshToken) {
				Cookies.remove('access_token')
				Cookies.remove('refresh_token')
				return Promise.reject(error)
			}

			originalRequest._retry = true
			try {
				const response = await axios.post(
					'http://localhost:8000/api/auth/token/refresh/',
					{ refresh: refreshToken }
				)
				Cookies.set('access_token', response.data.access)
				Cookies.set('refresh_token', refreshToken)
				originalRequest.headers.Authorization = `Bearer ${response.data.access}`
				return api(originalRequest)
			} catch (refreshError) {
				Cookies.remove('access_token')
				Cookies.remove('refresh_token')
				// Больше не делаем window.location.href — пусть UI сам покажет модалку входа
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)

export default api
