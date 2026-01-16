import {useCallback, useEffect, useState} from "react";
import {useAuth} from "../auth/AuthContext";
import {apiRequest} from "../api/client";
import type {Employee} from "../types";

export const useEmployees = () => {
    const {token, baseUrl} = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiRequest<Employee[]>(baseUrl, token, "/api/staff/employees");
            setEmployees(data || []);
        } catch (err) {
            setError("Не удалось загрузить список сотрудников.");
        } finally {
            setLoading(false);
        }
    }, [baseUrl, token]);

    useEffect(() => {
        void fetchEmployees();
    }, [fetchEmployees]);

    return {
        employees,
        loading,
        error,
        refresh: fetchEmployees,
    };
};
