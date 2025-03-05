import React, { useEffect, useState } from 'react';
import Lottie from 'react-lottie';
import animationData from './congratulation_animation.json';

const CongratulationAnimation = () => {
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
        showAnimation && (
            <div style={{ width: 500, height: 500, margin: '0 auto' }}>
                <Lottie options={defaultOptions} />
            </div>
        )
    );
};

export default CongratulationAnimation;