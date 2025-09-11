import React from 'react'
import styles from '../../pages/AdminPanel/AdminPanel.module.css'

interface Props {
	page: number
	pageCount: number
	onChange: (p: number) => void
	pageSize: number
	total: number
}

export const PaginationControls: React.FC<Props> = ({
	page,
	pageCount,
	onChange,
	pageSize,
	total,
}) => {
	if (pageCount <= 1) return null

	const visible = (): number[] => {
		const pages: number[] = []
		const start = Math.max(1, page - 2)
		const end = Math.min(pageCount, page + 2)
		for (let p = start; p <= end; p++) pages.push(p)
		if (!pages.includes(1)) pages.unshift(1)
		if (!pages.includes(pageCount)) pages.push(pageCount)
		return Array.from(new Set(pages))
	}

	return (
		<div className={styles.pagination}>
			<button
				className={styles.paginationButton}
				disabled={page === 1}
				onClick={() => onChange(page - 1)}
			>
				«
			</button>
			{visible().map(p => (
				<button
					key={p}
					className={`${styles.pageNumber} ${p === page ? styles.active : ''}`}
					onClick={() => onChange(p)}
					disabled={p === page}
				>
					{p}
				</button>
			))}
			<button
				className={styles.paginationButton}
				disabled={page === pageCount}
				onClick={() => onChange(page + 1)}
			>
				»
			</button>
			<div className={styles.paginationInfo}>
				Стр. {page}/{pageCount} • {total} элементов • по {pageSize}
			</div>
		</div>
	)
}
