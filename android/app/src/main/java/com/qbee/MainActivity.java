package com.qbee;

import com.facebook.react.ReactActivity;
import com.AirMaps.AirPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import com.magus.fblogin.FacebookLoginPackage;
import me.nucleartux.date.ReactDatePackage;
import com.devfd.RNGeocoder.RNGeocoderPackage;
import android.content.Intent;
import com.imagepicker.ImagePickerPackage;
import com.BV.LinearGradient.LinearGradientPackage;

import java.util.Arrays;
import java.util.List;

public class MainActivity extends ReactActivity {

    private ImagePickerPackage mImagePicker;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "qbee";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    @Override
    public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        mImagePicker.handleActivityResult(requestCode, resultCode, data);
    }

   /**
   * A list of packages used by the app. If the app uses additional views
   * or modules besides the default ones, add more packages here.
   */
    @Override
    protected List<ReactPackage> getPackages() {
      mImagePicker = new ImagePickerPackage(this);

      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new AirPackage(),
        new ReactDatePackage(this),
        new RNGeocoderPackage(),
        mImagePicker,
        new LinearGradientPackage(),
        new FacebookLoginPackage()
      );
    }
}
