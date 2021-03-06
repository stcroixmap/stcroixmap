console.log('decode srcd');

var admin = require("firebase-admin");
var pg = require ('pg');
var pool = require('../modules/mainPool');

if (process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      "type": process.env.FIREBASE_SERVICE_ACCOUNT_TYPE,
      "project_id": process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      "private_key_id": process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
      "private_key": process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
      "client_email": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
      "auth_uri": process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
      "token_uri": process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
      "auth_provider_x509_cert_url": process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
      "client_x509_cert_url": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL
    }),
    databaseURL: "https://interactive-map-e76e0.firebaseio.com"
  });
} else {
  admin.initializeApp({
    credential: admin.credential.cert("./server/firebase-service-account.json"),
    databaseURL: "https://interactive-map-e76e0.firebaseio.com"
  });
}


/* This is where the magic happens. We pull the id_token off of the request,
verify it against our firebase service account private_key.
Then we add the decodedToken */
var tokenDecoder = function(req, res, next){
  if (req.headers.id_token) {
    admin.auth().verifyIdToken(req.headers.id_token).then(function(decodedToken) {
      // Adding the decodedToken to the request so that downstream processes can use it
      req.decodedToken = decodedToken;
      console.log("TOKEN:",decodedToken);
      console.log("user email:", req.decodedToken.email);
      // SQL query to check if the user with that email is in the database
      // if they are, then next()
      pool.connect( function( err, connection, done ){
        //check if there was an Error
        if( err ){
          console.log( err );
          // respond with PROBLEM!
          res.send( 400 );
        }// end Error
        else{
          done();
          // res.sendStatus(200);
          console.log('connected to db');
          // send query for admins who are true(resultSet)
          var resultSet = connection.query ("SELECT * FROM admins WHERE admin=true and email = $1", [req.decodedToken.email] , function (err, result){
            if (result.rows.length < 1){
              console.log(err);
              res.sendStatus(403);
              }

            else{
              next();
              console.log(result);
              }
          });
        } //end on end
      }); //end pool.connect
    })
    .catch(function(error) {
      // If the id_token isn't right, you end up in this callback function
      // Here we are returning a forbidden error
      console.log('User token could not be verified');
      res.sendStatus(403);
    });
    }else {
    // Seems to be hit when chrome makes request for map files
    // Will also be hit when user does not send back an idToken in the header
    res.sendStatus(403);
    }
};//end token decoder function
module.exports = { token: tokenDecoder };
