package com.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import java.util.Date;

@Entity
public class User {

    @javax.persistence.Id
    @GeneratedValue()
    private Integer id;

    private String name;
    private String email;
    private String gender;
    private Date birthDate;
    private String zipCode;
    private IntensityLevel soccerIntensityLevel;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public IntensityLevel getSoccerIntensityLevel() {
        return soccerIntensityLevel;
    }

    public void setSoccerIntensityLevel(IntensityLevel soccerIntensityLevel) {
        this.soccerIntensityLevel = soccerIntensityLevel;
    }
}
