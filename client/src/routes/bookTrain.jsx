import React from 'react'
import SearchTravel from '../components/SearchTravel'
import AddUser from '../components/AddUser'
import Header from '../components/Header'

const bookTrain = () => {
  return (
    <div>
      <center><h1 className="header-title">
        Seach for a train
      </h1></center>
      <SearchTravel />
    </div>
  )
}

export default bookTrain