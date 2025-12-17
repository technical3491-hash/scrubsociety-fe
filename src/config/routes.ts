// Application routes configuration

export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  caseFeed: '/case-feed',
  drugSearch: '/drug-search',
  cme: '/cme',
  chat: '/chat',
  profile: '/profile',
  explore: {
    cases: '/explore/cases',
    drugs: '/explore/drugs',
  },
  playGame: '/play-game',
  drawGame: '/draw-game',
} as const;

