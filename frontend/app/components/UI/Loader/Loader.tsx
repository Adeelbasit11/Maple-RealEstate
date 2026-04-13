import React from 'react';
import '../../../styles/Loader.css';

const Loader: React.FC = () => {
    return (
        <div className="loader-container">
            <div className="custom-loader">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
            </div>
            <p className="loader-text">Loading...</p>
        </div>
    );
};

export default Loader;
