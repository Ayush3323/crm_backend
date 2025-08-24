require('dotenv').config({ path: require('path').resolve(__dirname, '..', 'config.env') });

const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || "mysql"
};

module.exports = {
  development: {
    ...common,
    port: process.env.DB_PORT || 55862   // Local dev: use external Railway port
  },
  test: {
    ...common,
    port: process.env.DB_PORT || 55862
  },
  production: {
    ...common,
    port: process.env.DB_PORT || 55862   // Inside Railway network: always 3306
  }
};
