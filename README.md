# Architecture

## Usage
Launch: `yarn ionic:serve`

Release: `yarn ionic:release`

You will need a certificate store for the release on android and a ios dev env for the ios release.

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

# update on the device
This version needs the updated version of the firmware
QbicWebview-Flex-ota-2018_07_26-17_15_22-signed.zip

Update can be done via the RCC
http://share.qbictechnology.com/external_share/qrc/index.html#/configuration/

Start content should be
fr.safeware.qbicbooking2/.MainActivity

