package com.banking;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ActivityEventListener;
import com.eze.api.EzeAPI;
import org.json.JSONObject;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.io.File;

public class ReceiptPrinterModule extends ReactContextBaseJavaModule {
    private static final int REQUEST_CODE_INITIALIZE = 10001;
    private static final int REQUEST_CODE_PRINT_BITMAP = 10029;

    private Callback callback;

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == REQUEST_CODE_INITIALIZE) {
                handleInitializeResult(resultCode, data);
            } else if (requestCode == REQUEST_CODE_PRINT_BITMAP) {
                handlePrintResult(resultCode, data);
            }
        }
    };

    public ReceiptPrinterModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(mActivityEventListener);
    }

    @Override
    public String getName() {
        return "ReceiptPrinter";
    }

    @ReactMethod
    public void initializeEzeAPI(Callback callback) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            try {
                JSONObject jsonRequest = new JSONObject();
                // jsonRequest.put("demoAppKey", "a40c761a-b664-4bc6-ab5a-bf073aa797d5");
                // jsonRequest.put("prodAppKey", "a40c761a-b664-4bc6-ab5a-bf073aa797d5");
                // jsonRequest.put("merchantName", "SYNERGIC_SOFTEK_SOLUTIONS");
                // jsonRequest.put("userName", "9903044748");
                // jsonRequest.put("currencyCode", "INR");
                // jsonRequest.put("appMode", "DEMO");
                // jsonRequest.put("captureSignature", false);
                // jsonRequest.put("prepareDevice", false);
                //
                jsonRequest.put("demoAppKey", "821595fb-c14f-4cff-9fb5-c229b4f3325d");
                jsonRequest.put("prodAppKey", "821595fb-c14f-4cff-9fb5-c229b4f3325d");
                jsonRequest.put("merchantName", "NILACHAKRA_MULTIPURPOSE_C");
                jsonRequest.put("userName", "5551713830");
                jsonRequest.put("currencyCode", "INR");
                jsonRequest.put("appMode", "PROD");
                jsonRequest.put("captureSignature", false);
                jsonRequest.put("prepareDevice", false);
                //
                // jsonRequest.put("demoAppKey", "8b94d199-d50e-466b-9471-126ba33c0cdf");
                // jsonRequest.put("prodAppKey", "8b94d199-d50e-466b-9471-126ba33c0cdf");
                // jsonRequest.put("merchantName", "SYNERGIC_SOFTEK_SOLUT_SBI");
                // jsonRequest.put("userName", "2115350300");
                // jsonRequest.put("currencyCode", "INR");
                // jsonRequest.put("appMode", "PROD");
                // jsonRequest.put("captureSignature", false);
                // jsonRequest.put("prepareDevice", false);

                this.callback = callback;
                EzeAPI.initialize(activity, REQUEST_CODE_INITIALIZE, jsonRequest);
            } catch (Exception e) {
                callback.invoke("Exception: " + e.getMessage());
            }
        } else {
            callback.invoke("Activity is null");
        }
    }

    @ReactMethod
    public void printCustomReceipt(String base64String, Callback callback) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Bitmap bitmap = decodeBase64ToBitmap(base64String);
            try {
                JSONObject jsonRequest = new JSONObject();
                JSONObject jsonImageObj = new JSONObject();

                String encodedImageData = getEncoded64ImageStringFromBitmap(bitmap);

                jsonImageObj.put("imageData", encodedImageData);
                jsonImageObj.put("imageType", "JPEG");
                jsonImageObj.put("height", "");
                jsonImageObj.put("weight", "");

                jsonRequest.put("image", jsonImageObj);

                this.callback = callback;
                EzeAPI.printBitmap(activity, REQUEST_CODE_PRINT_BITMAP, jsonRequest);
            } catch (Exception e) {
                callback.invoke("Exception: " + e.getMessage());
            }
        } else {
            callback.invoke("Activity is null");
        }
    }

    /**
     * New method for printing large or long images via internal storage file.
     * 
     * @param filePath The public path of the saved image.
     */
    @ReactMethod
    public void printLargeReceipt(String filePath, Callback callback) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            File file = new File(filePath);
            if (!file.exists()) {
                callback.invoke("File not found at " + filePath);
                return;
            }

            try {
                JSONObject jsonRequest = new JSONObject();
                JSONObject jsonImageObj = new JSONObject();

                jsonImageObj.put("imageData", filePath);
                jsonImageObj.put("imageType", "file");
                jsonImageObj.put("height", "");
                jsonImageObj.put("weight", "");

                jsonRequest.put("image", jsonImageObj);

                this.callback = callback;
                EzeAPI.printBitmap(activity, REQUEST_CODE_PRINT_BITMAP, jsonRequest);
            } catch (Exception e) {
                callback.invoke("Exception: " + e.getMessage());
            }
        } else {
            callback.invoke("Activity is null");
        }
    }

    private void handleInitializeResult(int resultCode, Intent data) {
        if (data != null && data.hasExtra("response")) {
            try {
                JSONObject response = new JSONObject(data.getStringExtra("response"));
                if (resultCode == Activity.RESULT_OK && response.has("result")) {
                    callback.invoke("Initialization successful");
                } else if (resultCode == Activity.RESULT_CANCELED && response.has("error")) {
                    JSONObject error = response.getJSONObject("error");
                    String errorCode = error.getString("code");
                    String errorMessage = error.getString("message");
                    callback.invoke("Initialization failed: " + errorCode + " - " + errorMessage);
                }
            } catch (Exception e) {
                e.printStackTrace();
                callback.invoke("Exception: " + e.getMessage());
            }
        }
    }

    private void handlePrintResult(int resultCode, Intent data) {
        if (data != null && data.hasExtra("response")) {
            try {
                JSONObject response = new JSONObject(data.getStringExtra("response"));
                if (resultCode == Activity.RESULT_OK && response.has("result")) {
                    callback.invoke("Print successful");
                } else if (resultCode == Activity.RESULT_CANCELED && response.has("error")) {
                    JSONObject error = response.getJSONObject("error");
                    String errorCode = error.getString("code");
                    String errorMessage = error.getString("message");
                    callback.invoke("Print failed: " + errorCode + " - " + errorMessage);
                }
            } catch (Exception e) {
                e.printStackTrace();
                callback.invoke("Exception: " + e.getMessage());
            }
        }
    }

    private String getEncoded64ImageStringFromBitmap(Bitmap bitmap) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(byteArray, Base64.DEFAULT);
    }

    private Bitmap decodeBase64ToBitmap(String base64Str) {
        byte[] decodedBytes = Base64.decode(base64Str, Base64.DEFAULT);
        return BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
    }
}
