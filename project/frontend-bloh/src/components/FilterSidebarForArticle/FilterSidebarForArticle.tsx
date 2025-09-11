import React from 'react'
import styles from './FilterSidebarForArticle.module.css'

interface FilterSidebarProps {
	className?: string
	sortOption: 'relevance' | 'likes' | 'views'
	setSortOption: React.Dispatch<
		React.SetStateAction<'relevance' | 'likes' | 'views'>
	>
}

export const FilterSidebarForArticle: React.FC<FilterSidebarProps> = ({
	className = '',
	sortOption,
	setSortOption,
}) => {
	return (
		<aside className={`${styles.sidebar} ${className}`}>
			<h2 className={styles.filterTitle}>Фильтры</h2>
			<div className={styles.filterGroup}>
				<label className={styles.filterLabel}>Сортировка:</label>
				<select
					className={styles.filterSelect}
					value={sortOption}
					onChange={e =>
						setSortOption(e.target.value as 'relevance' | 'likes' | 'views')
					}
				>
					<option value='relevance'>По новизне</option>
					<option value='likes'>По лайкам</option>
					<option value='views'>По просмотрам</option>
				</select>
			</div>
		</aside>
	)
}
