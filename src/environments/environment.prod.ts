export const environment = {
  production: true,
  servers_urls: {
    images: 'https://storage.googleapis.com/ta-na-mao-f41a6.appspot.com',
    main: 'https://api.tanamao.delivery',
    //main: 'https://tests.tanamao.delivery',
    //ws: "wss://messenger-dot-ta-na-mao-f41a6.rj.r.appspot.com",
    ws: "wss://messenger.tanamao.delivery"
  },
  credentials: {
    fb: {
      appid: '621230329597001',
      version: '15'
    }
  },
  notfound_image: '09b9839d-4087-4bda-9b65-5c5ce2d59289.png',
  notfound_profile_pic: 'e7ed1647-57f5-44bb-a3dc-38f852062e6f.png',
  notfound_category: 'padrao.svg',
  VAPID_PUBLIC_KEY: "BHYVLQK9WaMtPp6-jYU1IpFF0S_h3su86Z5ZI6VnI95QuvKRf0SQc3xvKe--sw8e3A8JEejs7GRbbemD7inFojI"
}
