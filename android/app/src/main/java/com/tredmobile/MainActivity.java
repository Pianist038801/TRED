package com.tredmobile;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import com.reactnative.notification.ReactNativeNotificationPackage;
import com.rnfs.RNFSPackage;
import com.baebae.reactnativecamera.CameraViewPackage;
import com.robinpowered.react.Intercom.IntercomPackage;
import io.intercom.android.sdk.Intercom;
import com.chymtt.reactnativedropdown.DropdownPackage;
import com.tred.reactnativecroptool.ReactNativeCropToolPackage;
import com.RNMixpanel.RNMixpanelPackage;
import com.AirMaps.AirPackage;
import com.burnweb.rnsendintent.RNSendIntentPackage;
import com.tune.Tune;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "TredMobile";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

   /**
   * A list of packages used by the app. If the app uses additional views
   * or modules besides the default ones, add more packages here.
   */
    @Override
    protected List<ReactPackage> getPackages() {
      if(BuildConfig.DEBUG){
          //Staging
          Intercom.initialize(getApplication(), "android_sdk-07c1761afb8d2cbd72053bcc1d8cfe06be891c39", "rt4wkcg2");
      } else {
          //Production
          Intercom.initialize(getApplication(), "android_sdk-bb15cc69f44e17c3eae8970fc6fd68275b679012", "a0z9ng0t");
      }
      if(!BuildConfig.DEBUG){
          Tune.init(getApplication(), "190547", "9a652aa94e0e84487aae98fbe8f888ec");
          Tune.getInstance().setReferralSources(this);
          Tune.getInstance().measureSession();
      }
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new RNFSPackage(),
        new CameraViewPackage(this),
        new IntercomPackage(),
        new DropdownPackage(),
        new ReactNativeCropToolPackage(),
        new RNMixpanelPackage(),
        new AirPackage(),
        new ReactNativeNotificationPackage(this),
        new RNSendIntentPackage()
      );
    }
}
