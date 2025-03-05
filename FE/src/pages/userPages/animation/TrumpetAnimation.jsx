import React from 'react';
import Lottie from 'react-lottie';
import animationData from './trumpet_animation.json'; // Add your trumpet animation JSON file
import { useState, useEffect } from 'react';
const TrumpetAnimation = () => {
    const [showAnimation, setShowAnimation] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAnimation(false);
        }, 3000); // Hide after 2 seconds

        return () => clearTimeout(timer);
    }, []);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        showAnimation &&
        <div style={{ width: 250, height: 250 }}>
            <Lottie options={defaultOptions} />
        </div>
    );
};

export default TrumpetAnimation;