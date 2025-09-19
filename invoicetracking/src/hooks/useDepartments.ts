import { useEffect, useState } from 'react';
import { DepartmentService } from '../services/apiService';

export interface Department {
    service_id: string;         
    name: string;
}

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true);
            try {
                const response = await DepartmentService.getServices(); // should return array of departments
                setDepartments(response); // or response if it's already the array
            } catch (err: any) {
                setError(err.message || 'Failed to load services');
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    return { departments, loading, error };
}