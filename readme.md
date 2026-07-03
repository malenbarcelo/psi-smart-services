# Project Name

## Install

npm init -y
npm install express ejs method-override multer sharp qrcode express-validator express-session bcryptjs node-fetch@2 exceljs pdfkit pdf-lib archiver sequelize-cli sequelize mysql2

## Setup Sequelize

1. Create file `.sequelizerc`
2. Run: `npx sequelize-cli init`
3. Modify `database/config/config.js`

## Production Setup

1. Create file `src/data/databaseConfig.js`

## Files to edit

public/css/generalStyles.css --> company colors
data/headerMenu.js
data/title.js
data/databaseConfig.js
data/appConfig.js --> baseUrl (change to production domain)
public/images/companyLogos.jpg
views/partials/head.ejs --> <link rel="icon" type="image/jpg" href="/images/favicon2.jpg"/> // edit favicon name yo avoid cache (put company name)
views/login/login.ejs --> <img src="/images/companyLogo.jpg" alt="" class="login-logo-img"> // edit alt


## Steps

crate appRoutes
create appControllers
create viewsFolders
create viewsFiles
