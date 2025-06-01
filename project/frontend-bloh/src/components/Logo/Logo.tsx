import React from 'react'
import logo from '../../assets/resolution-logo.svg'

export const Logo: React.FC = () => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<img
				src={logo}
				alt='Logo'
				width='60'
				height='60'
				style={{ display: 'block' }}
			/>
			<span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 'bold' }}>
				Кулинарный блог
			</span>
		</div>
	)
}
