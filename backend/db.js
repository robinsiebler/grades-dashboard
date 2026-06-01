const oracledb = require("oracledb");

async function getConnection() {
    try {
        return await oracledb.getConnection({
            user: "system",
            password: "bYFqq!KxTa!754r5",
            connectString: "localhost:1521/xe"
        });
    } catch (error) {
        console.error("Error connecting to Oracle Database:", error);
        throw error; // Re-throw the error so server.js can handle it
    }
}

module.exports = getConnection;

