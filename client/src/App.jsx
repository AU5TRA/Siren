import React from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from './routes/Home';
import Update from './routes/Update';
import UserList from './routes/UserList';


const App= () =>{
    return (
    <div>
        <Router>
            <Routes>
            <Route exact path= "/"  element ={<Home/>}/>
            <Route exact path= "/birds/:birdid/update" element={<Update/>}/>
            <Route exact path= "/birds/:birdid/" element={<UserList/>}/>
            </Routes>
        </Router>
    </div>);
};


export default App;