const moment = require('moment');
const postgres = require('postgres');
const { handleCallback } = require('./helpers');
const Knex = require('knex');
const winston = require('winston'),
    _ = require('lodash');


   
class PostgresDispatcher extends winston.Transport {
    constructor(options) {
        super();
        this.options = options;
        if (!this.options.postgresUrl) {
            throw new Error('You have to define url connection string');
        }
        this.table = [
            {
                dataType: 'character varying',
                name: 'level',
            },
            {
                dataType: 'character varying',
                name: 'message',
            },
            {
                dataType: 'json',
                name: 'meta',
            },
            {
                dataType: 'timestamp without time zone',
                default: 'DEFAULT NOW()',
                name: 'timestamp',
            },
        ];
        this.dbSocketPath = '/cloudsql';
        this.tableName = 'winston_logs',
        this.tableFields = this.table.map((tableField) => tableField.name);
        this.name = 'postgres';
        this.config = {pool: {}};
        /*
        this.createUnixSocketPool = config => {
            const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
          
            // Establish a connection to the database
            return Knex({
              client: 'pg',
              connection: {
                user: process.env.DB_USER, // e.g. 'my-user'
                password: process.env.DB_PASS, // e.g. 'my-user-password'
                database: process.env.DB_NAME, // e.g. 'my-database'
                host: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
              },
              // ... Specify additional properties here.
              ...config,
            });
          };*/
        this.client = postgres(this.options.postgresUrl, this.options.postgresOptions);
        this.client`CREATE TABLE IF NOT EXISTS ${this.client(this.tableName)} (
            ${this.client(this.tableFields[0])} character varying,
            ${this.client(this.tableFields[1])} character varying,
            ${this.client(this.tableFields[2])} json,
            ${this.client(this.tableFields[3])} timestamp without time zone DEFAULT NOW()
        );`;
    }
    log(level, msg, meta, callback) {
        const log = {
            level : level,
            message : msg,
            meta: JSON.stringify({ ...meta}),
            timestamp: 'NOW()',
          };
    
          const logQuery = async () => {
            await this.client`INSERT INTO ${this.client(this.tableName)} ${this.client(log, ...this.tableFields)}`;
            callback();
          };
    
          logQuery((error) => {
            if (error) {
                console.log(error);
                callback(false);
            }
            console.log("Passs");
             callback(true);
          });
    }
    health(callback) {
        callback(true);
    }
}

winston.transports.PostgresDB = PostgresDispatcher;

module.exports = { PostgresDispatcher };
