import React from 'react'
import AddUser from '../components/AddUser'
import Header from '../components/Header'

const addUserInfo = () => {
  return (
    <div>
      <center><h1 className="header-title">
        Register New User
      </h1></center>
      <AddUser />
    </div>
  )
}

export default addUserInfo