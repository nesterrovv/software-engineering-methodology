package com.casino.mis.reference.controller;

import com.casino.mis.reference.dto.CashDeskInfo;
import com.casino.mis.reference.dto.GameTableInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Справочные данные для фронтенда
 * Предоставляет списки касс, столов и других справочников
 */
@RestController
@RequestMapping("/api/reference")
@Tag(name = "Reference Data", description = "Справочные данные для UI")
public class ReferenceController {

    // Хардкодные UUID для касс (для тестирования и разработки)
    private static final UUID CASH_DESK_1 = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID CASH_DESK_2 = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID CASH_DESK_3 = UUID.fromString("33333333-3333-3333-3333-333333333333");
    private static final UUID CASH_DESK_4 = UUID.fromString("44444444-4444-4444-4444-444444444444");
    private static final UUID CASH_DESK_5 = UUID.fromString("55555555-5555-5555-5555-555555555555");

    @GetMapping("/cashdesks")
    @Operation(summary = "Получить список касс", description = "Возвращает список всех касс для использования в UI (выбор кассы при создании операций)")
    public List<CashDeskInfo> getCashDesks() {
        return Arrays.asList(
                new CashDeskInfo(CASH_DESK_1, "Касса №1", "Главный зал", "ACTIVE"),
                new CashDeskInfo(CASH_DESK_2, "Касса №2", "VIP зал", "ACTIVE"),
                new CashDeskInfo(CASH_DESK_3, "Касса №3", "Слот-зал", "ACTIVE"),
                new CashDeskInfo(CASH_DESK_4, "Касса №4", "Второй этаж", "ACTIVE"),
                new CashDeskInfo(CASH_DESK_5, "Касса №5", "Покер-рум", "MAINTENANCE")
        );
    }

    @GetMapping("/gametables")
    @Operation(summary = "Получить список игровых столов", description = "Возвращает список всех игровых столов и автоматов для использования в UI")
    public List<GameTableInfo> getGameTables() {
        return Arrays.asList(
                new GameTableInfo("TABLE-001", "Рулетка №1", "ROULETTE", "Главный зал", "ACTIVE"),
                new GameTableInfo("TABLE-002", "Рулетка №2", "ROULETTE", "Главный зал", "ACTIVE"),
                new GameTableInfo("TABLE-003", "Блэкджек №1", "BLACKJACK", "Главный зал", "ACTIVE"),
                new GameTableInfo("TABLE-004", "Блэкджек №2", "BLACKJACK", "VIP зал", "ACTIVE"),
                new GameTableInfo("TABLE-005", "Покер №1", "POKER", "Покер-рум", "ACTIVE"),
                new GameTableInfo("TABLE-006", "Покер №2", "POKER", "Покер-рум", "ACTIVE"),
                new GameTableInfo("TABLE-007", "Баккара", "BACCARAT", "VIP зал", "ACTIVE"),
                new GameTableInfo("SLOT-001", "Слот-автомат №1", "SLOT", "Слот-зал", "ACTIVE"),
                new GameTableInfo("SLOT-002", "Слот-автомат №2", "SLOT", "Слот-зал", "ACTIVE"),
                new GameTableInfo("SLOT-003", "Слот-автомат №3", "SLOT", "Слот-зал", "MAINTENANCE")
        );
    }
}
