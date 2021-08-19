// Create and Export configuration variables

//Container for environments

let environments = {};

//Staging Object. Default environment
environments.staging = {
    'httpPort': 3000,
    'envName': 'staging',
    'httpsPort': 3001
};

//Production environment
environments.production = {
    'httpPort': 5000,
    'envName': 'production',
    'httpsPort': 5001

};

//select environment
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging // staging is default

//Export Module
module.exports = environmentToExport;