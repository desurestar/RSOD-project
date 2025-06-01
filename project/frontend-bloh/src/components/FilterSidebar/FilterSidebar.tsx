import React, { useEffect, useRef, useState } from 'react'
import styles from './FilterSidebar.module.css'

interface Tag {
	slug: string
	name: string
	color: string
}

interface FilterSidebarProps {
	className?: string
	selectedTags: string[]
	setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
	timeFilter: number | ''
	setTimeFilter: React.Dispatch<React.SetStateAction<number | ''>>
	caloriesFilter: number | ''
	setCaloriesFilter: React.Dispatch<React.SetStateAction<number | ''>>
	sortOption: 'relevance' | 'likes' | 'views'
	setSortOption: React.Dispatch<
		React.SetStateAction<'relevance' | 'likes' | 'views'>
	>
	recipeTags: Tag[]
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
	className = '',
	selectedTags,
	setSelectedTags,
	timeFilter,
	setTimeFilter,
	caloriesFilter,
	setCaloriesFilter,
	sortOption,
	setSortOption,
	recipeTags,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsDropdownOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const toggleTag = (slug: string) => {
		setSelectedTags(prev =>
			prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
		)
	}

	const removeTag = (slug: string) => {
		setSelectedTags(prev => prev.filter(s => s !== slug))
	}

	return (
		<aside className={`${styles.sidebar} ${className}`}>
			<h2 className={styles.filterTitle}>Фильтры</h2>

			<div className={styles.filterGroup}>
				<label className={styles.filterLabel}>Теги:</label>
				<div className={styles.dropdown} ref={dropdownRef}>
					<button
						type='button'
						className={styles.dropdownToggle}
						onClick={() => setIsDropdownOpen(o => !o)}
					>
						{selectedTags.length
							? `Выбрано ${selectedTags.length}`
							: 'Выберите теги'}
					</button>
					{isDropdownOpen && (
						<ul className={styles.dropdownMenu}>
							{recipeTags.map(tag => (
								<li
									key={tag.slug}
									className={`${styles.dropdownItem} ${
										selectedTags.includes(tag.slug) ? styles.selectedItem : ''
									}`}
									onClick={() => toggleTag(tag.slug)}
								>
									#{tag.name}
								</li>
							))}
						</ul>
					)}
				</div>
				<div className={styles.selectedTags}>
					{selectedTags.map(slug => {
						const tag = recipeTags.find(t => t.slug === slug)
						return tag ? (
							<span
								key={slug}
								className={styles.tagBadge}
								style={{ backgroundColor: tag.color }}
							>
								#{tag.name}
								<button
									type='button'
									className={styles.removeTagBtn}
									onClick={() => removeTag(slug)}
								>
									×
								</button>
							</span>
						) : null
					})}
				</div>
			</div>

			<div className={styles.filterGroup}>
				<label htmlFor='timeFilter' className={styles.filterLabel}>
					Время готовки (мин):
				</label>
				<input
					type='number'
					id='timeFilter'
					className={styles.filterInput}
					placeholder='≤'
					value={timeFilter}
					onChange={e =>
						setTimeFilter(e.target.value ? Number(e.target.value) : '')
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
					value={caloriesFilter}
					onChange={e =>
						setCaloriesFilter(e.target.value ? Number(e.target.value) : '')
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
					<option value='relevance'>По релевантности</option>
					<option value='likes'>По лайкам</option>
					<option value='views'>По просмотрам</option>
				</select>
			</div>
		</aside>
	)
}
