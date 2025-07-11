import { Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { AdminIngredients } from './components/AdminIngredients/AdminIngredients'
import { AdminTags } from './components/AdminTags/AdminTags'
import { AdminUsers } from './components/AdminUsers/AdminUsers'
import { useAuthStore } from '../../stores/authStore'
import { AdminPosts } from './components/AdminPosts/AdminPosts'
import styles from './AdminPanel.module.css'

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0)
  const { isAdmin } = useAuthStore()

  if (!isAdmin()) {
    return (
      <div className={styles.container}>
        <h1>Доступ запрещен</h1>
        <p>У вас недостаточно прав для доступа к административной панели</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1>Административная панель</h1>
      
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)}
        className={styles.tabs}
        aria-label="Административные вкладки"
      >
        <Tab label="Посты" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
        <Tab label="Ингредиенты" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
        <Tab label="Теги" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
        <Tab label="Пользователи" id="admin-tab-3" aria-controls="admin-tabpanel-3" />
      </Tabs>

      <div 
        className={styles.tabContent}
        role="tabpanel"
        id={`admin-tabpanel-${activeTab}`}
        aria-labelledby={`admin-tab-${activeTab}`}
      >
        {activeTab === 0 && <AdminPosts />}
        {activeTab === 1 && <AdminIngredients />}
        {activeTab === 2 && <AdminTags />}
        {activeTab === 3 && <AdminUsers />}
      </div>
    </div>
  )
}