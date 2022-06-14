package com.igrium.fse.pipeline;

import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;

public record FilmInfo(
    String producer,
    String title,
    String email,
    String filename,
    float length,
    int uploadState,
    int approvalState
) {
    private static Gson gson = new Gson();
    
    public static class UploadState {
        public static int UPLOADING = 0;
        public static int PROCESSING  = 1;
        public static int PROCESSING_PREVIEW = 2;
        public static int READY = 3;
    }

    public static class ApprovalState {
        public static int PENDING = 0;
        public static int APPROVED = 1;
        public static int REJECTED = 2;
    }

    public static class DownloadState {
        public static int WAITING = 0;
        public static int DOWNLOADING = 1;
        public static int READY = 2;
    }

    public static record DownloadStatus(
        float percent,
        int state
    ) {
        public JSONObject toJSONObject() throws JSONException {
            JSONObject obj = new JSONObject();
            obj.put("percent", this.percent);
            obj.put("state", this.state);
            return obj;
        }
    }

    public static class UploadStatus {
        
    }

    public String toJson() {
        return gson.toJson(this);
    }

    public static FilmInfo fromJson(String json) {
        return gson.fromJson(json, FilmInfo.class);
    }
    
}
