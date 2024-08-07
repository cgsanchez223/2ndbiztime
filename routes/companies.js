const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
let router = new express.Router();
const db = require("../db");



// GET /companies : Returns list of companies, like {companies: [{code, name}, ...]}
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    } catch (err) {
        return next(err);
    }
});


// GET /companies/[code] : Return obj of company: {company: {code, name, description}}
// If the company given cannot be found, this should return a 404 status response.
// Added invoices
router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;

        const compResult = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);
        const invResult = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code]);
        if (compResult.rows.length === 0) {
            throw new ExpressError(`Company does not exist: ${code}`, 404)
        }
        const company = compResult.rows[0];
        const invoices = invResult.rows;

        company.invoices = invoices.map(inv => inv.id);

        return res.json({ "company": company });
    } catch (err) {
        return next(err);
    }
})


// POST /companies : Adds a company. Needs to be given JSON like: {code, name, description} Returns obj of new company:  {company: {code, name, description}}
router.post("/", async (req, res, next) => {
    try {
        let {name, description} = req.body;
        let code = slugify(name, {lower: true});

        const result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
        [code, name, description]);

        return res.status(201).json({"company": result.rows[0]});
    }

    catch (err) {
        return next(err);
    }
});


// PUT /companies/[code] : Edit existing company. Should return 404 if company cannot be found.
// Needs to be given JSON like: {name, description} Returns update company object: {company: {code, name, description}}

router.patch("/:code", async (req, res, next) => {
    try {
        let {name, description} = req.body;
        let { code } = req.params;

        const result = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code = $3 RETURNING code, name, description', [name, description, code]);
        
        if (result.rows.length === 0) {
            throw new ExpressError(`Failed to update company ${code}`, 404)
        } else {
            return res.json({"company": result.rows[0]});
        }
    }

    catch (err) {
        return next(err);
    }
})


// DELETE /companies/[code] : Deletes company. Should return 404 if company cannot be found. Returns {status: "deleted"}

router.delete("/:code", async (req, res, next) => {
    try {
        let code = req.params.code;

        const result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [code]);

        if (result.rows.length === 0) {
            throw new ExpressError(`No company to delete: ${code}`, 404)
        }
    } catch (err) {
      return next(err);
    }
})

module.exports = router;