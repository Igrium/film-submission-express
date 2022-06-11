package com.igrium.fse.pipeline;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Credentials {
    private static Gson gson = new GsonBuilder().create();

    private String username;
    private String password;

    public Credentials(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String toJson() {
        return gson.toJson(this);
    }

    public static Credentials fromJson(String json) {
        return gson.fromJson(json, Credentials.class);
    }
}
