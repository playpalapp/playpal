package com.config;

import com.config.security.RESTAuthenticationEntryPoint;
import com.config.security.RESTAuthenticationFailureHandler;
import com.config.security.RESTAuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import javax.sql.DataSource;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class ApiSecurityConfig extends WebSecurityConfigurerAdapter {

	private static final String AUTH_URL = "/auth";
	private static final String LOGIN_URL = AUTH_URL.concat("/login");
	private static final String LOGOUT_URL = AUTH_URL.concat("/logout");
	
	@Autowired
	private DataSource dataSource;

	@Autowired
	private RESTAuthenticationEntryPoint authenticationEntryPoint;
	@Autowired
	private RESTAuthenticationFailureHandler authenticationFailureHandler;
	@Autowired
	private RESTAuthenticationSuccessHandler authenticationSuccessHandler;

	@Override
	protected void configure(AuthenticationManagerBuilder authBuilder) throws Exception {
		authBuilder.jdbcAuthentication().dataSource(dataSource)
		.usersByUsernameQuery(
				"select username,password, 1 as enabled from user where username=?")
		.authoritiesByUsernameQuery(
				"select username, role from user where username=?");
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		//http.authorizeRequests().antMatchers("/**").authenticated();
		http.csrf().disable()
		.authorizeRequests()
			.antMatchers(HttpMethod.OPTIONS,"/**").permitAll()
			.antMatchers("/app/**").permitAll()
			.antMatchers(LOGIN_URL).permitAll()
			.antMatchers(LOGOUT_URL).permitAll()
			.antMatchers("/rest/**").permitAll()
			//.antMatchers("/rest/**").authenticated()
			.anyRequest()
			.anonymous()
			.and()
		.exceptionHandling()
		.authenticationEntryPoint(authenticationEntryPoint)
			.and()
		.formLogin()
			.failureHandler(authenticationFailureHandler)
			.successHandler(authenticationSuccessHandler)
			.loginPage(LOGIN_URL)
			.loginProcessingUrl(LOGIN_URL)
			.usernameParameter("username")
			.passwordParameter("password")
			.permitAll()
			.and()
		.logout()
			.logoutUrl(LOGOUT_URL)
			.logoutSuccessUrl("/app/index.html") 
			.permitAll()
			.and()
		.rememberMe()
			.rememberMeCookieName("REMEMBER_ME")
			.rememberMeParameter("remember_me")
			.tokenValiditySeconds(1209600)
			.useSecureCookie(false)
			.key("rem-me-key");		

	}
	
}
