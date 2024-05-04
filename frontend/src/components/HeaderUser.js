import React from 'react';
import '../App.css';

// Functional component for rendering a header section
export default function HeaderUser({
    heading, // Main heading text
}) {
    const headingStyle = { position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', width: '100%' };

    return (
        <div className="mb-10">
            <h2 className="text-center text-3xl font-extrabold text-gray-900" style={headingStyle}>
                {heading}
            </h2>
        </div>
    );
}