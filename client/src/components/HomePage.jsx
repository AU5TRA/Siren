import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div>
            <header>

                <div className="top-left">
                    <h1 style={{ marginBottom: '50px', marginTop:'50px' }}>Siren</h1>
                </div>
                <div className="top-right" >
                    <Link to="users/login">Login</Link>
                </div>
            </header>
            <main>
                {}
            </main>
            <footer>
                <div className="bottom-left">
                    <Link to="/train">Train Information</Link>
                </div>
            </footer>
            <footer>
                <div className="bottom-left">
                    <Link to="/booking/train/search">Book a SEAT!</Link>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;