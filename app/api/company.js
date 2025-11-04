import api from "./api";

const companyService = {
  getCompanyDatabySubDomain(payload) {
    return api.post(`${process.env.NEXT_PUBLIC_API_BASE_URL_CRM_PRODUCTION}/companies/get_company_data`, payload);
  },

   // Generic function to get any company data
   async getCompanyData(subDomain, requiredFields = ["colors"]) {
    const payload = {
      "sub_domain": subDomain,
      "required_fields": requiredFields
    };
    
    try {
      const response = await this.getCompanyDatabySubDomain(payload);
      return response.data;
    } catch (error) {
      console.error('Error fetching company data:', error);
      throw error;
    }
  },

  addLeadInCRM(payload){
    return api.post(`${process.env.NEXT_PUBLIC_API_BASE_URL_CRM_PRODUCTION}/leads/add_lead_with_address`, payload);
  }
  
};

export default companyService;
