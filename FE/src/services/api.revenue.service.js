import axios from "./axios.customize"


const getRenvenueOfCourses = async (startDate, endDate) => {
    try {
        const response = await axios.get('/v1/api/revenue-stats', {
            params: { startDate, endDate }, // Gửi query params
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        throw error;
    }
}

export { getRenvenueOfCourses }