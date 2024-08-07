\c biztime_test

DROP TABLE IF EXISTS industries_companies;
DROP TABLE IF EXISTS industries;

CREATE TABLE industries (
    code TEXT PRIMARY KEY,
    industry TEXT NOT NULL UNIQUE
);

CREATE TABLE industries_companies (
    industry_code TEXT,
    company_code TEXT,
    FOREIGN KEY (industry_code) REFERENCES industries(code),
    FOREIGN KEY (company_code) REFERENCES companies(code),
    PRIMARY KEY (industry_code, company_code)
);

INSERT INTO industries (code, industry) VALUES
('TECH', 'Technology');

INSERT INTO industries_companies (industry_code, company_code) VALUES
('TECH', 'apple'),
('TECH', 'ibm');