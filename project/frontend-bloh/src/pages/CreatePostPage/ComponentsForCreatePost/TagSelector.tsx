import styles from '../CreatePostPage.module.css'
import { useGetTagsQuery } from '../../../services/postApi'

export interface Tag {
  id: number
  name: string
  slug: string
  color?: string
}

interface TagSelectorProps {
  selectedTags: Tag[]
  onChange: (tags: Tag[]) => void
}

export const TagSelector = ({ selectedTags, onChange }: TagSelectorProps) => {
  const { data: tags, isLoading } = useGetTagsQuery()

  const toggleTag = (tag: Tag) => {
    const alreadySelected = selectedTags.find(t => t.id === tag.id)
    if (alreadySelected) {
      onChange(selectedTags.filter(t => t.id !== tag.id))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  if (isLoading) return <p>Загрузка тегов...</p>

  return (
    <div className={styles.tagSelector}>
      {tags?.map(tag => {
        const isSelected = selectedTags.some(t => t.id === tag.id)
        return (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag)}
            className={`${styles.tagButton} ${isSelected ? styles.selected : ''}`}
            style={{ borderColor: tag.color || '#ccc' }}
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}
