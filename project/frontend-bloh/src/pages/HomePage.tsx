import React from 'react'
import { PostsFeed } from '../components/PostsFeed/PostsFeed'
import { mockPosts } from '../mock/fakeData'

export const HomePage: React.FC = () => {
	return (
		<main>
			<h1 style={{ textAlign: 'center', margin: '2rem 0' }}>Лента рецептов</h1>
			<PostsFeed posts={mockPosts} />
		</main>
	)
}
