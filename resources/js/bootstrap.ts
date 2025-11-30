import.meta.glob(['../images/**', '../sounds/**']);

import { router } from '@inertiajs/react';
import axios from 'axios';
import { login } from './routes';

const axiosInstance = axios.create({
    baseURL: '/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            router.visit(login());
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
