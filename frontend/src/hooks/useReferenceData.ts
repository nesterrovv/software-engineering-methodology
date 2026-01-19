import {useCallback, useEffect, useState} from "react";
import {apiRequest} from "../api/client";
import {useAuth} from "../auth/AuthContext";
// @ts-ignore
import type {CashDeskInfo, GameTableInfo} from "../types";

export const useReferenceData = () => {
    const {token, baseUrl} = useAuth();
    const [cashDesks, setCashDesks] = useState<CashDeskInfo[]>([]);
    const [gameTables, setGameTables] = useState<GameTableInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchReferenceData = useCallback(async () => {
        setLoading(true);
        setError("");
        const [cashResult, tableResult] = await Promise.allSettled([
            apiRequest<CashDeskInfo[]>(baseUrl, token, "/api/reference/cashdesks"),
            apiRequest<GameTableInfo[]>(baseUrl, token, "/api/reference/gametables"),
        ]);
        if (cashResult.status === "fulfilled") {
            setCashDesks(cashResult.value || []);
        } else {
            setCashDesks([]);
        }
        if (tableResult.status === "fulfilled") {
            setGameTables(tableResult.value || []);
        } else {
            setGameTables([]);
        }
        if (cashResult.status === "rejected" || tableResult.status === "rejected") {
            setError("Не удалось загрузить справочники касс и столов.");
        }
        setLoading(false);
    }, [baseUrl, token]);

    useEffect(() => {
        void fetchReferenceData();
    }, [fetchReferenceData]);

    return {
        cashDesks,
        gameTables,
        loading,
        error,
        refresh: fetchReferenceData,
    };
};
