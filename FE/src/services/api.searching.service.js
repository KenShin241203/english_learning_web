import axios from "./axios.customize"

const searchingApi = (searchTerm, userId) => {
    const URL_BACKEND = `/v1/api/search`
    return axios.get(URL_BACKEND, {
        params: {
            query: searchTerm, // Từ khóa tìm kiếm
            userId: userId,    // ID người dùng
        },
    });
}

export default searchingApi