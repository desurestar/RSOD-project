import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
})

// Добавляем токен в заголовки
api.interceptors.request.use((config) => {
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
        const originalRequest = error.config
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            
            try {
                const refreshToken = Cookies.get('refresh_token')
                if (!refreshToken) throw new Error('No refresh token')
                
                const response = await axios.post(
                    'http://localhost:8000/api/auth/token/refresh/', 
                    { refresh: refreshToken }
                )
                
                Cookies.set('access_token', response.data.access)
                Cookies.set('refresh_token', refreshToken) // Refresh token остается тем же
                
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`
                return api(originalRequest)
            } catch (refreshError) {
                // Обработка ошибки обновления токена
                Cookies.remove('access_token')
                Cookies.remove('refresh_token')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default api