import React from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from './routes/Home';
import Update from './routes/Update';
import Users from './routes/Users';
import Register from './routes/Register';
import Login from './routes/Login';


const App= () =>{
    return (
    <div className= "container">
        <Router>
            <Routes>
            <Route exact path= "/"  element ={<Home/>}/>
            <Route exact path= "/users/" element={<Update/>}/>
            </Routes>
        </Router>
    </div>);
};

export default App;