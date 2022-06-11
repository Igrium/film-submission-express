package com.igrium.fse.pipeline;

public class FailedLoginException extends RuntimeException {
    public enum Type {
        TIMEOUT,
        FAILED_AUTH,
        FAILED_CONNECTION,
        UNKNOWN
    }

    private Type type = Type.UNKNOWN;
    private int statusCode = -1;

    public Type getType() {
        return type;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public static FailedLoginException failedAuth(int statusCode) {
        return new FailedLoginException("Username or password was incorrect.",
                Type.FAILED_AUTH, statusCode);
    }

    public static FailedLoginException failedConnection(int statusCode) {
        return new FailedLoginException("The server returned status code " + statusCode,
                Type.FAILED_CONNECTION, statusCode);
    }

    public static FailedLoginException timeout() {
        return new FailedLoginException("Connection timed out.", Type.TIMEOUT);
    }

    public static FailedLoginException unknown(Throwable cause) {
        return new FailedLoginException("An unknown exception occured trying to log in.",
                Type.UNKNOWN, cause);
    }

    public FailedLoginException(Type type, int statusCode) {
        this.type = type;
        this.statusCode = statusCode;
    }

    public FailedLoginException(String message, Type type, int statusCode) {
        super(message);
        this.type = type;
        this.statusCode = statusCode;
    }

    public FailedLoginException(Type type, int statusCode, Throwable cause) {
        super(cause);
        this.type = type;
        this.statusCode = statusCode;
    }

    public FailedLoginException(String message, Type type, int statusCode, Throwable cause) {
        super(message, cause);
        this.type = type;
        this.statusCode = statusCode;
    }

    public FailedLoginException(String message, Type type, Throwable cause) {
        super(message, cause);
        this.type = type;
    }

    public FailedLoginException(Type type, Throwable cause) {
        super(cause);
        this.type = type;
    }

    public FailedLoginException(String message, Type type) {
        super(message);
        this.type = type;
    }

    public FailedLoginException(Type type) {
        this.type = type;
    }
}
