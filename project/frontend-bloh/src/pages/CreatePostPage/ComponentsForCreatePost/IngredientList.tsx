import { useState } from 'react'
import styles from '../CreatePostPage.module.css'

export interface Ingredient {
  name: string
  quantity: string
}

interface IngredientListProps {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

export const IngredientList = ({ ingredients, onChange }: IngredientListProps) => {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')

  const addIngredient = () => {
    if (name.trim() && quantity.trim()) {
      onChange([...ingredients, { name, quantity }])
      setName('')
      setQuantity('')
    }
  }

  const removeIngredient = (index: number) => {
    const newList = [...ingredients]
    newList.splice(index, 1)
    onChange(newList)
  }

  return (
    <div className={styles.ingredientList}>
      <h3>Ингредиенты</h3>
      <div className={styles.inputRow}>
        <input
          type="text"
          placeholder="Название"
          value={name}
          onChange={e => setName(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Количество"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className={styles.input}
        />
        <button type="button" onClick={addIngredient} className={styles.addButton}>
          Добавить
        </button>
      </div>
      <ul className={styles.ingredientListUl}>
        {ingredients.map((ingredient, index) => (
          <li key={index} className={styles.ingredientItem}>
            {ingredient.name} — {ingredient.quantity}
            <button type="button" onClick={() => removeIngredient(index)} className={styles.removeButton}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
