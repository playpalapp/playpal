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

	@Bean
	public CommandLineRunner loadData(MatchRepository matchRepository){
		return (args) ->{

			Match match = new Match();
			match.setIntensityLevel(IntensityLevel.ALL);

			match.setGender(Gender.COED);

			match.setCity("Flushing");

			Date myDate = new Date();
			match.setDate(myDate);
			match.setState("NY");
			match.setStreet("60-30 70th Street");
			match.setZipcode("11378");
			match.setName("Pelada dos amigos!");
			match.setShirtColor("Red and White");
			match.setNumberOfPlayers(10);

			matchRepository.save(match);
		};
	}
}
