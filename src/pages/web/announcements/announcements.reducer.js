const prefix = 'Announcements_'

const defaultConfigure = {
  announcementsSpinning: true,
  announcementsRequesting: true,

  announcementsData: [],

  announcement: {},
}

export default (state = defaultConfigure, action) => {
  switch (action.type) {
    case `${prefix}changeFieldValue`: {
      return {
        ...state,
        [action.field]: action.value,
      }
    }
    case `${prefix}destroy`: {
      return {
        ...defaultConfigure,
      }
    }
    case `${prefix}requestForAnnouncements`: {
      return {
        ...state,

        announcementsData: action.data,
      }
    }
    default: {
      return state
    }
  }
}
