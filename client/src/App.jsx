import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom" 
import home from './routes/home'
import updateUserInfo from './routes/updateUserInfo'
import showUserInfo from './routes/showUserInfo'
import addUserInfo from './routes/addUserInfo';
import searchUserInfo from './routes/searchUserInfo'
import trains from './routes/trains'
import routeDetails from './routes/routeDetails'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import loginPage from './routes/loginPage';
import homepage from './routes/homepage';


const App = () => {
    return <div className = "container">
        <Router>
            <Routes>
                
                <Route exact path="/" Component={homepage} />
                <Route exact path="/users/:id/update" Component={updateUserInfo} />
                <Route exact path="/users/:id" Component={showUserInfo} />
                <Route exact path="/users" Component={addUserInfo} />
                <Route exact path="/search" Component={searchUserInfo}/>
                <Route exact path="/train" Component={trains}/>
                <Route exact path="/train/:id" Component={routeDetails}/>
                <Route exact path="/booking/train/search" Component={bookTrain} />

                <Route exact path="/users/login" Component={loginPage} />
            </Routes>
        </Router>
    </div>;
};

export default App;
