package com.typinggame.backendSpr.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.typinggame.backendSpr.Entity.BattleLog;

public interface BattleLogRepository extends JpaRepository<BattleLog, Long>{

}
