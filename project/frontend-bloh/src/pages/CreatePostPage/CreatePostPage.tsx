import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { blogAPI } from '../../api/blog'
import { Tag, Ingredient, RecipeStep, PostCreate } from '../../api/types'
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'
import { Header } from '../../components/Heared/Header'
import { Footer } from '../../components/Footer/Footer'
import styles from './CreatePostPage.module.css'

export const CreatePostPage = () => {
  const navigate = useNavigate()
  const [postType, setPostType] = useState<'recipe' | 'article'>('recipe')
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([])
  const [calories, setCalories] = useState<number | null>(null)
  const [cookingTime, setCookingTime] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Загрузка необходимых данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, ingredientsRes, stepsRes] = await Promise.all([
          blogAPI.getTags(),
          blogAPI.getIngredients(),
          blogAPI.getRecipeSteps()
        ])
        
        setTags(tagsRes.results || tagsRes)
        setIngredients(ingredientsRes.results || ingredientsRes)
        setRecipeSteps(stepsRes.results || stepsRes)
      } catch (err) {
        setError('Ошибка загрузки данных')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const postData: PostCreate = {
        post_type: postType,
        title,
        excerpt,
        content,
        cover_image: coverImage || undefined,
        tag_ids: selectedTagIds,
        ingredient_data: ingredients.map(ing => ({
          ingredient: ing.id,
          quantity: '1' // Здесь можно добавить поле для количества
        })),
        recipe_step_ids: recipeSteps.map(step => step.id),
        calories: calories || undefined,
        cooking_time: cookingTime || undefined
      }

      const createdPost = await blogAPI.createPost(postData)
      navigate(`/posts/${createdPost.id}`)
    } catch (err) {
      setError('Ошибка при создании поста')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullPage />
  }

  return (
    <div className={styles.page}>
      
      <main className={styles.container}>
        <h1 className={styles.title}>Создать новый пост</h1>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Тип поста */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Тип контента</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="recipe"
                  checked={postType === 'recipe'}
                  onChange={() => setPostType('recipe')}
                  className={styles.radioInput}
                />
                <span className={styles.radioCustom}></span>
                Рецепт
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="article"
                  checked={postType === 'article'}
                  onChange={() => setPostType('article')}
                  className={styles.radioInput}
                />
                <span className={styles.radioCustom}></span>
                Статья
              </label>
            </div>
          </div>

          {/* Основная информация */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Основная информация</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Заголовок*
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                required
                minLength={5}
                maxLength={100}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="excerpt" className={styles.label}>
                Краткое описание*
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className={styles.textarea}
                rows={3}
                required
                minLength={20}
                maxLength={200}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="content" className={styles.label}>
                Содержание*
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.textarea}
                rows={10}
                required
                minLength={100}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cover_image" className={styles.label}>
                Обложка
              </label>
              <input
                id="cover_image"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                className={styles.fileInput}
              />
            </div>
          </div>

          {/* Теги */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Теги</h2>
            <div className={styles.tagsContainer}>
              {tags.map(tag => (
                <label key={tag.id} className={styles.tagItem}>
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => {
                      setSelectedTagIds(prev =>
                        prev.includes(tag.id)
                          ? prev.filter(id => id !== tag.id)
                          : [...prev, tag.id]
                      )
                    }}
                    className={styles.tagCheckbox}
                  />
                  <span 
                    className={styles.tagLabel}
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Специфичные для рецепта поля */}
          {postType === 'recipe' && (
            <>
              {/* Ингредиенты */}
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Ингредиенты</h2>
                <div className={styles.ingredientsList}>
                  {ingredients.map(ingredient => (
                    <label key={ingredient.id} className={styles.ingredientItem}>
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(ingredient.id)}
                        onChange={() => {
                          setSelectedTagIds(prev =>
                            prev.includes(ingredient.id)
                              ? prev.filter(id => id !== ingredient.id)
                              : [...prev, ingredient.id]
                          )
                        }}
                      />
                      {ingredient.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Шаги приготовления */}
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Шаги приготовления</h2>
                <div className={styles.stepsList}>
                  {recipeSteps.map((step, index) => (
                    <div key={step.id} className={styles.stepItem}>
                      <h3>Шаг {index + 1}</h3>
                      <p>{step.description}</p>
                      {step.image && (
                        <img 
                          src={step.image} 
                          alt={`Шаг ${index + 1}`} 
                          className={styles.stepImage}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Дополнительно</h2>
                <div className={styles.gridRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="calories" className={styles.label}>
                      Калории
                    </label>
                    <input
                      id="calories"
                      type="number"
                      value={calories || ''}
                      onChange={(e) => 
                        setCalories(e.target.value ? parseInt(e.target.value) : null)
                      }
                      className={styles.input}
                      min={0}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cooking_time" className={styles.label}>
                      Время приготовления (мин)
                    </label>
                    <input
                      id="cooking_time"
                      type="number"
                      value={cookingTime || ''}
                      onChange={(e) => 
                        setCookingTime(e.target.value ? parseInt(e.target.value) : null)
                      }
                      className={styles.input}
                      min={0}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Кнопка отправки */}
          <div className={styles.submitSection}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать пост'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}