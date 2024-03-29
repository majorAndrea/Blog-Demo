# Blog Demo

My first full-stack webdev RESTFul project.

Main features:
- Users can publish Posts within various categories.
- Users can comment on Posts.
- Users have their own profiles and dashboard and they can edit their biography, avatar image, birth date, and username.
- Users can reset their password if forgotten (via a link with a random reset token generated from the backend and only valid for 30 minutes, and then sent to the user email).
- Posts can optionally have a "Location" field and if the user writes some real-world place (like "New York") then on the Post show page will appear a mini-map displaying the geolocated position.
- Other small features...

Tech used:
- Node.js
- Express.js
- MongoDB & Mongoose
- Express Session & MongoStore v3
- Bootstrap
- EJS and some npm packages related to EJS
- Cloudinary API & Multer
- Nodemailer & SendGrid API
- MapBox API
- CSFR Tokens
- JOI Validation
- Sanitize HTML (configured to work with JOI)
- Helmet
- Bcrypt.js
- Others...

LIVE VERSION: https://blog-demo-1t68.onrender.com

(It may take a while to load because the project is hosted on a free plan)

Testing Credentials:
  - Email: blog-demo@gmail.com
  - Password: password
