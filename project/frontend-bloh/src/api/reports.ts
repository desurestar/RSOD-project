import api from './instance'

export interface PostReportFilters {
	date_from?: string
	date_to?: string
	status?: string[] // ['draft','published']
	post_type?: string // 'recipe' | 'article'
	author_id?: number
	tags?: number[] // ids
}

export async function downloadPostsReport(filters: PostReportFilters) {
	const params = new URLSearchParams()
	if (filters.date_from) params.append('date_from', filters.date_from)
	if (filters.date_to) params.append('date_to', filters.date_to)
	if (filters.post_type) params.append('post_type', filters.post_type)
	if (filters.author_id) params.append('author_id', String(filters.author_id))
	if (filters.status) filters.status.forEach(s => params.append('status', s))
	if (filters.tags && filters.tags.length) {
		params.append('tags', filters.tags.join(','))
	}
	const res = await api.get(`/reports/posts/?${params.toString()}`, {
		responseType: 'blob',
	})
	const blob = res.data as Blob
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = 'posts_report.xlsx'
	document.body.appendChild(a)
	a.click()
	a.remove()
	URL.revokeObjectURL(url)
}
