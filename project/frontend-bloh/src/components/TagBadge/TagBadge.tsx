import { Tag } from '../../types/post.types'
import styles from './TagBadge.module.css'

interface TagBadgeProps {
	tag: Tag
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag }) => {
	return (
		<span
			className={styles.tagBadge}
			style={{ backgroundColor: tag.color ?? '#e0f2e9' }}
		>
			#{tag.name}
		</span>
	)
}
