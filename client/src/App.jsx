<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from './routes/homepage'; // Ensure the import names match the file exports
import LoginPage from './routes/loginPage';
import UpdateUserInfo from './routes/updateUserInfo';
import ShowUserInfo from './routes/showUserInfo';
import AddUserInfo from './routes/addUserInfo';
import SearchUserInfo from './routes/searchUserInfo';
import RouteDetails from './routes/routeDetails';
import SearchTrainInfo from './routes/searchTrainInfo';
import ReviewPage from './routes/reviewPage';
import BookTrain from './routes/bookTrain';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import NavBar from './components/NavBar';
import NavBar2 from './components/NavBar2';
import './components/App.css';

const App = () => {
    const [isAuthenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const isAuth = async () => {
            try {
                const response = await fetch("http://localhost:3001/is-verify", {
                    method: "GET",
                    headers: { jwt_token: localStorage.getItem("token") }

                });
                const parseRes = await response.json();
                setAuthenticated(parseRes === true);
            } catch (error) {
                console.error(error);
            }
        };

        isAuth();
    }, []);

    return (
        <div className="container">
            <Router>
                <NavBar/>
                <Routes>
                    <Route path="/" element={ <HomePage />} />
                    <Route path="/users/login" element={<LoginPage />} />
                    <Route path="/users/:id/update" element={<UpdateUserInfo />} />
                    <Route path="/users/:id" element={<ShowUserInfo />} />
                    <Route path="/users" element={<AddUserInfo />} />
                    <Route path="/search" element={<SearchUserInfo />} />
                    <Route path="/trains" element={<SearchTrainInfo />} />
                    <Route path="/train/:id" element={<RouteDetails />} />
                    <Route path="/booking/train/search" element={<BookTrain />} />
                    <Route path="/review" element={<ReviewPage />} />
                </Routes>
            </Router>
        </div>
    );
=======
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom" 
import home from './routes/home'
import updateUserInfo from './routes/updateUserInfo'
import showUserInfo from './routes/showUserInfo'
import addUserInfo from './routes/addUserInfo';
import searchUserInfo from './routes/searchUserInfo'
import routeDetails from './routes/routeDetails'
import LoginPage from './routes/loginPage'
import searchTrainInfo from './routes/searchTrainInfo'
import reviewPage from './routes/reviewPage';
import bookTrain from './routes/bookTrain'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import homepage from './routes/homepage';


const App = () => {
    
    return <div className = "container">
        <Router>
            <Routes>
                
                <Route exact path="/" Component={homepage} />
                <Route exact path="/users/login" Component={LoginPage} />
                <Route exact path="/users/:id/update" Component={updateUserInfo} />
                <Route exact path="/users/:id" Component={showUserInfo} />
                <Route exact path="/users" Component={addUserInfo} />
                <Route exact path="/search" Component={searchUserInfo}/>
                <Route exact path="/trains" Component={searchTrainInfo}/>
                <Route exact path="/train/:id" Component={routeDetails}/>
                <Route exact path="/booking/train/search" Component={bookTrain} />
                <Route exact path="/review" Component={reviewPage} />
            </Routes>
        </Router>
    </div>;
>>>>>>> 881bc7959a99de164279c0afabbb9d961c19994f
};

export default App;
