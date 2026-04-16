package com.phytosend.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Iterator;

@Service
public class WikipediaService {

    private final RestTemplate restTemplate = new RestTemplate();

    public String ottieniFotoWikipedia(String nomeScientifico) {
        String url = "https://it.wikipedia.org/w/api.php?action=query&titles=" + nomeScientifico
                + "&prop=pageimages&format=json&piprop=original";

        try {
            JsonNode risposta = restTemplate.getForObject(url, JsonNode.class);

            if (risposta != null && risposta.has("query") && risposta.get("query").has("pages")) {
                JsonNode pages = risposta.get("query").get("pages");

                Iterator<JsonNode> elements = pages.elements();
                while (elements.hasNext()) {
                    JsonNode pageInfo = elements.next();
                    if (pageInfo.has("original") && pageInfo.get("original").has("source")) {
                        return pageInfo.get("original").get("source").asText();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Impossibile reperire foto Wikipedia per " + nomeScientifico + ": " + e.getMessage());
        }
        return null;
    }
}
