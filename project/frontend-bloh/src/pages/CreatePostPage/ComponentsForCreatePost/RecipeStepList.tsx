import { useState } from 'react'
import styles from '../CreatePostPage.module.css'

export interface RecipeStep {
  order: number
  description: string
  image: string
}

interface RecipeStepListProps {
  steps: RecipeStep[]
  onChange: (steps: RecipeStep[]) => void
}

export const RecipeStepList = ({ steps, onChange }: RecipeStepListProps) => {
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

  const addStep = () => {
    if (description.trim()) {
      const newStep: RecipeStep = {
        order: steps.length + 1,
        description,
        image,
      }
      onChange([...steps, newStep])
      setDescription('')
      setImage('')
    }
  }

  const removeStep = (index: number) => {
    const newSteps = [...steps]
    newSteps.splice(index, 1)
    // Перенумерация шагов
    const reordered = newSteps.map((step, idx) => ({ ...step, order: idx + 1 }))
    onChange(reordered)
  }

  return (
    <div className={styles.recipeStepList}>
      <h3>Шаги приготовления</h3>
      <div className={styles.inputRow}>
        <textarea
          placeholder="Описание шага"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={styles.textarea}
        />
        <input
          type="text"
          placeholder="Ссылка на изображение (необязательно)"
          value={image}
          onChange={e => setImage(e.target.value)}
          className={styles.input}
        />
        <button type="button" onClick={addStep} className={styles.addButton}>
          Добавить шаг
        </button>
      </div>
      <ol className={styles.recipeStepListOl}>
        {steps.map((step, index) => (
          <li key={index} className={styles.recipeStepItem}>
            <div>
              <strong>Шаг {step.order}</strong>: {step.description}
              {step.image && (
                <div>
                  <img src={step.image} alt={`Шаг ${step.order}`} className={styles.stepImage} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeStep(index)}
              className={styles.removeButton}
            >
              ✕
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
