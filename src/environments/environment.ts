// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  servers_urls: {
    images: 'https://storage.googleapis.com/ta-na-mao-f41a6.appspot.com',
    //main: 'https://api.tanamao.delivery',
    //main: 'https://tests.tanamao.delivery',
    main: 'http://192.168.1.160:8080',
    ws: "wss://messenger.tanamao.delivery"
  },
  credentials: {
    fb: {
      appid: '861133974800874',
      version: '15'
    }
  },
  notfound_image: '09b9839d-4087-4bda-9b65-5c5ce2d59289.png',
  notfound_profile_pic: 'e7ed1647-57f5-44bb-a3dc-38f852062e6f.png',
  notfound_category: 'padrao.svg',
  VAPID_PUBLIC_KEY: "BHYVLQK9WaMtPp6-jYU1IpFF0S_h3su86Z5ZI6VnI95QuvKRf0SQc3xvKe--sw8e3A8JEejs7GRbbemD7inFojI"
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
