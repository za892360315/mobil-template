import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import { getMessageInfo } from './status';

const service = axios.create({
    baseURL: import.meta.env.VITE_APP_DEV_USE_MOCK
        ? import.meta.env.VITE_APP_MOCK_BASEURL
        : import.meta.env.VITE_APP_API_BASEURL,
    timeout: 15000
});
// axios实例拦截请求
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);
// axios实例拦截响应
service.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 200) {
            const data = response.data;
            if (data.code !== 0) {
                ElMessage({
                    message: data.message,
                    type: 'error'
                });
                return Promise.reject(data);
            } else {
                return data;
            }
        }
        ElMessage({
            message: getMessageInfo(response.status),
            type: 'error'
        });
        return response;
    },
    // 请求失败
    (error: any) => {
        const { response } = error;
        if (response) {
            ElMessage({
                message: getMessageInfo(response.status),
                type: 'error'
            });
            return Promise.reject(response.data);
        }
        ElMessage({
            message: '网络连接异常,请稍后再试!',
            type: 'error'
        });
    }
);
export default service;
