const assert = require("node:assert/strict");
require("../core.js");
const sameStone = require("../same-stone-core.js");

const parsed = sameStone.parseListingDetails(`
  IGI certified oval brilliant lab grown diamond.
  Report number LG647412345. Weight 2.04 carats.
  Measurements 10.21 x 7.02 x 4.31 mm. Sale price $1,899.00.
`);
assert.equal(parsed.lab, "IGI");
assert.equal(parsed.reportNumber, "LG647412345");
assert.equal(parsed.shape, "oval");
assert.equal(parsed.carat, 2.04);
assert.deepEqual([parsed.length, parsed.width, parsed.depth], [10.21, 7.02, 4.31]);
assert.equal(parsed.price, 1899);

assert.equal(sameStone.normalizeReportNumber("LG 6474-12345"), "LG647412345");
assert.equal(sameStone.normalizeLab("Gemological Institute of America (GIA)"), "GIA");
assert.equal(sameStone.parseReportNumber("Certificate no. LG 6474-12345."), "LG 6474-12345");

const candidates = [
  { id: "a", seller: "Seller A", lab: "IGI", reportNumber: "LG647412345", shape: "oval", carat: 2.04, length: 10.21, width: 7.02, depth: 4.31, price: 1899 },
  { id: "b", seller: "Seller B", lab: "IGI", reportNumber: "LG 6474-12345", shape: "oval", carat: 2.04, length: 10.21, width: 7.02, depth: 4.31, price: 2499 },
  { id: "c", seller: "Seller C", lab: "", reportNumber: "", shape: "emerald", carat: 1.75, length: 8.44, width: 5.82, depth: 3.61, price: 1599 },
  { id: "d", seller: "Seller D", lab: "", reportNumber: "", shape: "emerald", carat: 1.75, length: 8.44, width: 5.82, depth: 3.61, price: 1799 },
  { id: "e", seller: "Seller E", lab: "GIA", reportNumber: "1234567890", shape: "round", carat: 1.5, length: 7.4, width: 7.38, depth: 4.5, price: 2099 },
];

const groups = sameStone.duplicateGroups(candidates);
assert.equal(groups.filter((group) => group.kind === "exact_certificate").length, 1);
assert.equal(groups.filter((group) => group.kind === "possible_measurement").length, 1);
assert.equal(sameStone.matchFor("a", groups).kind, "exact_certificate");
assert.equal(sameStone.matchFor("c", groups).kind, "possible_measurement");
assert.equal(sameStone.matchFor("e", groups), null);
assert.equal(sameStone.matchFor("a", groups).spread.difference, 600);

const summary = sameStone.vaultSummary(candidates, groups);
assert.equal(summary.candidates, 5);
assert.equal(summary.sellers, 5);
assert.equal(summary.exactGroups, 1);
assert.equal(summary.possibleGroups, 1);
assert.equal(summary.largestSpread, 600);

const csv = sameStone.toCsv(candidates.slice(0, 1));
assert.match(csv, /"LG647412345"/);
assert.match(csv, /"Seller A"/);

console.log("Same Stone tests passed");
