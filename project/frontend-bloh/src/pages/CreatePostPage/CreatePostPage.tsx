import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Footer } from '../../components/Footer/Footer'
import { Header } from '../../components/Heared/Header'
import { useCreatePostMutation } from '../../services/postApi'
import { useGetTagsQuery } from '../../services/tagApi'
import { Tag } from '../../types/post.types'
import styles from './CreatePostPage.module.css'

export const CreatePostPage: React.FC = () => {
  const [postType, setPostType] = useState<'recipe' | 'article'>('recipe')
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }])
  const [recipeSteps, setRecipeSteps] = useState<
    { description: string; image: File | null }[]
  >([{ description: '', image: null }])
  const [calories, setCalories] = useState<number | ''>('')
  const [cookingTime, setCookingTime] = useState<number | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: tags = [], isLoading: isTagsLoading } = useGetTagsQuery()
  const [createPost] = useCreatePostMutation()
  const navigate = useNavigate()

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }])
  }

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return
    const newIngredients = [...ingredients]
    newIngredients.splice(index, 1)
    setIngredients(newIngredients)
  }

  const handleAddStep = () => {
    setRecipeSteps([...recipeSteps, { description: '', image: null }])
  }

  const handleRemoveStep = (index: number) => {
    if (recipeSteps.length <= 1) return
    const newSteps = [...recipeSteps]
    newSteps.splice(index, 1)
    setRecipeSteps(newSteps)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('excerpt', excerpt.trim())
      formData.append('content', content.trim())
      formData.append('post_type', postType)

      if (coverImage) {
        formData.append('cover_image', coverImage)
      }

      selectedTags.forEach(tagId => {
        formData.append('tags', tagId.toString())
      })

      if (postType === 'recipe') {
        // Валидация ингредиентов
        const hasEmptyIngredients = ingredients.some(
          ing => !ing.name.trim() || !ing.quantity.trim()
        )
        if (hasEmptyIngredients) {
          throw new Error('Заполните все поля ингредиентов')
        }

        ingredients.forEach((ingredient, index) => {
          formData.append(`ingredients[${index}][name]`, ingredient.name.trim())
          formData.append(`ingredients[${index}][quantity]`, ingredient.quantity.trim())
        })

        // Валидация шагов
        const hasEmptySteps = recipeSteps.some(step => !step.description.trim())
        if (hasEmptySteps) {
          throw new Error('Заполните описания всех шагов')
        }

        recipeSteps.forEach((step, index) => {
          formData.append(`recipe_steps[${index}][description]`, step.description.trim())
          if (step.image) {
            formData.append(`recipe_steps[${index}][image]`, step.image)
          }
        })

        if (calories !== '') {
          formData.append('calories', calories.toString())
        }

        if (cookingTime !== '') {
          formData.append('cooking_time', cookingTime.toString())
        }
      }

      const response = await createPost(formData).unwrap()
      navigate(`/posts/${response.id}`)
    } catch (err) {
      console.error('Ошибка при создании поста:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при создании поста'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isTagsLoading) {
    return <div>Загрузка тегов...</div>
  }

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Создать новый пост</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Поле выбора типа поста */}
          <div className={styles.formGroup}>
            <label>Тип поста</label>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type='radio'
                  value='recipe'
                  checked={postType === 'recipe'}
                  onChange={() => setPostType('recipe')}
                />
                Рецепт
              </label>
              <label>
                <input
                  type='radio'
                  value='article'
                  checked={postType === 'article'}
                  onChange={() => setPostType('article')}
                />
                Статья
              </label>
            </div>
          </div>

          {/* Основные поля */}
          <div className={styles.formGroup}>
            <label htmlFor='title'>Заголовок*</label>
            <input
              type='text'
              id='title'
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              minLength={5}
              maxLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='excerpt'>Краткое описание*</label>
            <textarea
              id='excerpt'
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              required
              rows={3}
              minLength={20}
              maxLength={200}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='content'>Содержание*</label>
            <textarea
              id='content'
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={10}
              minLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='cover_image'>Обложка</label>
            <input
              type='file'
              id='cover_image'
              accept='image/*'
              onChange={e => setCoverImage(e.target.files?.[0] || null)}
            />
          </div>

          {/* Теги */}
          <div className={styles.formGroup}>
            <label>Теги</label>
            <div className={styles.tagsContainer}>
              {tags.map((tag: Tag) => (
                <div key={tag.id} className={styles.tagItem}>
                  <input
                    type='checkbox'
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag.id)
                          ? prev.filter(id => id !== tag.id)
                          : [...prev, tag.id]
                      )
                    }}
                  />
                  <label htmlFor={`tag-${tag.id}`}>{tag.name}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Поля для рецепта */}
          {postType === 'recipe' && (
            <>
              <div className={styles.section}>
                <h3>Ингредиенты*</h3>
                {ingredients.map((ingredient, index) => (
                  <div key={index} className={styles.ingredientRow}>
                    <input
                      type='text'
                      placeholder='Название*'
                      value={ingredient.name}
                      onChange={e => {
                        const newIngredients = [...ingredients]
                        newIngredients[index].name = e.target.value
                        setIngredients(newIngredients)
                      }}
                      required
                    />
                    <input
                      type='text'
                      placeholder='Количество*'
                      value={ingredient.quantity}
                      onChange={e => {
                        const newIngredients = [...ingredients]
                        newIngredients[index].quantity = e.target.value
                        setIngredients(newIngredients)
                      }}
                      required
                    />
                    <button
                      type='button'
                      onClick={() => handleRemoveIngredient(index)}
                      className={styles.removeButton}
                      disabled={ingredients.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={handleAddIngredient}
                  className={styles.addButton}
                >
                  + Добавить ингредиент
                </button>
              </div>

              <div className={styles.section}>
                <h3>Шаги приготовления*</h3>
                {recipeSteps.map((step, index) => (
                  <div key={index} className={styles.stepRow}>
                    <h4>Шаг {index + 1}</h4>
                    <textarea
                      value={step.description}
                      onChange={e => {
                        const newSteps = [...recipeSteps]
                        newSteps[index].description = e.target.value
                        setRecipeSteps(newSteps)
                      }}
                      required
                      rows={3}
                    />
                    <div className={styles.stepImage}>
                      <label>Изображение шага (опционально)</label>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={e =>
                          setRecipeSteps(prev => {
                            const newSteps = [...prev]
                            newSteps[index].image = e.target.files?.[0] || null
                            return newSteps
                          })
                        }
                      />
                    </div>
                    <button
                      type='button'
                      onClick={() => handleRemoveStep(index)}
                      className={styles.removeButton}
                      disabled={recipeSteps.length <= 1}
                    >
                      × Удалить шаг
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={handleAddStep}
                  className={styles.addButton}
                >
                  + Добавить шаг
                </button>
              </div>

              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label htmlFor='calories'>Калории</label>
                  <input
                    type='number'
                    id='calories'
                    value={calories}
                    onChange={e =>
                      setCalories(
                        e.target.value ? parseInt(e.target.value) : ''
                      )
                    }
                    min={0}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor='cooking_time'>
                    Время приготовления (мин)
                  </label>
                  <input
                    type='number'
                    id='cooking_time'
                    value={cookingTime}
                    onChange={e =>
                      setCookingTime(
                        e.target.value ? parseInt(e.target.value) : ''
                      )
                    }
                    min={0}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type='submit'
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Создание...' : 'Создать пост'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  )
}