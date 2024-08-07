const express = require("express");
const ExpressError = require("../expressError")
let router = new express.Router();
const db = require("../db");


// GET /invoices : Return info on invoices: like {invoices: [{id, comp_code}, ...]}

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM invoices`);
        return res.json({ companies: result.rows });
    } catch (err) {
        return next(err);
    }
});


// GET /invoices/[id] : Returns obj on given invoice.
// If invoice cannot be found, returns 404. Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}

router.get("/:id", async (req, res, next) => {
    try {
        let id = req.params.id;

        const result = await db.query(
            `SELECT i.id,
                    i.comp_code,
                    i.amt,
                    i.paid,
                    i.add_date,
                    c.name,
                    c.description
            FROM invoices AS o
                INNER JOIN companoes AS c ON (i.comp_code = c.code)
            WHERE id = $1`,
            [id]);

        if (result.rows.length === 0) {
            throw new ExpressError(`No invoice found with: ${id}`, 404);
        }

        const data = result.rows[0];
        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
        };

        return res.json({ "invoice": invoice });
    } catch (err) {
        return next(err);
    }
});


// POST /invoices : Adds an invoice. Needs to be passed in JSON body of: {comp_code, amt}
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.post("/", async (req, res, next) => {
    try {
        let {comp_code, amt} = req.body;
        let currentDate = new Date();
        let formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt, formattedDate]);

        return res.status(201).json({"invoice": result.rows[0]});
    } catch (err) {
        return next(err);
    }
});


// PUT /invoices/[id] : Updates an invoice. If invoice cannot be found, returns a 404.
// Needs to be passed in a JSON body of {amt} Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.put("/:id", async function (req, res, next) {
    try {
        let {amt, paid} = req.body;
        let id = req.params.id;
        let paidDate = null;

        const currResult = await db.query(
            `SELECT paid
            FROM invoices
            WHERE id = $1`,
            [id]);

        if (currResult.rows.length === 0) {
            throw new ExpressError(`Invoice cannot be found: ${id}`, 404);
        }

        const currPaidDate = currResult.rows[0].paid_date;

        if(!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null
        } else {
            paidDate = currPaidDate;
        }

        const result = await db.query(
            `UPDATE invoices
            SET amt=$1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]);

        return res.json({"invoice": result.rows[0]});
    } catch (err) {
        return next(err);
    }
});


// DELETE /invoices/[id] : Deletes an invoice.If invoice cannot be found, returns a 404. Returns: {status: "deleted"} Also, one route from the previous part should be updated:

router.delete("/:id", async (req, res, next) => {
    try {
        const result = db.query('DELETE FROM invoices WHERE id = $1',[req.params.id]);

        if (result.rows.length === 0) {
            throw new ExpressError(`No invoice found: ${id}`, 404);
        }

        return res.json({"status": "deleted"});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;