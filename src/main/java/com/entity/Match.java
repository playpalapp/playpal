package com.entity;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity
public class Match implements Serializable {

    @Id
    @GeneratedValue()
    private Integer id;

    private String name;
    private Gender gender;
    private IntensityLevel intensityLevel;
    private String street;
    private String city;
    private String state;
    private String zipcode;

    private Date date;


    private Integer numberOfPlayers;
    private String shirtColorOne;

    private String shirtColorTwo;

    private String otherDetails;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public IntensityLevel getIntensityLevel() {
        return intensityLevel;
    }

    public void setIntensityLevel(IntensityLevel intensity) {
        this.intensityLevel = intensity;
    }

    @OneToMany(targetEntity = User.class,fetch = FetchType.EAGER)
    private List<User> players;


    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipcode() {
        return zipcode;
    }

    public void setZipcode(String zipcode) {
        this.zipcode = zipcode;
    }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }


    public List<User> getPlayers() {
        return players;
    }

    public void setPlayers(List<User> players) {
        this.players = players;
    }

    public Integer getNumberOfPlayers() {
        return numberOfPlayers;
    }

    public void setNumberOfPlayers(Integer numberOfPlayers) {
        this.numberOfPlayers = numberOfPlayers;
    }

    public String getShirtColorOne() {
        return shirtColorOne;
    }

    public void setShirtColorOne(String shirtColorOne) {
        this.shirtColorOne = shirtColorOne;
    }

    public String getShirtColorTwo() {
        return shirtColorTwo;
    }

    public void setShirtColorTwo(String shirtColorTwo) {
        this.shirtColorTwo = shirtColorTwo;
    }

    public String getOtherDetails() {
        return otherDetails;
    }

    public void setOtherDetails(String otherDetails) {
        this.otherDetails = otherDetails;
    }
}
