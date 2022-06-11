package com.igrium.fse.ui;

import java.io.IOException;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.layout.VBox;

public class MainPanel {

    @FXML
    private VBox root;

    public VBox getRoot() {
        return root;
    }

    public static MainPanel open() {
        FXMLLoader loader = new FXMLLoader(MainPanel.class.getResource("/ui/main_panel.fxml"));
        try {
            loader.load();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return loader.getController();
    }
}
