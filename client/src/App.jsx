import React from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from './routes/Home';
import Registration from './routes/Registration';
import ShowUserInfo from './routes/ShowUserInfo';


const App= () =>{
    return (
    <div className= "container">
        <Router>
            <Routes>
            <Route exact path= "/"  element ={<Home/>}/>
            <Route exact path= "/users/" element={<Registration/>}/>
            <Route exact path= "/users/:id" element={<ShowUserInfo/>}/>
           


            </Routes>
        </Router>
    </div>);
};

export default App;