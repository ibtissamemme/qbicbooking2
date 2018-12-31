//r: 61, g:205, b: 88
export const ENV = {
  mode: "Production",
  endpoint:
    "http://accueil.et.services.schneider-electric.com/GesroomRestAPI/Gesroom/API",
  apiKey: "MEI97ZZ8POQFZZ2BIBWJPRNLSLPZ",
  endpoint2:
    "https://staging.safeware.fr/HamiltonAppsAPI_PlanUK",
  apiKey2: "MD33CZZ7MHAZZZ2BICVWFCYELIZZ",
  adminId: "SVHAMILTON",
  tabletId: "123456",
  adminCode: "1607",
  logo: "planuk.png",
  defaultlang:"en",
  prefix:"",
  bookingStartHour:7,
  bookingEndHour:20,
  isPinInClearText:"true",
  isNfcEnabled: "true",
  colors: {
    primary: {
      r: 90,
      g: 187,
      b: 61
    },
    secondary: {
      r: 228,
      g: 127,
      b: 0
    },
    danger: {
      r: 177,
      g: 0,
      b: 67
    }
  },
  // because for some reason led colors do not look antyhing like colors on the screen...
  ledColors: {
    primary: {
      r: 0,
      g: 255,
      b: 0
    },
    secondary: {
      r: 228,
      g: 100,
      b: 0
    },
    danger: {
      r: 255,
      g: 0,
      b: 0
    }
  }
};
