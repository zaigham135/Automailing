const { Sequelize } = require("sequelize");
require("dotenv").config();

// Prefer connection string envs, fallback to individual pieces
const connString = process.env.MSSQL_CONN || process.env.DB_CONN || process.env.DATABASE_URL;

const dialect = (process.env.DB_DIALECT || "mssql").toLowerCase();

let sequelize;
if (connString) {
  // If it's a semicolon-style connection string (SQL Server Management style)
  // parse it into an options object because Sequelize URL parser expects a URL
  if (connString.includes("=") && connString.includes(";")) {
    const parts = connString.split(";").filter(Boolean);
    const map = {};
    parts.forEach((p) => {
      const [k, ...rest] = p.split("=");
      if (!k) return;
      map[k.trim().toLowerCase()] = rest.join("=").trim();
    });

    const serverRaw = map["server"] || map["data source"] || map["address"] || map["addr"] || map["network address"];
    let host = serverRaw || map["servername"] || "localhost";
    let instanceName;
    let port;
    // server may contain SERVER\\INSTANCE,PORT or SERVER,PORT or SERVER\\INSTANCE
    if (host.includes("\\\\")) {
      // SAMAD\\SQLEXPRESS or SAMAD\\SQLEXPRESS,1433
      const [hInst, maybePort] = host.split(",");
      const [h, inst] = hInst.split("\\\\");
      host = h;
      instanceName = inst;
      if (maybePort) port = Number(maybePort);
    } else if (host && host.includes(",")) {
      // SAMAD,1433
      const [h, p] = host.split(",");
      host = h;
      port = Number(p);
    }

    const username = map["user id"] || map["uid"] || map["user"] || process.env.DB_USER;
    const password = map["password"] || map["pwd"] || process.env.DB_PASS;
    const database = map["database"] || map["initial catalog"] || process.env.DB_NAME || "";

    const encrypt = (map["encrypt"] || "true").toString().toLowerCase() === "true";
    const trustServerCertificate = (map["trustservercertificate"] || "true").toString().toLowerCase() === "true";

    sequelize = new Sequelize(database, username || "", password || "", {
      host: host || "localhost",
      port: port || (process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined),
      dialect: dialect,
      dialectOptions: {
        options: {
          instanceName: instanceName || process.env.DB_INSTANCE || undefined,
          encrypt: encrypt,
          trustServerCertificate: trustServerCertificate,
        },
      },
      logging: false,
    });
  } else {
    // Otherwise assume it's a URL that Sequelize can parse
    sequelize = new Sequelize(connString, {
      dialect: dialect,
      logging: false,
    });
  }
} else {
  // Build from individual env vars
  sequelize = new Sequelize(process.env.DB_NAME || "", process.env.DB_USER || "", process.env.DB_PASS || "", {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    dialect: dialect,
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: process.env.DB_TRUST_CERT === "true",
      },
    },
    logging: false,
  });
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message || error);
  }
}

module.exports = { sequelize, testConnection };
