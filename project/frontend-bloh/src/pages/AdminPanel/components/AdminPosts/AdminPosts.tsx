import { useEffect, useState } from 'react'
import { blogAPI } from '../../../../api/blog'
import { Post } from '../../../../api/types'
import { LoadingSpinner } from '../../../../components/LoadingSpinner/LoadingSpinner'
import { PostEditModal } from '../../../../components/Modals/PostEditModal/PostEditModal'
import styles from '../../AdminPanel.module.css'

export const AdminPosts = () => {
	const [posts, setPosts] = useState<Post[]>([])
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [editingPost, setEditingPost] = useState<Post | null>(null)
	const [showEditModal, setShowEditModal] = useState(false)

	useEffect(() => {
		fetchPosts()
	}, [])

	useEffect(() => {
		const filtered = posts.filter(
			post =>
				post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				post.author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
				post.tags.some(tag =>
					tag.name.toLowerCase().includes(searchTerm.toLowerCase())
				)
		)
		setFilteredPosts(filtered)
	}, [searchTerm, posts])

	const fetchPosts = async () => {
		setIsLoading(true)
		try {
			const response = await blogAPI.getAdminPosts()
			setPosts(response.results || response)
			setFilteredPosts(response.results || response)
		} catch (err) {
			setError('Ошибка загрузки постов')
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleUpdateStatus = async (id: number, status: string) => {
		try {
			const updatedPost = await blogAPI.updatePostStatus(id, status)
			setPosts(posts.map(post => (post.id === id ? updatedPost : post)))
		} catch (err) {
			setError('Ошибка при обновлении статуса')
			console.error(err)
		}
	}

	const handleDeletePost = async (id: number) => {
		if (!confirm('Вы уверены, что хотите удалить этот пост?')) return
		try {
			await blogAPI.deletePost(id)
			setPosts(posts.filter(post => post.id !== id))
		} catch (err) {
			setError('Ошибка при удалении поста')
			console.error(err)
		}
	}

	const handleSavePost = async (updatedPost: Post) => {
		setPosts(
			posts.map(post => (post.id === updatedPost.id ? updatedPost : post))
		)
		setShowEditModal(false)
	}

	if (isLoading) return <LoadingSpinner />

	return (
		<div className={styles.section}>
			<h2>Управление постами</h2>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.searchForm}>
				<input
					type='text'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					placeholder='Поиск по названию, автору или тегам'
					className={styles.input}
				/>
			</div>

			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>ID</th>
							<th>Заголовок</th>
							<th>Автор</th>
							<th>Тип</th>
							<th>Статус</th>
							<th>Дата</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{filteredPosts.map(post => (
							<tr key={post.id}>
								<td>{post.id}</td>
								<td>
									<div className={styles.postTitle}>
										{post.cover_image && (
											<img
												src={post.cover_image}
												alt={post.title}
												className={styles.postThumbnail}
											/>
										)}
										{post.title}
									</div>
								</td>
								<td>{post.author.username}</td>
								<td>{post.post_type === 'recipe' ? 'Рецепт' : 'Статья'}</td>
								<td>
									<select
										value={post.status}
										onChange={e => handleUpdateStatus(post.id, e.target.value)}
										className={styles.statusSelect}
									>
										<option value='draft'>Черновик</option>
										<option value='published'>Опубликован</option>
										<option value='archived'>Архив</option>
									</select>
								</td>
								<td>{new Date(post.created_at).toLocaleDateString()}</td>
								<td>
									<button
										onClick={() => {
											setEditingPost(post)
											setShowEditModal(true)
										}}
										className={styles.editButton}
									>
										Редактировать
									</button>
									<button
										onClick={() => handleDeletePost(post.id)}
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

			{showEditModal && editingPost && (
				<PostEditModal
					post={editingPost}
					onClose={() => setShowEditModal(false)}
					onSave={handleSavePost}
				/>
			)}
		</div>
	)
}
