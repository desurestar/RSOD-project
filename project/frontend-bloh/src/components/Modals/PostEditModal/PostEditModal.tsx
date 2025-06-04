import { useState, useEffect } from 'react'
import { blogAPI } from '../../../api/blog'
import { Post, PostCreate, Tag } from '../../../api/types'
import styles from './PostEditModal.module.css'

interface PostEditModalProps {
  post: Post
  onClose: () => void
  onSave: (updatedPost: Post) => void
}

export const PostEditModal = ({ post, onClose, onSave }: PostEditModalProps) => {
  const [formData, setFormData] = useState<Partial<PostCreate>>({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    post_type: post.post_type,
    tag_ids: post.tags.map(tag => tag.id),
    calories: post.calories,
    cooking_time: post.cooking_time
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTags = async () => {
      const response = await blogAPI.getTags()
      setTags(response.results || response)
    }
    fetchTags()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTagChange = (tagId: number, checked: boolean) => {
    setFormData(prev => {
      const currentTags = prev.tag_ids || []
      return {
        ...prev,
        tag_ids: checked 
          ? [...currentTags, tagId]
          : currentTags.filter(id => id !== tagId)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const updatedPost = await blogAPI.updatePost(post.id, {
        ...formData,
        cover_image: coverImage
      })
      onSave(updatedPost)
    } catch (err) {
      console.error('Ошибка при обновлении поста:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Редактирование поста</h3>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Заголовок</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Тип поста</label>
            <select
              name="post_type"
              value={formData.post_type}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="recipe">Рецепт</option>
              <option value="article">Статья</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Краткое описание</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Содержание</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className={styles.textarea}
              rows={6}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Обложка</label>
            <input
              type="file"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              className={styles.fileInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Теги</label>
            <div className={styles.tagsContainer}>
              {tags.map(tag => (
                <label key={tag.id} className={styles.tagCheckbox}>
                  <input
                    type="checkbox"
                    checked={formData.tag_ids?.includes(tag.id) || false}
                    onChange={(e) => handleTagChange(tag.id, e.target.checked)}
                  />
                  <span style={{ backgroundColor: tag.color }} className={styles.tagLabel}>
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {formData.post_type === 'recipe' && (
            <>
              <div className={styles.formGroup}>
                <label>Калории</label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Время приготовления (мин)</label>
                <input
                  type="number"
                  name="cooking_time"
                  value={formData.cooking_time || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </>
          )}

          <div className={styles.modalButtons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}