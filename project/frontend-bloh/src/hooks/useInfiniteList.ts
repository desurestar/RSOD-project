import { useCallback, useEffect, useRef, useState } from 'react'

export interface PaginatedResponse<T> {
	results: T[]
	next: string | null
}

interface Options<P> {
	fetchPage: (
		page: number,
		pageSize: number,
		extraParams: P
	) => Promise<PaginatedResponse<any>>
	pageSize?: number
	deps?: any[]
	extraParams: P
}

export function useInfiniteList<T, P = Record<string, any>>({
	fetchPage,
	pageSize = 10,
	deps = [],
	extraParams,
}: Options<P>) {
	const [items, setItems] = useState<T[]>([])
	const [page, setPage] = useState(1)
	const [hasNext, setHasNext] = useState(true)
	const [initialLoading, setInitialLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const sentinelRef = useRef<HTMLDivElement | null>(null)
	const fetchingRef = useRef(false)

	const load = useCallback(
		async (reset = false) => {
			if (fetchingRef.current) return
			if (!reset && (loadingMore || initialLoading || !hasNext)) return
			fetchingRef.current = true
			if (reset) {
				setInitialLoading(true)
				setPage(1)
				setHasNext(true)
				setError(null)
			} else {
				setLoadingMore(true)
			}
			try {
				const currentPage = reset ? 1 : page
				const res = await fetchPage(currentPage, pageSize, extraParams)
				if (reset) {
					setItems(res.results)
				} else {
					setItems(prev => {
						const seen = new Set(prev.map((i: any) => i.id))
						const merged = [...prev].concat(
							res.results.filter((r: any) => !seen.has(r.id))
						)
						return merged
					})
				}
				setHasNext(Boolean(res.next))
				setPage(p => (reset ? 2 : p + 1))
			} catch (e) {
				if (reset) setItems([])
				setError('Ошибка загрузки')
			} finally {
				if (reset) setInitialLoading(false)
				setLoadingMore(false)
				fetchingRef.current = false
			}
		},
		[
			page,
			pageSize,
			hasNext,
			loadingMore,
			initialLoading,
			fetchPage,
			extraParams,
		]
	)

	useEffect(() => {
		load(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)

	useEffect(() => {
		if (!sentinelRef.current) return
		const el = sentinelRef.current
		const obs = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) load(false)
			},
			{ rootMargin: '300px' }
		)
		obs.observe(el)
		return () => obs.disconnect()
	}, [load])

	return {
		items,
		hasNext,
		initialLoading,
		loadingMore,
		error,
		sentinelRef,
		reload: () => load(true),
		loadMore: () => load(false),
	}
}
