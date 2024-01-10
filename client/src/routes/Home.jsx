import React from 'react'
import UserList from '../components/UserList'
import Header from '../components/Header'

const Home = () => {
  return (
    <div>
      <center><h1 className="header-title">
        Passenger List
      </h1></center>
      <UserList />
    </div>
  )
}

export default Home