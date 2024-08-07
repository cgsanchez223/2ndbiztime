const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM industries`);
        const companies = await db.query(`SELECT * FROM industries_companies`);
        return res.json({ industries: results.rows, companies: companies.rows })
    } catch(err) {
        return next (err)
    }
})

router.get('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const results = await db.query('SELECT company_code FROM industries_companies WHERE industry_code = $1', [code])
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find industry with code of ${code}`, 404)
        }
        return res.send({ industry: code, companies: results.rows})
    } catch (err) {
        return next(err)
    }
})


router.post("/", async function (req, res, next) {
    try {
        let {code, industry} = req.body;

        const result = await db.query(
            `INSERT INTO industries (code, industry)
            VALUES ($1, $2)
            RETURNING code, industry`,
            [code, industry]);

            return res.status(201).json({"industry": result.rows[0]});
    } catch (err) {
        return next(err);
    }
});


router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { new_code, industry } = req.body;
        const results = await db.query('UPDATE industries SET industry=$1, code=$3 WHERE code=$2 RETURNING code, industry', [industry, code, new_code])
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update industry with code of ${code}`, 404)
        }
        return res.send({ company: results.rows[0] })
    } catch (err) {
        return next(err)
    }
})


router.delete('/:code', async (req, res, next) => {
    try {
        const industries_companies = db.query('DELETE FROM industries_companies WHERE industry_code = $1', [req.params.code])
        const results = db.query('DELETE FROM industries WHERE code = $1', [req.params.code])
        return res.send({ msg: "DELETED!" })
    } catch (err) {
        return next(err)
    }
})


router.post('/:industry_code/:company_code', async (req, res, next) => {
    try {
        const { industry_code, company_code } = req.params;

        const result = await db.query(
            `INSERT INTO industries_companies (industry_code, company_code)
            VALUES ($1, $2)
            RETURNING industry_code, company_code`,
            [industry_code, company_code]);

        return res.status(201).json({ "industry_company": result.rows[0] });
    } catch (err) {
        return next(err)
    }
})


router.delete('/:industry_code/:company_code', async (req, res, next) => {
    try {
        const { industry_code, company_code } = req.params;

        const result = await db.query(
            `DELETE FROM industries_companies
            WHERE industry_code=$1, company_code=$2`,
            [industry_code, company_code]);

            return res.send({ msg: "DELETED!" })
    } catch (err) {
        return next(err)
    }
})

module.exports = router;