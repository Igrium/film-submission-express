package com.igrium.fse.pipeline;

import java.io.IOException;
import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.net.http.HttpClient.Version;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.igrium.fse.pipeline.Events.ModifyFilmEvent;
import com.igrium.fse.pipeline.FailedLoginException.Type;

import com.igrium.fse.util.EventDispatcher;

import io.socket.client.Ack;
import io.socket.client.IO;
import io.socket.client.Socket;

/**
 * Represents a connection to an fse server.
 */
public class ServerConnection extends EventDispatcher<String> {
    public static final Duration TIMEOUT = Duration.ofSeconds(5);
    
    IO.Options socketOptions = IO.Options.builder().build();

    private final HttpClient httpClient;
    private final URI address;
    private final Credentials credentials;

    protected Map<String, FilmInfo> films = new HashMap<>();
    protected List<String> order = new ArrayList<>();
    protected LocalMediaManager mediaManager;

    private Socket socket;

    protected ServerConnection(HttpClient httpClient, URI address, Credentials credentials) {
        this.httpClient = httpClient;
        this.address = address;
        this.credentials = credentials;

        socket = IO.socket(address);
        socket.on("connect",  (Object[] args) -> {
            System.out.println("Established socket connection.");
        });
        initListeners();

        socket.connect();
    }

    protected void initListeners() {
        socket.on("setFilmOrder", args -> {
            List<String> films = new ArrayList<>();
            JSONArray array = (JSONArray) args[0];
            try {
                for (int i = 0; i < array.length(); i++) {
                    films.add(array.getString(i));
                }
            } catch (JSONException e) {
                e.printStackTrace();
                System.err.println("Unable to parse input from server!");
            }

            this.order = films;
            fireEvent("setFilmOrder", films);
        });

        socket.on("modifyFilm", args -> {
            String id = (String) args[0];
            FilmInfo filmInfo = FilmInfo.fromJson(args[1].toString());

            films.put(id, filmInfo);
            fireEvent("modifyFilm", new ModifyFilmEvent(id, filmInfo));
        });

        socket.on("setDownloadQueue", args -> {
            if (mediaManager == null) return;

            try {
                List<String> queue = new ArrayList<>();
                JSONArray json = (JSONArray) args[0];
                for (int i = 0; i < json.length(); i++) {
                    queue.add(json.getString(i));
                }
                mediaManager.setDownloadQueue(queue);
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        });

        socket.on("queueDownload", args -> {
            if (mediaManager == null) return;
            mediaManager.queueDownload((String) args[0]);
        });

        socket.on("getDownloadStatus", args -> {
            Ack callback = (Ack) args[0];

            if (mediaManager == null) {
                callback.call(new JSONObject());
                return;
            }

            List<String> ids = new ArrayList<>();
            if (args.length > 1) {
                try {
                    JSONArray requested = (JSONArray) args[1];
                    for (int i = 0; i < requested.length(); i++) {
                        ids.add(requested.getString(i));
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                    ids.clear();
                }
            }

            if (ids.size() == 0) {
                ids.addAll(films.keySet());
            }

            JSONObject obj = new JSONObject();

            for (String id : ids) {
                try {
                    obj.put(id, mediaManager.getDownloadStatus(id).toJSONObject());
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            }

            callback.call(obj);
        });
    }

    /**
     * Called when the server has supplied an update to the film order.
     * @param listener Event listener.
     */
    public void onSetFilmOrder(Consumer<List<String>> listener) {
        addListener("setFilmOrder", listener);
    }

    /**
     * Called when an update to a film's metadata comes from the server.
     * @param listener Event listener.
     */
    public void onModifyFilm(Consumer<ModifyFilmEvent> listener) {
        addListener("modifyFilm", listener);
    }
    
 
    public HttpClient getHttpClient() {
        return httpClient;
    }

    /**
     * Get the address of the FSE server..
     * 
     * @return Server address.
     */
    public URI getAddress() {
        return address;
    }

    public Credentials getCredentials() {
        return credentials;
    }

    public Map<String, FilmInfo> getFilms() {
        return films;
    }

    public List<String> getOrder() {
        return order;
    }

    public URI getFilmAddress(String id) {
        return getAddress().resolve("/api/media?id="+id);
    }

    /**
     * Get the file extension of the video files that will be delivered by the server.
     * @return The file extention. Example: ".mp4"
     */
    public String getFileExtension() {
        return ".mp4";
    }

    /**
     * Setup and attach a local media manager to this server connection.
     * @param mediaManager Media manager to use.
     */
    public void setupLocalMediaManager(LocalMediaManager mediaManager) {
        if (mediaManager == null) {
            this.mediaManager = null;
            return;
        }
        mediaManager.setDownloadFunction(id -> {
            return getFilmAddress(id).toURL().openConnection();
        });

        mediaManager.onDownloadUpdate((id, status) -> {
            try {
                JSONObject obj = new JSONObject();
                obj.put(id, mediaManager.getDownloadStatus(id).toJSONObject());
                socket.emit("updateDownloadStatus", obj);
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        });
        this.mediaManager = mediaManager;
    }
    
    /**
     * Get the current local media manager.
     * @return Local media manager, or <code>null</code> if none has been setup.
     */
    public LocalMediaManager getLocalMediaManager() {
        return mediaManager;
    }

    protected static ServerConnection connectImpl(URI address, Credentials credentials) throws FailedLoginException {
        HttpClient client = HttpClient.newBuilder()
                .version(Version.HTTP_1_1)
                .build();
        
        URI login = address.resolve("/api/users/login");

        HttpRequest loginRequest = HttpRequest.newBuilder()
                .uri(login)
                .timeout(TIMEOUT)
                .header("Content-Type", "application/json")
                .POST(BodyPublishers.ofString(credentials.toJson()))
                .build();

        HttpResponse<String> res;
        try {
            res = client.send(loginRequest, BodyHandlers.ofString());
        } catch (HttpTimeoutException e) {
            throw FailedLoginException.timeout();
        } catch (ConnectException e) {
            throw new FailedLoginException("Unable to connect to server.",
                    Type.FAILED_CONNECTION, e);
        } catch (IOException e) {
            throw FailedLoginException.unknown(e);
        } catch (InterruptedException e) {
            throw FailedLoginException.unknown(e);
        }

        if (res.statusCode() == 401) {
            throw FailedLoginException.failedAuth(401);
        } else if (res.statusCode() >= 400) {
            throw FailedLoginException.failedConnection(res.statusCode());
        }

        return new ServerConnection(client, address, credentials);
    }

    /**
     * Attempt to connect to a server.
     * 
     * @param credentials Server credentials to use.
     * @return A future that completes if the connection is successful and fails
     *         if it is not.
     */
    public static CompletableFuture<ServerConnection> connect(URI address, Credentials credentials) {
        return CompletableFuture.supplyAsync(() -> connectImpl(address, credentials));
    }
}
