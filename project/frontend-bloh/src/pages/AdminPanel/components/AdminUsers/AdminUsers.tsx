import { useEffect, useState } from 'react'
import { authAPI } from '../../../../api/auth'
import { User } from '../../../../api/types'
import { LoadingSpinner } from '../../../../components/LoadingSpinner/LoadingSpinner'
import styles from '../../AdminPanel.module.css'

export const AdminUsers = () => {
	const [users, setUsers] = useState<User[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')

	useEffect(() => {
		fetchUsers()
	}, [])

	const fetchUsers = async () => {
		setIsLoading(true)
		try {
			const response = await authAPI.getAdminUsers()
			setUsers(response.results || response)
		} catch (err) {
			setError('Ошибка загрузки пользователей')
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleUpdateUser = async (userId: number, data: Partial<User>) => {
		try {
			const updatedUser = await authAPI.updateAdminUser(userId, data)
			setUsers(users.map(user => (user.id === userId ? updatedUser : user)))
		} catch (err) {
			setError('Ошибка при обновлении пользователя')
			console.error(err)
		}
	}

	const handleDeleteUser = async (userId: number) => {
		try {
			await authAPI.deleteAdminUser(userId)
			setUsers(users.filter(user => user.id !== userId))
		} catch (err) {
			setError('Ошибка при удалении пользователя')
			console.error(err)
		}
	}

	const toggleAdminStatus = async (userId: number, isAdmin: boolean) => {
		await handleUpdateUser(userId, {
			is_admin: isAdmin,
			role: isAdmin ? 'admin' : 'user',
		})
	}

	const filteredUsers = users.filter(
		user =>
			user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase())
	)

	if (isLoading) return <LoadingSpinner />

	return (
		<div className={styles.section}>
			<h2>Управление пользователями</h2>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.searchForm}>
				<div className={styles.searchInputWrapper}>
					<span className={styles.searchIcon}>🔍</span>
					<input
						type='text'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						placeholder='Поиск: имя / email'
						className={`${styles.input} ${styles.search}`}
					/>
				</div>
			</div>

			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>ID</th>
							<th>Имя</th>
							<th>Email</th>
							<th>Аватар</th>
							<th>Админ</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map(user => (
							<tr key={user.id}>
								<td>{user.id}</td>
								<td>
									<div className={styles.userCell}>
										{user.avatar_url && (
											<img
												src={user.avatar_url}
												alt={user.username}
												className={styles.avatar}
											/>
										)}
										<div>
											<div>{user.username}</div>
											{user.display_name && (
												<div className={styles.displayName}>
													{user.display_name}
												</div>
											)}
										</div>
									</div>
								</td>
								<td>{user.email}</td>
								<td>
									{user.avatar_url ? (
										<img
											src={user.avatar_url}
											alt='Аватар'
											className={styles.smallAvatar}
										/>
									) : (
										'Нет'
									)}
								</td>
								<td>
									<input
										type='checkbox'
										checked={user.is_admin}
										onChange={e => toggleAdminStatus(user.id, e.target.checked)}
										className={styles.checkbox}
									/>
								</td>
								<td>
									<button
										onClick={() => handleDeleteUser(user.id)}
										className={styles.deleteButton}
									>
										Удалить
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
