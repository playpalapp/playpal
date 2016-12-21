package com.controller;

import com.entity.Match;
import com.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/rest/match")
public class    MatchController {

    @Autowired
    MatchRepository matchRepository;

    @RequestMapping(value="",method = RequestMethod.GET)
    public ResponseEntity<Iterable<Match>> findAll() {
        return new ResponseEntity<Iterable<Match>>(matchRepository.findAll(), HttpStatus.OK);
    }

    @RequestMapping(value="/{id}",method = RequestMethod.GET)
    public ResponseEntity<Match> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<Match>(matchRepository.findOne(id), HttpStatus.OK);
    }

    @RequestMapping(value = "", method = RequestMethod.PUT)
    public ResponseEntity<Match> update(@RequestBody Match match) {
        return new ResponseEntity<Match>(matchRepository.save(match), HttpStatus.OK);
    }

    @RequestMapping(value = "", method = RequestMethod.POST)
    public ResponseEntity<Map<String,List<Match>>> create(@RequestBody Match match) {
        match = matchRepository.save(match);
        Map<String,List<Match>> retorno = new HashMap<>();
        if(match != null){
            retorno = findByDate();
        }
        return new ResponseEntity<Map<String,List<Match>>>(retorno, HttpStatus.OK);
    }

    @RequestMapping(value="/{id}",method = RequestMethod.DELETE)
    public ResponseEntity<Match> delete(@PathVariable("id") Integer id) {
        if(matchRepository.exists(id)){
            Match match = matchRepository.findOne(id);
            matchRepository.delete(match);
            return new ResponseEntity<Match>(match, HttpStatus.OK);
        }else{
            return new ResponseEntity<Match>(new Match(), HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(value="/matchbydate",method = RequestMethod.GET)
    public ResponseEntity<Map<String,List<Match>>> findbyDate() {

        return new ResponseEntity<Map<String,List<Match>>>(findByDate(), HttpStatus.OK);
    }

    private Map<String,List<Match>> findByDate(){
        List<Object> list = new LinkedList<>();
        Iterable<Match> matchs = matchRepository.findAll();
        Map<String,List<Match>> retorno = new HashMap<>();

        SimpleDateFormat dt1 = new SimpleDateFormat("MM/dd/YYYY");

        for (Match m: matchs) {
            if(retorno.containsKey(dt1.format(m.getDate()))){

                retorno.get(dt1.format(m.getDate())).add(m);
            }else{
                List<Match> a = new LinkedList<>();
                a.add(m);
                retorno.put(dt1.format(m.getDate()),a);
            }
        }
        retorno.forEach((a,b)->{
            b.stream().sorted(new Comparator<Match>() {
                @Override
                public int compare(Match o1, Match o2) {
                    System.out.println("DATA I" + o1.toString());
                    System.out.println("DATA II" + o2.toString());
                    return o1.getDate().compareTo(o2.getDate());
                }
            });
        });
        return retorno;
    }

}
