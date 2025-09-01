import { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { blogAPI } from '../../../../api/blog'
import { Tag } from '../../../../api/types'
import { LoadingSpinner } from '../../../../components/LoadingSpinner/LoadingSpinner'
import styles from '../../AdminPanel.module.css'

export const AdminTags = () => {
	const [tags, setTags] = useState<Tag[]>([])
	const [filteredTags, setFilteredTags] = useState<Tag[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [newTagName, setNewTagName] = useState('')
	const [newTagColor, setNewTagColor] = useState('#FF5733')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showColorPicker, setShowColorPicker] = useState(false)

	useEffect(() => {
		fetchTags()
	}, [])

	useEffect(() => {
		const filtered = tags.filter(
			tag =>
				tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
		)
		setFilteredTags(filtered)
	}, [searchTerm, tags])

	const fetchTags = async () => {
		setIsLoading(true)
		try {
			const response = await blogAPI.getTags()
			const tagsData = response.results || response
			setTags(tagsData)
			setFilteredTags(tagsData)
		} catch (err) {
			setError('Ошибка загрузки тегов')
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleAddTag = async () => {
		if (!newTagName.trim()) return

		try {
			const newTag = await blogAPI.createTag({
				name: newTagName,
				slug: generateSlug(newTagName),
				color: newTagColor,
			})

			setTags([...tags, newTag])
			setNewTagName('')
		} catch (err) {
			setError('Ошибка при добавлении тега')
			console.error(err)
		}
	}

	const generateSlug = (name: string): string => {
		return name
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^\w-]+/g, '')
	}

	const handleDeleteTag = async (id: number) => {
		try {
			await blogAPI.deleteTag(id)
			setTags(tags.filter(tag => tag.id !== id))
		} catch (err) {
			setError('Ошибка при удалении тега')
			console.error(err)
		}
	}

	if (isLoading) return <LoadingSpinner />

	return (
		<div className={styles.section}>
			<h2>Управление тегами</h2>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.searchForm}>
				<div className={styles.searchInputWrapper}>
					<span className={styles.searchIcon}>🔍</span>
					<input
						type='text'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						placeholder='Поиск по названию или slug'
						className={`${styles.input} ${styles.search}`}
					/>
				</div>
			</div>

			<div className={styles.addForm}>
				<input
					type='text'
					value={newTagName}
					onChange={e => setNewTagName(e.target.value)}
					placeholder='Название тега'
					className={styles.input}
				/>

				<div className={styles.colorPickerContainer}>
					<button
						type='button'
						className={styles.colorPreview}
						style={{ backgroundColor: newTagColor }}
						onClick={() => setShowColorPicker(!showColorPicker)}
						title='Выбрать цвет'
					/>

					{showColorPicker && (
						<div className={styles.colorPickerPopup}>
							<HexColorPicker color={newTagColor} onChange={setNewTagColor} />
							<div className={styles.colorValue}>{newTagColor}</div>
						</div>
					)}
				</div>

				<button
					onClick={handleAddTag}
					className={styles.button}
					disabled={!newTagName.trim()}
				>
					Добавить
				</button>
			</div>

			<ul className={styles.list}>
				{filteredTags.map(tag => (
					<li key={tag.id} className={styles.listItem}>
						<div>
							<span className={styles.tagName}>
								<span
									className={styles.colorBadge}
									style={{ backgroundColor: tag.color }}
								/>
								{tag.name}
							</span>
							<div className={styles.tagMeta}>
								<span className={styles.colorCode}>{tag.color}</span>
							</div>
						</div>
						<button
							onClick={() => handleDeleteTag(tag.id)}
							className={styles.deleteButton}
						>
							Удалить
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}
