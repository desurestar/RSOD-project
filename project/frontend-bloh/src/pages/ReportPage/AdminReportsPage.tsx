import { useState } from 'react'
import { downloadPostsReport } from '../../api/reports'
import { useAuthStore } from '../../stores/authStore'
import styles from './AdminReportsPage.module.css'

export const AdminReportsPage = () => {
	const { user } = useAuthStore()
	const [dateFrom, setDateFrom] = useState('')
	const [dateTo, setDateTo] = useState('')
	const [postType, setPostType] = useState('')
	const [status, setStatus] = useState<string[]>([])
	const [tags, setTags] = useState<string>('')
	const [authorId, setAuthorId] = useState('')
	const [loading, setLoading] = useState(false)
	const isAdmin = user?.is_admin

	if (!isAdmin) return <div className={styles.box}>Нет доступа</div>

	const toggleStatus = (val: string) => {
		setStatus(prev =>
			prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
		)
	}

	const handleDownload = async () => {
		setLoading(true)
		try {
			await downloadPostsReport({
				date_from: dateFrom || undefined,
				date_to: dateTo || undefined,
				post_type: postType || undefined,
				status: status.length ? status : undefined,
				author_id: authorId ? Number(authorId) : undefined,
				tags: tags
					? tags
							.split(',')
							.map(x => Number(x.trim()))
							.filter(Boolean)
					: undefined,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Сводный отчет по постам</h1>
			<div className={styles.filters}>
				<div className={styles.group}>
					<label>С даты</label>
					<input
						type='date'
						value={dateFrom}
						onChange={e => setDateFrom(e.target.value)}
					/>
				</div>
				<div className={styles.group}>
					<label>По дату</label>
					<input
						type='date'
						value={dateTo}
						onChange={e => setDateTo(e.target.value)}
					/>
				</div>
				<div className={styles.group}>
					<label>Тип</label>
					<select value={postType} onChange={e => setPostType(e.target.value)}>
						<option value=''>Все</option>
						<option value='recipe'>Рецепт</option>
						<option value='article'>Статья</option>
					</select>
				</div>
				<div className={styles.group}>
					<label>Статусы</label>
					<div className={styles.multi}>
						{['draft', 'published', 'archived'].map(s => (
							<button
								key={s}
								type='button'
								className={`${styles.tagBtn} ${
									status.includes(s) ? styles.active : ''
								}`}
								onClick={() => toggleStatus(s)}
							>
								{s}
							</button>
						))}
					</div>
				</div>
				<div className={styles.group}>
					<label>ID автора</label>
					<input
						value={authorId}
						onChange={e => setAuthorId(e.target.value)}
						placeholder='например 3'
					/>
				</div>
				<div className={styles.group}>
					<label>Tags (csv id)</label>
					<input
						value={tags}
						onChange={e => setTags(e.target.value)}
						placeholder='1,5,9'
					/>
				</div>
			</div>
			<div className={styles.actions}>
				<button
					disabled={loading}
					onClick={handleDownload}
					className={styles.primary}
				>
					{loading ? 'Генерация...' : 'Скачать Excel'}
				</button>
			</div>
			<p className={styles.helper}>
				Оставьте поля пустыми для полного отчета. Поле tags — перечисление ID
				через запятую.
			</p>
		</div>
	)
}

export default AdminReportsPage
