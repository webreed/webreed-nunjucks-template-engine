// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


const given = require("mocha-testdata");
const should = require("should");

const {Pagination} = require("../lib/Pagination");


function generatePagesArgument(pageCount) {
  let pages = [];
  for (let page = 1; page <= pageCount; ++page) {
    let key = (page === 1 ? "index" : page.toString());
    pages.push([ key, `http://example.com/about/${key}` ]);
  }
  return pages;
}


describe("Pagination", function () {

  beforeEach(function () {
    this.currentPageIterator = { number: 1 };
    this.pagination = new Pagination(9, 2, generatePagesArgument(5), this.currentPageIterator);
  });

  describe(".calculatePageCount(entryCount, entriesPerPage)", function () {

    it("is a function", function () {
      Pagination.calculatePageCount.should.be.a.Function();
    });

    given(
      [ 0     , 0     , 1 ],
      [ 1     , 0     , 1 ],
      [ 42    , 0     , 1 ],
      [ 1     , 10    , 1 ],
      [ 10    , 10    , 1 ],
      [ 11    , 10    , 2 ],
      [ 19    , 10    , 2 ],
      [ 20    , 10    , 2 ],
      [ "21"  , "10"  , 3 ]
    ).
    it("returns the expected page count", function (entryCount, entriesPerPage, expectedPageCount) {
      Pagination.calculatePageCount(entryCount, entriesPerPage)
        .should.be.eql(expectedPageCount);
    });

  });

  describe("#constructor(entryCount, entriesPerPage, pages, currentPageIterator)", function () {

    it("is a function", function () {
      Pagination.prototype.constructor.should.be.a.Function();
    });

    given(
      // Reminder; each line represents the array of arguments that are passed to
      // the following unit test function.
      [ [] ],
      [ generatePagesArgument(1) ],
      [ generatePagesArgument(4) ],
      [ generatePagesArgument(6) ]
    ).
    it("throws error when length of argument 'pages' is inconsistent with entries", function (pages) {
      (() => new Pagination(10, 2, pages, { number: 1 }))
        .should.throw("length of 'pages' array is not consistent with entries");
    });

  });

  describe("#entryCount", function () {

    it("is read-only", function () {
      (() => this.pagination.entryCount = 123)
        .should.throw();
    });

    it("has the expected value", function () {
      this.pagination.entryCount.should.be.eql(9);
    });

  });

  describe("#entriesPerPage", function () {

    it("is read-only", function () {
      (() => this.pagination.entriesPerPage = 123)
        .should.throw();
    });

    it("has the expected value", function () {
      this.pagination.entriesPerPage.should.be.eql(2);
    });

  });

  describe("#pageCount", function () {

    it("is read-only", function () {
      (() => this.pagination.pageCount = 123)
        .should.throw();
    });

    it("has the expected value", function () {
      this.pagination.pageCount.should.be.eql(5);
    });

  });

  describe("#numbers", function () {

    it("is read-only", function () {
      (() => this.pagination.numbers = 123)
        .should.throw();
    });

    it("has an immutable value", function () {
      (() => this.pagination.numbers[0] = 123)
        .should.throw();
    });

    it("has the expected value", function () {
      this.pagination.numbers.should.be.eql([ 1, 2, 3, 4, 5 ]);
    });

  });

  describe("#keys", function () {

    it("is read-only", function () {
      (() => this.pagination.keys = 123)
        .should.throw();
    });

    it("has an immutable value", function () {
      (() => this.pagination.keys[0] = 123)
        .should.throw();
    });

    it("has the expected value", function () {
      this.pagination.keys.should.be.eql([ "index", "2", "3", "4", "5" ]);
    });

  });

  describe("#currentPageNumber", function () {

    it("is read-only", function () {
      (() => this.pagination.currentPageNumber = 123)
        .should.throw();
    });

    it("has the expected initial value", function () {
      this.pagination.currentPageNumber.should.be.eql(1);
    });

    it("reflects the current page number after iteration has occurred", function () {
      this.currentPageIterator.number += 1;
      this.pagination.currentPageNumber.should.be.eql(2);
    });

  });

  describe("#currentPageKey", function () {

    it("is read-only", function () {
      (() => this.pagination.currentPageKey = 123)
        .should.throw();
    });

    it("has the expected initial value", function () {
      this.pagination.currentPageKey.should.be.eql("index");
    });

    it("reflects the current page key after iteration has occurred", function () {
      this.currentPageIterator.number += 1;
      this.pagination.currentPageKey.should.be.eql("2");
    });

  });

  describe("#currentPageUrl", function () {

    it("is read-only", function () {
      (() => this.pagination.currentPageUrl = 123)
        .should.throw();
    });

    it("has the expected initial value", function () {
      this.pagination.currentPageUrl.should.be.eql("http://example.com/about/index");
    });

    it("reflects the current page url after iteration has occurred", function () {
      this.currentPageIterator.number += 1;
      this.pagination.currentPageUrl.should.be.eql("http://example.com/about/2");
    });

  });

  describe("#hasPrevPage", function () {

    it("is read-only", function () {
      (() => this.pagination.hasPrevPage = 123)
        .should.throw();
    });

    it("is `true` when there is a previous page", function () {
      this.currentPageIterator.number += 1;
      this.pagination.hasPrevPage.should.be.true();
    });

    it("is `false` when there is not a previous page", function () {
      this.pagination.hasPrevPage.should.be.false();
    });

  });

  describe("#hasNextPage", function () {

    it("is read-only", function () {
      (() => this.pagination.hasNextPage = 123)
        .should.throw();
    });

    it("is `true` when there is a next page", function () {
      this.pagination.hasNextPage.should.be.true();
    });

    it("is `false` when there is not a next page", function () {
      this.currentPageIterator.number += 4;
      this.pagination.hasNextPage.should.be.false();
    });

  });

  describe("#firstEntryIndex", function () {

    it("is read-only", function () {
      (() => this.pagination.firstEntryIndex = 123)
        .should.throw();
    });

    given( [ 1, 0 ], [ 2, 2 ], [ 3, 4 ], [ 4, 6 ], [ 5, 8 ] ).
    it("is zero-based index of first entry of page", function (pageNumber, expectedFirstEntryIndex) {
      this.currentPageIterator.number = pageNumber;
      this.pagination.firstEntryIndex.should.be.eql(expectedFirstEntryIndex);
    });

  });

  describe("#endEntryIndex", function () {

    it("is read-only", function () {
      (() => this.pagination.endEntryIndex = 123)
        .should.throw();
    });

    given( [ 1, 2 ], [ 2, 4 ], [ 3, 6 ], [ 4, 8 ], [ 5, 9 ] ).
    it("is zero-based index of end entry of page", function (pageNumber, expectedEndEntryIndex) {
      this.currentPageIterator.number = pageNumber;
      this.pagination.endEntryIndex.should.be.eql(expectedEndEntryIndex);
    });

  });

  describe("#lastEntryIndex", function () {

    it("is read-only", function () {
      (() => this.pagination.lastEntryIndex = 123)
        .should.throw();
    });

    given( [ 1, 1 ], [ 2, 3 ], [ 3, 5 ], [ 4, 7 ], [ 5, 8 ] ).
    it("is zero-based index of last entry of page", function (pageNumber, expectedLastEntryIndex) {
      this.currentPageIterator.number = pageNumber;
      this.pagination.lastEntryIndex.should.be.eql(expectedLastEntryIndex);
    });

  });

  describe("#getPageKey(pageNumber)", function () {

    it("is a function", function () {
      this.pagination.getPageKey.should.be.a.Function();
    });

    given( -1, 0, 6 ).
    it("throws error when argument 'pageNumber' is out of range", function (pageNumber) {
      (() => this.pagination.getPageKey(pageNumber))
        .should.throw(`page number '${pageNumber}' out of range`);
    });

    given( [ 1, "index" ], [ 2, "2" ], [ 3, "3" ], [ 4, "4" ], [ 5, "5" ] ).
    it("returns the key corresponding with the specified page key", function (pageNumber, expectedPageKey) {
      this.pagination.getPageKey(pageNumber)
        .should.be.eql(expectedPageKey);
    });

  });

  describe("#getPageNumber(pageKey)", function () {

    it("is a function", function () {
      this.pagination.getPageNumber.should.be.a.Function();
    });

    given( "-1", "special", 6 ).
    it("throws error when argument 'pageKey' does not exist", function (pageKey) {
      (() => this.pagination.getPageNumber(pageKey))
        .should.throw(`page key '${pageKey}' was not found`);
    });

    given( [ "index", 1 ], [ "2", 2 ], [ "3", 3 ], [ "4", 4 ], [ "5", 5 ] ).
    it("returns the number corresponding with the specified page key", function (pageKey, expectedPageNumber) {
      this.pagination.getPageNumber(pageKey)
        .should.be.eql(expectedPageNumber);
    });

  });

  describe("#getUrlForPageKey(pageKey)", function () {

    it("is a function", function () {
      this.pagination.getUrlForPageKey.should.be.a.Function();
    });

    given( "-1", "special", 6 ).
    it("throws error when argument 'pageKey' does not exist", function (pageKey) {
      (() => this.pagination.getUrlForPageKey(pageKey))
        .should.throw(`page key '${pageKey}' was not found`);
    });

    given(
      [ "index", "http://example.com/about/index" ],
      [ "2", "http://example.com/about/2" ],
      [ "3", "http://example.com/about/3" ],
      [ 4, "http://example.com/about/4" ],
      [ 5, "http://example.com/about/5" ]
    ).
    it("returns the url corresponding with the specified page key", function (pageKey, expectedPageUrl) {
      this.pagination.getUrlForPageKey(pageKey)
        .should.be.eql(expectedPageUrl);
    });

  });

  describe("#getUrlForPageNumber(pageNumber)", function () {

    it("is a function", function () {
      this.pagination.getUrlForPageNumber.should.be.a.Function();
    });

    given( -1, 0, 6 ).
    it("throws error when argument 'pageNumber' is out of range", function (pageNumber) {
      (() => this.pagination.getUrlForPageNumber(pageNumber))
        .should.throw(`page number '${pageNumber}' out of range`);
    });

    given(
      [ 1, "http://example.com/about/index" ],
      [ 2, "http://example.com/about/2" ],
      [ 3, "http://example.com/about/3" ],
      [ "4", "http://example.com/about/4" ],
      [ "5", "http://example.com/about/5" ]
    ).
    it("returns the url corresponding with the specified page key", function (pageNumber, expectedPageUrl) {
      this.pagination.getUrlForPageNumber(pageNumber)
        .should.be.eql(expectedPageUrl);
    });

  });

});
