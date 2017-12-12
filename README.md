## Useful to know

### How to run the app?

**1 Install the dependencies in the node_modules folder** 

Navigate to the project directory and execute the command 

`npm install` 

This installs all modules listed as dependencies in the package.json.


**2  Create a .env file in the root directory**

The app uses the **dotenv module** to store certain configuration separate from code, such as APIkeys.

Create a .env file in the root directory of the project. Add environment-specific variables on new lines in the form of NAME=VALUE. For example:

`API_KEY=apikey`
`API_USER=yourname`
`BROADCASTER=VPRO`

process.env now has the keys and values you defined in your .env file. The generated JSON webtoken will capture the name of the user and the broadcaster.

You can specify a custom path if your file containing environment variables is named or located differently. Adjust the following line in the index.js:

`require('dotenv').config({path: '/custom/path/to/your/env/vars'})`

**3  Deploy with shipit**

This app uses shipit as a deployment tool. To deploy to your staging/test environment, run:

`./node_modules/shipit-cli/bin/shipit test deploy`


 
 ### Keycloak
 
 You can enable authentication with keycloak by including the following lines of code:
 
 `app.use(keycloak.middleware({
       logout: '/logout',
       admin: '/'
       }))`
 
 When enabling this option, the `secret` attribute in `keycloak.json` requires a value. 