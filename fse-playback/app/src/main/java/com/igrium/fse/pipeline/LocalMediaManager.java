package com.igrium.fse.pipeline;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.locks.LockSupport;
import java.util.function.BiConsumer;
import java.util.function.Function;

public class LocalMediaManager {

    protected Function<String, URLConnection> downloadFunction;
    protected BiConsumer<String, Throwable> exceptionHandler;

    protected List<BiConsumer<String, Float>> downloadUpdateListeners = new ArrayList<>();

    private Path mediaPath;
    private String fileExtension = ".mp4";

    private Thread thread;
    private String downloading;

    private Queue<String> downloadQueue = new ConcurrentLinkedQueue<>();
    
    /**
     * Create a local media manager.
     * @param mediaPath Folder to store the local files in.
     * @throws IOException If the media path is inaccessable.
     */
    public LocalMediaManager(Path mediaPath) throws IOException {
        this.mediaPath = mediaPath;
        if (!Files.isDirectory(mediaPath)) {
            throw new FileNotFoundException("Unknown directory: "+mediaPath);
        }

        Files.createDirectory(mediaPath.resolve("downloading"));
    }

    public void start() {
        if (downloadFunction == null) {
            throw new IllegalStateException("Download function has not been set.");
        }
        if (thread != null) {
            throw new IllegalStateException("Media manager is already running!");
        }

        thread = new Thread(this::runThread, "Local Media Manager");
        thread.start();
    }

    /**
     * Queue a film for download.
     * @param id ID of the film.
     */
    public void queueDownload(String id) {
        downloadQueue.add(id);
        LockSupport.unpark(thread);
    }

    /**
     * Replace the contents of the download queue.
     * @param queue New queue contents.
     */
    public void setDownloadQueue(List<String> queue) {
        downloadQueue.clear();
        downloadQueue.addAll(queue);
        LockSupport.unpark(thread);
    }

    public void setDownloadFunction(Function<String, URLConnection> downloadFunction) {
        if (thread != null) {
            throw new IllegalStateException(
                "Download function cannot be changed while manager is running.");
        }
        this.downloadFunction = downloadFunction;
    }

    public void setExceptionHandler(BiConsumer<String, Throwable> exceptionHandler) {
        this.exceptionHandler = exceptionHandler;
    }

    public void onDownloadUpdate(BiConsumer<String, Float> listener) {
        downloadUpdateListeners.add(listener);
    }

    public void removeListener(Object listener) {
        downloadUpdateListeners.remove(listener);
    }

    public String getFileExtension() {
        return fileExtension;
    }

    public void setFileExtension(String fileExtension) {
        if (!fileExtension.startsWith(".")) fileExtension = "."+fileExtension;
        this.fileExtension = fileExtension;
    }

    public Path getMediaPath() {
        return mediaPath;
    }

    /**
     * Get the currently downloading film.
     * 
     * @return The ID of the currently downloading film, or <code>null</code> if
     *         nothing is downloading.
     */
    public String getDownloading() {
        return downloading;
    }

    /**
     * Get the local file of a film.
     * @param id Film ID.
     * @return Local file path. File may or may not exist.
     */
    public Path getLocalMediaFile(String id) {
        return mediaPath.resolve(id + fileExtension);
    }

    public Path getDownloadPath(String id) {
        return mediaPath.resolve("downloading").resolve(id + fileExtension);
    }

    /**
     * Determine if a film is present on the local machine.
     * @param id Film ID.
     * @return Is it local? False if still downloading.
     */
    public boolean isLocal(String id) {
        return Files.exists(getLocalMediaFile(id));
    }

    private void runThread() {
        while (true) {
            String id;
            while ((id = downloadQueue.poll()) != null) {
                downloading = id;
                try {
                    URLConnection connection = downloadFunction.apply(id);
                    long totalLength = connection.getContentLengthLong();
                    long totalBytesRead = 0;

                    InputStream in = new BufferedInputStream(connection.getInputStream());
                    OutputStream out = new BufferedOutputStream(
                            Files.newOutputStream(getDownloadPath(id)));
                    
                    int bytesRead;
                    byte[] dataBuffer = new byte[1024];
                    while ((bytesRead = in.read(dataBuffer, 0, 1024)) >= 0) {
                        out.write(dataBuffer, 0, bytesRead);
                        totalBytesRead += bytesRead;

                        for (BiConsumer<String, Float> listener : downloadUpdateListeners) {
                            listener.accept(id, (float) totalBytesRead / (float) totalLength);
                        }
                    }
                    Files.move(getDownloadPath(id), getLocalMediaFile(id));
                    for (BiConsumer<String, Float> listener : downloadUpdateListeners) {
                        listener.accept(id, 1.0f);
                    }

                } catch (Exception e) {
                    if (exceptionHandler != null) {
                        exceptionHandler.accept(id, e);
                    } else {
                        e.printStackTrace();
                    }
                }
                downloading = null;
            }
            LockSupport.park();
        }
    }
}
 