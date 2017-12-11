# Useful to know

### How to run the app?

**1 Install the dependencies in the node_modules folder** 

After opening the project in your IDE, run de command `npm install` to install all modules listed as dependencies in the package.json.

**2 Provide your APIkey when starting up the project**

You need to have permission to post items to the NPO publisher API. Therefore provide your apikey when running the app, as per the example below:
 
 `API_KEY=insertyourcredentialshere node index.js -g`

**3  Deploy with shipit**

This app uses shipit as a deployment tool. To deploy to your staging/test environment, run:

`./node_modules/shipit-cli/bin/shipit test deploy`
