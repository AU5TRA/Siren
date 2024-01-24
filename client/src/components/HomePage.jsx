import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

const HomePage = () => {
    return (
        <div>
            <header className="header">
                <h1>Siren</h1>
                <nav>
                    <Link to="users/login">Login</Link>
<<<<<<< HEAD
                </div>
                
            </header>
            <main>
                {}
            </main>
            <footer>
                <div className="bottom-left">
=======
>>>>>>> e8ea98a21e64a879a3baa05138b99f4ed6bee7a9
                    <Link to="/trains">Train Information</Link>
                    <Link to="/booking/train/search">Book a SEAT!</Link>
                </nav>
            </header>
            <main className="main">
                {/* Main content goes here */}
            </main>
            <footer className="footer">
                {/* Footer content if any */}
            </footer>
        </div>
    );
};

export default HomePage;
