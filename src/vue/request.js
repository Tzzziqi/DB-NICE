import axios from 'axios';

const service = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000
});

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response.data;
        } else {
            if (response.data) {
                return Promise.reject(response)
            }
            return Promise.reject('Request Error');
        }
    },
    error => {
        const data = error.response ? error.response.data : null;
        if (data) {
            return Promise.reject(data);
        } else {
            return Promise.reject('Request Error');
        }
    }
);

export const get = (url, token, param = {}, header = {}) => {
    header['Authorization'] = token;
    return service.get(url, {
        headers: header,
        params: param
    });
};

export const post = (url, token, body = {}, header = {}) => {
    header['Authorization'] = token;
    return service.post(url, body, {headers: header});
};