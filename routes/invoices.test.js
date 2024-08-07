process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testInvoice;
beforeEach(async () => {
    await db.query(`INSERT INTO companies (code, description, name) VALUES ('apple', 'apple', 'Apple') `);
    const result = await db.query(`INSERT INTO invoice (comp_code, amt) VALUES ('apple', 100) RETURNING id, comp_code, amt`);
    testInvoice = result.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /invoices", () => {
    testInvoice("Get a list with one invoice", async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            companies: [
                {
                    id: expect.any(Number),
                    comp_code: 'apple',
                    amt: 100,
                    paid: false,
                    add_date: expect.any(String),
                    paid_date: null
                }
            ]
        });
    })
})

describe("GET /invoices/:id", () => {
    test("Gets a single invoice", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice:
            {
                id: expect.any(Number),
                comp_code: 'apple',
                amt: 100,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        })
    })

    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).get(`/invoices/0`)
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /invoices", () => {
    test("Creates a single invoice", async () => {
        const res = await request(app).post('/invoices').send({ comp_code: 'apple', amt: 999});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: {comp_code: 'apple', amt: 999, paid_date: expect.any(String), add_date: expect.any(String) }
        })
    })
})


describe("PUT /invoices/:id", () => {
    test("Updates a single invoice", async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ comp_code: 'apple', amt: 123, paid: true });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: { id: testInvoice.id, amt: 123, add_date: expect.any(String), comp_code: "apple", paid_date: expect.any(String)}
        })
    })
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).patch(`/invoices/0`).send({ comp_code: 'Test', amt: 1});
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /invoices/:id", () => {
    test("Deletes a single invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: 'DELETED!' })
    })
})