package com.igrium.fse.pipeline;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpTimeoutException;
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
     * @return Server address.
     */
    public URI getAddress() {
        return address;
    }

    public Credentials getCredentials() {
        return credentials;
    }

    /**
     * Attempt to connect to a server.
     * 
     * @param credentials Server credentials to use.
     * @return A future that completes if the connection is successful and fails
     *         if it is not.
     */
    public static CompletableFuture<ServerConnection> connect(URI address, Credentials credentials) {
        HttpClient client = HttpClient.newBuilder().build();
        URI login = address.resolve("/api/users/login");

        HttpRequest loginRequest = HttpRequest.newBuilder()
                .uri(login)
                .timeout(TIMEOUT)
                .POST(BodyPublishers.ofString(credentials.toJson()))
                .build();
        
        CompletableFuture<ServerConnection> future = client.sendAsync(loginRequest, BodyHandlers.ofString())
                .handle((res, e) -> {
                    if (e instanceof HttpTimeoutException) {
                        throw FailedLoginException.timeout();
                    } else if (e != null) {
                        throw FailedLoginException.unknown(e);
                    }

                    if (res.statusCode() == 401) {
                        throw FailedLoginException.failedAuth(401);
                    } else if (res.statusCode() >= 400) {
                        throw FailedLoginException.failedConnection(res.statusCode());
                    }

                    return new ServerConnection(client, address, credentials);
                });

        return future;
    }
}
