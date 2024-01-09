import React from 'react';
import Header from "../components/Header";
import AddUser from '../components/AddUser';
import UserList from '../components/UserList';

const Home = () => {
  return (<div>
    <center><div><h1 classname="font-weight-light display-1 text-center">List of Passengers</h1></div></center>
    <UserList/>
  </div>);
}

export default Home;