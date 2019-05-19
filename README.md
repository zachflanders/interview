# interview
Interview Questions

This is a full stack app with postgress, node, and sequelize on the server.  The app uses react, openlayers, and d3 on the client. The app provides a solution to problem 3 (visualizing .json files on a map) and problem 5 (providing an API for saving and getting reviews).

DEMO: <http://mysidewalk.herokuapp.com>

setup:

```
git clone https://github.com/zachflanders/interview.git
cd interview && yarn install && cd client && yarn install && cd ../server && yarn install && cd ..
```

The app connects to a default postgres database. The REACT_APP_API_URL tells your app where to find your server side API.  These values can be changed at .env to suit your system:

```
HOSTURL=localhost
DATABASE=postgres
USERNAME=postgres
PASSWORD=
REACT_APP_API_URL=http://localhost:8000
```

The following scripts are available to run the app:

```
yarn client
yarn server
yarn full-stack
yarn test
```
