import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { blogAPI } from '../../../api/blog'
import { Ingredient, Post, PostCreate, Tag } from '../../../api/types'
import formStyles from '../../../pages/CreatePostPage/CreatePostPage.module.css'
import { useBlogStore } from '../../../stores/blogStore'
import modalStyles from './PostEditModal.module.css'

interface PostEditModalProps {
	post: Post
	onClose: () => void
	onSave: (updatedPost: Post) => void
}

interface IngredientInput {
	id?: number
	ingredient: number
	amount: string
	unit: string
	_deleted?: boolean
}

interface StepInput {
	id?: number
	order: number
	description: string
	image?: File | null
	imagePreview?: string | null
	existingImageUrl?: string | null
	_deleted?: boolean
}

const parseQuantity = (q: string): { amount: string; unit: string } => {
	if (!q) return { amount: '', unit: '' }
	const parts = q.trim().split(/\s+/)
	if (parts.length === 1) return { amount: parts[0], unit: '' }
	const unit = parts.pop() || ''
	const amount = parts.join(' ')
	return { amount, unit }
}

export const PostEditModal = ({
	post,
	onClose,
	onSave,
}: PostEditModalProps) => {
	const { tags, ingredients, fetchTags, fetchIngredients } = useBlogStore()

	const [formData, setFormData] = useState<Partial<PostCreate>>({
		post_type: post.post_type,
		title: post.title,
		excerpt: post.excerpt,
		content: post.content,
		calories: post.calories || undefined,
		cooking_time: post.cooking_time || undefined,
		status: (post as any).status || 'draft',
		tag_ids: post.tags?.map(t => t.id) || [],
	})

	const [coverImage, setCoverImage] = useState<File | null>(null)
	const [coverPreview, setCoverPreview] = useState<string | null>(
		(post as any).cover_image || (post as any).cover || null
	)

	const [ingredientsInput, setIngredientsInput] = useState<IngredientInput[]>(
		() => {
			const list = (post as any).ingredients || []
			return list.map((i: any) => {
				const { amount, unit } = parseQuantity(i.quantity)
				return {
					id: i.id,
					ingredient: i.ingredient?.id || 0,
					amount,
					unit,
				}
			})
		}
	)

	const [stepsInput, setStepsInput] = useState<StepInput[]>(() => {
		const steps = (post as any).steps || []
		return steps
			.sort((a: any, b: any) => a.order - b.order)
			.map((s: any) => ({
				id: s.id,
				order: s.order,
				description: s.description,
				image: null,
				imagePreview: s.image_url || s.image || null,
				existingImageUrl: s.image_url || s.image || null,
			}))
	})

	const [localError, setLocalError] = useState('')
	const [isSaving, setIsSaving] = useState(false)

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
		if (!tags.length) fetchTags()
		if (!ingredients.length) fetchIngredients()
	}, [fetchTags, fetchIngredients, tags.length, ingredients.length])

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
			reader.onloadend = () => setCoverPreview(reader.result as string)
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
			const arr = [...prev]
			arr[index] = { ...arr[index], [field]: value }
			return arr
		})
	}

	const removeIngredient = (index: number) => {
		setIngredientsInput(prev => {
			const item = prev[index]
			if (item.id) {
				const copy = [...prev]
				copy[index] = { ...item, _deleted: true }
				return copy
			}
			return prev.filter((_, i) => i !== index)
		})
	}

	const addStep = () => {
		setStepsInput(prev => [
			...prev,
			{
				order: prev.length + 1,
				description: '',
				image: null,
				imagePreview: null,
				existingImageUrl: null,
			},
		])
	}

	const updateStep = (index: number, field: keyof StepInput, value: any) => {
		setStepsInput(prev => {
			const arr = [...prev]
			arr[index] = { ...arr[index], [field]: value }
			return arr
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
			reader.onloadend = () =>
				updateStep(index, 'imagePreview', reader.result as string)
			reader.readAsDataURL(file)
		}
	}

	const removeStep = (index: number) => {
		setStepsInput(prev => {
			const item = prev[index]
			if (item.id) {
				const copy = [...prev]
				copy[index] = { ...item, _deleted: true }
				return copy
			}
			return prev
				.filter((_, i) => i !== index)
				.map((s, i2) => ({ ...s, order: i2 + 1 }))
		})
	}

	const validate = () => {
		if (!formData.title || !formData.excerpt || !formData.content) {
			setLocalError('Заполните обязательные поля.')
			return false
		}
		if (
			formData.post_type === 'recipe' &&
			ingredientsInput.some(i => !i.ingredient || !i.amount)
		) {
			setLocalError('Каждый ингредиент должен иметь значение и количество.')
			return false
		}
		if (
			formData.post_type === 'recipe' &&
			stepsInput.some(s => !s.description)
		) {
			setLocalError('Каждый шаг должен иметь описание.')
			return false
		}
		return true
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setLocalError('')
		if (!validate()) return
		setIsSaving(true)
		try {
			// 1. Базовое обновление (без ингредиентов и шагов)
			await blogAPI.updatePost(post.id, {
				post_type: formData.post_type,
				status: formData.status,
				title: formData.title,
				excerpt: formData.excerpt,
				content: formData.content,
				cover_image: coverImage || undefined,
				calories:
					formData.post_type === 'recipe' ? formData.calories ?? null : null,
				cooking_time:
					formData.post_type === 'recipe'
						? formData.cooking_time ?? null
						: null,
				tag_ids: formData.tag_ids || [],
			})

			if (formData.post_type === 'recipe') {
				// 2. Sync ингредиентов
				const ingredientPayload = ingredientsInput.map(i => ({
					id: i.id,
					ingredient_id: i.ingredient,
					quantity: `${i.amount}${i.unit ? ' ' + i.unit : ''}`.trim(),
					_delete: !!i._deleted,
				}))
				await blogAPI.syncPostIngredients(post.id, ingredientPayload)

				// 3. Sync шагов
				const stepPayload = stepsInput.map(s => ({
					id: s.id,
					order: s.order,
					description: s.description,
					_delete: !!s._deleted,
					image: s.image || undefined,
				}))
				await blogAPI.syncPostSteps(post.id, stepPayload)
			}

			const updated = await blogAPI.getPost(post.id)
			onSave(updated)
			onClose()
		} catch (err) {
			console.error(err)
			setLocalError('Не удалось сохранить изменения.')
		} finally {
			setIsSaving(false)
		}
	}

	// Закрытие по ESC
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [onClose])

	const content = (
		<div
			className={modalStyles.modalOverlay}
			onMouseDown={e => {
				if (e.target === e.currentTarget) onClose()
			}}
			aria-modal='true'
			role='dialog'
		>
			<div
				className={modalStyles.modalContent}
				onMouseDown={e => e.stopPropagation()}
			>
				<button
					type='button'
					className={modalStyles.closeBtn}
					aria-label='Закрыть'
					onClick={onClose}
				>
					✕
				</button>
				{/* ...existing code (контейнер формы) ... */}
				<div
					className={formStyles.container}
					style={{
						margin: 0,
						boxShadow: 'none',
						maxHeight: '90vh',
						overflowY: 'auto',
					}}
				>
					<h1 className={formStyles.title} style={{ fontSize: '1.8rem' }}>
						Редактирование поста
					</h1>
					<form onSubmit={handleSubmit} className={formStyles.form}>
						<div className={formStyles.inputGroup}>
							<label className={formStyles.inputLabel}>Тип поста</label>
							<div className={formStyles.radioGroup}>
								<label
									className={`${formStyles.radioLabel} ${
										formData.post_type === 'recipe' ? formStyles.active : ''
									}`}
								>
									<input
										type='radio'
										name='post_type'
										value='recipe'
										checked={formData.post_type === 'recipe'}
										onChange={handleChange}
										disabled={isSaving}
									/>
									<span className={formStyles.radioCircle}></span>
									Рецепт
								</label>
								<label
									className={`${formStyles.radioLabel} ${
										formData.post_type === 'article' ? formStyles.active : ''
									}`}
								>
									<input
										type='radio'
										name='post_type'
										value='article'
										checked={formData.post_type === 'article'}
										onChange={handleChange}
										disabled={isSaving}
									/>
									<span className={formStyles.radioCircle}></span>
									Статья
								</label>
							</div>
						</div>

						<div className={formStyles.inputGroup}>
							<label className={formStyles.inputLabel}>Заголовок</label>
							<input
								type='text'
								name='title'
								value={formData.title}
								onChange={handleChange}
								className={formStyles.input}
								disabled={isSaving}
								required
							/>
						</div>

						<div className={formStyles.inputGroup}>
							<label className={formStyles.inputLabel}>Краткое описание</label>
							<textarea
								name='excerpt'
								value={formData.excerpt}
								onChange={handleChange}
								className={formStyles.textarea}
								disabled={isSaving}
								required
							/>
						</div>

						<div className={formStyles.inputGroup}>
							<label className={formStyles.inputLabel}>Основной контент</label>
							<textarea
								name='content'
								value={formData.content}
								onChange={handleChange}
								className={formStyles.textarea}
								disabled={isSaving}
								required
							/>
						</div>

						<div className={formStyles.inputGroup}>
							<label className={formStyles.inputLabel}>Обложка поста</label>
							<div className={formStyles.coverUpload}>
								<label className={formStyles.coverLabel}>
									<input
										type='file'
										accept='image/*'
										onChange={handleCoverImageChange}
										className={formStyles.coverInput}
										disabled={isSaving}
									/>
									<div
										className={`${formStyles.coverWrapper} ${
											coverPreview ? formStyles.loaded : ''
										}`}
									>
										<img
											src={coverPreview || '/empty-post.png'}
											alt='Обложка'
											className={formStyles.cover}
											onError={e => {
												;(e.target as HTMLImageElement).src = '/empty-post.png'
											}}
										/>
										<div className={formStyles.coverOverlay}>
											{isSaving ? (
												<span className={formStyles.spinner}></span>
											) : (
												<span className={formStyles.coverEditText}>
													Загрузить
												</span>
											)}
										</div>
									</div>
								</label>
							</div>
						</div>

						<div className={formStyles.inputGroup}>
							<label className={formStyles.inputLabel}>Теги</label>
							<div className={formStyles.tagList}>
								{tags.map((tag: Tag) => (
									<label
										key={tag.id}
										className={`${formStyles.tagItem} ${
											formData.tag_ids?.includes(tag.id)
												? formStyles.selected
												: ''
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
											disabled={isSaving}
										/>
										{tag.name}
									</label>
								))}
							</div>
						</div>

						{formData.post_type === 'recipe' && (
							<>
								<div className={formStyles.inputGroup}>
									<label className={formStyles.inputLabel}>Ингредиенты</label>
									{ingredientsInput.map((ing, idx) => (
										<div key={idx} className={formStyles.ingredientRow}>
											<div className={formStyles.selectWrapper}>
												<select
													value={ing.ingredient}
													onChange={e =>
														updateIngredient(
															idx,
															'ingredient',
															Number(e.target.value)
														)
													}
													className={formStyles.input}
													disabled={isSaving}
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
													updateIngredient(idx, 'amount', e.target.value)
												}
												placeholder='Количество'
												className={formStyles.input}
												disabled={isSaving}
											/>
											<div className={formStyles.selectWrapper}>
												<select
													value={ing.unit}
													onChange={e =>
														updateIngredient(idx, 'unit', e.target.value)
													}
													className={formStyles.input}
													disabled={isSaving}
												>
													{units.map(u => (
														<option key={u} value={u}>
															{u || 'Без единицы'}
														</option>
													))}
												</select>
											</div>
											<button
												type='button'
												onClick={() => removeIngredient(idx)}
												className={formStyles.removeButton}
												disabled={isSaving}
											>
												Удалить
											</button>
										</div>
									))}
									<button
										type='button'
										onClick={addIngredient}
										className={`${formStyles.button} ${formStyles.secondary}`}
										disabled={isSaving}
									>
										Добавить ингредиент
									</button>
								</div>

								<div className={formStyles.inputGroup}>
									<label className={formStyles.inputLabel}>Шаги рецепта</label>
									{stepsInput.map((step, idx) => (
										<div key={idx} className={formStyles.stepRow}>
											<span className={formStyles.stepOrder}>
												Шаг {step.order}
											</span>
											<textarea
												value={step.description}
												onChange={e =>
													updateStep(idx, 'description', e.target.value)
												}
												placeholder={`Описание шага ${idx + 1}`}
												className={formStyles.textarea}
												disabled={isSaving}
												required
											/>
											<div className={formStyles.stepImage}>
												<label className={formStyles.coverLabel}>
													<input
														type='file'
														accept='image/*'
														onChange={e => handleStepImageChange(idx, e)}
														className={formStyles.coverInput}
														disabled={isSaving}
													/>
													<div
														className={`${formStyles.stepImageWrapper} ${
															step.imagePreview || step.existingImageUrl
																? formStyles.loaded
																: ''
														}`}
													>
														<img
															src={
																step.imagePreview ||
																step.existingImageUrl ||
																'/default-avatar.png'
															}
															alt={`Шаг ${idx + 1}`}
															className={formStyles.cover}
															onError={e => {
																;(e.target as HTMLImageElement).src =
																	'/default-avatar.png'
															}}
														/>
														<div className={formStyles.coverOverlay}>
															{isSaving ? (
																<span className={formStyles.spinner}></span>
															) : (
																<span className={formStyles.coverEditText}>
																	Загрузить изображение
																</span>
															)}
														</div>
													</div>
												</label>
											</div>
											<button
												type='button'
												onClick={() => removeStep(idx)}
												className={formStyles.removeButton}
												disabled={isSaving}
											>
												Удалить
											</button>
										</div>
									))}
									<button
										type='button'
										onClick={addStep}
										className={`${formStyles.button} ${formStyles.secondary}`}
										disabled={isSaving}
									>
										Добавить шаг
									</button>
								</div>

								<div className={formStyles.inputGroup}>
									<label className={formStyles.inputLabel}>Калории</label>
									<input
										type='number'
										name='calories'
										value={formData.calories || ''}
										onChange={handleChange}
										className={formStyles.input}
										disabled={isSaving}
										min='0'
									/>
								</div>

								<div className={formStyles.inputGroup}>
									<label className={formStyles.inputLabel}>
										Время приготовления (мин)
									</label>
									<input
										type='number'
										name='cooking_time'
										value={formData.cooking_time || ''}
										onChange={handleChange}
										className={formStyles.input}
										disabled={isSaving}
										min='0'
									/>
								</div>
							</>
						)}

						<div className={formStyles.inputGroup}>
							<label className={formStyles.inputLabel}>Статус</label>
							<div className={formStyles.selectWrapper}>
								<select
									name='status'
									value={formData.status}
									onChange={handleChange}
									className={formStyles.input}
									disabled={isSaving}
								>
									<option value='draft'>Черновик</option>
									<option value='published'>Опубликовано</option>
									<option value='archived'>Архивировано</option>
								</select>
							</div>
						</div>

						{localError && <div className={formStyles.error}>{localError}</div>}

						<div
							style={{
								display: 'flex',
								gap: '1rem',
								justifyContent: 'flex-end',
							}}
						>
							<button
								type='button'
								onClick={onClose}
								className={`${formStyles.button} ${formStyles.secondary}`}
								disabled={isSaving}
							>
								Отмена
							</button>
							<button
								type='submit'
								className={`${formStyles.button} ${formStyles.primary}`}
								disabled={isSaving}
							>
								{isSaving ? (
									<span className={formStyles.spinner}></span>
								) : (
									'Сохранить'
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)

	return createPortal(content, document.body)
}
