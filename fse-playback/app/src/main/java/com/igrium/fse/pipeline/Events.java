package com.igrium.fse.pipeline;

public final class Events {

    public static record ModifyFilmEvent(String id, FilmInfo film) {}
}
