# Blog Demo

My first full-stack webdev RESTFul project.

Main features:
- Users can publish Posts within various categories.
- Users can comment on Posts.
- Users have their own profiles and dashboard and they can edit their biography, avatar image, birth date, and username.
- Users can reset their password if forgotten (via a link with a random reset token generated from the backend and sent to the user email).
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

SIDE-NOTE:
I have created my own Auth System... I know is bad to create my own Authentication and Authorization system from a security standpoint, but this is not a production project and I do that just for fun (like the entire project anyway).

LIVE VERSION: https://am-blog-demo.herokuapp.com/

(It may take a while to load because the project is hosted on a free plan)

Testing Credentials:
  - Email: test@test.com
  - Password: password
