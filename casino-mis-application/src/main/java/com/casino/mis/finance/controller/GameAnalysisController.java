package com.casino.mis.finance.controller;

import com.casino.mis.finance.domain.GameSessionAnalysis;
import com.casino.mis.finance.dto.GameAnalysisRequest;
import com.casino.mis.finance.dto.GameAnalysisResponse;
import com.casino.mis.finance.service.GameAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance/game-analysis")
@Tag(name = "Game Analysis", description = "UC13: Анализ выигрышей и проигрышей - оценка RTP, выявление аномальных выигрышей")
public class GameAnalysisController {

    private final GameAnalysisService service;

    public GameAnalysisController(GameAnalysisService service) {
        this.service = service;
    }

    // UC13: Анализ выигрышей и проигрышей
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Проанализировать игровые сессии", description = "UC13: Расчёт RTP (Return to Player), суммарных ставок и выигрышей. Выявление крупных/частых выигрышей с передачей в UC12. При отклонении RTP отмечается для UC17.")
    public GameAnalysisResponse analyze(@RequestBody @Valid GameAnalysisRequest request) {
        GameSessionAnalysis analysis = service.analyzeGameSessions(request);
        return toResponse(analysis);
    }

    @GetMapping("/{id}")
    public GameAnalysisResponse getById(@PathVariable UUID id) {
        return toResponse(service.findById(id));
    }

    @GetMapping("/table/{gameTableId}")
    public List<GameAnalysisResponse> getByGameTable(@PathVariable String gameTableId) {
        return service.findByGameTableId(gameTableId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private GameAnalysisResponse toResponse(GameSessionAnalysis analysis) {
        return new GameAnalysisResponse(
                analysis.getId(),
                analysis.getGameTableId(),
                analysis.getPeriodStart(),
                analysis.getPeriodEnd(),
                analysis.getTotalSessions(),
                analysis.getTotalBets(),
                analysis.getTotalWins(),
                analysis.getRtp(),
                analysis.getExpectedRtp(),
                analysis.getRtpDeviation(),
                analysis.getLargeWinsCount(),
                analysis.getLargestWinAmount(),
                analysis.getStatus(),
                analysis.getAnalyzedAt(),
                analysis.getNotes()
        );
    }
}

