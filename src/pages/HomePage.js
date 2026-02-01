// src/pages/HomePage.js
import React from 'react';
import './HomePage.css'; // Import the CSS file for styling

const HomePage = () => {
    return (
        <div className="home-container">
            <header className="header">
                <h1>Welcome to Stitchuation</h1>
                <p>Your go-to solution for creative designs!</p>
            </header>
            <main className="main-content">
                <section className="features">
                    <div className="feature">
                        <h2>Feature One</h2>
                        <p>Discover amazing features that enhance your productivity.</p>
                    </div>
                    <div className="feature">
                        <h2>Feature Two</h2>
                        <p>Utilize our tools for seamless design integration.</p>
                    </div>
                    <div className="feature">
                        <h2>Feature Three</h2>
                        <p>Join our community and collaborate with others.</p>
                    </div>
                </section>
            </main>
            <footer className="footer">
                <p>© 2026 Stitchuation. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
