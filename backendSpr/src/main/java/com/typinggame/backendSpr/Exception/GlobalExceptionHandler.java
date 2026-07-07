package com.typinggame.backendSpr.Exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // あらゆるエラーをキャッチするメソッド
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        // ① バックエンドのコンソールにエラー詳細（スタックトレース）を出力する
        e.printStackTrace();

        // ② フロントエンドの apiClient.ts にエラーの理由をJSONで返す
        Map<String, String> response = new HashMap<>();
        response.put("message", "サーバーエラー: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // @NotNull などのバリデーションエラー用
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "入力データに不備があります");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}