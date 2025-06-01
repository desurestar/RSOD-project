import React from 'react'
import { Footer } from '../../components/Footer/Footer'
import { Header } from '../../components/Heared/Header'
import { PostsFeed } from '../../components/PostsFeed/PostsFeed'
import { articlePosts } from '../../mock/mockArticle'

export const ArticlePage: React.FC = () => {
	return (
		<>
			<Header />
			<main>
				<h1 style={{ textAlign: 'center', margin: '2rem 0' }}>Статьи</h1>
				<PostsFeed posts={articlePosts} />
			</main>
			<Footer />
		</>
	)
}
