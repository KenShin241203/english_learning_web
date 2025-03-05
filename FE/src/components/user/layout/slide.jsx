import { Carousel } from "antd"
import './css/homePage.css'
import banner from './images/banner/banner1.jpg'
import banner2 from './images/banner/banner2.jpg'
import banner3 from './images/banner/banner3.jpg'
const Slide = () => {
    return (
        <div className="carousel-container">
            <Carousel autoplay className="carousel-slide">
                <div className="carousel-item">
                    <img
                        src={banner}
                        alt="Banner 1"
                        className="carousel-image"
                    />
                </div>
                <div className="carousel-item">
                    <img
                        src={banner2}
                        alt="Banner 2"
                        className="carousel-image"
                    />
                </div>
                <div className="carousel-item">
                    <img
                        src={banner3}
                        alt="Banner 3"
                        className="carousel-image"
                    />
                </div>
            </Carousel>
        </div>
    );
}

export default Slide