/** Common config for bookstore. */


let DB_URI = `postgresql://`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/express_bookstore-test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/express_bookstore`;
}


module.exports = { DB_URI };