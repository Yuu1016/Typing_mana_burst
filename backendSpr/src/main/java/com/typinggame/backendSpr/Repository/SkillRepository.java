package com.typinggame.backendSpr.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.typinggame.backendSpr.Entity.Skill;

public interface SkillRepository extends JpaRepository<Skill, Long>{

}
