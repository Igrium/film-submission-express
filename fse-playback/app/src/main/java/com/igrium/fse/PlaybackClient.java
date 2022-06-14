package com.igrium.fse;

import java.io.IOException;
import java.nio.file.Paths;

import javax.annotation.Nullable;

import com.igrium.fse.pipeline.LocalMediaManager;
import com.igrium.fse.pipeline.ServerConnection;
import com.igrium.fse.ui.ExceptionDialog;
import com.igrium.fse.ui.LoginScreen;
import com.igrium.fse.ui.MainPanel;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class PlaybackClient extends Application {

    private static PlaybackClient instance;

    public static PlaybackClient getInstance() {
        return instance;
    }

    public static void main(String[] args) {
        launch(args);
    }

    private Stage stage;
    private MainPanel mainPanel;
    private LoginScreen loginScreen;

    private ServerConnection serverConnection;

    public Stage getStage() {
        return stage;
    }

    public MainPanel getMainPanel() {
        return mainPanel;
    }

    public ServerConnection getServerConnection() {
        return serverConnection;
    }

    @Override
    public void start(Stage primaryStage) throws Exception {
        instance = this;
        this.stage = primaryStage;

        primaryStage.setTitle("Hello World");
        mainPanel = MainPanel.open();

        primaryStage.setScene(new Scene(mainPanel.getRoot()));
        primaryStage.show();

        showLoginScreen();
    }

    public void showLoginScreen() {
        loginScreen = LoginScreen.open(stage, this::onLogin);
    }

    protected void onLogin(ServerConnection connection) {
        loginScreen.close();
        loginScreen = null;
        serverConnection = connection;
        try {
            LocalMediaManager mediaManager = createLocalMediaManager();
            connection.setupLocalMediaManager(mediaManager);
            mediaManager.start();
        } catch (IOException e) {
            displayExceptionDialog(e, "Unable to create local media manager!");
        }
    }

    private LocalMediaManager createLocalMediaManager() throws IOException {
        LocalMediaManager manager = new LocalMediaManager(Paths.get("media"));
        manager.setExceptionHandler((filmID, e) -> {
            displayExceptionDialog(e, "Unable to download film: "+filmID);
        });
        return manager;
    }

    /**
     * Display an exception dialog.
     * @param e The exception to display.
     * @param header The header text (optional)
     */
    public void displayExceptionDialog(Throwable e, @Nullable String header) {
        if (!Platform.isFxApplicationThread()) {
            Platform.runLater(() -> displayExceptionDialog(e, header));
            return;
        }

        ExceptionDialog dialog = new ExceptionDialog();
        dialog.setException(e);
        if (header != null) {
            dialog.setHeaderText(header);
        }
        dialog.showAndPrint();
    }
    
}
