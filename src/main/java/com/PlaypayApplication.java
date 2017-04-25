package com;

import com.entity.*;
import com.repository.MatchRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Date;

@SpringBootApplication
public class PlaypayApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlaypayApplication.class, args);
	}
}
