export type SectionLink = {
    to: string;
    label: string;
    end?: boolean;
};

export const sectionLinks: Record<string, SectionLink[]> = {
    security: [
        {to: "/security", label: "Обзор", end: true},
        {to: "/security/hall-monitoring", label: "Мониторинг зала"},
        {to: "/security/suspicious-activity", label: "Подозрительная активность"},
        {to: "/security/contact-duration", label: "Контакты"},
        {to: "/security/contact-frequency", label: "Частота контактов"},
        {to: "/security/fraud-check", label: "Фрод-проверка"},
        // {to: "/security/notifications", label: "Уведомления"},
    ],
    incidents: [
        {to: "/incidents", label: "Инциденты", end: true},
        // {to: "/incidents/register", label: "Регистрация"},
        {to: "/incidents/complaints", label: "Жалобы"},
        {to: "/incidents/repeated-violations", label: "Повторные нарушения"},
    ],
    finance: [
        {to: "/finance", label: "Обзор", end: true},
        {to: "/finance/analysis", label: "Аналитика"},
        {to: "/finance/operations", label: "Операции"},
        {to: "/finance/cash-control", label: "Кассовый контроль"},
        {to: "/finance/anomalies", label: "Аномалии"},
        {to: "/finance/game-analysis", label: "Анализ игр"},
    ],
    staff: [
        {to: "/staff/time-tracking", label: "Учёт времени", end: true},
        {to: "/staff/management", label: "Управление персоналом"},
        // {to: "/staff/discipline", label: "Дисциплина"},
        // {to: "/staff/violation-history", label: "История нарушений"},
        {to: "/staff/shifts", label: "Смены"},
    ],
    reports: [
        {to: "/reports/all", label: "Все отчёты", end: true},
        {to: "/reports/incidents", label: "Отчёты по инцидентам", end: true},
        {to: "/reports/management", label: "Управленческие отчёты"},
        {to: "/reports/regulatory", label: "Регуляторные отчёты"},
        // {to: "/reports/export", label: "Экспорт отчётов"},
    ],
};
