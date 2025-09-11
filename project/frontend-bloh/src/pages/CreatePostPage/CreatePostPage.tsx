import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ingredient, PostCreate, Tag } from '../../api/types'
import { useAuthStore } from '../../stores/authStore'
import { useBlogStore } from '../../stores/blogStore'
import styles from './CreatePostPage.module.css'

interface IngredientInput {
	ingredient: number
	amount: string
	unit: string
}

interface StepInput {
	order: number
	description: string
	image?: File | null
	imagePreview?: string | null
}

export const CreatePostPage = () => {
	const { user } = useAuthStore()
	const {
		tags,
		ingredients,
		fetchTags,
		fetchIngredients,
		createPost,
		loading,
		error,
	} = useBlogStore()
	const navigate = useNavigate()

	const [formData, setFormData] = useState<Partial<PostCreate>>({
		post_type: 'recipe',
		title: '',
		excerpt: '',
		content: '',
		calories: undefined,
		cooking_time: undefined,
		status: 'draft',
		tag_ids: [],
		ingredient_data: [],
		step_data: [],
	})
	const [coverImage, setCoverImage] = useState<File | null>(null)
	const [coverPreview, setCoverPreview] = useState<string | null>(null)
	const [ingredientsInput, setIngredientsInput] = useState<IngredientInput[]>(
		[]
	)
	const [stepsInput, setStepsInput] = useState<StepInput[]>([])
	const [localError, setLocalError] = useState<string>('')

	const units = [
		'г',
		'кг',
		'мл',
		'л',
		'шт',
		'ч.л.',
		'ст.л.',
		'стакан',
		'по вкусу',
		'',
	]

	useEffect(() => {
		fetchTags()
		fetchIngredients()
	}, [fetchTags, fetchIngredients])

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
		const id = Number(e.target.value)
		setFormData(prev => ({
			...prev,
			tag_ids: e.target.checked
				? [...(prev.tag_ids || []), id]
				: (prev.tag_ids || []).filter(t => t !== id),
		}))
	}

	const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setCoverImage(file)
			const reader = new FileReader()
			reader.onloadend = () => {
				setCoverPreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const addIngredient = () => {
		setIngredientsInput(prev => [
			...prev,
			{ ingredient: 0, amount: '', unit: '' },
		])
	}

	const updateIngredient = (
		index: number,
		field: keyof IngredientInput,
		value: string | number
	) => {
		setIngredientsInput(prev => {
			const updated = [...prev]
			updated[index] = { ...updated[index], [field]: value }
			return updated
		})
	}

	const removeIngredient = (index: number) => {
		setIngredientsInput(prev => prev.filter((_, i) => i !== index))
	}

	const addStep = () => {
		setStepsInput(prev => [
			...prev,
			{
				order: prev.length + 1,
				description: '',
				image: null,
				imagePreview: null,
			},
		])
	}

	const updateStep = (
		index: number,
		field: keyof StepInput,
		value: string | File | null
	) => {
		setStepsInput(prev => {
			const updated = [...prev]
			updated[index] = { ...updated[index], [field]: value }
			return updated
		})
	}

	const handleStepImageChange = (
		index: number,
		e: ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0]
		if (file) {
			updateStep(index, 'image', file)
			const reader = new FileReader()
			reader.onloadend = () => {
				updateStep(index, 'imagePreview', reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const removeStep = (index: number) => {
		setStepsInput(prev =>
			prev
				.filter((_, i) => i !== index)
				.map((step, i) => ({ ...step, order: i + 1 }))
		)
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setLocalError('')

		if (!formData.title || !formData.excerpt || !formData.content) {
			setLocalError('Заполните все обязательные поля.')
			return
		}

		if (
			formData.post_type === 'recipe' &&
			ingredientsInput.some(ing => !ing.ingredient || !ing.amount)
		) {
			setLocalError(
				'Все ингредиенты должны иметь выбранный ингредиент и количество.'
			)
			return
		}

		if (
			formData.post_type === 'recipe' &&
			stepsInput.some(step => !step.description)
		) {
			setLocalError('Все шаги рецепта должны иметь описание.')
			return
		}

		try {
			const postData: PostCreate = {
				post_type: formData.post_type || 'recipe',
				status: formData.status || 'draft',
				title: formData.title || '',
				excerpt: formData.excerpt || '',
				content: formData.content || '',
				cover_image: coverImage,
				tag_ids: formData.tag_ids || [],
				ingredient_data: ingredientsInput.map(ing => ({
					ingredient_id: ing.ingredient,
					quantity: `${ing.amount}${ing.unit ? ' ' + ing.unit : ''}`.trim(),
				})),
				step_data: stepsInput.map(step => ({
					order: step.order,
					description: step.description,
					image: step.image || undefined,
				})),
				calories: formData.calories ? Number(formData.calories) : null,
				cooking_time: formData.cooking_time
					? Number(formData.cooking_time)
					: null,
			}

			// Создание поста и немедленная навигация на страницу поста
			const created = await createPost(postData)
			if (created?.id) {
				// Переходим только если опубликован
				if (created.status === 'published') {
					navigate(`/posts/${created.id}`)
				}
				// Если черновик — остаёмся на странице (по требованию "ничего не делать")
			}
		} catch (err) {
			setLocalError('Не удалось создать пост. Попробуйте снова.')
		}
	}

	if (!user) {
		return <div className={styles.loading}>Загрузка данных пользователя...</div>
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Создание нового поста</h1>

			<form onSubmit={handleSubmit} className={styles.form}>
				{/* Тип поста - радио кнопки */}
				<div className={styles.inputGroup}>
					<label className={styles.inputLabel}>Тип поста</label>
					<div className={styles.radioGroup}>
						<label
							className={`${styles.radioLabel} ${
								formData.post_type === 'recipe' ? styles.active : ''
							}`}
						>
							<input
								type='radio'
								name='post_type'
								value='recipe'
								checked={formData.post_type === 'recipe'}
								onChange={handleChange}
								disabled={loading}
							/>
							<span className={styles.radioCircle}></span>
							Рецепт
						</label>
						<label
							className={`${styles.radioLabel} ${
								formData.post_type === 'article' ? styles.active : ''
							}`}
						>
							<input
								type='radio'
								name='post_type'
								value='article'
								checked={formData.post_type === 'article'}
								onChange={handleChange}
								disabled={loading}
							/>
							<span className={styles.radioCircle}></span>
							Статья
						</label>
					</div>
				</div>

				{/* Заголовок */}
				<div className={styles.inputGroup}>
					<label className={styles.inputLabel}>Заголовок</label>
					<input
						type='text'
						name='title'
						value={formData.title}
						onChange={handleChange}
						placeholder='Введите заголовок поста'
						className={styles.input}
						disabled={loading}
						required
					/>
				</div>

				{/* Краткое описание */}
				<div className={styles.inputGroup}>
					<label className={styles.inputLabel}>Краткое описание</label>
					<textarea
						name='excerpt'
						value={formData.excerpt}
						onChange={handleChange}
						placeholder='Введите краткое описание поста'
						className={styles.textarea}
						disabled={loading}
						required
					/>
				</div>

				{/* Основной контент */}
				<div className={styles.inputGroup}>
					<label className={styles.inputLabel}>Основной контент</label>
					<textarea
						name='content'
						value={formData.content}
						onChange={handleChange}
						placeholder='Введите содержание поста'
						className={styles.textarea}
						disabled={loading}
						required
					/>
				</div>

				{/* Обложка */}
				<div className={styles.inputGroup}>
					<label className={styles.inputLabel}>Обложка поста</label>
					<div className={styles.coverUpload}>
						<label className={styles.coverLabel}>
							<input
								type='file'
								accept='image/*'
								onChange={handleCoverImageChange}
								className={styles.coverInput}
								disabled={loading}
							/>
							<div
								className={`${styles.coverWrapper} ${
									coverPreview ? styles.loaded : ''
								}`}
							>
								<img
									src={coverPreview || '/empty-post.png'}
									alt='Обложка'
									className={styles.cover}
									onError={e => {
										;(e.target as HTMLImageElement).src = '/empty-post.png'
									}}
								/>
								<div className={styles.coverOverlay}>
									{loading ? (
										<span className={styles.spinner}></span>
									) : (
										<span className={styles.coverEditText}>Загрузить</span>
									)}
								</div>
							</div>
						</label>
					</div>
				</div>

				{/* Теги */}
				<div className={styles.inputGroup}>
					<label className={styles.inputLabel}>Теги</label>
					<div className={styles.tagList}>
						{tags.map((tag: Tag) => (
							<label
								key={tag.id}
								className={`${styles.tagItem} ${
									formData.tag_ids?.includes(tag.id) ? styles.selected : ''
								}`}
								style={{
									backgroundColor: tag.color || 'transparent',
									color: tag.color ? '#fff' : 'inherit',
								}}
							>
								<input
									type='checkbox'
									value={tag.id}
									checked={formData.tag_ids?.includes(tag.id)}
									onChange={handleTagChange}
									disabled={loading}
								/>
								{tag.name}
							</label>
						))}
					</div>
				</div>

				{/* Ингредиенты (только для рецепта) */}
				{formData.post_type === 'recipe' && (
					<>
						<div className={styles.inputGroup}>
							<label className={styles.inputLabel}>Ингредиенты</label>
							{ingredientsInput.map((ing, index) => (
								<div key={index} className={styles.ingredientRow}>
									<div className={styles.selectWrapper}>
										<select
											value={ing.ingredient}
											onChange={e =>
												updateIngredient(index, 'ingredient', e.target.value)
											}
											className={styles.input}
											disabled={loading}
										>
											<option value=''>Выберите ингредиент</option>
											{ingredients.map((item: Ingredient) => (
												<option key={item.id} value={item.id}>
													{item.name}
												</option>
											))}
										</select>
									</div>
									<input
										type='text'
										value={ing.amount}
										onChange={e =>
											updateIngredient(index, 'amount', e.target.value)
										}
										placeholder='Количество'
										className={styles.input}
										disabled={loading}
									/>
									<div className={styles.selectWrapper}>
										<select
											value={ing.unit}
											onChange={e =>
												updateIngredient(index, 'unit', e.target.value)
											}
											className={styles.input}
											disabled={loading}
										>
											{units.map(unit => (
												<option key={unit} value={unit}>
													{unit || 'Без единицы'}
												</option>
											))}
										</select>
									</div>
									<button
										type='button'
										onClick={() => removeIngredient(index)}
										className={styles.removeButton}
										disabled={loading}
									>
										Удалить
									</button>
								</div>
							))}
							<button
								type='button'
								onClick={addIngredient}
								className={`${styles.button} ${styles.secondary}`}
								disabled={loading}
							>
								Добавить ингредиент
							</button>
						</div>

						{/* Шаги рецепта */}
						<div className={styles.inputGroup}>
							<label className={styles.inputLabel}>Шаги рецепта</label>
							{stepsInput.map((step, index) => (
								<div key={index} className={styles.stepRow}>
									<span className={styles.stepOrder}>Шаг {step.order}</span>
									<textarea
										value={step.description}
										onChange={e =>
											updateStep(index, 'description', e.target.value)
										}
										placeholder={`Описание шага ${index + 1}`}
										className={styles.textarea}
										disabled={loading}
										required
									/>
									<div className={styles.stepImage}>
										<label className={styles.coverLabel}>
											<input
												type='file'
												accept='image/*'
												onChange={e => handleStepImageChange(index, e)}
												className={styles.coverInput}
												disabled={loading}
											/>
											<div
												className={`${styles.stepImageWrapper} ${
													step.imagePreview ? styles.loaded : ''
												}`}
											>
												<img
													src={step.imagePreview || '/default-avatar.png'}
													alt={`Шаг ${index + 1}`}
													className={styles.cover}
													onError={e => {
														;(e.target as HTMLImageElement).src =
															'/default-avatar.png'
													}}
												/>
												<div className={styles.coverOverlay}>
													{loading ? (
														<span className={styles.spinner}></span>
													) : (
														<span className={styles.coverEditText}>
															Загрузить изображение
														</span>
													)}
												</div>
											</div>
										</label>
									</div>
									<button
										type='button'
										onClick={() => removeStep(index)}
										className={styles.removeButton}
										disabled={loading}
									>
										Удалить
									</button>
								</div>
							))}
							<button
								type='button'
								onClick={addStep}
								className={`${styles.button} ${styles.secondary}`}
								disabled={loading}
							>
								Добавить шаг
							</button>
						</div>

						{/* Калории и время приготовления */}
						<div className={styles.inputGroup}>
							<label className={styles.inputLabel}>Калории</label>
							<input
								type='number'
								name='calories'
								value={formData.calories || ''}
								onChange={handleChange}
								placeholder='Калории'
								className={styles.input}
								disabled={loading}
								min='0'
							/>
						</div>
						<div className={styles.inputGroup}>
							<label className={styles.inputLabel}>
								Время приготовления (мин)
							</label>
							<input
								type='number'
								name='cooking_time'
								value={formData.cooking_time || ''}
								onChange={handleChange}
								placeholder='Время приготовления'
								className={styles.input}
								disabled={loading}
								min='0'
							/>
						</div>
					</>
				)}

				{/* Статус */}
				<div className={styles.inputGroup}>
					<label className={styles.inputLabel}>Статус</label>
					<div className={styles.selectWrapper}>
						<select
							name='status'
							value={formData.status}
							onChange={handleChange}
							className={styles.input}
							disabled={loading}
						>
							<option value='draft'>Черновик</option>
							<option value='published'>Опубликовано</option>
							<option value='archived'>Архивировано</option>
						</select>
					</div>
				</div>

				{(error || localError) && (
					<div className={styles.error}>{error || localError}</div>
				)}

				<div className={styles.buttons}>
					<button
						type='submit'
						className={`${styles.button} ${styles.primary}`}
						disabled={loading}
					>
						{loading ? (
							<span className={styles.spinner}></span>
						) : (
							'Создать пост'
						)}
					</button>
				</div>
			</form>
		</div>
	)
}
