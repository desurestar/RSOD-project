import { useEffect, useState } from 'react'
import { blogAPI } from '../../../../api/blog'
import { Ingredient } from '../../../../api/types'
import { LoadingSpinner } from '../../../../components/LoadingSpinner/LoadingSpinner'
import styles from '../../AdminPanel.module.css'

export const AdminIngredients = () => {
	const [ingredients, setIngredients] = useState<Ingredient[]>([])
	const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
		[]
	)
	const [searchTerm, setSearchTerm] = useState('')
	const [newIngredientName, setNewIngredientName] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		fetchIngredients()
	}, [])

	useEffect(() => {
		const filtered = ingredients.filter(ingredient =>
			ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
		)
		setFilteredIngredients(filtered)
	}, [searchTerm, ingredients])

	const fetchIngredients = async () => {
		setIsLoading(true)
		try {
			const response = await blogAPI.getIngredients()
			const ingredientsData = response.results || response
			setIngredients(ingredientsData)
			setFilteredIngredients(ingredientsData)
		} catch (err) {
			setError('Ошибка загрузки ингредиентов')
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleAddIngredient = async () => {
		if (!newIngredientName.trim()) return

		try {
			const newIngredient = await blogAPI.createIngredient({
				name: newIngredientName,
			})
			setIngredients([...ingredients, newIngredient])
			setNewIngredientName('')
		} catch (err) {
			setError('Ошибка при добавлении ингредиента')
			console.error(err)
		}
	}

	const handleDeleteIngredient = async (id: number) => {
		try {
			await blogAPI.deleteIngredient(id)
			setIngredients(ingredients.filter(ing => ing.id !== id))
		} catch (err) {
			setError('Ошибка при удалении ингредиента')
			console.error(err)
		}
	}

	if (isLoading) return <LoadingSpinner />

	return (
		<div className={styles.section}>
			<h2>Управление ингредиентами</h2>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.searchForm}>
				<div className={styles.searchInputWrapper}>
					<span className={styles.searchIcon}>🔍</span>
					<input
						type='text'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						placeholder='Поиск ингредиента'
						className={`${styles.input} ${styles.search}`}
					/>
				</div>
			</div>

			<div className={styles.addForm}>
				<input
					type='text'
					value={newIngredientName}
					onChange={e => setNewIngredientName(e.target.value)}
					placeholder='Название ингредиента'
					className={styles.input}
				/>
				<button onClick={handleAddIngredient} className={styles.button}>
					Добавить
				</button>
			</div>

			<ul className={styles.list}>
				{filteredIngredients.map(ingredient => (
					<li key={ingredient.id} className={styles.listItem}>
						<span>{ingredient.name}</span>
						<button
							onClick={() => handleDeleteIngredient(ingredient.id)}
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
