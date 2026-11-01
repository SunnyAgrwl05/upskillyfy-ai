import dotenv from 'dotenv'

/**
 * Loads `.env` into `process.env`.
 *
 * ES modules are evaluated in import order, so importing this file FIRST in
 * `index.js` guarantees the variables exist before `config/env.js` validates
 * them.
 */
dotenv.config()
