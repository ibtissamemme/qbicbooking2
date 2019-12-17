# Architecture

## Usage
See below.

## Code
Badly written in Ionic 3, Angular 5.

## Logic
The home page holds most of the business logic.
There is a refresh loop which calls the API and updates :
* Header time
* The internal meeting list
* The led colors
* Update the button array if a date is a new button to display
The API call also push the meeting list to the buttons.

Logic for the button colors is inside the button component.
TODO : use a state instead of the SASS color variable.

## Buttons
Each button keeps the date time it needs to display, it is also used to compute the color of the button.
Button behaviour is based on event emitters and subscriptions.
Color is updated base on the button that was tapped and the meeting list.

## Pincode
There are 3 instances of the pincode component:
* Admin screen
* New booking screen
* Update booking

TODO : The new booking screen and the update should be refactored to get only one.
TODO : I started implementing the NFC, especially for the admin screen, not finished as of now.

## Storage
Default parameters are stored in the env files.
On change in the admin screen, they are stored in the device local storage.
For more info on the ionic ENV variables, see the end of this:
https://github.com/gshigeto/ionic-environment-variables

## Colors
Colors have to be declared in both the theme and the environment files.
2 sets of variables, for the main colors of the application and for the LED colors.

## LED colors
LEDs are used via the Qbic local API.
http://share.qbictechnology.com/support/sample/1050_rest.html


# MISC

## Language
Uses ngx-translate.
Add your translation file to the assets.
Add the language declaration to the app.compomnent.ts file.
By default, fr and en are supported.

The translate module must be imported in all components modules which use translation, even if it is exported in the app.module.ts, because javascript...

## Sentry
Sentry is configured in this project but for some reason, the sourcemaps are not correctly generated.

# Installation
This version needs the updated version of the firmware
QbicWebview-Flex-ota-2018_07_26-17_15_22-signed.zip
The firmware is here: 
https://app.box.com/s/gtm6xj23uoeabaqrxu5el66q426cb9g4

Update can be done via the RCC
http://share.qbictechnology.com/external_share/qrc/index.html#/configuration/

Start content should be
fr.safeware.qbicbooking2/.MainActivity

The tablet should be in fullscreen mode, without the Android native mode activated.

# Workspace installation

1. Use node 8.11.2
```nvm use 8.11.2```

2. Install Ionic 3.1.9
```npm install ionic@3.1.9```

3. Install and setup Java JDK 1.8 (not a later version...)

4. Configure keystore and add signing key with `androidRelease` alias

5. Download and install Android Tooling

6. Install Android SDK, version 26

7. Add SDK bin directory to the path => get `zipalign` tool callable from the command line

8. Install Cordova 7.1.0
```npm install```

9. Add android platform
```ionic cordova platform add android@6.4.0```

10. Adjust keystore path and custom environment variables in the package JSON

11. For testing only. add browser platform
```ionic cordova platform add browser```

# Build and release

1. Customise environments in `src/environments`
1. Update the `package.json` => `custom_env` variable
1. Serve with `ionic:serve`
1. Build with `ionic:release`
1. Release APK will be available in the `release` directory
