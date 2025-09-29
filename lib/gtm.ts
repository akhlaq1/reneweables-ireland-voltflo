interface GTMConfig {
  gtmId: string;
}

const GTM_CONFIG: GTMConfig = {
  gtmId: 'GTM-P7MH844'
};

export const getGTMScript = (): string => {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONFIG.gtmId}');`;
};

export const getGTMNoscriptUrl = (): string => {
  return `https://www.googletagmanager.com/ns.html?id=${GTM_CONFIG.gtmId}`;
};

export const gtmConfig = GTM_CONFIG;