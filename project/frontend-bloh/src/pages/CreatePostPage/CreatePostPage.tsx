import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Footer } from '../../components/Footer/Footer'
import { Header } from '../../components/Heared/Header'
import { useCreatePostMutation } from '../../services/postApi'
import { useAuthStore } from '../../store/authStore'
import {
	Ingredient,
	IngredientList,
} from './ComponentsForCreatePost/IngredientList'
import {
	RecipeStep,
	RecipeStepList,
} from './ComponentsForCreatePost/RecipeStepList'
import { RichTextEditor } from './ComponentsForCreatePost/RichTextEditor'
import { Tag, TagSelector } from './ComponentsForCreatePost/TagSelector'
import styles from './CreatePostPage.module.css'

export const CreatePostPage = () => {
	const { user } = useAuthStore()
	const navigate = useNavigate()
	const [createPost, { isLoading }] = useCreatePostMutation()

	const [title, setTitle] = useState('')
	const [excerpt, setExcerpt] = useState('')
	const [coverImage, setCoverImage] = useState('')
	const [content, setContent] = useState('')
	const [tags, setTags] = useState<Tag[]>([])
	const [ingredients, setIngredients] = useState<Ingredient[]>([])
	const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([])
	const [calories, setCalories] = useState('')
	const [cookingTime, setCookingTime] = useState('')

	const handleSubmit = async () => {
		if (!user) return alert('Вы не авторизованы')

		const formData = new FormData()
		formData.append('title', title)
		formData.append('excerpt', excerpt)
		formData.append('content', content)
		formData.append('cover_image', coverImage)
		formData.append('calories', calories)
		formData.append('cooking_time', cookingTime)

		// Теги (id)
		tags.forEach(tag => formData.append('tags', String(tag.id)))

		// Ингредиенты
		ingredients.forEach((ingredient, i) => {
			formData.append(`ingredients[${i}][name]`, ingredient.name)
			formData.append(`ingredients[${i}][quantity]`, ingredient.quantity)
		})

		// Шаги рецепта
		recipeSteps.forEach((step, i) => {
			formData.append(`recipe_steps[${i}][order]`, String(step.order))
			formData.append(`recipe_steps[${i}][description]`, step.description)
			if (step.image) formData.append(`recipe_steps[${i}][image]`, step.image)
		})

		try {
			const result = await createPost(formData).unwrap()
			navigate(`/posts/${result.id}`)
		} catch (error) {
			console.error('Ошибка при создании поста', error)
			alert('Ошибка при создании поста')
		}
	}

	return (
		<div>
			<Header />
			<div className={styles.container}>
				<h1>Создание поста</h1>

				<input
					type='text'
					placeholder='Заголовок'
					value={title}
					onChange={e => setTitle(e.target.value)}
					className={styles.input}
				/>

				<input
					type='text'
					placeholder='Краткое описание (excerpt)'
					value={excerpt}
					onChange={e => setExcerpt(e.target.value)}
					className={styles.input}
				/>

				<input
					type='text'
					placeholder='URL обложки'
					value={coverImage}
					onChange={e => setCoverImage(e.target.value)}
					className={styles.input}
				/>

				<div className={styles.row}>
					<input
						type='number'
						placeholder='Калории (ккал)'
						value={calories}
						onChange={e => setCalories(e.target.value)}
						className={styles.input}
					/>
					<input
						type='number'
						placeholder='Время приготовления (мин)'
						value={cookingTime}
						onChange={e => setCookingTime(e.target.value)}
						className={styles.input}
					/>
				</div>

				<TagSelector selectedTags={tags} onChange={setTags} />
				<IngredientList ingredients={ingredients} onChange={setIngredients} />
				<RecipeStepList steps={recipeSteps} onChange={setRecipeSteps} />

				<div className={styles.editorWrapper}>
					<RichTextEditor value={content} onChange={setContent} />
				</div>

				<button
					onClick={handleSubmit}
					className={styles.submitButton}
					disabled={isLoading}
				>
					{isLoading ? 'Создание...' : 'Создать пост'}
				</button>
			</div>
			<Footer />
		</div>
	)
}
