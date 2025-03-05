import './components/admin/todo/todo.css'
import { useState, useContext, useEffect } from 'react'
import { getAccount } from './services/api.user.service'
import { AuthContext } from './components/context/auth.context'
import { Spin } from 'antd'
import AdminPage from './components/admin/AdminPage'
import PrivateRoute from './pages/privateRoute/private.admin.route'
const App = () => {

  const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext)
  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    const res = await getAccount()
    if (res.data) {
      setUser(res.data)
    }
    setIsAppLoading(false)
  }


  return (

    <>
      {isAppLoading === true ?
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
          <Spin />
        </div>
        :
        <PrivateRoute>
          <AdminPage />
        </PrivateRoute>

      }
    </>
  )
}

export default App
