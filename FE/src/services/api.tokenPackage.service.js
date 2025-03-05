import axios from "./axios.customize"

const fetchAllTokenPackageApi = async (page, limit) => {
    const URL_BACKEND = `/v1/api/tokenPackage?page=${page}&limit=${limit}`
    return await axios.get(URL_BACKEND)
}

const fetchTokenPackWithoutPagination = async () => {
    const URL_BACKEND = '/v1/api/tokenPackage_without_pagin'
    return await axios.get(URL_BACKEND)
}

const fetchTokenPackageByIdApi = async (id) => {
    const URL_BACKEND = `/v1/api/tokenPackage/${id}`
    return await axios.get(URL_BACKEND)
}

const postTokenPackageApi = async (data) => {
    const URL_BACKEND = `/v1/api/tokenPackage`
    return await axios.post(URL_BACKEND, data)
}

const updateTokenPackageApi = async (id, name, token, price) => {
    const URL_BACKEND = `/v1/api/tokenPackage`
    const data = { id, name, token, price }
    return await axios.put(URL_BACKEND, data)
}

const deleteTokenPackageApi = async (id) => {
    const URL_BACKEND = `/v1/api/tokenPackage/${id}`
    return await axios.delete(URL_BACKEND)
}

export {
    fetchAllTokenPackageApi, postTokenPackageApi, updateTokenPackageApi,
    deleteTokenPackageApi, fetchTokenPackageByIdApi, fetchTokenPackWithoutPagination
}