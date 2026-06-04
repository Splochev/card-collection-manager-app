# CardCollectionManagerApp

# To create a new service:
npx nx generate @nx/nest:application --directory=apps/<name> --no-interactive
npx nx g @nx/js:application <name> --directory=apps/<name> --no-interactive

# To install app:
npm install

# To start app:
npm run scraper
npm run client
npm run server

# Kafka Dashboard:
http://localhost:8081/

# LogTo Dashboard:
http://localhost:3002/
username: admin
password: **********

# Test user:
username: sunchais
password: **********

# Get tree
tree -I "node_modules|.nx|dist" > structure.txt