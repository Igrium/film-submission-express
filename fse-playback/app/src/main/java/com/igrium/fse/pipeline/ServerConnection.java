package com.igrium.fse.pipeline;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.net.http.HttpClient.Version;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

/**
 * Represents a connection to an fse server.
 */
public class ServerConnection {
    public static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final HttpClient httpClient;
    private final URI address;
    private final Credentials credentials;

    protected ServerConnection(HttpClient httpClient, URI address, Credentials credentials) {
        this.httpClient = httpClient;
        this.address = address;
        this.credentials = credentials;
    }

    public HttpClient getHttpClient() {
        return httpClient;
    }

    /**
     * Get the address of the FSE server.
     * 
     * @return Server address.
     */
    public URI getAddress() {
        return address;
    }

    public Credentials getCredentials() {
        return credentials;
    }

    protected static ServerConnection connectSync(URI address, Credentials credentials) throws FailedLoginException {
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
        return CompletableFuture.supplyAsync(() -> connectSync(address, credentials));
    }
}
