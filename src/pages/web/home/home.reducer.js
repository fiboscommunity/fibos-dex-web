const prefix = 'Home_'

const defaultConfigure = {
  initLocalesDone: false,
  currentLang: 'zh-CN',
  homeMenuValue: '',

  ironmanError: false,
  ironmanMissing: false,
  ironman: null,
  ironmanData: null,

  requestingAnnouncements: true,
  announcements: [],

  showDownloadGuide: false,

  toLogin: () => {},

  menuShow: false,

  /* mobile */

  mobileTabValue: 'markets',
  mobileNavHeight: 0,
}

export default (state = defaultConfigure, action) => {
  switch (action.type) {
    case `${prefix}resetIronman`: {
      return {
        ...state,

        ironmanError: false,
        ironmanMissing: false,
        ironmanData: null,
      }
    }
    case `${prefix}changeFieldValue`: {
      return {
        ...state,
        [action.field]: action.value,
      }
    }
    case `${prefix}requestForAnnouncement`: {
      return {
        ...state,

        announcements: [...action.data],
      }
    }
    case `${prefix}clickAnnouncement`:
    default: {
      return state
    }
  }
}
