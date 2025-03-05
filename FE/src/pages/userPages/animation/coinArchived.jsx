import React from 'react';
import Lottie from 'react-lottie';
import * as animationData from './coin_archive.json';

const CoinArchiveAnimation = () => {
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
            <Lottie options={defaultOptions} height={216} width={216} />
        </div>
    );
};

export default CoinArchiveAnimation;