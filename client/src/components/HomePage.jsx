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
