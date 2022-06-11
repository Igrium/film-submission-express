package com.igrium.fse.ui;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

import com.igrium.fse.pipeline.Credentials;
import com.igrium.fse.pipeline.ServerConnection;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.TextField;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.Window;

public class LoginScreen {
    private Stage stage;

    protected Consumer<ServerConnection> onConnect;

    @FXML
    private TextField addressField;

    @FXML
    private TextField usernameField;

    @FXML
    private TextField passwordField;

    @FXML
    public void connect() {
        URI uri;
        try {
            uri = new URI(addressField.getText());
        } catch (URISyntaxException e) {
            e.printStackTrace();
            return;
        }

        CompletableFuture<ServerConnection> future = ServerConnection.connect(uri, new Credentials(
            usernameField.getText(),
            passwordField.getText()
        ));

        future.handleAsync((val, e) -> {
            if (e != null) {
                e.printStackTrace();
            } else if (onConnect != null) {
                onConnect.accept(val);
            }

            return null;
        }, Platform::runLater);
    }

    public void close() {
        this.stage.close();
    }

    public static LoginScreen open(Window parent, Consumer<ServerConnection> onConnect) {
        FXMLLoader loader = new FXMLLoader(LoginScreen.class.getResource("/ui/login.fxml"));
        Parent root;
        try {
            root = loader.load();
        } catch (IOException e) {
            throw new RuntimeException(e); // Should never happen
        }

        Scene scene = new Scene(root);
        Stage stage = new Stage();
        stage.setTitle("Connect to Server");
        stage.setScene(scene);
        stage.setResizable(false);
        stage.initModality(Modality.WINDOW_MODAL);
        stage.initOwner(parent);

        stage.show();
        LoginScreen controller = loader.getController();
        controller.onConnect = onConnect;
        controller.stage = stage;

        return controller;
    }
}
