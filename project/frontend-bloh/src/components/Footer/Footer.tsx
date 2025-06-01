import React from 'react'
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'
import { Logo } from '../Logo/Logo'
import styles from './Footer.module.css'

interface FooterProps {
	className?: string
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
	return (
		<div className={className}>
			<footer className={styles.footer}>
				<div className={styles.inner}>
					<div className={styles.description}>
						<Logo />
						<p>
							Вдохновляйся и готовь с удовольствием. Простые и вкусные рецепты
							каждый день.
						</p>
					</div>
					<div className={styles.links}>
						<a href='#'>О нас</a>
						<a href='#'>Контакты</a>
						<a href='#'>Политика конфиденциальности</a>
					</div>
					<div className={styles.contact}>
						<p>support@culinaryblog.com</p>
						<div className={styles.socials}>
							<a href='#'>
								<FaFacebook size={40} />
							</a>
							<a href='#'>
								<FaInstagram size={40} />
							</a>
							<a href='#'>
								<FaTwitter size={40} />
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
