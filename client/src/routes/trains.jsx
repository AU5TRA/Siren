import React from 'react'
import TrainInfo from '../components/TrainInfo'
import Header from '../components/Header'

const trains = () => {
  return (
    <div>
      <center><h1 className="header-title">
        Train List
      </h1></center>
      <TrainInfo />
    </div>
  )
}

export default trains