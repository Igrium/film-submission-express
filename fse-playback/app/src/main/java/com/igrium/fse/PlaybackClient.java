package com.igrium.fse;

import com.igrium.fse.ui.LoginScreen;
import com.igrium.fse.ui.MainPanel;

import javafx.application.Application;
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

    public Stage getStage() {
        return stage;
    }

    public MainPanel getMainPanel() {
        return mainPanel;
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
        loginScreen = LoginScreen.open(stage, connection -> {
            System.out.println(connection.getHttpClient());
            loginScreen.close();
            loginScreen = null;
        });
    }
    
}
