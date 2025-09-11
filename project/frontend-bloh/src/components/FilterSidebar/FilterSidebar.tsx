import React, { useEffect, useState } from 'react'
import styles from './FilterSidebar.module.css'

interface FilterSidebarProps {
	className?: string
	timeFilter: number | ''
	setTimeFilter: React.Dispatch<React.SetStateAction<number | ''>>
	caloriesFilter: number | ''
	setCaloriesFilter: React.Dispatch<React.SetStateAction<number | ''>>
	sortOption: 'relevance' | 'likes' | 'views'
	setSortOption: React.Dispatch<
		React.SetStateAction<'relevance' | 'likes' | 'views'>
	>
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
	className = '',
	timeFilter,
	setTimeFilter,
	caloriesFilter,
	setCaloriesFilter,
	sortOption,
	setSortOption,
}) => {
	// локальные черновики + дебаунс
	const [timeDraft, setTimeDraft] = useState<number | ''>(timeFilter)
	const [caloriesDraft, setCaloriesDraft] = useState<number | ''>(
		caloriesFilter
	)

	useEffect(() => setTimeDraft(timeFilter), [timeFilter])
	useEffect(() => setCaloriesDraft(caloriesFilter), [caloriesFilter])

	useEffect(() => {
		const id = setTimeout(() => {
			if (timeFilter !== timeDraft) setTimeFilter(timeDraft)
		}, 1000)
		return () => clearTimeout(id)
	}, [timeDraft, timeFilter, setTimeFilter])

	useEffect(() => {
		const id = setTimeout(() => {
			if (caloriesFilter !== caloriesDraft) setCaloriesFilter(caloriesDraft)
		}, 1000)
		return () => clearTimeout(id)
	}, [caloriesDraft, caloriesFilter, setCaloriesFilter])

	return (
		<aside className={`${styles.sidebar} ${className}`}>
			<h2 className={styles.filterTitle}>Фильтры</h2>

			<div className={styles.filterGroup}>
				<label htmlFor='timeFilter' className={styles.filterLabel}>
					Время готовки (мин):
				</label>
				<input
					type='number'
					id='timeFilter'
					className={styles.filterInput}
					placeholder='≤'
					value={timeDraft}
					onChange={e =>
						setTimeDraft(e.target.value ? Number(e.target.value) : '')
					}
				/>
			</div>

			<div className={styles.filterGroup}>
				<label htmlFor='caloriesFilter' className={styles.filterLabel}>
					Калорийность (ккал):
				</label>
				<input
					type='number'
					id='caloriesFilter'
					className={styles.filterInput}
					placeholder='≤'
					value={caloriesDraft}
					onChange={e =>
						setCaloriesDraft(e.target.value ? Number(e.target.value) : '')
					}
				/>
			</div>

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
