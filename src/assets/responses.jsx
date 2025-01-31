import axios from 'axios';

export const getResponse = async () => {
    try {
        const response = await axios.get('http://localhost:7070/generate');
        return response.data.slip.advice;
    } catch (error) {
        console.error(error);
    }
}