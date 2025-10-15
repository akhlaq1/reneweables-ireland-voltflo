import api from "./api";

const proposal = {
  getBusinessProposalByLocation({ lat, lng, billAmount }) {
    return api.get(`public_users/get_business_proposal_by_location_installers`, {
      params: {
      lat,
      lng,
      billAmount,
      panel_wattage: process.env.NEXT_PUBLIC_PANEL_WATTAGE,
      },
    });
  },
};

export default proposal;
