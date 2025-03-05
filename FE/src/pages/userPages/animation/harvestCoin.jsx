import React from 'react';
import Lottie from 'react-lottie';
import * as animationData from './harvest_coin.json';

const HarvestCoinAnimation = () => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div>
            <Lottie options={defaultOptions} height={1300} width={300} />
        </div>
    );
};

export default HarvestCoinAnimation;