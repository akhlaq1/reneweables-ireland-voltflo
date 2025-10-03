import api from "./api";

const companyService = {
  getCompanyDatabySubDomain(payload) {
    return api.post(`http://localhost:5000/companies/get_company_data`, payload);
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
  }
  
};

export default companyService;
