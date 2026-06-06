package com.typinggame.backendSpr.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.typinggame.backendSpr.Entity.UserDeck;

public interface UserDeckRepository extends JpaRepository<UserDeck, Long>{

}
