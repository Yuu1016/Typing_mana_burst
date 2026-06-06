package com.typinggame.backendSpr.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.typinggame.backendSpr.Entity.User;

public interface UserRepository extends JpaRepository<User, Long>{

}
