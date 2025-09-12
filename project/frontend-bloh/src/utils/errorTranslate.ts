// Утилита перевода типичных ответов DRF / SimpleJWT на человеко‑читаемые русские сообщения
export function translateErrorPayload(
	payload: any,
	fallback = 'Произошла ошибка'
) {
	if (!payload) return fallback

	// Если строка — пробуем перевести по словарю
	if (typeof payload === 'string') {
		return mapKnownMessage(payload.trim()) || payload
	}

	// DRF detail
	if (payload.detail) {
		const msg = Array.isArray(payload.detail)
			? payload.detail.join(' ')
			: payload.detail
		return mapKnownMessage(msg) || msg
	}

	// Словарь полей: { field: ["msg", ...], non_field_errors: [...], ... }
	const parts: string[] = []
	for (const [field, value] of Object.entries(payload)) {
		if (value == null) continue
		const arr = Array.isArray(value) ? value : [value]
		const txt = arr
			.map(v => (typeof v === 'string' ? mapKnownMessage(v) || v : ''))
			.filter(Boolean)
			.join('; ')
		if (!txt) continue

		// Локализация названий полей
		const fieldLabel = mapField(field)
		if (field === 'non_field_errors') {
			parts.push(txt)
		} else {
			parts.push(`${fieldLabel}: ${txt}`)
		}
	}
	return parts.length ? parts.join('\n') : fallback
}

function mapField(field: string) {
	const dict: Record<string, string> = {
		username: 'Имя пользователя',
		password: 'Пароль',
		email: 'Email',
		re_password: 'Подтверждение пароля',
		non_field_errors: '',
	}
	return dict[field] ?? field
}

function mapKnownMessage(msg: string) {
	const normalized = msg.toLowerCase()

	const direct: Record<string, string> = {
		'invalid token': 'Недействительный токен',
		'user inactive or deleted': 'Пользователь деактивирован',
		'no active account found with the given credentials':
			'Неверный логин или пароль',
		'unable to log in with provided credentials': 'Неверный логин или пароль',
		'given token not valid for any token type':
			'Токен недействителен или истёк',
		'this field may not be blank.': 'Поле не может быть пустым',
		'a user with that username already exists.':
			'Пользователь с таким именем уже существует',
		'email already in use.': 'Пользователь с таким email уже существует',
		'password is too common.': 'Слишком простой пароль',
		'password is too short.': 'Слишком короткий пароль',
	}

	if (direct[normalized]) return direct[normalized]

	// Подстрочные проверки
	if (normalized.includes('not found')) return 'Не найдено'
	if (normalized.includes('expired')) return 'Срок действия истёк'
	if (normalized.includes('incorrect authentication credentials'))
		return 'Ошибка аутентификации'
	if (normalized.includes('ensure this value has at least'))
		return 'Слишком короткое значение'
	if (normalized.includes('ensure this value has at most'))
		return 'Слишком длинное значение'

	return null
}
