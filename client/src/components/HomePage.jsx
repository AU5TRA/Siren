import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import './hp.css';
import { BsFillPersonFill } from "react-icons/bs";

// import './home.css';

const HomePage = () => {
    // return (
    //     <div>
    //         <header className="header">
    //             <img src="../../siren_home.png" style={{ width: '100px', height: '30px', marginLeft: '10px' }} />

    //             <nav>
    //                 <Link to="users/login">Login</Link>
    //                 <Link to="/trains">Train Information</Link>
    //                 <Link to="/booking/train/search">Book a SEAT!</Link>
    //             </nav>
    //         </header>
    //         <main className="main">
    //             {/* Main content goes here */}
    //         </main>
    //         <footer className="footer">
    //             {/* Footer content if any */}
    //         </footer>
    //     </div>
    // );
    return <Fragment>
        <div className="sidebar">
            <header className="header">
                <div className="logo">
                    <img src="../../siren_home.png" style={{ width: '150px', height: '50px', marginLeft: '10px' }} />
                </div>
            </header>
            <nav className="nav">
                <ul>
                    <li>
                        <Link to="users/login">Login</Link>
                    </li>
                    <li>
                        <Link to="/trains">Train Information</Link>
                    </li>
                    <li>
                        <Link to="/booking/train/search">Book a SEAT!</Link>
                    </li>
                </ul>
            </nav>
            <main className="main">
                {/* Main content goes here */}
            </main>
            <footer className="footer">
                {/* Footer content if any */}
            </footer>
        </div>
        <div className="icon">
            {/* <Link to={`http://localhost:3001/users/${id}`}> */}
                <BsFillPersonFill />
            {/* </Link> */}
        </div>
    </Fragment>
};

export default HomePage;
